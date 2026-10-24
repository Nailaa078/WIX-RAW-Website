// ---------- helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- cart counter (kept for the browser session) ----------
let cart = 0;
try { cart = parseInt(sessionStorage.getItem('rawCart') || '0', 10) || 0; } catch (e) { /* storage blocked */ }
const cartCount = $('#cartCount');
const toast = $('#toast');
let toastTimer;

function renderCart() { if (cartCount) cartCount.textContent = cart; }
function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove('opacity-0', 'translate-y-4');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('opacity-0', 'translate-y-4'), 1800);
}
renderCart();
$$('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
        cart += 1;
        try { sessionStorage.setItem('rawCart', String(cart)); } catch (e) { /* ignore */ }
        renderCart();
        showToast(`${btn.dataset.name} added to cart`);
    });
});

// ---------- mobile menu ----------
const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('hidden') === false;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuBtn.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
}

// ---------- template info dialog ----------
const dialog = $('#infoDialog');
const readBtn = $('#readBTN');
if (dialog && readBtn) {
    readBtn.addEventListener('click', () => dialog.showModal());
    $('#closeDialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

// ---------- desktop / mobile preview ----------
// The mobile preview opens this same page inside a 390px-wide frame, so the
// responsive breakpoints react exactly as they would on a real phone.
const previewGroup = $('#previewGroup');
if (previewGroup && window.self !== window.top) {
    previewGroup.remove(); // inside the preview frame: hide the toggle
} else if (previewGroup) {
    const buttons = $$('.preview-btn');
    let overlay = null;

    function mark(mode) {
        buttons.forEach((b) => {
            const on = b.dataset.preview === mode;
            b.setAttribute('aria-pressed', String(on));
            b.classList.toggle('border-royal', on);
            b.classList.toggle('text-royal', on);
            b.classList.toggle('border-transparent', !on);
        });
    }

    function closePreview() {
        if (overlay) { overlay.remove(); overlay = null; }
        document.body.style.overflow = '';
        mark('desktop');
    }

    function openPreview() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Mobile preview');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(15,15,20,.88);display:flex;flex-direction:column;align-items:center;padding:12px 12px 16px;';

        const bar = document.createElement('div');
        bar.style.cssText = 'width:100%;max-width:390px;display:flex;justify-content:space-between;align-items:center;color:#fff;font-size:14px;padding-bottom:10px;';
        bar.innerHTML = '<span>Mobile preview (390px)</span>';
        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Close preview';
        close.style.cssText = 'background:#fff;color:#000;border:0;border-radius:999px;padding:6px 14px;font-weight:600;cursor:pointer;';
        close.addEventListener('click', closePreview);
        bar.appendChild(close);

        const frame = document.createElement('iframe');
        frame.src = location.href.split('#')[0];
        frame.title = 'Mobile preview of this page';
        frame.style.cssText = 'width:100%;max-width:390px;flex:1;border:0;border-radius:18px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5);';

        overlay.append(bar, frame);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        mark('mobile');
        close.focus();
    }

    buttons.forEach((btn) => btn.addEventListener('click', () => {
        if (btn.dataset.preview === 'mobile') openPreview(); else closePreview();
    }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePreview(); });
}

// ---------- newsletter (front end only) ----------
const nl = $('#newsletter');
if (nl) {
    nl.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = $('#nlMsg');
        const email = $('#nlEmail');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            msg.textContent = 'Please enter a valid email address.';
            email.focus();
            return;
        }
        if (!$('#nlConsent').checked) {
            msg.textContent = 'Please tick the box to subscribe.';
            return;
        }
        // TODO: send the email to your newsletter service here.
        msg.textContent = 'Thanks for subscribing!';
        nl.reset();
    });
}

// ---------- sorting on the New Arrivals page ----------
const sort = $('#sort');
const grid = $('#productGrid');
if (sort && grid) {
    const items = $$('.product', grid);
    const orders = {
        'recommended': (a, b) => a.dataset.order - b.dataset.order,
        'newest': (a, b) => b.dataset.order - a.dataset.order,
        'price-asc': (a, b) => a.dataset.price - b.dataset.price || a.dataset.order - b.dataset.order,
        'price-desc': (a, b) => b.dataset.price - a.dataset.price || a.dataset.order - b.dataset.order,
        'name-asc': (a, b) => a.dataset.name.localeCompare(b.dataset.name),
        'name-desc': (a, b) => b.dataset.name.localeCompare(a.dataset.name),
    };
    sort.addEventListener('change', () => {
        items.slice().sort(orders[sort.value]).forEach((el) => grid.appendChild(el));
    });
}

// ---------- sign up / log in (front end only) ----------
const authForm = $('#authForm');
if (authForm) {
    let mode = 'signup';
    const title = $('#authTitle');
    const prompt = $('#authPrompt');
    const toggle = $('#authToggle');
    const submit = $('#authSubmit');
    const msg = $('#authMsg');
    const extras = $$('[data-signup-only]');

    function setMode(next) {
        mode = next;
        const signup = mode === 'signup';
        title.textContent = signup ? 'Sign Up' : 'Log In';
        prompt.textContent = signup ? 'Already have an account?' : 'New here?';
        toggle.textContent = signup ? 'Log In' : 'Sign Up';
        submit.textContent = signup ? 'Sign Up' : 'Log In';
        $('#password').autocomplete = signup ? 'new-password' : 'current-password';
        extras.forEach((box) => {
            box.classList.toggle('hidden', !signup);
            $('input', box).required = signup;
        });
        msg.textContent = '';
        msg.className = 'min-h-5 text-sm';
    }
    toggle.addEventListener('click', () => setMode(mode === 'signup' ? 'login' : 'signup'));

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fail = (text, field) => {
            msg.textContent = text;
            msg.className = 'min-h-5 text-sm text-red-600';
            field.focus();
        };
        const email = $('#email');
        const pass = $('#password');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return fail('Please enter a valid email address.', email);
        if (pass.value.length < 6) return fail('Password must be at least 6 characters.', pass);
        if (mode === 'signup') {
            if ($('#email2').value.trim() !== email.value.trim()) return fail('The email addresses do not match.', $('#email2'));
            if ($('#password2').value !== pass.value) return fail('The passwords do not match.', $('#password2'));
        }
        // TODO: send the form to your backend here.
        msg.textContent = mode === 'signup' ? 'Account created. Welcome!' : 'Logged in.';
        msg.className = 'min-h-5 text-sm text-green-700';
        authForm.reset();
    });
}
