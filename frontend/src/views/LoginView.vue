<template>
  <h1>Login page</h1>
  <div id="login-form" v-if="!isLoggedIn">
    <input v-model="username" placeholder="username" /><br />
    <input v-model="password" placeholder="password" /><br />
    <p>Create new user?</p>
    <input type="checkbox" id="checkbox" v-model="new_user" /><br />
    <button class="t-btn-pink" @click="loginUser">create/login</button>
  </div>
  <button v-if="isLoggedIn" @click="loginStore.LogOut">Logout</button>
  <div v-if="isLoggedIn">
    <button @click="loginStore.LoadProfile">reload</button>
    <br />
    <p>Your Profile:</p>
    <br />
    <p>username {{ user.username }}<br />id {{ user.id }}</p>
    <img :src="user.avatar_url" alt="avatar img" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import { storeToRefs } from "pinia";

const username = ref("");
const password = ref("");
const new_user = ref(false);

const loginStore = useLoginStore();
const { isLoggedIn, user } = storeToRefs(loginStore);

async function loginUser() {
  await loginStore.LogIn(
    { username: username.value, password: password.value },
    new_user.value
  );
  return;
}
</script>
