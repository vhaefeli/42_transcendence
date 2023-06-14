<template>
    <!-- <div id="mainPage"> -->

        <div class="container">
            <div id="tabFolder"></div>
            <div class="folder">Profile</div>
            <div class="folder">Game</div>
            <div class="folder">Chat</div>
        </div>

        <div id="tabFolder"></div>


<!-- MODIFIER CI/DESSOUS CORRECTEMENT


        <div id="tabFolder"></div>

        <div id="cornerTabFolder"></div>
        <div id="folder"></div>
        <div id="textFolder">
            check your profile
        </div>
        <div id="titleFolder">
            profile
        </div>
        <div id="textFolder">GAMMMMES
            <div v-for="folder in folders" :key="folder.name">
                HELLO
                {{ folder.description }}
                {{ folder.name }}
            </div>
        <div id="titleFolder">
             {{ folder.name }}
        </div>


        <div id="tabFolder"></div>
        <div id="cornerTabFolder"></div>
        <div id="folder"></div>
        <div id="textFolder">
            play a game
        </div>
        <div id="titleFolder">
            game
        </div>

        <div id="tabFolder"></div>
        <div id="cornerTabFolder"></div>
        <div id="folder"></div>
        <div id="textFolder">
            chat with friends
        </div>
        <div id="titleFolder">
            chat
        </div>
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
.container{
    display: flex;
    /* flex-wrap: wrap;
    flex-direction: row; */
    flex-flow: wrap row; /* combo flex-wrap et -direction* /
     /* justify content: space-evenly, space-around et d'autres options sympas */
    justify-content: space-evenly;
    align-items: center;

    width: 100vw;
    height: 100vh;
    left: 0px;
    top: 0px;
    background: #B7B7B7;
    border: 4px solid #EA7F35;
}

/* pour l-instant, juste pour l-idee */
.folder{
    /* box-sizing: border-box; */
    width: 20vw;
    height: 15vh;
    /* left: 221px;
    top: 432.48px; */
    background: #ED9CDB;
    border: 4px solid #5C14D0;

    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    display: flex;
    align-items: flex-end;
    color: #5C14D0;
}

/* Style pris de Figma (rectangle2) */
#mainPage{
    box-sizing: border-box;
    /* position: relative; */
    /* position: absolute; */
    /* width: 1440px; */
    /* height: 1024px; */
    width: 100vw;
    height: 100vh;
    left: 0px;
    top: 0px;
    background: #B7B7B7;
    border: 4px solid #EA7F35;
}

/* Style pris de Figma (rectangle7) */
#tabFolder{
    /* position:absolute; */
    /* width: 206.27px; */
    width: 12vw;
    /* height: 0px; */
    /* height: 50.48px; */
    left: 221px;
    top: 382px;
    /* left: 50vw;
    top: 50vh; */
    border-right: 4vw solid #B7B7B7;
    border-bottom: 5vh solid #5c14d0;
    background: #5C14D0;
}
#cornerTabFolder{
    background-color: #EA7F35;
}
/* Style pris de Figma (rectangle4) */
#folder{
    box-sizing: border-box;
    position: absolute;
    width: 305.45px;
    height: 208.52px;
    left: 221px;
    top: 432.48px;
    background: #ED9CDB;
    border: 4px solid #5C14D0;
}
/* Style pris de Figma */
#textFolder{
/* check your profile */
    position: absolute;
    width: 277px;
    height: 52px;
    left: 249px;
    top: 567px;

    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    display: flex;
    align-items: flex-end;
    color: #5C14D0;
}
/* Style pris de Figma */
#titleFolder{
    position: absolute;
    width: 162.16px;
    height: 34.85px;
    left: 237.56px;
    top: 664px;

    /* font-family: 'Audiowide'; */ /* Font prise de Figma */
    font-family:monospace; /* changer */
    font-style:normal;
    font-weight:bold;
    font-size: 42px;
    line-height: 54px;

    color: #FFFFFF;
}


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