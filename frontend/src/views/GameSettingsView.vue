<template>
   <NavBar :showProfile="true"></NavBar>
  <div id="gamesetting-container">
    <div class="text-white">
      <input
        v-model="gameIdToConnect"
        placeholder="game id"
        class="bg-gray-500"
      /><br />
    </div>
    <button class="t-btn-pink ft-color-game" id="play" @click="connectToGame">
      <span>Play Game</span>
    </button>
    <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-search" :class="{ foreground: foregroundTab === 'search' }" @click="setForegroundTab('search')">
        <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
        <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left">
            <div class="flex flex-row justify-center">
              <ModelListSelect
                :list="userList"
                v-model="selectedUser"
                optionValue="id"
                optionText="username"
                placeholder="Search by username"
              />
              <div :class="{ 'cursor-not-allowed': !selectedUser }">
                <a
                  @click="validateSelection"
                  class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"
                  :class="{ 'opacity-50 searchan-noClick': !selectedUser }">
                  <img src="../assets/icons/user-plus-solid.svg" alt="send a friend request" title="send them a friend request">
                </a>
              </div>
              <!-- <input type="text" placeholder="Search by username"> -->
              <!-- <a class="t-btn-pink ft-color-add ft-icon-small icon-btn-size icon-btn-cursor"><img src="../assets/icons/user-plus-solid.svg" alt="send a friend request" title="send them a friend request"></a> -->
            </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "../components/NavBar.vue";
import { useRouter } from "vue-router";

const gameIdToConnect = ref();
const router = useRouter();

function connectToGame() {
  if (gameIdToConnect.value >= 0) {
    router.push(`/game?gameId=${gameIdToConnect.value}`);
  }
}
</script>

<style scoped>


#gamesetting-container {
  background: var(--gray);
    border: 4px solid var(--sunset);
  padding: 5vw;
    
    border-radius: 25px 25px 0 0;
    overflow: hidden;
}

#play {
  /* position: absolute; */
  /* top: 20vw; */
  /* left: 50%;
  transform: translateX(-50%); */
  background-color: var(--pink);
}
</style>
