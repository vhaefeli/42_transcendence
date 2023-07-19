<template>
  <div class="text-white">
    <h1>Logging in with your 42 account</h1>
    <div v-if="textError?.length">
      <p>Failed: {{ textError }}</p>
      <router-link :to="'/login?logout=true'">Go back</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";

const route = useRoute();
const router = useRouter();

const sessionStore = useSessionStore();

let textError: string | undefined;

getURLCode();

function getURLCode() {
  const code = route.query.code?.toString();
  const state = route.query.state?.toString();
  if (route.query.error?.toString() === "access_denied") {
    console.error(
      `42Api denied your access: ${route.query.error_description?.toString()}`
    );
    textError = `42Api: ${route.query.error_description?.toString()}`;

    return;
  }
  if (code && state) {
    if (state != sessionStore.getUUID()) {
      console.log(`state: ${state}\nuuid: ${sessionStore.getUUID()}`);
      console.error("State in query does not match stored uuid");
      textError = "States don't match";
      return;
    }
    backendRegistration(code, state);
  } else {
    textError = "No provided code or state";
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
        if (!textError || textError?.length == 0) router.push("/directories");
      } else {
        router.push(
          `/login/tfa?tfa_request_uuid=${response.data.tfa_request_uuid}`
        );
      }
    })
    .catch((error) => {
      if (error.response.status == 401) {
        console.debug(
          `42 rejected the login request: ${error.response.status} ${error.response.statusText}`
        );
        textError = "42 rejected the Api access";
      } else {
        textError = `unexpected error: ${error.response.status} ${error.response.statusText}`;
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
      }
    });
}
</script>
