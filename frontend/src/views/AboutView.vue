<template>
    <NavBar :showProfile="true" :userStore="userStore"/>
    <div class="text-white">About the devs</div>
</template>

<script setup lang="ts">
    import { useUserStore } from "@/stores/UserStore";
    import NavBar from "../components/NavBar.vue";
    import { onBeforeMount } from "vue";
    import { useRouter } from "vue-router";
    import { useSessionStore } from "@/stores/SessionStore";
    const userStore = useUserStore();
    const sessionStore = useSessionStore();

    onBeforeMount(async () => {
      if (!sessionStore.isLoggedIn) useRouter().push('/login?logout=true');
      else await userStore.getMe(sessionStore.access_token);
    });
</script>
