(function () {
  'use strict';

  // ===== Loading Screen =====
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingMinTime = 400;
  const loadingStart = Date.now();

  function hideLoadingScreen() {
    if (!loadingScreen) return;
    const elapsed = Date.now() - loadingStart;
    const delay = Math.max(0, loadingMinTime - elapsed);
    setTimeout(function () {
      loadingScreen.classList.add('loading-screen--done');
    }, delay);
  }
  if (document.readyState === 'complete') hideLoadingScreen();
  else window.addEventListener('load', hideLoadingScreen);

  // ===== Willkommens-Modal (RP / Disclaimer) =====
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeModalBtn = document.getElementById('welcomeModalBtn');

  function closeWelcomeModal() {
    if (!welcomeModal) return;
    welcomeModal.classList.add('welcome-modal--closed');
    document.body.style.overflow = '';
  }

  if (welcomeModal && welcomeModalBtn) {
    document.body.style.overflow = 'hidden';
    welcomeModalBtn.addEventListener('click', closeWelcomeModal);
  }

  // ===== Theme Toggle =====
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('mosaik-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mosaik-theme', next);
  });

  // ===== Cursor Glow =====
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ===== Nav scroll & mobile =====
  const nav = document.querySelector('.nav');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  });

  // ===== Back to Top & Sticky Termin (erst ab „Über uns“ einblenden, im Footer ausblenden) =====
  const backToTop = document.getElementById('backToTop');
  const stickyTerminBtn = document.getElementById('btnTerminAnfragen');
  const footerEl = document.querySelector('.footer');
  const aboutSection = document.getElementById('about');

  function updateScrollButtons() {
    const y = window.scrollY;
    if (backToTop) backToTop.classList.toggle('visible', y > 400);

    if (stickyTerminBtn) {
      const pastAbout = aboutSection ? aboutSection.getBoundingClientRect().bottom <= 0 : false;
      const inFooter = footerEl && footerEl.getBoundingClientRect().top < window.innerHeight - 80;
      stickyTerminBtn.classList.toggle('sticky-termin-btn--hidden', !pastAbout || inFooter);
    }
  }
  window.addEventListener('scroll', updateScrollButtons);
  updateScrollButtons();

  // ===== Galerie (ohne Server: gallery.json oder feste Liste) =====
  const GALLERY_FILES = [
    'Dani-ezgif.com-video-to-gif-converter.gif',
    'derheilendepapst_28_02_2026_01_49_40.gif',
    'fahrzeug1.png',
    'fahrzeug2.png',
    'familie.png',
    'image.png',
    'Jayden_1.png',
    'Mappe1.png',
    'Mappe2.png',
    'Mappe5.png',
    'paco_27_02_2026_21_26_35.png',
    'rbby8k_17_02_2026_04_53_09.png',
  ];
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryLoading = document.getElementById('galleryLoading');
  const revealOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, revealOptions);

  function categoryFromFilename(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('pfister') || n.includes('limi') || n.includes('auto') || n.includes('fahrzeug')) return 'automotive';
    if (n.includes('familie') || n.includes('family') || n.includes('familien')) return 'familien';
    if (n.endsWith('.gif') || n.includes('gif') || n.includes('animiert')) return 'animiert';
    if (n.includes('portrait') || n.includes('porträt') || n.includes('portrai')) return 'portrait';
    return 'portrait';
  }

  function renderGallery(files) {
    if (!galleryGrid || !Array.isArray(files) || files.length === 0) {
      if (galleryGrid) {
        if (galleryLoading) galleryLoading.remove();
        galleryGrid.innerHTML = '<p class="gallery-empty">Aktuell sind keine Bilder hinterlegt.</p>';
      }
      return;
    }
    if (galleryLoading) galleryLoading.remove();
    const zoomSvg = '<svg class="gallery-zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>';
    const fragment = document.createDocumentFragment();
    files.forEach((file, i) => {
      const category = categoryFromFilename(file);
      const base = file.replace(/\.[^.]+$/, '');
      const article = document.createElement('article');
      article.className = 'gallery-item scroll-reveal';
      article.setAttribute('data-category', category);
      article.style.setProperty('--delay', String(i));
      article.innerHTML =
        '<div class="gallery-inner" role="button" tabindex="0" aria-label="Bild vergrößern">' +
        '<img src="fotos/' + file.replace(/"/g, '&quot;') + '" alt="' + base.replace(/"/g, '&quot;') + '" loading="lazy">' +
        '<span class="gallery-overlay">' + zoomSvg + '<span class="gallery-overlay-text">Vergrößern</span></span>' +
        '</div>';
      fragment.appendChild(article);
    });
    galleryGrid.appendChild(fragment);
    galleryGrid.querySelectorAll('.scroll-reveal').forEach((el) => revealObserver.observe(el));
    galleryGrid.querySelectorAll('.gallery-inner img').forEach((img) => {
      if (img.complete) img.classList.add('loaded');
      else img.addEventListener('load', () => img.classList.add('loaded'));
    });
  }

  async function loadGallery() {
    if (!galleryGrid) return;
    try {
      if (window.location.protocol === 'file:') {
        renderGallery(GALLERY_FILES);
        return;
      }
      const res = await fetch('gallery.json');
      if (res.ok) {
        const data = await res.json();
        const files = (data && data.files) ? data.files : GALLERY_FILES;
        renderGallery(files);
      } else {
        renderGallery(GALLERY_FILES);
      }
    } catch (e) {
      renderGallery(GALLERY_FILES);
    }
  }

  loadGallery();

  // ===== Galerie-Filter (live: alle aktuellen Items) =====
  const galleryFilters = document.querySelectorAll('.gallery-filter');
  galleryFilters?.forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryFilters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.gallery-item[data-category]').forEach((item) => {
        const cat = item.getAttribute('data-category') || '';
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('gallery-item--hidden', !show);
      });
    });
  });

  navBurger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    navBurger.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      navBurger?.classList.remove('active');
    });
  });

  // ===== Scroll Reveal (nutzt revealObserver aus Galerie-Block) =====
  document.querySelectorAll('.scroll-reveal').forEach((el) => revealObserver.observe(el));

  // ===== Counter Animation (Stats) =====
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const num = entry.target;
      const target = parseInt(num.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();
      const suffix = num.dataset.suffix || '';
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        num.textContent = Math.round(target * easeOut) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else num.textContent = target + suffix;
      }
      requestAnimationFrame(update);
      counterObserver.unobserve(num);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach((el) => counterObserver.observe(el));

  // ===== Parallax Hero Shapes =====
  const hero = document.querySelector('.hero');
  const heroShapes = document.querySelectorAll('.hero-shape');
  if (hero && heroShapes.length) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroShapes.forEach((shape, i) => {
        const factor = (i + 1) * 0.5;
        shape.style.transform = `translateY(${scrolled * 0.15 * factor}px)`;
      });
    });
  }

  // ===== Parallax site-weit (leichte Bewegung über ganze Seite) =====
  const siteParallax = document.querySelectorAll('.parallax-shape');
  if (siteParallax.length) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const rates = [0.12, 0.08, 0.18];
      siteParallax.forEach((el, i) => {
        const rate = rates[i] || 0.1;
        el.style.transform = `translateY(${scrolled * rate}px)`;
      });
    });
  }

  // ===== Gallery Lightbox (Modal zum Vergrößern) =====
  const lightbox = document.getElementById('lightbox');
  const lightboxFly = document.getElementById('lightboxFly');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let lightboxThumb = null;

  function setFlyRect(rect, withTransform) {
    if (!lightboxFly) return;
    lightboxFly.style.setProperty('left', rect.left + 'px');
    lightboxFly.style.setProperty('top', rect.top + 'px');
    lightboxFly.style.setProperty('width', rect.width + 'px');
    lightboxFly.style.setProperty('height', rect.height + 'px');
    if (withTransform !== false) lightboxFly.style.setProperty('transform', 'none');
    else lightboxFly.style.removeProperty('transform');
  }

  function openLightbox(src, alt, thumbElement) {
    if (!lightbox || !lightboxImg || !lightboxFly) return;
    lightboxThumb = thumbElement || null;
    var rect = { left: 0, top: 0, width: 200, height: 150 };
    if (lightboxThumb) {
      rect = lightboxThumb.getBoundingClientRect();
    }
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightboxFly.classList.remove('lightbox-fly--expanded');
    setFlyRect(rect, false);
    lightboxFly.offsetHeight;
    setTimeout(function () {
      setFlyRect(rect, false);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      lightboxClose?.focus();
      requestAnimationFrame(function () {
        lightboxFly.classList.add('lightbox-fly--expanded');
      });
    }, 0);
  }

  // Lightbox: Event-Delegation, damit dynamisch geladene Galerie-Bilder funktionieren
  galleryGrid?.addEventListener('click', (e) => {
    const inner = e.target.closest('.gallery-inner');
    if (!inner) return;
    const img = inner.querySelector('img');
    if (img) openLightbox(img.src, img.alt, inner);
  });
  galleryGrid?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const inner = e.target.closest('.gallery-inner');
    if (!inner) return;
    e.preventDefault();
    const img = inner.querySelector('img');
    if (img) openLightbox(img.src, img.alt, inner);
  });
  document.querySelectorAll('.gallery-inner img').forEach((img) => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });

  function closeLightbox() {
    if (!lightbox || !lightboxFly) return;
    var thumb = lightboxThumb;
    if (thumb) {
      var rect = thumb.getBoundingClientRect();
      setFlyRect(rect, true);
      lightboxFly.classList.remove('lightbox-fly--expanded');
      var onDone = function () {
        lightboxFly.removeEventListener('transitionend', onDone);
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(function () {
          lightboxFly.style.left = '';
          lightboxFly.style.top = '';
          lightboxFly.style.width = '';
          lightboxFly.style.height = '';
          lightboxFly.style.transform = '';
        }, 400);
      };
      lightboxFly.addEventListener('transitionend', onDone);
    } else {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ===== Smooth scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Magnetic button (hero CTA) =====
  const heroBtn = document.querySelector('.hero-content .btn');
  if (heroBtn) {
    heroBtn.addEventListener('mousemove', (e) => {
      const rect = heroBtn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
      heroBtn.style.transform = `translate(${x}px, ${y - 2}px)`;
    });
    heroBtn.addEventListener('mouseleave', () => {
      heroBtn.style.transform = '';
    });
  }

  // ===== Tel: Nummer kopieren + Toast + Sound =====
  const toastStack = document.getElementById('toastStack');
  const toastSound = document.getElementById('toastSound');
  const btnCopyTelAll = document.querySelectorAll('.btn-copy-tel');
  const TOAST_MAX = 3;
  const TOAST_DURATION = 2500;

  function showToast(name, customMessage, durationMs) {
    if (toastSound) {
      toastSound.volume = 0.03;
      toastSound.currentTime = 0;
      toastSound.play().catch(() => {});
    }
    if (!toastStack) return;
    const text = customMessage != null
      ? customMessage
      : (name ? `Nummer von ${name} in die Zwischenablage kopiert` : 'Nummer in die Zwischenablage kopiert');
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span class="toast-icon">✓</span><span class="toast-text">' + escapeHtml(text) + '</span>';
    toastStack.appendChild(el);
    const toasts = toastStack.querySelectorAll('.toast');
    const excess = toasts.length - TOAST_MAX;
    for (let i = 0; i < excess; i++) {
      const oldest = toasts[i];
      oldest.classList.add('hiding');
      setTimeout(() => oldest.remove(), 400);
    }
    requestAnimationFrame(() => el.classList.add('show'));
    const duration = durationMs != null ? durationMs : TOAST_DURATION;
    setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ===== Termin anfragen: deaktiviert – Verweis auf Discord =====
  const DISCORD_TERMIN_URL = 'https://discord.gg/cvZYhA9sAB';
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#termin"]');
    if (link) {
      e.preventDefault();
      window.open(DISCORD_TERMIN_URL, '_blank', 'noopener,noreferrer');
    }
  });

  const terminModal = document.getElementById('terminModal');
  const terminModalClose = document.getElementById('terminModalClose');
  const terminForm = document.getElementById('terminForm');
  const terminArtToggle = document.getElementById('terminArtToggle');
  const terminArtInput = document.getElementById('terminArt');

  function closeTerminModal() {
    if (!terminModal) return;
    terminModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Eigenes Dropdown Foto-Kategorie
  const terminKategorieDropdown = document.getElementById('terminKategorieDropdown');
  const terminKategorieTrigger = document.getElementById('terminKategorieTrigger');
  const terminKategoriePanel = document.getElementById('terminKategoriePanel');
  const terminKategorieInput = document.getElementById('terminKategorie');
  const terminKategorieLabel = document.getElementById('terminKategorieLabel');
  const terminFotografDropdown = document.getElementById('terminFotografDropdown');
  const terminFotografTrigger = document.getElementById('terminFotografTrigger');
  const terminFotografPanel = document.getElementById('terminFotografPanel');
  const terminFotografInput = document.getElementById('terminFotograf');
  const terminFotografLabel = document.getElementById('terminFotografLabel');
  const PLACEHOLDER = '— Bitte wählen —';
  const FOTO_KATEGORIEN = ['Einzelpersonen & Pärchen', 'Familien', 'Dein Auto'];
  const VIDEO_KATEGORIEN = ['Cinematic Shots', 'Unternehmens Videos', 'Familien Videos', 'Car Porn'];
  const FOTOGRAFEN = [
    { value: '', label: 'Keine Präferenz' },
    { value: 'Carla Watson', label: 'Carla Watson' },
    { value: 'Karim Aghy', label: 'Karim Aghy' },
  ];
  const VIDEOGRAFEN = [
    { value: 'Marcel Eichhörnchen', label: 'Marcel Eichhörnchen' },
  ];

  function closeKategorieDropdown() {
    if (!terminKategorieDropdown) return;
    terminKategorieDropdown.classList.remove('open');
    if (terminKategorieTrigger) terminKategorieTrigger.setAttribute('aria-expanded', 'false');
    if (terminKategoriePanel) terminKategoriePanel.setAttribute('aria-hidden', 'true');
  }

  function closeFotografDropdown() {
    if (!terminFotografDropdown) return;
    terminFotografDropdown.classList.remove('open');
    if (terminFotografTrigger) terminFotografTrigger.setAttribute('aria-expanded', 'false');
    if (terminFotografPanel) terminFotografPanel.setAttribute('aria-hidden', 'true');
  }

  function resetKategorieDropdownDisplay() {
    if (!terminKategorieTrigger || !terminKategorieInput) return;
    const valEl = terminKategorieTrigger.querySelector('.termin-dropdown-value');
    if (valEl) {
      valEl.textContent = PLACEHOLDER;
      valEl.classList.add('placeholder');
    }
    terminKategoriePanel?.querySelectorAll('.termin-dropdown-option').forEach((opt) => opt.classList.remove('selected'));
  }

  function setKategorieOptions(list, keepValue) {
    if (!terminKategoriePanel || !terminKategorieInput || !terminKategorieTrigger) return;
    const current = keepValue ? terminKategorieInput.value : '';
    terminKategoriePanel.innerHTML = '';
    list.forEach((label, idx) => {
      const opt = document.createElement('div');
      opt.className = 'termin-dropdown-option';
      opt.setAttribute('data-value', label);
      opt.setAttribute('role', 'option');
      opt.tabIndex = 0;
      opt.textContent = label;
      if ((!current && idx === 0) || current === label) {
        opt.classList.add('selected');
        terminKategorieInput.value = label;
      }
      opt.addEventListener('click', () => {
        const value = opt.getAttribute('data-value') || '';
        terminKategorieInput.value = value;
        const valEl = terminKategorieTrigger.querySelector('.termin-dropdown-value');
        if (valEl) {
          valEl.textContent = value || PLACEHOLDER;
          valEl.classList.toggle('placeholder', !value);
        }
        terminKategoriePanel.querySelectorAll('.termin-dropdown-option').forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        closeKategorieDropdown();
      });
      terminKategoriePanel.appendChild(opt);
    });
    const valEl = terminKategorieTrigger.querySelector('.termin-dropdown-value');
    if (valEl) {
      const value = terminKategorieInput.value || '';
      valEl.textContent = value || PLACEHOLDER;
      valEl.classList.toggle('placeholder', !value);
    }
  }

  function resetFotografDropdownDisplay() {
    if (!terminFotografTrigger || !terminFotografInput) return;
    const valEl = terminFotografTrigger.querySelector('.termin-dropdown-value');
    if (valEl) {
      valEl.textContent = 'Keine Präferenz';
      valEl.classList.remove('placeholder');
    }
    terminFotografPanel?.querySelectorAll('.termin-dropdown-option').forEach((opt, idx) => {
      opt.classList.toggle('selected', idx === 0);
    });
    terminFotografInput.value = '';
  }

  function setFotografOptions(list) {
    if (!terminFotografPanel || !terminFotografInput || !terminFotografTrigger) return;
    terminFotografPanel.innerHTML = '';
    list.forEach((item, idx) => {
      const opt = document.createElement('div');
      opt.className = 'termin-dropdown-option';
      opt.setAttribute('data-value', item.value);
      opt.setAttribute('role', 'option');
      opt.tabIndex = 0;
      opt.textContent = item.label;
      if (idx === 0) {
        opt.classList.add('selected');
        terminFotografInput.value = item.value;
      }
      opt.addEventListener('click', () => {
        const value = opt.getAttribute('data-value') || '';
        terminFotografInput.value = value;
        const valEl = terminFotografTrigger.querySelector('.termin-dropdown-value');
        if (valEl) {
          valEl.textContent = value || 'Keine Präferenz';
          valEl.classList.toggle('placeholder', !value);
        }
        terminFotografPanel.querySelectorAll('.termin-dropdown-option').forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        closeFotografDropdown();
      });
      terminFotografPanel.appendChild(opt);
    });
    const valEl = terminFotografTrigger.querySelector('.termin-dropdown-value');
    if (valEl) {
      valEl.textContent = 'Keine Präferenz';
      valEl.classList.remove('placeholder');
    }
  }

  if (terminKategorieTrigger && terminKategoriePanel && terminKategorieInput) {
    // Initial: Foto-Kategorien
    setKategorieOptions(FOTO_KATEGORIEN, false);

    terminKategorieTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = terminKategorieDropdown.classList.toggle('open');
      terminKategorieTrigger.setAttribute('aria-expanded', isOpen);
      terminKategoriePanel.setAttribute('aria-hidden', !isOpen);
    });
    document.addEventListener('click', (e) => {
      if (terminKategorieDropdown?.classList.contains('open') && !terminKategorieDropdown.contains(e.target)) {
        closeKategorieDropdown();
      }
      if (terminFotografDropdown?.classList.contains('open') && !terminFotografDropdown.contains(e.target)) {
        closeFotografDropdown();
      }
    });
    terminKategorieDropdown?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeKategorieDropdown();
    });
    terminFotografDropdown?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFotografDropdown();
    });
  }

  if (terminFotografTrigger && terminFotografPanel && terminFotografInput) {
    setFotografOptions(FOTOGRAFEN);

    terminFotografTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = terminFotografDropdown.classList.toggle('open');
      terminFotografTrigger.setAttribute('aria-expanded', isOpen);
      terminFotografPanel.setAttribute('aria-hidden', !isOpen);
    });
    // Click-Listener in setFotografOptions angehängt
  }

  if (terminArtToggle && terminArtInput && terminKategorieLabel && terminKategorieInput) {
    const buttons = terminArtToggle.querySelectorAll('.termin-toggle-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const art = btn.getAttribute('data-art') || 'foto';
        terminArtInput.value = art;
        buttons.forEach((b) => b.classList.toggle('termin-toggle-btn--active', b === btn));
        const isFoto = art === 'foto';
        if (terminKategorieLabel) {
          terminKategorieLabel.textContent = isFoto ? 'Foto-Kategorie' : 'Video-Kategorie';
        }
        if (terminFotografLabel) {
          terminFotografLabel.textContent = isFoto ? 'Fotograf*in (optional)' : 'Videograf*in (optional)';
        }
        if (terminKategorieInput) {
          terminKategorieInput.value = '';
        }
        setKategorieOptions(isFoto ? FOTO_KATEGORIEN : VIDEO_KATEGORIEN, false);
        setFotografOptions(isFoto ? FOTOGRAFEN : VIDEOGRAFEN);
      });
    });
  }

  if (terminForm) {
    terminForm.addEventListener('reset', () => {
      resetKategorieDropdownDisplay();
      const art = (document.getElementById('terminArt') || {}).value || 'foto';
      setFotografOptions(art === 'video' ? VIDEOGRAFEN : FOTOGRAFEN);
    });
    terminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(null, 'Terminanfragen bitte über unseren Discord: discord.gg/cvZYhA9sAB');
    });
  }

  btnCopyTelAll.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const num = btn.getAttribute('data-copy') || '';
      const name = btn.getAttribute('data-name') || '';
      if (!num) return;
      try {
        await navigator.clipboard.writeText(num);
        showToast(name);
      } catch (_) {
        const input = document.createElement('input');
        input.value = num;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast(name);
      }
    });
  });

  // ===== Klassik-Radio + Widget =====
  const ambientAudio = document.getElementById('ambientAudio');
  const musicWidget = document.getElementById('musicWidget');
  const musicToggle = document.getElementById('musicToggle');
  const musicVolume = document.getElementById('musicVolume');
  const musicVolDown = document.getElementById('musicVolDown');
  const musicVolUp = document.getElementById('musicVolUp');
  const musicExpand = document.getElementById('musicExpand');
  const musicControls = document.getElementById('musicControls');
  const musicStatus = document.getElementById('musicStatus');

  if (ambientAudio && musicWidget) {
    const DEFAULT_VOLUME = 2;
    const VOLUME_SCALE = 0.12; // Slider 100% = 12% echte Lautstärke (Radio leiser)
    function toRealVolume(sliderVal) { return (parseInt(sliderVal, 10) / 100) * VOLUME_SCALE; }
    const savedVol = localStorage.getItem('mosaik-music-volume');
    const initialVol = savedVol != null ? parseInt(savedVol, 10) : DEFAULT_VOLUME;
    ambientAudio.volume = toRealVolume(initialVol);
    if (musicVolume) musicVolume.value = initialVol;

    // Beim ersten Klick/Scroll/Touch/etc. entstummen und ggf. starten (Chromium-Autoplay-Regel)
    ambientAudio.muted = true;
    function startOnFirstInteraction() {
      ambientAudio.muted = false;
      if (ambientAudio.paused) {
        ambientAudio.play().then(() => updatePlayingState()).catch(() => updatePlayingState());
      }
    }
    const once = { once: true };
    document.addEventListener('click', startOnFirstInteraction, once);
    document.addEventListener('keydown', startOnFirstInteraction, once);
    document.addEventListener('scroll', startOnFirstInteraction, once);
    window.addEventListener('scroll', startOnFirstInteraction, once);
    document.addEventListener('wheel', startOnFirstInteraction, once);
    document.addEventListener('touchstart', startOnFirstInteraction, once);
    document.addEventListener('mousemove', startOnFirstInteraction, once);
    document.addEventListener('pointerdown', startOnFirstInteraction, once);

    let mutedVolume = initialVol;
    const musicMute = document.getElementById('musicMute');

    function setMuted(muted) {
      if (muted) {
        mutedVolume = parseInt(musicVolume?.value || DEFAULT_VOLUME, 10);
        ambientAudio.volume = 0;
        musicWidget.classList.add('muted');
        if (musicMute) {
          musicMute.textContent = '🔇';
          musicMute.setAttribute('aria-label', 'Stummschaltung aufheben');
          musicMute.title = 'Stummschaltung aufheben';
        }
      } else {
        const v = mutedVolume || DEFAULT_VOLUME;
        ambientAudio.volume = toRealVolume(v);
        if (musicVolume) musicVolume.value = v;
        musicWidget.classList.remove('muted');
        if (musicMute) {
          musicMute.textContent = '🔊';
          musicMute.setAttribute('aria-label', 'Stummschalten');
          musicMute.title = 'Stummschalten';
        }
      }
      localStorage.setItem('mosaik-music-muted', muted ? '1' : '0');
    }

    const wasMuted = localStorage.getItem('mosaik-music-muted') === '1';
    if (wasMuted) setMuted(true);
    else if (musicMute) {
      musicMute.textContent = '🔊';
      musicMute.setAttribute('aria-label', 'Stummschalten');
    }

    function updatePlayingState() {
      musicWidget.classList.toggle('playing', !ambientAudio.paused);
      if (musicStatus) musicStatus.textContent = ambientAudio.paused ? 'Pausiert' : 'Läuft';
    }

    function updateStreamError() {
      if (musicStatus) musicStatus.textContent = 'Stream nicht verfügbar';
    }

    musicToggle?.addEventListener('click', () => {
      if (ambientAudio.paused) {
        ambientAudio.play().then(() => updatePlayingState()).catch(() => { updatePlayingState(); updateStreamError(); });
      } else {
        ambientAudio.pause();
        updatePlayingState();
      }
    });

    musicMute?.addEventListener('click', () => {
      const isMuted = ambientAudio.volume === 0;
      setMuted(!isMuted);
    });

    musicExpand?.addEventListener('click', () => {
      musicWidget?.classList.toggle('expanded');
    });

    if (musicVolume) {
      musicVolume.addEventListener('input', () => {
        const v = musicVolume.value;
        ambientAudio.volume = toRealVolume(v);
        if (parseInt(v, 10) > 0) {
          musicWidget.classList.remove('muted');
          if (musicMute) {
            musicMute.textContent = '🔊';
            musicMute.setAttribute('aria-label', 'Stummschalten');
          }
          localStorage.setItem('mosaik-music-muted', '0');
        }
        localStorage.setItem('mosaik-music-volume', musicVolume.value);
      });
    }
    musicVolDown?.addEventListener('click', () => {
      const v = Math.max(0, parseInt(musicVolume?.value || DEFAULT_VOLUME, 10) - 10);
      if (musicVolume) musicVolume.value = v;
      ambientAudio.volume = toRealVolume(v);
      if (v > 0) musicWidget.classList.remove('muted');
      if (musicMute && v > 0) musicMute.textContent = '🔊';
      localStorage.setItem('mosaik-music-volume', v);
    });
    musicVolUp?.addEventListener('click', () => {
      const v = Math.min(100, parseInt(musicVolume?.value || DEFAULT_VOLUME, 10) + 10);
      if (musicVolume) musicVolume.value = v;
      ambientAudio.volume = toRealVolume(v);
      musicWidget.classList.remove('muted');
      if (musicMute) musicMute.textContent = '🔊';
      localStorage.setItem('mosaik-music-volume', v);
    });

    ambientAudio.addEventListener('play', updatePlayingState);
    ambientAudio.addEventListener('pause', updatePlayingState);
    ambientAudio.addEventListener('error', updateStreamError);

    updatePlayingState();

    // Sofort versuchen zu starten (manche Browser erlauben es)
    function tryStart() {
      ambientAudio.play().then(() => updatePlayingState()).catch(() => updatePlayingState());
    }
    tryStart();

    // Nochmal bei window.onload – manche Browser erlauben Play/Unmute nach vollständigem Laden
    window.addEventListener('load', function () {
      if (!ambientAudio.paused) {
        ambientAudio.muted = false;
        updatePlayingState();
      } else {
        ambientAudio.muted = false;
        ambientAudio.play().then(function () {
          updatePlayingState();
        }).catch(function () {
          ambientAudio.muted = true;
          ambientAudio.play().then(() => updatePlayingState()).catch(() => updatePlayingState());
        });
      }
    });
  }
})();
