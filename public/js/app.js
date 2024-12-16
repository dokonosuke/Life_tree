// Firebase の初期化
const firebaseConfig = {
	// 自身の情報を入れる
  apiKey: "AIzaSyD93jKXZVA5UKYyme1sDMrxQw0Y9WvLKAg",
  authDomain: "webapp-test-9a6df.firebaseapp.com",
  databaseURL: "https://webapp-test-9a6df-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webapp-test-9a6df",
  storageBucket: "webapp-test-9a6df.appspot.com",
  messagingSenderId: "738907344146",
  appId: "1:738907344146:web:3d255bbbd8c8002cbf37cb"
};
firebase.initializeApp(firebaseConfig);

// Auth, Realtime Database のインスタンスを取得
const auth = firebase.auth();
const database = firebase.database();

// Google サインイン
const signInButton = document.getElementById('sign-in-button');
if (signInButton) {
  signInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        // サインイン成功時の処理
        console.log('サインインしました');
        const user = result.user;
        // ユーザー情報を Firebase Realtime Database に保存
        // 必要に応じて、ユーザー名などを取得して保存
        database.ref('users/' + user.uid).set({
          displayName: user.displayName,
          // ...
        });
        showTopicsArea();
      })
      .catch((error) => {
        // サインイン失敗時の処理
        console.error(error);
        // ...
      });
  });
}


// サインイン状態の変更を監視
auth.onAuthStateChanged((user) => {
  if (user) {
    // ユーザーがサインインしている場合
    console.log('サインイン済みです');
    showTopicsArea();

    // サインアウトボタンの処理を追加
    const signOutButton = document.getElementById('sign-out-button');
    signOutButton.addEventListener('click', () => {
      auth.signOut().then(() => {
        console.log('サインアウトしました');
        hideTopicsArea();
      }).catch((error) => {
        console.error("サインアウトエラー:", error);
      });
    });

  } else {
    // ユーザーがサインアウトしている場合
    console.log('サインアウト済みです');
    hideTopicsArea();
  }
});

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