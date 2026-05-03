const contenedor = document.getElementById("contenedor-productos");

// Función para formatear precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(precio);
}

// Función para manejar error de carga de imagen
function handleImageError(img) {
    img.style.backgroundColor = '#e5e5e5';
    img.style.display = 'flex';
    img.style.alignItems = 'center';
    img.style.justifyContent = 'center';
    img.alt = 'Imagen no disponible';
}

// Cargar productos
fetch("productos.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        return response.json();
    })
    .then(data => {
        
        if (!data || data.length === 0) {
            contenedor.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #666;">No hay productos disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        data.forEach(producto => {
            
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto';
            
            productoDiv.innerHTML = `
                <img 
                    src="${producto.imagen}" 
                    alt="${producto.nombre}"
                    onerror="this.style.backgroundColor='#e5e5e5'; this.alt='Imagen no disponible';"
                    loading="lazy"
                >
                
                <h3>${producto.nombre}</h3>
                
                <p>Categoría: ${producto.categoria}</p>
                
                <p>${formatearPrecio(producto.precio)}</p>
                
                <button class="btn" onclick="agregarAlCarrito(${producto.id})">
                    Agregar al carrito
                </button>
            `;
            
            contenedor.appendChild(productoDiv);
        });

    })
    .catch(error => {
        console.error("Error cargando productos:", error);
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 8px;">
                <p style="color: #666; margin-bottom: 16px;">
                    ⚠️ Error al cargar los productos
                </p>
                <p style="color: #999; font-size: 0.9rem;">
                    ${error.message}
                </p>
            </div>
        `;
    });

// Función placeholder para agregar al carrito
function agregarAlCarrito(id) {
    alert(`Producto ${id} agregado al carrito`);
    // Aquí iría la lógica real del carrito
}