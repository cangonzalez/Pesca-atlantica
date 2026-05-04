// ============================================
// SISTEMA DE CARRITO Y PRODUCTOS
// ============================================

const cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let selectedProduct = null;
let selectedWeight = 100;

// Elementos DOM
const contenedor = document.getElementById("contenedor-productos");
const cartIcon = document.getElementById("cart-icon");
const cartCount = document.getElementById("cart-count");
const cartSidebar = document.getElementById("cart-sidebar");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const productModal = document.getElementById("product-modal");
const loginModal = document.getElementById("login-modal");

// ============================================
// CARGAR PRODUCTOS
// ============================================

fetch("productos.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        return response.json();
    })
    .then(data => {
        products = data;
        renderProducts();
        updateCartUI();
    })
    .catch(error => {
        console.error("Error:", error);
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="color: #666;">Error al cargar los productos</p>
            </div>
        `;
    });

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================

function renderProducts() {
    contenedor.innerHTML = '';
    
    products.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        
        productoDiv.innerHTML = `
            <img 
                src="${producto.imagen}" 
                alt="${producto.nombre}"
                onerror="this.style.backgroundColor='#e5e5e5';"
                loading="lazy"
            >
            
            <h3>${producto.nombre}</h3>
            
            <p>Categoría: ${producto.categoria}</p>
            
            <p>$${producto.precio} / ${producto.precioPor}</p>
            
            <button class="btn" onclick="openProductModal(${producto.id})">
                Ver detalles
            </button>
        `;
        
        contenedor.appendChild(productoDiv);
    });
}

// ============================================
// MODAL DE PRODUCTO
// ============================================

function openProductModal(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    selectedWeight = 100;
    
    document.getElementById('modal-image').src = selectedProduct.imagen;
    document.getElementById('modal-name').textContent = selectedProduct.nombre;
    document.getElementById('modal-description').textContent = selectedProduct.descripcion;
    document.getElementById('modal-category').textContent = selectedProduct.categoria;
    
    updatePriceDisplay();
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// SELECTOR DE PESO
// ============================================

function selectWeight(weight) {
    selectedWeight = weight;
    
    // Actualizar botones activos
    document.querySelectorAll('.weight-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Actualizar input
    document.getElementById('weight-input').value = weight;
    
    updatePriceDisplay();
}

function updateWeightFromInput() {
    const input = document.getElementById('weight-input');
    let value = parseInt(input.value);
    
    if (isNaN(value) || value < 100) value = 100;
    if (value > 1000) value = 1000;
    
    selectedWeight = value;
    input.value = value;
    
    // Desactivar todos los botones
    document.querySelectorAll('.weight-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    updatePriceDisplay();
}

function updatePriceDisplay() {
    const pricePerUnit = selectedProduct.precio;
    const totalPrice = (pricePerUnit * selectedWeight) / 100;
    
    document.getElementById('unit-price').textContent = 
        `$${pricePerUnit.toLocaleString('es-AR')} por 100gr`;
    document.getElementById('total-price').textContent = 
        `$${totalPrice.toLocaleString('es-AR')}`;
}

// ============================================
// AGREGAR AL CARRITO
// ============================================

function addToCart() {
    const item = {
        id: selectedProduct.id,
        nombre: selectedProduct.nombre,
        imagen: selectedProduct.imagen,
        precioUnitario: selectedProduct.precio,
        peso: selectedWeight,
        precioTotal: (selectedProduct.precio * selectedWeight) / 100
    };
    
    // Buscar si ya existe en el carrito
    const existingIndex = cart.findIndex(i => 
        i.id === item.id && i.peso === item.peso
    );
    
    if (existingIndex !== -1) {
        // Incrementar cantidad (si quisieras agregar cantidad)
        cart[existingIndex].precioTotal += item.precioTotal;
    } else {
        cart.push(item);
    }
    
    saveCart();
    updateCartUI();
    closeProductModal();
    openCartSidebar();
}

// ============================================
// CARRITO - SIDEBAR
// ============================================

function toggleCartSidebar() {
    cartSidebar.classList.toggle('active');
}

function openCartSidebar() {
    cartSidebar.classList.add('active');
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
}

function updateCartUI() {
    // Actualizar contador
    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
    
    // Actualizar items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = '$0';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.precioTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <p>${item.peso}gr</p>
                <p style="font-weight: 700; color: #0a0a0a;">
                    $${item.precioTotal.toLocaleString('es-AR')}
                </p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                ×
            </button>
        `;
        cartItems.appendChild(itemDiv);
    });
    
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ============================================
// CHECKOUT
// ============================================

function checkout() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        closeCartSidebar();
        openLoginModal();
        return;
    }
    
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Aquí iría la lógica de pago real
    alert(`Procesando compra para ${user.email}...\nTotal: $${calculateTotal()}`);
    
    // Limpiar carrito después de compra exitosa
    // cart.length = 0;
    // saveCart();
    // updateCartUI();
    // closeCartSidebar();
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.precioTotal, 0).toLocaleString('es-AR');
}

// ============================================
// SISTEMA DE LOGIN
// ============================================

let isLoginMode = true;

function openLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

function toggleLoginMode() {
    isLoginMode = !isLoginMode;
    
    const form = document.getElementById('login-form');
    const title = form.querySelector('h2');
    const submitBtn = form.querySelector('button[type="submit"]');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');
    
    if (isLoginMode) {
        title.textContent = 'Iniciar Sesión';
        submitBtn.textContent = 'Ingresar';
        toggleText.textContent = '¿No tenés cuenta? ';
        toggleLink.textContent = 'Registrate';
    } else {
        title.textContent = 'Crear Cuenta';
        submitBtn.textContent = 'Registrarse';
        toggleText.textContent = '¿Ya tenés cuenta? ';
        toggleLink.textContent = 'Iniciá sesión';
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Por favor completá todos los campos');
        return;
    }
    
    if (isLoginMode) {
        // Login
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('user', JSON.stringify({ email: user.email }));
            closeLoginModal();
            checkout();
        } else {
            alert('Email o contraseña incorrectos');
        }
    } else {
        // Registro
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.find(u => u.email === email)) {
            alert('Este email ya está registrado');
            return;
        }
        
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('user', JSON.stringify({ email }));
        
        closeLoginModal();
        checkout();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Cerrar modales con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
        closeLoginModal();
        closeCartSidebar();
    }
});

// Cerrar modal al hacer click en el overlay
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
});