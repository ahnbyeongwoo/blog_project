<template><!--글 상세 페이지-->
  <div class="blogroot-detail-wrap">
    <header class="blogroot-detail-header">
      <router-link to="/" class="logo" @click="goToHome">📝 BlogRoot</router-link>
    </header>

    <!--게시글 상세 여역-->
    <article class="detail-article">
      <div class="detail-meta">
        <span>{{ formatDate(post.created_at) }}</span>
        <span v-if="post.category">/ {{ post.category }}</span>
        <span v-if="post.name">/ {{ post.name }}</span>
      </div>
      <h2 class="detail-title">{{ post.title }}</h2>
      <div class="detail-actions" v-if="isMyPost">
        <button class="edit-btn" @click="editPost">수정</button>
        <button class="delete-btn" @click="deletePost">삭제</button>
      </div>
      <div v-if="post.thumbnail" class="detail-img-wrap">
        <img :src="post.thumbnail" alt="썸네일" class="detail-img" />
      </div>
      <div class="detail-content" v-html="post.content"></div>
    </article>

    <!-- 댓글 영역 -->
    <section class="comments-section">
      <h3>댓글 {{ comments.length }}</h3>
      <form @submit.prevent="addComment" class="comment-form">
        <textarea v-model="newComment" placeholder="댓글을 작성하시오" required></textarea>
        <button type="submit">댓글 작성</button>
      </form>
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <p>{{ comment.content }}</p>
          <div class="comment-footer">
            <div class="comment-meta">
              <small>작성자 : {{ comment.username }} | {{ comment.createdAt }}</small>
            </div>
            <div class="comment-actions">
              <button @click="toggleLike(comment.id)" class="like-button">
                <span>{{ comment.isLiked ? '❤️' : '🤍' }}</span> {{ comment.likesCount }}
              </button>
              <img v-if="comment.userId === currentUserId" src="@/assets/delete-comment.jpg" alt="삭제"
                class="delete-icon" @click="deleteComment(comment.id)">
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      post: {},
      comments: [],
      newComment: "",//새 댓글 입력값
      currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
      currentUserId: JSON.parse(localStorage.getItem("currentUser") || "null")?.email || null,
    };
  },
  computed: {
    isMyPost() {//내가 쓴 글인지 확인하는 프로퍼티
      return (
        this.currentUser &&
        this.post &&
        this.currentUser.email === this.post.email
      );
    },
  },

  async mounted() {
    //컴포넌트 마운트될 때 게시글 ID와 현재 사용자 ID를 가져옴
    this.postId = this.$route.params.id;
    this.currentUserId = JSON.parse(localStorage.getItem("currentUser") || "null")?.email || null;
    await this.getPostDetail();
    await this.fetchComments();//댓글 목록 가져오기
  },
  methods: {
    goToHome() {
      this.$router.push("/");
    },
    async getPostDetail() {//게시글 상세 정보
      const postId = parseInt(this.$route.params.id);
      if (isNaN(postId)) {
        this.$router.push("/list");
        return;
      }
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/detail/${postId}`);
        this.post = response.data.post;
      } catch (error) {
        this.$router.push("/list");
      }
    },
    async fetchComments() {//댓글 목록 가져오기, 댓글 좋아요 동기화
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL}/comments/${this.$route.params.id}`
        );
        this.comments = response.data.map((comment) => ({
          id: comment.id,
          userId: comment.userId, // ← 반드시 이메일이 들어와야 함
          username: comment.username,
          createdAt: comment.createdAt ? this.formatDate(comment.createdAt) : "",
          content: comment.content,
          isLiked: false,
          likesCount: 0,
        }));
        // 좋아요 상태와 카운트 동기화
        for (const comment of this.comments) {
          try {
            const likeResponse = await axios.get(
              `${process.env.VUE_APP_API_URL}/api/comments/${comment.id}/likes`, {
              params: { userId: this.currentUserId },
            });
            comment.isLiked = likeResponse.data.isLiked;
            comment.likesCount = likeResponse.data.likesCount;
          } catch (err) {
            console.error(`댓글 ${comment.id} 좋아요 상태 가져오기 실패:`, err);
          }
        }
      } catch (error) {
        this.comments = [];
      }
    },
    async addComment() {//댓글 작성
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser || !storedUser.email) {
          throw new Error("사용자 정보가 없습니다.");
        }
        const response = await axios.post(
          `${process.env.VUE_APP_API_URL}/comments/${this.$route.params.id}`,
          {
            postId: this.$route.params.id,
            content: this.newComment,
            userEmail: storedUser.email,
          }
        );
        this.comments.push({//새 댓글 추가
          id: response.data.id,
          userId: response.data.userId || storedUser.email, 
          username: response.data.username || storedUser.name || storedUser.email,
          createdAt: response.data.createdAt
            ? this.formatDate(response.data.createdAt)
            : this.formatDate(new Date()),
          content: response.data.content,
          isLiked: false,
          likesCount: 0,
        });
        this.newComment = "";
      } catch (error) {
        alert("댓글 작성에 실패했습니다.");
      }
    },


    async deleteComment(commentId) {//댓글 삭제 메서드
      alert('정말 이 댓글을 삭제하시겠습니까?');
      try {
        const token = localStorage.getItem("token");//토큰 가져옴
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!storedUser || !storedUser.email) {
          throw new Error("사용자 정보가 없습니다.");
        }
        const currentUserEmail = storedUser.email;

        await axios.delete(`${process.env.VUE_APP_API_URL}/comments/${commentId}`, {//서버에서 댓글 삭제 요청 보내기
          headers: {
            Authorization: `Bearer ${token}`,
            "current-user": currentUserEmail,
          },
        });

        this.comments = this.comments.filter(//삭제된 댓글 제외하고 다시 렌더링
          (comment) => comment.id !== commentId//다른 댓글은 유지
        );
      } catch (error) {
        console.log("댓글 삭제 실패:", error.response?.data || error.message);
      }
    },

    async toggleLike(commentId) {//댓글 좋아요 토글
      const comment = this.comments.find((c) => c.id === commentId);
      if (!comment) return;
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}/api/comments/${commentId}/likes`, {
          userId: this.currentUserId,
        });
        if (response.data.message.includes("추가")) {
          comment.isLiked = true;
          comment.likesCount += 1;
        } else if (response.data.message.includes("취소")) {
          comment.isLiked = false;
          comment.likesCount -= 1;
        }
      } catch (error) {
        console.error("좋아요 토글 실패:", error);
      }
    },

    async deletePost() {
      if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        await axios.delete(`${process.env.VUE_APP_API_URL}/detail/${this.post.id}`, {
          headers: {
            "current-user": storedUser.email,
          },
        });
        alert("게시물이 삭제되었습니다.");
        this.$router.push("/list");
      } catch (error) {
        alert("게시물 삭제에 실패했습니다.");
      }
    },
    editPost() {
      if (!this.currentUser) {
        alert("로그인이 필요합니다.");
        this.$router.push("/login");
        return;
      }
      this.$router.push(`/edit/${this.post.id}`);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ""; // 잘못된 값 방지
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
}

.blogroot-detail-header {/* 상단 고정 헤더, 로고 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 84px;
  background: #fff;
  z-index: 1000;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
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

.blogroot-detail-wrap {/* 전체 감싸기, 헤더 본문 댓글 */
  padding-top: 84px;
  /* 헤더 높이만큼 */
  background: #fff;
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
  height: 100vh;
  width: 1000px;
  max-width: 100%;
}

.detail-article {/* 게시글 상세 카드(제목, 수정, 이미지, 본문) */
  background: #fff;
  max-width: 1000px;
  width: 100%;
  margin: 48px auto 0 auto;
  padding: 0 16px 48px 16px;
  /* ✅ 좌우 여백 동일 */
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
}

.detail-meta {/* 작성일, 카테고리, 정보 */
  color: #888;
  font-size: 1rem;
  margin-bottom: 12px;
  width: 100%;
  text-align: left;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.detail-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 36px;
  width: 100%;
  text-align: left;
  line-height: 1.3;
  letter-spacing: -1px;
}

.detail-actions {/* 내가 쓴 글만 보이는 버튼 */
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  justify-content: flex-end;
  width: 100%;
}

.edit-btn,
.delete-btn {
  padding: 7px 18px;
  border: none;
  border-radius: 7px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.edit-btn {
  background: #234567;
  color: #fff;
}

.edit-btn:hover {
  background: #18314c;
}

.delete-btn {
  background: #e25555;
  color: #fff;
}

.delete-btn:hover {
  background: #b22222;
}

.detail-img-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 36px;
}

.detail-img {
  max-width: 480px;
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 16px rgba(60, 80, 100, 0.08);
}

.detail-content {
  width: 100%;
  font-size: 1.13rem;
  color: #222;
  line-height: 2.1;
  margin-top: 18px;
  word-break: break-all;
  letter-spacing: -0.2px;
}

.comments-section {/* 댓글 전체 영역 */
  background: #fff;
  max-width: 1000px;
  width: 100%;
  margin: 32px auto 60px auto;
  border-top: 1px solid #eee;
  box-sizing: border-box;
  padding: 0 16px;
  /* ✅ 동일한 좌우 여백 */
}

.comments-section h3 {
  font-size: 1.12rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 18px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.comment-form textarea {/* 댓글 입력창 */
  resize: none;
  border: 1.5px solid #eceef1;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  min-height: 60px;
  background: #f7f8fa;
}

.comment-form button {
  align-self: flex-end;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 7px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.comment-form button:hover {
  background: #444;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.comment-item {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(60, 80, 100, 0.05);
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #7a869a;
  margin-top: 6px;
}
.comment-meta{
  flex: 1;
  text-align: left;
}
.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.like-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  color: #e25555;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: color 0.15s;
}

.like-button:hover {
  color: #b22222;
}

.delete-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-left: 6px;
  vertical-align: middle;
}
</style>
