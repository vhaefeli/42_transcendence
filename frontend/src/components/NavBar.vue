<template>
    <nav id="ft-main-nav" class="w-full flex justify-center items-end">
        <Vue3Lottie id="ft-lottie" :animationData="pongJSON" :height="`42px`" :width="`42px`" />
        <router-link
            :class="{ active: activeTab === 'profile' }"
            class="nav-tab nav-tab-profile"
            :to="'/user/' + userStore.user.username"
            @click="setActiveTab('profile')"
        >
            my profile
        </router-link>
        <router-link
            :class="{ active: activeTab === 'chat' }"
            class="nav-tab nav-tab-chat"
            to="/dms"
            @click="setActiveTab('chat')"
        >
            chat
        </router-link>
        <router-link
            :class="{ active: activeTab === 'game' }"
            class="nav-tab nav-tab-game"
            to="/game"
            @click="setActiveTab('game')"
        >
            game
        </router-link>
    </nav>
  </template>
  <script setup>
    import { useUserStore } from '../stores/UserStore'
    import { ref, onMounted } from 'vue'
    import pongJSON from '@/assets/json/pong.json'
    
    const userStore = useUserStore()
    const activeTab = ref('')
    
    function setActiveTab(tab) {
        activeTab.value = tab
    }

</script>

<style scoped>

#ft-lottie {
    position: absolute;
    top: 12px;
    left: 12px;
}

.router-link-active {
    z-index: 9;
}

nav#ft-main-nav {
    height: 60px;
    background: black;
    color: white;
    overflow: hidden;
}

.nav-tab {
    height: 0;
    font-size: 1.6em;
    margin: 0 -5px;
    border-right: 1em solid var(--invisible);
	border-left: 1em solid var(--invisible);
    padding: 0 22px;
    border-bottom-width: 1.5em;
    border-bottom-style: solid;
    font-family: 'Array', 'Audiowide', monospace;
    font-style: normal;
    position: relative;
    bottom: 0;
    transition: bottom .5s ease;
}

.nav-tab:hover {
    bottom: -5px;
}

.nav-tab-profile {
    border-bottom: 1.5em solid var(--light-purple);
}

.nav-tab-chat {
    border-bottom: 1.5em solid var(--dark-pink);
}

.nav-tab-game {
    border-bottom: 1.5em solid var(--mint);
}

</style>