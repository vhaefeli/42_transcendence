<template>
    <NavBar :showProfile="true" :userStore="userStore"/>
    <div id="ft-about-container">
      <h1 class="mb-3 text-xl">ft_transcendence</h1>
      <div>
        <p>Nadia Chennaf</p>
        <p>Vanessa Haefeli</p>
        <p>Davi Farhi</p>
        <p>Valérie Roch</p>
        <p>Michèle Reymond</p>
      </div>
    </div>
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

<style scoped>
  #ft-about-container {
    position: relative;
    background: var(--gray);
    border: 4px solid var(--sunset);
    border-image: linear-gradient(to right, var(--purple), var(--dark-pink)) 1;
    padding: 5vw;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 90vh;
    z-index: 0;
  }
</style>
