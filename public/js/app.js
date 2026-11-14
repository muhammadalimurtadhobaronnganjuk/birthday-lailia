// Main Interactive Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initBirthdayName();
  initHeroConfetti();
  initPolaroidModal();
  initCandleBlow();
  initWishesBoard();

  const heroVideo = document.querySelector('.hero-bg-video');
  if (heroVideo) {
    heroVideo.play().catch(() => {});
  }
});

/* ===================================================
   0. DYNAMIC NAME HELPER
   =================================================== */
function initBirthdayName() {
  try {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('nama') || params.get('name');
    if (!nameParam) return;
    const name = nameParam.trim();
    if (!name) return;

    document.title = `Selamat Ulang Tahun, ${name}`;
    document.querySelectorAll('.birthday-name-heading, .birthday-name-inline, .birthday-name-text').forEach(el => {
      el.textContent = name;
    });

    const wishMessage = document.getElementById('wishMessage');
    if (wishMessage) {
      wishMessage.placeholder = `Tuliskan ucapan dan doa terbaikmu untuk ${name}...`;
    }
  } catch (err) {
    console.warn('Error reading URL params:', err);
  }
}

/* ===================================================
   1. HERO CANVAS PARTICLES (Floating Confetti & Sparkles)
   =================================================== */
function initHeroConfetti() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  const particles = [];
  const colors = ['#FFD166', '#FF85A1', '#80D8FF', '#57CC99', '#B8B8FF', '#FFAA00', '#FFCCD5'];

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 6 + 3,
      speedY: Math.random() * 0.7 + 0.35,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: Math.random() > 0.4 ? 'circle' : 'sparkle',
      opacity: Math.random() * 0.6 + 0.35
    });
  }

  function drawSparkle(x, y, size, color, opacity, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.3, size, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, size, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCircle(x, y, size, color, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      if (p.type === 'circle') {
        drawCircle(p.x, p.y, p.size, p.color, p.opacity);
      } else {
        drawSparkle(p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ===================================================
   2. POLAROID MODAL LIGHTBOX
   =================================================== */
function initPolaroidModal() {
  const cards = document.querySelectorAll('.polaroid-card');
  const modal = document.getElementById('polaroidModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modal) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playPop();
      const img = card.querySelector('.polaroid-img');
      const title = card.querySelector('.polaroid-title');
      const memoryText = card.getAttribute('data-memory');

      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modalTitle.textContent = title.textContent;
      modalDesc.textContent = memoryText || 'Momen indah yang berkesan.';

      modal.classList.add('active');
    });
  });

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/* ===================================================
   3. INTERACTIVE "MAKE A WISH" (TIUP LILIN)
   =================================================== */
function initCandleBlow() {
  const candle = document.getElementById('cakeCandle');
  const blowBtn = document.getElementById('blowCandleBtn');
  const relightBtn = document.getElementById('relightCandleBtn');
  const successCard = document.getElementById('wishSuccessCard');

  if (!candle || !blowBtn) return;

  let isBlown = false;

  function extinguishCandle() {
    if (isBlown) return;
    isBlown = true;

    // Sound effect
    if (window.soundEngine) window.soundEngine.playCandleBlow();

    // Extinguish visual
    candle.classList.add('blown');
    blowBtn.style.display = 'none';

    setTimeout(() => {
      if (window.soundEngine) window.soundEngine.playCelebration();
      successCard.classList.add('active');
      relightBtn.style.display = 'inline-flex';

      // Celebratory confetti explosion
      confettiBurst({ x: 0.5, y: 0.5, count: 90 });
      setTimeout(() => confettiBurst({ x: 0.35, y: 0.45, count: 40 }), 300);
      setTimeout(() => confettiBurst({ x: 0.65, y: 0.45, count: 40 }), 600);
    }, 550);
  }

  function relightCandle() {
    if (window.soundEngine) window.soundEngine.playPop();
    isBlown = false;
    candle.classList.remove('blown');
    successCard.classList.remove('active');
    relightBtn.style.display = 'none';
    blowBtn.style.display = 'inline-flex';
  }

  blowBtn.addEventListener('click', extinguishCandle);
  if (relightBtn) relightBtn.addEventListener('click', relightCandle);
}

/* ===================================================
   4. WISHES BOARD (BUKU TAMU / UCAPAN TEMAN)
   =================================================== */
function initWishesBoard() {
  const form = document.getElementById('wishForm');
  const wishesGrid = document.getElementById('wishesGrid');
  const countBadge = document.getElementById('wishesCountBadge');

  const avatarList = [
    '/assets/nailong-real-1.png',
    '/assets/nailong-real-2.png',
    '/assets/nailong-real-3.png',
    '/assets/nailong-real-4.png',
    '/assets/nailong-real-5.png',
    '/assets/nailong-real-6.png',
    '/assets/nailong-real-7.png',
    '/assets/nailong-real-8.png',
    '/assets/nailong-real-9.png',
    '/assets/nailong-real-10.png',
    '/assets/nailong-stickerly-2.png'
  ];

  // Load initial wishes from GET /api/wishes
  async function loadWishes() {
    try {
      const res = await fetch('/api/wishes');
      if (!res.ok) throw new Error('Gagal memuat ucapan');
      const wishes = await res.json();
      renderWishes(wishes);
    } catch (err) {
      console.warn('Fallback offline/error loading wishes:', err);
    }
  }

  // Render cards
  function renderWishes(wishes) {
    if (!wishesGrid) return;

    if (!Array.isArray(wishes) || wishes.length === 0) {
      wishesGrid.innerHTML = `
        <div class="wishes-empty-state">
          <img src="/assets/nailong-real-1.png" alt="Avatar" class="empty-state-nailong">
          <h4 style="font-family: var(--font-display); color: var(--color-mocha);">Belum ada ucapan</h4>
          <p style="font-size: 0.9rem; color: #8D6E63; margin-top: 0.25rem;">Jadilah yang pertama menuliskan ucapan selamat dan doa baik.</p>
        </div>
      `;
      if (countBadge) countBadge.textContent = '0 Ucapan';
      return;
    }

    if (countBadge) countBadge.textContent = `${wishes.length} Ucapan`;

    const stickyBgColors = ['#FFFDF9', '#FFF7ED', '#FFF2F5', '#F5FBFF', '#F9F7FC'];

    wishesGrid.innerHTML = wishes.map((item, index) => {
      const bg = stickyBgColors[index % stickyBgColors.length];
      const avatar = avatarList[index % avatarList.length];
      const timeStr = formatRelativeTime(item.createdAt);

      return `
        <div class="wish-card" style="background-color: ${bg};">
          <div class="wish-card-header">
            <img src="${avatar}" alt="Avatar" class="wish-avatar">
            <div class="wish-sender-info">
              <div class="wish-sender-name">${escapeHTML(item.name)}</div>
              <div class="wish-time">${timeStr}</div>
            </div>
          </div>
          <div class="wish-body">${escapeHTML(item.message)}</div>
        </div>
      `;
    }).join('');
  }

  // Form Submit POST /api/wishes
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wishName');
      const msgInput = document.getElementById('wishMessage');
      const submitBtn = document.getElementById('btnSubmitWish');

      const name = nameInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !message) {
        showToast('Harap isi nama dan pesan ucapan terlebih dahulu.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `Mengirim...`;

      try {
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, message })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Gagal mengirim ucapan');
        }

        if (window.soundEngine) window.soundEngine.playCelebration();
        form.reset();

        showToast('Ucapan dan doa berhasil dikirim dan tersimpan.');
        confettiBurst({ x: 0.7, y: 0.7, count: 35 });

        // Refresh board
        loadWishes();
      } catch (err) {
        showToast(err.message || 'Terjadi kesalahan saat mengirim.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Kirim Ucapan`;
      }
    });
  }

  loadWishes();
}

/* ===================================================
   UTILITY HELPERS
   =================================================== */
function showToast(msg) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Baru saja';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit yang lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam yang lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Confetti burst helper
function confettiBurst(options = {}) {
  const count = options.count || 35;
  const originX = (options.x || 0.5) * window.innerWidth;
  const originY = (options.y || 0.5) * window.innerHeight;

  const colors = ['#FFD166', '#FF85A1', '#80D8FF', '#57CC99', '#B8B8FF', '#FFAA00', '#FFCCD5'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const isCircle = Math.random() > 0.5;

    el.style.position = 'fixed';
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = isCircle ? '50%' : '2px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '9999';
    el.style.transition = 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.9s ease';

    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 180 + 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 30;
    const rotate = Math.random() * 720;

    requestAnimationFrame(() => {
      el.style.transform = `translate(${destX}px, ${destY}px) rotate(${rotate}deg)`;
      el.style.opacity = '0';
    });

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }
}
