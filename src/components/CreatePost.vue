<template><!--글 작성 페이지-->
  <div class="create-wrap"><!--전체 감싸기-->
    <header class="create-header">
      <router-link to="/" class="logo" @click="goToHome">📝 BlogRoot</router-link>
      <button class="logout-btn" @click="logout">로그아웃</button>
    </header>
    <main>
      <!--글 작성 폼-->
      <div class="create-card">
        <h2 class="create-title">글작성</h2>
        <form @submit.prevent="submitPost" class="post-form">
          <div class="input-group">
            <label for="title">제목</label>
            <input
              type="text"
              v-model="title"
              id="title"
              placeholder="제목을 입력하세요."
              required
            />
          </div>
          <div class="input-group">
            <label for="content">내용</label>
            <div id="editor"></div>
          </div>
          <div class="inputfile">
            <input type="file" name="boardfile" id="inputFile" />
          </div>
          <button type="submit" class="complete-btn">작성 완료</button>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default {
  name: "CreatePost",
  data() {
    return {
      title: "",
      content: "",
    };
  },
  methods: {
    submitPost() {//글 작성 완료시 실행
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || !currentUser.name || !currentUser.email) {
        alert("로그인이 필요합니다.");
        this.$router.push("/login");
        return;
      }
      this.content = this.editor.root.innerHTML;
      const newPost = {
        id: Date.now(),
        name: currentUser.name,
        email: currentUser.email,
        title: this.title,
        content: this.content,
        date: new Date().toISOString(),
        views: 0,
      };
      axios
        .post(`${process.env.VUE_APP_API_URL}/create`, newPost)
        .then(() => {
          this.$router.push("/list");
        })
        .catch((error) => {
          console.error("게시물 생성 중 오류 발생:", error);
          alert("게시물 생성에 실패했습니다.");
        });
    },
    logout() {
      localStorage.removeItem("currentUser");
      this.$router.push("/login");
    },
    goToHome() {
      this.$router.push("/");
    },
  },
  mounted() {
    this.editor = new Quill("#editor", {
      theme: "snow",
      placeholder: "내용을 입력하세요.",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          [{ align: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ color: [] }, { background: [] }],
        ],
      },
    });
  },
};
</script>

<style scoped>
.create-header {/*로고, 로그아웃*/
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  background: #fff;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  border-bottom: 1px solid #eee;
}
.create-wrap {/*전체 페이지 감싸기, 헤더와 본문*/
  padding-top: 56px; /* 헤더 높이만큼 */
  min-height: 100vh;
  background: #f7f8fa;
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
}
.logo {
  font-size: 28px;
  font-weight: 700;
  color: #234567;
  letter-spacing: -1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
}
.logout-btn {
  margin-right: 56px;
  background-color: #234567;
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 7px;
}
.logout-btn:hover {
  background: #18314c;
}
main {/*본문 전체*/
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-card {/*글쓰기 카드, 폼 전체임*/
  background: #fff;
  max-width: 1000px;
  width: 100%;
  margin: 84px auto 0 auto; /* 위쪽 여백 줄임 */
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(60,80,100,0.09);
  padding: 40px 36px 32px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-title {/*글작성 타이틀 부분*/
  font-size: 2rem;
  font-weight: 800;
  color: #234567;
  margin-bottom: 30px;
  letter-spacing: -1px;
}
.post-form {/*입력*/
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.input-group {/*제목, 내용 입력*/
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-group label {
  font-size: 1.05rem;
  font-weight: 600;
  color: #234567;
  margin-bottom: 2px;
}
.input-group input[type="text"] {
  padding: 12px 14px;
  font-size: 1.07rem;
  border: 1.5px solid #eceef1;
  border-radius: 8px;
  background: #f7f8fa;
  transition: border 0.18s;
}
.input-group input[type="text"]:focus {
  border: 1.5px solid #234567;
  outline: none;
}
#editor {
  height: 320px;
  background: #fff;
  border: 1.5px solid #eceef1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 1.05rem;
}
.inputfile {
  margin-top: 4px;
}
.inputfile input[type="file"] {
  font-size: 0.97rem;
  color: #234567;
}
.complete-btn {
  width: 140px;
  align-self: flex-end;
  background: #234567;
  color: #fff;
  border: none;
  padding: 12px 0;
  font-size: 1.09rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
}
.complete-btn:hover {
  background: #18314c;
}
</style>
