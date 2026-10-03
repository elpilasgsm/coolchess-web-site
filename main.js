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
    <button class="price-card price-card-trial" type="button" aria-label="Пробное занятие, 500 рублей. Записаться">
      <span class="count">Пробное занятие</span>
      <span class="price-card-bottom"><strong>500 ₽</strong><span class="price-card-arrow" aria-hidden="true">↗</span></span>
    </button>` + tier.items.map(([count, sum]) => `
    <button class="price-card" type="button" data-price-count="${count}" aria-label="${count} ${lessonWord(count)}, ${formatPrice(sum)}, ${duration} минут. Перейти к оплате">
      <span class="count">${count} ${lessonWord(count)}</span>
      <span class="price-card-bottom"><span><strong>${formatPrice(sum)}</strong>${count > 1 ? `<small>Стоимость 1 занятия ${formatPrice(Math.round(sum/count))}</small>` : ''}</span><span class="price-card-arrow" aria-hidden="true">↗</span></span>
    </button>`).join('');
  document.querySelector('.price-card-trial').addEventListener('click', openTrial);
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
  const item = prices[duration].items.find(([quantity]) => quantity === count);
  if (!item) return;
  selectedPackage = item;
  document.querySelector('#pay-service').value = `${count} ${lessonWord(count)}`;
  document.querySelector('#pay-sum').value = String(item[1]);
  document.querySelector('#payment-summary').textContent = `${count} ${lessonWord(count)} · ${formatPrice(item[1])}`;
  document.querySelectorAll('.payment-option').forEach(button => button.classList.toggle('selected', Number(button.dataset.package) === count));
}

function openPayment(preselect = null) {
  selectedPackage = null;
  document.querySelector('#pay-service').value = '';
  document.querySelector('#pay-sum').value = '';
  document.querySelector('#payment-summary').textContent = 'Выберите пакет';
  document.querySelector('#payment-options').innerHTML = prices[duration].items.map(([count,sum]) => `<button class="payment-option" type="button" data-package="${count}"><span>${count} ${lessonWord(count)}</span><strong>${formatPrice(sum)}</strong></button>`).join('');
  document.querySelectorAll('[data-package]').forEach(button => button.addEventListener('click', () => selectPaymentPackage(Number(button.dataset.package))));
  if (preselect) selectPaymentPackage(preselect);
  openModal('payment-modal');
}

document.querySelectorAll('[data-duration]').forEach(button => button.addEventListener('click', () => {
  duration = Number(button.dataset.duration);
  renderPrices();
}));
document.querySelectorAll('[data-open-trial]').forEach(button => button.addEventListener('click', openTrial));
document.querySelector('#open-payment').addEventListener('click', () => openPayment());
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModals));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModals(); });
document.querySelector('#payment-form').addEventListener('submit', event => {
  if (!selectedPackage) {
    event.preventDefault();
    document.querySelector('#payment-options button')?.focus();
    alert('Выберите количество занятий.');
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

const trainersDialog = document.querySelector('#trainers-dialog');
const trainersDialogGrid = trainersDialog.querySelector('.trainers-dialog-grid');
document.querySelectorAll('#trainers > .trainer-grid > .trainer-card').forEach(card => {
  const profile = card.cloneNode(true);
  profile.querySelector('.trainer-signup')?.remove();
  trainersDialogGrid.append(profile);
});
document.querySelector('.trainers-all').addEventListener('click', () => {
  trainersDialog.showModal();
  document.body.classList.add('modal-open');
});
trainersDialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
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
