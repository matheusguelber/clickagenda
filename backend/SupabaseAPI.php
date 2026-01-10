<?php
/**
 * Classe para interagir com Supabase via API REST
 * Agora com suporte a arquivo .env para segurança
 */
class SupabaseAPI {
    
    private $url;
    private $apiKey;
    
    public function __construct() {
        // Carrega as variáveis do arquivo .env que está na raiz
        $this->carregarEnv();

        // Pega os valores carregados ou usa vazio se não achar
        $this->url = $_ENV['SUPABASE_URL'] ?? '';
        $this->apiKey = $_ENV['SUPABASE_KEY'] ?? '';

        if (empty($this->url) || empty($this->apiKey)) {
            die("ERRO: As chaves do Supabase não foram encontradas no arquivo .env");
        }
    }

    /**
     * Função simples para ler o arquivo .env sem precisar de bibliotecas extras
     */
    private function carregarEnv() {
        // O arquivo .env deve estar na raiz (uma pasta acima de /backend)
        $caminho = __DIR__ . '/../.env';

        if (file_exists($caminho)) {
            $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($linhas as $linha) {
                // Ignora comentários
                if (strpos(trim($linha), '#') === 0) continue;
                
                // Separa CHAVE=VALOR
                if (strpos($linha, '=') !== false) {
                    list($chave, $valor) = explode('=', $linha, 2);
                    $chave = trim($chave);
                    $valor = trim($valor);
                    
                    // Salva na variável global $_ENV
                    $_ENV[$chave] = $valor;
                }
            }
        }
    }
    
    // --- O RESTO DOS MÉTODOS CONTINUA IGUAL ---
    
    public function select($table, $filters = [], $columns = '*') {
        $endpoint = "{$this->url}/rest/v1/{$table}?select={$columns}";
        foreach ($filters as $key => $value) {
            $endpoint .= "&{$key}=eq." . urlencode($value);
        }
        return $this->request('GET', $endpoint);
    }
    
    public function insert($table, $data) {
        $endpoint = "{$this->url}/rest/v1/{$table}";
        return $this->request('POST', $endpoint, $data);
    }
    
    public function update($table, $filters, $data) {
        $endpoint = "{$this->url}/rest/v1/{$table}?";
        foreach ($filters as $key => $value) {
            $endpoint .= "{$key}=eq." . urlencode($value) . "&";
        }
        $endpoint = rtrim($endpoint, '&');
        return $this->request('PATCH', $endpoint, $data);
    }
    
    public function delete($table, $filters) {
        $endpoint = "{$this->url}/rest/v1/{$table}?";
        foreach ($filters as $key => $value) {
            $endpoint .= "{$key}=eq." . urlencode($value) . "&";
        }
        $endpoint = rtrim($endpoint, '&');
        return $this->request('DELETE', $endpoint);
    }
    
    private function request($method, $url, $data = null) {
        $ch = curl_init();
        
        $headers = [
            'apikey: ' . $this->apiKey,
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception("Erro na API Supabase ($httpCode): " . $response);
        }
        
        return json_decode($response, true);
    }
    
    public function selectOne($table, $filters = [], $columns = '*') {
        $result = $this->select($table, $filters, $columns);
        return (is_array($result) && count($result) > 0) ? $result[0] : null;
    }
}
?>