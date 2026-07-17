const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

const patch = `
<style id="custom-mobile-menu-css">
/* Mobile Menu Missing CSS fix */
.ct-drawer-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    background: rgba(0,0,0,0.5);
}
.ct-drawer-canvas.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}
#offcanvas {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    max-width: 80vw;
    height: 100%;
    background: #fff;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
}
.ct-drawer-canvas.active #offcanvas {
    transform: translateX(0);
}
</style>
<script id="custom-mobile-menu-js">
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        // Toggle offcanvas
        const toggleBtn = e.target.closest('[data-toggle-panel="#offcanvas"]');
        if (toggleBtn) {
            e.preventDefault();
            const offcanvas = document.getElementById('offcanvas');
            const drawer = document.querySelector('.ct-drawer-canvas');
            if (offcanvas) offcanvas.classList.add('active');
            if (drawer) drawer.classList.add('active');
        }
        
        // Close offcanvas
        const closeBtn = e.target.closest('.ct-toggle-close');
        if (closeBtn) {
            e.preventDefault();
            const offcanvas = document.getElementById('offcanvas');
            const drawer = document.querySelector('.ct-drawer-canvas');
            if (offcanvas) offcanvas.classList.remove('active');
            if (drawer) drawer.classList.remove('active');
        }
        
        // Close offcanvas if clicking outside #offcanvas (on the backdrop)
        if (e.target.classList.contains('ct-drawer-canvas')) {
            e.target.classList.remove('active');
            const offcanvas = document.getElementById('offcanvas');
            if (offcanvas) offcanvas.classList.remove('active');
        }

        // Toggle mobile submenus
        const mobileDropdownToggle = e.target.closest('.ct-toggle-dropdown-mobile, .ct-sub-menu-parent');
        if (mobileDropdownToggle && mobileDropdownToggle.closest('#offcanvas')) {
            const parentLi = mobileDropdownToggle.closest('.menu-item-has-children, .page_item_has_children');
            if (parentLi) {
                if (e.target.closest('.ct-toggle-dropdown-mobile')) {
                    e.preventDefault();
                }
                parentLi.classList.toggle('ct-active');
                const submenu = parentLi.querySelector('.sub-menu');
                if (submenu) {
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            }
        }
    });
});
</script>
</body>`;

if (!html.includes('custom-mobile-menu-js')) {
    html = html.replace('</body>', patch);
    fs.writeFileSync('frontend/index.html', html);
    console.log('Patched index.html');
} else {
    console.log('Already patched');
}
