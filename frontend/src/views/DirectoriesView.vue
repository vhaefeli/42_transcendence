<template>
    <main class="ft-directoriesMain">
        <div class="ft-container">
            <!-- purple -->
            <div class="ft-folderContainer" id="profile">
                <div class="ft-tabFolder"></div>
                <div class="ft-folder">check your profile</div>
                <router-link class="ft-titleFolder" to="/profile">profile</router-link>
            </div>
            
            <!-- menthe -->
            <div class="ft-folderContainer" id="game">
                <div class="ft-tabFolder"></div>
                <div class="ft-folder">play a game</div>
                <router-link class="ft-titleFolder" to="/game">game</router-link>

            </div>
            
            <!-- rose -->
            <div class="ft-folderContainer" id="chat">
                <div class="ft-tabFolder"></div>
                <div class="ft-folder">chat with friends</div>
                <router-link class="ft-titleFolder" to="/chat">chat</router-link>
            </div>
        </div>

        <!-- MODIFIER CI/DESSOUS CORRECTEMENT -->

        <!-- <div id="textFolder">
            <div v-for="folder in folders" :key="folder.name">
                HELLO
                {{ folder.description }}
                {{ folder.name }}
            </div>
            <div id="titleFolder">
                {{ folder.name }}
            </div>
        </div> -->

    </main>
 
</template>
  
<script setup>
// <script setup lang="ts">
import { ref } from "vue";

let folders = ref([
    { name: "profile", description: "check your profile" },
    { name: "game", description: "play a game" },
    { name: "chat", description: "chat with friends" }
]);


</script>

<style scoped>

.ft-directoriesMain {
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    background: var(--gray);
    border: 4px solid var(--orange);
}

.ft-container {
    display: flex;
    flex-flow: wrap row;
    justify-content: space-evenly;
    align-items: center;
    
    width: 100%;
    height: 100%;
}

.ft-folderContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: max-content;
    aspect-ratio: 2/1;
}

.ft-tabFolder {
    width: 10em;
    border-bottom: 2.5em solid var(--purple);
}
.ft-folder {
    width: 18em;
    height: 10em;
    background: var(--pink);
    border: 4px solid var(--purple);
    
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 1rem;
    padding: 1rem;
    line-height: 22px;
    display: flex;
    align-items: flex-end;
    color: var(--purple);
}

.ft-titleFolder {
    font-size: 2.5rem;
    line-height: 54px;
    padding-left: 1rem;
}

</style>