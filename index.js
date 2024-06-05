const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const app = express();

app.use(bodyParser.json());

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: '127.0.0.1', //localhost
  user: 'root', //root
  password: 'jen.lu0408', //
  database: 'UsuariosJ'
});

connection.connect((err) => {
  if (err) {
    console.log('Error al conectar a la base de datos', err);
    return;
  }

  console.log('Conexión Exitosa!!')
});
//M
function authenticate(req, res, next) {
  const token = req.headers['x-access-token'];
  console.log('Token:', token); 

  if (!token) {
    res.status(401).json({ success: false, message: 'No se proporcionó un token de acceso.' });
    return;
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      console.error('Error al verificar el token:', err);
      res.status(401).json({ success: false, message: 'Token de acceso inválido.' });
      return;
    }
    console.log('Token descodificado:', decoded); // Agrega este log
    req.user = decoded;
    next();
  });

}

// Ruta protegida (ejemplo de cómo proteger una ruta con token)
app.get('/profile', authenticate, (req, res) => {
  res.status(200).json({ success: true, message: 'Acceso autorizado.' });
});
// Ruta para visualizar las compras realizadas por el usuario
app.get('/usuarios/compras', authenticate, (req, res) => {
  // Obtener el ID del usuario desde el middleware de autenticación
  const userId = req.user.id;
  console.log('ID de usuario:', userId);

  // Consultar la base de datos para obtener las compras del usuario
  const consulta = 'SELECT id, producto, precio FROM compras WHERE usuario_id = ?';
  connection.query(consulta, [userId], (err, resultado) => {
      if (err) {
          console.error('Error al recuperar compras desde la base de datos:', err);
          return res.status(500).json({ success: false, message: 'Error al recuperar compras.' });
      }

      // Si la consulta se realizó con éxito, enviar las compras al cliente
      res.status(200).json({ success: true, compras: resultado });
  });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Ruta para refrescar token
app.post('/refresh-token', (req, res) => {
  const oldToken = req.body.token;
  const refreshToken = req.body.refreshToken;

  // Verificar que el token sea válido y no haya expirado
  jwt.verify(oldToken, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Generar un nuevo token con una fecha de expiración más lejana
    const newToken = jwt.sign({
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
    }, 'secretkey');

    res.json({ token: newToken });
  });
});




  // Validar que todos los campos estén llenos
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Por favor, complete todos los campos.' });
    return;
  }

  // Buscar el usuario en la base de datos
  const consulta = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(consulta, [email], (err, result) => {
    if (err) {
      console.log('Error al buscar usuario en la base de datos', err);
      res.status(500).json({ success: false, message: 'Error al iniciar sesión.' });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    // Comparar la contraseña encriptada con la contraseña ingresada por el usuario
    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.log('Error al comparar contraseñas', err);
        return res.status(500).json({ success: false, message: 'Error al iniciar sesión.' });
       
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
        
      }


       // Autenticación exitosa, devolver un token de acceso
       
       const token = jwt.sign({ id: user.id, email: user.email, nombre: user.nombre }, 'secretkey', { expiresIn: '10h' });
       console.log('Generated Token:', token);
       res.status(200).json({ success: true, message: 'Inicio de sesión exitoso.', token: token });
     });
   });
 });
 // Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));


// Configuración del servidor
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ruta para registrar usuarios
app.post('/registro', (req, res) => {
  const { email, password, nombre, apellido, sexo } = req.body;

  // Validar que todos los campos estén llenos
  if (!email || !password || !nombre || !apellido || !sexo) {
    return res.status(400).json({ success: false, message: 'Por favor, complete todos los campos.' });
    
  }

  // Encriptar la contraseña
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.log('Error al encriptar contraseña', err);
      return res.status(500).json({ success: false, message: 'Error al registrar usuario.' });
      
    }

    // Insertar el usuario en la base de datos
    const consulta = 'INSERT INTO usuarios (email, password, nombre, apellido, sexo) VALUES (?, ?, ?, ?, ?)';
    connection.query(consulta, [email, hash, nombre, apellido, sexo], (err, result) => {
      if (err) {
        console.log('Error al insertar usuario en la base de datos', err);
        return res.status(500).json({ success: false, message: 'Error al registrar usuario.' });
        
      }

      res.status(200).json({ success: true, message: 'Usuario registrado con éxito.' });
    });
  });
});

// Ruta para modificar el perfil del usuario
app.post('/usuarios/modificar', authenticate, (req, res) => {
  const { nombre, apellido } = req.body; // Recibimos los datos del formulario

  // Validamos que se hayan recibido los datos necesarios
  if (!nombre || !apellido) {
      return res.status(400).json({ success: false, message: 'Por favor, proporciona nombre y apellido.' });
  }

  // Aquí deberías implementar la lógica para actualizar el perfil del usuario en la base de datos
  const userId = req.user.id; // Supongamos que tenemos el ID del usuario desde el middleware de autenticación
  const consulta = 'UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?';
  connection.query(consulta, [nombre, apellido, userId], (err, resultado) => {
      if (err) {
          console.error('Error al actualizar perfil en la base de datos:', err);
          return res.status(500).json({ success: false, message: 'Error al actualizar perfil.' });
      }
      res.status(200).json({ success: true, message: 'Perfil actualizado correctamente.' });
  });
});


// Iniciar servidor
const port = 3000;

app.listen(port, () =>{
    console.log('Servidor Creado http://localhost:'+ port);
});