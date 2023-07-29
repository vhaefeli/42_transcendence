import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DirectoriesView from '../views/DirectoriesView.vue'
import ProfileView from '../views/ProfileView.vue'
import EditProfileView from '../views/EditProfileView.vue'
import AboutView from '../views/AboutView.vue'
import GameSettingsView from '../views/GameSettingsView.vue'
import GameView from '../views/GameView.vue'
import ChatView from '../views/ChatView.vue'
import DmsView from '../views/DmsView.vue'
import LoginView from '../views/LoginView.vue'
import LoginTfaView from '../views/LoginTfaView.vue'
import Login42ApiView from '../views/Login42ApiView.vue'
import SearchChannelsView from '../views/SearchChannelsView.vue'
import ChannelsView from '../views/ChannelsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/directories',
      name: 'directories',
      component: DirectoriesView
    },
    {
      path: '/user/:username',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/user/edit',
      name: 'edit profile',
      component: EditProfileView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/game-settings',
      name: 'game-settings',
      component: GameSettingsView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/dms',
      name: 'dms',
      component: DmsView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/login/tfa',
      name: '2fa',
      component: LoginTfaView,
    },
    {
      path: '/login/42api',
      name: '42api',
      component: Login42ApiView,
    },
    {
      path: '/search-channels',
      name: 'Search Channels',
      component: SearchChannelsView,
    },
    {
      path: '/channels',
      name: 'Channels',
      component: ChannelsView,
    },
  ]
})

export default router
