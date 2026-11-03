const path = require('path');
const fs = require('fs');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), quiet: true });

// A chave da conta de serviço pode vir de duas formas:
// 1. FIREBASE_SERVICE_ACCOUNT: o JSON inteiro numa variável (prático para hospedagem).
// 2. FIREBASE_SERVICE_ACCOUNT_PATH: caminho do arquivo JSON (padrão: backend/serviceAccountKey.json).
function carregarCredenciais() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const caminho = path.resolve(
    __dirname,
    '..',
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json'
  );

  if (!fs.existsSync(caminho)) {
    throw new Error(
      `Chave do Firebase não encontrada em ${caminho}. ` +
      'Gere em Configurações do projeto > Contas de serviço > Gerar nova chave privada.'
    );
  }

  return JSON.parse(fs.readFileSync(caminho, 'utf8'));
}

if (!getApps().length) {
  initializeApp({ credential: cert(carregarCredenciais()) });
}

const db = getFirestore();

module.exports = db;
