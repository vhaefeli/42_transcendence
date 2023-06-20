<!--
  Ce code est horrible degueulasse et je n'ai aucune idee de ce que je fais
  SVP deleter ce fichier aussi tot que possible
-->

<template>
  <h1>Login page</h1>
  <button v-if="isLogged" @click="logout">Logout</button>
  <div id="login-form" v-if="!isLogged">
    <input v-model="username" placeholder="username" /><br />
    <input v-model="password" placeholder="password" /><br />
    <p>Create new user?</p>
    <input type="checkbox" id="checkbox" v-model="new_user" /><br />
    <button class="t-btn-pink" @click="loginUser">create/login</button>
  </div>
  <div v-if="isLogged">
    <button @click="loadMyProfile">reload</button>
    <br />
    <p>Your Profile:</p>
    <br />
    <p>username {{ logged_username }}<br />id {{ logged_id }}</p>
    <img :src="avatar_url" alt="avatar img" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useLoginStore } from "@/stores/LoginStore";

const isLogged = ref(false);
const username = ref("");
const password = ref("");
const new_user = ref(false);
const avatar_url = ref("");
const logged_id = ref(0);
const logged_username = ref("");

let loginStore = useLoginStore();

let access_token;
let user_profile = {
  id: 1,
  username: "placeholder",
  avatar_url: "error",
  is_friend: false,
};

async function loginUser() {
  isLogged.value = await loginStore.LogIn(
    { username: username.value, password: password.value },
    new_user.value
  );
  await loginStore.LoadProfile();
  return;

  /*
  if (!username.value.length || !password.value.length) {
    console.log("error, one of the required credentials is empty");
    return 1;
  }
  const payload = { username: username.value, password: password.value };
  let response;

  if (new_user.value) {
    try {
      response = await axios.post("/api/user/new", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 201) console.log("successfully created new user");
    } catch (e) {
      if (e.response.status == 409) console.log("user already exists");
      else console.log("other error " + e.response.status + " " + e.code);
    }
  }

  console.log("attempting to login");
  try {
    response = await axios.post("/api/auth/login", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    access_token = response.data.access_token;
    console.log("successfully logged in");

    isLogged.value = true;
    loadMyProfile();
    return 0;
  } catch (e) {
    if (e.response.status == 401) console.log("login failed");
    else console.log("other error " + e.response.status + " " + e.code);
    return 0;
  }
  */
}

async function loadMyProfile() {
  user_profile = await getProfile();
  avatar_url.value = user_profile.avatar_url;
  logged_id.value = user_profile.id;
  logged_username.value = user_profile.username;
}

async function getProfile(user = null) {
  if (!user) user = username.value;
  try {
    return (
      await axios.get(`api/user/profile/${user}`, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      })
    ).data;
  } catch (e) {
    console.log(e.response.status + " " + e.code);
  }
}

function logout() {
  access_token = null;
  isLogged.value = false;
}
</script>
