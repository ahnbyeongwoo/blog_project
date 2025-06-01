<template>
  <!--글작성 페이지-->
  <div class="create-post-container">
    <header>
      <h1>
        <router-link to="/" class="blog_title">BlogProject</router-link><!--홈으로 이동-->
      </h1>
      <button class="logout-button" @click="logout">로그아웃</button>
    </header>
    <h2 class="create-post-title">글작성</h2>
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
      <div class="inputfile"><!--파일 업로드-->
        <input type="file" name="boardfile" id="inputFile" />
      </div>
      <button type="submit" class="complete-button">작성 완료</button>
    </form>
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
    submitPost() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));//현재 사용자 정보

      if (!currentUser || !currentUser.name || !currentUser.email) {
        alert.apply("로그인이 필요합니다.");
        this.$router.push("/login");
        return;
      }//로그인 확인 조건

      this.content = this.editor.root.innerHTML;

      //새로운 글 데이터 작성
      const newPost = {
        id: Date.now(), //고유 ID
        name: currentUser.name, //작성자 이름
        email: currentUser.email,
        title: this.title, //글 제목
        content: this.content, //글 내용
        date: new Date().toISOString(),
        views: 0, //초기 조회수
      };

      axios//서버에 게시글 데이터 전송 post 요청
        .post('http://localhost:3000/create', newPost)
        .then(() => {
          this.$router.push("/list");//성공 시 게시글 목록 이동
        })
        .catch((error) => {
          console.error("게시물 생성 중 오류 발생:", error);
          alert("게시물 생성에 실패했습니다.");
        });
    },

    logout() {
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
  mounted() {
    // Quill 초기화
    this.editor = new Quill("#editor", {
      theme: "snow", // 기본 눈 테마 설정
      placeholder: "내용을 입력하세요.",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"], // 텍스트 꾸미기 옵션 굵게, 기울임, 밑줄, 취소선
          [{ list: "ordered" }, { list: "bullet" }], // 리스트 옵션
          ["link", "image"], // 링크와 이미지
          [{ align: [] }], // 텍스트 정렬
          [{ size: ["small", false, "large", "huge"] }], // 텍스트 크기
          [{ color: [] }, { background: [] }], // 글자색과 배경색
        ],
      },
    });
  },
};
</script>

<style scoped>
#editor {
  height: 400px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}

.create-post-container {/*전체 작성 페이지 컨테이너 */
  width: 90%;
  margin: 50px auto;
  background-color: #aba6a6;
  padding: 20px;
  border-radius: 10px;/* 모서리 둥글게*/
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.1);/*그림자 효과 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
}


.logout-button {/* 로그아웃 버튼 */
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  color: black;
  font-size: 12px;
  cursor: pointer;
  padding: 8px 16px;
}


.create-post-title {/* 글작성 제목 스타일 */
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 16px;
  font-weight: bold;
}

.input-group input,
.input-group textarea {
  /* width: 100%; */
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  /* box-sizing: border-box; */
}

.complete-button {
  width: 120px;
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
}

.complete-button:hover {
  background: #0056b3;
}
</style>
