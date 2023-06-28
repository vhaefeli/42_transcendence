<template>
      <TransButton>pouette</TransButton>
      <router-link class="t-btn-pink" to="/directories"><span>directories</span></router-link>
      <router-link class="t-btn-pink ft-color-profile" to="/profile"><span>profile</span></router-link>
      <router-link class="t-btn-pink ft-color-game" to="/game-settings"><span>game settings</span></router-link>
      <router-link class="t-btn-pink ft-color-game" to="/game"><span>game</span></router-link>
      <router-link class="t-btn-pink ft-color-chat" to="/chat"><span>chat</span></router-link>
      <router-link class="t-btn-pink" to="/about"><span>about</span></router-link>
      <router-link class="t-btn-pink" to="/login"><span>login</span></router-link>
</template>

<script setup>
   import TransButton from '../components/TransButton.vue'
</script>
