<template>
      <TransButton>pouette</TransButton>
      <router-link class="t-btn-pink" to="/directories"><span>directories</span></router-link>
      <router-link class="t-btn-pink" to="/profile"><span>profile</span></router-link>
      <router-link class="t-btn-pink" to="/game-settings"><span>game settings</span></router-link>
      <router-link class="t-btn-pink" to="/game"><span>game</span></router-link>
      <router-link class="t-btn-pink" to="/chat"><span>chat</span></router-link>
      <router-link class="t-btn-pink" to="/about"><span>about</span></router-link>
</template>

<script setup>
   import TransButton from '../components/TransButton.vue'
</script>