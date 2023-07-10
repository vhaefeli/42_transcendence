<template>
    <nav class="w-full flex justify-center">
        <router-link class="t-btn-pink" :to="'/user/' + userStore.user.username">my profile</router-link>
        <router-link class="t-btn-pink" to="/dms"><span>chat</span></router-link>
        <router-link class="t-btn-pink" to="/game"><span>game</span></router-link>
    </nav>
</template>

<script setup>
    import { useUserStore } from '../stores/UserStore'
    const userStore = useUserStore()
</script>