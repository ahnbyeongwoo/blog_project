const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const axios = require("axios");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: { rejectUnauthorized: false },
});

// 연결 테스트
pool.connect((err, client, release) => {
  if (err) {
    return console.error("PostgreSQL 연결 실패:", err);
  }
  console.log("✅ PostgreSQL 연결 성공!");
  release();
});
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    return console.error("PostgreSQL 연결 테스트 실패:", err);
  } else {
    console.log("PostgreSQL 연결 테스트 성공:");
  }
});

// 회원가입 API
app.post("/signup", async (req, res) => {
  const { name, id, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, id, password]
    );
    res.status(201).json({ message: "회원가입 성공!" });
  } catch (err) {
    res.status(500).json({ message: "회원가입 실패", error: err });
  }
});

// 로그인 API
app.post("/login", async (req, res) => {
  const { id, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [id, password]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: "로그인 성공!", user: result.rows[0] });
    } else {
      res.status(401).json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }
  } catch (err) {
    res.status(500).json({ message: "로그인 실패" });
  }
});

// 게시글 작성 API
app.post("/create", async (req, res) => {
  const { name, title, content, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO noticeboard (name, title, content, email) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, title, content, email]
    );
    res.status(201).json({ message: "게시물 작성 완료", postId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: "게시물 생성 실패", error: err });
  }
});

// 게시글 목록 조회 API
app.get("/list", async (req, res) => {
  const { myPostsOnly, currentUserEmail } = req.query;
  let query = "SELECT id, name, title, content, views, created_at FROM noticeboard";
  const params = [];
  if (myPostsOnly === "true" && currentUserEmail) {
    query += " WHERE email = $1 ";
    params.push(currentUserEmail.trim());
  }
  query += " ORDER BY views DESC";
  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "게시물 조회 실패", error: err });
  }
});

// 게시글 검색 API
app.get("/api/search", async (req, res) => {
  const { type, keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: "검색어를 입력해주세요." });
  }
  let query = "";
  const params = [`%${keyword}%`];
  if (type === "title") {
    query = `
      SELECT id, title, content, created_at, name, views
      FROM noticeboard
      WHERE title ILIKE $1
    `;
  } else if (type === "name") {
    query = `
      SELECT id, title, content, created_at, name, views
      FROM noticeboard
      WHERE name ILIKE $1
    `;
  } else {
    return res.status(400).json({ message: "유효하지 않은 검색 타입입니다." });
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "검색 중 오류가 발생했습니다.", error: err });
  }
});

// 게시물 상세 조회 API
app.get("/detail/:id", async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ message: "잘못된 게시물 ID입니다." });
  }
  const query = `
    SELECT n.*,
      (SELECT COUNT(*) FROM comments WHERE comments.postid = n.id) AS commentCount
    FROM noticeboard n
    WHERE n.id = $1
  `;
  try {
    const result = await pool.query(query, [postId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }
    res.status(200).json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "서버 오류 발생", error: err });
  }
});

// 조회수 증가 API
app.put("/detail/:id/views", async (req, res) => {
  const postId = parseInt(req.params.id);
  try {
    await pool.query("UPDATE noticeboard SET views = views + 1 WHERE id = $1", [postId]);
    res.status(200).json({ message: "조회수 증가 성공" });
  } catch (err) {
    res.status(500).json({ message: "조회수 증가 실패", error: err });
  }
});

// 게시글 삭제 API
app.delete("/detail/:id", async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const currentUserEmail = req.headers["current-user"];
  if (!currentUserEmail) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  try {
    const selectQuery = "SELECT email FROM noticeboard WHERE id = $1";
    const result = await pool.query(selectQuery, [postId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }
    const postAuthorEmail = result.rows[0].email;
    if (
      postAuthorEmail.trim().toLowerCase() !== currentUserEmail.trim().toLowerCase()
    ) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }
    // 댓글에 연결된 좋아요 기록 삭제
    await pool.query("DELETE FROM likes WHERE post_id IN (SELECT id FROM comments WHERE postid = $1)", [postId]);
    // 댓글 삭제
    await pool.query("DELETE FROM comments WHERE postid = $1", [postId]);
    // 게시글 삭제
    await pool.query("DELETE FROM noticeboard WHERE id = $1", [postId]);
    res.status(200).json({ message: "게시물 및 관련 데이터 삭제 성공" });
  } catch (err) {
    res.status(500).json({ message: "게시물 삭제 실패", error: err });
  }
});

// 게시물 수정 API
app.put("/detail/:id", async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const { title, content } = req.body;
  const currentUserEmail = req.headers["current-user"];
  if (!currentUserEmail) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  try {
    const selectQuery = "SELECT email FROM noticeboard WHERE id = $1";
    const result = await pool.query(selectQuery, [postId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }
    const postAuthorEmail = result.rows[0].email;
    if (
      postAuthorEmail.trim().toLowerCase() !== currentUserEmail.trim().toLowerCase()
    ) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }
    const updateQuery =
      "UPDATE noticeboard SET title = $1, content = $2 WHERE id = $3";
    const updateResult = await pool.query(updateQuery, [title, content, postId]);
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: "게시물이 존재하지 않습니다." });
    }
    res.status(200).json({ message: "게시물 수정 성공" });
  } catch (err) {
    res.status(500).json({ message: "게시물 수정 실패", error: err });
  }
});

// 좋아요 추가/취소 API
app.post("/api/comments/:id/likes", async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const userEmail = req.body.userId;
  if (!userEmail) {
    return res.status(400).json({ message: "사용자 정보가 없습니다." });
  }
  try {
    const checkQuery = "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2";
    const result = await pool.query(checkQuery, [userEmail, commentId]);
    if (result.rows.length > 0) {
      // 좋아요 취소
      await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [userEmail, commentId]);
      return res.status(200).json({ message: "좋아요 취소 성공" });
    } else {
      // 좋아요 추가
      await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userEmail, commentId]);
      return res.status(200).json({ message: "좋아요 추가 성공" });
    }
  } catch (err) {
    res.status(500).json({ message: "좋아요 처리 실패", error: err });
  }
});

// 좋아요 조회 API
app.get("/api/comments/:id/likes", async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const userEmail = req.query.userId;
  if (!userEmail) {
    return res.status(400).json({ message: "사용자 정보가 없습니다." });
  }
  try {
    const likeCountResult = await pool.query(
      "SELECT COUNT(*) AS likesCount FROM likes WHERE post_id = $1",
      [commentId]
    );
    const userLikeResult = await pool.query(
      "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2",
      [userEmail, commentId]
    );
    res.json({
      likesCount: parseInt(likeCountResult.rows[0].likescount, 10) || 0,
      isLiked: userLikeResult.rows.length > 0,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 좋아요 제거 API
app.delete("/api/comments/:id/likes", async (req, res) => {
  const commentId = parseInt(req.params.id, 10);
  const userId = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "사용자 정보가 없습니다." });
  }
  try {
    const deleteResult = await pool.query(
      "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, commentId]
    );
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "좋아요 기록이 없습니다." });
    }
    res.status(200).json({ message: "좋아요 취소 성공" });
  } catch (err) {
    res.status(500).json({ message: "좋아요 삭제 실패", error: err });
  }
});

// 댓글 작성 API
app.post("/comments/:postId", async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const { userEmail, content } = req.body;
  if (!userEmail || !content) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }
  try {
    const insertResult = await pool.query(
      "INSERT INTO comments (postid, userid, content) VALUES ($1, $2, $3) RETURNING id",
      [postId, userEmail, content]
    );
    const selectResult = await pool.query(
      "SELECT id, postid, userid AS username, content, createdat FROM comments WHERE id = $1",
      [insertResult.rows[0].id]
    );
    res.status(201).json(selectResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "댓글 생성 실패", error: err });
  }
});

// 댓글 조회 API
app.get("/comments/:postId", async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ message: "잘못된 게시물 ID입니다." });
  }
  try {
    const result = await pool.query(
      "SELECT id, postid, userid, content, createdat FROM comments WHERE postid = $1",
      [postId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "댓글 조회 실패", error: err });
  }
});

// 댓글 삭제 API
app.delete("/comments/:commentId", async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  const currentUserEmail = req.headers["current-user"];
  if (!currentUserEmail) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  try {
    const selectQuery = "SELECT userid FROM comments WHERE id = $1";
    const result = await pool.query(selectQuery, [commentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    }
    const commentAuthorEmail = result.rows[0].userid;
    if (
      commentAuthorEmail.trim().toLowerCase() !==
      currentUserEmail.trim().toLowerCase()
    ) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }
    // 좋아요 기록 삭제
    await pool.query("DELETE FROM likes WHERE post_id = $1", [commentId]);
    // 댓글 삭제
    const deleteResult = await pool.query(
      "DELETE FROM comments WHERE id = $1",
      [commentId]
    );
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    }
    res.status(200).json({ message: "댓글 삭제 성공" });
  } catch (err) {
    res.status(500).json({ message: "댓글 삭제 실패", error: err });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
