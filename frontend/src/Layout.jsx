import React, { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [siteSettings, setSiteSettings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isZaloOpen, setIsZaloOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  
  useEffect(() => {
    const handleZalo = () => setIsZaloOpen(true);
    const handleContact = () => setIsContactOpen(true);
    window.addEventListener('openZaloPopup', handleZalo);
    window.addEventListener('openContactPopup', handleContact);

    if (!document.getElementById('force-mobile-menu-css')) {
      const style = document.createElement('style');
      style.id = 'force-mobile-menu-css';
      style.innerHTML = `
        @media (max-width: 767px) {
            /* ROOT CONTAINER: Fixed to bottom, flex row */
            body .elementor-element-75b9e865.elementor-element-75b9e865 {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                background: #fff !important;
                z-index: 999999 !important;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
                padding: 10px 0 !important;
                margin: 0 !important;
                transform: none !important;
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-around !important;
                align-items: stretch !important;
                flex-wrap: nowrap !important;
            }
            
            /* EACH OF THE 5 MENU ITEMS: Flex column (icon above text) */
            body .elementor-element-75b9e865 > .e-child {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 1 !important;
                width: auto !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 5px !important;
            }
            
            /* WIDGET WRAPPERS INSIDE MENU ITEMS: Reset widths */
            body .elementor-element-75b9e865 > .e-child > .elementor-widget {
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* ICON SIZING */
            body .elementor-element-75b9e865 .elementor-icon {
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            body .elementor-element-75b9e865 .elementor-icon svg {
                width: 20px !important;
                height: 20px !important;
                fill: #22a349 !important; /* Force green color to match reference */
            }
            
            /* TEXT SIZING */
            body .elementor-element-75b9e865 .elementor-heading-title {
                font-size: 11px !important;
                font-weight: 600 !important;
                margin: 0 !important;
                padding: 0 !important;
                text-align: center !important;
                line-height: 1.2 !important;
                color: #555 !important;
            }
        }
        @media (min-width: 768px) {
            body .elementor-element-75b9e865.elementor-element-75b9e865 {
                display: none !important;
            }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      window.removeEventListener('openZaloPopup', handleZalo);
      window.removeEventListener('openContactPopup', handleContact);
    };
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(console.error);

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  const getSetting = (key, defaultVal) => {
    const s = siteSettings.find(item => item.key === key);
    return s ? s.value : defaultVal;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const scripts = document.querySelectorAll('#root script');
      scripts.forEach(oldScript => {
        if (oldScript.getAttribute('data-executed')) return;
        const isElementor = oldScript.id === 'elementor-frontend-js' || oldScript.id === 'elementor-pro-frontend-js' || 
          (oldScript.src && oldScript.src.includes('frontend.min.js')) || 
          (oldScript.innerHTML && oldScript.innerHTML.includes('elementorFrontendConfig')) ||
          (oldScript.src && oldScript.src.includes('elementor'));
          
        if (isElementor) {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.src) newScript.src = oldScript.src;
            else newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            newScript.setAttribute('data-executed', 'true');
            if (oldScript.parentNode) {
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        }
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  
  const desktopCategoriesHtml = categories.map(cat => `
<li class="page_item page_item_has_children menu-item-has-children animated-submenu-block" role="none">
    <span class="ct-sub-menu-parent">
    <a href="/${cat.slug}" class="ct-menu-link" role="menuitem">${cat.name}</a>
    <button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
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
        <button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
    </span>
    <ul class="sub-menu" role="menu">
        ${cat.products && cat.products.length > 0 ? cat.products.map(p => `<li class="page_item" role="none"><a href="/${p.slug}" class="ct-menu-link" role="menuitem">${p.name}</a></li>`).join('') : '<li class="page_item"><a href="#" class="ct-menu-link">Chưa có sản phẩm</a></li>'}
    </ul>
</li>
  `).join('');


  let finalPreMain = `

<a class="skip-link show-on-focus" href="#main">
	Skip to content</a>

<div class="ct-drawer-canvas" data-location="start">
		<div id="search-modal" class="ct-panel" data-behaviour="modal">
			<div class="ct-panel-actions">
				<button class="ct-toggle-close" data-type="type-1" aria-label="Close search modal">
					<svg class="ct-icon" width="12" height="12" viewBox="0 0 15 15"><path d="M1 15a1 1 0 01-.71-.29 1 1 0 010-1.41l5.8-5.8-5.8-5.8A1 1 0 011.7.29l5.8 5.8 5.8-5.8a1 1 0 011.41 1.41l-5.8 5.8 5.8 5.8a1 1 0 01-1.41 1.41l-5.8-5.8-5.8 5.8A1 1 0 011 15z"/></svg>				</button>
			</div>

			<div class="ct-panel-content">
				

<form role="search" method="get" class="ct-search-form"  action="https://www.weltrus.com/" aria-haspopup="listbox" data-live-results="thumbs">

	<input type="search" class="modal-field" placeholder="Search" value="" name="s" autocomplete="off" title="Search for..." aria-label="Search for...">

	<div class="ct-search-form-controls">
		
		<button type="submit" class="wp-element-button" data-button="icon" aria-label="Search button">
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
			No results		</div>
	
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
<a href="index.html" class="site-logo-container" data-id="offcanvas-logo" rel="home" itemprop="url">
			<img src="/logo.svg" alt="S&B Lai Châu" style="height: 50px; width: 100px; object-fit: contain; display: block;" />	</a>


<nav
	class="mobile-menu has-submenu"
	data-id="mobile-menu" data-interaction="click" data-toggle-type="type-1" data-submenu-dots="yes"	aria-label="Off Canvas Menu">
	<ul><li id="menu-item-7754" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-309 current_page_item menu-item-7754" role="none"><a href="index.html" aria-current="page" class="ct-menu-link" role="menuitem">Trang chủ</a></li>
<li id="menu-item-7764" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7764 animated-submenu-block" role="none"><a href="ci-ess/index.html" class="ct-menu-link" role="menuitem">CI ESS</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
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
<li id="menu-item-7769" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7769 animated-submenu-block" role="none"><a href="products/index.html" class="ct-menu-link" role="menuitem">Sản phẩm</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7773" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7773" role="none"><a href="products/micro-inverter/index.html" class="ct-menu-link" role="menuitem">Micro Inverter</a></li>
	<li id="menu-item-7774" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7774" role="none"><a href="products/thermal-overload-relay/index.html" class="ct-menu-link" role="menuitem">Thermal Overload Relay</a></li>
	<li id="menu-item-7775" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7775" role="none"><a href="products/weltrus-ceramic-series-dc-contactors/index.html" class="ct-menu-link" role="menuitem">AC Contactors</a></li>
	<li id="menu-item-7771" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7771" role="none"><a href="products/high-voltage-dc-contactor/index.html" class="ct-menu-link" role="menuitem">High-Voltage DC Contactor</a></li>
	<li id="menu-item-7772" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7772" role="none"><a href="products/hydraulic-magnetic-circuit-breaker/index.html" class="ct-menu-link" role="menuitem">Hydraulic Magnetic Circuit-breaker</a></li>
	<li id="menu-item-7785" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-7785" role="none"><a href="grpu-new-solar-panel-frame/index.html" class="ct-menu-link" role="menuitem">GRPU Solar Panel Frame</a></li>
	<li id="menu-item-7776" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7776 animated-submenu-inline" role="none"><a href="solar-panel/index.html" class="ct-menu-link" role="menuitem">Solar Panels</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
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
<li id="menu-item-7788" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7788 animated-submenu-block" role="none"><a href="new-energy-solutions/index.html" class="ct-menu-link" role="menuitem">SOLUTIONS</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7791" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7791" role="none"><a href="energy-storage-solution/index.html" class="ct-menu-link" role="menuitem">energy storage solution</a></li>
	<li id="menu-item-7789" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7789" role="none"><a href="solution/floating-solar-solutions/index.html" class="ct-menu-link" role="menuitem">Floating Solar Solutions</a></li>
	<li id="menu-item-7790" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7790" role="none"><a href="epc-one-stop-solution/index.html" class="ct-menu-link" role="menuitem">EPC ONE-STOP SOLUTION</a></li>
	<li id="menu-item-7763" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7763" role="none"><a href="energy-storage-case-studies/index.html" class="ct-menu-link" role="menuitem">Energy Storage Case Studies</a></li>
</ul>
</li>
<li id="menu-item-7792" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-has-children menu-item-7792 animated-submenu-block" role="none"><a href="category/blog/index.html" class="ct-menu-link" role="menuitem">Info</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7796" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7796" role="none"><a href="blog/index.html" class="ct-menu-link" role="menuitem">Blog</a></li>
	<li id="menu-item-7794" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7794" role="none"><a href="category/news/index.html" class="ct-menu-link" role="menuitem">Thông tin</a></li>
	<li id="menu-item-7793" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7793" role="none"><a href="category/technology/index.html" class="ct-menu-link" role="menuitem">Technology</a></li>
	<li id="menu-item-7797" class="menu-item menu-item-type-post_type menu-item-object-post menu-item-7797" role="none"><a href="august-2024-brazil-pv-exhibition/index.html" class="ct-menu-link" role="menuitem">August 2024 Brazil PV Exhibition</a></li>
	<li id="menu-item-7798" class="menu-item menu-item-type-post_type menu-item-object-post menu-item-7798" role="none"><a href="welfull-2024-mid-year-work/index.html" class="ct-menu-link" role="menuitem">Welfull 2024 mid-year work conference was successfully held</a></li>
</ul>
</li>
<li id="menu-item-7786" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7786 animated-submenu-block" role="none"><a href="about-weltrus/index.html" class="ct-menu-link" role="menuitem">About Weltrus</a><button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7756" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7756" role="none"><a href="about-weltrus/index.html" class="ct-menu-link" role="menuitem">About Weltrus</a></li>
	<li id="menu-item-7755" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7755" role="none"><a href="about-welfull/index.html" class="ct-menu-link" role="menuitem">About Welfull</a></li>
</ul>
</li>
<li id="menu-item-7762" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7762" role="none"><a href="contact-us/index.html" class="ct-menu-link" role="menuitem">Liên hệ với chúng tôi</a></li>
</ul></nav>


<div
	class="ct-header-cta"
	data-id="button">
	<a
		href="contact-us/index.html"
		class="ct-button-ghost"
		data-size="small" aria-label="Explore Now" target="_blank" rel="noopener noreferrer">
		Explore Now	</a>
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
`;
  let finalHeader = `
	<header id="header" class="ct-header" data-id="type-1" itemscope="" itemtype="https://schema.org/WPHeader"><div data-device="desktop"><div class="ct-sticky-container"><div data-sticky="slide"><div data-row="middle" data-column-set="2"><div class="ct-container"><div data-column="start" data-placements="1"><div data-items="primary">
<div	class="site-branding"
	data-id="logo"		itemscope="itemscope" itemtype="https://schema.org/Organization">

			<a href="index.html" class="site-logo-container" rel="home" itemprop="url" ><img src="/logo.svg" alt="S&B Lai Châu" style="height: 50px; width: 100px; object-fit: contain; display: block;" /></a>	
	</div>


<nav
	id="header-menu-1"
	class="header-menu-1"
	data-id="menu" data-interaction="hover"	data-menu="type-2:center"
	data-dropdown="type-1:simple"			itemscope="" itemtype="https://schema.org/SiteNavigationElement"	aria-label="Header Menu">

	<ul id="menu-header-menu-xy" class="menu" role="menubar"><li id="menu-item-7754" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-309 current_page_item menu-item-7754" role="none"><a href="index.html" aria-current="page" class="ct-menu-link" role="menuitem">Trang chủ</a></li>
<li id="menu-item-7764" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7764 animated-submenu-block" role="none"><a href="ci-ess/index.html" class="ct-menu-link" role="menuitem">CI ESS<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
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
<li id="menu-item-7769" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7769 animated-submenu-block" role="none"><a href="products/index.html" class="ct-menu-link" role="menuitem">Sản phẩm<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7773" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7773" role="none"><a href="products/micro-inverter/index.html" class="ct-menu-link" role="menuitem">Micro Inverter</a></li>
	<li id="menu-item-7774" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7774" role="none"><a href="products/thermal-overload-relay/index.html" class="ct-menu-link" role="menuitem">Thermal Overload Relay</a></li>
	<li id="menu-item-7775" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7775" role="none"><a href="products/weltrus-ceramic-series-dc-contactors/index.html" class="ct-menu-link" role="menuitem">AC Contactors</a></li>
	<li id="menu-item-7771" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7771" role="none"><a href="products/high-voltage-dc-contactor/index.html" class="ct-menu-link" role="menuitem">High-Voltage DC Contactor</a></li>
	<li id="menu-item-7772" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7772" role="none"><a href="products/hydraulic-magnetic-circuit-breaker/index.html" class="ct-menu-link" role="menuitem">Hydraulic Magnetic Circuit-breaker</a></li>
	<li id="menu-item-7785" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-7785" role="none"><a href="grpu-new-solar-panel-frame/index.html" class="ct-menu-link" role="menuitem">GRPU Solar Panel Frame</a></li>
	<li id="menu-item-7776" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-7776 animated-submenu-inline" role="none"><a href="solar-panel/index.html" class="ct-menu-link" role="menuitem">Solar Panels<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
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
<li id="menu-item-7788" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7788 animated-submenu-block" role="none"><a href="new-energy-solutions/index.html" class="ct-menu-link" role="menuitem">SOLUTIONS<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7791" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7791" role="none"><a href="energy-storage-solution/index.html" class="ct-menu-link" role="menuitem">energy storage solution</a></li>
	<li id="menu-item-7789" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7789" role="none"><a href="solution/floating-solar-solutions/index.html" class="ct-menu-link" role="menuitem">Floating Solar Solutions</a></li>
	<li id="menu-item-7790" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7790" role="none"><a href="epc-one-stop-solution/index.html" class="ct-menu-link" role="menuitem">EPC ONE-STOP SOLUTION</a></li>
	<li id="menu-item-7763" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7763" role="none"><a href="energy-storage-case-studies/index.html" class="ct-menu-link" role="menuitem">Energy Storage Case Studies</a></li>
</ul>
</li>
<li id="menu-item-7792" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-has-children menu-item-7792 animated-submenu-block" role="none"><a href="category/blog/index.html" class="ct-menu-link" role="menuitem">Info<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7796" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7796" role="none"><a href="blog/index.html" class="ct-menu-link" role="menuitem">Blog</a></li>
	<li id="menu-item-7794" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7794" role="none"><a href="category/news/index.html" class="ct-menu-link" role="menuitem">Thông tin</a></li>
	<li id="menu-item-7793" class="menu-item menu-item-type-taxonomy menu-item-object-category menu-item-7793" role="none"><a href="category/technology/index.html" class="ct-menu-link" role="menuitem">Technology</a></li>
	<li id="menu-item-7797" class="menu-item menu-item-type-post_type menu-item-object-post menu-item-7797" role="none"><a href="august-2024-brazil-pv-exhibition/index.html" class="ct-menu-link" role="menuitem">August 2024 Brazil PV Exhibition</a></li>
	<li id="menu-item-7798" class="menu-item menu-item-type-post_type menu-item-object-post menu-item-7798" role="none"><a href="welfull-2024-mid-year-work/index.html" class="ct-menu-link" role="menuitem">Welfull 2024 mid-year work conference was successfully held</a></li>
</ul>
</li>
<li id="menu-item-7786" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-7786 animated-submenu-block" role="none"><a href="about-weltrus/index.html" class="ct-menu-link" role="menuitem">About Weltrus<span class="ct-toggle-dropdown-desktop"><svg class="ct-icon" width="8" height="8" viewBox="0 0 15 15"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"/></svg></span></a><button class="ct-toggle-dropdown-desktop-ghost" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"></button>
<ul class="sub-menu" role="menu">
	<li id="menu-item-7756" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7756" role="none"><a href="about-weltrus/index.html" class="ct-menu-link" role="menuitem">About Weltrus</a></li>
	<li id="menu-item-7755" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7755" role="none"><a href="about-welfull/index.html" class="ct-menu-link" role="menuitem">About Welfull</a></li>
</ul>
</li>
<li id="menu-item-7762" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-7762" role="none"><a href="contact-us/index.html" class="ct-menu-link" role="menuitem">Liên hệ với chúng tôi</a></li>
</ul></nav>

</div></div><div data-column="end" data-placements="1"><div data-items="primary"><div data-id="widget-area-1"><div class="ct-widget widget_gtranslate"><div class="gtranslate_wrapper" id="gt-wrapper-61087833"></div></div></div>
<button
	data-toggle-panel="#search-modal"
	class="ct-header-search ct-toggle "
	aria-label="Search"
	data-label="left"
	data-id="search">

	<span class="ct-label ct-hidden-sm ct-hidden-md ct-hidden-lg">Search</span>

	<svg class="ct-icon" aria-hidden="true" width="15" height="15" viewBox="0 0 15 15"><path d="M14.8,13.7L12,11c0.9-1.2,1.5-2.6,1.5-4.2c0-3.7-3-6.8-6.8-6.8S0,3,0,6.8s3,6.8,6.8,6.8c1.6,0,3.1-0.6,4.2-1.5l2.8,2.8c0.1,0.1,0.3,0.2,0.5,0.2s0.4-0.1,0.5-0.2C15.1,14.5,15.1,14,14.8,13.7z M1.5,6.8c0-2.9,2.4-5.2,5.2-5.2S12,3.9,12,6.8S9.6,12,6.8,12S1.5,9.6,1.5,6.8z"/></svg></button>

<div
	class="ct-header-cta"
	data-id="button">
	<a
		href="contact-us/index.html"
		class="ct-button-ghost"
		data-size="small" aria-label="Explore Now" target="_blank" rel="noopener noreferrer">
		Explore Now	</a>
</div>
</div></div></div></div></div></div></div><div data-device="mobile"><div class="ct-sticky-container"><div data-sticky="slide"><div data-row="middle" data-column-set="2"><div class="ct-container"><div data-column="start" data-placements="1"><div data-items="primary">
<div	class="site-branding"
	data-id="logo"		>

			<a href="index.html" class="site-logo-container" rel="home" itemprop="url" ><img src="/logo.svg" alt="S&B Lai Châu" style="height: 50px; width: 100px; object-fit: contain; display: block;" /></a>	
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
	`;
  let finalFooter = `

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
				<div class="elementor-element elementor-element-131549b elementor-vertical-align-middle elementor-vertical-align-middle elementor-widget elementor-widget-icon-box" data-id="131549b" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-box-wrapper">

			
						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="https://zalo.me/0964822438" target="_blank" >
							Zalo						</a>
					</h3>
				
									<p class="elementor-icon-box-description">
						0964.822.438					</p>
				
			</div>
			
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-2941c58 elementor-vertical-align-middle elementor-widget elementor-widget-icon-box" data-id="2941c58" data-element_type="widget" data-widget_type="icon-box.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-box-wrapper">

			
						<div class="elementor-icon-box-content">

									<h3 class="elementor-icon-box-title">
						<a href="mailto:info@sblaichau.vn">Email</a>
					</h3>
				
									<p class="elementor-icon-box-description">
						<a href="mailto:info@sblaichau.vn">info@sblaichau.vn</a>					</p>
				
			</div>
			
		</div>
				</div>
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
					<ul class="elementor-icon-list-items">
							<li class="elementor-icon-list-item">
											<a href="products/micro-inverter/index.html" target="_blank">

											<span class="elementor-icon-list-text">Micro Inverter</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/pv-optimizer/index.html" target="_blank">

											<span class="elementor-icon-list-text">PV-Optimizer</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/thermal-overload-relay/index.html">

											<span class="elementor-icon-list-text">Thermal-Overload-Relay</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="products/high-voltage-dc-contactor/index.html" target="_blank">

											<span class="elementor-icon-list-text">High Voltage DC Contactor</span>
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

											<span class="elementor-icon-list-text">Giải pháp năng lượng mới</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="solution/floating-solar-solutions/index.html">

											<span class="elementor-icon-list-text">Điện mặt trời nổi</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="solution/advanced-ground-mounted-solar-solutions/index.html">

											<span class="elementor-icon-list-text">Điện mặt trời mặt đất</span>
											</a>
									</li>
								<li class="elementor-icon-list-item">
											<a href="epc-one-stop-solution/index.html">

											<span class="elementor-icon-list-text">Giải pháp tổng thể EPC</span>
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
											<a href="about-weltrus/index.html" target="_blank">

											<span class="elementor-icon-list-text">Về chúng tôi</span>
											</a>
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

											<span class="elementor-icon-list-text">Blogs</span>
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
.elementor-widget-image{text-align:center}.elementor-widget-image a{display:inline-block}.elementor-widget-image a img[src\$=".svg"]{width:48px}.elementor-widget-image img{vertical-align:middle;display:inline-block}</style>						<a href="index.html">
			<img src="/logo.svg" alt="S&B Lai Châu" style="height: 50px; width: 100px; object-fit: contain; display: block;" />				</a>
									</div>
				</div>
				<div class="elementor-element elementor-element-7898fd7f elementor-widget__width-initial elementor-widget-tablet__width-initial elementor-widget elementor-widget-text-editor" data-id="7898fd7f" data-element_type="widget" data-widget_type="text-editor.default">
				<div class="elementor-widget-container">
							<p>Tuân thủ triết lý phát triển định hướng thị trường, lấy khách hàng làm trung tâm, chúng tôi không ngừng thúc đẩy đổi mới công nghệ và nâng cấp sản phẩm, cung cấp cho người dùng các giải pháp năng lượng sạch chất lượng cao, hiệu quả và thân thiện với môi trường.</p>						</div>
				</div>
				<div class="elementor-element elementor-element-47232d9f e-grid-align-left elementor-shape-circle elementor-grid-0 elementor-widget elementor-widget-social-icons" data-id="47232d9f" data-element_type="widget" data-widget_type="social-icons.default">
				<div class="elementor-widget-container">
			<style>/*! elementor - v3.21.0 - 26-05-2024 */
.elementor-widget-social-icons.elementor-grid-0 .elementor-widget-container,.elementor-widget-social-icons.elementor-grid-mobile-0 .elementor-widget-container,.elementor-widget-social-icons.elementor-grid-tablet-0 .elementor-widget-container{line-height:1;font-size:0}.elementor-widget-social-icons:not(.elementor-grid-0):not(.elementor-grid-tablet-0):not(.elementor-grid-mobile-0) .elementor-grid{display:inline-grid}.elementor-widget-social-icons .elementor-grid{grid-column-gap:var(--grid-column-gap,5px);grid-row-gap:var(--grid-row-gap,5px);grid-template-columns:var(--grid-template-columns);justify-content:var(--justify-content,center);justify-items:var(--justify-content,center)}.elementor-icon.elementor-social-icon{font-size:var(--icon-size,25px);line-height:var(--icon-size,25px);width:calc(var(--icon-size, 25px) + 2 * var(--icon-padding, .5em));height:calc(var(--icon-size, 25px) + 2 * var(--icon-padding, .5em))}.elementor-social-icon{--e-social-icon-icon-color:#fff;display:inline-flex;background-color:#69727d;align-items:center;justify-content:center;text-align:center;cursor:pointer}.elementor-social-icon i{color:var(--e-social-icon-icon-color)}.elementor-social-icon svg{fill:var(--e-social-icon-icon-color)}.elementor-social-icon:last-child{margin:0}.elementor-social-icon:hover{opacity:.9;color:#fff}.elementor-social-icon-android{background-color:#a4c639}.elementor-social-icon-apple{background-color:#999}.elementor-social-icon-behance{background-color:#1769ff}.elementor-social-icon-bitbucket{background-color:#205081}.elementor-social-icon-codepen{background-color:#000}.elementor-social-icon-delicious{background-color:#39f}.elementor-social-icon-deviantart{background-color:#05cc47}.elementor-social-icon-digg{background-color:#005be2}.elementor-social-icon-dribbble{background-color:#ea4c89}.elementor-social-icon-elementor{background-color:#d30c5c}.elementor-social-icon-envelope{background-color:#ea4335}.elementor-social-icon-facebook,.elementor-social-icon-facebook-f{background-color:#3b5998}.elementor-social-icon-flickr{background-color:#0063dc}.elementor-social-icon-foursquare{background-color:#2d5be3}.elementor-social-icon-free-code-camp,.elementor-social-icon-freecodecamp{background-color:#006400}.elementor-social-icon-github{background-color:#333}.elementor-social-icon-gitlab{background-color:#e24329}.elementor-social-icon-globe{background-color:#69727d}.elementor-social-icon-google-plus,.elementor-social-icon-google-plus-g{background-color:#dd4b39}.elementor-social-icon-houzz{background-color:#7ac142}.elementor-social-icon-instagram{background-color:#262626}.elementor-social-icon-jsfiddle{background-color:#487aa2}.elementor-social-icon-link{background-color:#818a91}.elementor-social-icon-linkedin,.elementor-social-icon-linkedin-in{background-color:#0077b5}.elementor-social-icon-medium{background-color:#00ab6b}.elementor-social-icon-meetup{background-color:#ec1c40}.elementor-social-icon-mixcloud{background-color:#273a4b}.elementor-social-icon-odnoklassniki{background-color:#f4731c}.elementor-social-icon-pinterest{background-color:#bd081c}.elementor-social-icon-product-hunt{background-color:#da552f}.elementor-social-icon-reddit{background-color:#ff4500}.elementor-social-icon-rss{background-color:#f26522}.elementor-social-icon-shopping-cart{background-color:#4caf50}.elementor-social-icon-skype{background-color:#00aff0}.elementor-social-icon-slideshare{background-color:#0077b5}.elementor-social-icon-snapchat{background-color:#fffc00}.elementor-social-icon-soundcloud{background-color:#f80}.elementor-social-icon-spotify{background-color:#2ebd59}.elementor-social-icon-stack-overflow{background-color:#fe7a15}.elementor-social-icon-steam{background-color:#00adee}.elementor-social-icon-stumbleupon{background-color:#eb4924}.elementor-social-icon-telegram{background-color:#2ca5e0}.elementor-social-icon-threads{background-color:#000}.elementor-social-icon-thumb-tack{background-color:#1aa1d8}.elementor-social-icon-tripadvisor{background-color:#589442}.elementor-social-icon-tumblr{background-color:#35465c}.elementor-social-icon-twitch{background-color:#6441a5}.elementor-social-icon-twitter{background-color:#1da1f2}.elementor-social-icon-viber{background-color:#665cac}.elementor-social-icon-vimeo{background-color:#1ab7ea}.elementor-social-icon-vk{background-color:#45668e}.elementor-social-icon-weibo{background-color:#dd2430}.elementor-social-icon-weixin{background-color:#31a918}.elementor-social-icon-Zalo{background-color:#25d366}.elementor-social-icon-wordpress{background-color:#21759b}.elementor-social-icon-x-twitter{background-color:#000}.elementor-social-icon-xing{background-color:#026466}.elementor-social-icon-yelp{background-color:#af0606}.elementor-social-icon-youtube{background-color:#cd201f}.elementor-social-icon-500px{background-color:#0099e5}.elementor-shape-rounded .elementor-icon.elementor-social-icon{border-radius:10%}.elementor-shape-circle .elementor-icon.elementor-social-icon{border-radius:50%}</style>		<div class="elementor-social-icons-wrapper elementor-grid">
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
			<h2 class="elementor-heading-title elementor-size-default">Bản quyền © 2026 S&B Lai Châu. Bảo lưu mọi quyền.</h2>		</div>
				</div>
					</div>
				</div>
		<div class="elementor-element elementor-element-703e5411 e-con-full e-flex e-con e-parent" data-id="703e5411" data-element_type="container">
		<div class="elementor-element elementor-element-38d72dc e-con-full e-flex e-con e-child" data-id="38d72dc" data-element_type="container" data-settings="{&quot;position&quot;:&quot;fixed&quot;}">
		<div class="elementor-element elementor-element-73b1d230 e-flex e-con-boxed e-con e-child" data-id="73b1d230" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-278e0172 elementor-view-framed elementor-shape-square elementor-widget elementor-widget-icon" data-id="278e0172" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openZaloPopup'));" target="_blank">
			<svg aria-hidden="true" class="e-font-icon-svg e-fab-Zalo" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-721dc762 elementor-widget elementor-widget-heading" data-id="721dc762" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openZaloPopup'));">Zalo</a></h2>		</div>
				</div>
					</div>
				</div>
		<div class="elementor-element elementor-element-767bd2b9 e-flex e-con-boxed e-con e-child" data-id="767bd2b9" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
					<div class="e-con-inner">
				<div class="elementor-element elementor-element-1eff31b7 elementor-view-framed elementor-shape-square elementor-widget elementor-widget-icon" data-id="1eff31b7" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));">
			<svg aria-hidden="true" class="e-font-icon-svg e-far-envelope" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-1786e4b4 elementor-widget elementor-widget-heading" data-id="1786e4b4" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));">Liên hệ</a></h2>		</div>
				</div>
					</div>
				</div>
				</div>
		

<div class="elementor-element elementor-element-75b9e865 e-con-full elementor-hidden-desktop elementor-hidden-tablet e-flex e-con e-child" data-id="75b9e865" data-element_type="container" data-settings="{&quot;background_background&quot;:&quot;classic&quot;,&quot;sticky&quot;:&quot;bottom&quot;,&quot;sticky_on&quot;:[&quot;mobile&quot;],&quot;sticky_offset&quot;:0,&quot;sticky_effects_offset&quot;:0}">
		<div class="elementor-element elementor-element-2628cf49 e-con-full e-flex e-con e-child" data-id="2628cf49" data-element_type="container">
				<div class="elementor-element elementor-element-2be38781 elementor-view-default elementor-widget elementor-widget-icon" data-id="2be38781" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="index.html">
			<svg aria-hidden="true" class="e-font-icon-svg e-fas-home" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg"><path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-31096646 elementor-widget elementor-widget-heading" data-id="31096646" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="index.html">Trang chủ</a></h2>		</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-1b5f543b e-con-full e-flex e-con e-child" data-id="1b5f543b" data-element_type="container">
				<div class="elementor-element elementor-element-132bee93 elementor-view-default elementor-widget elementor-widget-icon" data-id="132bee93" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="about-us/index.html">
			<svg aria-hidden="true" class="e-font-icon-svg e-fas-user-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-66e8a8ad elementor-widget elementor-widget-heading" data-id="66e8a8ad" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="about-us/index.html">About</a></h2>		</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-7d064941 e-con-full e-flex e-con e-child" data-id="7d064941" data-element_type="container">
				<div class="elementor-element elementor-element-7047eaaa elementor-view-default elementor-widget elementor-widget-icon" data-id="7047eaaa" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="products/index.html">
			<svg aria-hidden="true" class="e-font-icon-svg e-fas-th" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-454f11a3 elementor-widget elementor-widget-heading" data-id="454f11a3" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="products/index.html">Sản phẩm</a></h2>		</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-1cdda9ef e-con-full e-flex e-con e-child" data-id="1cdda9ef" data-element_type="container">
				<div class="elementor-element elementor-element-267d74cf elementor-view-default elementor-widget elementor-widget-icon" data-id="267d74cf" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));">
			<svg aria-hidden="true" class="e-font-icon-svg e-fas-envelope" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-16e7530b elementor-widget elementor-widget-heading" data-id="16e7530b" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));">Email</a></h2>		</div>
				</div>
				</div>
		<div class="elementor-element elementor-element-35a5028 e-con-full e-flex e-con e-child" data-id="35a5028" data-element_type="container">
				<div class="elementor-element elementor-element-1fb2d0b8 elementor-view-default elementor-widget elementor-widget-icon" data-id="1fb2d0b8" data-element_type="widget" data-widget_type="icon.default">
				<div class="elementor-widget-container">
					<div class="elementor-icon-wrapper">
			<a class="elementor-icon" href="tel:0964822438">
			<svg aria-hidden="true" class="e-font-icon-svg e-fas-phone-alt" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z"></path></svg>			</a>
		</div>
				</div>
				</div>
				<div class="elementor-element elementor-element-65abf447 elementor-widget elementor-widget-heading" data-id="65abf447" data-element_type="widget" data-widget_type="heading.default">
				<div class="elementor-widget-container">
			<h2 class="elementor-heading-title elementor-size-default"><a href="tel:0964822438">Phone</a></h2>		</div>
				</div>
				</div>
				</div>
				</div>
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
					<span class="cmplz-description-marketing">The technical storage or access is required to create user profiles to send advertising, or to track the user on a website or across several websites for similar marketing purposes.</span>
				</div>
			</details>
		</div><!-- categories end -->
			</div>

	<div class="cmplz-links cmplz-information">
		<a class="cmplz-link cmplz-manage-options cookie-statement" href="#" data-relative_url="#cmplz-manage-consent-container">Manage options</a>
		<a class="cmplz-link cmplz-manage-third-parties cookie-statement" href="#" data-relative_url="#cmplz-cookies-overview">Manage services</a>
		<a class="cmplz-link cmplz-manage-vendors tcf cookie-statement" href="#" data-relative_url="#cmplz-tcf-wrapper">Manage {vendor_count} vendors</a>
		<a class="cmplz-link cmplz-external cmplz-read-more-purposes tcf" target="_blank" rel="noopener noreferrer nofollow" href="https://cookiedatabase.org/tcf/purposes/">Read more about these purposes</a>
			</div>

	<div class="cmplz-divider cmplz-footer"></div>

	<div class="cmplz-buttons">
		<button class="cmplz-btn cmplz-accept">Accept</button>
		<button class="cmplz-btn cmplz-deny">Deny</button>
		<button class="cmplz-btn cmplz-view-preferences">View preferences</button>
		<button class="cmplz-btn cmplz-save-preferences">Save preferences</button>
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
	
<script id="wc-order-attribution-js-extra">
var wc_order_attribution = {"params":{"lifetime":1.0e-5,"session":30,"ajaxurl":"https://www.weltrus.com/wp-admin/admin-ajax.php","prefix":"wc_order_attribution_","allowTracking":true},"fields":{"source_type":"current.typ","referrer":"current_add.rf","utm_campaign":"current.cmp","utm_source":"current.src","utm_medium":"current.mdm","utm_content":"current.cnt","utm_id":"current.id","utm_term":"current.trm","session_entry":"current_add.ep","session_start_time":"current_add.fd","session_pages":"session.pgs","session_count":"udata.vst","user_agent":"udata.uag"}};
//# sourceURL=wc-order-attribution-js-extra
</script>


<script id="elementskit-framework-js-frontend-js-after">
		var elementskit = {
			resturl: 'https://www.weltrus.com/wp-json/elementskit/v1/',
		}

		
//# sourceURL=elementskit-framework-js-frontend-js-after
</script>

<script id="ct-scripts-js-extra">
var ct_localizations = {"ajax_url":"https://www.weltrus.com/wp-admin/admin-ajax.php","public_url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/","rest_url":"https://www.weltrus.com/wp-json/","search_url":"https://www.weltrus.com/search/QUERY_STRING/","show_more_text":"Show more","more_text":"More","search_live_results":"Search results","search_live_no_result":"No results","search_live_one_result":"You got %s result. Please press Tab to select it.","search_live_many_results":"You got %s results. Please press Tab to select one.","expand_submenu":"Expand dropdown menu","collapse_submenu":"Collapse dropdown menu","dynamic_js_chunks":[{"id":"blocksy_pro_micro_popups","selector":".ct-popup","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/framework/premium/static/bundle/micro-popups.js?ver=2.0.50"},{"id":"blocksy_sticky_header","selector":"header [data-sticky]","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/sticky.js?ver=2.0.50"}],"dynamic_styles":{"lazy_load":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/non-critical-styles.min.css?ver=2.0.50","search_lazy":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/non-critical-search-styles.min.css?ver=2.0.50","back_to_top":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/back-to-top.min.css?ver=2.0.50"},"dynamic_styles_selectors":[{"selector":".ct-header-cart, #woo-cart-panel","url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/cart-header-element-lazy.min.css?ver=2.0.50"},{"selector":".flexy","url":"https://www.weltrus.com/wp-content/themes/blocksy/static/bundle/flexy.min.css?ver=2.0.50"},{"selector":".ct-media-container[data-media-id], .ct-dynamic-media[data-media-id]","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/framework/premium/static/bundle/video-lazy.min.css?ver=2.0.50"},{"selector":"#account-modal","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/header-account-modal-lazy.min.css?ver=2.0.50"},{"selector":".ct-header-account","url":"https://www.weltrus.com/wp-content/plugins/blocksy-companion-pro/static/bundle/header-account-dropdown-lazy.min.css?ver=2.0.50"}]};
//# sourceURL=ct-scripts-js-extra
</script>
<script id="ct-scripts-js" src="wp-content/themes/blocksy/static/bundle/main6ed1.js?ver=2.0.50"></script>
<script id="cmplz-cookiebanner-js-extra">
var complianz = {"prefix":"cmplz_","user_banner_id":"1","set_cookies":[],"block_ajax_content":"","banner_version":"30","version":"7.1.0","store_consent":"","do_not_track_enabled":"","consenttype":"optin","region":"au","geoip":"1","dismiss_timeout":"","disable_cookiebanner":"","soft_cookiewall":"","dismiss_on_scroll":"","cookie_expiry":"365","url":"https://www.weltrus.com/wp-json/complianz/v1/","locale":"lang=en&locale=en_US","set_cookies_on_root":"","cookie_domain":"","current_policy_id":"38","cookie_path":"/","categories":{"statistics":"statistics","marketing":"marketing"},"tcf_active":"","placeholdertext":"Click to accept {category} cookies and enable this content","css_file":"https://www.weltrus.com/wp-content/uploads/complianz/css/banner-{banner_id}-{type}.css?v=30","page_links":{"eu":{"cookie-statement":{"title":"","url":"https://www.weltrus.com/the-complete-guide-to-industrial-energy-storage-systems/"}}},"tm_categories":"","forceEnableStats":"","preview":"","clean_cookies":"","aria_label":"Click to accept {category} cookies and enable this content"};
//# sourceURL=cmplz-cookiebanner-js-extra
</script>

<script id="cmplz-cookiebanner-js-after">
		if ('undefined' != typeof window.jQuery) {
			jQuery(document).ready(function (\$) {
				\$(document).on('elementor/popup/show', () => {
					if (typeof cmplz_categories !== 'undefined') {
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
					}
				});
			});
		}
    
    
//# sourceURL=cmplz-cookiebanner-js-after
</script>
<script id="gt_widget_script_61087833-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['61087833'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-61087833","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_61087833-js-before
</script><script id="gt_widget_script_61966555-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['61966555'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-61966555","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_61966555-js-before
</script><script id="gt_widget_script_22085269-js-before">
window.gtranslateSettings = /* document.write */ window.gtranslateSettings || {};window.gtranslateSettings['22085269'] = {"default_language":"en","languages":["sq","ar","zh-CN","cs","da","nl","en","fr","de","el","hi","hu","id","it","ja","pl","pt","ro","ru","sr","sk","es","sv","th","uk","vi"],"url_structure":"none","wrapper_selector":"#gt-wrapper-22085269","select_language_label":"Select Language","horizontal_position":"inline","flags_location":"\/wp-content\/plugins\/gtranslate\/flags\/"};
//# sourceURL=gt_widget_script_22085269-js-before
</script>
<script id="elementor-recaptcha_v3-api-js" src="../www.google.com/recaptcha/api717a.js?render=explicit&amp;ver=3.21.3"></script>





<script id="wp-i18n-js-after">
wp.i18n.setLocaleData( { 'text direction\u0004ltr': [ 'ltr' ] } );
//# sourceURL=wp-i18n-js-after
</script>
<script id="elementor-pro-frontend-js-before">
var ElementorProFrontendConfig = {"ajaxurl":"https:\/\/www.weltrus.com\/wp-admin\/admin-ajax.php","nonce":"869328f765","urls":{"assets":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor-pro\/assets\/","rest":"https:\/\/www.weltrus.com\/wp-json\/"},"shareButtonsNetworks":{"facebook":{"title":"Facebook","has_counter":true},"twitter":{"title":"Twitter"},"linkedin":{"title":"LinkedIn","has_counter":true},"pinterest":{"title":"Pinterest","has_counter":true},"reddit":{"title":"Reddit","has_counter":true},"vk":{"title":"VK","has_counter":true},"odnoklassniki":{"title":"OK","has_counter":true},"tumblr":{"title":"Tumblr"},"digg":{"title":"Digg"},"skype":{"title":"Skype"},"stumbleupon":{"title":"StumbleUpon","has_counter":true},"mix":{"title":"Mix"},"telegram":{"title":"Telegram"},"pocket":{"title":"Pocket","has_counter":true},"xing":{"title":"XING","has_counter":true},"Zalo":{"title":"Zalo"},"email":{"title":"Email"},"print":{"title":"Print"},"x-twitter":{"title":"X"},"threads":{"title":"Threads"}},"woocommerce":{"menu_cart":{"cart_page_url":"https:\/\/www.weltrus.com\/cart\/","checkout_page_url":"https:\/\/www.weltrus.com\/checkout\/","fragments_nonce":"f184844e0c"}},"facebook_sdk":{"lang":"en_US","app_id":""},"lottie":{"defaultAnimationUrl":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor-pro\/modules\/lottie\/assets\/animations\/default.json"}};
//# sourceURL=elementor-pro-frontend-js-before
</script>



<script id="elementor-frontend-js-before">
var elementorFrontendConfig = {"environmentMode":{"edit":false,"wpPreview":false,"isScriptDebug":false},"i18n":{"shareOnFacebook":"Share on Facebook","shareOnTwitter":"Share on Twitter","pinIt":"Pin it","download":"Download","downloadImage":"Download image","fullscreen":"Fullscreen","zoom":"Zoom","share":"Share","playVideo":"Play Video","previous":"Previous","next":"Next","close":"Close","a11yCarouselWrapperAriaLabel":"Carousel | Horizontal scrolling: Arrow Left & Right","a11yCarouselPrevSlideMessage":"Previous slide","a11yCarouselNextSlideMessage":"Next slide","a11yCarouselFirstSlideMessage":"This is the first slide","a11yCarouselLastSlideMessage":"This is the last slide","a11yCarouselPaginationBulletMessage":"Go to slide"},"is_rtl":false,"breakpoints":{"xs":0,"sm":480,"md":690,"lg":1000,"xl":1440,"xxl":1600},"responsive":{"breakpoints":{"mobile":{"label":"Mobile Portrait","value":689,"default_value":767,"direction":"max","is_enabled":true},"mobile_extra":{"label":"Mobile Landscape","value":880,"default_value":880,"direction":"max","is_enabled":false},"tablet":{"label":"Tablet Portrait","value":999,"default_value":1024,"direction":"max","is_enabled":true},"tablet_extra":{"label":"Tablet Landscape","value":1200,"default_value":1200,"direction":"max","is_enabled":false},"laptop":{"label":"Laptop","value":1366,"default_value":1366,"direction":"max","is_enabled":false},"widescreen":{"label":"Widescreen","value":2400,"default_value":2400,"direction":"min","is_enabled":false}}},"version":"3.21.8","is_static":false,"experimentalFeatures":{"e_optimized_assets_loading":true,"e_optimized_css_loading":true,"e_font_icon_svg":true,"additional_custom_breakpoints":true,"container":true,"e_swiper_latest":true,"container_grid":true,"theme_builder_v2":true,"home_screen":true,"ai-layout":true,"landing-pages":true,"e_lazyload":true,"display-conditions":true,"form-submissions":true,"taxonomy-filter":true},"urls":{"assets":"https:\/\/www.weltrus.com\/wp-content\/plugins\/elementor\/assets\/"},"swiperClass":"swiper","settings":{"page":[],"editorPreferences":[]},"kit":{"viewport_mobile":689,"viewport_tablet":999,"active_breakpoints":["viewport_mobile","viewport_tablet"],"global_image_lightbox":"yes","lightbox_enable_counter":"yes","lightbox_enable_fullscreen":"yes","lightbox_enable_zoom":"yes","lightbox_enable_share":"yes","lightbox_title_src":"title","lightbox_description_src":"description","woocommerce_notices_elements":[]},"post":{"id":309,"title":"Weltrus%20Official%20Website-New%20Energy%20Solution%20Provider","excerpt":"","featuredImage":false}};
//# sourceURL=elementor-frontend-js-before
</script>



<script id="elementskit-elementor-js-extra">
var ekit_config = {"ajaxurl":"https://www.weltrus.com/wp-admin/admin-ajax.php","nonce":"113b89f8c0"};
//# sourceURL=elementskit-elementor-js-extra
</script>



<script id="wp-util-js-extra">
var _wpUtilSettings = {"ajax":{"url":"/wp-admin/admin-ajax.php"}};
//# sourceURL=wp-util-js-extra
</script>

<script id="wpforms-elementor-js-extra">
var wpformsElementorVars = {"captcha_provider":"recaptcha","recaptcha_type":"v2"};
//# sourceURL=wpforms-elementor-js-extra
</script>

		<!-- This site uses the Google Analytics by MonsterInsights plugin v10.2.2 - Using Analytics tracking - https://www.monsterinsights.com/ -->
		<!-- Note: MonsterInsights is not currently configured on this site. The site owner needs to authenticate with Google Analytics in the MonsterInsights settings panel. -->
					<!-- No tracking code set -->
				<!-- / Google Analytics by MonsterInsights -->
		

`;

  // Aggressive string replacement for the entire Layout
  const forceReplace = (str) => {
      let res = str;
      res = res.replace(/[a-zA-Z0-9._%+-]+@weltrus\.com/gi, 'info@sblaichau.vn');
      res = res.replace(/support@sblaichau\.vn/gi, 'info@sblaichau.vn');
      res = res.replace(/sales@weltrus\.com/gi, 'info@sblaichau.vn');
      
      const phone = '0964.822.438';
      res = res.replace(/\+86\s*181\s*5738\s*8806|0573-86221160/gi, phone);
      res = res.replace(/\+?86[- ]*137[- ]*3550[- ]*2672/gi, phone);
      res = res.replace(/\+86-?13735502672/gi, phone);
      res = res.replace(/400\s*900\s*8856/gi, phone);
      res = res.replace(/400-096-8566/gi, phone);
      res = res.replace(/4000968566/gi, phone);
      res = res.replace(/0986\.072\.277/gi, phone);
      res = res.replace(/0986072277/gi, phone);
      
      res = res.replace(/Điện thoại\/WhatsApp/gi, 'Điện thoại/Zalo');
      res = res.replace(/WhatsApp/gi, 'Zalo');
      res = res.replace(/wa\.me\/\+?\d+/gi, 'zalo.me/0964822438');
      res = res.replace(/api\.whatsapp\.com\/send\?phone=\+?\d+/gi, 'zalo.me/0964822438');
      
      return res;
  };
  
  finalHeader = forceReplace(finalHeader);
  finalPreMain = forceReplace(finalPreMain);
  finalFooter = forceReplace(finalFooter);

  // Apply dynamic footer settings
  finalFooter = finalFooter.replace(/0964\.822\.438/g, getSetting('footer_phone1', '0964.822.438'));
  finalFooter = finalFooter.replace(/0986\.072\.277/g, getSetting('footer_phone2', '0986.072.277'));
  finalFooter = finalFooter.replace(/support@sblaichau\.vn/g, getSetting('footer_email', 'info@sblaichau.vn'));
  
  // Replace the SBLaiChau text h1 logo with actual image tag
  finalFooter = finalFooter.replace(/<picture>.*?<h1 style="color:#0068ff; margin:0; font-size:24px; font-weight:bold;">SBLaiCh[aÁÂ]u<\/h1><\/picture>/gi, '<img src="' + getSetting('footer_logo', '/assets/uploads/2024/07/logo.png') + '" alt="SB Lai Châu" style="max-height: 50px; width: auto;" />');
  finalFooter = finalFooter.replace(/<h1 style="color:#0068ff; margin:0; font-size:24px; font-weight:bold;">SBLaiCh[aÁÂ]u<\/h1>/gi, '<img src="' + getSetting('footer_logo', '/assets/uploads/2024/07/logo.png') + '" alt="SB Lai Châu" style="max-height: 50px; width: auto;" />');

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: finalPreMain }} />
      <div id="main-container">
        <div dangerouslySetInnerHTML={{ __html: finalHeader }} />
        <main id="main" className="site-main">
          {children}
        </main>
      </div>
      <div dangerouslySetInnerHTML={{ __html: finalFooter }} />
      {/* Native React Popups */}
      {isContactOpen && (
  <div id="elementor-popup-modal-658" className="dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-popup-modal" style={{ display: 'flex', zIndex: 9999 }}>
      <div className="dialog-widget-overlay dialog-lightbox-widget-overlay" onClick={() => setIsContactOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}></div>
      <div className="dialog-widget-content dialog-lightbox-widget-content animated">
          <div className="dialog-close-button dialog-lightbox-close-button" onClick={() => setIsContactOpen(false)} style={{ position: 'absolute', top: 15, right: 15, cursor: 'pointer', fontSize: 28, zIndex: 10, color: '#666' }}>&times;</div>
          <div className="elementor-658">
              <h2 className="elementor-heading-title" style={{ borderLeft: '5px solid #00b050', paddingLeft: 10, textAlign: 'left', marginBottom: 15 }}>Liên hệ chuyên gia</h2>
              <div className="elementor-widget-text-editor">
                  <ul style={{textAlign: 'left', paddingLeft: 20, marginBottom: 20}}><li>Chúng tôi sẽ liên hệ với bạn trong vòng 12 giờ</li><li>Đừng lo, chúng tôi cũng ghét thư rác!</li></ul>
              </div>
              <form className="elementor-form" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ gọi lại sớm nhất.'); setIsContactOpen(false); }}>
                  <div className="elementor-field-group" style={{ marginBottom: 15 }}>
                      <label className="elementor-field-label" style={{ display: 'block', fontWeight: 'bold', marginBottom: 5 }}>Tên</label>
                      <input type="text" className="elementor-field-textual" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                  </div>
                  <div className="elementor-field-group" style={{ marginBottom: 15 }}>
                      <label className="elementor-field-label" style={{ display: 'block', fontWeight: 'bold', marginBottom: 5 }}>Số điện thoại/Zalo *</label>
                      <input type="tel" className="elementor-field-textual" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                  </div>
                  <div className="elementor-field-group" style={{ marginBottom: 15 }}>
                      <label className="elementor-field-label" style={{ display: 'block', fontWeight: 'bold', marginBottom: 5 }}>Email *</label>
                      <input type="email" className="elementor-field-textual" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }} />
                  </div>
                  <div className="elementor-field-group" style={{ marginBottom: 15 }}>
                      <label className="elementor-field-label" style={{ display: 'block', fontWeight: 'bold', marginBottom: 5 }}>Lời nhắn</label>
                      <textarea className="elementor-field-textual" rows="4" style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}></textarea>
                  </div>
                  <div className="elementor-field-group">
                      <button type="submit" className="elementor-button" style={{ width: '100%', padding: '12px', backgroundColor: '#00b050', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Gửi</button>
                  </div>
              </form>
          </div>
      </div>
  </div>
)}

{isZaloOpen && (
  <div id="elementor-popup-modal-2422" className="dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-popup-modal" style={{ display: 'flex', zIndex: 9999 }}>
      <div className="dialog-widget-overlay dialog-lightbox-widget-overlay" onClick={() => setIsZaloOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}></div>
      <div className="dialog-widget-content dialog-lightbox-widget-content animated">
          <div className="dialog-close-button dialog-lightbox-close-button" onClick={() => setIsZaloOpen(false)} style={{ position: 'absolute', top: 15, right: 15, cursor: 'pointer', fontSize: 28, zIndex: 10, color: '#666' }}>&times;</div>
          <div className="elementor-2422">
              <div className="elementor-element-5efa70e">
                  <div className="elementor-widget-icon-box" style={{ textAlign: 'center', paddingTop: 20 }}>
                      <div className="elementor-icon-box-wrapper">
                          <div className="elementor-icon-box-icon" style={{ marginBottom: 15 }}>
                              <a href="https://zalo.me/0964822438" target="_blank" rel="noreferrer" className="elementor-icon">
                                  <svg aria-hidden="true" style={{ width: 60, height: 60, fill: '#0068ff' }} className="e-font-icon-svg e-fab-Zalo" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                              </a>
                          </div>
                          <div className="elementor-icon-box-content">
                              <h3 className="elementor-icon-box-title" style={{ margin: '10px 0' }}>
                                  <a href="https://zalo.me/0964822438" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#333', fontSize: 24, fontWeight: 'bold' }}>Zalo</a>
                              </h3>
                              <p className="elementor-icon-box-description" style={{ margin: 0 }}>
                                  <a href="https://zalo.me/0964822438" target="_blank" rel="noreferrer" style={{color: '#666', textDecoration: 'none', fontSize: 18}}>0964.822.438</a>
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
)}

    </>
  );
}