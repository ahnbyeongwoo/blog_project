<template>
  <div class="thinknote-container">
    <header class="thinknote-header">
      <h1 class="logo" @click="goToPostList">📝 ThinkNote</h1>
      <div class="header-actions">
        <button v-if="!isLoggedIn" @click="goToUserLogin">로그인</button>
        <button v-else @click="logout">로그아웃</button>
        <button v-if="isLoggedIn" @click="goToCreatePage">글 작성</button>
      </div>
    </header>

    <main class="post-grid">
      <div
        v-for="post in sortedPost"
        :key="post.id"
        class="post-card"
      >
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <span>✍ {{ post.name }}</span>
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
.thinknote-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f8f9fb;
  color: #333;
}

.thinknote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 15px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.header-actions button {
  margin-left: 10px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background-color: #0056b3;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.header-actions button:hover {
  background-color: #004494;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
  gap: 20px;
}

.post-card {
  background-color: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out;
}
.post-card:hover {
  transform: translateY(-4px);
}

.post-title {
  font-size: 20px;
  margin-bottom: 10px;
  font-weight: bold;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.post-content {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
</style>
