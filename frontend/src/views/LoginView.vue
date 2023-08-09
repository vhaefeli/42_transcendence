<template>
  <div class=text-white id="login">
    <span id="arcadeName">TRANSCENDENCE</span>
    <input
      v-model="login_username"
      placeholder="username"
      id = username
    />
    <input
      type="password"
      v-model="login_password"
      placeholder="password"
      id =password
    />
    <img class="object-fit h-full w-auto" id="fullArcade" src="../assets/img/arcade1.png" alt="arcade">
    <video id="game" src="../assets/img/pong.mp4" autoplay loop muted></video>
    <img id="coin" src="../assets/img/login.png" alt="coin start" @click="LogIn(false)">
    <img id="create" src="../assets/img/create.png" alt="create buttin" @click="LogIn(true)">
    <img id="log"
      :src="isMouseOver ? imageOnMouseOver : imageDefault"
      alt="Image"
      @mouseover="handleMouseOver"
      @mouseleave="handleMouseLeave"
      @click="Login42Api"
    />
    <img id="front" src="../assets/img/front.png" alt="front">
    <span class="blinking-text" id="loginCoin">insert coin to log in</span>
    </div>
</template>

<script setup lang="ts">
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

type Payload = {
  username: string;
  password: string;
};

const isMouseOver = ref(false);
const imageDefault = "src/assets/img/42login1.png";
const imageOnMouseOver = "src/assets/img/42login2.png";

const handleMouseOver = () => {
  isMouseOver.value = true;
};

const handleMouseLeave = () => {
  isMouseOver.value = false;
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
    userStore.flush()
    show_login_form.value = true;
    router.push("/login");
  }
}

if (sessionStore.isLoggedIn) {
  show_login_form.value = false;
  // TODO: uncomment next line
  // router.push("/directories");
}

async function CreateUser(payload: Payload) {
  if (!payload.username.length || !payload.username.length) {
    console.log("Credentials are missing");
  }

  await axios({
    url: "/api/user/new",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: payload,
  })
    .then(() => {
      console.debug("Created new user");
    })
    .catch((error: AxiosError) => {
      if (error.response?.status == 409)
        console.debug(
          `${error.response.status} ${error.response.statusText}: Username is already in use`
        );
      else if (error.response?.status == 400) {
        const message: string = error.response?.data?.message[0];
        console.debug(
          `${error.response.status} ${error.response.statusText}: ${message}`
        );
        console.error(
          `INVALID ${message.includes("username") ? "USERNAME" : "PASSWORD"}`
        );
      } else
        console.debug(
          `${error.response?.status} ${error.response?.statusText}: Unexpected error`
        );
    });
}

async function LogIn(createUser = false) {
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
        console.debug("Successfully logged in");
        router.push("/directories");
      }
    })
    .catch((error: AxiosError) => {
      if (error.response?.status == 401)
        console.debug(
          `${error.response.status} ${error.response.statusText}: Invalid credentials, try again`
        );
      else if (error.response?.status == 503)
        console.debug(
          `${error.response.status} ${error.response.statusText}: Couldn't connect to mail server in order to send 2fa code`
        );
      else if (error.response?.status == 400) {
        const message: string = error.response?.data?.message[0];
        console.debug(
          `${error.response.status} ${error.response.statusText}: ${message}`
        );
        console.error(
          `INVALID ${message.includes("username") ? "USERNAME" : "PASSWORD"}`
        );
      } else
        console.debug(
          `${error.response?.status} ${error.response?.statusText}: Unexpected error`
        );
    });
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

<style scoped>

#login {
  position: relative;
}

#arcadeName {
  position: absolute;
  top: 0;
  font-family: "Array-Regular";
  font-size: 13vh;
  left: 50%;
  transform: translateX(-53%);
  z-index: 10;
}

#fullArcade{
  position: absolute;
  top: 0;
  height: 100vh;
  width: auto;
  object-fit: cover;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
}

#game{
  height: 33.5vh;
  position: absolute;
  top: 39vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

#username{
  position: absolute;
  top: 53vh;
  left: 50%;
  transform: translateX(-110%);
  z-index: 30;
  height: 50px;
  width: 200px;
  font-size: 20px;
  background-color: rgba(128, 128, 128, 0.54);
}

#password{
  position: absolute;
  top: 53vh;
  left: 50%;
  transform: translateX(+10%);
  z-index: 30; 
  height: 50px;
  width: 200px;
  font-size: 20px;
  background-color: rgba(128, 128, 128, 0.54);
}


#front{
  position: absolute;
  top: 85vh;
  height: 15vh;
  width: auto;
  object-fit: cover;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;

}

#coin{
  height: 15vh;
  position: absolute;
  transition: 0.2s;
  top: 73vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

#coin:hover{
  height: 15vh;
  position: absolute;
  transition: 0.2s;
  top: 75vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

#create{
  height: 9vh;
  position: absolute;
  transition: 0.2s;
  top: 79vh;
  left: 50%;
  transform: translateX(20vh);
  z-index: 20; 
}

#create:hover{
  height: 9vh;
  position: absolute;
  transition: 0.2s;
  top: 80vh;
  left: 50%;
  transform: translateX(20vh);
  z-index: 20; 
}

#log{
  height: 18vh;
  position: absolute;
  transition: 0.2s;
  top: 69vh;
  left: 50%;
  transform: translateX(-36vh);
  z-index: 20;
}


#insert{
  width: 12vw;
  position: absolute;
  font-size: 2vw;
  top: 25vw;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

#loginCoin {
  color: white;
  width: 100%;
  text-align: center;
  position: absolute;
  font-family: "Array-Regular";
  font-size: 5vh;
  top: 60vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}
.blinking-text {
  animation: blink-animation 1.5s infinite;
}

@keyframes blink-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

</style>