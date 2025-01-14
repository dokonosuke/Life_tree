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

          //showCurrentQuestion(); // 質問エリアを表示
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
    document.getElementById('questions-area').style.display = 'block';
    showSignOutArea();  // サインイン後にボタンを表示
    //fetchQuestions();
    showCurrentQuestion();
    // サインアウトボタンの処理
    const signOutButton = document.getElementById('sign-out-button');
    signOutButton.addEventListener('click', () => {
      auth.signOut().then(() => {
        console.log('サインアウトしました');
        hideSignArea();    // サインインエリアを再表示
      }).catch((error) => {
        console.error("サインアウトエラー:", error);
      });
    });

  } else {
    console.log('サインアウト済みです');
    hideSignArea(); // サインインエリアの表示
  }
});

// 質問データを取得
let questions = [
  { key: 1, text: "1" },
  { key: 20, text: "20" },
  { key: 21, text: "21" },
  { key: 2030, text: "2030" },
  { key: 2031, text: "2031" },
];

let results = [
  { key: 203040, text: "203041結果" },
  { key: 203041, text: "203041結果" },
  { key: 203140, text: "203140結果" },
  { key: 203141, text: "203141結果" },
  { key: 2130, text: "2030結果" },
  { key: 2131, text: "2031結果" }
];

let currentKey = 1;
let currentN = 1;

// 現在の質問を表示
function showCurrentQuestion() {
  const questionElement = document.getElementById('current-question');
  let content = '';

  const result = results.find(r => r.key === currentKey);
  if (result) {
    // Show the result if available
    content = result.text;
    document.getElementById('answers-area').style.display = 'none';
  } else {
    // If no result, show the question
    const question = questions.find(q => q.key === currentKey);
    content = question ? question.text : 'No question found';
  }

  questionElement.textContent = content;
}

// 回答を処理
function handleAnswer(answer) {
  // Yes/Noに基づいてkeyを更新
  if (answer.toLowerCase() === 'yes') {
    if (currentN === 1) {
      currentKey = 20;
    } else {
      currentKey = 100*currentKey + (currentN+1)*10;
    }
  } else if (answer.toLowerCase() === 'no') {
    if (currentN === 1) {
      currentKey = 21;
    } else {
      currentKey = 100 * currentKey + (currentN + 1) * 10 + 1;
    }
  }
  currentN += 1;
  showCurrentQuestion(); // 次の質問を表示
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.answer-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const answer = event.target.getAttribute('data-answer');
      handleAnswer(answer);
    });
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
  document.getElementById('questions-area').style.display = 'none';
}

