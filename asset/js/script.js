/**
 * script.js - Portfolio Interactive Scripts
 *
 * 1. SIDEBAR NAVIGATION & SCROLLSPY (IntersectionObserver with threshold 0.5)
 * 2. TYPING ANIMATION (Reuses existing IntersectionObserver for section #about)
 * 3. CHARACTER EYE TRACKING (9-direction mouse tracking with accurate gaze mapping)
 * 4. LANYARD INTERACTIVE DRAG (Full-width drag to right edge with spring return)
 * 5. PROJECT SLIDER (Horizontal scroll-snap slider with prev/next buttons)
 * 6. PROJECT MODAL (Full-screen modal with fade + scale animation)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebarScrollspy();
  initCharacterTracking();
  initLanyardDrag();
  initProjectSlider();
  initProjectModal();
});

// ============================================================================
// 1. SIDEBAR NAVIGATION & SCROLLSPY (with About Typing Animation trigger)
// ============================================================================
function initSidebarScrollspy() {
  const navItems = document.querySelectorAll('.nav-item');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('#home, #about, #project, #contact');

  if (sections.length === 0 || navLinks.length === 0) return;

  let isClickScrolling = false;
  let clickTimeout = null;

  /**
   * Mengatur menu aktif secara tunggal:
   * 1. Hapus class .active dari semua .nav-item dan .nav-link
   * 2. Cari link yang href-nya sesuai dengan id section
   * 3. Tambahkan class .active ke link dan nav-item tersebut
   */
  function setActiveMenu(sectionId) {
    if (!sectionId) return;

    // 1. Hapus class .active dari semua menu agar tidak ada menu aktif ganda
    navItems.forEach((item) => item.classList.remove('active'));
    navLinks.forEach((link) => link.classList.remove('active'));

    // 2. Cari link yang href-nya sesuai dengan id section
    const targetLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (targetLink) {
      // 3. Tambahkan class .active ke link dan parent .nav-item
      targetLink.classList.add('active');
      const parentItem = targetLink.closest('.nav-item');
      if (parentItem) {
        parentItem.classList.add('active');
      }
    }
  }

  // Klik navigasi: segera update status aktif dan beri jeda scrollspy saat smooth scroll
  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        setActiveMenu(targetId);

        // Kunci sementara observer saat proses smooth scrolling berlangsung
        isClickScrolling = true;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          isClickScrolling = false;
        }, 800);
      }
    });
  });

  // IntersectionObserver dengan threshold 0.5 sesuai spesifikasi
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    // 1. Trigger animasi typing pada section #about saat terlihat pertama kali (tanpa observer tambahan)
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.id === 'about') {
        startAboutTyping();
      }
    });

    if (isClickScrolling) return;

    // 2. Filter section yang terlihat >= 50% untuk update navigation active class
    const visibleEntries = entries.filter((entry) => entry.isIntersecting);

    if (visibleEntries.length > 0) {
      // Jika lebih dari 1 section terlihat, ambil yang intersectionRatio terbesar
      visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const activeSectionId = visibleEntries[0].target.getAttribute('id');
      setActiveMenu(activeSectionId);
    }
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

// ============================================================================
// 2. TYPING ANIMATION (Heading About: "Hi, I'm Calandra Alencia Haryani")
// ============================================================================
let hasTypedAbout = false;

function startAboutTyping() {
  // Jalankan hanya satu kali
  if (hasTypedAbout) return;
  hasTypedAbout = true;

  const textElement = document.getElementById('about-typing-text');
  const cursorElement = document.getElementById('about-cursor');
  if (!textElement) return;

  const fullText = "Hi, I'm Calandra Alencia Haryani";
  let charIndex = 0;
  textElement.textContent = '';

  // Tampilkan cursor saat mengetik dimulai
  if (cursorElement) {
    cursorElement.style.display = 'inline-block';
  }

  function typeNextChar() {
    if (charIndex < fullText.length) {
      textElement.textContent += fullText.charAt(charIndex);
      charIndex++;
      // Kecepatan 80ms per karakter (rentang 70-90 ms)
      setTimeout(typeNextChar, 80);
    } else {
      // Setelah selesai, cursor | tetap tampil dan berkedip
      if (cursorElement) {
        cursorElement.style.display = 'inline-block';
      }
    }
  }

  typeNextChar();
}

// ============================================================================
// 3. CHARACTER 9-DIRECTION MOUSE EYE TRACKING
// ============================================================================
function initCharacterTracking() {
  const characterImg = document.getElementById('hero-character-img');
  if (!characterImg) return;

  /**
   * Pemetaan Arah Pandangan Mata yang Akurat (Visual Gaze Mapping):
   * Berdasarkan konten visual gambar:
   * - char-center.png     -> Mata lurus ke depan (center)
   * - char-down.png       -> Mata melirik ke KIRI (viewer's left)
   * - char-left.png       -> Mata melirik ke BAWAH (down)
   * - char-right.png      -> Mata melirik ke KANAN (viewer's right)
   * - char-up-left.png    -> Mata melirik ke ATAS (up)
   * - char-up-right.png   -> Mata melirik ke ATAS-KANAN (up-right)
   * - char-down-right.png -> Mata melirik ke BAWAH-KANAN (down-right)
   * - char-down-left.png  -> Mata melirik ke ATAS-KIRI (up-left)
   */
  const GAZE_FILE_MAP = {
    'center': 'center.png',
    'left': 'down.png',             // char-down.png memiliki pandangan ke kiri
    'right': 'right.png',           // char-right.png memiliki pandangan ke kanan
    'down': 'left.png',             // char-left.png memiliki pandangan ke bawah
    'up': 'up-left.png',            // char-up-left.png memiliki pandangan ke atas
    'up-right': 'up-right.png',     // char-up-right.png memiliki pandangan ke atas-kanan
    'down-right': 'down-right.png', // char-down-right.png memiliki pandangan ke bawah-kanan
    'up-left': 'down-left.png',     // char-down-left.png memiliki pandangan ke atas-kiri
    'down-left': 'down.png'         // char-down.png melirik kiri-bawah
  };

  let currentDirection = 'center';
  let imageMap = {};
  const preloadedImages = {};
  let isMapInitialized = false;

  /**
   * Menentukan folder & prefix file secara otomatis (asset/image/ vs image/)
   * untuk memastikan bebas dari 404 console error.
   */
  function buildImageMap() {
    const src = characterImg.currentSrc || characterImg.src || '';
    const useCharacterPrefix = src.includes('character-');
    const prefix = useCharacterPrefix ? 'character-' : 'char-';

    let folder = 'image/';
    if (src.includes('asset/image/')) {
      folder = 'asset/image/';
    } else if (src.includes('assets/image/')) {
      folder = 'assets/image/';
    } else {
      folder = 'image/';
    }

    const map = {};
    for (const [dir, fileName] of Object.entries(GAZE_FILE_MAP)) {
      map[dir] = `${folder}${prefix}${fileName}`;
    }
    return map;
  }

  /**
   * Preload seluruh gambar ke memori agar pergantian instan dan tidak berkedip
   */
  function preloadAllImages() {
    Object.entries(imageMap).forEach(([dir, path]) => {
      if (!preloadedImages[dir] || preloadedImages[dir].src !== path) {
        const img = new Image();
        img.src = path;
        preloadedImages[dir] = img;
      }
    });
  }

  function initializeMapAndPreload() {
    imageMap = buildImageMap();
    preloadAllImages();
    isMapInitialized = true;
  }

  initializeMapAndPreload();

  characterImg.addEventListener('load', () => {
    initializeMapAndPreload();
  });

  // Threshold hysteresis agar pergantian tidak terlalu sensitif / jittery
  const CENTER_EXIT_RADIUS = 75; // px untuk keluar dari posisi center
  const CENTER_ENTER_RADIUS = 55; // px untuk kembali ke posisi center

  let mouseX = 0;
  let mouseY = 0;
  let isTicking = false;

  /**
   * Hitung arah kursor relatif terhadap level mata karakter
   */
  function computeDirection(clientX, clientY) {
    const rect = characterImg.getBoundingClientRect();

    // Titik pusat horizontal karakter
    const eyeCenterX = rect.left + rect.width / 2;
    // Level mata karakter sekitar 32% dari atas gambar
    const eyeCenterY = rect.top + rect.height * 0.32;

    const dx = clientX - eyeCenterX;
    const dy = clientY - eyeCenterY;
    const distance = Math.hypot(dx, dy);

    // Hysteresis threshold
    const threshold = (currentDirection === 'center') ? CENTER_EXIT_RADIUS : CENTER_ENTER_RADIUS;

    if (distance < threshold) {
      return 'center';
    }

    // Sudut dalam derajat (-180 sampai 180)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Pembagian 8 arah mata angin (masing-masing 45 derajat)
    if (angle >= -22.5 && angle < 22.5) {
      return 'right';
    } else if (angle >= 22.5 && angle < 67.5) {
      return 'down-right';
    } else if (angle >= 67.5 && angle < 112.5) {
      return 'down';
    } else if (angle >= 112.5 && angle < 157.5) {
      return 'down-left';
    } else if (angle >= 157.5 || angle < -157.5) {
      return 'left';
    } else if (angle >= -157.5 && angle < -112.5) {
      return 'up-left';
    } else if (angle >= -112.5 && angle < -67.5) {
      return 'up';
    } else if (angle >= -67.5 && angle < -22.5) {
      return 'up-right';
    }

    return 'center';
  }

  /**
   * Update src gambar karakter hanya jika arah berubah
   */
  function updateCharacterImage() {
    isTicking = false;

    if (!isMapInitialized) {
      initializeMapAndPreload();
    }

    const targetDirection = computeDirection(mouseX, mouseY);

    // Hindari update src jika gambar yang dibutuhkan masih sama
    if (targetDirection === currentDirection) {
      return;
    }

    currentDirection = targetDirection;
    const targetSrc = imageMap[targetDirection];

    if (targetSrc && characterImg.getAttribute('src') !== targetSrc) {
      // Tidak mengubah posisi/transform karakter, hanya mengganti src
      characterImg.src = targetSrc;
    }
  }

  // Mousemove listener dengan requestAnimationFrame untuk performa maksimal
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isTicking) {
      window.requestAnimationFrame(updateCharacterImage);
      isTicking = true;
    }
  }, { passive: true });

  // Dukungan touchmove pada perangkat mobile/tablet
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;

      if (!isTicking) {
        window.requestAnimationFrame(updateCharacterImage);
        isTicking = true;
      }
    }
  }, { passive: true });

  // Reset ke posisi center jika kursor meninggalkan jendela browser
  document.addEventListener('mouseleave', () => {
    if (currentDirection !== 'center') {
      currentDirection = 'center';
      if (imageMap['center']) {
        characterImg.src = imageMap['center'];
      }
    }
  });
}

// ============================================================================
// 4. LANYARD INTERACTIVE DRAG & SPRING PHYSICS
// ============================================================================
function initLanyardDrag() {
  const lanyardImg = document.getElementById('about-lanyard-img') || document.querySelector('.about-lanyard-img');
  if (!lanyardImg) return;

  // 3. Cegah native image drag / ghost image
  lanyardImg.setAttribute('draggable', 'false');
  lanyardImg.addEventListener('dragstart', (e) => e.preventDefault());

  // Posisi translasi (persisten setelah drag dilepas)
  let currentX = 0;
  let currentY = 0;
  let currentRotate = 0;

  // Status drag aktif
  let isDragging = false;
  let activePointerId = null;
  let pointerType = 'mouse';

  // 4. Titik koordinat klik & posisi awal saat mulai drag (mencegah gambar loncat)
  let startClientX = 0;
  let startClientY = 0;
  let originX = 0;
  let originY = 0;

  // Kecepatan horizontal mouse / touch untuk rotasi dinamis
  let lastClientX = 0;
  let lastTime = 0;
  let velocityX = 0;
  let lastMoveTime = 0;

  // RequestAnimationFrame loop saat drag aktif
  let dragRafId = null;

  // 8. Variabel pegas (Spring Physics) saat dilepas
  let springAnimId = null;
  let rotVelocity = 0;
  const SPRING_STIFFNESS = 0.12; // Kekakuan pegas rotasi
  const SPRING_DAMPING = 0.82;   // Redaman ayunan pegas

  // 7. Batas rotasi maksimum (-30 sampai 30 derajat)
  const MAX_ROTATION_DEG = 30;

  // 10. Disambiguasi gesture pada layar sentuh (mobile scroll vs drag)
  let touchIntent = 'none'; // 'none' | 'pending' | 'dragging' | 'scrolling'
  let touchHoldTimer = null;
  const TOUCH_SLOP = 8; // Toleransi gerakan jari awal dalam pixel

  /**
   * Hitung batas gerak dinamis agar lanyard tetap terjangkau di viewport
   */
  function clampToBounds(x, y) {
    const rect = lanyardImg.getBoundingClientRect();
    const baseLeft = rect.left - currentX;
    const baseTop = rect.top - currentY;
    const w = rect.width;
    const h = rect.height;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Batas aman: minimal 60px gambar tetap berada di dalam area pandang
    const minX = -baseLeft - w + 60;
    const maxX = winW - baseLeft - 60;
    const minY = -baseTop - h + 60;
    const maxY = winH - baseTop - 60;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }

  /**
   * Render CSS transform (translate3d dan rotate)
   */
  function renderTransform() {
    lanyardImg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px) rotate(${currentRotate.toFixed(2)}deg)`;
  }

  /**
   * 8. Animasi elastic/spring-like saat mouse/touch dilepas:
   * - posisi X & Y terakhir TETAP
   * - rotasi kembali ke 0 derajat dengan osilasi pegas yang halus
   */
  function springBackRotation() {
    // Hukum Hooke dengan damping: F = -k * theta
    const force = -SPRING_STIFFNESS * currentRotate;
    rotVelocity = (rotVelocity + force) * SPRING_DAMPING;
    currentRotate += rotVelocity;

    renderTransform();

    // Hentikan loop jika sudut rotasi sudah hampir 0 dan energi pegas habis
    if (Math.abs(currentRotate) > 0.04 || Math.abs(rotVelocity) > 0.04) {
      springAnimId = requestAnimationFrame(springBackRotation);
    } else {
      currentRotate = 0;
      rotVelocity = 0;
      renderTransform();
      springAnimId = null;
    }
  }

  /**
   * Loop pembaruan rotasi saat drag berlangsung
   * Menghaluskan pergerakan dan meluruhkan rotasi jika kursor diam di tempat
   */
  function dragUpdateLoop() {
    if (!isDragging) return;

    const now = performance.now();
    // Jika kursor berhenti bergerak lebih dari 45ms, turunkan kecepatan secara bertahap
    if (now - lastMoveTime > 45) {
      velocityX *= 0.82;
      if (Math.abs(velocityX) < 0.001) velocityX = 0;
    }

    // 6 & 7. Rotasi mengikuti kecepatan horizontal mouse, dibatasi -30 sampai 30 derajat
    const targetAngle = -velocityX * 15;
    const clampedAngle = Math.max(-MAX_ROTATION_DEG, Math.min(MAX_ROTATION_DEG, targetAngle));

    // Interpolasi halus (lerp) menuju sudut target
    currentRotate += (clampedAngle - currentRotate) * 0.28;

    renderTransform();
    dragRafId = requestAnimationFrame(dragUpdateLoop);
  }

  /**
   * Mulai aksi drag
   */
  function startDrag(clientX, clientY, pointerId, type) {
    // Batalkan animasi pegas jika sedang berjalan
    if (springAnimId) {
      cancelAnimationFrame(springAnimId);
      springAnimId = null;
    }

    isDragging = true;
    activePointerId = pointerId;
    pointerType = type;

    // 4. Simpan offset titik klik dan posisi awal agar gambar tidak melompat (no jump)
    startClientX = clientX;
    startClientY = clientY;
    originX = currentX;
    originY = currentY;

    lastClientX = clientX;
    lastTime = performance.now();
    lastMoveTime = lastTime;
    velocityX = 0;

    // 9. Cursor berubah dari grab menjadi grabbing
    lanyardImg.classList.add('is-dragging');
    document.body.classList.add('lanyard-dragging');

    // Tangkap pointer agar tracking tetap stabil walau kursor bergerak cepat
    if (pointerId !== null && lanyardImg.setPointerCapture) {
      try {
        lanyardImg.setPointerCapture(pointerId);
      } catch (err) {}
    }

    if (dragRafId) cancelAnimationFrame(dragRafId);
    dragRafId = requestAnimationFrame(dragUpdateLoop);
  }

  function cleanupTouch() {
    if (touchHoldTimer) {
      clearTimeout(touchHoldTimer);
      touchHoldTimer = null;
    }
  }

  /**
   * 1 & 2. Pointer Down (Mouse click / Touch start)
   */
  function handlePointerDown(e) {
    // Hanya tangani tombol mouse kiri (button 0) atau touch
    if (e.button !== undefined && e.button !== 0) return;

    cleanupTouch();

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';

    if (isTouch) {
      // 10. Pada layar sentuh: Jangan langsung blokir scroll mobile.
      // Evaluasi apakah user berniat scroll halaman atau drag lanyard.
      pointerType = 'touch';
      activePointerId = e.pointerId;
      startClientX = e.clientX;
      startClientY = e.clientY;
      touchIntent = 'pending';

      // Jika disentuh dan ditahan (hold) selama 220ms tanpa geser, aktifkan drag
      touchHoldTimer = setTimeout(() => {
        if (touchIntent === 'pending') {
          touchIntent = 'dragging';
          startDrag(startClientX, startClientY, e.pointerId, 'touch');
        }
      }, 220);
    } else {
      // Desktop Mouse: Drag aktif seketika saat diklik
      touchIntent = 'dragging';
      startDrag(e.clientX, e.clientY, e.pointerId, 'mouse');
    }
  }

  /**
   * Pointer Move (Mouse move / Touch drag)
   */
  function handlePointerMove(e) {
    if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

    // 10. Disambiguasi pada layar sentuh: bedakan scroll vs drag lanyard
    if (pointerType === 'touch' && touchIntent === 'pending') {
      const dx = e.clientX - startClientX;
      const dy = e.clientY - startClientY;
      const dist = Math.hypot(dx, dy);

      if (dist < TOUCH_SLOP) {
        return; // Jari baru menyentuh/bergetar tipis, jangan putuskan dulu
      }

      cleanupTouch();

      // Jika arah dominan adalah vertikal, izinkan native scroll halaman mobile
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        touchIntent = 'scrolling';
        activePointerId = null;
        return; // Jangan drag, biarkan mobile scrolling berjalan normal
      } else {
        // Gerakan horizontal / diagonal: aktifkan drag lanyard
        touchIntent = 'dragging';
        startDrag(e.clientX, e.clientY, e.pointerId, 'touch');
      }
    }

    if (!isDragging) return;

    // Mencegah scroll default saat drag lanyard telah dikonfirmasi
    if (e.cancelable) {
      e.preventDefault();
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    const dxFromLast = e.clientX - lastClientX;

    // Hitung kecepatan horizontal (px/ms) dengan exponential smoothing
    const instantVelocity = dxFromLast / dt;
    velocityX = velocityX * 0.35 + instantVelocity * 0.65;

    lastClientX = e.clientX;
    lastTime = now;
    lastMoveTime = now;

    // 5. Izinkan translate X dan Y
    const rawX = originX + (e.clientX - startClientX);
    const rawY = originY + (e.clientY - startClientY);

    const bounded = clampToBounds(rawX, rawY);
    currentX = bounded.x;
    currentY = bounded.y;
  }

  /**
   * Pointer Up / Cancel (Mouse release / Touch end)
   */
  function handlePointerUp(e) {
    cleanupTouch();

    if (touchIntent === 'pending' || touchIntent === 'scrolling') {
      touchIntent = 'none';
      activePointerId = null;
      return;
    }

    if (!isDragging) return;
    if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

    isDragging = false;
    touchIntent = 'none';

    // Hentikan loop pembaruan drag
    if (dragRafId) {
      cancelAnimationFrame(dragRafId);
      dragRafId = null;
    }

    // 9. Kembalikan cursor ke grab
    lanyardImg.classList.remove('is-dragging');
    document.body.classList.remove('lanyard-dragging');

    if (activePointerId !== null && lanyardImg.releasePointerCapture) {
      try {
        lanyardImg.releasePointerCapture(activePointerId);
      } catch (err) {}
    }
    activePointerId = null;

    // 8. Saat mouse/touch dilepas:
    // - posisi terakhir tetap (currentX dan currentY dipertahankan)
    // - rotasi kembali ke 0 derajat
    // - gunakan easing elastic/spring-like yang halus
    rotVelocity = -velocityX * 6; // Transfer sisa kecepatan sebagai impuls ayunan awal
    rotVelocity = Math.max(-12, Math.min(12, rotVelocity)); // Batasi impuls awal agar proporsional

    if (springAnimId) cancelAnimationFrame(springAnimId);
    springAnimId = requestAnimationFrame(springBackRotation);
  }

  // 2. Support mouse dan touch secara unified via Pointer Events
  lanyardImg.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove, { passive: false });
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
}

// ============================================================================
// 5. PROJECT SLIDER (Horizontal scroll-snap, vanilla JS, prev/next)
// ============================================================================
function initProjectSlider() {
  const track = document.getElementById('project-slider-track');
  const btnPrev = document.getElementById('slider-btn-prev');
  const btnNext = document.getElementById('slider-btn-next');

  if (!track || !btnPrev || !btnNext) return;

  /**
   * Hitung lebar scroll satu langkah:
   * Gunakan lebar card pertama + gap sebagai satuan scroll per klik.
   */
  function getScrollStep() {
    const firstCard = track.querySelector('.project-card');
    if (!firstCard) return 320;
    const gap = parseInt(getComputedStyle(track).gap) || 28;
    return firstCard.offsetWidth + gap;
  }

  /**
   * Update status disabled tombol sesuai posisi scroll
   */
  function updateButtons() {
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    btnPrev.disabled = atStart;
    btnNext.disabled = atEnd;
  }

  // Scroll ke kiri satu card
  btnPrev.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
  });

  // Scroll ke kanan satu card
  btnNext.addEventListener('click', () => {
    track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
  });

  // Perbarui tombol saat pengguna scroll manual
  track.addEventListener('scroll', updateButtons, { passive: true });

  // Inisialisasi status tombol saat halaman dimuat
  updateButtons();

  // Re-check saat resize (lebar card bisa berubah di breakpoint)
  window.addEventListener('resize', updateButtons, { passive: true });
}

// ============================================================================
// 6. PROJECT MODAL (fade + scale, 3 cara menutup, accessible, zero console errors)
// ============================================================================
function initProjectModal() {
  const modal       = document.getElementById('project-modal');
  const overlay     = document.getElementById('modal-overlay');
  const closeBtn    = document.getElementById('modal-close-btn');
  const imageArea   = document.getElementById('modal-image-area');
  const placeholder = document.getElementById('modal-img-placeholder');
  const numEl       = document.getElementById('modal-project-number');
  const nameEl      = document.getElementById('modal-project-name');
  const catEl       = document.getElementById('modal-project-category');

  // Bail gracefully if modal elements don't exist in the DOM
  if (!modal || !overlay || !closeBtn || !imageArea || !placeholder || !numEl || !nameEl || !catEl) return;

  // Track which element triggered the modal for focus restoration
  let triggerElement = null;

  /* -- Open Modal --------------------------------------------------------- */
  function openModal(trigger) {
    const name     = trigger.dataset.projectName     || '';
    const category = trigger.dataset.projectCategory || '';
    const number   = trigger.dataset.projectNumber   || '';
    const color    = trigger.dataset.projectColor    || '#c9ded9';

    numEl.textContent  = number;
    nameEl.textContent = name;
    catEl.textContent  = category;

    imageArea.style.backgroundColor = color;

    // Clone the SVG icon from the trigger into the modal placeholder
    const svgSource = trigger.querySelector('svg');
    placeholder.innerHTML = '';
    if (svgSource) {
      const svgClone = svgSource.cloneNode(true);
      svgClone.setAttribute('width', '80');
      svgClone.setAttribute('height', '80');
      svgClone.removeAttribute('aria-hidden');
      placeholder.appendChild(svgClone);
    }

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.classList.add('is-open');
    triggerElement = trigger;
    setTimeout(() => closeBtn.focus(), 50);
  }

  /* -- Close Modal -------------------------------------------------------- */
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  /* -- Event Listeners ---------------------------------------------------- */

  // 1. All [data-modal-trigger] elements — click OR Enter/Space keyboard
  document.querySelectorAll('[data-modal-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(trigger);
      }
    });
  });

  // 2. Close button X
  closeBtn.addEventListener('click', closeModal);

  // 3. Click overlay (outside content box)
  overlay.addEventListener('click', closeModal);

  // 4. Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* -- Focus Trap --------------------------------------------------------- */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (!modal.classList.contains('is-open')) return;

    const focusable = Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}
