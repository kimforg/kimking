const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const numbersEl = document.getElementById('numbers');
const historyList = document.getElementById('historyList');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const commentStatus = document.getElementById('commentStatus');

const STORAGE_KEY = 'lotto-history';
const COMMENTS_STORAGE_KEY = 'lotto-comments';

function generateLottoNumbers() {
  const numbers = new Set();

  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

function generateMultipleLottoNumbers(count = 8) {
  const sets = [];
  for (let i = 0; i < count; i++) {
    sets.push(generateLottoNumbers());
  }
  return sets;
}

function getBallColorClass(number) {
  if (number <= 10) return 'ball-yellow';
  if (number <= 20) return 'ball-blue';
  if (number <= 30) return 'ball-red';
  if (number <= 40) return 'ball-grey';
  return 'ball-green';
}

function renderNumbers(sets) {
  numbersEl.innerHTML = '';

  if (!sets || !sets.length) {
    numbersEl.innerHTML = '<p class="empty">아직 생성된 번호가 없습니다.</p>';
    return;
  }

  sets.forEach((numbers, index) => {
    const row = document.createElement('div');
    row.className = 'number-row';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = String.fromCharCode(65 + index); // A, B, C, D, E, F, G, H
    row.appendChild(label);

    const ballsContainer = document.createElement('div');
    ballsContainer.className = 'balls-container';

    numbers.forEach((number) => {
      const ball = document.createElement('div');
      ball.className = `ball ${getBallColorClass(number)}`;
      ball.textContent = number;
      ballsContainer.appendChild(ball);
    });

    row.appendChild(ballsContainer);
    numbersEl.appendChild(row);
  });
}

function getHistory() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveHistory(sets) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    sets,
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
    
    const sets = item.sets || (item.numbers ? [item.numbers] : []);
    const setsPreview = sets.map((set, index) => {
      return `<span class="history-set" style="display: block; margin-top: 4px;"><strong style="color: var(--accent);">${String.fromCharCode(65 + index)}</strong>: ${set.join(', ')}</span>`;
    }).join('');

    li.innerHTML = `<strong>${item.createdAt} (총 ${sets.length}개 세트)</strong><div class="history-sets-container" style="margin-top: 4px; font-size: 0.9rem; line-height: 1.4;">${setsPreview}</div>`;
    historyList.appendChild(li);
  });
}

function generateAndSave() {
  const sets = generateMultipleLottoNumbers(8);
  renderNumbers(sets);
  saveHistory(sets);
  renderHistory();
}

generateBtn.addEventListener('click', generateAndSave);

clearBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  renderNumbers([]);
});

renderNumbers(generateMultipleLottoNumbers(8));
renderHistory();
renderComments();

// 테마 전환 (다크모드 / 라이트모드) 기능 구현
const themeToggleBtn = document.getElementById('themeToggleBtn');
const THEME_KEY = 'lotto-theme';

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'light') {
  document.body.classList.add('light-theme');
  themeToggleBtn.textContent = '🌙';
} else {
  themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
});

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.textContent = '전송 중...';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        formStatus.textContent = '문의가 성공적으로 전송되었습니다. 감사합니다!';
        contactForm.reset();
      } else {
        formStatus.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }
    } catch (error) {
      formStatus.textContent = '네트워크 오류로 전송하지 못했습니다.';
    }
  });
}

function getComments() {
  const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveComment(comment) {
  const comments = getComments();
  comments.unshift(comment);
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments.slice(0, 50)));
}

function formatCommentTime(timestamp) {
  return new Date(timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderComments() {
  if (!commentList) return;

  const comments = getComments();
  commentList.innerHTML = '';

  if (!comments.length) {
    commentList.innerHTML = '<li class="empty">아직 작성된 댓글이 없습니다.</li>';
    return;
  }

  comments.forEach((comment) => {
    const li = document.createElement('li');
    li.className = 'comment-item';

    const header = document.createElement('div');
    header.className = 'comment-header';

    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = comment.name;

    const time = document.createElement('span');
    time.className = 'comment-time';
    time.textContent = formatCommentTime(comment.createdAt);

    header.appendChild(author);
    header.appendChild(time);

    const body = document.createElement('p');
    body.className = 'comment-body';
    body.textContent = comment.message;

    li.appendChild(header);
    li.appendChild(body);
    commentList.appendChild(li);
  });
}

if (commentForm) {
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('commentName');
    const messageInput = document.getElementById('commentMessage');
    const name = nameInput?.value.trim();
    const message = messageInput?.value.trim();

    if (!name || !message) {
      commentStatus.textContent = '이름과 댓글 내용을 모두 입력해주세요.';
      return;
    }

    const comment = {
      id: Date.now(),
      name,
      message,
      createdAt: new Date().toISOString(),
    };

    saveComment(comment);
    renderComments();

    commentForm.reset();
    commentStatus.textContent = '댓글이 등록되었습니다!';

    setTimeout(() => {
      commentStatus.textContent = '';
    }, 3000);
  });
}
