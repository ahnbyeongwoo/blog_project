<template>
  <div class="blogroot-detail-wrap">
    <header class="blogroot-detail-header">
      <router-link to="/" class="logo" @click="goToHome">📝 BlogRoot</router-link>
    </header>
    
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
              <small>작성자 : {{ comment.username }} | {{ comment.createdAt }}</small>
              <button @click="toggleLike(comment.id)" class="like-button">
                <span>{{ comment.isLiked ? '❤️' : '🤍' }}</span> {{ comment.likesCount }}
              </button>
              <img v-if="comment.userId === currentUserId" src="@/assets/delete-comment.jpg" alt="삭제"
                class="delete-icon" @click="deleteComment(comment.id)">
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
      newComment: "",
      currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
      currentUserId: JSON.parse(localStorage.getItem("currentUser") || "null")?.email || null,
    };
  },
  computed: {
    isMyPost() {
      return (
        this.currentUser &&
        this.post &&
        this.currentUser.email === this.post.email
      );
    },
  },

  async mounted() {
    this.postId = this.$route.params.id;
    this.currentUserId = JSON.parse(localStorage.getItem("currentUser") || "null")?.email || null;
    await this.getPostDetail();
    await this.fetchComments();
  },
  methods: {
    goToHome() {
      this.$router.push("/");
    },
    async getPostDetail() {
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
    async fetchComments() {
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



    async addComment() {
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
        this.comments.push({
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

    async toggleLike(commentId) {
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
.blogroot-detail-wrap {
  background: #fff;
  min-height: 100vh;
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
}

.blogroot-detail-header {
  width: 100%;
  border-bottom: 1px solid #eee;
  padding: 28px 0 18px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.detail-article {
  background: #fff;
  max-width: 700px;/* 최대 너비를 700px로 제한 */
  width: 100%;/* 너비를 부모 요소의 100%로 설정 */
  margin: 48px auto 0 auto;/* 위쪽 48px, 아래쪽 0, 좌우 중앙 정렬 */
  padding: 0 0 48px 0;/* 아래쪽에만 48px 패딩을 주고, 나머지는 0 */
  display: flex;/* Flexbox 레이아웃 사용 */
  flex-direction: column;/* 자식 요소들을 세로로 배치 */
  align-items: center;/* 가로 방향 정렬을 중앙으로 설정 */
  border-radius: 0;/* 테두리 모서리를 둥글게 하지 않음 (모서리 없음) */
  box-shadow: none;/* 그림자 효과 제거 */
}

.detail-meta {
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

.detail-actions {
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

.comments-section {
  background: #fff;
  max-width: 700px;/*최대 너비 */
  width: 100%;/*너비 부모 기준 100% */
  margin: 0 auto 60px auto;/*위쪽 0 ,중앙 정렬, 아래쪽 60px 마진 */
  margin-top: 32px; /* 위쪽에만 32px 마진 */
  border-top: 1px solid #eee; /* 위쪽에만 테두리 */
  padding: 34px 0 0 0;
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

.comment-form textarea {
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
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #7a869a;
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

@media (max-width: 900px) {
  .blogroot-detail-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 0 10px 0;
  }

  .logo {
    margin-left: 18px;
  }

  .detail-article,
  .comments-section {
    max-width: 99vw;
    padding: 0 6vw;
  }
}
</style>
