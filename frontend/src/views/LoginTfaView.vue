<template>
  <div class="ft-container w-full h-screen">
    <div class="pb-20"></div>
    <div class="flex flex-row justify-center">
      <div id="tfa-form" @keyup.enter="validate2FALogin" class="flex flex-col">
        <input
          v-model="tfa_code"
          placeholder="code"
          class="rounded-xl p-3 border-black mb-1"
        /><br />
        <div class="flex flex-row">
          <a @click="cancel2FALogin" class="t-btn-pink ft-disable w-1/2">
            <button>Cancel</button>
          </a>
          <a @click="validate2FALogin" class="t-btn-pink ft-enable w-1/2">
            <button>Validate</button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import axios, { AxiosError } from "axios";
import { useRoute, useRouter, type LocationQuery } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { useUserStore } from "@/stores/UserStore";
import { useToast } from "vue-toastification";

const router = useRouter();
const route = useRoute();

const sessionStore = useSessionStore();
const userStore = useUserStore();
const toast = useToast();

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
  if (!tfa_uuid?.length) {
    console.error(
      "No tfa_request_uuid provided in query param, redirecting to login"
    );
    router.push("/login");
  }
}

async function validate2FALogin() {
  if (tfa_code.value.length == 0) {
    toast.warning("Please insert code");
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
      router.push("/directories");
    })
    .catch((error: AxiosError) => {
      if (error.response?.status == 401)
        toast.error(`${error.response.statusText}: Invalid credentials`);
      else if (error.response?.status == 400) {
        const message: string = error.response?.data?.message[0];
        toast.error(`${error.response.statusText}: ${message}`);
      } else toast.error(`${error.response?.statusText}: Unexpected error`);
    });
}

function cancel2FALogin() {
  router.push("/login?logout=true");
}
</script>
