<template>
  <NavBar :showProfile="false"></NavBar>
  <div class="text-white">
    <div id="tfa-form">
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
  </div>
</template>

<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import { ref, watch } from "vue";
import axios, { AxiosError } from "axios";
import { useRoute, useRouter, type LocationQuery } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";

const router = useRouter();
const route = useRoute();

const sessionStore = useSessionStore();
const userStore = useUserStore();

const tfa_code = ref("");
let tfa_uuid: string | undefined;

handleQueryParams(route?.query);
watch(
  () => route?.query,
  (params) => {
    handleQueryParams(params);
  }
);

function handleQueryParams(params: LocationQuery) {
  tfa_uuid = params?.tfa_request_uuid?.toString();
  console.log(tfa_uuid);
  if (!tfa_uuid?.length) {
    console.error(
      "No tfa_request_uuid provided in query param, redirecting to login"
    );
    router.push("/login");
  }
}

async function validate2FALogin() {
  if (tfa_code.value.length == 0) {
    console.log("please insert code");
    return;
  }
  await axios({
    url: "/api/auth/2fa/login",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: { tfa_request_uuid: tfa_uuid, code: tfa_code.value.trim() },
  })
    .then((response) => {
      sessionStore.access_token = response.data.access_token;
      sessionStore.isLoggedIn = true;
      userStore.redirectToMyProfile(sessionStore.access_token, router);
    })
    .catch((error: AxiosError) => {
      if (error.response?.status == 401)
        console.log(`${error.response?.statusText}: tfa verification failed`);
      else console.log(error);
    });
}

function cancel2FALogin() {
  router.push("/login?logout=true");
}
</script>