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
  background: linear-gradient(135deg, #f3f4f6, #dbeafe);
  font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blog-title {
  text-decoration: none;
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
}

.login-container {
  width: 380px;
  padding: 40px 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-container > h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

#login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

#login-form label {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

#login-form input[type="text"],
#login-form input[type="password"] {
  height: 42px;
  padding: 10px;
  border-radius: 6px;
  border: 1.5px solid #ccc;
  transition: border 0.3s, box-shadow 0.3s;
}

#login-form input[type="text"]:focus,
#login-form input[type="password"]:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  outline: none;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.submit-button,
.signup-button {
  width: 48%;
  padding: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background-color: #4f46e5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover,
.signup-button:hover {
  background-color: #4338ca;
}

</style>