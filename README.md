# 📝 Blog Project

Vue.js와 Node.js 기반의 개인 블로그 웹 애플리케이션입니다.  
게시글 작성, 수정, 삭제, 댓글, 좋아요 등 CRUD 기능을 중심으로 구현했으며,  
Express + MySQL을 사용한 REST API 서버와 연동됩니다.

---

## 🧩 기술 스택

**Frontend:** Vue.js, Vue Router, Axios, Bootstrap  
**Backend:** Node.js, Express  
**Database:** MySQL  
**Deploy:** Vercel / Render  
**Tools:** Git, GitHub, VSCode, DBeaver

---

## 📦 주요 기능

1. 게시글 목록 조회 및 상세 페이지 보기  
2. 게시글 작성, 수정, 삭제 (CRUD)  
3. 회원가입 및 로그인 (세션 유지)  
4. 댓글 작성 및 삭제  
5. 댓글 좋아요 기능  
6. 작성자별 게시글 관리 페이지  
7. 반응형 UI 디자인

---

## 📁 폴더 구조
```
BLOGPROJECT-MAIN/
├── blogproject_back-end/
│ ├── app.js
│ ├── package.json
│ ├── .env
│
├── blogproject_front-end/
│ ├── public/
│ ├── src/
│ │ ├── assets/
│ │ │ └── delete-comment.jpg
│ │ ├── components/
│ │ │ ├── CreatePost.vue
│ │ │ ├── EditPost.vue
│ │ │ ├── MainPage.vue
│ │ │ ├── PostDetail.vue
│ │ │ ├── PostList.vue
│ │ │ ├── SignUp.vue
│ │ │ └── UserLogin.vue
│ │ ├── router/
│ │ │ └── index.js
│ │ ├── App.vue
│ │ └── main.js
│ ├── .gitignore
│ ├── babel.config.js
│ ├── jsconfig.json
│ ├── package-lock.json
│ ├── package.json
│ └── README.md
│
└── README.md
```
---

## 🚀 실행 방법

```bash
# 프론트엔드 실행
npm install
npm run serve

# 백엔드 실행
cd server
npm install
node app.js
