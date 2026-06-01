import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware para que React pueda comunicarse con Node.js en desarrollo
app.use(cors({
    origin: 'http://localhost:3000', // URL estándar de desarrollo de React
    credentials: true // Permite el intercambio de cookies de sesión
}));

// Middleware para poder leer datos en formato JSON que envíe el cliente
app.use(express.json());

// Configuración básica de la Sesión en Memoria (temporal)
app.use(session({
    secret: process.env.SESSION_SECRET || 'clavetemporalwalkwi',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Protege la cookie de accesos maliciosos desde JavaScript
        secure: false,  // Poner en 'true' solo cuando usemos HTTPS en producción
        maxAge: 1000 * 60 * 60 * 24 // Duración de la cookie: 1 día
    }
}));

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "Servidor de Walkwi en línea", 
        instancia: "Rama Main" 
    });
});

import authRoutes from './routes/authRoutes.js';

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
