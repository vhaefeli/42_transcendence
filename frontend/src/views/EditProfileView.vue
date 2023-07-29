<template>
  <NavBar :showProfile="true" :userStore="userStore"/>
  <div class="text-white profile-container w-full">
    <section class="flex flex-col items-center">
      <button
        class="t-btn-pink"
        @click="userStore.redirectToMyProfile(sessionStore.access_token)"
      >
        Go Back
      </button>
      <p v-if="errorText.length">{{ errorText }}</p>
      <p>
        {{ `2fa is ${userStore.user.tfa_enabled ? "enabled" : "disabled"}` }}
      </p>
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
      <p class="text-white">Upload a new avatar for your profile</p>
      <div
        class="drop-area w-2/3"
        :data-active="active"
        @dragenter.prevent="setActive"
        @dragover.prevent="setActive"
        @dragleave.prevent="setInactive"
        @drop.prevent="onDrop"
      >
        <p>Drop your image here</p>
        <label for="file-input">or select a file:</label>
        <input
          type="file"
          id="selectedFile"
          style="display: none"
          name="file-input"
          v-on:change="fileInputOnChange"
        />
        <input
          class="ft-browse-button"
          type="button"
          value="Browse..."
          onclick="document.getElementById('selectedFile').click();"
        />
        <p v-if="selectedAvatar == undefined">no image selected</p>
        <p v-if="selectedAvatar" class="truncate">{{ selectedAvatar.name }}</p>
        <slot :dropZoneActive="active"></slot>
        <div
          :class="{ 'cursor-not-allowed': selectedAvatar == undefined }"
          class="w-fit"
        >
          <button
            class="ft-edit-button"
            @click="uploadNewAvatar"
            :class="{ 'opacity-50 ft-noClick': selectedAvatar == undefined }"
          >
            Upload
          </button>
        </div>
      </div>
      <div class="text-white" id="ft-edit-username">
        <div v-if="!usernameChanged">
          <p>Modify your username:</p>
          <input
            class="min-w-10 ft-text-input"
            v-model="username"
            placeholder="new username"
          />
          <div
            :class="{ 'cursor-not-allowed': username.length == 0 }"
            class="w-fit"
          >
            <button
              class="ft-edit-button"
              @click="submitNewUsername"
              :class="{ 'opacity-50 ft-noClick': username.length == 0 }"
            >
              Submit
            </button>
          </div>
        </div>
        <div v-if="usernameChanged">
          <p>Username successfully changed, please login again</p>
          <button class="t-btn-pink" @click="logout">Go to Login</button>
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
  margin: 0 auto;
  padding: 50px;
  background: #ffffff55;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: 0.2s ease;

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
</style>
