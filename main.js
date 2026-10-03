const prices = {
  25: { title: 'Идеально для самых маленьких', description: 'Детям с 4 до 7 лет', items: [[1,1200],[4,3800],[8,7120],[16,13280],[24,18960]] },
  45: { title: 'Для детей постарше', description: 'Достаточно времени, чтобы увлечься и не устать', items: [[1,1650],[4,5600],[8,10800],[16,20800],[24,28800]] },
  60: { title: 'Для будущих чемпионов', description: 'Для тех, кто хочет участвовать в соревнованиях и побеждать', items: [[1,2100],[4,7200],[8,14000],[16,26080],[24,37200]] }
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
  document.querySelectorAll('[data-duration]').forEach(button => {
    const active = Number(button.dataset.duration) === duration;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#price-grid').innerHTML = tier.items.map(([count, sum]) => `
    <button class="price-card" type="button" data-price-count="${count}" aria-label="${count} ${lessonWord(count)}, ${formatPrice(sum)}. Перейти к оплате">
      <span class="count">${count} ${lessonWord(count)}</span>
      <strong>${formatPrice(sum)}</strong>
      <small>${formatPrice(Math.round(sum/count))} за занятие</small>
    </button>`).join('');
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
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
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

const quizQuestions = [
  { question: 'Для кого ищете занятия?', options: ['Для ребёнка 4–7 лет', 'Для ребёнка 7–12 лет', 'Для ребёнка с опытом', 'Для взрослого'] },
  { question: 'Какая цель ближе?', options: ['Познакомиться с шахматами', 'Играть увереннее', 'Готовиться к турнирам'] },
  { question: 'Какая длительность подходит?', options: ['25 минут', '45 минут', '60 минут'] }
];
let quizStep = 0;
let quizAnswers = [];
function renderQuiz() {
  const content = document.querySelector('#quiz-content');
  if (quizStep < quizQuestions.length) {
    const current = quizQuestions[quizStep];
    content.innerHTML = `<span class="quiz-progress">Вопрос ${quizStep + 1} из 3</span><h3 class="quiz-question">${current.question}</h3>${current.options.map((option,index) => `<button class="quiz-option" type="button" data-answer="${index}">${option} ↗</button>`).join('')}`;
    content.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
      quizAnswers.push(current.options[Number(button.dataset.answer)]);
      quizStep++;
      renderQuiz();
    }));
  } else {
    const choice = quizAnswers[2] || '45 минут';
    duration = Number(choice.split(' ')[0]);
    renderPrices();
    content.innerHTML = `<div class="quiz-result"><span class="eyebrow">Готово</span><h3>Рекомендуем персональные занятия по ${duration} минут</h3><p>На пробном уроке тренер уточнит уровень и поможет выбрать программу.</p><button class="btn btn-purple" type="button" id="quiz-to-trial">Записаться на пробный урок ↗</button></div>`;
    content.querySelector('#quiz-to-trial').addEventListener('click', () => { closeModals(); openTrial(); });
  }
}
document.querySelector('#start-quiz').addEventListener('click', () => {
  quizStep = 0;
  quizAnswers = [];
  renderQuiz();
  openModal('quiz-modal');
});

renderPrices();
