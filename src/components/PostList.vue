<template>
  <!--글 목록-->
  <div class="container">
    <header>
      <h1>
        <router-link to="/" class="blog_title">BlogProject</router-link>
      </h1>
      <button v-if="!isLoggedIn" class="action-button" @click="goToUserLogin">
        로그인
      </button>
      <button v-else class="logout-button" @click="logout">로그아웃</button>
    </header>
    <div class="post-list-container"> <!-- 전체 글 목록 컨테이너 -->
      <h2 class="post-list-title">글 목록</h2>
      <div class="filter-container"><!--필터 및 검색 -->
        <div class="myPosts"><!--내가 쓴 글 필터-->
          <label>
            <input type="checkbox" v-model="filterMyPosts" @change="reloadPosts" /><!--내가 쓴 글 필터 체크박스-->
            내가 쓴 글
          </label>
        </div>

        <!-- 검색 기능 -->
        <div class="search-container">
          <form @submit.prevent="searchPosts">
            <label for="sc"></label>
            <select v-model="searchType" name="search" id="sc"><!--검색 타입 선택-->
              <option value="title">제목</option>
              <option value="name">작성자</option><!--검색 버튼 제목과 작성자로 선택-->
            </select>
            <input type="text" v-model="searchKeyword" placeholder="검색어를 입력하세요" class="search-input" />
            <button type="submit" class="search-button">검색</button>
          </form>
        </div>
      </div>

      <div class="post-list"><!-- 글 목록 -->
        <div v-for="post in paginatedPosts" :key="post.id" class="post-item"><!-- 글 목록 아이템 -->
          <span class="author">글쓴이: {{ post.name }}</span>
          <router-link :to="`/detail/${post.id}`">
            <h2 class="title">{{ post.title }}</h2>
          </router-link>
          <span class="date">작성일: {{ formatDate(post.created_at) }}</span>
          <p class="views">조회수: {{ post.views }}</p>
        </div>
      </div>

      <div class="pagination"><!--하단 페이지 버튼-->
        <button v-for="page in totalPages" :key="page" @click="changePage(page)"
          :class="{ active: currentPage === page }" class="pagination-btn"><!--페이지 번호 버튼-->
          {{ page }}
        </button>
      </div>

      <!-- 글작성 버튼 -->
      <button type="button" @click="createPost" class="create-post-btn">
        글작성
      </button>
    </div>
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
.container {
  display: flex;
  flex-direction: column;
  height: 60vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 10px;
  background-color: #f4f4f4;
  border-bottom: 1px solid #ddd;
}

.blog_title {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  text-decoration: none;
  color: black;
  background-color: transparent;
}

.post-list-container {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;/* 컨테이너를 수평 중앙에 배치 */
  padding: 20px;
  background-color: #ada9a9;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;/* 플렉스 방향을 세로(열)로 설정 */
  height: 650px;
  position: absolute;
  top: 10%;/* 상단에서 부모 요소 기준 */
}

.logout-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  cursor: pointer;
  padding: 5px 16px;
}

.post-list-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.blog_title {
  background-color: #f0f0f0;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 24px;
  border-radius: 5px;
}

.author,
.date,
.views {
  font-size: 14px;
  color: #555;
}

.title {
  font-size: 18px;
  font-weight: bold;
  flex-grow: 1;/*가로 공간*/
  margin: 0 10px;
}

.views {
  margin-left: 10px;
}

.create-post-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.create-post-btn:hover {
  background-color: #0056b3;
}

/*pagination style */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.pagination-btn {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
}

.pagination-btn.active {
  background-color: #555;
  color: white;
  font-weight: bold;
}

.pagination-btn:hover {
  background-color: #0056b3;
  color: white;
}

.filter-container {
  display: flex;/* 부모 박스 내가 쓴 글, 검색 기능 */
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.myPosts {
  margin-bottom: auto;
}

.search-container {
  display: flex;

}

.search-input {
  padding: 5px;
  font-size: 12px;
  width: 200px;
  margin-left: 7px;/* 버튼과 입력 필드 사이 간격 추가 */
}

.search-button {
  padding: 5px;
  margin-left: 7px;
  font-size: 12px;
}
</style>
