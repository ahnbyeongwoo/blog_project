<template>
  <div class="thinknote-list-wrap">
    <header class="list-header">
      <router-link to="/" class="logo" @click="goToHome">thinknote</router-link>
    </header>
    <main>
      <div class="list-controls">
        <div class="my-posts-checkbox">
          <input type="checkbox" v-model="filterMyPosts" id="myPosts" @change="reloadPosts" />
          <label for="myPosts">내가 쓴 글</label>
        </div>
        <div class="search-bar">
          <select v-model="searchType">
            <option value="title">제목</option>
            <option value="author">작성자</option>
          </select>
          <input v-model="searchKeyword" placeholder="검색어를 입력하세요" @keyup.enter="searchPosts" />
          <button @click="searchPosts">검색</button>
        </div>
        <button class="write-btn" @click="goToCreatePage">글작성</button>
      </div>

      <section class="post-list">
        <div
          v-for="post in paginatedPosts"
          :key="post.id"
          class="post-list-card"
          @click="goToDetail(post.id)"
        >
          <div class="post-list-meta">
            <span class="post-list-author">글쓴이: {{ post.name }}</span>
            <span class="post-list-date">{{ formatDate(post.created_at) }}</span>
            <span class="post-list-views">조회수: {{ post.views }}</span>
          </div>
          <div class="post-list-title">{{ post.title }}</div>
          <div class="post-list-content" v-html="post.content"></div>
        </div>
        <div v-if="paginatedPosts.length === 0" class="no-posts">
          게시글이 없습니다.
        </div>
      </section>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">이전</button>
        <span>{{ currentPage }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      posts: [],
      filterMyPosts: false,
      searchType: "title",
      searchKeyword: "",
      currentPage: 1,
      pageSize: 10,
      currentUser: null,
    };
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.posts.length / this.pageSize));
    },
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.posts.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    const currentUserData = localStorage.getItem("currentUser");
    this.currentUser = currentUserData ? JSON.parse(currentUserData) : null;
    this.reloadPosts();
  },
  methods: {
    async reloadPosts() {
      try {
        const currentUserEmail = this.currentUser ? this.currentUser.email : null;
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/list`, {
          params: {
            myPostsOnly: this.filterMyPosts ? "true" : "false",
            currentUserEmail,
          },
        });
        this.posts = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        this.currentPage = 1;
      } catch (error) {
        console.error("게시물 불러오기 중 오류 발생:", error);
      }
    },
    async searchPosts() {
      if (!this.searchKeyword.trim()) {
        alert("검색어를 입력해주세요.");
        return;
      }
      try {
        const currentUserEmail = this.currentUser ? this.currentUser.email : null;
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/api/search`, {
          params: {
            type: this.searchType,
            keyword: this.searchKeyword.trim(),
            myPostsOnly: this.filterMyPosts ? "true" : "false",
            currentUserEmail,
          },
        });
        this.posts = response.data;
        this.currentPage = 1;
      } catch (error) {
        console.error("검색 실패:", error.response?.data?.message || error.message);
        alert("검색 중 오류가 발생했습니다.");
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
      });
    },
    goToDetail(id) { this.$router.push(`/detail/${id}`); },
    goToCreatePage() { this.$router.push("/create"); },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }
  }
};
</script>

<style scoped>
.thinknote-list-wrap {
  min-height: 100vh;
  background: #f7f8fa;
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
}
.list-header {
  width: 100%;
  border-bottom: 1px solid #eee;
  padding: 28px 0 18px 0;
  display: flex;
  align-items: center;
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
main {
  max-width: 800px;
  margin: 40px auto 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: space-between;
}
.my-posts-checkbox {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #333;
  gap: 6px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 1px 4px rgba(60,80,100,0.05);
}
.search-bar select,
.search-bar input {
  border: 1px solid #eceef1;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 15px;
  background: #f7f8fa;
}
.search-bar button {
  background: #234567;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.search-bar button:hover {
  background: #18314c;
}
.write-btn {
  background: #234567;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.write-btn:hover {
  background: #18314c;
}
.post-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 180px;
}
.post-list-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(60,80,100,0.07);
  padding: 22px 26px 16px 26px;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s;
  border: 1.5px solid #eceef1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.post-list-card:hover {
  box-shadow: 0 8px 24px rgba(60,80,100,0.13);
  transform: translateY(-3px) scale(1.01);
}
.post-list-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #7a869a;
  margin-bottom: 2px;
}
.post-list-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #234567;
  word-break: break-all;
  margin-top: 2px;
}
.post-list-content {
  font-size: 0.97rem;
  color: #444;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.no-posts {
  width: 100%;
  text-align: center;
  color: #aaa;
  font-size: 1.08rem;
  padding: 60px 0 40px 0;
  background: none;
  border: none;
}
.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 36px 0 24px 0;
}
.pagination button {
  background: #f7f8fa;
  color: #222;
  border: 1px solid #eceef1;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 15px;
  cursor: pointer;
}
.pagination button:disabled {
  color: #bbb;
  background: #f0f1f3;
  cursor: not-allowed;
}
@media (max-width: 900px) {
  .list-header {
    padding: 18px 0 10px 0;
  }
  .logo {
    margin-left: 18px;
  }
  main {
    padding: 0 4vw;
  }
  .post-list-card {
    padding: 14px 8px 10px 12px;
  }
}
</style>
