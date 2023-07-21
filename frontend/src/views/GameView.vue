<template>
  <div ref="parentDiv" class="parent-div">
  <div id="gameApp">
    <div ref="zoneDiv" class="zone">
      <PongVue></PongVue>
  <button style="position: fixed; top: 10px; right: 10px;"><a class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor" @click="quitReally"><img src="../assets/icons/xmark-solid.svg" alt="quit"></a></button>
  <div v-show="isAlertVisible" class="modal">
      <div class="modal-content">
        <p>If the game started you will lose by forfeit if you quit.<br> Do you really want to quit</p>
        <router-link class="t-btn-pink" id="retHome" to="/game?quit=true"><span>Yes!</span></router-link>
        <button><a class="t-btn-pink" id="ret" @click="stay"><span>Oh no!</span></a></button>
      </div>
    </div>
    
    
  <img id="arcade" src="../assets/img/arcade.png" alt="arcade">



</div></div></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import PongVue from '@/components/Pong.vue';

const parentDiv = ref<HTMLDivElement | null>(null);
const zoneDiv = ref<HTMLDivElement | null>(null);

const isAlertVisible = ref(false);

function quitReally () {
  isAlertVisible.value = true;
}

function stay () {
  isAlertVisible.value = false;
}

const handleWindowResize = (): void => {
  if (parentDiv.value && zoneDiv.value) {
    const parentWidth = window.innerWidth;
    
    const parentHeight = window.innerHeight;
    const ratio = 505 / 898; // Ratio hauteur/largeur souhaité

    let width, height, windowRatio;

    windowRatio = parentHeight / parentWidth;
    if (windowRatio < ratio) {
      height = parentHeight * 0.9;
      width = height / ratio;
    } else {
      width = parentDiv.value.clientWidth * 0.9;
      height = width * ratio;
    }
    zoneDiv.value.style.width = `${width}px`;
    zoneDiv.value.style.height = `${height}px`;
    const textReady = document.getElementById('ready');
    const textWait = document.getElementById('wait');

  if (textReady || textWait) {
    const zoneDivWidth = zoneDiv.value.clientWidth;
    const zoneDivHeight = zoneDiv.value.clientHeight;
    const textWidthPercentage = zoneDivWidth * 0.15; // Ajustez le pourcentage selon vos préférences
    const textHeightPercentage = zoneDivHeight * 0.15; // Ajustez le pourcentage selon vos préférences

    const fontSize = Math.min(textWidthPercentage, textHeightPercentage);
    textReady.style.fontSize = `${fontSize}px`;
    textWait.style.fontSize = `${fontSize}px`;
  }
  }
};

onMounted(() => {
  handleWindowResize();
  window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
});

</script>



<style>

#game-container {
    background: var(--gray);
	  border: 4px solid var(--sunset);
    min-height: 100vh;
}

#retHome{
position: absolute;
padding: 2px 2px;
top: 60%; 
right: 50%;
transform: translateX(-10%);
width : 40%;
background-color: var(--pink);
}

#ret{
position: absolute;
padding: 2px 2px;
top: 60%; 
right: 50%;
transform: translateX(+110%);
width : 40%;
background-color: var(--pink);
}

#arcade{
width: 100%;
align-self: center;
border-top: 0.3vw solid white;
border-left: 0.3vw solid white;
border-right: 0.3vw solid var(--purple);
border-bottom: 0.3vw solid var(--purple);
}

#gameApp {
position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* margin-left: auto; */
  margin-top: 5vh;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);
  top: 10%;
  width: 30vw;
  height: 15vw;
  overflow: auto;
  border-top: 0.3vw solid white;
  border-left: 0.3vw solid white;
  border-right: 0.3vw solid var(--purple);
  border-bottom: 0.3vw solid var(--purple);
  background: var(--gray);
  font-size: 1vw;
text-align: center;
  z-index: 5;
}

.modal-content {
  margin: 5% auto;
  padding: 1%;
  width: 85%;
  text-align: center;
  font-size: 1vw;
  z-index: 6;
}
</style>
