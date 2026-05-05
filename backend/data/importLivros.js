const axios = require('axios');
const mysql = require('mysql2/promise');

// --- CONFIGURAÇÕES ---
const API_KEY = 'SUA_CHAVE_AQUI';
const SEARCH_QUERY = 'futebol brasileiro';
const DB_CONFIG = {
    host: 'IP_PUBLICO_DA_SUA_INSTANCIA_EC2', // Ex: 54.233.xx.xx
    user: 'seu_usuario', 
    password: 'sua_senha',
    database: 'nome_do_seu_banco',
    port: 3306, // Porta padrão
    connectTimeout: 10000 // Aumentar o timeout ajuda em conexões remotas
};

async function integrarDados() {
    let connection;

    try {
        // 1. Conectar ao MySQL
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Conectado ao MySQL.');

        // 2. Criar a tabela automaticamente
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS livros_google (
                id_google VARCHAR(50) PRIMARY KEY,
                titulo TEXT,
                autores TEXT,
                editora VARCHAR(255),
                data_publicacao VARCHAR(20),
                descricao TEXT,
                paginas INT
            )
        `);

        // 3. Buscar dados na Google Books API
        const url = `https://googleapis.com{encodeURIComponent(SEARCH_QUERY)}&key=${API_KEY}&maxResults=20`;
        const response = await axios.get(url);
        const livros = response.data.items;

        if (!livros) {
            console.log('Nenhum livro encontrado.');
            return;
        }

        // 4. Inserir os dados no Banco
        const sql = `
            INSERT IGNORE INTO livros_google 
            (id_google, titulo, autores, editora, data_publicacao, descricao, paginas) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of livros) {
            const info = item.volumeInfo;
            const values = [
                item.id,
                info.title || 'Sem título',
                info.authors ? info.authors.join(', ') : 'Desconhecido',
                info.publisher || 'N/A',
                info.publishedDate || 'N/A',
                info.description || 'Sem descrição',
                info.pageCount || 0
            ];

            await connection.execute(sql, values);
        }

        console.log(`Sucesso! ${livros.length} livros processados.`);

    } catch (error) {
        console.error('Erro na operação:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

integrarDados();

/*

Configuração no MySQL (Privilégios)
O MySQL dentro da VM também precisa permitir conexões que não venham de "localhost":
Acesse sua VM via SSH.
Entre no MySQL: sudo mysql -u root -p.
Execute o comando para permitir acesso (substitua pelo seu usuário e senha):

sql
CREATE USER 'seu_usuario'@'%' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON nome_do_seu_banco.* TO 'seu_usuario'@'%';
FLUSH PRIVILEGES;

*/