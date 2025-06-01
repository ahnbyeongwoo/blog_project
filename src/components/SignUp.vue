<template>
  <!--회원가입-->
  <div class="container">
    <router-link to="/" class="blogTitle">BlogProject</router-link>
    <div class="signup-container">
      <h2>회원가입</h2>
      <form @submit.prevent="submitForm" id="signup-form">
        <div>
          <label for="name">닉네임</label>
          <input type="text" id="name" v-model="name" placeholder="사용하실 닉네임을 입력하세요." />
        </div>
        <div>
          <label for="email">이메일</label>
          <input type="text" id="email" v-model="email" placeholder="사용하실 이메일을 입력하세요." />
        </div>
        <div>
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" placeholder="사용하실 비밀번호를 입력하세요." />
        </div>
        <div>
          <label for="passwordConfirm">비밀번호 확인</label>
          <input type="password" id="passwordConfirm" v-model="passwordConfirm" placeholder="비밀번호를 한번 더 입력하세요." />
        </div>
        <button type="submit" class="signUp-button">회원가입</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SignUp',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    };
  },
  methods: {
    submitForm() {
      if (this.password !== this.passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
        return;
      }
      // email, name, password 순서로 데이터 전송
      const userData = {
        email: this.email,
        name: this.name,
        password: this.password,
      };

      axios.post(`${process.env.VUE_APP_API_URL}/signup`, userData)
        .then((response) => {
          alert(response.data.message);
          this.$router.push('/');
        })
        .catch((error) => {
          console.error('회원가입 오류:', error);
          alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        });
    },
  }
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  background-color: #f3f3f3;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

}

.h1 {
  font-size: 32px;
  color: #333;
  margin-top: 20px;
  margin-bottom: 20px;
}

.blogTitle {
  text-decoration: none;
  color: #000;
  font-size: 32px;
  font-weight: bold;
}

.signup-container {/* 회원가입 폼 컨테이너 스타일 */
  width: 360px;
  padding: 30px;
  margin-top: 30px;
  background-color: #aba6a6;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  ;
}

.signup-container > h2 {/* 회원가입 제목 */
  font-size: 20px;
  color: black;
  margin-bottom: 20px;
}

#signup-form {
  display: flex;
  flex-direction: column;
}

#signup-form label {
  font-size: 14px;
  color: #000;
  margin-bottom: 8px;
  text-align: left;
}

/* 텍스트 및 비밀번호 입력 필드 스타일 */
#signup-form input[type="text"],
#signup-form input[type="password"] {
  width: 100%;
  height: 40px;
  padding: 8px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #F8F8F8;
  border: 1px solid #ccc;
}

.signUp-button {
  widows: 100px;
  margin: 0 auto;
  padding: 10px;
  font-size: 14px;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: block;
}

.signUp-button:hover {
  background-color: #5a6268;
}
</style>