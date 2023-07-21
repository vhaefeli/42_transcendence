<template>
  <NavBar />
  <div>Setup a game here</div>
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

<style>
#play {
  position: absolute;
  top: 20vw;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--pink);
}
</style>
