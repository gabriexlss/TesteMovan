import { Router } from "express";

// Arquivos das Rotas
import map from './routes/map.route.js';

const router = Router();

router.use('/map', map);

router.get('/', (req, res) => {
    res.send('Bem-vindo à API de Geocodificação!');
});
export default router;