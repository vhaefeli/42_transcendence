<template>

  <div id="gameApp">
  <!-- <router-link class="t-btn-pink" id="retHome" to="/game-settings"><span>X</span></router-link> -->
  <button style="position: fixed; top: 10px; right: 10px;"><a class="t-btn-pink ft-circle-gray ft-icon-small icon-btn-size icon-btn-cursor" @click="quitReally"><img src="../assets/icons/xmark-solid.svg" alt="quit"></a></button>
  <div v-show="isAlertVisible" class="modal">
      <div class="modal-content">
        <p>If the game started you will lose by forfeit if you quit.<br> Do you really want to quit</p>
        <router-link class="t-btn-pink" id="retHome" to="/game-settings"><span>Yes!</span></router-link>
        <button><a class="t-btn-pink" id="ret" @click="stay"><span>Oh no!</span></a></button>
      </div>
    </div>
  <img id="arcade" src="../assets/img/arcade.png" alt="arcade">
  <!-- <span :class="{ 'blinking-text': true }" id="ready">press ENTER<br>to set as ready</span> -->
  <PongVue></PongVue>
</div>
</template>

<script setup>
import { ref, withDirectives } from 'vue';
import TransButton from '../components/TransButton.vue'
import PongVue from '@/components/Pong.vue';

const isAlertVisible = ref(false);

function quitReally () {
  console.log("quit");
  isAlertVisible.value = true;
}

function stay () {
  isAlertVisible.value = false;
}

</script>



<style>
#pong{
position: absolute;
top:13.6%;
width: 50%;
height: 72.8%;
left: 50%;
transform: translateX(-50%);
/* background-color: rgba(255, 255, 255, 0.276); */
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
}

#ready{
color: white;
width: 100%;
text-align: center;
position: absolute;
font-family: 'Array-Regular';
font-size: 7vw;
top: 27%;
left: 50%;
transform: translateX(-50%);
z-index: 4;
}


.blinking-text {
animation: blink-animation 1.5s infinite;
}

@keyframes blink-animation {
0% { opacity: 1; }
50% { opacity: 0; }
100% { opacity: 1; }
}

#gameApp {
position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
border-top: 0.3vw solid white;
border-left: 0.3vw solid white;
border-right: 0.3vw solid var(--purple);
border-bottom: 0.3vw solid var(--purple);
/* margin-top: 50vh; */
margin: 5vh;
/* padding: 2vw; */
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
