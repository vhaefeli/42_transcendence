<template>

  <div id="gameApp">
  <router-link class="t-btn-pink" id="retHome" to="/game-settings"><span>X</span></router-link>
  <img id="arcade" src="../assets/img/arcade.png" alt="arcade">
  <span :class="{ 'blinking-text': true }" id="ready">press ENTER<br>to set as ready</span>
  <PongVue></PongVue>
</div>
</template>

<script setup>
import { withDirectives } from 'vue';
import TransButton from '../components/TransButton.vue'
import PongVue from '@/components/Pong.vue';

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
top: -5vh;
right: -5vh;
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
</style>
