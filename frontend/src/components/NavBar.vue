<template>
    <nav id="ft-main-nav" class="w-full flex justify-center items-end">
        <Vue3Lottie id="ft-lottie" ref="pongLottie" @mouseover="playAnimation" @mouseleave="stopAnimation" :animationData="pongJSON" :height="`42px`" :width="`42px`" />
        <router-link
            :class="{ 
                active: activeTab === 'profile',
                'other-profile-color': isOtherProfile === true 
            }"
            class="nav-tab nav-tab-profile"
            :to=userPath
            @click="setActiveTab('profile')"
        >
            my profile
        </router-link>
        <router-link
            :class="{ active: activeTab === 'game' }"
            class="nav-tab nav-tab-game"
            to="/game-settings"
            @click="setActiveTab('game')"
        >
            game
        </router-link>
        <router-link
            :class="{ active: activeTab === 'chat' }"
            class="nav-tab nav-tab-chat"
            to="/dms"
            @click="setActiveTab('chat')"
        >
            chat
        </router-link>
        <div v-if="props.showProfile">
            <div id="ft-nav-profile">
                <div id="ft-nav-profile-username">
                    <div class="cursor-pointer" @click="toggle">
                        <p>{{ props.userStore.user.username }}</p>
                        <div v-if="activeLogout" id="ft-logout-btn" class="bg-white p-1 w-full flex items-center justify-center"><router-link :to="'/login?logout=true'">Logout</router-link></div>
                    </div>
                </div>
                <div class="ft-profile-pic" id="ft-nav-profile-img" :style="{ 'background': 'url(' + props.userStore.user.avatar_url + ')' }"></div>
            </div>
        </div>
        <div v-else>
            <div id="ft-logout-btn" class="w-fit absolute top-4 right-4 p-1 flex items-center justify-center"><router-link :to="'/login?logout=true'">Logout</router-link></div>
        </div>
    </nav>
  </template>
  <script setup>
    import { ref, watchEffect } from 'vue'
    import { useRouter } from 'vue-router'
    import pongJSON from '@/assets/json/pong.json'

    const activeTab = ref('')
    const pongLottie = ref(null)
    const activeLogout = ref(false)
    const userPath = ref('')
    
    // routes
    const router = useRouter()
    
    const props = defineProps({
        showProfile: Boolean,
        userStore: Object
    })
    
    function playAnimation() {
        pongLottie.value.play()
    }
    
    function stopAnimation() {
        pongLottie.value.stop()
    }
    
    function setActiveTab(tab) {
        activeTab.value = tab
    }
    
    function toggle() {
        activeLogout.value = !activeLogout.value
    }

    watchEffect(() => {
        if (props.userStore.user.username) {
            userPath.value = '/user/' + props.userStore.user.username
        }
    })

</script>

<style scoped>

.other-profile-color {
    border-bottom-color: var(--gray) !important;
}

#ft-nav-profile-img {
    background-size: cover !important;
    width: 4em;
    height: 4em;
}

#ft-nav-profile-username {
    position: relative;
    top: 0.8rem;
    padding-right: 0.8rem;
    color: var(--light-purple);
}

#ft-nav-profile {
    position: absolute;
    right: 2rem;
    display: flex;
    top: 1rem;
}

#ft-logout-btn {
    height: 0;
    overflow: hidden;
    animation: appearDown .5s forwards;
}

@keyframes appearDown {
    from {
        height: 0;
    }
    to {
        height: 2rem;
    }
}

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
    border-bottom: 1.5em solid var(--pink);
}

.nav-tab-game {
    border-bottom: 1.5em solid var(--sunset);
}

</style>