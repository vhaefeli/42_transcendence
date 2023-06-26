<template>
  <h1>Login page</h1>
  <div id="login-form" v-if="!isLoggedIn">
    <input v-model="login_username" placeholder="username" /><br />
    <input v-model="login_password" placeholder="password" /><br />
    <p>Create new user?</p>
    <input type="checkbox" id="checkbox" v-model="createUser" /><br />
    <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      @click="LogIn"
    >
      create/login
    </button>
  </div>
  <button v-if="isLoggedIn" @click="LogOut">Logout</button>
  <div v-if="isLoggedIn">
    <button @click="LoadProfile">reload</button><br />
    <router-link :to="'/user/' + user.username">see my profile</router-link>
    <br />
    <p>Your Profile:</p>
    <br />
    <p>username {{ user.username }}<br />id {{ user.id }}</p>
    <p v-if="user.twoFA_enabled">2FA is enabled</p>
    <p v-if="!user.twoFA_enabled">2FA is disabled</p>
    <p>Status: {{ user.status }}</p>
    <img :src="user.avatar_url" alt="avatar img" width="200" height="200" />
  </div>
  <div v-if="true">
    <button
      @click="Login42Api"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      42 API Login/Registration
    </button>
    <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      @click="statusService.ping()"
    >
      ping socket
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { statusService } from "@/services/status-socket.service";

const isLoggedIn = ref(false);
const login_username = ref("");
const login_password = ref("");
const createUser = ref(false);
const router = useRouter();

const sessionStore = useSessionStore();
statusService;

let user = ref({
  id: 0,
  username: "",
  avatar_url: "",
  twoFA_enabled: false,
  status: "OFFLINE",
});

type Payload = {
  username: string;
  password: string;
};

if (sessionStore.isLoggedIn) {
  isLoggedIn.value = true;
  LoadProfile();
}

async function CreateUser(payload: Payload): Promise<boolean> {
  if (!payload.username.length || !payload.username.length) {
    console.log("Credentials are missing");
    return false;
  }

  await axios({
    url: "/api/user/new",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: payload,
  })
    .then((response) => {
      // To execute when the request is successful
      console.log(`${response.status} + ${response.statusText}`);
      return true;
    })
    .catch((error) => {
      // To execute when the request fails
      if (error.response.status == 409)
        console.log(
          `user already exists: ${error.response.status} ${error.response.statusText}`
        );
      else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      return false;
    });

  //To execute whether the request succeeds or fails
  return true;
}

async function LogIn(): Promise<boolean> {
  const payload = {
    username: login_username.value,
    password: login_password.value,
  };
  if (createUser.value) await CreateUser(payload);
  await axios({
    url: "/api/auth/login",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: payload,
  })
    .then((response) => {
      sessionStore.access_token = response.data.access_token;
      sessionStore.isLoggedIn = true;
      isLoggedIn.value = true;
      console.log("successfully logged in");
      // router.push({ name: 'profile', params: { username: login_username.value } })
      LoadProfile();
      return true;
    })
    .catch((error) => {
      isLoggedIn.value = false;
      sessionStore.isLoggedIn = false;
      if (error.response.status == 401)
        console.log(
          `invalid credentials: ${error.response.status} ${error.response.statusText}`
        );
      else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      return false;
    });
  return true;
}

async function LoadProfile() {
  if (!isLoggedIn.value) {
    console.log("user is not logged in");
    return;
  }

  await axios({
    url: "/api/user/me",
    method: "get",
    headers: { Authorization: `Bearer ${sessionStore.access_token}` },
  })
    .then((response) => {
      user.value = response.data;
      console.log("loaded profile");
      console.log(user.value);
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.log(
          `invalid access token: ${error.response.status} ${error.response.statusText}`
        );
        LogOut();
      } else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}

function LogOut() {
  isLoggedIn.value = false;
  sessionStore.logout();
}

function Login42Api() {
  const client_id = import.meta.env.VITE_API42_CLIENT_ID;
  const redirect_uri = import.meta.env.VITE_API42_REDIRECT_URI;
  console.log(`${client_id} ${redirect_uri}`);
  window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${encodeURIComponent(
    client_id
  )}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&state=${sessionStore.getUUID()}`;
}
</script>
