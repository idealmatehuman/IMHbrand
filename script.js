/*********************************************************
 * (1) 데이터 ─ 실제 이미지가 있는 코드만 수록
 *********************************************************/
const data = {
  /* 여성 */
  female: [
    { label: '전체',   code: 'ALL_FEMALE' },
    { label: '유아',   code: 'FP_FK', max: 42 },
    { label: '청소년', code: 'FP_FJ', max: 41 },
    { label: '청년',   code: 'FP_FY', max: 73 },
    { label: '청장년', code: 'FP_FA', max: 32 },
    { label: '중장년', code: 'FP_FM', max: 20 },
    { label: '고령',   code: 'FP_FS', max: 20 }
  ],

  /* 남성 */
  male: [
    { label: '전체',   code: 'ALL_MALE' },
    { label: '유아',   code: 'MP_MK', max: 28 },
    { label: '청소년', code: 'MP_MJ', max: 39 },
    { label: '청년',   code: 'MP_MY', max: 26 },   // 6번 제외
    { label: '청장년', code: 'MP_MA', max: 20 },
    { label: '중장년', code: 'MP_MM', max: 20 },
    { label: '고령',   code: 'MP_MS', max: 20 }
  ],

  /* 동물 */
  animal: [
    { label: '전체',     code: 'ALL_ANIMAL' },
    { label: '야생동물', code: 'AP_WILD', max: 20 }
  ],

  /* 식물 */
  plants: [
    { label: '전체',   code: 'ALL_PLANTS' },
    { label: '꽃·화분', code: 'PP_FP',  max: 19 },
    { label: '나무',   code: 'PP_TP',  max: 14 }
  ],

  /* 카툰 */
  cartoon: [
    { label: '전체', code: 'ALL_CARTOON' },
    { label: '2D',  code: 'CP_2D',   max: 17 },
    { label: '2.5D',code: 'CP_2.5D', max: 14 },
    { label: '3D',  code: 'CP_3D',   max: 34 }
  ],

  /* 기타 */
  other: [
    { label: '전체', code: 'ALL_OTHER' },
    { label: '배경', code: 'OP_BG',   max: 10 }
  ],

  /* 업종별 */
  industry: [
    { label: '전체',        code: 'ALL_INDUSTRY' },
    { label: '전문직 관련', code: 'IP_PP',  max: 23 }
  ]
};

let currentGroup      = null;   // 상단 탭
let currentCategory   = null;   // { label, code, max } | null
let currentImageIndex = 0;      // 모달 인덱스

/*********************************************************
 * (2) 초기 세팅
 *********************************************************/
window.onload = () => renderAllThumbnails();

document.addEventListener('DOMContentLoaded', () => {
  setupTopTabs();
  bindGlobalKeyEvents();   // ESC / ← / →
});

/*********************************************************
 * (3) 상단 탭
 *********************************************************/
function setupTopTabs() {
  const buttons = document.querySelectorAll('#gender-tabs button');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;

      /* 상단 “전체” */
      if (group === 'all') {
        hideCategoryTabs();
        deactivateAllTabs();
        btn.classList.add('active');
        currentGroup = currentCategory = null;
        renderAllThumbnails();
        return;
      }

      /* 다른 탭 */
      if (btn.classList.contains('active')) {
        hideCategoryTabs();
        deactivateNonAllTabs();
        currentGroup = currentCategory = null;
      } else {
        deactivateAllTabs();
        btn.classList.add('active');
        currentGroup = group;
        currentCategory = null;
        showCategoryTabs(btn, group);
      }
    });
  });

  /* 네비게이션 외 클릭 → 드롭다운 닫기 */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
      hideCategoryTabs();
      deactivateNonAllTabs();
      currentGroup = currentCategory = null;
    }
  });
}

/*********************************************************
 * (4) 카테고리 드롭다운
 *********************************************************/
function showCategoryTabs(button, group) {
  const wrap = document.getElementById('category-tabs');
  wrap.innerHTML = '';

  const rect = button.getBoundingClientRect();
  Object.assign(wrap.style, {
    position: 'fixed',
    top : `${rect.bottom}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`
  });

  data[group].forEach((cat) => {
    const cbtn = document.createElement('button');
    cbtn.textContent = cat.label;
    if (currentCategory && cat.code === currentCategory.code) cbtn.classList.add('active');

    cbtn.addEventListener('click', () => {
      [...wrap.children].forEach(b => b.classList.remove('active'));
      cbtn.classList.add('active');
      currentCategory = cat;
      renderCategoryThumbnails(group, cat);
      hideCategoryTabs();
    });

    wrap.appendChild(cbtn);
  });

  wrap.classList.add('visible');
}

function hideCategoryTabs() {
  document.getElementById('category-tabs').classList.remove('visible');
}

/*********************************************************
 * (5) 탭 상태 유틸
 *********************************************************/
function deactivateAllTabs() {
  document.querySelectorAll('#gender-tabs button').forEach(b => b.classList.remove('active'));
}
function deactivateNonAllTabs() {
  document.querySelectorAll('#gender-tabs button:not([data-group="all"])')
          .forEach(b => b.classList.remove('active'));
}

/*********************************************************
 * (6) 썸네일 렌더
 *********************************************************/
function renderAllThumbnails() {
  const wrap = document.getElementById('thumbnails');
  wrap.classList.add('fade-out');

  setTimeout(() => {
    wrap.innerHTML = '';

    for (const [group, cats] of Object.entries(data)) {
      cats.forEach((cat) => {
        if (cat.code.startsWith('ALL_')) return;

        for (let i = 1; i <= cat.max; i++) {
          if (group === 'male' && cat.code === 'MP_MY' && i === 6) continue; // 예외
          wrap.appendChild(createThumbnailItem(cat.code, i.toString().padStart(4, '0')));
        }
      });
    }

    requestAnimationFrame(() => {
      wrap.classList.replace('fade-out', 'fade-in');
      setTimeout(() => wrap.classList.remove('fade-in'), 200);
    });
  }, 200);
}

function renderCategoryThumbnails(group, cat) {
  const wrap = document.getElementById('thumbnails');
  wrap.classList.add('fade-out');

  setTimeout(() => {
    wrap.innerHTML = '';

    /* “전체” 카테고리를 선택한 경우 */
    if (cat.code.startsWith('ALL_')) {
      data[group].forEach((c) => {
        if (c.code.startsWith('ALL_')) return;
        for (let i = 1; i <= c.max; i++) {
          if (group === 'male' && c.code === 'MP_MY' && i === 6) continue;
          wrap.appendChild(createThumbnailItem(c.code, i.toString().padStart(4, '0')));
        }
      });
    } else {   /* 단일 카테고리 */
      for (let i = 1; i <= cat.max; i++) {
        if (group === 'male' && cat.code === 'MP_MY' && i === 6) continue;
        wrap.appendChild(createThumbnailItem(cat.code, i.toString().padStart(4, '0')));
      }
    }

    requestAnimationFrame(() => {
      wrap.classList.replace('fade-out', 'fade-in');
      setTimeout(() => wrap.classList.remove('fade-in'), 200);
    });
  }, 200);
}

function createThumbnailItem(code, num) {
  const box = document.createElement('div');
  box.classList.add('thumbnail-item');

  const img = document.createElement('img');
  img.src = `모델/${code}_${num}_0001.png`;
  img.alt = `${code} 그룹 ${num}`;

  const lab = document.createElement('div');
  lab.classList.add('thumbnail-label');
  lab.textContent = `그룹 ${num}`;

  box.append(img, lab);
  box.addEventListener('click', () => openModal(code, num));
  return box;
}

/*********************************************************
 * (7) 전역 키 이벤트
 *********************************************************/
function bindGlobalKeyEvents() {
  const modal = document.getElementById('modal');
  modal.querySelector('.close').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.repeat) return;

    if (e.key === 'Escape')         closeModal();
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); showPrevImage(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showNextImage(); }
  });
}

/*********************************************************
 * (8) 모달 열기 — 스와이프 리스너 관리
 *********************************************************/
function openModal(code, num) {
  const modal = document.getElementById('modal');
  const cont  = modal.querySelector('.image-scroll-container');

  /* 이전 모달 리스너 해제 */
  if (window.modalSwipeCleanup) {
    window.modalSwipeCleanup();
    window.modalSwipeCleanup = null;
  }

  /* 콘텐츠 채우기 */
  cont.innerHTML = '';

  const hint    = Object.assign(document.createElement('div'), { className:'swipe-hint',   textContent:'좌우로 스와이프하여 이미지를 넘기세요' });
  const counter = Object.assign(document.createElement('div'), { className:'image-counter' });

  const prevBtn = Object.assign(document.createElement('button'), { className:'slide-button prev-button', textContent:'‹', ariaLabel:'이전 이미지' });
  const nextBtn = Object.assign(document.createElement('button'), { className:'slide-button next-button', textContent:'›', ariaLabel:'다음 이미지' });

  prevBtn.addEventListener('click', e => { e.stopPropagation(); showPrevImage(); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); showNextImage(); });

  cont.append(hint, counter, prevBtn, nextBtn);

  for (let i = 1; i <= 5; i++) {
    const img = document.createElement('img');
    img.src = `모델/${code}_${num}_${i.toString().padStart(4, '0')}.png`;
    img.alt = `${code}_${num}_${i}`;
    cont.appendChild(img);
  }

  /* 초기 이미지 */
  currentImageIndex = 0;
  showImage(currentImageIndex);

  /* 스와이프 */
  let dragging = false, startX = 0, pointerId = null, anim = false;
  const imgsSel = () => cont.querySelectorAll('img');

  function pointerDown(e) {
    if (anim || e.target.closest('.slide-button,.close')) return;
    dragging = true;
    startX = e.clientX;
    pointerId = e.pointerId;
    imgsSel().forEach(img => img.style.transition = 'none');
    cont.setPointerCapture(pointerId);
  }

  function pointerMove(e) {
    if (!dragging || e.pointerId !== pointerId || anim) return;
    const diff = e.clientX - startX;
    const imgs = imgsSel();
    const active = cont.querySelector('img.active');
    const idx = [...imgs].indexOf(active);

    active.style.transform = `translateX(calc(-50% + ${diff}px))`;

    const prev = imgs[(idx - 1 + imgs.length) % imgs.length];
    const next = imgs[(idx + 1) % imgs.length];

    if (prev) {
      prev.style.transform = `translateX(calc(-50% - 20px + ${diff}px))`;
      prev.style.opacity = diff > 0 ? '0.3' : '0';
    }
    if (next) {
      next.style.transform = `translateX(calc(-50% + 20px + ${diff}px))`;
      next.style.opacity = diff < 0 ? '0.3' : '0';
    }
  }

  function pointerEnd(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    const diff = e.clientX - startX;
    imgsSel().forEach(img => img.style.transition = 'all 0.3s ease');

    if (Math.abs(diff) > 50 && !anim) {
      anim = true;
      diff > 0 ? showPrevImage() : showNextImage();
      setTimeout(() => anim = false, 300);
    } else resetPositions();

    cont.releasePointerCapture(e.pointerId);
  }

  function resetPositions() {
    const imgs = imgsSel();
    const active = cont.querySelector('img.active');
    const idx = [...imgs].indexOf(active);

    imgs.forEach((img, i) => {
      img.style.opacity = (i === idx) ? '1' : '0.3';
      img.style.transform =
        i === idx ? 'translateX(-50%)' :
        i === (idx - 1 + imgs.length) % imgs.length ? 'translateX(calc(-50% - 20px))' :
        i === (idx + 1) % imgs.length ? 'translateX(calc(-50% + 20px))' :
        img.style.transform;
    });
  }

  /* 리스너 등록 */
  cont.addEventListener('pointerdown',  pointerDown);
  cont.addEventListener('pointermove',  pointerMove);
  cont.addEventListener('pointerup',    pointerEnd);
  cont.addEventListener('pointercancel',pointerEnd);

  /* 닫을 때 해제할 수 있도록 저장 */
  window.modalSwipeCleanup = () => {
    cont.removeEventListener('pointerdown',  pointerDown);
    cont.removeEventListener('pointermove',  pointerMove);
    cont.removeEventListener('pointerup',    pointerEnd);
    cont.removeEventListener('pointercancel',pointerEnd);
  };

  modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal.classList.contains('hidden')) return;

  if (window.modalSwipeCleanup) {
    window.modalSwipeCleanup();
    window.modalSwipeCleanup = null;
  }

  modal.querySelector('.image-scroll-container').innerHTML = '';
  modal.classList.add('hidden');
  currentImageIndex = 0;
}

/*********************************************************
 * (9) 이미지 표시
 *********************************************************/
function showImage(idx) {
  const imgs = document.querySelectorAll('.image-scroll-container img');
  if (!imgs.length) return;

  const hint    = document.querySelector('.swipe-hint');
  const counter = document.querySelector('.image-counter');

  imgs.forEach(img => {
    img.style.transition = 'none';
    img.classList.remove('active','prev','next');
    img.style.opacity = '0';
  });
  void imgs[0].offsetHeight; // reflow
  imgs.forEach(img => img.style.transition = 'all 0.3s ease');

  const cur  = imgs[idx];
  const prev = imgs[(idx - 1 + imgs.length) % imgs.length];
  const next = imgs[(idx + 1) % imgs.length];

  if (cur)  { cur.classList.add('active'); cur.style.opacity = '1';   cur.style.transform = 'translateX(-50%)'; }
  if (prev) { prev.classList.add('prev');  prev.style.opacity = '0.3'; prev.style.transform = 'translateX(calc(-50% - 20px))'; }
  if (next) { next.classList.add('next');  next.style.opacity = '0.3'; next.style.transform = 'translateX(calc(-50% + 20px))'; }

  counter.textContent = `${idx+1} / ${imgs.length}`;
  hint.classList.add('visible');
}

function showNextImage() {
  const imgs = document.querySelectorAll('.image-scroll-container img');
  if (!imgs.length) return;
  currentImageIndex = (currentImageIndex + 1) % imgs.length;
  showImage(currentImageIndex);
}

function showPrevImage() {
  const imgs = document.querySelectorAll('.image-scroll-container img');
  if (!imgs.length) return;
  currentImageIndex = (currentImageIndex - 1 + imgs.length) % imgs.length;
  showImage(currentImageIndex);
}
