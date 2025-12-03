// whatsapp-server.js - Versão otimizada e estável
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let client = null;
let qrCodeData = null;
let isConnected = false;
let connectionStatus = 'disconnected';
let initializationInProgress = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 999; // Infinito praticamente

const SESSION_PATH = path.join(__dirname, '.wwebjs_auth');

function createWhatsAppClient() {
    return new Client({
        authStrategy: new LocalAuth({
            clientId: 'clickagenda'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        }
    });
}

async function connectToWhatsApp() {
    try {
        // Se já estiver inicializando, não faz nada
        if (initializationInProgress) {
            console.log('? Inicializa��o j� em progresso...');
            return;
        }

        initializationInProgress = true;
        reconnectAttempts++;

        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            console.log('? M�ximo de tentativas de reconex�o atingido. Aguarde 5 minutos.');
            initializationInProgress = false;
            reconnectAttempts = 0;
            return;
        }

        // Se já existe um cliente, encerra ele antes de criar outro
        if (client) {
            try {
                await client.destroy();
                client = null;
                // Espera 2 segundos para garantir que o cliente foi destruído
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.log('?? Erro ao destruir cliente anterior:', e.message);
                client = null;
            }
        }

        console.log('?? Criando nova conex�o WhatsApp...');
        client = createWhatsAppClient();

        client.on('qr', async (qr) => {
            try {
                console.log('?? QR Code gerado! Escaneie no seu celular.');
                qrCodeData = await qrcode.toDataURL(qr);
                connectionStatus = 'qr_ready';
            } catch (error) {
                console.error('Erro ao gerar QR Code:', error.message);
            }
        });

        client.on('ready', () => {
            isConnected = true;
            connectionStatus = 'connected';
            qrCodeData = null;
            initializationInProgress = false;
            reconnectAttempts = 0; // Zera o contador de tentativas ao conectar
            console.log('? WhatsApp conectado com sucesso!');
        });

        client.on('authenticated', () => {
            console.log('? Autenticado com sucesso!');
        });

        client.on('auth_failure', (msg) => {
            console.error('? Erro de autentica��o:', msg);
            isConnected = false;
            connectionStatus = 'disconnected';
            qrCodeData = null;
            initializationInProgress = false;
        });

        client.on('disconnected', (reason) => {
            isConnected = false;
            connectionStatus = 'disconnected';
            qrCodeData = null;
            initializationInProgress = false;
            console.log('? Desconectado:', reason);

            // Espera 10 segundos e tenta conectar de novo
            setTimeout(() => {
                if (!isConnected) {
                    console.log('?? Tentando reconectar...');
                    connectToWhatsApp();
                }
            }, 10000);
        });

        client.on('error', (error) => {
            console.error('? Erro WhatsApp:', error.message);
            // Só mostra o erro, não desconecta
        });

        // Inicia o cliente
        await client.initialize();

    } catch (error) {
        console.error('? Erro ao conectar WhatsApp:', error.message);
        connectionStatus = 'disconnected';
        isConnected = false;
        qrCodeData = null;
        initializationInProgress = false;

        // Espera 5 segundos e tenta conectar novamente
        setTimeout(() => {
            connectToWhatsApp();
        }, 5000);
    }
}

// Endpoint para consultar status da conexão
app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        status: connectionStatus,
        qrCode: qrCodeData
    });
});

// Endpoint para iniciar a conexão
app.post('/connect', async (req, res) => {
    try {
        if (isConnected) {
            return res.json({ success: true, message: 'J� est� conectado!' });
        }

        if (initializationInProgress) {
            return res.json({ 
                success: true, 
                message: 'Conex�o em progresso... Aguarde o QR Code.' 
            });
        }
        
        reconnectAttempts = 0; // Zera o contador ao conectar manualmente
        connectionStatus = 'connecting';
        connectToWhatsApp();
        
        res.json({ 
            success: true, 
            message: 'Conectando... Escaneie o QR Code no seu celular.' 
        });
    } catch (error) {
        console.error('Erro ao conectar:', error);
        res.json({ 
            success: false, 
            message: 'Erro ao conectar: ' + error.message 
        });
    }
});

// Endpoint para desconectar do WhatsApp
app.post('/disconnect', async (req, res) => {
    try {
        if (client) {
            await client.destroy();
            client = null;
            isConnected = false;
            connectionStatus = 'disconnected';
            qrCodeData = null;
            initializationInProgress = false;
            reconnectAttempts = 0;
        }
        
        res.json({ success: true, message: 'Desconectado com sucesso!' });
    } catch (error) {
        console.error('Erro ao desconectar:', error);
        res.json({ success: false, message: 'Erro ao desconectar' });
    }
});

// Endpoint para enviar mensagem pelo WhatsApp
app.post('/send', async (req, res) => {
    try {
        if (!isConnected || !client) {
            return res.json({ 
                success: false, 
                message: 'WhatsApp n�o est� conectado!' 
            });
        }
        
        const { telefone, mensagem } = req.body;
        
        if (!telefone || !mensagem) {
            return res.json({ 
                success: false, 
                message: 'Telefone e mensagem s�o obrigat�rios' 
            });
        }
        
        // Deixa o número no formato internacional do WhatsApp
        let numeroLimpo = telefone.replace(/\D/g, '');
        if (!numeroLimpo.startsWith('55')) {
            numeroLimpo = '55' + numeroLimpo;
        }
        const chatId = numeroLimpo + '@c.us';
        
        await client.sendMessage(chatId, mensagem);
        
        console.log(`? Mensagem enviada para ${telefone}`);
        res.json({ 
            success: true, 
            message: 'Mensagem enviada com sucesso!' 
        });
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.json({ 
            success: false, 
            message: 'Erro ao enviar: ' + error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`?? Servidor WhatsApp rodando na porta ${PORT}`);
    console.log(`?? Acesse: http://localhost:${PORT}/status`);
    console.log('?? Clique em "Conectar WhatsApp" para gerar o QR Code');
    console.log('? Inicializando WhatsApp...\n');
    
    // Já conecta assim que o servidor inicia (opcional)
    connectToWhatsApp();
});