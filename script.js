/*********************************************************
 * (1) 성별+카테고리 데이터
 *********************************************************/
const data = {
  female: [
    { label: '전체', code: 'ALL_FEMALE' },
    { label: '유아', code: 'FP_FK', max: 42 },
    { label: '청소년', code: 'FP_FJ', max: 41 },
    { label: '청장년', code: 'FP_FA', max: 32 },
    { label: '청년', code: 'FP_FY', max: 73 },
    { label: '중장년', code: 'FP_FM', max: 20 },
    { label: '고령', code: 'FP_FS', max: 20 }
  ],
  male: [
    { label: '전체', code: 'ALL_MALE' },
    { label: '유아', code: 'MP_MK', max: 20 },
    { label: '청소년', code: 'MP_MJ', max: 20 },
    { label: '청장년', code: 'MP_MA', max: 20 },
    { label: '청년', code: 'MP_MY', max: 20 },  // 여기서 6번 이미지만 제외
    { label: '중장년', code: 'MP_MM', max: 20 },
    { label: '고령', code: 'MP_MS', max: 20 }
  ]
};

let currentGender = null;   // "female" or "male" or null
let currentCategory = null; // { label, code, max }
let currentImageIndex = 0;  // 모달 슬라이드 인덱스

/*********************************************************
 * (2) 초기화
 *********************************************************/
window.onload = () => {
  // 시작 시 전체(여+남) 이미지 표시
  renderAllThumbnails();
};

document.addEventListener('DOMContentLoaded', () => {
  setupGenderTabs();   // 상단 탭 (여성/남성 토글, 하위메뉴)
  setupModalEvents();  // 모달 기본 이벤트 (닫기 버튼, ESC)
  closeModal();        // 초기에는 모달 닫힘
});

/*********************************************************
 * (3) 상단 탭 세팅 (토글 방식)
 *********************************************************/
function setupGenderTabs() {
  const genderButtons = document.querySelectorAll('#gender-tabs button');
  const categoryTabs = document.getElementById('category-tabs');

  genderButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const gender = btn.dataset.gender;

      // 1) "전체(all)" 버튼
      if (gender === 'all') {
        // 현재 열려 있던 하위 메뉴 닫기
        hideCategoryTabs();
        removeActiveFromAllButtons();

        // "전체" 탭만 active
        btn.classList.add('active');

        // 변수 초기화
        currentGender = null;
        currentCategory = null;

        // 전체 썸네일 렌더
        renderAllThumbnails();
        return;
      }

      // 2) 여성 or 남성 버튼
      if (btn.classList.contains('active')) {
        // [A] 이미 같은 성별이 열려 있음 -> 닫기
        hideCategoryTabs();
        removeActiveFromGenderButtons();
        currentGender = null;
        currentCategory = null;
      } else {
        // [B] 다른 성별이거나, 이전에 없던 성별 -> 열기
        removeActiveFromAllButtons(); // 전체, 여성, 남성 모두 해제
        btn.classList.add('active');
        currentGender = gender;
        currentCategory = null;
        showCategoryTabs(btn, gender);
      }
    });
  });

  // 영역 밖을 클릭하면 하위 메뉴 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container')) {
      hideCategoryTabs();
      removeActiveFromGenderButtons();
      currentGender = null;
      currentCategory = null;
    }
  });
}

/*********************************************************
 * (4) 카테고리 탭(드롭다운) 표시
 *     -> 버튼 바로 아래에 최대한 붙도록 위치 세팅
 *********************************************************/
function showCategoryTabs(button, gender) {
  const categoryTabs = document.getElementById('category-tabs');
  if (!categoryTabs) return;

  // 하위 메뉴 초기화
  categoryTabs.innerHTML = '';

  // 버튼의 화면상 위치 정보
  const rect = button.getBoundingClientRect();

  // (중요) 버튼의 bottom 값(아래쪽 좌표)을 top으로 지정해서
  //        버튼 바로 아래 붙게 만든다
  categoryTabs.style.position = 'fixed';
  categoryTabs.style.top = `${rect.bottom}px`; // rect.bottom이 버튼 아래쪽
  categoryTabs.style.left = `${rect.left}px`;
  categoryTabs.style.minWidth = `${rect.width}px`;

  // 해당 성별 하위 카테고리 생성
  const categories = data[gender];
  categories.forEach((cat) => {
    const cbtn = document.createElement('button');
    cbtn.textContent = cat.label;

    if (currentCategory && cat.code === currentCategory.code) {
      cbtn.classList.add('active');
    }

    // 카테고리 선택 시
    cbtn.addEventListener('click', () => {
      // 하위 버튼들 active 해제 -> 현재만 active
      Array.from(categoryTabs.children).forEach((ch) => ch.classList.remove('active'));
      cbtn.classList.add('active');
      currentCategory = cat;

      // 해당 카테고리 썸네일 렌더
      renderCategoryThumbnails(gender, cat);

      // 하위 메뉴 닫기
      hideCategoryTabs();
    });

    categoryTabs.appendChild(cbtn);
  });

  // 보여주기
  categoryTabs.classList.add('visible');
}

// 하위 메뉴 닫기
function hideCategoryTabs() {
  const categoryTabs = document.getElementById('category-tabs');
  categoryTabs.classList.remove('visible');
}

/*********************************************************
 * (5) 버튼들의 active 해제 유틸
 *********************************************************/
function removeActiveFromAllButtons() {
  const buttons = document.querySelectorAll('#gender-tabs button');
  buttons.forEach((b) => b.classList.remove('active'));
}
function removeActiveFromGenderButtons() {
  const btns = document.querySelectorAll('#gender-tabs button[data-gender="female"], #gender-tabs button[data-gender="male"]');
  btns.forEach((b) => b.classList.remove('active'));
}

/*********************************************************
 * (6) 썸네일 렌더링
 *********************************************************/

/** (6-1) 전체(여+남) 렌더링 */
function renderAllThumbnails() {
  const container = document.getElementById('thumbnails');
  container.classList.add('fade-out');
  
  setTimeout(() => {
    container.innerHTML = '';

    // 여성/남성 모든 카테고리
    Object.entries(data).forEach(([genderKey, categories]) => {
      categories.forEach((cat) => {
        if (cat.code.startsWith('ALL_')) return; // ALL_FEMALE / ALL_MALE 제외

        for (let i = 1; i <= cat.max; i++) {
          // ★ 남성 카테고리(MP_MY)만 6번 제외
          if (genderKey === 'male' && cat.code === 'MP_MY' && i === 6) {
            continue;
          }

          const groupNum = i.toString().padStart(4, '0');
          container.appendChild(createThumbnailItem(cat.code, groupNum));
        }
      });
    });

    requestAnimationFrame(() => {
      container.classList.remove('fade-out');
      container.classList.add('fade-in');
      setTimeout(() => {
        container.classList.remove('fade-in');
      }, 200);
    });
  }, 200);
}

/** (6-2) 특정 성별+카테고리 렌더링 */
function renderCategoryThumbnails(gender, cat) {
  const container = document.getElementById('thumbnails');
  container.classList.add('fade-out');
  
  setTimeout(() => {
    container.innerHTML = '';

    // (A) 여성 전체
    if (cat.code === 'ALL_FEMALE') {
      data.female.forEach((c) => {
        if (c.code.startsWith('ALL_')) return;
        for (let i = 1; i <= c.max; i++) {
          // 여성 카테고리는 그대로 → skip 로직 없음
          const groupNum = i.toString().padStart(4, '0');
          container.appendChild(createThumbnailItem(c.code, groupNum));
        }
      });
    }
    // (B) 남성 전체
    else if (cat.code === 'ALL_MALE') {
      data.male.forEach((c) => {
        if (c.code.startsWith('ALL_')) return;
        for (let i = 1; i <= c.max; i++) {
          // ★ 남성 ALL 중에서도 MP_MY && 6번만 제외
          if (c.code === 'MP_MY' && i === 6) {
            continue;
          }
          const groupNum = i.toString().padStart(4, '0');
          container.appendChild(createThumbnailItem(c.code, groupNum));
        }
      });
    }
    // (C) 특정 카테고리
    else {
      for (let i = 1; i <= cat.max; i++) {
        // 남성 + MP_MY && 6번만 제외
        if (gender === 'male' && cat.code === 'MP_MY' && i === 6) {
          continue;
        }

        const groupNum = i.toString().padStart(4, '0');
        container.appendChild(createThumbnailItem(cat.code, groupNum));
      }
    }

    requestAnimationFrame(() => {
      container.classList.remove('fade-out');
      container.classList.add('fade-in');
      setTimeout(() => {
        container.classList.remove('fade-in');
      }, 200);
    });
  }, 200);
}

/** (6-3) 썸네일 DOM 생성 */
function createThumbnailItem(code, groupNum) {
  const thumb = document.createElement('div');
  thumb.classList.add('thumbnail-item');

  const img = document.createElement('img');
  img.src = `모델/${code}_${groupNum}_0001.png`;
  img.alt = `${code} 그룹 ${groupNum}`;
  img.loading = 'lazy';

  const label = document.createElement('div');
  label.classList.add('thumbnail-label');
  label.textContent = `그룹 ${groupNum}`;

  thumb.addEventListener('click', () => openModal(code, groupNum));

  thumb.appendChild(img);
  thumb.appendChild(label);
  return thumb;
}

/*********************************************************
 * (7) 모달 이벤트 (닫기 버튼, ESC)
 *********************************************************/
function setupModalEvents() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  // 닫기 버튼
  const closeBtn = modal.querySelector('.close');
  closeBtn?.addEventListener('click', closeModal);

  // ESC 키
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  document.addEventListener('keydown', handleKeyDown);

  // 이벤트 해제
  return function cleanup() {
    closeBtn?.removeEventListener('click', closeModal);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/*********************************************************
 * (8) 모달 열기
 *********************************************************/
function openModal(code, groupNum) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  // 이전 모달 이벤트 정리
  if (window.modalCleanup) {
    window.modalCleanup();
  }

  // 새 모달 설정
  window.modalCleanup = (function() {
    // (A) 기본 닫기 이벤트
    const baseCleanup = setupModalEvents();

    // (B) 이미지/화살표 세팅
    const container = modal.querySelector('.image-scroll-container');
    container.innerHTML = '';

    // 스와이프 힌트
    const swipeHint = document.createElement('div');
    swipeHint.classList.add('swipe-hint');
    swipeHint.textContent = '좌우로 스와이프하여 이미지를 넘기세요';
    container.appendChild(swipeHint);

    // 카운터
    const counter = document.createElement('div');
    counter.classList.add('image-counter');
    container.appendChild(counter);

    // 이전/다음 버튼
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('slide-button', 'prev-button');
    prevBtn.textContent = '‹';
    prevBtn.setAttribute('aria-label', '이전 이미지');
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevImage();
    });
    container.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('slide-button', 'next-button');
    nextBtn.textContent = '›';
    nextBtn.setAttribute('aria-label', '다음 이미지');
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextImage();
    });
    container.appendChild(nextBtn);

    // 5장 이미지
    for (let i = 1; i <= 5; i++) {
      const imgNum = i.toString().padStart(4, '0');
      const img = document.createElement('img');
      img.src = `모델/${code}_${groupNum}_${imgNum}.png`;
      img.alt = `${code}_${groupNum}_${imgNum}`;
      container.appendChild(img);
    }

    // 첫 이미지 표시
    currentImageIndex = 0;
    showImage(currentImageIndex);

    // (C) Pointer 스와이프 이벤트
    let isDragging = false;
    let isAnimating = false;
    let startX = 0;
    let pointerId = null;

    function handlePointerDown(e) {
      // 화살표/닫기버튼 클릭은 스와이프 X
      if (isAnimating) return;
      if (
        e.target.classList.contains('slide-button') ||
        e.target.classList.contains('close')
      ) {
        return; 
      }

      isDragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;

      // 트랜지션 제거
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.style.transition = 'none';
      });

      container.setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e) {
      if (!isDragging || e.pointerId !== pointerId || isAnimating) return;
      const diff = e.clientX - startX;

      const images = container.querySelectorAll('img');
      const activeImage = container.querySelector('img.active');
      if (!activeImage) return;

      const activeIndex = Array.from(images).indexOf(activeImage);

      // 현재(중앙) 이미지 이동
      activeImage.style.transform = `translateX(calc(-50% + ${diff}px))`;

      // 이전
      const prevImg = images[(activeIndex - 1 + images.length) % images.length];
      if (prevImg) {
        prevImg.style.transform = `translateX(calc(-50% - 20px + ${diff}px))`;
        prevImg.style.opacity = diff > 0 ? '0.3' : '0';
      }

      // 다음
      const nextImg = images[(activeIndex + 1) % images.length];
      if (nextImg) {
        nextImg.style.transform = `translateX(calc(-50% + 20px + ${diff}px))`;
        nextImg.style.opacity = diff < 0 ? '0.3' : '0';
      }
    }

    function handlePointerUp(e) {
      if (!isDragging || e.pointerId !== pointerId) return;
      isDragging = false;
      pointerId = null;

      const diff = e.clientX - startX;
      const threshold = 50;

      // 트랜지션 복구
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        img.style.transition = 'all 0.3s ease';
      });

      if (!isAnimating && Math.abs(diff) > threshold) {
        isAnimating = true;
        if (diff > 0) {
          showPrevImage();
        } else {
          showNextImage();
        }
        setTimeout(() => {
          isAnimating = false;
        }, 300);
      } else {
        resetImagePositions();
      }

      container.releasePointerCapture(e.pointerId);
    }

    function resetImagePositions() {
      const images = container.querySelectorAll('img');
      const activeImage = container.querySelector('img.active');
      if (!activeImage) return;

      const activeIndex = Array.from(images).indexOf(activeImage);
      images.forEach((img, index) => {
        if (index === activeIndex) {
          img.style.transform = 'translateX(-50%)';
          img.style.opacity = '1';
        } else if (index === (activeIndex - 1 + images.length) % images.length) {
          img.style.transform = 'translateX(calc(-50% - 20px))';
          img.style.opacity = '0.3';
        } else if (index === (activeIndex + 1) % images.length) {
          img.style.transform = 'translateX(calc(-50% + 20px))';
          img.style.opacity = '0.3';
        } else {
          img.style.opacity = '0';
        }
      });
    }

    // 이벤트 등록
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);

    // 해제 함수
    return () => {
      baseCleanup();

      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
    };
  })();

  // 모달 표시
  modal.classList.remove('hidden');
}

/** 모달 닫기 */
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  modal.classList.add('hidden');

  // 내용 비우기
  const container = modal.querySelector('.image-scroll-container');
  if (container) {
    container.innerHTML = '';
  }

  currentImageIndex = 0;

  // 이벤트 해제
  if (window.modalCleanup) {
    window.modalCleanup();
    window.modalCleanup = null;
  }
}

/*********************************************************
 * (9) 모달 슬라이드 (이전/다음)
 *********************************************************/
function showImage(index) {
  const images = document.querySelectorAll('.image-scroll-container img');
  if (!images.length) return;

  const swipeHint = document.querySelector('.swipe-hint');
  const counter = document.querySelector('.image-counter');

  // 초기화
  images.forEach((img) => {
    img.style.transition = 'none';
    img.classList.remove('active', 'prev', 'next');
    img.style.transform = '';
    img.style.opacity = '0';
  });

  // 강제 리플로우
  void images[0].offsetHeight;

  images.forEach((img) => {
    img.style.transition = 'all 0.3s ease';
  });

  // 현재
  const currentImg = images[index];
  if (currentImg) {
    currentImg.classList.add('active');
    currentImg.style.opacity = '1';
    currentImg.style.transform = 'translateX(-50%)';
  }

  // 이전
  const prevIndex = (index - 1 + images.length) % images.length;
  const prevImg = images[prevIndex];
  if (prevImg) {
    prevImg.classList.add('prev');
    prevImg.style.opacity = '0.3';
    prevImg.style.transform = 'translateX(calc(-50% - 20px))';
  }

  // 다음
  const nextIndex = (index + 1) % images.length;
  const nextImg = images[nextIndex];
  if (nextImg) {
    nextImg.classList.add('next');
    nextImg.style.opacity = '0.3';
    nextImg.style.transform = 'translateX(calc(-50% + 20px))';
  }

  // 카운터 표시
  if (counter) {
    counter.textContent = `${index + 1} / ${images.length}`;
  }

  // 스와이프 힌트
  if (swipeHint) {
    swipeHint.classList.add('visible');
  }
}

function showNextImage() {
  const images = document.querySelectorAll('.image-scroll-container img');
  if (!images.length) return;

  currentImageIndex = (currentImageIndex + 1) % images.length;
  showImage(currentImageIndex);
}

function showPrevImage() {
  const images = document.querySelectorAll('.image-scroll-container img');
  if (!images.length) return;

  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  showImage(currentImageIndex);
}
