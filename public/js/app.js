// Firebase の初期化
const firebaseConfig = {
	// 自身の情報を入れる
  apiKey: "AIzaSyDp-dbowAKacecIgsCtL7ZgDnwoMeOuHa0",
  authDomain: "life-tree-8fb10.firebaseapp.com",
  projectId: "life-tree-8fb10",
  storageBucket: "life-tree-8fb10.firebasestorage.app",
  messagingSenderId: "773221876441",
  appId: "1:773221876441:web:b2b2d8d1e1de298217b4c8",
  databaseURL: "https://life-tree-8fb10-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// Auth, Realtime Database のインスタンスを取得
const auth = firebase.auth();
const database = firebase.database();

// Google サインインの設定
const signInButton = document.getElementById('sign-in-button');
if (signInButton) {
  signInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
          // サインイン成功時
          const user = result.user;
          console.log('サインインしました');

          // ユーザー情報を Firebase Realtime Database に保存
          database.ref('users/' + user.uid).set({
            displayName: user.displayName,
          });

          showTopicsArea(); // 質問エリアを表示
        })
        .catch((error) => {
          // サインイン失敗時
          console.error('サインインエラー:', error);
        });
  });
}

// サインイン状態の変更を監視
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('サインイン済みです');
    showSignOutArea();  // サインイン後にボタンを表示
    fetchQuestions();

    // サインアウトボタンの処理
    const signOutButton = document.getElementById('sign-out-button');
    if (signOutButton) {
      signOutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
          console.log('サインアウトしました');
          hideTopicsArea();  // 質問エリアを非表示
          hideSignArea();    // サインインエリアを再表示
        }).catch((error) => {
          console.error("サインアウトエラー:", error);
        });
      });
    }
  } else {
    console.log('サインアウト済みです');
    hideSignArea(); // サインインエリアの表示
  }
});


let questions = [
  {
    key: 1,
    text: "あなたは学生ですか？",
    yesNextKey: 2,
    noNextKey: 3
  },
  {
    key: 2,
    text: "あなたは理系ですか？",
    yesNextKey: 4,
    noNextKey: 5
  },
  {
    key: 3,
    text: "あなたは社会人ですか？",
    yesNextKey: 6,
    noNextKey: 7
  },
  {
    key: 4,
    text: "あなたはエンジニアですか？",
    yesNextKey: null,  // 次がない場合
    noNextKey: null    // 次がない場合
  },
  {
    key: 5,
    text: "あなたは文系ですか？",
    yesNextKey: null,  // 次がない場合
    noNextKey: null    // 次がない場合
  }
];

let currentQuestionIndex = 0; // 質問インデックスを0からスタート

// 質問を表示する関数
function showCurrentQuestion() {
  const questionElement = document.getElementById('current-question');
  const currentQuestion = questions[currentQuestionIndex];

  if (currentQuestion) {
    questionElement.textContent = currentQuestion.text; // 現在の質問を表示

    // 質問が "yes" または "no" で次の質問に進む
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
      button.onclick = () => {
        const answer = button.dataset.answer;
        nextQuestion(answer === 'yes' ? currentQuestion.yesNextKey : currentQuestion.noNextKey);
      };
    });

    // 質問エリアを表示
    document.getElementById('questions-area').style.display = 'block';

    // 次の質問がない場合、終了メッセージ
    if (!currentQuestion.yesNextKey && !currentQuestion.noNextKey) {
      document.getElementById('questions-area').innerHTML = '<p>すべての質問が終了しました！</p>';
    }
  }
}

// 次の質問へ進む関数
function nextQuestion(nextKey) {
  // 次の質問のキーがnullでない場合は進む
  if (nextKey !== null) {
    currentQuestionIndex = questions.findIndex(q => q.key === nextKey);
    showCurrentQuestion(); // 次の質問を表示
  } else {
    document.getElementById('questions-area').innerHTML = '<p>すべての質問が終了しました！</p>';
  }
}

// 初期の質問を表示
document.addEventListener('DOMContentLoaded', () => {
  showCurrentQuestion();
});


// 回答を処理
function handleAnswer(answer) {
  console.log(`質問: ${questions[currentQuestionIndex]} | 回答: ${answer}`);
  currentQuestionIndex++; // 次の質問
  showCurrentQuestion(); // 次の質問を表示
}

// 回答ボタンのイベントリスナー
document.querySelectorAll('.answer-button').forEach((button) => {
  button.addEventListener('click', (event) => {
    const answer = event.target.getAttribute('data-answer');
    handleAnswer(answer);
  });
});


function showSignOutArea() {
  document.getElementById('auth-area').style.display = 'none';
  document.getElementById('sign-out-area').style.display = 'block';

  // サインアウトボタンの表示
  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.style.display = 'block';  // ボタンを表示
  }
}

// サインアウト後のUIを表示
function hideSignArea() {
  document.getElementById('auth-area').style.display = 'block';
  document.getElementById('sign-out-area').style.display = 'none';
}
