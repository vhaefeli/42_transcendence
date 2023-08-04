<template>
  <NavBar :showProfile="true" :userStore="userStore"/>
  <div id="profile-container">
    <section class="ft-cover flex flex-col items-end justify-end">
    </section>

    <section class="ft-container">

    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
      <div class="ft-profile-pic" id="current-profile-pic" :style="{ 'background': 'url(' + user.avatar_url + ')' }"></div>
      <div class="ft-connection-circle" id="current-profile-pic"></div>
      <div class="ft-tab-folder" id="title-profile"></div>
      <div class="ft-tab-content ft-bg-color-profile">&nbsp;</div>
      <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">{{ user.username }}</div>
      <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
        <a id="back-to-profile" class="t-btn-pink ft-bg-color-profile" title="Back to my profile" @click="userStore.redirectToMyProfile(sessionStore.access_token)">
          <button>Go back</button>
        </a>
      </div>
    </div>


    <!-- DOSSIER GAUCHE 2fa-->
    <div class="flex flex-col text-center ft-left-tab" id="two-fa" :class="{ foreground: foregroundTab === 'two-fa' }" @click="setForegroundTab('two-fa')">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Two factor authentication</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border flex flex-col justify-evenly text-left">
        <p v-if="errorText.length">{{ errorText }}</p>
        <p>
          {{ `The two factor authentication is ${userStore.user.tfa_enabled ? "enabled." : "disabled."}` }}
        </p>
        <div v-if="!show_tfa_enable_disable_confirmation">
          <div id="ft-enabled-tfa" v-if="!user.tfa_enabled">
            <p class="ft-smaller-txt">
              Enter your e-mail address to enable it:
            </p>
            <input
              v-model="tfa_email"
              placeholder="your e-mail address"
              class="p-1 mr-3 w-full"
            />
            <a @click="tfaEnable" class="t-btn-pink ft-enable">
              <button>Enable</button>
            </a>
          </div>
          <div id="ft-disable-tfa" v-if="user.tfa_enabled">
            <a @click="tfaDisable" class="t-btn-pink ft-disable">
              <button>Disable</button>
            </a>
          </div>
        </div>
        <div v-if="show_tfa_enable_disable_confirmation">
          <input
            v-model="tfa_code"
            placeholder="code"
            class="p-1 mr-3 w-full"
          />
          <p class="ft-smaller-txt">
            A code has been sent to your e-mail address. Go check it out.
          </p>
          <a @click="validate2FARegistration" class="t-btn-pink ft-enable">
            <button>Validate</button>
          </a>
          <a @click="cancelTfaEnableDisable" class="t-btn-pink ft-disable">
            <button>Cancel</button>
          </a>
        </div>
      </div>
    </div>

    <!-- ICI dossier droite meme niveau que 2fa : changement de username -->
    <div class="flex flex-col text-center ft-right-tab" id="username-change" :class="{ foreground: foregroundTab === 'username-change' }" @click="setForegroundTab('username-change')">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Change your username</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border flex flex-col justify-evenly text-left">
        <div class="ft-text" id="ft-edit-username">
          <div v-if="!usernameChanged">
            <p>Modify your username:</p>
            <input
              class="p-1 mr-3 w-full"
              v-model="username"
              placeholder="new username"
            />
            <div
              :class="{ 'cursor-not-allowed': username.length == 0 }"
              class="w-fit"
            >
            <a class="t-btn-pink ft-enable" @click="submitNewUsername" :class="{ 'opacity-50 ft-disabled-btn ft-noClick': username.length == 0 }">
              <button>Submit</button>
            </a>
            </div>
          </div>
          <div v-if="usernameChanged">
            <p>Username successfully changed, please login again</p>
            <a class="t-btn-pink ft-bg-profile" @click="logout"><button >Go to Login</button></a>
          </div>
        </div>
      </div>
    </div>

    <!-- dossier gauche central pour avatar change -->
    <div class="flex flex-col text-center ft-left-tab" id="avatar-change" :class="{ foreground: foregroundTab === 'avatar-change' }" @click="setForegroundTab('avatar-change')">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">The drop zone</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border flex flex-col justify-evenly text-left">
        <p class="ft-text">Upload a new avatar for your profile</p>
        <div
          class="drop-area w-2/3"
          :data-active="active"
          @dragenter.prevent="setActive"
          @dragover.prevent="setActive"
          @dragleave.prevent="setInactive"
          @drop.prevent="onDrop"
        >
          <div class="ft-border-color-profile ft-the-drop-zone flex flex-row">
            Drop your beautiful image here
          </div>

          <label class="ft-text" for="file-input">or select a file: </label>
          <input
            type="file"
            id="selectedFile"
            style="display: none"
            name="file-input"
            v-on:change="fileInputOnChange"
          />
          <a class="t-btn-pink ft-bg-profile">
            <input
              type="button"
              value="Browse..."
              onclick="document.getElementById('selectedFile').click();"
            />
          </a>
          <p v-if="selectedAvatar == undefined">no image selected</p>
          <p v-if="selectedAvatar" class="truncate">{{ selectedAvatar.name }}</p>
          <slot :dropZoneActive="active"></slot>
          <div
            :class="{ 'cursor-not-allowed': selectedAvatar == undefined }"
            class="w-fit"
          >
          <a class="t-btn-pink ft-bg-profile" @click="uploadNewAvatar" :class="{ 'opacity-50 ft-disabled-btn ft-noClick': selectedAvatar == undefined }">
            <button>Upload</button>
          </a>
          </div>
        </div>


      </div>
    </div>

    </section>
  </div>

  <div id="ft-bottom-line"></div>

</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import axios, { AxiosError } from "axios";
import { useUserStore } from "../stores/UserStore";
import { useSessionStore } from "@/stores/SessionStore";
import NavBar from "@/components/NavBar.vue";

const errorText = ref("");

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

// Enable or Disable 2FA ******************************************************
const tfa_code = ref("");
const tfa_email = ref("");
const show_tfa_enable_disable_confirmation = ref(false);
let tfaRegistrationEnable = true;

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

// Upload new avatar **********************************************************
// drag and drop reference:
// https://www.smashingmagazine.com/2022/03/drag-drop-file-uploader-vuejs-3/
const active = ref(false);
let inActiveTimeout: any = null;
const selectedAvatar = ref<File | null>();
let avatarInfo: ServerAvatarInfo;

type ServerAvatarInfo = {
  max_size: number;
  file_types: Array<string>;
};

async function uploadNewAvatar() {
  const formData = new FormData();
  formData.append("avatar", selectedAvatar.value);
  await axios({
    url: "/api/user/avatar/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${sessionStore.access_token}`,
    },
  })
    .then(() => {
      console.log("success");
      userStore.getMe(sessionStore.access_token);
    })
    .catch((error: AxiosError) => {
      const msg: string | undefined =
        typeof error.response?.data?.message === "string"
          ? error.response?.data?.message
          : error.response?.data?.message[0];
      console.log(`${error.response?.status}: ${msg}`);
      if (error.response?.status === 400) errorText.value = msg;
    });
}

function selectNewAvatar(file: File | null) {
  if (file == null) return;
  if (!avatarInfo.file_types.includes(file.type)) {
    errorText.value = `filetype ${file.type} is not accepted`;
    return;
  }
  if (file.size > avatarInfo.max_size) {
    errorText.value = `file is too big, max size: ${avatarInfo.max_size}b`;
    return;
  }
  errorText.value = "";
  selectedAvatar.value = file;
}

function fileInputOnChange(e) {
  selectNewAvatar(document.getElementById("selectedFile").files[0]);
}

function setActive() {
  active.value = true;
  clearTimeout(inActiveTimeout);
}
function setInactive() {
  inActiveTimeout = setTimeout(() => {
    active.value = false;
  }, 50);
}

function onDrop(e) {
  setInactive();
  selectNewAvatar(e.dataTransfer.files[0]);
}

function preventDefaults(e) {
  e.preventDefault();
}

const events = ["dragenter", "dragover", "dragleave", "drop"];

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
  axios({
    url: "/api/user/avatar/info",
    method: "get",
  }).then((response) => {
    avatarInfo = response.data;
  });
});

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});

// Modify your username *******************************************************
const username = ref<string>("");
const usernameChanged = ref(false);

function submitNewUsername() {
  if (username.value.length === 0) return;
  axios({
    url: "/api/user/update-username",
    method: "post",
    data: { new_username: username.value },
    headers: {
      Authorization: `Bearer ${sessionStore.access_token}`,
      "Content-Type": "application/json",
    },
  })
    .then(() => {
      usernameChanged.value = true;
    })
    .catch((error) => {
      const msg: string | undefined =
        typeof error.response?.data?.message === "string"
          ? error.response?.data?.message
          : error.response?.data?.message[0];
      console.log(`${error.response?.status}: ${msg}`);
      if (error.response?.status === 400) errorText.value = msg;
      else if (error.response?.status === 409)
        errorText.value = "username is already in use";
      else if (error.response?.status === 401) logout();
    });
}
</script>

<style scoped>
/* davi stylé */
.ft-text-input {
  @apply text-white bg-gray-500;
}

/* .ft-edit-button {
  @apply bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded;
} */

.ft-edit-button {
  @apply bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded;
}

.ft-edit-button-red {
  @apply ft-edit-button;
  @apply hover:bg-red-500 text-red-700 border-red-500;
}

.ft-browse-button {
  @apply ft-edit-button;
  @apply text-gray-400 hover:bg-gray-800 py-1 px-2 border-gray-800 bg-gray-800 hover:cursor-pointer;
}
.ft-noClick {
  pointer-events: none;
}

.drop-area {
  width: 100%;
  max-width: 800px;
  /* margin: 0 auto;
  padding: 50px;
  background: #ffffff55;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: 0.2s ease; */

  &[data-active="true"] {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background: #ffffffcc;
  }
}
/* fin davi stylé */

#ft-bottom-line {
  width: 100%;
  border-bottom: 4px solid var(--light-purple);
  position: fixed;
  bottom: 0;
  z-index: 10000;
}

/* MyProfilePage.vue */
.foreground {
  z-index: 999;
}

.ft-cover {
    background: url(./../assets/img/fond.png);
}

#profile-container {
    background: var(--gray);
    border: 4px solid var(--light-purple);
    border-radius: 25px 25px 0 0;
    overflow: hidden;
}

.ft-profile-pic#current-profile-pic {
  position: relative;
  top: 3em;
  z-index:1;
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
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
}

.ft-central-tab-container.ft-tab-content {
  background: var(--light-purple);
}

.ft-connection-circle#current-profile-pic {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tab-folder {
  width: fit-content;
  border-bottom-style: solid;
  border-bottom-width: 1.5em;
    /* border-bottom: 1.5em solid var(--sunset); */
}

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

.ft-left-tab#two-fa {
  position: relative;
  top: -30rem;
  left: 8vw;
  width: 25rem;

  z-index: 1;
}


.ft-right-tab#username-change {
  position: relative;
  top: -35rem;
  left: 65vw;
  width: 25rem;
  
  z-index: 1;
}

.ft-left-tab#avatar-change {
  position: relative;
  top: -40rem;
  left: 12vw;
  width: 40rem;

  z-index: 1;
}

.ft-tab-border {
  border-style: solid;
  border-width: 0.3em;
  padding: 1em 4em 1em 4em;
}

/* .ft-tab-separator {
  border-bottom-width: 0.3em;
  border-bottom-style:solid;
} */

.ft-profile-pic.ft-friend-pic {
  width: 3em;
  height: 3em;
  position: relative;
  background: url(./../assets/img/ben-neale-zpxKdH_xNSI-unsplash.jpg);
  background-size: cover;
}

.ft-tab-content.ft-tab-border#blocked {
  background: var(--dark-gray);
}

.ft-item-title {
  padding: 1.5em;
}

#profile-container {
    background: var(--gray);
    border: 4px solid var(--light-purple);
    border-radius: 25px 25px 0 0;
    overflow: hidden;
}


.ft-the-drop-zone {
    border-radius: 2%;
    border-style: dashed;
    border-width: 0.2rem;
    border-color: var(--light);
    width: 32rem;
    height: 20rem;
    background: var(--light);
}

.ft-the-drop-zone:hover {
  border-style: dashed;
  border-width: 0.2rem;
  /* background: var(--purple); */
  border-color: var(--purple);
  color: var(--purple);
  /* box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4); */
}

</style>
