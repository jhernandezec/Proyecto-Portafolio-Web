(function() {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // --- Auth simple (solo demo) ---
  const AUTH_KEY = 'technova_auth';
  const readAuth = () => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
  };
  const writeAuth = (auth) => localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  const logout = () => { localStorage.removeItem(AUTH_KEY); location.href = 'index.html'; };

  // Año en footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Menú móvil
  const navToggle = $('#navToggle');
  const navList = $('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('open');
    });
    // Cerrar al navegar
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a')) navList.classList.remove('open');
    });
  }

  // Enlace activo por URL
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-list a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  // Navbar dinámico: Login / Perfil / Salir
  const navListEl = $('.nav-list');
  const renderAuthLinks = () => {
    if (!navListEl) return;
    // Eliminar elementos previos si existen
    const prevLogin = navListEl.querySelector('[data-auth="login"]');
    const prevPerfil = navListEl.querySelector('[data-auth="perfil"]');
    const prevSalir = navListEl.querySelector('[data-auth="logout"]');
    [prevLogin, prevPerfil, prevSalir].forEach(n => n && n.remove());

    const auth = readAuth();
    if (auth && auth.username === 'admin') {
      const liPerfil = document.createElement('li');
      liPerfil.setAttribute('data-auth', 'perfil');
      liPerfil.innerHTML = '<a href="perfil.html">Perfil</a>';
      const liSalir = document.createElement('li');
      liSalir.setAttribute('data-auth', 'logout');
      liSalir.innerHTML = '<a href="#" id="logoutLink">Salir</a>';
      navListEl.appendChild(liPerfil);
      navListEl.appendChild(liSalir);
      $('#logoutLink')?.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    } else {
      const liLogin = document.createElement('li');
      liLogin.setAttribute('data-auth', 'login');
      liLogin.innerHTML = '<a href="login.html">Login</a>';
      navListEl.appendChild(liLogin);
    }
  };
  renderAuthLinks();

  // Carrito simple en memoria + localStorage
  const CART_KEY = 'technova_cart';
  const PROFILE_KEY = 'technova_profile';
  const CATALOG_KEY = 'technova_catalog';
  const cartCountEl = $('#cartCount');
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  };
  const writeCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const getCartCount = () => readCart().reduce((acc, p) => acc + (p.qty || 1), 0);
  const updateCartCount = () => { if (cartCountEl) cartCountEl.textContent = String(getCartCount()); };
  updateCartCount();

  // Catálogo persistente con seed inicial
  const DEFAULT_PRODUCTS = [
    { id: 'pc-gamer-a', name: 'PC Gamer Alpha', price: 1299, tag: 'RTX 4060', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop' },
    { id: 'pc-creator', name: 'PC Creator Pro', price: 1599, tag: 'Ryzen 9', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop' },
    { id: 'notebook-ultra', name: 'Notebook Ultra', price: 1099, tag: 'OLED 14"', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop' },
    { id: 'pc-office', name: 'PC Office Plus', price: 699, tag: 'SSD 1TB', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop' },
    { id: 'mini-pc', name: 'Mini PC NUC', price: 499, tag: 'Ultra compacto', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop' },
    { id: 'workstation', name: 'Workstation Studio', price: 2499, tag: 'RTX 4080', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop' }
  ];
  const readCatalog = () => { try { return JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null') || DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; } };
  const writeCatalog = (items) => localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
  if (!localStorage.getItem(CATALOG_KEY)) writeCatalog(DEFAULT_PRODUCTS);

  const productGrid = $('#productGrid');
  if (productGrid) {
    const toCurrency = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
    const html = readCatalog().map(p => `
      <article class="product">
        <img src="${p.img}" alt="${p.name}">
        <div class="content">
          <span class="badge">${p.tag}</span>
          <h3>${p.name}</h3>
          <div class="price">${toCurrency(p.price)}</div>
          <div class="actions">
            <button class="btn" data-add="${p.id}">Agregar</button>
            <button class="btn" data-minus="${p.id}">Quitar</button>
          </div>
        </div>
      </article>
    `).join('');
    productGrid.innerHTML = html;

    productGrid.addEventListener('click', (e) => {
      const addId = e.target.closest('[data-add]')?.getAttribute('data-add');
      const minusId = e.target.closest('[data-minus]')?.getAttribute('data-minus');
      if (!addId && !minusId) return;
      const cart = readCart();
      if (addId) {
        const item = cart.find(i => i.id === addId);
        if (item) item.qty += 1; else cart.push({ id: addId, qty: 1 });
      }
      if (minusId) {
        const idx = cart.findIndex(i => i.id === minusId);
        if (idx !== -1) {
          cart[idx].qty -= 1;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
      }
      writeCart(cart);
      updateCartCount();
    });
  }

  // Validación de formulario de contacto
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#name');
      const email = $('#email');
      const message = $('#message');
      let valid = true;

      const setError = (el, msg) => {
        const err = $(`.error[data-for="${el.id}"]`);
        if (err) err.textContent = msg || '';
        if (msg) valid = false;
      };

      setError(name, name.value.trim() ? '' : 'Ingresa tu nombre.');
      const emailVal = email.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      setError(email, emailOk ? '' : 'Email inválido.');
      setError(message, message.value.trim().length >= 10 ? '' : 'Mensaje mínimo 10 caracteres.');

      if (!valid) return;
      $('#formSuccess').hidden = false;
      form.reset();
    });
  }

  // Login
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = $('#username');
      const p = $('#password');
      const setError = (el, msg) => { const err = $(`.error[data-for="${el.id}"]`); if (err) err.textContent = msg || ''; };
      setError(u, u.value.trim() ? '' : 'Ingresa el usuario.');
      setError(p, p.value.trim() ? '' : 'Ingresa la contraseña.');
      if (!u.value.trim() || !p.value.trim()) return;
      if (u.value === 'admin' && p.value === 'admin') {
        writeAuth({ username: 'admin', role: 'admin' });
        $('#loginSuccess').hidden = false;
        setTimeout(() => { location.href = 'perfil.html'; }, 600);
      } else {
        setError(p, 'Credenciales inválidas.');
      }
    });
  }

  // Protección de ruta para perfil
  if (path === 'perfil.html') {
    const auth = readAuth();
    if (!(auth && auth.username === 'admin')) {
      location.href = 'login.html';
      return;
    }
    // Logout
    $('#logoutBtn')?.addEventListener('click', logout);

    // Perfil editable
    const defaultProfile = { name: 'Admin', email: 'admin@technova.local', phone: '' };
    const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') || defaultProfile; } catch { return defaultProfile; } };
    const writeProfile = (p) => localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    const pf = readProfile();
    const pfName = $('#pf_name');
    const pfEmail = $('#pf_email');
    const pfPhone = $('#pf_phone');
    if (pfName) pfName.value = pf.name;
    if (pfEmail) pfEmail.value = pf.email;
    if (pfPhone) pfPhone.value = pf.phone || '';
    $('#userName') && ($('#userName').textContent = 'admin');
    const pfForm = $('#profileForm');
    pfForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pfEmail.value.trim());
      if (!pfName.value.trim() || !emailOk) { $('#pf_error').textContent = 'Nombre y email válidos requeridos.'; return; }
      $('#pf_error').textContent = '';
      writeProfile({ name: pfName.value.trim(), email: pfEmail.value.trim(), phone: pfPhone.value.trim() });
      $('#pf_success').hidden = false;
      setTimeout(() => { $('#pf_success').hidden = true; }, 1200);
    });
  }

  // (revert) sin modal de carrito ni icono; solo contador

  // Protección y lógica: Pedidos (demo)
  if (path === 'pedidos.html' || path === 'gestion-productos.html' || path === 'estadisticas.html') {
    const auth = readAuth();
    if (!(auth && auth.username === 'admin')) { location.href = 'login.html'; return; }
  }

  if (path === 'pedidos.html') {
    const ordersList = $('#ordersList');
    if (ordersList) {
      ordersList.innerHTML = '<ul><li>Pedido #1001 - PC Gamer Alpha - Estado: Enviado</li><li>Pedido #1002 - Notebook Ultra - Estado: Procesando</li></ul>';
    }
  }

  // Gestión de productos (CRUD básico)
  if (path === 'gestion-productos.html') {
    const toCurrency = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
    const listEl = $('#productAdminList');
    const form = $('#productForm');
    const err = $('#productError');
    const render = () => {
      const items = readCatalog();
      listEl.innerHTML = items.map(p => `
        <article class="product">
          <img src="${p.img}" alt="${p.name}">
          <div class="content">
            <span class="badge">${p.tag || ''}</span>
            <h3>${p.name}</h3>
            <div class="price">${toCurrency(Number(p.price))}</div>
            <div class="actions">
              <button class="btn" data-del="${p.id}">Eliminar</button>
            </div>
          </div>
        </article>
      `).join('');
    };
    render();
    listEl.addEventListener('click', (e) => {
      const delId = e.target.closest('[data-del]')?.getAttribute('data-del');
      if (!delId) return;
      const items = readCatalog().filter(p => p.id !== delId);
      writeCatalog(items);
      render();
    });
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#pname').value.trim();
      const price = parseFloat($('#pprice').value);
      const tag = $('#ptag').value.trim();
      const img = $('#pimg').value.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop';
      if (!name || !(price >= 0)) { err.textContent = 'Nombre y precio válidos.'; return; }
      err.textContent = '';
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2,6);
      const items = readCatalog();
      items.push({ id, name, price, tag, img });
      writeCatalog(items);
      (e.target).reset();
      render();
    });
  }

  // Estadísticas
  if (path === 'estadisticas.html') {
    const items = readCatalog();
    const sales = 42; // demo
    const avg = 1120; // demo
    $('#statSales') && ($('#statSales').textContent = String(sales));
    $('#statAvg') && ($('#statAvg').textContent = `USD ${avg}`);
    $('#statProducts') && ($('#statProducts').textContent = String(items.length));
  }
})();


