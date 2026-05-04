import express, { Application } from 'express';
import mainRoutes from './mainRoutes.js';

const app: Application = express();

// Necessário para o servidor conseguir ler o corpo das requisições (req.body) em JSON
app.use(express.json());

// Registra o Arquivo de Rota Principal
app.use('/', mainRoutes);

// O app é exportado, mas o servidor NÃO é iniciado aqui
export default app;