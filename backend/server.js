const express = require('express');
const cors = require('cors');
const livrosRoutes = require('./routes/livros.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const promMid = require('express-prometheus-middleware');

const app = express();
const PORTA = 5000;

app.use(cors());
app.use(express.json());
app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

app.use('/livros', livrosRoutes); 
app.use('/usuarios', usuariosRoutes);

app.listen(PORTA, () => {
  console.log(`Backend rodando na porta ${PORTA}.`);
});