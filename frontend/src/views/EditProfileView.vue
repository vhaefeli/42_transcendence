<template>
  <NavBar :showProfile="true"></NavBar>
  <div class="text-white profile-container">
    <section class="flex flex-col items-center">
      <p>
        {{ `2fa is ${userStore.user.tfa_enabled ? "enabled" : "disabled"}` }}
      </p>
      <p v-if="errorText.length">{{ errorText }}</p>
      <div v-if="!show_tfa_enable_disable_confirmation">
        <div id="ft-enabled-tfa" v-if="!user.tfa_enabled">
          <input
            v-model="tfa_email"
            placeholder="your email address"
            class="ft-text-input"
          /><br />
          <button @click="tfaEnable" class="ft-edit-button">enable</button>
        </div>
        <div id="ft-disable-tfa" v-if="user.tfa_enabled">
          <button @click="tfaDisable" class="ft-edit-button-red">
            disable
          </button>
        </div>
      </div>
      <div v-if="show_tfa_enable_disable_confirmation">
        <input
          v-model="tfa_code"
          placeholder="code"
          class="ft-text-input"
        /><br />
        <button @click="validate2FARegistration" class="ft-edit-button">
          validate
        </button>
        <button @click="cancelTfaEnableDisable" class="ft-edit-button-red">
          cancel
        </button>
      </div>
    </section>
  </div>
  <div id="ft-bottom-line"></div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import axios, { AxiosError } from "axios";
import { useUserStore } from "../stores/UserStore";
import { useSessionStore } from "@/stores/SessionStore";
import NavBar from "@/components/NavBar.vue";

const tfa_code = ref("");
const tfa_email = ref("");
const errorText = ref("");
const show_tfa_enable_disable_confirmation = ref(false);
let tfaRegistrationEnable = true;

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const sessionStore = useSessionStore();
const router = useRouter();

onBeforeMount(async () => {
  if (!sessionStore.isLoggedIn) logout();
  userStore.getMe(sessionStore.access_token);
});

onMounted(async () => {
  return;
});

function logout() {
  router.push("/login?logout=true");
}

async function tfaEnable() {
  if (!tfa_email.value.length) {
    console.log("email must not be empty");
    return;
  }
  await axios({
    url: "/api/auth/2fa/enable",
    method: "patch",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStore.access_token}`,
    },
    data: { email: tfa_email.value },
  })
    .then(() => {
      console.log("code has been sent");
      show_tfa_enable_disable_confirmation.value = true;
      tfaRegistrationEnable = true;
    })
    .catch((error) => {
      tfaEnableDisableHandleError(error);
    });
}

async function tfaDisable() {
  await axios({
    url: "/api/auth/2fa/disable",
    method: "patch",
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
    },
  })
    .then(() => {
      console.log("code has been sent");
      show_tfa_enable_disable_confirmation.value = true;
      tfaRegistrationEnable = false;
    })
    .catch((error) => {
      tfaEnableDisableHandleError(error);
    });
}

function tfaEnableDisableHandleError(error: AxiosError) {
  const msg: string | undefined =
    typeof error.response?.data?.message === "string"
      ? error.response?.data?.message
      : error.response?.data?.message[0];
  console.log(`${error.response?.status}: ${msg}`);
  if (error.response?.status === 401) logout();
  else if (error.response?.status === 400) {
    if (msg?.includes("email")) errorText.value = "Invalid email address";
  } else if (error.response?.status === 503)
    errorText.value = "e-mail service is unavailable";
  else if (error.response?.status === 409) {
    if (!msg?.includes("Recent")) {
      if (userStore.user.tfa_enabled)
        errorText.value = "2FA is already enabled for your account";
      else errorText.value = "2FA is already disabled for your account";
      userStore.getMe(sessionStore.access_token);
    } else {
      show_tfa_enable_disable_confirmation.value = true;
      tfaRegistrationEnable = !userStore.user.tfa_enabled;
      console.log("2fa registration request already exists");
    }
  }
}

async function validate2FARegistration() {
  if (tfa_code.value.length == 0) {
    console.log("please insert code");
    return;
  }
  await axios({
    url: `/api/auth/2fa/${
      tfaRegistrationEnable ? "enable" : "disable"
    }/confirm`,
    method: "patch",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStore.access_token}`,
    },
    data: { code: tfa_code.value.trim() },
  })
    .then(() => {
      userStore.getMe(sessionStore.access_token);
      tfa_code.value = "";
      tfa_email.value = "";
      show_tfa_enable_disable_confirmation.value = false;
    })
    .catch((error: AxiosError) => {
      tfaValidateHandleError(error);
      console.error(`${error.response?.status} ${error.response?.statusText}`);
    });
}

function tfaValidateHandleError(error: AxiosError) {
  const msg: string | undefined =
    typeof error.response?.data?.message === "string"
      ? error.response?.data?.message
      : error.response?.data?.message[0];
  console.log(`${error.response?.status}: ${msg}`);
  if (error.response?.status === 401) {
    if (msg?.includes("invalid")) errorText.value = "code is invalid";
    else logout();
  } else if (error.response?.status === 404) {
    errorText.value = "2fa registration unexistant or expired";
    userStore.getMe(sessionStore.access_token);
  } else if (error.response?.status === 400)
    errorText.value = "invalid code format";
}

function cancelTfaEnableDisable() {
  show_tfa_enable_disable_confirmation.value = false;
}
</script>

<style scoped>
/* davi stylé */
.ft-text-input {
  @apply text-white bg-gray-500;
}

.ft-edit-button {
  @apply bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded;
}

.ft-edit-button-red {
  @apply ft-edit-button;
  @apply hover:bg-red-500 text-red-700 border-red-500;
}
/* fin davi stylé */

.foreground {
  z-index: 999;
}

#ft-bottom-line {
  width: 100%;
  border-bottom: 4px solid var(--light-purple);
  position: fixed;
  bottom: 0;
  z-index: 10000;
}

.ft-profile-pic#current-profile-pic {
  position: relative;
  top: 3em;
  z-index: 1;
  background-size: cover !important;
}

.ft-central-tab-container {
  position: relative;
  top: -16em;
  left: 50vw;
  transform: translateX(-50%);
}

.ft-tab-content {
  min-width: 100%;
  /* width: 100%; */
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
}

.ft-central-tab-container.ft-tab-content {
  background: var(--light-purple);
}

.ft-connection-circle#current-profile-pic {
  position: relative;
  top: 2.5em;
  z-index: 2;
}

.ft-tab-folder {
  width: fit-content;
  border-bottom-style: solid;
  border-bottom-width: 1.5em;
  /* border-bottom: 1.5em solid var(--sunset); */
}

/* .ft-tab-folder.ft-tab-title {
  /* border-bottom: 1.5em solid var(--sunset);
  border-bottom: 1.5em solid;
} */

/* .ft-tabContent#title-profile {
  text-overflow: ellipsis;
} */

#title-profile {
  text-overflow: ellipsis;
  font-size: 2rem;
  width: 10em;
  border-bottom: 1.5em solid var(--light-purple);
}

.ft-tab-content#buttons-container {
  padding: 2em 0 12em 0;
  height: 17rem;
}

.ft-tab-separator {
  padding: 1em;
}

.ft-left-tab#stats {
  position: relative;
  top: -28rem;
  left: 10vw;
  width: 30em;

  z-index: 1;
}

.ft-right-tab#match-history {
  position: relative;
  top: -35em;
  left: 45vw;
  width: 40rem;
}

.ft-tab-border {
  /* width: 30em; */
  border-style: solid;
  border-width: 0.3em;
  padding: 1em 4em 1em 4em;
}

.ft-tab-separator {
  border-bottom-width: 0.3em;
  border-bottom-style: solid;
}

/* Piste : pour perso des barres de défilement, utiliser "PerfectScrollbar" ou "Custom Scrollbar" (JS). */
.ft-scrollable {
  max-height: 20rem;
  min-height: 12rem;
  overflow: auto;
}

.ft-left-tab#friends-requests {
  position: relative;
  top: -40em;
  left: 15vw;
  width: 39em;
  z-index: 1;
}

/* Pour DEBUG seulement, doit s-afficher ou non selon en jeu */
.ft-playing {
  display: none;
}

/* -------------------- */

.ft-left-tab#friends-list {
  position: relative;
  top: -43em;
  left: 40vw;
  width: 41em;
}
.ft-right-tab#sent-requests {
  position: relative;
  top: -45em;
  left: 49vw;
  width: 25em;
}

.ft-profile-pic.ft-friend-pic {
  width: 3em;
  height: 3em;
  position: relative;
  background: url(./../assets/img/ben-neale-zpxKdH_xNSI-unsplash.jpg);
  background-size: cover;
}

.ft-connection-circle.ft-friend-status {
  position: relative;
  top: 2.3rem;
  right: -0.8rem;
  z-index: 2;
  align-items: end;
}

.ft-left-tab#friends-search {
  position: relative;
  top: -47em;
  left: 15vw;
  width: 30em;
  z-index: 2;
}
.ft-right-tab#blocked-list {
  position: relative;
  top: -43em;
  left: 33vw;
  width: 41em;
}

.ft-tab-content.ft-tab-border#blocked {
  background: var(--dark-gray);
}

/* POUR DEBUG UNIQUEMENT */

.ft-other-profile {
  display: none;
}

/* .ft-my-profile {
  display: none;
} */

.ft-item-title {
  padding: 1.5em;
}

#profile-container {
  background: var(--gray);
  border: 4px solid var(--light-purple);
  border-radius: 25px 25px 0 0;
  overflow: hidden;
}

#matchScroll::-webkit-scrollbar,
#friendsScroll::-webkit-scrollbar,
#friendsRequestScroll::-webkit-scrollbar,
#sentRequestsScroll::-webkit-scrollbar,
#blocked::-webkit-scrollbar {
  width: 22px;
}

#matchScroll::-webkit-scrollbar-track,
#friendsRequestScroll::-webkit-scrollbar-track,
#sentRequestsScroll::-webkit-scrollbar-track,
#blocked::-webkit-scrollbar-track,
#friendsScroll::-webkit-scrollbar-track {
  background: var(--light-purple);
  border-bottom: 0.2rem solid var(--purple);
  border-right: 0.2rem solid var(--purple);
  border-top: 0.2rem solid var(--mint);
  border-left: 0.2rem solid var(--mint);
}

#matchScroll::-webkit-scrollbar-thumb {
  background-color: var(--mint);
  border-bottom: 0.2rem solid var(--dark-gray);
  border-right: 0.2rem solid var(--dark-gray);
  border-top: 0.2rem solid var(--light);
  border-left: 0.2rem solid var(--light);
}

#friendsScroll::-webkit-scrollbar-thumb,
#friendsRequestScroll::-webkit-scrollbar-thumb,
#sentRequestsScroll::-webkit-scrollbar-thumb,
#blocked::-webkit-scrollbar-thumb {
  background-color: var(--purple);
  border-bottom: 0.2rem solid var(--dark-gray);
  border-right: 0.2rem solid var(--dark-gray);
  border-top: 0.2rem solid var(--light);
  border-left: 0.2rem solid var(--light);
}

/* ^^ POUR DEBUG UNIQUEMENT ^^ */
</style>
