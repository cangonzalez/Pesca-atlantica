const contenedor = document.getElementById("contenedor-productos");

fetch("productos.json")
    .then(response => response.json())
    .then(data => {

        data.forEach(producto => {

            contenedor.innerHTML += `
            
                <div class="producto">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    
                    <h3>${producto.nombre}</h3>
                    
                    <p>Categoría: ${producto.categoria}</p>
                    
                    <p>Precio: $${producto.precio}</p>
                    
                    <button class="btn">
                        Agregar al carrito
                    </button>
                </div>
            
            `;
        });

    })
    .catch(error => {
        console.log("Error cargando productos:", error);
    });