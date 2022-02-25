// :: 1.0 ScrollUp Active Code
const navbar = document.querySelector('.fixed-top');
window.onscroll = () => {
    if (window.scrollY > 200) {
        navbar.classList.add('nav-active');
    } else {
        navbar.classList.remove('nav-active');
    }
};


//////////  Creamos el stock  ///////////////////

// Constructor de objetos para modelar los productos
class Producto {
    constructor(id, nombre, imagen, precio) {
        this.id = id;
        this.nombre = nombre;
        this.imagen = imagen;
        this.precio = precio;
    }
}

//////////  Creamos el stock trayendo los datos de un JSON  ///////////////////

let stock = [];
const urlProductos = './data/data.json';

fetch(urlProductos)
.then(response => response.json())
.then(data => {
    stock = data;
    mostrarStock(); // Ejecutamos la vista inicial con la primera fila de productos
});



let inicio = 0;  // En esta variable llevamos la cuenta para la posición inicial del stock a mostrar

function mostrarStock() {
    // En este ciclo generamos una fila de 6 tarjetas de productos
    for (let i = inicio; i < inicio + 6; i++) {
        let tarjeta = document.createElement('div');
        tarjeta.setAttribute("class", "col-7 col-md-4 col-lg-4 mt-4  d-flex justify-content-center mb-3")
        if (stock[i]) {
            tarjeta.innerHTML = `
            <div class="card" style="width:200px">
            <img class="card-img-top" src=${stock[i].imagen} alt="Card image" style="width:100%">
            <div class="card-body">
                <h4 class="card-title text-center">${stock[i].nombre}</h4>
                <p class="card-text text-center">Precio $${stock[i].precio}</p>
                <h4 style="display:none" class="popup" id="popup${stock[i].id}"> Producto agregado al carrito! </h4>
                <div class="d-flex justify-content-center">
                    <button
                      class="btn btn-primary"
                      data-id=${stock[i].id}
                      data-nombre=${stock[i].nombre.replaceAll(" ", "_")} // Reemplazamos los espacios en blanco para evitar errores
                      data-precio=${stock[i].precio}
                      data-imagen=${stock[i].imagen}
                      onclick="agregarProducto(event)"
                    >Comprar</button>
                </div>
            </div>
        </div>
            `;
        } 
        // Enviamos cada tarjeta al HTML
        document.querySelector('#stock').appendChild(tarjeta);
    }

    if (inicio + 6 >= stock.length) {
        document.querySelector('#btnMore').disabled = true;  // Deshabilitamos el botón 'Más Productos'
    } else {
        inicio += 6;  // Incrementamos en 6 unidades el punto de inicio de la muestra de productos
    }

}

/////// Creamos el carrito /////////////

// Creamos el array vacío del carrito
let carrito = [];


// Creamos la función para la vista del carrito en el HTML

function mostrarCarrito() {
    let acumuladorCarritoHTML = ``;

    for (let i = 0; i < carrito.length; i++) {
        let template = `
        <tr>
            <td class="pe-1">
                <img src="${carrito[i].imagen}" width="100%">
            </td>
            <td class="ps-2">${carrito[i].nombre.replaceAll("_", " ")}</td>
            <td><a class="btn-dec ms-2" onclick="decrementar('${carrito[i].id}')">-</a></td>
            <td>
                <p class="card-text pe-1">${carrito[i].cantidad}</p>
            </td>
            <td><a class="btn-inc" onclick="incrementar('${carrito[i].id}')">+</a></td>
            <td>
                <p class="card-text ms-2">Precio $${carrito[i].precio * carrito[i].cantidad}</p>
            </td>
            <td><a class="eliminar-prod ms-2"  data-id=${carrito[i].id} onclick="eliminarProducto(${carrito[i].id})"> x </a></td>
           
        </tr>

        `;

        acumuladorCarritoHTML += template;
    }

    document.querySelector('#lista-carrito tbody').innerHTML = acumuladorCarritoHTML;
    // Guardamos el estado del carrito en el localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


// Creamos la función para agregar productos al carrito
function agregarProducto(event) {
    let encontrado = carrito.findIndex(item => item.id == event.target.dataset.id);
    if (encontrado == -1) {
        let productoElegido = new Producto(event.target.dataset.id,
            event.target.dataset.nombre, 
            event.target.dataset.imagen, 
            event.target.dataset.precio);
        productoElegido.cantidad = 1;
        carrito.push(productoElegido);
        
    } else {
        carrito[encontrado].cantidad += 1;
    }
    mostrarCarrito();
    actualizarTotal();
    
 //Animacíon Producto agregado al carrito
    $(`#popup${event.target.dataset.id}`)
     .fadeIn(1500)
        .delay(700)
            .fadeOut(1500)
   
}

// Función para eliminar un producto del carrito
function eliminarProducto(id) {
    let encontrado = carrito.findIndex(item => item.id == id);
    carrito.splice(encontrado, 1);
    mostrarCarrito();
    actualizarTotal();
}

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    mostrarCarrito();  
    actualizarTotal();
    event.preventDefault();
}



// Función para incrmentar la cantidad de un producto en el carrito
function incrementar(id) {
    let encontrado = carrito.findIndex(item => item.id == id);
    carrito[encontrado].cantidad += 1;
    mostrarCarrito();
    actualizarTotal();
}

// Función para decrmentar la cantidad de un producto en el carrito
function decrementar(id) {
    let encontrado = carrito.findIndex(item => item.id == id);
    if (carrito[encontrado].cantidad > 1) carrito[encontrado].cantidad -= 1;
    mostrarCarrito();
    actualizarTotal();
}

// Función para actualizar el total del carrito
function actualizarTotal() {
    let total = 0;
    carrito.forEach(item => total += (item.cantidad * item.precio));
    document.querySelector('#total').innerHTML = "$" + total;
}


// Función evento, compra finalizada del carrito
function finalizarCompra() {
    if (carrito.length >= 1){
    vaciarCarrito()
    Swal.fire({
      position: 'top-center',
      icon: 'success',
      title: 'Compra finalizada con éxito',
      showConfirmButton: false,
      timer: 2300
    })
   }
   else{
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No hay productos en el carrito!',
        showConfirmButton: false,
        timer: 1800
      })
   }
}
     


// BARRA DE BUSQUEDA

function filtrar(e) {

  event.preventDefault()

  let search = $('#search').val().toUpperCase()

  let filtro = stock.filter(item => item.nombre.toUpperCase() == search)

  for (const stock of filtro) {

        $('#stock').empty() //Vaciado de las card en el HTML

        $("#stock").append(
        `
        <div class="card" style="width:200px">
        <img class="card-img-top" src=${stock.imagen} alt="Card image" style="width:100%">
        <div class="card-body">
            <h4 class="card-title text-center">${stock.nombre}</h4>
            <p class="card-text text-center">Precio $${stock.precio}</p>
            <h4 style="display:none" class="popup" id="popup${stock.id}"> Producto agregado al carrito! </h4>
            <div class="d-flex justify-content-center">
                <button
                  class="btn btn-primary"
                  data-id=${stock.id}
                  data-nombre=${stock.nombre.replaceAll(" ", "_")} // Reemplazamos los espacios en blanco para evitar errores
                  data-precio=${stock.precio}
                  data-imagen=${stock.imagen}
                  onclick="agregarProducto(event)"
                >Comprar</button>
            </div>
        </div>
    </div>
        `);

  }

  if (filtro == '') {

    alert('Producto no encontrado')
  }

}