import { createRouter, createWebHistory } from 'vue-router';  // Vue 3에서 사용하는 방식
import MainPage from '@/components/MainPage.vue';
import UserLogin from '@/components/UserLogin.vue';
import SignUp from '@/components/SignUp.vue';
import CreatePost from '@/components/CreatePost.vue';
import EditPost from '@/components/EditPost.vue';
import PostList from '@/components/PostList.vue';
import PostDetail from '@/components/PostDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainPage
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp
  },
  {
    path:'/create',
    name: 'CreatePost',
    component: CreatePost
  },
  {
    path:'/edit/:id',
    name: 'EditPost',
    component: EditPost,
    props: true
  },
  {
    path:'/list',
    name: 'PostList',
    component: PostList
  },
  {
    path: '/detail/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),  // Vue 3에서 사용하는 방식
  routes
});

export default router;
