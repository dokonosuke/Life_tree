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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;
let currentKey = 1;
let currentN = 1;


const questions = [
  { key: 1, text: "細胞核を持っていますか？" },
  { key: 20, text: "多細胞生物ですか？" },
  { key: 2030, text: "光合成を行いますか？" },
  { key: 203040, text: "維管束（葉脈）を持っていますか？" },
  { key: 20304050, text: "種子を作りますか？" },

  { key: 2031, text: "運動能力（動く能力）を持っていますか？" },
  { key: 203140, text: "外骨格を持っていますか？" },
  { key: 20314050, text: "肺を持っていますか？" },
  { key: 203141, text: "胞子を作りますか？" },

  { key: 21, text: "エーテル結合脂質を持っていますか？" },
  { key: 2130, text: "極限環境で生息していますか？" },
  { key: 2131, text: "光合成を行いますか？" },
];

const results = [
  { key: 2030405060, text: "種子植物" },
  { key: 2030405061, text: "シダ植物" },
  { key: 20304051, text: "コケ植物" },

  { key: 20314051, text: "無脊椎動物（例: 昆虫、タコ）" },
  { key: 2031405060, text: "哺乳類（例: 人間、ライオン）" },
  { key: 2031405061, text: "魚類" },
  { key: 20314150, text: "カビ" },
  { key: 20314151, text: "キノコ" },

  { key: 213040, text: "好熱菌、好塩菌などの極限環境アーキア" },
  { key: 213041, text: "一般的なアーキア" },
  { key: 213140, text: "光合成細菌" },
  { key: 213141, text: "大腸菌や乳酸菌など" },
];


const signInButton = document.getElementById('sign-in-button');
if (signInButton) {
  signInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
          const user = result.user;
          console.log('サインインしました');
          currentKey = 1;
          currentN = 1;

          const userRef = database.ref('users/' + user.uid);
          userRef.update({
            displayName: user.displayName,
          }).catch((error) => {
            console.error("ユーザー情報保存エラー:", error);
          });

          currentUser = user;
          showSignOutArea();
          showCurrentQuestion();
        })
        .catch((error) => {
          console.error('サインインエラー:', error);
        });
  });
}

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

function showCurrentQuestion() {
  const questionElement = document.getElementById('current-question');
  let content = '';

  const result = results.find(r => r.key === currentKey);
  if (result) {
    content = result.text;

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
    const question = questions.find(q => q.key === currentKey);
    content = question ? question.text : '質問が見つかりません';
  }

  questionElement.textContent = content;
}

function handleAnswer(answer) {
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
  showCurrentQuestion();
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

  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.style.display = 'block'
  }
}

function hideSignArea() {
  document.getElementById('auth-area').style.display = 'block';
  document.getElementById('sign-out-area').style.display = 'none';
  document.getElementById('questions-area').style.display = 'none';

  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.style.display = 'none';
  }
}



