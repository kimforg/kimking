const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const numbersEl = document.getElementById('numbers');
const historyList = document.getElementById('historyList');

const STORAGE_KEY = 'lotto-history';

function generateLottoNumbers() {
  const numbers = new Set();

  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

function renderNumbers(numbers) {
  numbersEl.innerHTML = '';

  if (!numbers.length) {
    numbersEl.innerHTML = '<p class="empty">아직 생성된 번호가 없습니다.</p>';
    return;
  }

  numbers.forEach((number) => {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.textContent = number;
    numbersEl.appendChild(ball);
  });
}

function getHistory() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveHistory(numbers) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    numbers,
    createdAt: new Date().toLocaleString('ko-KR')
  };

  const nextHistory = [entry, ...history].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = '';

  if (!history.length) {
    historyList.innerHTML = '<li class="empty">아직 저장된 기록이 없습니다.</li>';
    return;
  }

  history.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `<strong>${item.createdAt}</strong><br />${item.numbers.join(' · ')}`;
    historyList.appendChild(li);
  });
}

function generateAndSave() {
  const numbers = generateLottoNumbers();
  renderNumbers(numbers);
  saveHistory(numbers);
  renderHistory();
}

generateBtn.addEventListener('click', generateAndSave);

clearBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  renderNumbers([]);
});

renderNumbers(generateLottoNumbers());
renderHistory();
