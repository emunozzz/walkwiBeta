import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verificarToken = (req, res, next) => {
    // Buscamos el token JWT en la cabecera 'Authorization' de la petición
    const authHeader = req.headers['authorization'];
    
    // El estándar es enviar: 'Bearer TOKEN_AQUÍ', así que dividimos el texto
    const token = authHeader && authHeader.split(' ')[1];

    // Si el cliente no envió ningún token, le denegamos el acceso inmediatamente
    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        // Validamos criptográficamente si el token es real y no ha expirado
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Inyectamos los datos del usuario verificado en la petición para que el controlador los use
        req.usuario = verificado;
        
        next(); // ¡Todo bien! Le permitimos continuar a la ruta privada
    } catch (error) {
        return res.status(403).json({ error: "Token JWT inválido o expirado." });
    }
};
