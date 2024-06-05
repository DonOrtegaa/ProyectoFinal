function registrarUsuario() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const sexo = document.getElementById('sexo').value;

    if (!email || !password || !nombre || !apellido || !sexo) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    fetch('/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, nombre, apellido, sexo })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuario registrado con éxito.');
        } else {
            alert('Error al registrar usuario: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
// Función para modificar el perfil del usuario
function modificarPerfil() {
    // Obtener los nuevos valores del nombre y apellido del formulario
    const nuevoNombre = document.getElementById('nombre').value;
    const nuevoApellido = document.getElementById('apellido').value;
    const token = localStorage.getItem('token');

    // Objeto con los datos del usuario a enviar al servidor
    const datosUsuario = {
        nombre: nuevoNombre,
        apellido: nuevoApellido
    };

    // Realizar una solicitud POST al servidor para modificar el perfil del usuario
    fetch('/usuarios/perfil', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(datosUsuario)
    })
    .then(response => {
        if (response.ok) {
            alert('Perfil actualizado correctamente.');
        } else {
            throw new Error('Error al actualizar el perfil.');
        }
    })
    .catch(error => {
        console.error('Error al modificar el perfil:', error);
        alert('Ha ocurrido un error al intentar actualizar el perfil.');
    });
}
// Manejar el inicio de sesión
function iniciarSesion() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token); // Guardar el token en localStorage
            
            console.log('Token almacenado:', data.token);
            alert('Inicio de sesión exitoso.');
            cargarCompras(); // Opcional: cargar las compras después de iniciar sesión
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error al iniciar sesión:', error);
        alert('Ha ocurrido un error al intentar iniciar sesión.');
    });
}


// Función para cargar y mostrar las compras realizadas por el usuario
function cargarCompras() {
    const token = localStorage.getItem('token');
    console.log('Enviando Token:', token);

      // Verificar si hay un token válido almacenado en localStorage
      if (!token) {
        console.error('No hay un token válido almacenado en localStorage.');
        alert('Debes iniciar sesión antes de realizar operaciones que requieren autenticación.');
        return;
    }
    console.log('Enviando Token:', token);
    // Realizar una solicitud GET al servidor para obtener las compras del usuario
    fetch('/usuarios/compras',{
    method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token // Incluir el token en el encabezado
            
        }
    })
    
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error al cargar las compras.');
        }
    })
    .then(data => {
        // Mostrar las compras en el contenedor
        const comprasContainer = document.getElementById('comprasContainer');
        comprasContainer.innerHTML = '<h3>Compras realizadas:</h3>';
        data.compras.forEach(compra => {
            comprasContainer.innerHTML += `<p>ID: ${compra.id}, Producto: ${compra.producto}, Precio: ${compra.precio}</p>`;
        });
    })
    .catch(error => {
        console.error('Error al cargar las compras:', error);
        alert('Ha ocurrido un error al intentar cargar las compras.');
    });
}

// Llamar a la función cargarCompras al cargar la página para mostrar las compras al usuario
cargarCompras();
