<template>
  <div class="ft-container w-full h-screen">
    <div class="pb-20"></div>
    <div class="flex flex-row justify-center">
      <div class="flex flex-col">
        <h1 class="text-xl">Logging in with your 42 account</h1>
        <div v-if="textError?.length">
          <p>Failed: {{ textError }}</p>
          <a class="t-btn-pink ft-disable" @click="router.push('/login?logout=true')">
            <button>Go back</button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { useToast } from "vue-toastification";
import { ref } from "vue";

const route = useRoute();
const router = useRouter();

const sessionStore = useSessionStore();
const toast = useToast();

const textError = ref<string | undefined>();

getURLCode();

function getURLCode() {
  const code = route.query.code?.toString();
  const state = route.query.state?.toString();
  if (route.query.error?.toString() === "access_denied") {
    toast.error(
      `42Api denied your access: ${route.query.error_description?.toString()}`
    );
    textError.value = `42Api: ${route.query.error_description?.toString()}`;

    return;
  }
  if (code && state) {
    if (state != sessionStore.getUUID()) {
      console.log(`state: ${state}\nuuid: ${sessionStore.getUUID()}`);
      toast.error("State in query does not match stored uuid, try again");
      textError.value = "States don't match";
      return;
    }
    backendRegistration(code, state);
  } else {
    textError.value = "No provided code or state";
  }
}

async function backendRegistration(code: string, state: string) {
  await axios({
    url: "/api/auth/42api",
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: {
      code: code,
      state: state,
    },
  })
    .then((response) => {
      if (!response.data.tfa_enabled) {
        console.debug("Successfully logged in");
        sessionStore.access_token = response.data.access_token;
        sessionStore.isLoggedIn = true;
        if (!textError.value || textError.value?.length == 0) router.push("/directories");
      } else {
        router.push(
          `/login/tfa?tfa_request_uuid=${response.data.tfa_request_uuid}`
        );
      }
    })
    .catch((error) => {
      if (error.response.status == 401) {
        toast.error(
          `42 rejected the login request: ${error.response.statusText}`
        );
        textError.value = "42 rejected the Api access";
        // added message for the future
        setTimeout(() => {
          toast.warning(
            "Due to the manual process required to maintain this feature, it is possible that" +
            " logging in using the 42 api isn't supported anymore",
            { timeout: 0 });
        }, 3000);
      } else {
        textError.value = `unexpected error: ${error.response.status} ${error.response.statusText}`;
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
    });
}
</script>
