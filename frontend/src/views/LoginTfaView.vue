<template>
  <div class="text-white">
    <div id="tfa-form">
      <input v-model="tfa_code" placeholder="code" class="bg-gray-500" /><br />
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
        toast.error(
          `${error.response.statusText}: Invalid credentials`
        );
      else if (error.response?.status == 400) {
        const message: string = error.response?.data?.message[0];
        toast.error(
          `${error.response.statusText}: ${message}`
        );
      } else
        toast.error(
          `${error.response?.statusText}: Unexpected error`
        );
    });
}

function cancel2FALogin() {
  router.push("/login?logout=true");
}
</script>
