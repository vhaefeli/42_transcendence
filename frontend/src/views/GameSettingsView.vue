<template>
  <NavBar/>
  <div>Setup a game here</div>
<router-link class="t-btn-pink ft-color-game" id="play"  to="/game"><span>Play Game</span></router-link>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
</script>

<style>
#play{
position: absolute;
top: 20vw;
left: 50%;
transform: translateX(-50%);
background-color: var(--pink);
}
</style>