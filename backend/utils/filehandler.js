const fs = require('fs');
const path = require('path');

const lerDados = (entidade) => {
  const filePath = path.join(__dirname, `../data/${entidade}.json`);
  try {
    if (!fs.existsSync(filePath)) return []; // Caso o caminho do arquivo não exista, retorna um array vazio
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${entidade}.json:`, error);
    return [];
  }
};

const salvarDados = (entidade, dados) => {
  const filePath = path.join(__dirname, `../data/${entidade}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf8');
  } catch (error) {
    console.error(`Erro ao escrever no arquivo ${entidade}.json:`, error);
  }
};

module.exports = { lerDados, salvarDados };