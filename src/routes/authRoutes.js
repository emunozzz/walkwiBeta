import express from 'express';
import { registrar, login, obtenerUsuarios } from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Ruta Pública: Registro
router.post('/register', registrar);

// 2. Ruta Pública: Login
router.post('/login', login);

// 3. Ruta Privada Protegida
router.get('/usuarios', verificarToken, obtenerUsuarios);

export default router;
