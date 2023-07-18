<template>
    <nav id="ft-chat-navbar" class="w-full flex items-end">
        <router-link
            :class="{ active: activeTab === 'dms' }"
            class="chat-nav-tab"
            :to="'/dms'"
            @click="setActiveTab('dms')"
        >
            Direct messages
        </router-link>
        <router-link
            :class="{ active: activeTab === 'channels' }"
            class="chat-nav-tab"
            to="/channels"
            @click="setActiveTab('channels')"
        >
            My channels
        </router-link>
        <router-link
            :class="{ active: activeTab === 'search' }"
            class="chat-nav-tab"
            to="/search-channels"
            @click="setActiveTab('search')"
        >
            Search channel
        </router-link>
    </nav>
  </template>
  <script setup>
    import { ref } from 'vue'

    const props = defineProps({
        whichTab: String
    })
    
    const activeTab = ref(props.whichTab)

    console.log(props.whichTab)
    
    function setActiveTab(tab) {
        activeTab.value = tab
    }
</script>

<style scoped>
.chat-nav-tab.active {
    z-index: 9;
    background: var(--gray);
    color: var(--dark-pink);
    padding: .9rem 2rem;
    position: relative;
    bottom: -5px;
    border: transparent;
}

.chat-nav-tab.active:hover {
    padding: .9rem 2rem;
}

.chat-nav-tab {
    padding: .5rem 2rem;
    border: 4px solid var(--dark-pink);
    border-bottom: transparent;
    background: var(--middle-gray);
    position: relative;
    bottom: 0;
    transition: padding .5s ease;
}

.chat-nav-tab:hover {
    padding: .4rem 2rem;
}

nav#ft-chat-navbar {
    height: 68px;
}

</style>