// whatsapp-server.js - Versão Otimizada e Estável
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
        // Evita inicializações simultâneas
        if (initializationInProgress) {
            console.log('? Inicialização já em progresso...');
            return;
        }

        initializationInProgress = true;
        reconnectAttempts++;

        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            console.log('? Máximo de tentativas de reconexão atingido. Aguarde 5 minutos.');
            initializationInProgress = false;
            reconnectAttempts = 0;
            return;
        }

        // Destroi cliente anterior se existir
        if (client) {
            try {
                await client.destroy();
                client = null;
                // Aguarda 2 segundos antes de criar novo cliente
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.log('?? Erro ao destruir cliente anterior:', e.message);
                client = null;
            }
        }

        console.log('?? Criando nova conexão WhatsApp...');
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
            reconnectAttempts = 0; // Reseta contador ao conectar
            console.log('? WhatsApp conectado com sucesso!');
        });

        client.on('authenticated', () => {
            console.log('? Autenticado com sucesso!');
        });

        client.on('auth_failure', (msg) => {
            console.error('? Erro de autenticação:', msg);
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

            // Tenta reconectar após 10 segundos
            setTimeout(() => {
                if (!isConnected) {
                    console.log('?? Tentando reconectar...');
                    connectToWhatsApp();
                }
            }, 10000);
        });

        client.on('error', (error) => {
            console.error('? Erro WhatsApp:', error.message);
            // Não desconecta automaticamente em caso de erro
        });

        // Inicia o cliente
        await client.initialize();

    } catch (error) {
        console.error('? Erro ao conectar WhatsApp:', error.message);
        connectionStatus = 'disconnected';
        isConnected = false;
        qrCodeData = null;
        initializationInProgress = false;

        // Tenta reconectar após 5 segundos
        setTimeout(() => {
            connectToWhatsApp();
        }, 5000);
    }
}

// Rota: Status da conexão
app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        status: connectionStatus,
        qrCode: qrCodeData
    });
});

// Rota: Iniciar conexão
app.post('/connect', async (req, res) => {
    try {
        if (isConnected) {
            return res.json({ success: true, message: 'Já está conectado!' });
        }

        if (initializationInProgress) {
            return res.json({ 
                success: true, 
                message: 'Conexão em progresso... Aguarde o QR Code.' 
            });
        }
        
        reconnectAttempts = 0; // Reseta contador ao conectar manualmente
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

// Rota: Desconectar
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

// Rota: Enviar mensagem
app.post('/send', async (req, res) => {
    try {
        if (!isConnected || !client) {
            return res.json({ 
                success: false, 
                message: 'WhatsApp não está conectado!' 
            });
        }
        
        const { telefone, mensagem } = req.body;
        
        if (!telefone || !mensagem) {
            return res.json({ 
                success: false, 
                message: 'Telefone e mensagem são obrigatórios' 
            });
        }
        
        // Formata número
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
    
    // Conecta automaticamente ao iniciar (opcional)
    connectToWhatsApp();
});