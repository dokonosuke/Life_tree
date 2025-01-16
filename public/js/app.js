// Firebaseの初期化
const firebaseConfig = {
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

// Auth, Realtime Databaseのインスタンスを取得
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null; // ログイン中のユーザー情報
let currentKey = 1; // 現在の質問のキー
let currentN = 1; // 質問番号

// 質問データ
const questions = [
  { key: 1, text: "細胞核を持っていますか？？" },
  { key: 20, text: "多細胞生物ですか？" },
  { key: 2030, text: "光合成を行いますか？" },
  { key: 21, text: "エーテル結合脂質を持っていますか？" },
  { key: 2130, text: "極限環境で生息していますか？" },
  { key: 2131, text: "光合成を行いますか？" },
];

const results = [
  { key: 203040, text: "植物や藻類" },
  { key: 203041, text: "動物、菌類" },
  { key: 2031, text: "単細胞真核生物" },
  { key: 213040, text: "好熱菌、好塩菌などの極限環境アーキア" },
  { key: 213041, text: "一般的なアーキア" },
  { key: 213140, text: "光合成細菌" },
  { key: 213141, text: "大腸菌や乳酸菌など" },
];

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
          }).catch((error) => {
            console.error("ユーザー情報保存エラー:", error);
          });

          // UI更新
          currentUser = user;
          showSignOutArea();  // サインイン後にボタンを表示
          showCurrentQuestion();
        })
        .catch((error) => {
          console.error('サインインエラー:', error);
        });
  });
}

// サインイン状態の変更を監視
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('サインイン済みです');
    currentUser = user;
    document.getElementById('questions-area').style.display = 'block';
    showSignOutArea();
    showCurrentQuestion();
  } else {
    console.log('サインアウト済みです');
    currentUser = null;
    hideSignArea();
  }
});

// サインアウト処理
const signOutButton = document.getElementById('sign-out-button');
if (signOutButton) {
  signOutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
          console.log('サインアウトしました');
          hideSignArea();
        })
        .catch((error) => {
          console.error("サインアウトエラー:", error);
        });
  });
}

// 現在の質問を表示
function showCurrentQuestion() {
  const questionElement = document.getElementById('current-question');
  let content = '';

  const result = results.find(r => r.key === currentKey);
  if (result) {
    // 結果を表示
    content = result.text;

    // 結果を履歴に保存
    if (currentUser) {
      const userRef = database.ref(`users/${currentUser.uid}/history`);
      userRef.push({
        key: currentKey,
        result: result.text,
        timestamp: Date.now(),
      }).then(() => {
        console.log("結果が履歴に保存されました");
      }).catch((error) => {
        console.error("履歴保存エラー:", error);
      });
    }

    document.getElementById('answers-area').style.display = 'none';
  } else {
    // 質問を表示
    const question = questions.find(q => q.key === currentKey);
    content = question ? question.text : '質問が見つかりません';
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
      currentKey = 100 * currentKey + (currentN + 1) * 10;
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

// ボタンのイベントリスナー
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

  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.style.display = 'block'; // サインアウトボタンを表示
  }
}

function hideSignArea() {
  document.getElementById('auth-area').style.display = 'block';
  document.getElementById('sign-out-area').style.display = 'none';
  document.getElementById('questions-area').style.display = 'none';

  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.style.display = 'none'; // サインアウトボタンを非表示
  }
}

