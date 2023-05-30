<template>
      <TransButton>pouette</TransButton>
      <router-link to="/directories"><span>directories</span></router-link>
      <router-link to="/profile"><span>profile</span></router-link>
      <router-link to="/game-settings"><span>game settings</span></router-link>
      <router-link to="/game"><span>game</span></router-link>
      <router-link to="/chat"><span>chat</span></router-link>
      <router-link to="/about"><span>about</span></router-link>
</template>

<script setup>
   import TransButton from '../components/TransButton.vue'
</script>