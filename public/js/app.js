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

const questions = [
  { key: 1, text: "細胞核を持っていますか？" },
  { key: 20, text: "多細胞生物ですか？" },
  { key: 2030, text: "光合成を行いますか？" },
  { key: 203040, text: "維管束（葉脈）を持っていますか？" },
  { key: 20304050, text: "種子を作りますか？" },
  { key: 2030405060, text: "種子は果実（子房）で覆われていますか？" },
  { key: 203041, text: "運動能力（動く能力）を持っていますか？" },
  { key: 20304150, text: "外骨格を持っていますか？" },
  { key: 2030415061, text: "肺を持っていますか？" },
  { key: 203041506170, text: "海洋環境で生息していますか？" },
  { key: 20304151, text: "胞子を作りますか？" },
  { key: 2030415060, text: "体が分節していますか？" },
  { key: 203041506071, text: "体が柔らかく殻を持っていますか？" },
  { key: 20304150607181, text: "触手を持っていますか？" },
  { key: 21, text: "エーテル結合脂質を持っていますか？" },
  { key: 2130, text: "極限環境で生息していますか？" },
  { key: 2131, text: "光合成を行いますか？" },
];

const results = [
  { key: 203040506070, text: "被子植物" },
  { key: 203040506071, text: "裸子植物" },
  { key: 2030405061, text: "シダ植物（例: ワラビ、ゼンマイ、トクサ）" },
  { key: 20304051, text: "コケ植物（例: スギゴケ、ヒシャクゴケ）" },
  { key: 2031, text: "単細胞真核生物" },
  { key: 203041506171, text: "魚類（例: マグロ、サケ、カサゴ）" },
  { key: 20304150617080, text: "海洋哺乳類（例: クジラ、イルカ、アシカ）" },
  { key: 20304150617081, text: "陸生哺乳類（例: ウマ、オオカミ、人間" },
  { key: 203041506070, text: "節足動物（例: 昆虫、クモ、エビ）" },
  { key: 20304150607180, text: "軟体動物（例: タコ、イカ、貝類）" },
  { key: 2030415060718190, text: "刺胞動物（例: クラゲ、イソギンチャク）" },
  { key: 2030415060718191, text: "環形動物（例: ミミズ、ゴカイ）やその他海綿動物など（例: ウミユリ、ホヤ）" },
  { key: 2030415160, text: "カビ（例: アオカビ、コウジカビ）" },
  { key: 2030415161, text: "キノコ（例: シイタケ、エノキタケ）" },
  { key: 213040, text: "好熱菌、好塩菌などの極限環境アーキア（例: ピロディクティウム、ハロバクテリウム）" },
  { key: 213041, text: "一般的なアーキア（例: メタン生成菌、ナノアルカエウム）" },
  { key: 213140, text: "光合成細菌（例: 紅色硫黄細菌、緑色硫黄細菌）" },
  { key: 213141, text: "大腸菌や乳酸菌など（例: 大腸菌、ラクトバチルス）" },
];
