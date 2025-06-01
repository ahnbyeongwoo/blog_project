<template>
  <div class="blog-container">
    <header class="blog-header">
      <button class="menu-button" @click="goToPostList">목록</button>
      <h1 class="blog-title">Blog Project</h1>
      <div class="header-buttons">
        <button v-if="!isLoggedIn" class="action-button" @click="goToUserLogin">로그인</button>
        <button v-else class="action-button" @click="logout">로그아웃</button>
        <button v-if="isLoggedIn" class="action-button" @click="goToCreatePage">글작성</button>
      </div>
    </header>

    <div class="main-content">
      <main class="post-list">
        <div v-for="post in sortedPost" :key="post.id" class="post-item">
          <h2>{{ post.title }}</h2>
          <div class="post-meta">
            <p class="author">글쓴이 : {{ post.name }}</p>
            <div class="meta-right">
              <p class="date">작성일 : {{ formatDate(post.created_at) }}</p>
          <p class="views">조회수 : {{ post.views }}</p>
            </div>
          </div>
          <p v-html="post.content"></p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "BlogMain",
  data() {
    return { //초기 데이터
      posts: [
        {
          id: 1,
          title: '',
          content: '',
          author: '',
          date: '',
          views: 1,
        }
      ],
      previewVisible: false, // 미리보기 표시 여부
      isLoggedIn: !!localStorage.getItem('currentUser'),//로그인 여부
    };
  },

  computed: {//조회수 내림차순 정렬
    sortedPost() {
      return [...this.posts]
        .sort((a, b) => b.views - a.views)//조회수 내림차순
        .slice(0, 2);
    },
  },

  mounted(){
    fetch('http://localhost:3000/list')//서버에서 데이터 가져오기
    .then(response => response.json())
    .then(data => {
      this.posts = data.sort((a, b) => b.views - a.views);//조회수 내림차순
    })
    .catch(error => console.error('Error fetching posts:', error));

  window.addEventListener('storage', this.syncLoginState);//
  },
  methods: {
    onDragStart(event) {
      event.dataTransfer.setData("text", "menu-button");
    },
    onDrop(event) {//드래그된 데이터 가져옴
      const draggedItem = event.dataTransfer.getData("text");
      if (draggedItem === "menu-button") {
        this.previewVisible = true;
      }
    },
    logout() {
      localStorage.removeItem('currentUser');
      this.isLoggedIn = false;
      alert('로그아웃 되었습니다.');
    },
    syncLoginState(event) {
      if (event.key === 'currentUser') {
        this.isLoggedIn = !!localStorage.getItem('currentUser');
      }
    },

    goToCreatePage(){
      this.$router.push('/create');
    },
    goToUserLogin(){
      this.$router.push('/login');
    },
    goToPostList(){
      this.$router.push('/list');
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncLoginState);
  },
};
</script>

<style lang="css" scoped>
.blog-container {
  font-family: Arial, sans-serif;
  margin: 0 auto; /*수평 중앙 정렬 */
  padding: 15px;
  border: 2px solid #ddd; /* 전체 컨테이너 테두리 */
  border-radius: 10px; /* 둥근 모서리 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  max-width: 1200px;
  background-color: #f4f4f4; /* 회색 배경 */
}

.blog-header {
  display: flex;
  justify-content: space-between; /* 왼쪽, 가운데, 오른쪽 배치 */
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.menu-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-left: 10px;
}

.blog-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 24px;/*폰트 사이즈 24고정 */
}

.header-buttons {
  display: flex;
  gap: 10px; /* 버튼 간격 */
}

.action-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
}

.main-content {
  display: flex;
  margin-top: 20px;
  gap: 20px; /* 미리보기와 포스트 리스트 사이의 간격 */
}

.preview-panel {
  flex: 1;
  background-color: #eaeaea;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  max-width: 200px;
}

.preview-panel h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.preview-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-panel li {
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  font-size: 14px;
}

.post-list {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-item {
  display: flex; /* 가로 정렬 */
  flex-direction: column; /* 기본적으로 세로 정렬 */
  gap: 10px; /* 요소 간 간격 */

  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.post-meta {
  display: flex; /* 가로 정렬 */
  justify-content: space-between; /* 양쪽 끝으로 배치 */
  align-items: center; /* 수직 중앙 정렬 */
}
.meta-right{
  display: flex;
  gap: 15px;
}
.author{
  font-size: 14px;
}
.date,
.views{
  font-size: 14px;
}
.post-item h2 {
  /* margin: 0 0 5px 0; */
  margin-bottom: 10px;
  font-size: 20px;
  color: #333;
}

.post-item p {
  /* margin: 0; */
  margin: 5px 0;
  font-size: 14px;
  color: #555
}
</style>
