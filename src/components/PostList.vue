<template><!--글 목록-->
  <div class="thinknote-list-wrap">
    <header class="list-header">
      <h1 class="logo" @click="goToHome">thinknote</h1>
    </header>
    <main>
      <div class="list-controls">
        <div class="my-posts-checkbox">
          <input type="checkbox" v-model="showMyPosts" id="myPosts" />
          <label for="myPosts">내가 쓴 글</label>
        </div>
        <div class="search-bar">
          <select v-model="searchType">
            <option value="title">제목</option>
            <option value="content">내용</option>
            
          </select>
          <input v-model="searchQuery" placeholder="검색어를 입력하세요" />
          <button @click="searchPosts">검색</button>
        </div>
        <button class="write-btn" @click="goToCreatePage">글작성</button>
      </div>

      <section class="post-list">
        <div
          v-for="post in filteredPosts"
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
        </div>
      </section>

      <div class="pagination"><!--하단 페이지-->
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
  name: "PostList",//컴포넌트 이름
  data() {
    return {
      posts: [],
      currentPage: 1,
      postPerPage: 5,
      isLoggedIn: !!localStorage.getItem("currentUser"),
      filterMyPosts: false,
      searchKeyword: "",
      searchType: "title",
    };
  },

  computed: {
    sortedPosts() {//최신순으로 정렬된 게시글 목록 반환함
      return [...this.posts].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)//최신순으로 정렬
      );
    },
    paginatedPosts() {//현재 페이지에 해당하는 게시글 목록 반환함
      const startIndex = (this.currentPage - 1) * this.postPerPage;
      const endIndex = startIndex + this.postPerPage;//시작 인덱스와 끝 인덱스 계산
      return this.sortedPosts.slice(startIndex, endIndex);//시작 인덱스부터 끝 인덱스까지의 게시글 목록 반환
    },
    totalPages() {//전체 페이지 수
      return Math.ceil(this.posts.length / this.postPerPage);
    },
  },

  methods: {
    async reloadPosts() {//게시글 목록 다시 불러오기
      try {
        const currentUserData = localStorage.getItem("currentUser");
        const currentUser = currentUserData
          ? JSON.parse(currentUserData).email
          : null;

        const response = await axios.get(`${process.env.VUE_APP_API_URL}/list`, {
          params: {
            myPostsOnly: this.filterMyPosts ? "true" : "false",
            currentUserEmail: currentUser,
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

    async searchPosts() {//검색 기능
      if (!this.searchKeyword.trim()) {
        alert("검색어를 입력해주세요.");
        return;
      }

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/api/search`, {
          params: {
            type: this.searchType,//검색 타입(제목 또는 작성자)
            keyword: this.searchKeyword.trim(),
          },
        });
        this.posts = response.data; // 검색 결과를 posts에 저장
        this.currentPage = 1; // 검색 후 첫 페이지로 초기화
      } catch (error) {
        console.error("검색 실패:", error.response?.data?.message || error.message);
        alert("검색 중 오류가 발생했습니다.");
      }
    },

    createPost() {
      this.$router.push("/create");
    },

    logout() {
      localStorage.removeItem("currentUser");
      this.$router.push("/login");
    },

    formatDate(dateString) {
      if (!dateString) return "Invalid Date";

      const date = new Date(dateString.replace(" ", "T"));
      if (isNaN(date.getTime())) return "Invalid Date";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    changePage(page) {
      this.currentPage = page;
    },

    goToUserLogin() {
      this.$router.push("/login");
    },
  },

  mounted() {//컴포넌트가 화면에 나타날 때 실행
    this.reloadPosts();
  },
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  margin-left: 56px;
  cursor: pointer;
  letter-spacing: -0.5px;
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