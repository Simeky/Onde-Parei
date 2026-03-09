const express = require('express');
const cors = require('cors');
const livrosRoutes = require('./routes/livros.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
const PORTA = 5000;

app.use(cors());
app.use(express.json());

app.use('/livros', livrosRoutes); 
app.use('/usuarios', usuariosRoutes);

app.listen(PORTA, () => {
  console.log(`Backend rodando na porta ${PORTA}.`);
});