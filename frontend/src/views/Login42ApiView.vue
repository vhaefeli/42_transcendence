<template>
  <h1>Logging in with your 42 account</h1>
  <p>{{ code42 }}</p>
  <p v-if="state_fail">State does not match</p>
  <router-link class="t-btn-pink" to="/login"
    >Return to login/profile page</router-link
  >
</template>

<script setup lang="ts">
import axios from "axios";
import { useRoute } from "vue-router";
import { useSessionStore } from "@/stores/SessionStore";
import { ref } from "vue";

const state_fail = ref(false);

const sessionStore = useSessionStore();

let code42: string;

getURLCode();

function getURLCode() {
  const code = useRoute().query.code?.toString();
  const state = useRoute().query.state?.toString();
  if (useRoute().query.error?.toString() === "access_denied") {
    console.log(
      `42Api access denied: ${useRoute().query.error_description?.toString()}`
    );
    return;
  }
  if (code && state) {
    if (state != sessionStore.getUUID()) {
      console.log(`state: ${state}\nuuid: ${sessionStore.getUUID()}`);
      console.error("State in query does not match stored uuid");
      state_fail.value = true;
      return;
    }
    code42 = `API code: ${code}`;
  }

  backendRegistration(code, state);
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
      console.log("login successful, saved token");
      sessionStore.access_token = response.data.access_token;
      sessionStore.isLoggedIn = true;
    })
    .catch((error) => {
      if (error.response.status == 401)
        console.log(
          `42 rejected the login request: ${error.response.status} ${error.response.statusText}`
        );
      else
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
    });
}
</script>
