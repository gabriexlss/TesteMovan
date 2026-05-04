// A extensão .js é obrigatória no import devido ao module: NodeNext do tsconfig
import 'dotenv/config';
import app from './app.js'; 

const PORT = process.env.PORT || 3000;

// Função temporária. Aqui vai entrar a lógica real do banco de dados no futuro.
const connectDatabase = async () => {
    return new Promise((resolve) => setTimeout(resolve, 500)); 
};

const startServer = async () => {
    try {
    console.log('[Servidor] Inicializando dependências...');
    
    await connectDatabase();
    console.log('[Servidor] Conexão com o banco de dados estabelecida.');

    app.listen(PORT, () => {
        console.log(`[Servidor] Escutando requisições na porta ${PORT}`);
    });

    } catch (error) {
    console.error('[Servidor] Falha crítica. Abortando inicialização:', error);
    process.exit(1); // Encerra o processo imediatamente (Fail Fast)
    }
};

startServer();