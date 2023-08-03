<template>
  <div v-if="route.params.username === userStore.user.username">
    <MyProfilePage />
  </div>
  <div v-else-if="userExist">
    <OtherProfilePage />
  </div>
  <div v-else>
    <div class="text-white">Something went wrong</div>
  </div>
  <div id="ft-bottom-line"></div>
</template>

<script setup lang="ts">
  import MyProfilePage from "@/components/MyProfilePage.vue";

  import { ref, onBeforeMount } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import axios, { AxiosError } from "axios";
  import { useUserStore } from "../stores/UserStore";
  import { useSessionStore } from "@/stores/SessionStore";
  import NavBar from "@/components/NavBar.vue";
  import OtherProfilePage from "@/components/OtherProfilePage.vue";

  type type_user = {
    id: number;
    username: string;
  };

  checkIfUserExist();
  const userExist = ref<boolean>(false);

  async function checkIfUserExist() {
    let users = new Array<type_user>();

    await axios({
      url: "/api/user/all",
      method: "get",
    })
      .then((response) => {
        users = response.data;
        if (users.find((user) => user.username === route.params.username)) {
          userExist.value = true;
        }
      })
      .catch((error) => {
        console.error(
          `unexpected error: ${error.response.status} ${error.response.statusText}`
        );
        return;
      });
  }

  // to have the token we need sessionStore
  const sessionStore = useSessionStore();

  // routes
  const route = useRoute();

  // we need userStore and a variable to check if logged in
  const userStore = useUserStore();

  // onBeforeMount is executed before the component is mounted
  // way of using await because we can't do it in setup
  onBeforeMount(async () => {
    if (sessionStore.isLoggedIn) {
      // get user infos, friends, and invitations
      await userStore.getMe(sessionStore.access_token);
    }
  });
</script>

<style scoped>
  #profile-container {
    background: var(--gray);
    border: 4px solid var(--light-purple);
    border-radius: 25px 25px 0 0;
    overflow: hidden;
  }
</style>
