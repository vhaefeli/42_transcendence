<template>
  <NavBar :showProfile="false"></NavBar>
  <div class="text-white">
    <h1>Login page</h1>
    <div id="login-form" v-if="show_login_form">
      <input
        v-model="login_username"
        placeholder="username"
        class="bg-gray-500"
      /><br />
      <input
        type="password"
        v-model="login_password"
        placeholder="password"
        class="bg-gray-500"
      /><br />
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
    <router-link v-if="isLoggedIn" :to="'/login?logout=true'"
      >Logout</router-link
    >
  </div>
</template>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { ref, watch } from "vue";
import axios, { AxiosError } from "axios";
import { useRoute, useRouter, type LocationQuery } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { statusService } from "@/services/status-socket.service";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/UserStore";

const show_login_form = ref(true);
const login_username = ref("");
const login_password = ref("");
const router = useRouter();
const route = useRoute();

const sessionStore = useSessionStore();
const { isLoggedIn } = storeToRefs(sessionStore);
const userStore = useUserStore();
statusService;

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

handleQueryParams(route?.query);
watch(
  () => route?.query,
  (params) => {
    handleQueryParams(params);
  }
);

function handleQueryParams(params: LocationQuery) {
  if (params?.logout?.toString() === "true") {
    if (sessionStore.isLoggedIn) sessionStore.logout();
    show_login_form.value = true;
    router.push("/login");
  }
}

if (sessionStore.isLoggedIn) {
  show_login_form.value = false;
  // TODO: uncomment next line
  //userStore.redirectToMyProfile(sessionStore.access_token, router);
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
  login_password.value = "";
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
        router.push(
          `/login/tfa?tfa_request_uuid=${response.data.tfa_request_uuid}`
        );
      } else {
        sessionStore.access_token = response.data.access_token;
        sessionStore.isLoggedIn = true;
        show_login_form.value = false;
        console.log("successfully logged in");
        userStore.redirectToMyProfile(sessionStore.access_token, router);
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
