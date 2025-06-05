<template>
  <!--회원가입-->
  <div class="container">
    <router-link to="/" class="blogTitle">📝 BlogRoot</router-link>
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

.blogTitle {
  text-decoration: none;
  color: #2c3e50;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}

.signup-container {
  width: 380px;
  padding: 40px 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.signup-container > h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

#signup-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

#signup-form label {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

#signup-form input[type="text"],
#signup-form input[type="password"] {
  width: 100%;
  height: 42px;
  padding: 10px;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  background-color: #f8f8f8;
  font-size: 14px;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
}

#signup-form input[type="text"]:focus,
#signup-form input[type="password"]:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  outline: none;
}

.signUp-button {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  background-color: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.signUp-button:hover {
  background-color: #4338ca;
}

</style>