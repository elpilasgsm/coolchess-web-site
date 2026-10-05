const prices = {
  25: { title: 'Идеально для самых маленьких', description: 'Подберём программу под возраст, уровень и цель ученика', age: 'Детям с 4 до 6 лет', image: 'assets/30.webp', imageAlt: 'Ребёнок рядом с большой шахматной фигурой', items: [[1,1200],[4,3800],[8,7120],[16,13280],[24,18960]] },
  45: { title: 'Для детей постарше', description: 'Идеальное занятие, чтобы ребёнок не успел утомиться и был полностью вовлечён в процесс обучения', age: 'Детям с 7 до 12 лет', image: 'assets/pricing-45.webp', imageAlt: 'Шахматная композиция для детей постарше', items: [[1,1650],[4,5600],[8,10800],[16,20800],[24,28800]] },
  60: { title: 'Для будущих чемпионов', description: 'Занятия для тех, кто хочет участвовать в соревнованиях и побеждать', age: 'С 14 лет', image: 'assets/pricing-60.webp', imageAlt: 'Шахматные фигуры на руке', items: [[1,2100],[4,7200],[8,14000],[16,26080],[24,37200]] }
};

const formatPrice = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const lessonWord = count => count === 1 ? 'занятие' : count === 4 || count === 24 ? 'занятия' : 'занятий';
const trialUrl = document.querySelector('#trial-modal iframe').dataset.src;
let duration = 25;
let selectedPackage = null;
let lastFocus = null;

function renderPrices() {
  const tier = prices[duration];
  document.querySelector('#price-title').textContent = tier.title;
  document.querySelector('#price-description').textContent = tier.description;
  document.querySelector('#price-age').textContent = tier.age;
  const image = document.querySelector('#price-image');
  image.src = tier.image;
  image.alt = tier.imageAlt;
  document.querySelector('.pricing-profile').dataset.tier = duration;
  document.querySelectorAll('[data-duration]').forEach(button => {
    const active = Number(button.dataset.duration) === duration;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#price-grid').innerHTML = `
    <button class="price-card price-card-trial" type="button" aria-label="Пробное занятие, 500 рублей. Перейти к оплате">
      <span class="count">Пробное занятие</span>
      <span class="price-card-bottom"><strong>500 ₽</strong><span class="price-card-arrow" aria-hidden="true">↗</span></span>
    </button>` + tier.items.map(([count, sum]) => `
    <button class="price-card" type="button" data-price-count="${count}" aria-label="${count} ${lessonWord(count)}, ${formatPrice(sum)}, ${duration} минут. Перейти к оплате">
      <span class="count">${count} ${lessonWord(count)}</span>
      <span class="price-card-bottom"><span><strong>${formatPrice(sum)}</strong>${count > 1 ? `<small>Стоимость 1 занятия ${formatPrice(Math.round(sum/count))}</small>` : ''}</span><span class="price-card-arrow" aria-hidden="true">↗</span></span>
    </button>`).join('');
  document.querySelector('.price-card-trial').addEventListener('click', () => openPayment('trial'));
  document.querySelectorAll('[data-price-count]').forEach(button => button.addEventListener('click', () => openPayment(Number(button.dataset.priceCount))));
}

function openModal(id) {
  lastFocus = document.activeElement;
  const modal = document.querySelector(`#${id}`);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(modal => modal.hidden = true);
  document.body.classList.remove('modal-open');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

function openTrial() {
  if (!['coolchess.ru', 'www.coolchess.ru'].includes(location.hostname)) {
    location.href = trialUrl;
    return;
  }
  openModal('trial-modal');
  const frame = document.querySelector('#trial-modal iframe');
  if (!frame.src) frame.src = frame.dataset.src;
}

function selectPaymentPackage(count) {
  const isTrial = count === 'trial';
  const item = isTrial ? ['trial', 500] : prices[duration].items.find(([quantity]) => quantity === count);
  if (!item) return;
  selectedPackage = item;
  const service = isTrial ? 'Пробное занятие' : `${count} ${lessonWord(count)}`;
  document.querySelector('#pay-service').value = service;
  document.querySelector('#pay-sum').value = String(item[1]);
  document.querySelector('#payment-summary').textContent = `${service} · ${formatPrice(item[1])}`;
  document.querySelector('#payment-followup').hidden = !isTrial;
  document.querySelectorAll('.payment-option').forEach(button => {
    const selected = button.dataset.package === String(count);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function openPayment(preselect = null) {
  const isTrial = preselect === 'trial';
  selectedPackage = null;
  document.querySelector('#pay-service').value = '';
  document.querySelector('#pay-sum').value = '';
  document.querySelector('#payment-title').textContent = isTrial ? 'Оплата пробного урока' : 'Оплата занятий';
  document.querySelector('#payment-choice-heading').textContent = isTrial ? 'Пробный урок' : 'Выберите занятие или пакет';
  document.querySelector('#payment-summary').textContent = 'Выберите занятие или пакет';
  document.querySelector('#payment-followup').hidden = true;
  document.querySelector('#payment-options').innerHTML = `<button class="payment-option" type="button" data-package="trial" aria-pressed="false"><span>Пробное занятие</span><strong>500 ₽</strong></button>` + (isTrial ? '' : prices[duration].items.map(([count,sum]) => `<button class="payment-option" type="button" data-package="${count}" aria-pressed="false"><span>${count} ${lessonWord(count)}</span><strong>${formatPrice(sum)}</strong></button>`).join(''));
  document.querySelectorAll('[data-package]').forEach(button => button.addEventListener('click', () => selectPaymentPackage(button.dataset.package === 'trial' ? 'trial' : Number(button.dataset.package))));
  if (preselect) selectPaymentPackage(preselect);
  openModal('payment-modal');
}

document.querySelectorAll('[data-duration]').forEach(button => button.addEventListener('click', () => {
  duration = Number(button.dataset.duration);
  renderPrices();
}));
document.querySelectorAll('[data-open-trial]').forEach(button => button.addEventListener('click', openTrial));

const trialFeatures = [...document.querySelectorAll('.trial-features li')].map(feature => {
  const button = feature.querySelector('.trial-feature-button');
  const tip = feature.querySelector('.trial-feature-tip');
  let hovered = false;
  const hide = () => {
    tip.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    feature.classList.remove('trial-feature-open');
  };
  const show = () => {
    trialFeatures.forEach(other => other.hide());
    const visual = feature.closest('.trial-visual').getBoundingClientRect();
    const label = button.getBoundingClientRect();
    const width = Math.min(340, visual.width);
    const labelCenter = label.left + label.width / 2;
    const center = Math.max(visual.left + width / 2, Math.min(labelCenter, visual.right - width / 2));
    tip.style.width = `${width}px`;
    tip.style.left = `${center - feature.getBoundingClientRect().left}px`;
    tip.style.setProperty('--trial-tip-arrow', `${labelCenter - center + width / 2 - 6}px`);
    tip.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    feature.classList.add('trial-feature-open');
  };
  feature.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    show();
  });
  feature.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    hovered = false;
    if (!button.matches(':focus-visible')) hide();
  });
  button.addEventListener('focus', () => { if (button.matches(':focus-visible')) show(); });
  button.addEventListener('blur', () => { if (!hovered) hide(); });
  button.addEventListener('click', () => { if (tip.hidden) show(); else hide(); });
  return { feature, hide };
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.trial-features')) trialFeatures.forEach(feature => feature.hide());
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') trialFeatures.forEach(feature => feature.hide());
});
window.addEventListener('resize', () => trialFeatures.forEach(feature => feature.hide()));

document.querySelector('#open-payment').addEventListener('click', () => openPayment());
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
document.addEventListener('keydown', event => {
  const modal = document.querySelector('.modal:not([hidden])');
  if (!modal) return;
  if (event.key === 'Escape') closeModals();
  if (event.key !== 'Tab') return;
  const controls = [...modal.querySelectorAll('button, input, a[href], iframe')].filter(control => !control.disabled && control.getClientRects().length);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
document.querySelector('#payment-form').addEventListener('submit', event => {
  if (!selectedPackage) {
    event.preventDefault();
    document.querySelector('#payment-options button')?.focus();
    alert('Выберите занятие или пакет.');
  }
});

const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  document.querySelector('#nav-links').classList.toggle('open', !expanded);
});
document.querySelectorAll('#nav-links a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  document.querySelector('#nav-links').classList.remove('open');
}));

const pupilStories = {
  masha: {
    name: 'Маша, 9 лет', image: 'assets/story-masha-optimized.webp', alt: 'Маша, 9 лет, ученица CoolChess',
    periods: ['ноябрь 2025 года', 'январь 2026 года'], levels: ['новичок', 'турнирный уровень'],
    text: 'Пришла, не зная даже всех правил. Постепенно научилась играть увереннее и начала участвовать в турнирах.'
  },
  alexandra: {
    name: 'Александра, 12 лет', image: 'assets/story-alexandra-optimized.webp', alt: 'Александра, 12 лет',
    periods: ['на первых занятиях', 'теперь'], levels: ['знает правила', 'играет осознанно'],
    text: 'Знала правила, но часто ходила наугад. На занятиях научилась замечать угрозы и строить план. Теперь играет вдумчивее и спокойно разбирает ошибки.'
  },
  slava: {
    name: 'Слава, 4 года', image: 'assets/story-slava-optimized.webp', alt: 'Слава, 4 года',
    periods: ['на первых занятиях', 'теперь'], levels: ['первый шаг', 'знает фигуры'],
    text: 'Сначала фигуры были просто игрушками. Через сказки и короткие задания Слава запомнил их названия и ходы. Теперь сам расставляет шахматы и с интересом решает первые задачки.'
  }
};
const pupilButtons = document.querySelectorAll('.results-pupil');
const pupilStory = document.querySelector('.results-story');
const pupilPortrait = pupilStory.querySelector('.results-portrait');
const pupilImages = new Map();
let requestedPupil = 'masha';

function preparePupilImage(id) {
  if (pupilImages.has(id)) return pupilImages.get(id);
  const story = pupilStories[id];
  const image = id === pupilPortrait.dataset.pupil ? pupilPortrait.querySelector('img') : new Image();
  image.loading = 'eager';
  image.decoding = 'async';
  image.alt = story.alt;
  if (image.getAttribute('src') !== story.image) image.src = story.image;
  const ready = image.decode().then(() => image).catch(error => {
    pupilImages.delete(id);
    throw error;
  });
  pupilImages.set(id, ready);
  return ready;
}

function preloadPupilImages() {
  return Promise.allSettled(Object.keys(pupilStories).map(preparePupilImage));
}

if ('IntersectionObserver' in window) {
  const pupilObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    preloadPupilImages();
    pupilObserver.disconnect();
  }, { rootMargin: '1000px' });
  pupilObserver.observe(document.querySelector('#results'));
} else {
  preloadPupilImages();
}

async function selectPupil(id) {
  const story = pupilStories[id];
  if (!story) return;
  requestedPupil = id;
  let portrait;
  try {
    portrait = await preparePupilImage(id);
  } catch {
    return;
  }
  if (requestedPupil !== id) return;
  pupilButtons.forEach(button => {
    const selected = button.dataset.pupil === id;
    button.classList.toggle('results-pupil-current', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  pupilStory.setAttribute('aria-label', `История: ${story.name}`);
  pupilPortrait.dataset.pupil = id;
  pupilPortrait.replaceChildren(portrait);
  pupilStory.querySelectorAll('.results-story-period').forEach((period, index) => period.textContent = story.periods[index]);
  pupilStory.querySelectorAll('.results-story-level').forEach((level, index) => level.textContent = story.levels[index]);
  pupilStory.querySelector('.results-story-copy p').textContent = story.text;
}
pupilButtons.forEach(button => button.addEventListener('click', () => selectPupil(button.dataset.pupil)));

const trainersDialog = document.querySelector('#trainers-dialog');
document.querySelector('.trainers-all').addEventListener('click', () => {
  trainersDialog.showModal();
  trainersDialog.scrollTop = 0;
  document.body.classList.add('modal-open');
});
trainersDialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
trainersDialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...trainersDialog.querySelectorAll('button, summary')];
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
});
trainersDialog.addEventListener('click', event => {
  const bounds = trainersDialog.getBoundingClientRect();
  if (event.target === trainersDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) trainersDialog.close();
});

const quizQuestions = [
  { question: 'Кто будет заниматься?', options: ['ребёнок 4–6 лет', 'ребёнок 7–12 лет', 'подросток', 'взрослый 18+'] },
  { question: 'Какой сейчас уровень?', options: ['новичок', 'знает правила', 'умеет играть', 'турнирный уровень'] },
  { question: 'Какая цель?', options: ['научиться играть', 'развивать мышление', 'играть в турнирах', 'получить разряд'] }
];
let quizStep = 0;
const quizSection = document.querySelector('#quiz');
const quizFlow = document.querySelector('#quiz-flow');

function renderQuiz() {
  if (quizStep < quizQuestions.length) {
    const current = quizQuestions[quizStep];
    quizFlow.innerHTML = `<h2 class="quiz-question" tabindex="-1">${current.question}</h2>
      <div class="quiz-options">${current.options.map(option => `<button class="quiz-option" type="button">${option}</button>`).join('')}</div>
      <div class="quiz-progress" role="progressbar" aria-label="Вопросы подбора обучения" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${quizStep + 1}"><span style="width:${(quizStep + 1) * 33.333}%"></span></div>
      <span class="quiz-step-count">${quizStep + 1}/3</span>`;
    quizFlow.querySelectorAll('.quiz-option').forEach(button => button.addEventListener('click', () => {
      quizStep++;
      renderQuiz();
    }));
  } else {
    quizSection.classList.add('quiz-finished');
    quizFlow.innerHTML = `<h2 class="quiz-question quiz-final-title" tabindex="-1">Начнём<br>с пробного урока</h2>
      <div class="quiz-registration"><iframe title="Регистрация на первый пробный урок в AlfaCRM" loading="eager"></iframe>
      <a href="${trialUrl}" target="_blank" rel="noopener noreferrer">Открыть форму записи в новом окне ↗</a></div>`;
    quizFlow.querySelector('iframe').src = trialUrl;
  }
  quizFlow.querySelector('h2').focus({ preventScroll: true });
  quizSection.scrollIntoView({ block: 'start' });
}
document.querySelector('#start-quiz').addEventListener('click', () => {
  quizStep = 0;
  quizSection.classList.add('quiz-active');
  document.querySelector('#quiz-intro').hidden = true;
  quizFlow.hidden = false;
  renderQuiz();
});

renderPrices();
