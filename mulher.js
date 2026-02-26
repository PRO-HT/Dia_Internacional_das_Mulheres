/* ===================================================
   mulher.js — Contador + Carrosséis com Swipe + Animações
=================================================== */

/* ─── CONTADOR COM INTERSECTION OBSERVER ─────────── */
const numeros = document.querySelectorAll('.numero');

function animarContador(el) {
  const alvo    = parseInt(el.getAttribute('data-target'));
  const duracao = alvo > 1000 ? 2200 : 1300;
  const inicio  = performance.now();

  el.classList.add('visivel');

  function atualizar(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const eased = 1 - Math.pow(1 - progresso, 3);
    const atual = Math.floor(eased * alvo);
    el.textContent = atual.toLocaleString('pt-BR');
    if (progresso < 1) requestAnimationFrame(atualizar);
    else el.textContent = alvo.toLocaleString('pt-BR');
  }

  requestAnimationFrame(atualizar);
}

const observerContador = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animarContador(entry.target);
      observerContador.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

numeros.forEach(n => observerContador.observe(n));


/* ─── FÁBRICA DE CARROSSEL COM SWIPE ─────────────── */
/*
  Cria um carrossel totalmente controlado por JS.
  Remove a animação CSS e passa o controle pro JS,
  permitindo toque, swipe e auto-play.

  Parâmetros:
    wrapperSel  — seletor do .carousel-wrapper
    slideSel    — seletor do .carousel-slide (filho)
    dotsSel     — seletor dos dots
    total       — número de slides
    intervalo   — ms entre trocas automáticas
*/
function criarCarrossel({ wrapperSel, slideSel, dotsSel, total, intervalo }) {
  const wrapper = document.querySelector(wrapperSel);
  const slide   = document.querySelector(slideSel);
  const dots    = document.querySelectorAll(dotsSel);

  if (!wrapper || !slide) return;

  // Para a animação CSS — agora o JS manda
  slide.style.animation = 'none';
  slide.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  let atual     = 0;
  let timer     = null;
  let touchIni  = 0;
  let touchFim  = 0;
  let arrastando = false;

  /* Largura de cada slide em % da faixa total */
  const pct = 100 / total;

  function irPara(index) {
    // Wrap circular
    atual = (index + total) % total;
    slide.style.transform = `translateX(-${atual * pct}%)`;

    // Atualiza dots
    dots.forEach((d, i) => d.classList.toggle('ativo', i === atual));
  }

  function proximo()  { irPara(atual + 1); }
  function anterior() { irPara(atual - 1); }

  /* Auto-play */
  function iniciarTimer() {
    clearInterval(timer);
    timer = setInterval(proximo, intervalo);
  }

  function pararTimer() { clearInterval(timer); }

  iniciarTimer();

  /* ── Touch events ── */
  wrapper.addEventListener('touchstart', (e) => {
    touchIni   = e.touches[0].clientX;
    arrastando = true;
    pararTimer();
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!arrastando) return;
    touchFim = e.touches[0].clientX;

    // Feedback visual em tempo real — arrasta junto com o dedo
    const delta    = touchFim - touchIni;
    const deslocPct = (delta / wrapper.offsetWidth) * pct;
    slide.style.transition = 'none'; // sem suavização enquanto arrasta
    slide.style.transform  = `translateX(calc(-${atual * pct}% + ${deslocPct}%))`;
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    if (!arrastando) return;
    arrastando = false;

    const delta = touchFim - touchIni;
    slide.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    if (delta < -50) {
      proximo();     // swipe para esquerda → próximo
    } else if (delta > 50) {
      anterior();    // swipe para direita → anterior
    } else {
      irPara(atual); // swipe curto → volta para o atual
    }

    // Reinicia o auto-play após interação
    iniciarTimer();

    // Reseta valores
    touchIni = 0;
    touchFim = 0;
  });

  /* ── Clique nos dots ── */
  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      irPara(i);
      iniciarTimer();
    });
  });

  /* Inicializa na posição 0 sem animação */
  slide.style.transition = 'none';
  irPara(0);
  setTimeout(() => {
    slide.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }, 50);
}

/* ── Inicia carrossel principal (3 slides) ── */
criarCarrossel({
  wrapperSel: '.carousel-wrapper:not(.carousel-redes .carousel-wrapper)',
  slideSel:   '.carousel-slide:not(.carousel-slide-2)',
  dotsSel:    '.carousel-dots:not(.carousel-dots-2) span',
  total:      3,
  intervalo:  4000,
});

/* ── Inicia carrossel de redes (2 slides) ── */
criarCarrossel({
  wrapperSel: '.carousel-redes .carousel-wrapper',
  slideSel:   '.carousel-slide-2',
  dotsSel:    '.carousel-dots-2 span',
  total:      2,
  intervalo:  4000,
});


/* ─── ANIMAÇÃO DE ENTRADA (fade + subida) ─────────── */
const elementosAnimados = document.querySelectorAll(
  '.mulher-card, ' +
  '.secao-lei .Paragrafo, .secao-lei h2, .secao-lei .lei-badge, ' +
  '.fem-reflexao-card, .fem-frase-impacto, .fem-definicao, .fem-perguntas, .fem-ajuda, ' +
  '.rede-card'
);

elementosAnimados.forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
});

const observerCards = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const grids = ['.mulheres-grid', '.fem-reflexoes-grid', '.redes-grid'];
      const noGrid = grids.some(sel => entry.target.closest(sel));
      const delay  = noGrid
        ? Array.from(entry.target.parentNode.children).indexOf(entry.target) * 80
        : 0;

      setTimeout(() => {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
      }, delay);

      observerCards.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

elementosAnimados.forEach(el => observerCards.observe(el));