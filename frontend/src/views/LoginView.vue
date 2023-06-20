<template>
  <h1>Login page</h1>
  <div id="login-form" v-if="!isLoggedIn">
    <input v-model="username" placeholder="username" /><br />
    <input v-model="password" placeholder="password" /><br />
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
    <button @click="LoadProfile">reload</button>
    <br />
    <p>Your Profile:</p>
    <br />
    <p>username {{ user.username }}<br />id {{ user.id }}</p>
    <img :src="user.avatar_url" alt="avatar img" />
  </div>
  <div v-if="true">
    <button
      @click="Test42Api"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      Test 42 API
    </button>
    <p>{{ code42API }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import process from "process";

const isLoggedIn = ref(false);

const username = ref("");
const password = ref("");
const createUser = ref(false);

const user = ref({
  id: 0,
  username: "",
  access_token: "",
  avatar_url: "",
});

type Payload = {
  username: string;
  password: string;
};

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
  const payload = { username: username.value, password: password.value };
  if (createUser.value) await CreateUser(payload);
  await axios({
    url: "/api/auth/login",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: payload,
  })
    .then((response) => {
      user.value.username = payload.username;
      user.value.access_token = response.data.access_token;
      isLoggedIn.value = true;
      console.log("successfully logged in");
      LoadProfile();
      return true;
    })
    .catch((error) => {
      isLoggedIn.value = false;
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
    url: `/api/user/profile/${user.value.username}`,
    method: "get",
    headers: { Authorization: `Bearer ${user.value.access_token}` },
  })
    .then((response) => {
      user.value.id = response.data.id;
      user.value.username = response.data.username;
      user.value.avatar_url = response.data.avatar_url;
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
  user.value = { id: 0, username: "", access_token: "", avatar_url: "" };
  isLoggedIn.value = false;
}

let code42API = "";

function Test42Api() {
  const client_id = import.meta.env.VITE_API42_CLIENT_ID;
  const redirect_uri = import.meta.env.VITE_API42_REDIRECT_URI;
  console.log(`${client_id} ${redirect_uri}`);
  window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${encodeURIComponent(
    client_id
  )}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code`;
}

getURLCode();

function getURLCode() {
  const code = useRoute().query.code;
  if (code) code42API = `API code: ${code}`;
}
</script>
