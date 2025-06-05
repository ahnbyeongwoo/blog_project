<template>
  <div class="create-wrap">
    <header class="create-header">
      <router-link to="/" class="logo" @click="goToHome">📝 BlogRoot</router-link>
      <button class="logout-btn" @click="logout">로그아웃</button>
    </header>
    <main>
      <div class="create-card">
        <h2 class="create-title">글 수정</h2>
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
            <input type="file" name="boardfile" id="inputFile" disabled />
          </div>
          <div class="btn-group">
            <button type="button" class="cancel-btn" @click="cancelEdit">취소</button>
            <button type="submit" class="complete-btn">수정 완료</button>
          </div>
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
  name: "EditPost",
  data() {
    return {
      title: "",
      content: "",
      postId: null,
    };
  },
  methods: {
    async loadPostData() {
      const postId = parseInt(this.$route.params.id);
      this.postId = postId;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/detail/${postId}`);
        const post = response.data.post;
        this.title = post.title;
        this.content = post.content;
        if (this.editor) {
          this.editor.root.innerHTML = this.content;
        }
      } catch (error) {
        alert("글을 찾을 수 없습니다.");
        this.$router.push("/list");
      }
    },
    async submitPost() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        this.$router.push("/login");
        return;
      }
      this.content = this.editor.root.innerHTML;
      try {
        await axios.put(
          `${process.env.VUE_APP_API_URL}/detail/${this.postId}`,
          {
            title: this.title,
            content: this.content,
          },
          {
            headers: {
              "current-user": currentUser.email,
            },
          }
        );
        alert("수정이 완료되었습니다.");
        this.$router.push("/list");
      } catch (error) {
        alert("수정에 실패했습니다. 다시 시도해주세요.");
      }
    },
    cancelEdit() {
      this.$router.push("/list");
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
    this.loadPostData();
  },
};
</script>

<style scoped>
.create-wrap {
  min-height: 100vh;
  background: #f7f8fa;
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
}
.create-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 0 18px 0;
  border-bottom: 1px solid #eee;
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
  text-decoration: none;
}
.logout-btn {
  margin-right: 56px;
  background: none;
  border: none;
  color: #234567;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 7px;
}
.logout-btn:hover {
  background: #18314c;
}
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-card {
  background: #fff;
  max-width: 1000px;
  width: 100%;
  margin: 48px 0 0 0;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(60,80,100,0.09);
  padding: 40px 36px 32px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.create-title {
  font-size: 2rem;
  font-weight: 800;
  color: #234567;
  margin-bottom: 30px;
  letter-spacing: -1px;
}
.post-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.input-group {
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
.btn-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.complete-btn {
  width: 140px;
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
.cancel-btn {
  width: 100px;
  background: #ccc;
  color: #222;
  border: none;
  padding: 12px 0;
  font-size: 1.09rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
}
.cancel-btn:hover {
  background: #999;
}
@media (max-width: 700px) {
  .create-header {
    padding: 18px 0 10px 0;
  }
  .logo {
    margin-left: 16px;
  }
  .logout-btn {
    margin-right: 16px;
  }
  .create-card {
    max-width: 98vw;
    padding: 18px 6vw 18px 6vw;
  }
}
</style>
