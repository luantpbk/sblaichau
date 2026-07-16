import React, { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [siteSettings, setSiteSettings] = useState([]);
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(console.error);
  }, []);

  const getSetting = (key, defaultVal) => {
    const s = siteSettings.find(item => item.key === key);
    return s ? s.value : defaultVal;
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  
  useEffect(() => {
    const handleGlobalClick = (e) => {
        // Mobile hamburger toggle
        const trigger = e.target.closest('.ct-header-trigger');
        if (trigger) {
            e.preventDefault();
            const panelId = trigger.getAttribute('data-toggle-panel');
            if (panelId) {
                const panel = document.querySelector(panelId);
                if (panel) {
                    panel.classList.toggle('active');
                    document.body.classList.toggle('ct-panel-active');
                }
            }
        }
        
        // Mobile menu close button
        const closeBtn = e.target.closest('.ct-toggle-close');
        if (closeBtn) {
            e.preventDefault();
            const panel = closeBtn.closest('.ct-panel');
            if (panel) {
                panel.classList.remove('active');
                document.body.classList.remove('ct-panel-active');
            }
        }

        // Mobile submenu toggle
        const mobileToggle = e.target.closest('.ct-toggle-dropdown-mobile');
        if (mobileToggle) {
            e.preventDefault();
            const li = mobileToggle.closest('li');
            if (li) {
                li.classList.toggle('ct-active');
                const submenu = li.querySelector('.sub-menu');
                if (submenu) {
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            }
        }

        // Desktop submenu click
        const desktopMenuToggle = e.target.closest('.menu-item-has-children > a, .ct-toggle-dropdown-desktop-ghost, .ct-toggle-dropdown-desktop');
        if (desktopMenuToggle) {
            const li = desktopMenuToggle.closest('.menu-item-has-children');
            if (li) {
                e.preventDefault();
                li.classList.toggle('ct-active');
                const submenu = li.querySelector('.sub-menu');
                if (submenu) {
                    submenu.style.display = li.classList.contains('ct-active') ? 'block' : '';
                }
                
                // Close other open menus at the same level
                const parentUl = li.closest('ul');
                if (parentUl) {
                    Array.from(parentUl.children).forEach(sibling => {
                        if (sibling !== li && sibling.classList.contains('ct-active')) {
                            sibling.classList.remove('ct-active');
                            const siblingSub = sibling.querySelector('.sub-menu');
                            if (siblingSub) siblingSub.style.display = '';
                        }
                    });
                }
                return;
            }
        }
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    let path = window.location.pathname;
    if (path.startsWith('/')) path = path.substring(1);
    path = path.replace(/\/index\.html$/, '');
    path = path.replace(/^index\.html$/, '');
    if (path.endsWith('/')) path = path.substring(0, path.length - 1);
    const p = path || 'home';

    const navLinks = document.querySelectorAll('.menu-item, .page_item');
    navLinks.forEach(item => item.classList.remove('current-menu-item', 'current_page_item'));
    
    const searchPath = p === 'home' ? 'index.html' : `${p}/index.html`;
    let exactMatch = document.querySelector(`.menu-item a[href="/${p}"], .page_item a[href="/${p}"]`);
    if (!exactMatch && p === 'home') exactMatch = document.querySelector(`.menu-item a[href="/"], .page_item a[href="/"]`);
    if (!exactMatch) exactMatch = document.querySelector(`.menu-item a[href="${searchPath}"], .page_item a[href="${searchPath}"]`);
    if (!exactMatch) exactMatch = document.querySelector(`.menu-item a[href="${p}"], .page_item a[href="${p}"]`);
    
    if (exactMatch) {
        const li = exactMatch.closest('li');
        if (li) li.classList.add('current-menu-item', 'current_page_item');
        const parentMenuItem = exactMatch.closest('.sub-menu')?.closest('li');
        if (parentMenuItem) parentMenuItem.classList.add('current-menu-item');
    }
  }, [categories]);

  
  const desktopCategoriesHtml = categories.map(cat => `
<li class="page_item page_item_has_children menu-item-has-children animated-submenu-block" role="none">
    <span class="ct-sub-menu-parent">
    <a href="/${cat.slug}" class="ct-menu-link" role="menuitem">${cat.name}</a>
    <button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
    </span>
    <ul class="sub-menu" role="menu">
        ${cat.products && cat.products.length > 0 ? cat.products.map(p => `<li class="page_item" role="none"><a href="/${p.slug}" class="ct-menu-link" role="menuitem">${p.name}</a></li>`).join('') : '<li class="page_item"><a href="#" class="ct-menu-link">Chưa có sản phẩm</a></li>'}
    </ul>
</li>
  `).join('');

  const mobileCategoriesHtml = categories.map(cat => `
<li class="page_item page_item_has_children menu-item-has-children" role="none">
    <span class="ct-sub-menu-parent">
        <a href="/${cat.slug}" class="ct-menu-link" role="menuitem">${cat.name}</a>
        <button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
    </span>
    <ul class="sub-menu" role="menu">
        ${cat.products && cat.products.length > 0 ? cat.products.map(p => `<li class="page_item" role="none"><a href="/${p.slug}" class="ct-menu-link" role="menuitem">${p.name}</a></li>`).join('') : '<li class="page_item"><a href="#" class="ct-menu-link">Chưa có sản phẩm</a></li>'}
    </ul>
</li>
  `).join('');


  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `

<a class="skip-link show-on-focus" href="#main">
	Skip to content</a>

<div class="ct-drawer-canvas" data-location="start">
		<div id="search-modal" class="ct-panel" data-behaviour="modal">
			<div class="ct-panel-actions">
				<button class="ct-toggle-close" data-type="type-1" aria-label="Close search modal">
					<svg class="ct-icon" width="12" height="12" viewBox="0 0 15 15"><path d="M1 15a1 1 0 01-.71-.29 1 1 0 010-1.41l5.8-5.8-5.8-5.8A1 1 0 011.7.29l5.8 5.8 5.8-5.8a1 1 0 011.41 1.41l-5.8 5.8 5.8 5.8a1 1 0 01-1.41 1.41l-5.8-5.8-5.8 5.8A1 1 0 011 15z"/></svg>				</button>
			</div>

			<div class="ct-panel-content">
				

<form role="search" method="get" class="ct-search-form"  action="/" aria-haspopup="listbox" data-live-results="thumbs">

	<input type="search" class="modal-field" placeholder="Tìm kiếm" value="" name="s" autocomplete="off" title="Tìm kiếm..." aria-label="Tìm kiếm...">

	<div class="ct-search-form-controls">
		
		<button type="submit" class="wp-element-button" data-button="icon" aria-label="Nút tìm kiếm">
			<svg class="ct-icon ct-search-button-content" aria-hidden="true" width="15" height="15" viewBox="0 0 15 15"><path d="M14.8,13.7L12,11c0.9-1.2,1.5-2.6,1.5-4.2c0-3.7-3-6.8-6.8-6.8S0,3,0,6.8s3,6.8,6.8,6.8c1.6,0,3.1-0.6,4.2-1.5l2.8,2.8c0.1,0.1,0.3,0.2,0.5,0.2s0.4-0.1,0.5-0.2C15.1,14.5,15.1,14,14.8,13.7z M1.5,6.8c0-2.9,2.4-5.2,5.2-5.2S12,3.9,12,6.8S9.6,12,6.8,12S1.5,9.6,1.5,6.8z"/></svg>
			<span class="ct-ajax-loader">
				<svg viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" opacity="0.2" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"/>

					<path d="m12,2c5.52,0,10,4.48,10,10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2">
						<animateTransform
							attributeName="transform"
							attributeType="XML"
							type="rotate"
							dur="0.6s"
							from="0 12 12"
							to="360 12 12"
							repeatCount="indefinite"
						/>
					</path>
				</svg>
			</span>
		</button>

					<input type="hidden" name="post_type" value="product">
		
		
		

		<input type="hidden" value="3f197beabb" class="ct-live-results-nonce">	</div>

			<div class="screen-reader-text" aria-live="polite" role="status">
			Không có kết quả		</div>
	
</form>


			</div>
		</div>

		<div id="offcanvas" class="ct-panel ct-header" data-behaviour="right-side"><div class="ct-panel-inner">
		<div class="ct-panel-actions">
			
			<button class="ct-toggle-close" data-type="type-1" aria-label="Close drawer">
				<svg class="ct-icon" width="12" height="12" viewBox="0 0 15 15"><path d="M1 15a1 1 0 01-.71-.29 1 1 0 010-1.41l5.8-5.8-5.8-5.8A1 1 0 011.7.29l5.8 5.8 5.8-5.8a1 1 0 011.41 1.41l-5.8 5.8 5.8 5.8a1 1 0 01-1.41 1.41l-5.8-5.8-5.8 5.8A1 1 0 011 15z"/></svg>
			</button>
		</div>
		<div class="ct-panel-content" data-device="desktop"><div class="ct-panel-content-inner"></div></div><div class="ct-panel-content" data-device="mobile"><div class="ct-panel-content-inner">
<a href="/" class="site-logo-container" data-id="offcanvas-logo" rel="home" itemprop="url">
			<img src="${getSetting('footer_logo', '/assets/uploads/2024/07/logo.png')}" alt="SB Lai Châu" style="height: 50px;" />	</a>


<nav
	class="mobile-menu has-submenu"
	data-id="mobile-menu" data-interaction="click" data-toggle-type="type-1" data-submenu-dots="yes"	aria-label="Off Canvas Menu">
	<ul><li class="page_item page-item-3917 page_item_has_children menu-item-has-children"><span class="ct-sub-menu-parent"><a href="/about-welfull" class="ct-menu-link">Về chúng tôi</a><button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/></svg></button></span><ul class="sub-menu" role="menu"><li class="page_item page-item-3917"><a href="/about-welfull" class="ct-menu-link">Về SB Lai Châu</a></li><li class="page_item page-item-5191"><a href="/about-weltrus" class="ct-menu-link">Về Weltrus</a></li></ul></li><li class="page_item page-item-2307 page_item_has_children menu-item-has-children"><span class="ct-sub-menu-parent"><a href="/news" class="ct-menu-link">Tin tức</a><button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/></svg></button></span><ul class="sub-menu" role="menu"><li class="page_item page-item-7796"><a href="/blog" class="ct-menu-link">Blog</a></li><li class="page_item page-item-7794"><a href="/news" class="ct-menu-link">Tin tức</a></li></ul></li><li class="page_item page-item-29"><a href="cart/index.html" class="ct-menu-link">Cart</a></li><li class="page_item page-item-1314"><a href="case/index.html" class="ct-menu-link">Case</a></li><li class="page_item page-item-30"><a href="checkout/index.html" class="ct-menu-link">Checkout</a></li><li class="page_item page-item-3683 page_item_has_children menu-item-has-children"><span class="ct-sub-menu-parent"><a href="ci-ess/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS</a><button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/></svg></button></span><ul class='sub-menu' role='menu'><li class="page_item page-item-3454"><a href="ci-ess/commercial-industrial-ess-105kw/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS 105kW-241kWh</a></li><li class="page_item page-item-3495"><a href="ci-ess/commercial-industrial-ess-105kw-261kwh/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS 105kW-261kWh</a></li><li class="page_item page-item-3519"><a href="ci-ess/commercial-industrial-ess-125kw-261kwh/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS 125kW-261kWh</a></li><li class="page_item page-item-3248"><a href="ci-ess/commercial-industrial-ess-50kw/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS 50kW-100kWh</a></li><li class="page_item page-item-3174"><a href="ci-ess/commercial-industrial-ess-5mwh/index.html" class="ct-menu-link">COMMERCIAL &amp; INDUSTRIAL ESS 5MWh</a></li></ul></li><li class="page_item page-item-7786 page_item_has_children menu-item-has-children">    <span class="ct-sub-menu-parent">        <a href="#" class="ct-menu-link" onclick="event.preventDefault(); this.nextElementSibling.click();">Về chúng tôi</a>        <button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false">            <svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15">                <path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/>            </svg>        </button>    </span>    <ul class='sub-menu' role='menu'>        <li class="page_item"><a href="/ve-sb-laichau" class="ct-menu-link">Về SB Lai Châu</a></li>        <li class="page_item"><a href="/ve-weltrus" class="ct-menu-link">Về Weltrus</a></li>    </ul></li><li class="page_item page-item-688"><a href="contact-us/index.html" class="ct-menu-link">Liên hệ với chúng tôi</a></li><li class="page_item page-item-5007"><a href="energy-storage-case-studies/index.html" class="ct-menu-link">Dự án Tiêu biểu</a></li><li class="page_item page-item-4995"><a href="energy-storage-solution/index.html" class="ct-menu-link">Giải pháp lưu trữ năng lượng</a></li><li class="page_item page-item-4853"><a href="epc-one-stop-solution/index.html" class="ct-menu-link">Giải pháp EPC trọn gói</a></li><li class="page_item page-item-4855"><a href="epc-test-page/index.html" class="ct-menu-link">EPC TEST PAGE</a></li><li class="page_item page-item-7744"><a href="fx-h-hybrid-inverter-series/index.html" class="ct-menu-link">FX-H Hybrid Inverter Series | FX-E Battery Storage</a></li><li class="page_item page-item-6061"><a href="100-120w-topcon-half-cut-solar-module/index.html" class="ct-menu-link">FX-M636H 100-120W TOPCon Half-Cut Solar Module</a></li><li class="page_item page-item-6091"><a href="100-120w-topcon-half-cut-solar-module-2/index.html" class="ct-menu-link">FX-M836 182mm Half-Cut Solar Module 130-150W</a></li><li class="page_item page-item-6100"><a href="300w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M836H 300W Mono 10BB Half-Cut Solar Module</a></li><li class="page_item page-item-6105"><a href="395-415w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M854H 395-415W Mono 10BB Half-Cut Solar Module</a></li><li class="page_item page-item-6109"><a href="445-465w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M860H 445-465W Mono 10BB Half-Cut Solar Module</a></li><li class="page_item page-item-6033"><a href="485-505w-topcon-half-cut-solar-module/index.html" class="ct-menu-link">FX-M866H (485-505W) TOPCon Half-Cut Solar Module Product Page</a></li><li class="page_item page-item-6113"><a href="485-505w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M866H 485-505W Mono 10BB Half-Cut Solar Module</a></li><li class="page_item page-item-6119"><a href="535-555w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M872H 535-555W Mono 10BB Half-Cut Solar Module</a></li><li class="page_item page-item-6128"><a href="200-230w-mono-12bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M939H 200-230W Mono 12BB Half-Cut Solar Module</a></li><li class="page_item page-item-6133"><a href="560-580w-mono-12bb-half-cut-solar-module/index.html" class="ct-menu-link">FX-M939H 560-580W Mono 12BB Half-Cut Solar Module</a></li><li class="page_item page-item-6145"><a href="half-cut-solar-module-585-610w/index.html" class="ct-menu-link">FX-M960H Mono 12BB Half-Cut Solar Module 585-610W</a></li><li class="page_item page-item-6151"><a href="half-cut-bifacial-double-glass-module-650-670w/index.html" class="ct-menu-link">FX-M966GF 12BB Half-Cut Bifacial Double Glass Module 650-670W</a></li><li class="page_item page-item-7442"><a href="fx-ms3000-portable-energy-storage-weltrus/index.html" class="ct-menu-link">FX-MS3000 All-in-One Micro ESS | 3014Wh Portable Energy Storage | WELTRUS</a></li><li class="page_item page-item-6139"><a href="half-cut-bifacial-double-glass-module-580-600w/index.html" class="ct-menu-link">FX-T872GF Topcon 16BB Half-Cut Bifacial Double Glass Module 580-600W</a></li><li class="page_item page-item-6124"><a href="680-700w-topcon-half-cut-bifacial-double-glass-module/index.html" class="ct-menu-link">FX-T966GF 680-700W Topcon Half-Cut Bifacial Double Glass Module</a></li><li class="page_item page-item-7523"><a href="fx10ft1044lp-2-all-in-one-liquid-cooled-ess-container-weltrus/index.html" class="ct-menu-link">FX10FT1044LP-2 All-in-one Liquid-cooled ESS Container | WELTRUS</a></li><li class="page_item page-item-7532"><a href="fx20ft2170lp-2-all-in-one-liquid-cooled-ess-container-weltrus/index.html" class="ct-menu-link">FX20FT2170LP-2 All-in-one Liquid-cooled ESS Container | WELTRUS</a></li><li class="page_item page-item-6624"><a href="grpu-new-solar-panel-frame/index.html" class="ct-menu-link">Glass Fiber Reinforced Polyurethane Solar Mounting &#038; Frame | WELTRUS</a></li><li class="page_item page-item-5402"><a href="global-representatives/index.html" class="ct-menu-link">Đại diện toàn cầu</a></li><li class="page_item page-item-309 current_page_item current-menu-item"><span class="ct-sub-menu-parent"><a href="/" aria-current="page" class="ct-menu-link">Trang chủ</a></li><li class="page_item page-item-7287"><a href="household-energy-storage-system/index.html" class="ct-menu-link">Household Energy Storage System</a></li><li class="page_item page-item-31"><a href="my-account/index.html" class="ct-menu-link">Tài khoản</a></li><li class="page_item page-item-4882"><a href="new-energy-solutions/index.html" class="ct-menu-link">NEW ENERGY GIẢI PHÁP</a></li><li class="page_item page-item-310"><a href="news/index.html" class="ct-menu-link">Thông tin</a></li><li class="page_item page-item-6234"><a href="politica-de-privacidade/index.html" class="ct-menu-link">Política de Privacidade</a></li><li class="page_item page-item-4281"><a href="power-distribution-industrial-control-series-product-catalog/index.html" class="ct-menu-link">Power Distribution Industrial Control Series Product Catalog</a></li><li class="page_item page-item-3"><a href="privacy-policy/index.html" class="ct-menu-link">Chính sách Bảo mật</a></li><li class="page_item page-item-5974"><a href="privacy-policy-2/index.html" class="ct-menu-link">PRIVACY POLICY</a></li>
<li class="page_item page-item-28 page_item_has_children menu-item-has-children">
    <span class="ct-sub-menu-parent">
        <a href="#" class="ct-menu-link">Sản phẩm</a>
        <button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/></svg></button>
    </span>
    <ul class='sub-menu' role='menu'>
        \${mobileCategoriesHtml}
    </ul>
</li><li class="page_item page-item-32"><a href="refund_returns/index.html" class="ct-menu-link">Chính sách Đổi trả</a></li><li class="page_item page-item-6182"><a href="solar-panel/index.html" class="ct-menu-link">Solar Panel</a></li><li class="page_item page-item-443 page_item_has_children menu-item-has-children"><span class="ct-sub-menu-parent"><a href="solution/index.html" class="ct-menu-link">Giải pháp</a><button class="ct-toggle-dropdown-mobile" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"/></svg></button></span><ul class='sub-menu' role='menu'><li class="page_item page-item-4960"><a href="solution/advanced-ground-mounted-solar-solutions/index.html" class="ct-menu-link">Advanced Ground-Mounted Solar Solutions</a></li><li class="page_item page-item-4570"><a href="solution/energy-storage-solution/index.html" class="ct-menu-link">Energy Storage Solution-XXX</a></li><li class="page_item page-item-4924"><a href="solution/floating-solar-solutions/index.html" class="ct-menu-link">Floating Solar Solutions</a></li><li class="page_item page-item-478"><a href="solution/new-energy-solutions/index.html" class="ct-menu-link">New energy solutions-x</a></li><li class="page_item page-item-480"><a href="solution/protective-device/index.html" class="ct-menu-link">Protective device-X</a></li><li class="page_item page-item-482"><a href="solution/solar-energy-solutions/index.html" class="ct-menu-link">Solar energy solutions-X</a></li><li class="page_item page-item-484"><a href="solution/household-solutions/index.html" class="ct-menu-link">EPC one-stop solution-x</a></li><li class="page_item page-item-486"><a href="solution/energy-storage-solutions/index.html" class="ct-menu-link">Energy storage solutions-XX</a></li></ul></li><li class="page_item page-item-1126"><a href="thanks/index.html" class="ct-menu-link">thanks</a></li><li class="page_item page-item-7503"><a href="tpv-pro-collector-solar-thermal-collector/index.html" class="ct-menu-link">TPV-Pro Collector &#8211; Solar Thermal Collector</a></li><li class="page_item page-item-7166"><a href="ul-certified-american-style-electrical-panel/index.html" class="ct-menu-link">UL-Certified American-Style Electrical Panel</a></li><li class="page_item page-item-5716"><a href="victoria-5-mwh-2-5-mw-bess-investment-analysis-report/index.html" class="ct-menu-link">Victoria 5 MWh / 2.5 MW BESS Investment Analysis Report</a></li><li class="page_item page-item-4081"><a href="welfull-group-power-project-qualifications-and-project-cases/index.html" class="ct-menu-link">Welfull Group Power Project Qualifications and Project Cases</a></li></ul></nav>


<div
	class="ct-header-cta"
	data-id="button">
	<a
		href="contact-us/index.html"
		class="ct-button-ghost"
		data-size="small" aria-label="Khám phá ngay" target="_blank" rel="noopener noreferrer">
		Khám phá ngay	</a>
</div>

<div
	class="ct-header-socials "
	data-id="socials">

	
		<div class="ct-social-box" data-color="custom" data-icon-size="custom" data-icons-type="simple" >
			
			
							
				<a href="https://www.facebook.com/Weltrus/" data-network="facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
					<span class="ct-icon-container">
					<svg
					width="20px"
					height="20px"
					viewBox="0 0 20 20"
					aria-hidden="true">
						<path d="M20,10.1c0-5.5-4.5-10-10-10S0,4.5,0,10.1c0,5,3.7,9.1,8.4,9.9v-7H5.9v-2.9h2.5V7.9C8.4,5.4,9.9,4,12.2,4c1.1,0,2.2,0.2,2.2,0.2v2.5h-1.3c-1.2,0-1.6,0.8-1.6,1.6v1.9h2.8L13.9,13h-2.3v7C16.3,19.2,20,15.1,20,10.1z"/>
					</svg>
				</span>				</a>
							
				<a href="https://x.com/weltrus_energy" data-network="twitter" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
					<span class="ct-icon-container">
					<svg
					width="20px"
					height="20px"
					viewBox="0 0 20 20"
					aria-hidden="true">
						<path d="M2.9 0C1.3 0 0 1.3 0 2.9v14.3C0 18.7 1.3 20 2.9 20h14.3c1.6 0 2.9-1.3 2.9-2.9V2.9C20 1.3 18.7 0 17.1 0H2.9zm13.2 3.8L11.5 9l5.5 7.2h-4.3l-3.3-4.4-3.8 4.4H3.4l5-5.7-5.3-6.7h4.4l3 4 3.5-4h2.1zM14.4 15 6.8 5H5.6l7.7 10h1.1z"/>
					</svg>
				</span>				</a>
							
				<a href="#" data-network="instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
					<span class="ct-icon-container">
					<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					aria-hidden="true">
						<circle cx="10" cy="10" r="3.3"/>
						<path d="M14.2,0H5.8C2.6,0,0,2.6,0,5.8v8.3C0,17.4,2.6,20,5.8,20h8.3c3.2,0,5.8-2.6,5.8-5.8V5.8C20,2.6,17.4,0,14.2,0zM10,15c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5S12.8,15,10,15z M15.8,5C15.4,5,15,4.6,15,4.2s0.4-0.8,0.8-0.8s0.8,0.4,0.8,0.8S16.3,5,15.8,5z"/>
					</svg>
				</span>				</a>
							
				<a href="#" data-network="discord" aria-label="Discord" target="_blank" rel="noopener noreferrer">
					<span class="ct-icon-container">
					<svg
					width="20px"
					height="20px"
					viewBox="0 0 20 20"
					aria-hidden="true">
						<path d="M17.2,4.2c-1.7-1.4-4.5-1.6-4.6-1.6c-0.2,0-0.4,0.1-0.4,0.3c0,0-0.1,0.1-0.1,0.4c1.1,0.2,2.6,0.6,3.8,1.4C16.1,4.7,16.2,5,16,5.2c-0.1,0.1-0.2,0.2-0.4,0.2c-0.1,0-0.2,0-0.2-0.1C13.3,4,10.5,3.9,10,3.9S6.7,4,4.6,5.3C4.4,5.5,4.1,5.4,4,5.2C3.8,5,3.9,4.7,4.1,4.6c1.3-0.8,2.7-1.2,3.8-1.4C7.9,3,7.8,2.9,7.8,2.9C7.7,2.7,7.5,2.6,7.4,2.6c-0.1,0-2.9,0.2-4.6,1.7C1.8,5.1,0,10.1,0,14.3c0,0.1,0,0.2,0.1,0.2c1.3,2.2,4.7,2.8,5.5,2.8c0,0,0,0,0,0c0.1,0,0.3-0.1,0.4-0.2l0.8-1.1c-2.1-0.6-3.2-1.5-3.3-1.6c-0.2-0.2-0.2-0.4,0-0.6c0.2-0.2,0.4-0.2,0.6,0c0,0,2,1.7,6,1.7c4,0,6-1.7,6-1.7c0.2-0.2,0.5-0.1,0.6,0c0.2,0.2,0.1,0.5,0,0.6c-0.1,0.1-1.2,1-3.3,1.6l0.8,1.1c0.1,0.1,0.2,0.2,0.4,0.2c0,0,0,0,0,0c0.8,0,4.2-0.6,5.5-2.8c0-0.1,0.1-0.1,0.1-0.2C20,10.1,18.2,5.1,17.2,4.2z M7.2,12.6c-0.8,0-1.5-0.8-1.5-1.7s0.7-1.7,1.5-1.7c0.8,0,1.5,0.8,1.5,1.7S8,12.6,7.2,12.6z M12.8,12.6c-0.8,0-1.5-0.8-1.5-1.7s0.7-1.7,1.5-1.7c0.8,0,1.5,0.8,1.5,1.7S13.7,12.6,12.8,12.6z"/>
					</svg>
				</span>				</a>
			
			
					</div>

	
</div>
<div data-id="widget-area-1"><div class="ct-widget widget_gtranslate"><div class="gtranslate_wrapper" id="gt-wrapper-22085269"></div></div></div></div></div></div></div>
	<a href="#main-container" class="ct-back-to-top ct-hidden-sm"
		data-shape="square"
		data-alignment="right"
		title="Go to top" aria-label="Go to top" hidden>

		<svg class="ct-icon" width="15" height="15" viewBox="0 0 20 20"><path d="M10,0L9.4,0.6L0.8,9.1l1.2,1.2l7.1-7.1V20h1.7V3.3l7.1,7.1l1.2-1.2l-8.5-8.5L10,0z"/></svg>	</a>

	</div>
` }} />
      <div id="main-container">
        <div dangerouslySetInnerHTML={{ __html: `
	<header id="header" class="ct-header" data-id="type-1" itemscope="" itemtype="https://schema.org/WPHeader"><div data-device="desktop"><div class="ct-sticky-container"><div data-sticky="slide"><div data-row="middle" data-column-set="2"><div class="ct-container"><div data-column="start" data-placements="1"><div data-items="primary">
<div	class="site-branding"
	data-id="logo"		itemscope="itemscope" itemtype="https://schema.org/Organization">

			<a href="/" class="site-logo-container" rel="home" itemprop="url" ><img src="${getSetting('footer_logo', '/assets/uploads/2024/07/logo.png')}" alt="SB Lai Châu" style="height: 50px;" /></a>	
	</div>


<nav
	id="header-menu-1"
	class="header-menu-1"
	data-id="menu" data-interaction="hover"	data-menu="type-2:center"
	data-dropdown="type-1:simple"			itemscope="" itemtype="https://schema.org/SiteNavigationElement"	aria-label="Header Menu">

	<ul id="menu-header-menu-xy" class="menu" role="menubar"><li id="menu-item-7754" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home page_item page-item-309 menu-item-7754" role="none"><a href="/" class="ct-menu-link" role="menuitem">Trang chủ</a></li>
<li id="menu-item-7764" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7764 animated-submenu-block" role="none"><a href="ci-ess/index.html" class="ct-menu-link" role="menuitem">CI ESS<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7765" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7765" role="none"><a href="fx-h-hybrid-inverter-series/index.html" class="ct-menu-link" role="menuitem">Residential storage and accessories</a></li>
	<li id="menu-item-7760" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7760" role="none"><a href="ci-ess/commercial-industrial-ess-50kw/index.html" class="ct-menu-link" role="menuitem">50kW/100kWh CI ESS100</a></li>
	<li id="menu-item-7757" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7757" role="none"><a href="ci-ess/commercial-industrial-ess-105kw/index.html" class="ct-menu-link" role="menuitem">105kW/241kWh CI ESS 241</a></li>
	<li id="menu-item-7758" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7758" role="none"><a href="ci-ess/commercial-industrial-ess-105kw-261kwh/index.html" class="ct-menu-link" role="menuitem">105kW/261kWh ESS 261</a></li>
	<li id="menu-item-7767" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7767" role="none"><a href="fx10ft1044lp-2-all-in-one-liquid-cooled-ess-container-weltrus/index.html" class="ct-menu-link" role="menuitem">All-in-one 10FT ESS Container</a></li>
	<li id="menu-item-7766" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7766" role="none"><a href="fx20ft2170lp-2-all-in-one-liquid-cooled-ess-container-weltrus/index.html" class="ct-menu-link" role="menuitem">All-in-one 20FT ESS Container</a></li>
	<li id="menu-item-7761" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7761" role="none"><a href="ci-ess/commercial-industrial-ess-5mwh/index.html" class="ct-menu-link" role="menuitem">5MWh CI ESS 5M</a></li>
	<li id="menu-item-7784" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7784" role="none"><a href="category/cases/vanadium-battery-energy-storage/index.html" class="ct-menu-link" role="menuitem">Vanadium battery energy storage</a></li>
</ul>
</li>
<li id="menu-item-7769" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7769 animated-submenu-block" role="none"><a href="products/index.html" class="ct-menu-link" role="menuitem">Sản phẩm<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7773" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7773" role="none"><a href="products/micro-inverter/index.html" class="ct-menu-link" role="menuitem">Biến tần vi mô</a></li>
	<li id="menu-item-7774" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7774" role="none"><a href="products/thermal-overload-relay/index.html" class="ct-menu-link" role="menuitem">Thermal Overload Relay</a></li>
	<li id="menu-item-7775" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7775" role="none"><a href="products/weltrus-ceramic-series-dc-contactors/index.html" class="ct-menu-link" role="menuitem">AC Contactors</a></li>
	<li id="menu-item-7771" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7771" role="none"><a href="products/high-voltage-dc-contactor/index.html" class="ct-menu-link" role="menuitem">High-Voltage DC Contactor</a></li>
	<li id="menu-item-7772" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7772" role="none"><a href="products/hydraulic-magnetic-circuit-breaker/index.html" class="ct-menu-link" role="menuitem">Hydraulic Magnetic Circuit-breaker</a></li>
	<li id="menu-item-7785" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-7785" role="none"><a href="grpu-new-solar-panel-frame/index.html" class="ct-menu-link" role="menuitem">GRPU Solar Panel Frame</a></li>
	<li id="menu-item-7776" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7776 animated-submenu-inline" role="none"><a href="solar-panel/index.html" class="ct-menu-link" role="menuitem">Solar Panels<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
	<ul class="sub-menu" role="menu">
		<li id="menu-item-7783" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7783" role="none"><a href="680-700w-topcon-half-cut-bifacial-double-glass-module/index.html" class="ct-menu-link" role="menuitem">680-700W Solar Panels</a></li>
		<li id="menu-item-7782" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7782" role="none"><a href="half-cut-bifacial-double-glass-module-650-670w/index.html" class="ct-menu-link" role="menuitem">650-670W Solar Panels</a></li>
		<li id="menu-item-7781" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7781" role="none"><a href="half-cut-solar-module-585-610w/index.html" class="ct-menu-link" role="menuitem">585-610W Solar Panels</a></li>
		<li id="menu-item-7780" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7780" role="none"><a href="560-580w-mono-12bb-half-cut-solar-module/index.html" class="ct-menu-link" role="menuitem">560-580W Solar Panels</a></li>
		<li id="menu-item-7778" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7778" role="none"><a href="535-555w-mono-10bb-half-cut-solar-module/index.html" class="ct-menu-link" role="menuitem">535-555W Solar Panels</a></li>
		<li id="menu-item-7777" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7777" role="none"><a href="485-505w-topcon-half-cut-solar-module/index.html" class="ct-menu-link" role="menuitem">485-505W Solar Panels</a></li>
	</ul>
</li>
</ul>
</li>
<li id="menu-item-7788" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7788 animated-submenu-block" role="none"><a href="new-energy-solutions/index.html" class="ct-menu-link" role="menuitem">GIẢI PHÁP<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7791" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7791" role="none"><a href="energy-storage-solution/index.html" class="ct-menu-link" role="menuitem">Giải pháp lưu trữ năng lượng</a></li>
	<li id="menu-item-7789" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7789" role="none"><a href="solution/floating-solar-solutions/index.html" class="ct-menu-link" role="menuitem">Floating Solar Solutions</a></li>
	<li id="menu-item-7790" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7790" role="none"><a href="epc-one-stop-solution/index.html" class="ct-menu-link" role="menuitem">Giải pháp EPC trọn gói</a></li>
	<li id="menu-item-7763" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7763" role="none"><a href="energy-storage-case-studies/index.html" class="ct-menu-link" role="menuitem">Dự án Tiêu biểu</a></li>
</ul>
</li>
<li id="menu-item-7792" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-has-children menu-item-7792 animated-submenu-block" role="none"><a href="/news" class="ct-menu-link" role="menuitem">Tin tức<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7796" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7796" role="none"><a href="/blog" class="ct-menu-link" role="menuitem">Blog</a></li>
	<li id="menu-item-7794" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7794" role="none"><a href="/news" class="ct-menu-link" role="menuitem">Tin tức</a></li>
</ul>
</li>
<li id="menu-item-7786" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7786 animated-submenu-block" role="none"><a href="#" class="ct-menu-link" role="menuitem" onclick="event.preventDefault(); this.nextElementSibling.click();">Về chúng tôi<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Mở menu con" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7756" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7756" role="none"><a href="/ve-sb-laichau" class="ct-menu-link" role="menuitem">Về SB Lai Châu</a></li>
	<li id="menu-item-7755" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7755" role="none"><a href="/ve-weltrus" class="ct-menu-link" role="menuitem">Về Weltrus</a></li>
</ul>
</li>
<li id="menu-item-7762" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7762" role="none"><a href="contact-us/index.html" class="ct-menu-link" role="menuitem">Liên hệ với chúng tôi</a></li>
</ul></nav>

</div></div><div data-column="end" data-placements="1"><div data-items="primary"><div data-id="widget-area-1"><div class="ct-widget widget_gtranslate"><div class="gtranslate_wrapper" id="gt-wrapper-61087833"></div></div></div>
<button
	data-toggle-panel="#search-modal"
	class="ct-header-search ct-toggle "
	aria-label="Tìm kiếm"
	data-label="left"
	data-id="search">

	<span class="ct-label ct-hidden-sm ct-hidden-md ct-hidden-lg">Tìm kiếm</span>

	<svg class="ct-icon" aria-hidden="true" width="15" height="15" viewBox="0 0 15 15"><path d="M14.8,13.7L12,11c0.9-1.2,1.5-2.6,1.5-4.2c0-3.7-3-6.8-6.8-6.8S0,3,0,6.8s3,6.8,6.8,6.8c1.6,0,3.1-0.6,4.2-1.5l2.8,2.8c0.1,0.1,0.3,0.2,0.5,0.2s0.4-0.1,0.5-0.2C15.1,14.5,15.1,14,14.8,13.7z M1.5,6.8c0-2.9,2.4-5.2,5.2-5.2S12,3.9,12,6.8S9.6,12,6.8,12S1.5,9.6,1.5,6.8z"/></svg></button>

<div
	class="ct-header-cta"
	data-id="button">
	<a
		href="contact-us/index.html"
		class="ct-button-ghost"
		data-size="small" aria-label="Khám phá ngay" target="_blank" rel="noopener noreferrer">
		Khám phá ngay	</a>
</div>
</div></div></div></div></div></div></div><div data-device="mobile"><div class="ct-sticky-container"><div data-sticky="slide"><div data-row="middle" data-column-set="2"><div class="ct-container"><div data-column="start" data-placements="1"><div data-items="primary">
<div	class="site-branding"
	data-id="logo"		>

			<a href="/" class="site-logo-container" rel="home" itemprop="url" ><img src="${getSetting('footer_logo', '/assets/uploads/2024/07/logo.png')}" alt="SB Lai Châu" style="height: 50px;" /></a>	
	</div>

</div></div><div data-column="end" data-placements="1"><div data-items="primary">
<div
	class="ct-header-text "
	data-id="text">
	<div class="entry-content">
		<p><div class="gtranslate_wrapper" id="gt-wrapper-61966555"></div></p>	</div>
</div>

<button
	data-toggle-panel="#offcanvas"
	class="ct-header-trigger ct-toggle "
	data-design="simple"
	data-label="right"
	aria-label="Menu"
	data-id="trigger">

	<span class="ct-label ct-hidden-sm ct-hidden-md ct-hidden-lg">Menu</span>

	<svg
		class="ct-icon"
		width="18" height="14" viewBox="0 0 18 14"
		aria-hidden="true"
		data-type="type-1">

		<rect y="0.00" width="18" height="1.7" rx="1"/>
		<rect y="6.15" width="18" height="1.7" rx="1"/>
		<rect y="12.3" width="18" height="1.7" rx="1"/>
	</svg>
</button>
</div></div></div></div></div></div></div></header>
	` }} />
        <main id="main" className="site-main">
          {children}
        </main>
      </div>
      <div dangerouslySetInnerHTML={{ __html: `

			<div data-elementor-type="footer" data-elementor-id="720" class="elementor elementor-720 elementor-location-footer" data-elementor-post-type="elementor_library">
			<div class="elementor-element elementor-element-1d710737 e-flex e-con-boxed e-con e-parent" data-id="1d710737" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
					<div class="e-con-inner">
		<div class="elementor-element elementor-element-44cba4a9 e-con-full elementor-hidden-mobile e-flex e-con e-child" data-id="44cba4a9" data-element_type="container">
				<div class="elementor-element elementor-element-4413fac3 elementor-widget elementor-widget-heading" data-id="4413fac3" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">LIÊN HỆ</h2>		</div>
				</div>
		<div class="elementor-element elementor-element-661caea6 e-flex e-con-boxed e-con e-child" data-id="661caea6" data-element_type="container">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-2941c58 elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="2941c58" data-element_type="widget" data-widget_type="icon-list.default">
				<div class="elementor-widget-container">
					<ul class="elementor-icon-list-items">
						<li class="elementor-icon-list-item">
							<a href="tel:${getSetting('footer_phone1', '0964.822.438')}">
								<span class="elementor-icon-list-text">${getSetting('footer_phone1', '0964.822.438')}</span>
							</a>
						</li>
						<li class="elementor-icon-list-item">
							<a href="tel:${getSetting('footer_phone2', '0986.072.277')}">
								<span class="elementor-icon-list-text">${getSetting('footer_phone2', '0986.072.277')}</span>
							</a>
						</li>
						<li class="elementor-icon-list-item">
							<a href="mailto:${getSetting('footer_email', 'support@sblaichau.vn')}">
								<span class="elementor-icon-list-text">${getSetting('footer_email', 'support@sblaichau.vn')}</span>
							</a>
						</li>
					</ul>
				</div>
				</div>
					</div>
				</div>
		<div class="elementor-element elementor-element-6f1f40b e-con-full elementor-hidden-mobile e-flex e-con e-child" data-id="6f1f40b" data-element_type="container">
				<div class="elementor-element elementor-element-2270e31f elementor-widget elementor-widget-heading" data-id="2270e31f" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">Sản phẩm</h2>		</div>
				</div>
				<div class="elementor-element elementor-element-5b1fcf08 elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="5b1fcf08" data-element_type="widget" data-widget_type="icon-list.default">
				<div class="elementor-widget-container">
			<link rel="stylesheet" href="wp-content/uploads/elementor/css/custom-widget-icon-list.minf9bb.css?ver=1759046054">		<ul class="elementor-icon-list-items">
							<li class="elementor-icon-list-item">
											<a href="products/micro-inverter/index.html" target="_blank">

											<span class="elementor-icon-list-text">Biến tần vi mô</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/pv-optimizer/index.html" target="_blank">

											<span class="elementor-icon-list-text">Bộ tối ưu hoá PV</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/thermal-overload-relay/index.html">

											<span class="elementor-icon-list-text">Rơ le nhiệt</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/high-voltage-dc-contactor/index.html" target="_blank">

											<span class="elementor-icon-list-text">Contactor DC cao thế</span>
											</a>
									</li>
						</ul>
				</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-1188efba e-con-full elementor-hidden-mobile e-flex e-con e-child" data-id="1188efba" data-element_type="container">
				<div class="elementor-element elementor-element-12316c80 elementor-widget elementor-widget-heading" data-id="12316c80" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">Giải pháp</h2>		</div>
				</div>
				<div class="elementor-element elementor-element-34caa6a3 elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="34caa6a3" data-element_type="widget" data-widget_type="icon-list.default">
				<div class="elementor-widget-container">
					<ul class="elementor-icon-list-items">
							<li class="elementor-icon-list-item">
											<a href="new-energy-solutions/index.html">

											<span class="elementor-icon-list-text">New Energy Solutions</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="solution/floating-solar-solutions/index.html">

											<span class="elementor-icon-list-text">Giải pháp điện mặt trời nổi</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="solution/advanced-ground-mounted-solar-solutions/index.html">

											<span class="elementor-icon-list-text">Giải pháp điện mặt trời mặt đất</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="epc-one-stop-solution/index.html">

											<span class="elementor-icon-list-text">Giải pháp EPC trọn gói</span>
											</a>
									</li>
						</ul>
				</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-5cdd0c7 e-con-full elementor-hidden-mobile e-flex e-con e-child" data-id="5cdd0c7" data-element_type="container">
				<div class="elementor-element elementor-element-7792930 elementor-widget elementor-widget-heading" data-id="7792930" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">CÔNG TY</h2>		</div>
				</div>
				<div class="elementor-element elementor-element-7119f2b elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="7119f2b" data-element_type="widget" data-widget_type="icon-list.default">
				<div class="elementor-widget-container">
					<ul class="elementor-icon-list-items">
							<li class="elementor-icon-list-item">
											<a href="contact-us/index.html">

											<span class="elementor-icon-list-text">Liên hệ với chúng tôi</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="/ve-sb-laichau"><span class="elementor-icon-list-text">Về chúng tôi</span></a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="global-representatives/index.html">

											<span class="elementor-icon-list-text">Đại diện toàn cầu</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="category/news/index.html">

											<span class="elementor-icon-list-text">Thông tin</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="blog/index.html">

											<span class="elementor-icon-list-text">Tin tứcs</span>
											</a>
									</li>
						</ul>
				</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-65dacf33 e-con-full e-flex e-con e-child" data-id="65dacf33" data-element_type="container">
				<div class="elementor-element elementor-element-11b99f17 elementor-widget__width-initial elementor-widget-tablet__width-initial elementor-widget elementor-widget-theme-site-logo elementor-widget-image" data-id="11b99f17" data-element_type="widget" data-widget_type="theme-site-logo.default">
				<div class="elementor-widget-container">
			<style>/*! elementor - v3.21.0 - 26-05-2024 */
.elementor-widget-image{text-align:center}.elementor-widget-image a{display:inline-block}.elementor-widget-image a img[src\$=".svg"]{width:48px}.elementor-widget-image img{vertical-align:middle;display:inline-block}</style>						<a href="/">
			<img src="${getSetting('footer_logo', '/assets/uploads/2024/07/logo.png')}" alt="SB Lai Châu" style="height: 50px;" />				</a>
									</div>
				</div>
				<div class="elementor-element elementor-element-7898fd7f elementor-widget__width-initial elementor-widget-tablet__width-initial elementor-widget elementor-widget-text-editor" data-id="7898fd7f" data-element_type="widget" data-widget_type="text-editor.default">
				<div class="elementor-widget-container">
							<p>Adhering to the development philosophy of market-oriented, customer-centric, and supply based, we continuously promote technological innovation and product upgrades, and provide global users with higher quality, efficient, and environmentally friendly clean energy solutions.</p>						</div>
				</div>
				<div class="elementor-element elementor-element-47232d9f e-grid-align-left elementor-shape-circle elementor-grid-0 elementor-widget elementor-widget-social-icons" data-id="47232d9f" data-element_type="widget" data-widget_type="social-icons.default">
				<div class="elementor-widget-container">
			<style>/*! elementor - v3.21.0 - 26-05-2024 */
.elementor-widget-social-icons.elementor-grid-0 .elementor-widget-container,.elementor-widget-social-icons.elementor-grid-mobile-0 .elementor-widget-container,.elementor-widget-social-icons.elementor-grid-tablet-0 .elementor-widget-container{line-height:1;font-size:0}.elementor-widget-social-icons:not(.elementor-grid-0):not(.elementor-grid-tablet-0):not(.elementor-grid-mobile-0) .elementor-grid{display:inline-grid}.elementor-widget-social-icons .elementor-grid{grid-column-gap:var(--grid-column-gap,5px);grid-row-gap:var(--grid-row-gap,5px);grid-template-columns:var(--grid-template-columns);justify-content:var(--justify-content,center);justify-items:var(--justify-content,center)}.elementor-icon.elementor-social-icon{font-size:var(--icon-size,25px);line-height:var(--icon-size,25px);width:calc(var(--icon-size, 25px) + 2 * var(--icon-padding, .5em));height:calc(var(--icon-size, 25px) + 2 * var(--icon-padding, .5em))}.elementor-social-icon{--e-social-icon-icon-color:#fff;display:inline-flex;background-color:#69727d;align-items:center;justify-content:center;text-align:center;cursor:pointer}.elementor-social-icon i{color:var(--e-social-icon-icon-color)}.elementor-social-icon svg{fill:var(--e-social-icon-icon-color)}.elementor-social-icon:last-child{margin:0}.elementor-social-icon:hover{opacity:.9;color:#fff}.elementor-social-icon-android{background-color:#a4c639}.elementor-social-icon-apple{background-color:#999}.elementor-social-icon-behance{background-color:#1769ff}.elementor-social-icon-bitbucket{background-color:#205081}.elementor-social-icon-codepen{background-color:#000}.elementor-social-icon-delicious{background-color:#39f}.elementor-social-icon-deviantart{background-color:#05cc47}.elementor-social-icon-digg{background-color:#005be2}.elementor-social-icon-dribbble{background-color:#ea4c89}.elementor-social-icon-elementor{background-color:#d30c5c}.elementor-social-icon-envelope{background-color:#ea4335}.elementor-social-icon-facebook,.elementor-social-icon-facebook-f{background-color:#3b5998}.elementor-social-icon-flickr{background-color:#0063dc}.elementor-social-icon-foursquare{background-color:#2d5be3}.elementor-social-icon-free-code-camp,.elementor-social-icon-freecodecamp{background-color:#006400}.elementor-social-icon-github{background-color:#333}.elementor-social-icon-gitlab{background-color:#e24329}.elementor-social-icon-globe{background-color:#69727d}.elementor-social-icon-google-plus,.elementor-social-icon-google-plus-g{background-color:#dd4b39}.elementor-social-icon-houzz{background-color:#7ac142}.elementor-social-icon-instagram{background-color:#262626}.elementor-social-icon-jsfiddle{background-color:#487aa2}.elementor-social-icon-link{background-color:#818a91}.elementor-social-icon-linkedin,.elementor-social-icon-linkedin-in{background-color:#0077b5}.elementor-social-icon-medium{background-color:#00ab6b}.elementor-social-icon-meetup{background-color:#ec1c40}.elementor-social-icon-mixcloud{background-color:#273a4b}.elementor-social-icon-odnoklassniki{background-color:#f4731c}.elementor-social-icon-pinterest{background-color:#bd081c}.elementor-social-icon-product-hunt{background-color:#da552f}.elementor-social-icon-reddit{background-color:#ff4500}.elementor-social-icon-rss{background-color:#f26522}.elementor-social-icon-shopping-cart{background-color:#4caf50}.elementor-social-icon-skype{background-color:#00aff0}.elementor-social-icon-slideshare{background-color:#0077b5}.elementor-social-icon-snapchat{background-color:#fffc00}.elementor-social-icon-soundcloud{background-color:#f80}.elementor-social-icon-spotify{background-color:#2ebd59}.elementor-social-icon-stack-overflow{background-color:#fe7a15}.elementor-social-icon-steam{background-color:#00adee}.elementor-social-icon-stumbleupon{background-color:#eb4924}.elementor-social-icon-telegram{background-color:#2ca5e0}.elementor-social-icon-threads{background-color:#000}.elementor-social-icon-thumb-tack{background-color:#1aa1d8}.elementor-social-icon-tripadvisor{background-color:#589442}.elementor-social-icon-tumblr{background-color:#35465c}.elementor-social-icon-twitch{background-color:#6441a5}.elementor-social-icon-twitter{background-color:#1da1f2}.elementor-social-icon-viber{background-color:#665cac}.elementor-social-icon-vimeo{background-color:#1ab7ea}.elementor-social-icon-vk{background-color:#45668e}.elementor-social-icon-weibo{background-color:#dd2430}.elementor-social-icon-weixin{background-color:#31a918}.elementor-social-icon-whatsapp{background-color:#25d366}.elementor-social-icon-wordpress{background-color:#21759b}.elementor-social-icon-x-twitter{background-color:#000}.elementor-social-icon-xing{background-color:#026466}.elementor-social-icon-yelp{background-color:#af0606}.elementor-social-icon-youtube{background-color:#cd201f}.elementor-social-icon-500px{background-color:#0099e5}.elementor-shape-rounded .elementor-icon.elementor-social-icon{border-radius:10%}.elementor-shape-circle .elementor-icon.elementor-social-icon{border-radius:50%}</style>		<div class="elementor-social-icons-wrapper elementor-grid">
							<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-linkedin elementor-repeater-item-b824f3b" href="https://www.linkedin.com/company/weltrus-new-energy/posts/?feedView=all" target="_blank">
						<span class="elementor-screen-only">Linkedin</span>
						<svg class="e-font-icon-svg e-fab-linkedin" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path></svg>					</a>
				</span>
							<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-facebook elementor-repeater-item-7ae9821" href="https://www.facebook.com/Weltrus/" target="_blank">
						<span class="elementor-screen-only">Facebook</span>
						<svg class="e-font-icon-svg e-fab-facebook" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>					</a>
				</span>
							<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-tiktok elementor-repeater-item-8e7c347" href="https://www.tiktok.com/@weltrus.energy" target="_blank">
						<span class="elementor-screen-only">Tiktok</span>
						<svg class="e-font-icon-svg e-fab-tiktok" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>					</a>
				</span>
							<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-x-twitter elementor-repeater-item-b2e000d" href="https://x.com/weltrus_energy" target="_blank">
						<span class="elementor-screen-only">X-twitter</span>
						<svg class="e-font-icon-svg e-fab-x-twitter" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>					</a>
				</span>
							<span class="elementor-grid-item">
					<a class="elementor-icon elementor-social-icon elementor-social-icon-youtube elementor-repeater-item-aae6124" href="https://www.youtube.com/@weltrus" target="_blank">
						<span class="elementor-screen-only">Youtube</span>
						<svg class="e-font-icon-svg e-fab-youtube" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>					</a>
				</span>
					</div>
				</div>
				</div>
				</div>
					</div>
				</div>
		<div class="elementor-element elementor-element-1c78199c e-flex e-con-boxed e-con e-parent" data-id="1c78199c" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-6cf71e6e elementor-widget elementor-widget-heading" data-id="6cf71e6e" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">Copyright © 2026 WELTRUS All rights reserved.</h2>		</div>
				</div>
					</div>
				</div>
		
<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;">
    <a href="https://zalo.me/84964822438" target="_blank" style="display:flex; align-items:center; justify-content:center; background:#0068ff; color:#fff; padding:10px 15px; border-radius:30px; text-decoration:none; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <span style="margin-right:8px; font-size:1.2em;">💬</span> Zalo: 0964.822.438
    </a>
    <a href="https://zalo.me/84986072277" target="_blank" style="display:flex; align-items:center; justify-content:center; background:#0068ff; color:#fff; padding:10px 15px; border-radius:30px; text-decoration:none; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <span style="margin-right:8px; font-size:1.2em;">💬</span> Zalo: 0986.072.277
    </a>
</div>

		</div>

<script data-cfasync="false" src="cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script type="speculationrules">
{"prefetch":[{"source":"document","where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":["/wp-*.php","/wp-admin/*","/wp-content/uploads/*","/wp-content/*","/wp-content/plugins/*","/wp-content/themes/blocksy-child/*","/wp-content/themes/blocksy/*","/*\\?(.+)"]}},{"not":{"selector_matches":"a[rel~=\"nofollow\"]"}},{"not":{"selector_matches":".no-prefetch, .no-prefetch a"}}]},"eagerness":"conservative"}]}
</script>

<!-- Consent Management powered by Complianz | GDPR/CCPA Cookie Consent https://wordpress.org/plugins/complianz-gdpr -->
<div id="cmplz-cookiebanner-container"><div class="cmplz-cookiebanner cmplz-hidden banner-1 banner-a optin cmplz-center cmplz-categories-type-view-preferences" aria-modal="true" data-nosnippet="true" role="dialog" aria-live="polite" aria-labelledby="cmplz-header-1-optin" aria-describedby="cmplz-message-1-optin">
	<div class="cmplz-header">
		<div class="cmplz-logo"></div>
		<div class="cmplz-title" id="cmplz-header-1-optin">Manage Consent</div>
		<div class="cmplz-close" tabindex="0" role="button" aria-label="Close dialog">
			<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>
		</div>
	</div>

	<div class="cmplz-divider cmplz-divider-header"></div>
	<div class="cmplz-body">
		<div class="cmplz-message" id="cmplz-message-1-optin">To provide the best experiences, we use technologies like cookies to store and/or access device information. Consenting to these technologies will allow us to process data such as browsing behavior or unique IDs on this site. Not consenting or withdrawing consent, may adversely affect certain features and functions.</div>
		<!-- categories start -->
		<div class="cmplz-categories">
			<details class="cmplz-category cmplz-functional" >
				<summary>
						<span class="cmplz-category-header">
							<span class="cmplz-category-title">Functional</span>
							<span class='cmplz-always-active'>
								<span class="cmplz-banner-checkbox">
									<input type="checkbox"
										   id="cmplz-functional-optin"
										   data-category="cmplz_functional"
										   class="cmplz-consent-checkbox cmplz-functional"
										   size="40"
										   value="1"/>
									<label class="cmplz-label" for="cmplz-functional-optin" tabindex="0"><span class="screen-reader-text">Functional</span></label>
								</span>
								Always active							</span>
							<span class="cmplz-icon cmplz-open">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"  height="18" ><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/></svg>
							</span>
						</span>
				</summary>
				<div class="cmplz-description">
					<span class="cmplz-description-functional">The technical storage or access is strictly necessary for the legitimate purpose of enabling the use of a specific service explicitly requested by the subscriber or user, or for the sole purpose of carrying out the transmission of a communication over an electronic communications network.</span>
				</div>
			</details>

			<details class="cmplz-category cmplz-preferences" >
				<summary>
						<span class="cmplz-category-header">
							<span class="cmplz-category-title">Preferences</span>
							<span class="cmplz-banner-checkbox">
								<input type="checkbox"
									   id="cmplz-preferences-optin"
									   data-category="cmplz_preferences"
									   class="cmplz-consent-checkbox cmplz-preferences"
									   size="40"
									   value="1"/>
								<label class="cmplz-label" for="cmplz-preferences-optin" tabindex="0"><span class="screen-reader-text">Preferences</span></label>
							</span>
							<span class="cmplz-icon cmplz-open">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"  height="18" ><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/></svg>
							</span>
						</span>
				</summary>
				<div class="cmplz-description">
					<span class="cmplz-description-preferences">The technical storage or access is necessary for the legitimate purpose of storing preferences that are not requested by the subscriber or user.</span>
				</div>
			</details>

			<details class="cmplz-category cmplz-statistics" >
				<summary>
						<span class="cmplz-category-header">
							<span class="cmplz-category-title">Statistics</span>
							<span class="cmplz-banner-checkbox">
								<input type="checkbox"
									   id="cmplz-statistics-optin"
									   data-category="cmplz_statistics"
									   class="cmplz-consent-checkbox cmplz-statistics"
									   size="40"
									   value="1"/>
								<label class="cmplz-label" for="cmplz-statistics-optin" tabindex="0"><span class="screen-reader-text">Statistics</span></label>
							</span>
							<span class="cmplz-icon cmplz-open">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"  height="18" ><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/></svg>
							</span>
						</span>
				</summary>
				<div class="cmplz-description">
					<span class="cmplz-description-statistics">The technical storage or access that is used exclusively for statistical purposes.</span>
					<span class="cmplz-description-statistics-anonymous">The technical storage or access that is used exclusively for anonymous statistical purposes. Without a subpoena, voluntary compliance on the part of your Internet Service Provider, or additional records from a third party, information stored or retrieved for this purpose alone cannot usually be used to identify you.</span>
				</div>
			</details>
			<details class="cmplz-category cmplz-marketing" >
				<summary>
						<span class="cmplz-category-header">
							<span class="cmplz-category-title">Marketing</span>
							<span class="cmplz-banner-checkbox">
								<input type="checkbox"
									   id="cmplz-marketing-optin"
									   data-category="cmplz_marketing"
									   class="cmplz-consent-checkbox cmplz-marketing"
									   size="40"
									   value="1"/>
								<label class="cmplz-label" for="cmplz-marketing-optin" tabindex="0"><span class="screen-reader-text">Marketing</span></label>
							</span>
							<span class="cmplz-icon cmplz-open">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"  height="18" ><path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/></svg>
							</span>
						</span>
				</summary>
				<div class="cmplz-description">
					<span class="cmplz-description-marketing">Việc lưu trữ hoặc truy cập kỹ thuật là cần thiết để tạo hồ sơ người dùng nhằm gửi quảng cáo hoặc theo dõi người dùng trên một trang web hoặc trên nhiều trang web cho các mục đích tiếp thị tương tự.</span>
				</div>
			</details>
		</div><!-- categories end -->
			</div>

	<div class="cmplz-links cmplz-information">
		<a class="cmplz-link cmplz-manage-options cookie-statement" href="#" data-relative_url="#cmplz-manage-consent-container">Quản lý tuỳ chọn</a>
		<a class="cmplz-link cmplz-manage-third-parties cookie-statement" href="#" data-relative_url="#cmplz-cookies-overview">Quản lý dịch vụ</a>
		<a class="cmplz-link cmplz-manage-vendors tcf cookie-statement" href="#" data-relative_url="#cmplz-tcf-wrapper">Quản lý {vendor_count} nhà cung cấp</a>
		<a class="cmplz-link cmplz-external cmplz-read-more-purposes tcf" target="_blank" rel="noopener noreferrer nofollow" href="https://cookiedatabase.org/tcf/purposes/">Đọc thêm về các mục đích này</a>
			</div>

	<div class="cmplz-divider cmplz-footer"></div>

	<div class="cmplz-buttons">
		<button class="cmplz-btn cmplz-accept">Đồng ý</button>
		<button class="cmplz-btn cmplz-deny">Từ chối</button>
		<button class="cmplz-btn cmplz-view-preferences">Xem tuỳ chọn</button>
		<button class="cmplz-btn cmplz-save-preferences">Lưu tuỳ chọn</button>
		<a class="cmplz-btn cmplz-manage-options tcf cookie-statement" href="#" data-relative_url="#cmplz-manage-consent-container">View preferences</a>
			</div>

	<div class="cmplz-links cmplz-documents">
		<a class="cmplz-link cookie-statement" href="#" data-relative_url="">{title}</a>
		<a class="cmplz-link privacy-statement" href="#" data-relative_url="">{title}</a>
		<a class="cmplz-link impressum" href="#" data-relative_url="">{title}</a>
			</div>

</div>
</div>
					<div id="cmplz-manage-consent" data-nosnippet="true"><button class="cmplz-btn cmplz-hidden cmplz-manage-consent manage-consent-1">Manage consent</button>

</div>		<div data-elementor-type="popup" data-elementor-id="658" class="elementor elementor-658 elementor-location-popup" data-elementor-settings="{&quot;a11y_navigation&quot;:&quot;yes&quot;,&quot;timing&quot;:[]}" data-elementor-post-type="elementor_library">
			<div class="elementor-element elementor-element-5a34908 e-flex e-con-boxed e-con e-parent" data-id="5a34908" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-f2b6c02 elementor-widget elementor-widget-heading" data-id="f2b6c02" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default">Trò chuyện với chuyên gia</h2>		</div>
				</div>
				<div class="elementor-element elementor-element-ca857c8 elementor-widget elementor-widget-text-editor" data-id="ca857c8" data-element_type="widget" data-widget_type="text-editor.default">
				<div class="elementor-widget-container">
							<ul><li>Chúng tôi sẽ liên hệ với bạn trong vòng 12 giờ</li><li>Đừng lo, chúng tôi cũng ghét thư rác!</li></ul>						</div>
				</div>
				<div class="elementor-element elementor-element-96b78af elementor-button-align-stretch elementor-widget elementor-widget-form" data-id="96b78af" data-element_type="widget" data-settings="{&quot;step_next_label&quot;:&quot;Next&quot;,&quot;step_previous_label&quot;:&quot;Previous&quot;,&quot;button_width&quot;:&quot;100&quot;,&quot;step_type&quot;:&quot;number_text&quot;,&quot;step_icon_shape&quot;:&quot;circle&quot;}" data-widget_type="form.default">
				<div class="elementor-widget-container">
			<style>/*! elementor-pro - v3.21.0 - 20-05-2024 */
.elementor-button.elementor-hidden,.elementor-hidden{display:none}.e-form__step{width:100%}.e-form__step:not(.elementor-hidden){display:flex;flex-wrap:wrap}.e-form__buttons{flex-wrap:wrap}.e-form__buttons,.e-form__buttons__wrapper{display:flex}.e-form__indicators{display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;font-size:13px;margin-bottom:var(--e-form-steps-indicators-spacing)}.e-form__indicators__indicator{display:flex;flex-direction:column;align-items:center;justify-content:center;flex-basis:0;padding:0 var(--e-form-steps-divider-gap)}.e-form__indicators__indicator__progress{width:100%;position:relative;background-color:var(--e-form-steps-indicator-progress-background-color);border-radius:var(--e-form-steps-indicator-progress-border-radius);overflow:hidden}.e-form__indicators__indicator__progress__meter{width:var(--e-form-steps-indicator-progress-meter-width,0);height:var(--e-form-steps-indicator-progress-height);line-height:var(--e-form-steps-indicator-progress-height);padding-right:15px;border-radius:var(--e-form-steps-indicator-progress-border-radius);background-color:var(--e-form-steps-indicator-progress-color);color:var(--e-form-steps-indicator-progress-meter-color);text-align:right;transition:width .1s linear}.e-form__indicators__indicator:first-child{padding-left:0}.e-form__indicators__indicator:last-child{padding-right:0}.e-form__indicators__indicator--state-inactive{color:var(--e-form-steps-indicator-inactive-primary-color,#c2cbd2)}.e-form__indicators__indicator--state-inactive [class*=indicator--shape-]:not(.e-form__indicators__indicator--shape-none){background-color:var(--e-form-steps-indicator-inactive-secondary-color,#fff)}.e-form__indicators__indicator--state-inactive object,.e-form__indicators__indicator--state-inactive svg{fill:var(--e-form-steps-indicator-inactive-primary-color,#c2cbd2)}.e-form__indicators__indicator--state-active{color:var(--e-form-steps-indicator-active-primary-color,#39b54a);border-color:var(--e-form-steps-indicator-active-secondary-color,#fff)}.e-form__indicators__indicator--state-active [class*=indicator--shape-]:not(.e-form__indicators__indicator--shape-none){background-color:var(--e-form-steps-indicator-active-secondary-color,#fff)}.e-form__indicators__indicator--state-active object,.e-form__indicators__indicator--state-active svg{fill:var(--e-form-steps-indicator-active-primary-color,#39b54a)}.e-form__indicators__indicator--state-completed{color:var(--e-form-steps-indicator-completed-secondary-color,#fff)}.e-form__indicators__indicator--state-completed [class*=indicator--shape-]:not(.e-form__indicators__indicator--shape-none){background-color:var(--e-form-steps-indicator-completed-primary-color,#39b54a)}.e-form__indicators__indicator--state-completed .e-form__indicators__indicator__label{color:var(--e-form-steps-indicator-completed-primary-color,#39b54a)}.e-form__indicators__indicator--state-completed .e-form__indicators__indicator--shape-none{color:var(--e-form-steps-indicator-completed-primary-color,#39b54a);background-color:initial}.e-form__indicators__indicator--state-completed object,.e-form__indicators__indicator--state-completed svg{fill:var(--e-form-steps-indicator-completed-secondary-color,#fff)}.e-form__indicators__indicator__icon{width:var(--e-form-steps-indicator-padding,30px);height:var(--e-form-steps-indicator-padding,30px);font-size:var(--e-form-steps-indicator-icon-size);border-width:1px;border-style:solid;display:flex;justify-content:center;align-items:center;overflow:hidden;margin-bottom:10px}.e-form__indicators__indicator__icon img,.e-form__indicators__indicator__icon object,.e-form__indicators__indicator__icon svg{width:var(--e-form-steps-indicator-icon-size);height:auto}.e-form__indicators__indicator__icon .e-font-icon-svg{height:1em}.e-form__indicators__indicator__number{width:var(--e-form-steps-indicator-padding,30px);height:var(--e-form-steps-indicator-padding,30px);border-width:1px;border-style:solid;display:flex;justify-content:center;align-items:center;margin-bottom:10px}.e-form__indicators__indicator--shape-circle{border-radius:50%}.e-form__indicators__indicator--shape-square{border-radius:0}.e-form__indicators__indicator--shape-rounded{border-radius:5px}.e-form__indicators__indicator--shape-none{border:0}.e-form__indicators__indicator__label{text-align:center}.e-form__indicators__indicator__separator{width:100%;height:var(--e-form-steps-divider-width);background-color:#babfc5}.e-form__indicators--type-icon,.e-form__indicators--type-icon_text,.e-form__indicators--type-number,.e-form__indicators--type-number_text{align-items:flex-start}.e-form__indicators--type-icon .e-form__indicators__indicator__separator,.e-form__indicators--type-icon_text .e-form__indicators__indicator__separator,.e-form__indicators--type-number .e-form__indicators__indicator__separator,.e-form__indicators--type-number_text .e-form__indicators__indicator__separator{margin-top:calc(var(--e-form-steps-indicator-padding, 30px) / 2 - var(--e-form-steps-divider-width, 1px) / 2)}.elementor-field-type-hidden{display:none}.elementor-field-type-html{display:inline-block}.elementor-field-type-tel input{direction:inherit}.elementor-login .elementor-lost-password,.elementor-login .elementor-remember-me{font-size:.85em}.elementor-field-type-recaptcha_v3 .elementor-field-label{display:none}.elementor-field-type-recaptcha_v3 .grecaptcha-badge{z-index:1}.elementor-button .elementor-form-spinner{order:3}.elementor-form .elementor-button>span{display:flex;justify-content:center;align-items:center}.elementor-form .elementor-button .elementor-button-text{white-space:normal;flex-grow:0}.elementor-form .elementor-button svg{height:auto}.elementor-form .elementor-button .e-font-icon-svg{height:1em}.elementor-select-wrapper .select-caret-down-wrapper{position:absolute;top:50%;transform:translateY(-50%);inset-inline-end:10px;pointer-events:none;font-size:11px}.elementor-select-wrapper .select-caret-down-wrapper svg{display:unset;width:1em;aspect-ratio:unset;fill:currentColor}.elementor-select-wrapper .select-caret-down-wrapper i{font-size:19px;line-height:2}.elementor-select-wrapper.remove-before:before{content:""!important}</style>		<form class="elementor-form" method="post" name="New Form">
			<input type="hidden" name="post_id" value="658"/>
			<input type="hidden" name="form_id" value="96b78af"/>
			<input type="hidden" name="referer_title" value="Weltrus Official Website-New Energy Solution Provider" />

							<input type="hidden" name="queried_id" value="309"/>
			
			<div class="elementor-form-fields-wrapper elementor-labels-above">
								<div class="elementor-field-type-text elementor-field-group elementor-column elementor-field-group-name elementor-col-100">
												<label for="form-field-name" class="elementor-field-label">
								Name							</label>
														<input size="1" type="text" name="form_fields[name]" id="form-field-name" class="elementor-field elementor-size-sm  elementor-field-textual">
											</div>
								<div class="elementor-field-type-tel elementor-field-group elementor-column elementor-field-group-field_280fad1 elementor-col-100 elementor-field-required elementor-mark-required">
												<label for="form-field-field_280fad1" class="elementor-field-label">
								Điện thoại/WhatsApp							</label>
								<input size="1" type="tel" name="form_fields[field_280fad1]" id="form-field-field_280fad1" class="elementor-field elementor-size-sm  elementor-field-textual" required="required" aria-required="true" pattern="[0-9()#&amp;+*-=.]+" title="Chỉ chấp nhận số và các ký tự điện thoại (#, -, *, v.v.).">

						</div>
								<div class="elementor-field-type-email elementor-field-group elementor-column elementor-field-group-email elementor-col-100 elementor-field-required elementor-mark-required">
												<label for="form-field-email" class="elementor-field-label">
								Email							</label>
														<input size="1" type="email" name="form_fields[email]" id="form-field-email" class="elementor-field elementor-size-sm  elementor-field-textual" required="required" aria-required="true">
											</div>
								<div class="elementor-field-type-textarea elementor-field-group elementor-column elementor-field-group-message elementor-col-100">
												<label for="form-field-message" class="elementor-field-label">
								Message							</label>
						<textarea class="elementor-field-textual elementor-field  elementor-size-sm" name="form_fields[message]" id="form-field-message" rows="4"></textarea>				</div>
								<div class="elementor-field-type-recaptcha_v3 elementor-field-group elementor-column elementor-field-group-field_cccd90a elementor-col-100 recaptcha_v3-bottomright">
					<div class="elementor-field" id="form-field-field_cccd90a"><div class="elementor-g-recaptcha" data-sitekey="6Leq0dYqAAAAAEbowdAQsO-JxMB2D_v-MQY_ZsaS" data-type="v3" data-action="Form" data-badge="bottomright" data-size="invisible"></div></div>				</div>
								<div class="elementor-field-group elementor-column elementor-field-type-submit elementor-col-100 e-form__buttons">
					<button type="submit" class="elementor-button elementor-size-sm">
						<span >
															<span class=" elementor-button-icon">
																										</span>
																						<span class="elementor-button-text">Gửi</span>
													</span>
					</button>
				</div>
			</div>
		</form>
				</div>
				</div>
					</div>
				</div>
				</div>
				<div data-elementor-type="popup" data-elementor-id="2422" class="elementor elementor-2422 elementor-location-popup" data-elementor-settings="{&quot;entrance_animation&quot;:&quot;fadeInRight&quot;,&quot;exit_animation&quot;:&quot;fadeInRight&quot;,&quot;entrance_animation_duration&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:1.2,&quot;sizes&quot;:[]},&quot;a11y_navigation&quot;:&quot;yes&quot;,&quot;timing&quot;:[]}" data-elementor-post-type="elementor_library">
			<div class="elementor-element elementor-element-5efa70e e-con-full e-flex e-con e-child" data-id="5efa70e" data-element_type="container">
				
    <div class="elementor-element elementor-vertical-align-middle elementor-widget elementor-widget-icon-box" data-element_type="widget" data-widget_type="icon-box.default">
    <div class="elementor-widget-container">
        <div class="elementor-icon-box-wrapper">
            <div class="elementor-icon-box-content">
                <h3 class="elementor-icon-box-title">
                    <span style="font-weight: 700; color: #000; font-size: 15px;">Điện thoại / Zalo</span>
                </h3>
                <p class="elementor-icon-box-description" style="margin-top: 5px; margin-bottom: 0px; border-bottom: 1px dotted #36b360; padding-bottom: 10px;">
                    <a href="tel:${getSetting('footer_phone1', '0964.822.438')}" style="color: #666; font-size: 14px; text-decoration: none;">${getSetting("footer_phone1", "0964.822.438")}</a>
                </p>
            </div>
        </div>
    </div>
    </div>

    <div class="elementor-element elementor-vertical-align-middle elementor-widget elementor-widget-icon-box" data-element_type="widget" data-widget_type="icon-box.default">
    <div class="elementor-widget-container">
        <div class="elementor-icon-box-wrapper">
            <div class="elementor-icon-box-content">
                <p class="elementor-icon-box-description" style="margin-top: 10px; margin-bottom: 0px;">
                    <a href="tel:${getSetting('footer_phone2', '0986.072.277')}" style="color: #666; font-size: 14px; text-decoration: none;">${getSetting("footer_phone2", "0986.072.277")}</a>
                </p>
            </div>
        </div>
    </div>
    </div>

				</div>
				</div>
					<script type='text/javascript'>
				const lazyloadRunObserver = () => {
					const lazyloadBackgrounds = document.querySelectorAll( \`.e-con.e-parent:not(.e-lazyloaded)\` );
					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
						entries.forEach( ( entry ) => {
							if ( entry.isIntersecting ) {
								let lazyloadBackground = entry.target;
								if( lazyloadBackground ) {
									lazyloadBackground.classList.add( 'e-lazyloaded' );
								}
								lazyloadBackgroundObserver.unobserve( entry.target );
							}
						});
					}, { rootMargin: '200px 0px 200px 0px' } );
					lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );
			</script>
				<script>
		(function () {
			var c = document.body.className;
			c = c.replace(/woocommerce-no-js/, 'woocommerce-js');
			document.body.className = c;
		})();
	</script>
	<script id="sourcebuster-js-js" src="wp-content/plugins/woocommerce/assets/js/sourcebuster/sourcebuster.mindd39.js?ver=8.9.5"></script>
<script id="wc-order-attribution-js-extra">
var wc_order_attribution = {"params":{"lifetime":1.0e-5,"session":30,"ajaxurl":"https://www.weltrus.com/wp-admin/admin-ajax.php","prefix":"wc_order_attribution_","allowTracking":true},"fields":{"source_type":"current.typ","referrer":"current_add.rf","utm_campaign":"current.cmp","utm_source":"current.src","utm_medium":"current.mdm","utm_content":"current.cnt","utm_id":"current.id","utm_term":"current.trm","session_entry":"current_add.ep","session_start_time":"current_add.fd","session_pages":"session.pgs","session_count":"udata.vst","user_agent":"udata.uag"}};
//# sourceURL=wc-order-attribution-js-extra
</script>
<script id="wc-order-attribution-js" src="wp-content/plugins/woocommerce/assets/js/frontend/order-attribution.mindd39.js?ver=8.9.5"></script>
<script id="elementskit-framework-js-frontend-js" src="wp-content/plugins/elementskit-lite/libs/framework/assets/js/frontend-scriptf6c4.js?ver=3.7.4"></script>
<script id="elementskit-framework-js-frontend-js-after">
		var elementskit = {
			resturl: 'https://www.weltrus.com/wp-json/elementskit/v1/',
		}

		
//# sourceURL=elementskit-framework-js-frontend-js-after
</script>
<script id="ekit-widget-scripts-js" src="wp-content/plugins/elementskit-lite/widgets/init/assets/js/widget-scriptsf6c4.js?ver=3.7.4"></script>
<script id="ct-scripts-js-extra">
var ct_localizations = {"ajax_url":"https://www.weltrus.com/wp-admin/admin-ajax.php","public_url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/","rest_url":"https://www.weltrus.com/wp-json/","search_url":"https://www.weltrus.com/search/QUERY_STRING/","show_more_text":"Xem thêm","more_text":"Thêm","search_live_results":"Search results","search_live_no_result":"Không có kết quả","search_live_one_result":"You got %s result. Please press Tab to select it.","search_live_many_results":"You got %s results. Please press Tab to select one.","expand_submenu":"Mở menu con","collapse_submenu":"Đóng menu con","dynamic_js_chunks":[{"id":"blocksy_pro_micro_popups","selector":".ct-popup","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/framework/premium/static/bundle/micro-popups.js?ver=2.0.50"},{"id":"blocksy_sticky_header","selector":"header [data-sticky]","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/sticky.js?ver=2.0.50"}],"dynamic_styles":{"lazy_load":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/non-critical-styles.min.css?ver=2.0.50","search_lazy":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/non-critical-search-styles.min.css?ver=2.0.50","back_to_top":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/back-to-top.min.css?ver=2.0.50"},"dynamic_styles_selectors":[{"selector":".ct-header-cart, #woo-cart-panel","url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/cart-header-element-lazy.min.css?ver=2.0.50"},{"selector":".flexy","url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/flexy.min.css?ver=2.0.50"},{"selector":".ct-media-container[data-media-id], .ct-dynamic-media[data-media-id]","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/framework/premium/static/bundle/video-lazy.min.css?ver=2.0.50"},{"selector":"#account-modal","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/header-account-modal-lazy.min.css?ver=2.0.50"},{"selector":".ct-header-account","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/header-account-dropdown-lazy.min.css?ver=2.0.50"}]};
//# sourceURL=ct-scripts-js-extra
</script>
<script id="ct-scripts-js" src="wp-content/themes/blocksy/static/bundle/main6ed1.js?ver=2.0.50"></script>
<script id="cmplz-cookiebanner-js-extra">
var complianz = {"prefix":"cmplz_","user_banner_id":"1","set_cookies":[],"block_ajax_content":"","banner_version":"30","version":"7.1.0","store_consent":"","do_not_track_enabled":"","consenttype":"optin","region":"au","geoip":"1","dismiss_timeout":"","disable_cookiebanner":"","soft_cookiewall":"","dismiss_on_scroll":"","cookie_expiry":"365","url":"https://www.weltrus.com/wp-json/complianz/v1/","locale":"lang=en&locale=en_US","set_cookies_on_root":"","cookie_domain":"","current_policy_id":"38","cookie_path":"/","categories":{"statistics":"statistics","marketing":"marketing"},"tcf_active":"","placeholdertext":"Click to accept {category} cookies and enable this content","css_file":"https://www.weltrus.com/wp-content/uploads/complianz/css/banner-{banner_id}-{type}.css?v=30","page_links":{"eu":{"cookie-statement":{"title":"","url":"https://www.weltrus.com/the-complete-guide-to-industrial-energy-storage-systems/"}}},"tm_categories":"","forceEnableStats":"","preview":"","clean_cookies":"","aria_label":"Click to accept {category} cookies and enable this content"};
//# sourceURL=cmplz-cookiebanner-js-extra
</script>
<script defer id="cmplz-cookiebanner-js" src="wp-content/plugins/complianz-gdpr-premium/cookiebanner/js/complianz.minc285.js?ver=1757408738"></script>
<script id="cmplz-cookiebanner-js-after">
		if ('undefined' != typeof window.jQuery) {
			jQuery(document).ready(function (\$) {
				\$(document).on('elementor/popup/show', () => {
					let rev_cats = cmplz_categories.reverse();
					for (let key in rev_cats) {
						if (rev_cats.hasOwnProperty(key)) {
							let category = cmplz_categories[key];
							if (cmplz_has_consent(category)) {
								document.querySelectorAll('[data-category="' + category + '"]').forEach(obj => {
									cmplz_remove_placeholder(obj);
								});
							}
						}
					}

					let services = cmplz_get_services_on_page();
					for (let key in services) {
						if (services.hasOwnProperty(key)) {
							let service = services[key].service;
							let category = services[key].category;
							if (cmplz_has_service_consent(service, category)) {
								document.querySelectorAll('[data-service="' + service + '"]').forEach(obj => {
									cmplz_remove_placeholder(obj);
								});
							}
						}
					}
				});
			});
		}
    
    
//# sourceURL=cmplz-cookiebanner-js-after
</script>
<script id="gt_widget_script_61087833-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['61087833'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-61087833","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_61087833-js-before
</script><script src="wp-content/plugins/gtranslate/js/dropdown8717.js?ver=7.0" data-no-optimize="1" data-no-minify="1" data-gt-orig-url="/" data-gt-orig-domain="www.weltrus.com" data-gt-widget-id="61087833" defer></script><script id="gt_widget_script_61966555-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['61966555'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-61966555","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_61966555-js-before
</script><script src="wp-content/plugins/gtranslate/js/dropdown8717.js?ver=7.0" data-no-optimize="1" data-no-minify="1" data-gt-orig-url="/" data-gt-orig-domain="www.weltrus.com" data-gt-widget-id="61966555" defer></script><script id="gt_widget_script_22085269-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['22085269'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-22085269","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_22085269-js-before
</script><script src="wp-content/plugins/gtranslate/js/dropdown8717.js?ver=7.0" data-no-optimize="1" data-no-minify="1" data-gt-orig-url="/" data-gt-orig-domain="www.weltrus.com" data-gt-widget-id="22085269" defer></script><script id="imagesloaded-js" src="wp-includes/js/imagesloaded.minbb93.js?ver=5.0.0"></script>
<script id="elementor-recaptcha_v3-api-js" src="../www.google.com/recaptcha/api717a.js?render=explicit&amp;ver=3.21.3"></script>
<script id="elementor-pro-webpack-runtime-js" src="wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min11d9.js?ver=3.21.3"></script>
<script id="elementor-webpack-runtime-js" src="wp-content/plugins/elementor/assets/js/webpack.runtime.min3cad.js?ver=3.21.8"></script>
<script id="elementor-frontend-modules-js" src="wp-content/plugins/elementor/assets/js/frontend-modules.min3cad.js?ver=3.21.8"></script>
<script id="wp-hooks-js" src="wp-includes/js/dist/hooks.min394d.js?ver=7496969728ca0f95732d"></script>
<script id="wp-i18n-js" src="wp-includes/js/dist/i18n.mineca5.js?ver=781d11515ad3d91786ec"></script>
<script id="wp-i18n-js-after">
wp.i18n.setLocaleData( { 'text direction\u0004ltr': [ 'ltr' ] } );
//# sourceURL=wp-i18n-js-after
</script>
<script id="elementor-pro-frontend-js-before">
var ElementorProFrontendConfig = {"ajaxurl":"https:\/\/www.weltrus.com\/wp-admin\/admin-ajax.php","nonce":"869328f765","urls":{"assets":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor-pro\/assets\/","rest":"https:\/\/www.weltrus.com\/wp-json\/"},"shareButtonsNetworks":{"facebook":{"title":"Facebook","has_counter":true},"twitter":{"title":"Twitter"},"linkedin":{"title":"LinkedIn","has_counter":true},"pinterest":{"title":"Pinterest","has_counter":true},"reddit":{"title":"Reddit","has_counter":true},"vk":{"title":"VK","has_counter":true},"odnoklassniki":{"title":"OK","has_counter":true},"tumblr":{"title":"Tumblr"},"digg":{"title":"Digg"},"skype":{"title":"Skype"},"stumbleupon":{"title":"StumbleUpon","has_counter":true},"mix":{"title":"Mix"},"telegram":{"title":"Telegram"},"pocket":{"title":"Pocket","has_counter":true},"xing":{"title":"XING","has_counter":true},"whatsapp":{"title":"WhatsApp"},"email":{"title":"Email"},"print":{"title":"Print"},"x-twitter":{"title":"X"},"threads":{"title":"Threads"}},"woocommerce":{"menu_cart":{"cart_page_url":"https:\/\/www.weltrus.com\/cart\/","checkout_page_url":"https:\/\/www.weltrus.com\/checkout\/","fragments_nonce":"f184844e0c"}},"facebook_sdk":{"lang":"en_US","app_id":""},"lottie":{"defaultAnimationUrl":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor-pro\/modules\/lottie\/assets\/animations\/default.json"}};
//# sourceURL=elementor-pro-frontend-js-before
</script>
<script id="elementor-pro-frontend-js" src="wp-content/plugins/elementor-pro/assets/js/frontend.min11d9.js?ver=3.21.3"></script>
<script id="elementor-waypoints-js" src="wp-content/plugins/elementor/assets/lib/waypoints/waypoints.min05da.js?ver=4.0.2"></script>
<script id="jquery-ui-core-js" src="wp-includes/js/jquery/ui/core.minb37e.js?ver=1.13.3"></script>
<script id="elementor-frontend-js-before">
var elementorFrontendConfig = {"environmentMode":{"edit":false,"wpPreview":false,"isScriptDebug":false},"i18n":{"shareOnFacebook":"Share on Facebook","shareOnTwitter":"Share on Twitter","pinIt":"Pin it","download":"Download","downloadImage":"Download image","fullscreen":"Fullscreen","zoom":"Zoom","share":"Share","playVideo":"Play Video","previous":"Previous","next":"Next","close":"Close","a11yCarouselWrapperAriaLabel":"Carousel | Horizontal scrolling: Arrow Left & Right","a11yCarouselPrevSlideMessage":"Previous slide","a11yCarouselNextSlideMessage":"Next slide","a11yCarouselFirstSlideMessage":"This is the first slide","a11yCarouselLastSlideMessage":"This is the last slide","a11yCarouselPaginationBulletMessage":"Go to slide"},"is_rtl":false,"breakpoints":{"xs":0,"sm":480,"md":690,"lg":1000,"xl":1440,"xxl":1600},"responsive":{"breakpoints":{"mobile":{"label":"Mobile Portrait","value":689,"default_value":767,"direction":"max","is_enabled":true},"mobile_extra":{"label":"Mobile Landscape","value":880,"default_value":880,"direction":"max","is_enabled":false},"tablet":{"label":"Tablet Portrait","value":999,"default_value":1024,"direction":"max","is_enabled":true},"tablet_extra":{"label":"Tablet Landscape","value":1200,"default_value":1200,"direction":"max","is_enabled":false},"laptop":{"label":"Laptop","value":1366,"default_value":1366,"direction":"max","is_enabled":false},"widescreen":{"label":"Widescreen","value":2400,"default_value":2400,"direction":"min","is_enabled":false}}},"version":"3.21.8","is_static":false,"experimentalFeatures":{"e_optimized_assets_loading":true,"e_optimized_css_loading":true,"e_font_icon_svg":true,"additional_custom_breakpoints":true,"container":true,"e_swiper_latest":true,"container_grid":true,"theme_builder_v2":true,"home_screen":true,"ai-layout":true,"landing-pages":true,"e_lazyload":true,"display-conditions":true,"form-submissions":true,"taxonomy-filter":true},"urls":{"assets":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor\/assets\/"},"swiperClass":"swiper","settings":{"page":[],"editorPreferences":[]},"kit":{"viewport_mobile":689,"viewport_tablet":999,"active_breakpoints":["viewport_mobile","viewport_tablet"],"global_image_lightbox":"yes","lightbox_enable_counter":"yes","lightbox_enable_fullscreen":"yes","lightbox_enable_zoom":"yes","lightbox_enable_share":"yes","lightbox_title_src":"title","lightbox_description_src":"description","woocommerce_notices_elements":[]},"post":{"id":309,"title":"Weltrus%20Official%20Website-New%20Energy%20Solution%20Provider","excerpt":"","featuredImage":false}};
//# sourceURL=elementor-frontend-js-before
</script>
<script id="elementor-frontend-js" src="wp-content/plugins/elementor/assets/js/frontend.min3cad.js?ver=3.21.8"></script>
<script id="pro-elements-handlers-js" src="wp-content/plugins/elementor-pro/assets/js/elements-handlers.min11d9.js?ver=3.21.3"></script>
<script id="animate-circle-js" src="wp-content/plugins/elementskit-lite/widgets/init/assets/js/animate-circle.minf6c4.js?ver=3.7.4"></script>
<script id="elementskit-elementor-js-extra">
var ekit_config = {"ajaxurl":"https://www.weltrus.com/wp-admin/admin-ajax.php","nonce":"113b89f8c0"};
//# sourceURL=elementskit-elementor-js-extra
</script>
<script id="elementskit-elementor-js" src="wp-content/plugins/elementskit-lite/widgets/init/assets/js/elementorf6c4.js?ver=3.7.4"></script>
<script id="e-sticky-js" src="wp-content/plugins/elementor-pro/assets/lib/sticky/jquery.sticky.min11d9.js?ver=3.21.3"></script>
<script id="underscore-js" src="wp-includes/js/underscore.min55e2.js?ver=1.13.8"></script>
<script id="wp-util-js-extra">
var _wpUtilSettings = {"ajax":{"url":"/wp-admin/admin-ajax.php"}};
//# sourceURL=wp-util-js-extra
</script>
<script id="wp-util-js" src="wp-includes/js/wp-util.min8717.js?ver=7.0"></script>
<script id="wpforms-elementor-js-extra">
var wpformsElementorVars = {"captcha_provider":"recaptcha","recaptcha_type":"v2"};
//# sourceURL=wpforms-elementor-js-extra
</script>
<script id="wpforms-elementor-js" src="wp-content/plugins/wpforms-lite/assets/js/integrations/elementor/frontend.min8cb8.js?ver=1.8.8.3"></script>
		<!-- This site uses the Google Analytics by MonsterInsights plugin v10.2.2 - Using Analytics tracking - https://www.monsterinsights.com/ -->
		<!-- Note: MonsterInsights is not currently configured on this site. The site owner needs to authenticate with Google Analytics in the MonsterInsights settings panel. -->
					<!-- No tracking code set -->
				<!-- / Google Analytics by MonsterInsights -->
		
<script defer src="https://static.cloudflareinsights.com/beacon.min.js/v4513226cdae34746b4dedf0b4dfa099e1781791509496" integrity="sha512-ZE9pZaUXND66v380QUtch/5sE9tPFh2zg45pR2PB0CVkCtOREv2AJKkSidISWkysEuQ0EH8faUU5du78bx87UQ==" data-cf-beacon='{"version":"2024.11.0","token":"a9bbfffb353847e181bf05856a237f15","r":1,"server_timing":{"name":{"cfCacheStatus":true,"cfEdge":true,"cfExtPri":true,"cfL4":true,"cfOrigin":true,"cfSpeedBrain":true},"location_startswith":null}}' crossorigin="anonymous"></script>
` }} />
    </>
  );
}
