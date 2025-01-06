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

firebase.initializeApp(firebaseConfig);

// Auth, Realtime Database のインスタンスを取得
const auth = firebase.auth();
const database = firebase.database();

// Google サインイン
const signInButton = document.getElementById("sign-in-button");
if (signInButton) {
  signInButton.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
          const user = result.user;
          console.log("サインインしました:", user.displayName);
          database.ref("users/" + user.uid).set({
            displayName: user.displayName,
          });
          fetchQuestions(); // 質問を取得して表示
          showQuestionsArea(); // 質問エリアを表示
        })
        .catch((error) => console.error("サインイン失敗:", error));
  });
}

// サインイン状態の変更を監視
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("サインイン済み:", user.displayName);
    fetchQuestions();
    showQuestionsArea();
  } else {
    console.log("サインアウト状態");
    hideQuestionsArea();
  }
});

// 質問リスト
let questions = [];
let currentQuestionIndex = 0; // 現在の質問のインデックス

// Firebase Realtime Database の質問ノード参照
const questionsRef = database.ref("questions");

// 質問データを登録
function addQuestions() {
  const initialQuestions = {
    1: "あなたはコーヒーが好きですか？",
    2: "朝食を毎日食べますか？",
    3: "運動を定期的にしていますか？",
  };

  questionsRef.set(initialQuestions, (error) => {
    if (error) {
      console.error("質問の登録に失敗:", error);
    } else {
      console.log("質問が正常に登録されました");
    }
  });
}

// 質問データを取得
function fetchQuestions() {
  questionsRef.once("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      questions = Object.values(data); // 質問データを配列に変換
      currentQuestionIndex = 0; // インデックスをリセット
      showCurrentQuestion(); // 最初の質問を表示
    } else {
      console.error("質問データが存在しません");
      document.getElementById("questions-area").innerHTML = "<p>質問がありません。</p>";
    }
  });
}

// 現在の質問を表示
function showCurrentQuestion() {
  const questionElement = document.getElementById("current-question");
  if (currentQuestionIndex < questions.length) {
    questionElement.textContent = questions[currentQuestionIndex];
  } else {
    document.getElementById("questions-area").innerHTML = "<p>すべての質問が終了しました！</p>";
  }
}

// ユーザーの回答を処理
function handleAnswer(answer) {
  console.log(`質問: ${questions[currentQuestionIndex]} | 回答: ${answer}`);
  currentQuestionIndex++; // 次の質問へ
  showCurrentQuestion();
}

// 回答ボタンのイベントリスナー
document.querySelectorAll(".answer-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const answer = event.target.getAttribute("data-answer");
    handleAnswer(answer);
  });
});

// 質問エリアの表示
function showQuestionsArea() {
  document.getElementById("auth-area").style.display = "none";
  document.getElementById("questions-area").style.display = "block";
}

// 質問エリアの非表示
function hideQuestionsArea() {
  document.getElementById("auth-area").style.display = "block";
  document.getElementById("questions-area").style.display = "none";
}

// 初期化時に質問を登録（必要に応じてコメント解除）
addQuestions();





//下は例のやつ



// トピック一覧を表示する関数
function showTopicsArea() {
  document.getElementById('auth-area').style.display = 'none';
  document.getElementById('topics-area').style.display = 'block';
  fetchTopics();
}

// トピック一覧を非表示にする関数
function hideTopicsArea() {
  document.getElementById('auth-area').style.display = 'block';
  document.getElementById('topics-area').style.display = 'none';
}

// トピック一覧の取得・表示
function fetchTopics() {
  const topicsRef = database.ref('topics');
  topicsRef.on('value', (snapshot) => {
    const topics = snapshot.val();
    const topicList = document.getElementById('topic-list');
    topicList.innerHTML = '';
    for (const key in topics) {
      const topic = topics[key];
      const listItem = document.createElement('li');
      const topicLink = document.createElement('a');
      topicLink.href = `topic.html?id=${key}`;
      topicLink.textContent = topic.title;
      listItem.appendChild(topicLink);
      topicList.appendChild(listItem);
    }
  });
}

// トピックの作成
const newTopicForm = document.getElementById('new-topic-form');
if (newTopicForm) {
  newTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTopicRef = database.ref('topics').push();
    newTopicRef.set({
      title: document.getElementById('topic-name').value,
      description: document.getElementById('topic-description').value,
    }).then(() => {
      // トピック作成後、トピック一覧ページに遷移
      window.location.href = 'index.html';
    });
  });
}

// コメントの投稿・取得・表示
const topicId = getQueryString('id');
if (topicId) {
  const commentsRef = database.ref(`comments/${topicId}`);
  const commentList = document.getElementById('comment-list');

  // コメントの取得と表示
  commentsRef.on('value', (snapshot) => {
    const comments = snapshot.val();
    commentList.innerHTML = '';
    for (const key in comments) {
      const comment = comments[key];
      const listItem = document.createElement('li');
      listItem.textContent = `${comment.displayName}: ${comment.text}`;
      commentList.appendChild(listItem);
    }
  });

  // コメントの投稿
  const postCommentButton = document.getElementById('post-comment');
  if (postCommentButton) {
    postCommentButton.addEventListener('click', () => {
      const commentText = document.getElementById('comment-text').value;
      if (commentText.trim() !== '') {
        const user = auth.currentUser;
        commentsRef.push().set({
          text: commentText,
          displayName: user.displayName,
        });
        document.getElementById('comment-text').value = '';
      }
    });
  }

  // トピックのタイトルと説明を表示
  const topicRef = database.ref(`topics/${topicId}`);
  topicRef.once('value').then((snapshot) => {
    const topic = snapshot.val();
    document.getElementById('topic-title').textContent = topic.title;
    document.getElementById('topic-description').textContent = topic.description;
  });
}

// クエリ文字列から値を取得する関数
function getQueryString(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}
