<template>
    <!-- <main class="flex"> -->
    <main>
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
    </main>

<!-- MODIFIER CI/DESSOUS CORRECTEMENT

        <div id="textFolder">GAMMMMES
            <div v-for="folder in folders" :key="folder.name">
                HELLO
                {{ folder.description }}
                {{ folder.name }}
            </div>
        <div id="titleFolder">
             {{ folder.name }}
        </div>
-->
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
body {
    margin: 1px;
    min-height: 100vh;
    min-width: 100vw;
}

main {
    height: 100%;
    width: 100%;
    left: 0px;
    top: 0px;
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
    /* flex-wrap: wrap; */
    /* flex-direction: row; */
    flex-flow: wrap row; /*combo flex-wrap et -direction* /
     /* justify content: space-evenly, space-around et d'autres options sympas */
    justify-content: space-evenly;
    align-items: center;

    /* width: 100vw;
    height: 100vh;
    left: 0px;
    top: 0px;
    background: var(--gray);
    border: 4px solid var(--orange); */
}

.ft-folderContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    font-size: 1rem; /* 1rem = 16px */
    padding: 1rem;
    /* font-size: 16px; */
    line-height: 22px;
    display: flex;
    align-items: flex-end;
    color: var(--purple);
}

/* Style pris de Figma */
.ft-titleFolder {
    /* position: absolute; */
    /* width: 162.16px; */
    /* height: 34.85px;s */
    /* left: 237.56px;
    top: 664px; */

    /* font-family: 'Audiowide'; */ /* Font prise de Figma */
    font-family:monospace; /* changer */
    font-style:normal;
    font-weight:bold;
    font-size: 2.3rem; /* 42px moins */
    line-height: 54px;
    padding-left: 1rem; /* a voir si mieux sans */

    color: var(--white);
}

/* Style pris de Figma (rectangle2) */
/* #mainPage{
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    left: 0px;
    top: 0px;
    background: var(--gray);
    border: 4px solid var(--orange);
}
*/

/* Style pris de Figma (rectangle4) */
/* #folder{
    box-sizing: border-box;
    position: absolute;
    width: 305.45px;
    height: 208.52px;
    left: 221px;
    top: 432.48px;
    background: var(--pink);
    border: 4px solid var(--purple);
} */
/* Style pris de Figma */
/* .textFolder{ */
/* check your profile */
    /* position: absolute;
    width: 277px;
    height: 52px;
    left: 249px;
    top: 567px;

    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
    display: flex;
    align-items: flex-end;
    color: var(--purple);
} */


/* ul{
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
}
li{
    flex-grow: 1;
    flex-basis: 300px;
    text-align: center;
    padding: 30px;
    border: 1px solid #222;
    margin: 10px;
} */
</style>