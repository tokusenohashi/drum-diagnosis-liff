const LIFF_ID = "YOUR_LIFF_ID";
const MAX_SCORE = 16;

const questions = [
  {
    id: "q1",
    title: "楽器演奏経験は？",
    options: [
      { label: "未経験", score: 0 },
      { label: "少しだけ", score: 1 },
      { label: "1年以上", score: 2 },
      { label: "バンド/吹奏楽経験あり", score: 3 },
      { label: "現在も演奏している", score: 4 },
    ],
  },
  {
    id: "q2",
    title: "これまで耳コピしてきた曲数は？",
    options: [
      { label: "0曲", score: 0 },
      { label: "1〜5曲", score: 1 },
      { label: "6〜20曲", score: 2 },
      { label: "21〜50曲", score: 3 },
      { label: "51曲以上", score: 4 },
    ],
  },
  {
    id: "q3",
    title: "DAW操作にどれだけ慣れている？",
    options: [
      { label: "調べながら", score: 0 },
      { label: "なんとなく分かる", score: 1 },
      { label: "普通に操作できる", score: 2 },
      { label: "流暢", score: 3 },
    ],
  },
  {
    id: "q4",
    title: "ベロシティやアーティキュレーションを意識して打ち込みをしている？",
    options: [
      { label: "No", score: 0 },
      { label: "少し", score: 1 },
      { label: "Yes", score: 2 },
    ],
  },
  {
    id: "q5",
    title: "ドラムパターンを10個以上、口ドラムできる？",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 3 },
    ],
  },
  {
    id: "demoUrl",
    title: "現状のデモ音源URL",
    type: "text",
    placeholder: "https://example.com/demo",
  },
];

const results = [
  {
    min: 0,
    max: 4,
    level: "初心者",
    description: "基礎経験がまだ少ない段階です。まずは耳コピと楽器感覚を増やしましょう。",
  },
  {
    min: 5,
    max: 8,
    level: "初級者",
    description: "基本は理解し始めています。再現力を鍛えると大きく伸びます。",
  },
  {
    min: 9,
    max: 12,
    level: "中級者",
    description: "分析・再現の基礎があります。細かい表現力を強化しましょう。",
  },
  {
    min: 13,
    max: 16,
    level: "上級者",
    description: "かなり実践量があります。音色・フィール・ジャンル理解をさらに深めましょう。",
  },
];

const state = {
  currentIndex: 0,
  answers: {},
  liffReady: false,
  canSendLineMessage: false,
  latestResult: null,
};

const startScreen = document.querySelector("#start-screen");
const questionScreen = document.querySelector("#question-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const questionForm = document.querySelector("#question-form");
const questionTitle = document.querySelector("#question-title");
const choices = document.querySelector("#choices");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const formMessage = document.querySelector("#form-message");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const scoreValue = document.querySelector("#score-value");
const levelValue = document.querySelector("#level-value");
const descriptionValue = document.querySelector("#description-value");
const sendLineButton = document.querySelector("#send-line-button");
const sendStatus = document.querySelector("#send-status");
const closeButton = document.querySelector("#close-button");

initLiff();

startButton.addEventListener("click", () => {
  state.currentIndex = 0;
  showScreen(questionScreen);
  renderQuestion();
});

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCurrentAnswer();
});

choices.addEventListener("change", () => {
  updateSelectedChoice();
});

backButton.addEventListener("click", () => {
  if (state.currentIndex === 0) {
    showScreen(startScreen);
    return;
  }

  state.currentIndex -= 1;
  renderQuestion();
});

closeButton.addEventListener("click", () => {
  if (window.liff?.isInClient?.()) {
    window.liff.closeWindow();
    return;
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  showScreen(startScreen);
});

sendLineButton.addEventListener("click", () => {
  sendResultToLine();
});

async function initLiff() {
  if (!window.liff || LIFF_ID === "YOUR_LIFF_ID") {
    updateLineSendButton();
    return;
  }

  try {
    await window.liff.init({ liffId: LIFF_ID });
    state.liffReady = true;
    state.canSendLineMessage = window.liff.isInClient() && typeof window.liff.sendMessages === "function";
  } catch (error) {
    console.warn("LIFF initialization failed:", error);
    state.canSendLineMessage = false;
  }

  updateLineSendButton();
}

function showScreen(screen) {
  [startScreen, questionScreen, resultScreen].forEach((element) => {
    element.classList.toggle("is-hidden", element !== screen);
  });
}

function renderQuestion() {
  const question = questions[state.currentIndex];
  const currentNumber = state.currentIndex + 1;
  const progress = (currentNumber / questions.length) * 100;

  formMessage.textContent = "";
  progressLabel.textContent = `Q${currentNumber} / ${questions.length}`;
  progressFill.style.width = `${progress}%`;
  questionTitle.textContent = question.title;
  backButton.textContent = state.currentIndex === 0 ? "戻る" : "前へ";
  nextButton.textContent = state.currentIndex === questions.length - 1 ? "結果を見る" : "次へ";

  if (question.type === "text") {
    renderTextInput(question);
    return;
  }

  renderChoices(question);
}

function renderChoices(question) {
  choices.innerHTML = question.options
    .map((option, index) => {
      const inputId = `${question.id}-${index}`;
      const isChecked = state.answers[question.id]?.label === option.label;

      return `
        <label class="choice ${isChecked ? "is-selected" : ""}" for="${inputId}">
          <input
            id="${inputId}"
            type="radio"
            name="${question.id}"
            value="${option.score}"
            data-label="${option.label}"
            ${isChecked ? "checked" : ""}
          />
          <span>${option.label}</span>
        </label>
      `;
    })
    .join("");
}

function renderTextInput(question) {
  const savedValue = state.answers[question.id]?.value ?? "";

  choices.innerHTML = `
    <input
      class="url-input"
      id="${question.id}"
      name="${question.id}"
      type="text"
      inputmode="url"
      placeholder="${question.placeholder}"
      value="${escapeHtml(savedValue)}"
    />
  `;
}

function saveCurrentAnswer() {
  const question = questions[state.currentIndex];

  if (question.type === "text") {
    const input = questionForm.elements[question.id];
    state.answers[question.id] = {
      value: input.value.trim(),
      score: 0,
    };
    goNext();
    return;
  }

  const checkedOption = questionForm.querySelector(`input[name="${question.id}"]:checked`);

  if (!checkedOption) {
    formMessage.textContent = "選択肢を1つ選んでください。";
    return;
  }

  state.answers[question.id] = {
    label: checkedOption.dataset.label,
    score: Number(checkedOption.value),
  };

  goNext();
}

function goNext() {
  if (state.currentIndex === questions.length - 1) {
    renderResult();
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function updateSelectedChoice() {
  choices.querySelectorAll(".choice").forEach((choice) => {
    const input = choice.querySelector("input");
    choice.classList.toggle("is-selected", Boolean(input?.checked));
  });
}

function renderResult() {
  const totalScore = questions.reduce((sum, question) => {
    return sum + (state.answers[question.id]?.score ?? 0);
  }, 0);
  const result = results.find((item) => totalScore >= item.min && totalScore <= item.max);
  const demoUrl = state.answers.demoUrl?.value || "未入力";

  scoreValue.textContent = `${totalScore} / ${MAX_SCORE}`;
  levelValue.textContent = result.level;
  descriptionValue.textContent = result.description;
  sendStatus.textContent = "";
  sendStatus.classList.remove("is-error");
  state.latestResult = {
    score: totalScore,
    level: result.level,
    demoUrl,
  };
  updateLineSendButton();
  showScreen(resultScreen);
}

function updateLineSendButton() {
  sendLineButton.classList.toggle("is-hidden", !state.canSendLineMessage);
  sendLineButton.disabled = !state.canSendLineMessage || !state.latestResult;
}

async function sendResultToLine() {
  if (!state.canSendLineMessage || !state.latestResult) {
    return;
  }

  const { score, level, demoUrl } = state.latestResult;
  const text = [
    "ドラム打ち込み診断結果",
    `スコア：${score}点 / ${MAX_SCORE}点`,
    `レベル：${level}`,
    `デモ音源URL：${demoUrl}`,
  ].join("\n");

  sendLineButton.disabled = true;
  sendStatus.classList.remove("is-error");
  sendStatus.textContent = "送信中です...";

  try {
    await window.liff.sendMessages([
      {
        type: "text",
        text,
      },
    ]);
    sendStatus.textContent = "送信しました";
  } catch (error) {
    console.warn("LINE message send failed:", error);
    sendStatus.classList.add("is-error");
    sendStatus.textContent = "送信できませんでした。LINE内で開いているか確認してください。";
  } finally {
    sendLineButton.disabled = false;
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}
