import { query } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 1. REGISTRO DE USUARIO (Con cifrado de contraseña)
export const registrar = async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
        // Ciframos la contraseña con un factor de seguridad de 10 vueltas (bcrypt)
        const salt = await bcrypt.genSalt(10);
        const passwordCifrada = await bcrypt.hash(password, salt);

        // Insertamos el usuario real en PostgreSQL
        const nuevoUsuario = await query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
            [nombre, email, passwordCifrada, rol || 'CLIENTE']
        );

        return res.status(201).json({
            mensaje: "Usuario registrado con éxito",
            usuario: nuevoUsuario.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Código de error de PostgreSQL para correo duplicado
            return res.status(400).json({ error: "El correo electrónico ya está registrado" });
        }
        console.error("Error en registro:", error);
        return res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

// 2. INICIO DE SESIÓN (Validación y Generación de JWT)
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscamos al usuario en la base de datos por su correo
        const resultado = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        // Si no encontró ninguna fila, las credenciales no existen
        if (resultado.rowCount === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // 🔥 LA CLAVE AQUÍ: Extraemos estrictamente el primer elemento del arreglo de filas
        const usuario = resultado.rows[0]; 
            const hashDeBaseDatos = usuario.password || '';

        // Verificamos en la consola que la contraseña cifrada realmente exista antes de comparar
        console.log("Contraseña cifrada recuperada de la BD:", usuario.password);

        // Validamos si la contraseña coincide con la cifrada en la BD
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // GENERACIÓN DEL TOKEN JWT
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            process.env.JWT_SECRET || 'clave_secreta_temporal_walkwi_12345',
            { expiresIn: '2h' } // El token expira en 2 horas
        );

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token, // Le entregamos el token al cliente (React)
            usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};


// 3. CONSULTA DE USUARIOS DESDE LA BASE DE DATOS (Ruta Privada Protegida)
export const obtenerUsuarios = async (req, res) => {
    try {
        // Traemos todos los usuarios pero sin mostrar la contraseña por seguridad
        const resultado = await query('SELECT id, nombre, email, rol, created_at FROM usuarios');
        return res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ error: "Error al consultar los usuarios" });
    }
};
