import { createApp } from 'vue'
import App from './App.vue'
//import Vue from 'vue';
import router from './router';

//Vue.config.productionTip=false;

// new Vue({
//   router,
//   render: h=> h(App)
// }).$mount('#app');

// createApp(App).mount('#app')


const app = createApp(App);       // Vue 앱 생성
app.use(router);                  // 라우터 사용
app.mount('#app');