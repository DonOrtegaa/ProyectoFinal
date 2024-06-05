const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'jen.lu0408',
    database: 'UsuariosJ'
});

connection.connect(err => {
    if (err) {
        console.log('Error al conectar a la base de datos', err);
        return;
    }
    console.log('Conexión Exitosa!!');
});

module.exports = connection;
