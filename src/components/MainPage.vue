<template>
  <div class="blogroot-container">
    <header class="blogroot-header">
      <h1 class="logo">📝 BlogRoot</h1>
      <div class="header-actions">
        <button v-if="!isLoggedIn" @click="goToUserLogin">로그인</button>
        <button v-else @click="logout">로그아웃</button>
        <button v-if="isLoggedIn" @click="goToCreatePage">글 작성</button>
      </div>
    </header>

    <!-- 목록 버튼 추가 -->
    <nav class="nav-bar">
      <button class="nav-button" @click="goToPostList">📄 전체 글 목록 보기</button>
    </nav>

    <main class="post-grid">
      <div
        v-for="post in sortedPost"
        :key="post.id"
        class="post-card"
        @click="goToDetail(post.id)"
      >
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <span>작성자 {{ post.name }}</span>
          <span>{{ formatDate(post.created_at) }}</span>
          <span>👁 {{ post.views }}</span>
        </div>
        <div class="post-content" v-html="post.content"></div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "BlogMain",
  data() {
    return {
      posts: [],
      isLoggedIn: !!localStorage.getItem("currentUser"),
    };
  },
  computed: {
    sortedPost() {
      return [...this.posts].sort((a, b) => b.views - a.views).slice(0, 2);
    },
  },
  mounted() {
    fetch(`${process.env.VUE_APP_API_URL}/list`)
      .then((res) => res.json())
      .then((data) => {
        this.posts = data;
      })
      .catch((err) => console.error(err));

    window.addEventListener("storage", this.syncLoginState);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.syncLoginState);
  },
  methods: {
    logout() {
      localStorage.removeItem("currentUser");
      this.isLoggedIn = false;
      alert("로그아웃 되었습니다.");
    },
    syncLoginState(event) {
      if (event.key === "currentUser") {
        this.isLoggedIn = !!localStorage.getItem("currentUser");
      }
    },
    goToCreatePage() {
      this.$router.push("/create");
    },
    goToUserLogin() {
      this.$router.push("/login");
    },
    goToPostList() {
      this.$router.push("/list");
    },
    goToDetail(id) {
      this.$router.push(`/detail/${id}`);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.blogroot-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 0 64px 0;
  background: #f7f8fa;
  min-height: 100vh;
}

.blogroot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px 18px 32px;
  border-bottom: 1.5px solid #e0e3e8;
  background: #fff;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: #234567;
  letter-spacing: -1px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.header-actions button {
  margin-left: 10px;
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background-color: #234567;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.header-actions button:hover {
  background: #18314c;
}

.nav-bar {
  margin: 24px 0 12px 0;
  padding: 0 32px;
}
.nav-button {
  background: #6d7a86;
  color: #fff;
  padding: 8px 20px;
  font-size: 15px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 500;
}
.nav-button:hover {
  background: #49525a;
}

/* 게시글 카드 그리드 */
.post-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  padding: 0 32px;
}

/* 카드 스타일 */
.post-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(60,80,100,0.07);
  padding: 28px 24px 22px 24px;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s;
  border: 1.5px solid #eceef1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.post-card:hover {
  box-shadow: 0 8px 24px rgba(60,80,100,0.13);
  transform: translateY(-4px) scale(1.02);
}

/* 제목, 메타, 본문 */
.post-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #234567;
  line-height: 1.3;
}
.post-meta {
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: #7a869a;
  margin-bottom: 14px;
  align-items: center;
}
.post-content {
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

</style>
