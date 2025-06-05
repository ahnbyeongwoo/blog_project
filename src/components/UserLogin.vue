<template><!--로그인-->
  <div class="container">
    <h1>
      <router-link to="/" class="blog-title">📝 BlogRoot</router-link>
    </h1>
    <div class="login-container"><!-- 로그인 폼 컨테이너 -->
      <h2>Login</h2>
      <form @submit.prevent="login" id="login-form">
        <label for="userId">아이디</label><!-- 아이디 입력 필드 -->
        <input type="text" name="userId" v-model="email" placeholder="아이디를 입력하세요.">
        <label for="userPassword">비밀번호</label>
        <input type="password" name="userPassword" v-model="password" placeholder="비밀번호를 입력하세요.">

        <div class="button-group"><!-- 버튼 그룹으로 로그인과 회원가입 버튼 생성 -->
          <button type="submit" class="submit-button">Login</button>
          <button type="button" class="signup-button" @click="goToSignUp">회원가입</button>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'UserLogin',
  data() {
    return {
      email: '',
      password: '',
    };
  },

  methods: {// 로그인 버튼 클릭 시 실행되는 메서드
    goToSignUp() {
      this.$router.push('/signup');
    },
    login() {// 로그인 요청
      const loginData = {
        email: this.email,
        password: this.password,
      };

      axios.post(`${process.env.VUE_APP_API_URL}/login`, loginData)
        .then(response => {
          alert(response.data.message);
          if (response.data.user) {// 로그인 성공 시 사용자 정보 저장
            console.log('로그인된 사용자:', response.data.user);
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));// 로컬 스토리지에 사용자 정보 저장
            window.dispatchEvent(new Event('storage'));
            this.$router.push('/');
          }
        })
        .catch(error => {
          console.error('로그인 오류:', error);
          alert('로그인 실패! 아이디와 비밀번호를 확인하세요.');
        });
    }
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

.login-container {
  width: 360px;
  padding: 30px;
  margin-top: 30px;
  background-color: #aba6a6;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  ;
}

.login-container > h2 {/* 로그인 폼 제목 스타일 */
  font-size: 20px;
  color: black;
  margin-bottom: 20px;
}

#login-form {
  display: flex;
  flex-direction: column;
}

#login-form label {/* 라벨 스타일 */
  font-size: 14px;
  color: #000;
  margin-bottom: 8px;
  text-align: left;
}

#login-form input[type="text"],/* 입력 필드 스타일 */
#login-form input[type="password"] {
  width: 100%;
  height: 40px;
  padding: 8px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #F8F8F8;
  border: 1px solid #ccc;
}

#login-form input[type="text"]::placeholder,
#login-form input[type="password"]::placeholder {
  color: #b0b0b0;
}

#login-form > .button-group {/* 버튼 그룹 스타일 */
  display: flex;
  justify-content: space-between;
}

#login-form > input[type="submit"] {
  width: 48%;
  padding: 10px;
  color: black;
  font-size: 14px;
  background-color: #f8f8f8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#login-form input[type="submit"]:hover {
  background-color: #f8f8f8;
}

/* 로그인, 회원가입 버튼  */
.submit-button,
.signup-button {
  width: 35%;
  padding: 10px;
  font-size: 14px;
  color: #333;
  background-color: #f8f8f8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}


.submit-button:hover,
.signup-button:hover {
  background-color: #5a6268;
}

.blog-title {/* 블로그 제목 스타일 */
  text-decoration: none;
  color: #000;
  font-size: 32px;
}
</style>