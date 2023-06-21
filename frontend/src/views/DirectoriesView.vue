<template>
    <!-- <main class="flex"> -->
    <main class="ft-directoriesMain">
        <div class="ft-container">
            <div class="ft-folderContainer">
                <div class="ft-tabFolder"></div>
                <div class="ft-folder">check your profile</div>
                <router-link class="ft-titleFolder" to="/profile">profile</router-link>
            </div>
            
            <div class="ft-folderContainer">
                <div class="ft-tabFolder"></div>
                <div class="ft-folder">play a game</div>
                <router-link class="ft-titleFolder" to="/game">game</router-link>

            </div>
            
            <div class="ft-folderContainer">
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
    /* margin: 0 auto; */
    /* display: grid; */
    /* grid-template-columns: 1fr 1fr 1fr; */
    /* grid-template-rows: 1fr 1fr 100%; */
    display: flex;
    /* combo flex-wrap et -direction */
    flex-flow: wrap row;
    /* justify content: space-evenly, space-around et d'autres options sympas */
    justify-content: space-evenly;
    align-items: center;
    
    /* devrait s'adapter a SON conteneur/parent normalement */
    width: 100%;
    height: 100%; /* devrait s'adapter a SON conteneur/parent normalement */
}

.ft-folderContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: max-content;
    aspect-ratio: 2/1;
}

/* Style pris de Figma (rectangle7) */
.ft-tabFolder {
    /* position:absolute; */
    /* width: 206.27px; */
    width: 12vw;
    /* height: 0px; */
    /* height: 50.48px; */
    /* left: 221px;
    top: 382px; */
    /* left: 50vw;
    top: 50vh; */
    border-right: 4vw solid var(--gray);
    border-bottom: 5vh solid var(--purple);
    background: var(--purple);
    /* resize: none;/ */
}
/* pour l-instant, juste pour l-idee */
.ft-folder {
    /* box-sizing: border-box; */
    width: 20vw;
    height: 15vh;
    /* left: 221px;
    top: 432.48px; */
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
    /* position: absolute; */
    /* width: 162.16px; */
    /* height: 34.85px;s */
    /* left: 237.56px;
    top: 664px; */

    font-family: 'Audiowide'; /* Font prise de Figma */
    /* font-family:monospace; */
    font-style:normal;
    font-weight:bold;
    font-size: 2rem;
    line-height: 54px;
    padding-left: 1rem; /* a voir si mieux sans */
    color: var(--light);
}

</style>