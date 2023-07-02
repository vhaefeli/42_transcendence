<template>
  <h1>Login page</h1>
  <div id="login-form" v-if="show_login_form">
    <input v-model="login_username" placeholder="username" /><br />
    <input v-model="login_password" placeholder="password" /><br />
    <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      @click="LogIn(true)"
    >
      create user
    </button>
    <button
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      @click="LogIn(false)"
    >
      login
    </button>
    <button
      @click="Login42Api"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      42 API Login/Registration
    </button>
  </div>
  <div id="tfa-form" v-if="show_tfa_form">
    <input v-model="tfa_code" placeholder="code" /><br />
    <button
      @click="cancel2FALogin"
      class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
    >
      cancel
    </button>
    <button
      @click="validate2FALogin"
      class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      validate
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
    <p v-if="user.tfa_enabled">2FA is enabled</p>
    <p v-if="!user.tfa_enabled">2FA is disabled</p>
    <p>Status: {{ user.status }}</p>
    <img :src="user.avatar_url" alt="avatar img" width="200" height="200" />
  </div>
  <div v-if="true">
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
import axios, { AxiosError } from "axios";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { statusService } from "@/services/status-socket.service";
import { storeToRefs } from "pinia";

const show_login_form = ref(true);
const login_username = ref("");
const login_password = ref("");
const router = useRouter();

const show_tfa_form = ref(false);
const tfa_code = ref("");

const sessionStore = useSessionStore();
const { isLoggedIn } = storeToRefs(sessionStore);
statusService;

let tfa_uuid = "";

let user = ref({
  id: 0,
  username: "",
  avatar_url: "",
  tfa_enabled: false,
  status: "OFFLINE",
});

type Payload = {
  username: string;
  password: string;
};

if (sessionStore.isLoggedIn) {
  show_login_form.value = false;
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

async function LogIn(createUser = false): Promise<boolean> {
  const payload = {
    username: login_username.value,
    password: login_password.value,
  };
  if (createUser) await CreateUser(payload);
  await axios({
    url: "/api/auth/login",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: payload,
  })
    .then((response) => {
      if (response.data.tfa_enabled) {
        show_login_form.value = false;
        show_tfa_form.value = true;
        tfa_uuid = response.data.tfa_request_uuid;
      } else {
        sessionStore.access_token = response.data.access_token;
        sessionStore.isLoggedIn = true;
        show_login_form.value = false;
        console.log("successfully logged in");
        // TODO redirect to another page (using statusService.onConnect)
        // router.push({ name: 'profile', params: { username: login_username.value } })
        LoadProfile();
      }
      return true;
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        show_login_form.value = true;
        sessionStore.isLoggedIn = false;
        if (error.response?.status == 401)
          console.log(
            `invalid credentials: ${error.response?.status} ${error.response?.statusText}`
          );
        else
          console.error(
            `unexpected error: ${error.response?.status} ${error.response?.statusText}`
          );
        return false;
      } else throw error;
    });
  return true;
}

async function LoadProfile() {
  // waits until socket is connected (or 1000ms)
  await statusService.onConnect(
    () => {
      return;
    },
    { timeout: 1000 }
  );
  if (!sessionStore.isLoggedIn) {
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
  show_login_form.value = true;
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

async function validate2FALogin() {
  if (tfa_code.value.length == 0) {
    console.log("please insert code");
    return;
  }
  await axios({
    url: "api/auth/2fa/login",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: { tfa_request_uuid: tfa_uuid, code: tfa_code.value.trim() },
  })
    .then((response) => {
      sessionStore.access_token = response.data.access_token;
      sessionStore.isLoggedIn = true;
      show_tfa_form.value = false;
      LoadProfile();
    })
    .catch((error: AxiosError) => {
    if (error.response?.status == 401) console.log(`${error.response?.statusText}: tfa verification failed`);
    else console.log(error);
    });
}

function cancel2FALogin() {
  show_tfa_form.value = false;
  show_login_form.value = true;
  tfa_uuid = "";
}
</script>
