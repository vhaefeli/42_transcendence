<template>
  <main class="ft-directoriesMain">
    <div class="ft-container">
      <div class="ft-folderContainer cursor-pointer" id="profile"
        @click="userStore.redirectToMyProfile(sessionStore.access_token)">
        <div class="ft-tab-folder ft-profile-dir"></div>
        <div class="ft-folder ft-profile-dir ft-text">check your profile</div>
        <button
          @click="
            userStore.redirectToMyProfile(sessionStore.access_token)
          "
          class="ft-titleFolder ft-title"
        >
          profile
        </button>
      </div>

      <div>
      <router-link class="ft-folderContainer cursor-pointer" id="game" to="/game-settings">
        <div class="ft-tab-folder ft-game-dir"></div>
        <div class="ft-folder ft-game-dir ft-text">play a game</div></router-link>
        <router-link class="ft-titleFolder ft-title" to="/game-settings"
          >game</router-link
        >
      </div>

      <div>
      <router-link class="ft-folderContainer cursor-pointer" id="chat" to="/dms">
        <div class="ft-tab-folder ft-chat-dir"></div>
        <div class="ft-folder ft-chat-dir ft-text">chat with friends</div></router-link>
        <router-link class="ft-titleFolder ft-title" to="/dms"
          >chat</router-link
        >
      </div>
    </div>
  </main>
</template>

<script setup>
import { useUserStore } from "@/stores/UserStore";
import { useSessionStore } from "@/stores/SessionStore";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const sessionStore = useSessionStore();
if (!sessionStore.isLoggedIn) useRouter().push('/login?logout=true');
else userStore.getMe(sessionStore.access_token);
</script>

<style scoped>
.ft-directoriesMain {
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  background: var(--gray);
  border: 4px solid var(--orange);
}

.ft-container {
  display: flex;
  flex-flow: wrap row;
  justify-content: space-evenly;
  align-items: center;

  width: 100%;
  height: 100%;
}

.ft-folderContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: max-content;
  aspect-ratio: 2/1;
}

.ft-tab-folder {
  width: 10em;
  /* border-bottom: 2.5em solid var(--purple); */
}

.ft-tab-folder.ft-profile-dir {
  width: 10em;
  border-bottom: 2.5em solid var(--purple);
}

.ft-tab-folder.ft-game-dir {
  width: 10em;
  border-bottom: 2.5em solid var(--sunset);
}

.ft-tab-folder.ft-chat-dir {
  width: 10em;
  border-bottom: 2.5em solid var(--dark-pink);
}

.ft-folder {
  width: 18em;
  height: 10em;
  font-size: 1rem;
  padding: 1rem;
  line-height: 22px;
  display: flex;
  align-items: flex-end;
  /* color: var(--purple); */
}

.ft-folder.ft-profile-dir {
  background: var(--light-purple);
  border: 4px solid var(--purple);
}

.ft-folder.ft-game-dir {
  background: var(--light-sunset);
  border: 4px solid var(--sunset);
}

.ft-folder.ft-chat-dir {
  background: var(--pink);
  border: 4px solid var(--dark-pink);
}

.ft-titleFolder {
  font-size: 2.5rem;
  line-height: 54px;
  padding-left: 1rem;
  width: fit-content;
}
</style>
