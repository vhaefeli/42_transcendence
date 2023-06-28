<template>

    <div id="gameApp">
		<router-link class="t-btn-pink" id="retHome" to="/"><span>X</span></router-link>
		<img id="arcade" src="../assets/img/arcade.png" alt="arcade">
    	<span :class="{ 'blinking-text': true }" id="ready">press ENTER<br>to set as ready</span>
		<PongVue id="canvaPong"></PongVue>



	</div>
</template>
  
<script setup>
	import { withDirectives } from 'vue';
	import TransButton from '../components/TransButton.vue'
	import PongVue from '@/components/Pong.vue';

</script>

<style>
#canvasPong{
	position: absolute;
	width: 70vw;
	height: 40vw;
	left: 50%;
	transform: translateX(-50%);
}

#retHome{
	position: absolute;
	padding: 8px 8px;
	top: 10px;
	right: 10px;
}

#arcade{
	width: 80vw;
	height: 45vw;
}

#ready{
	color: white;
	text-align: center;
	position: absolute;
	font-family: 'Array-Regular';
	font-size: 7vw;
	top: 20vh;
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

.verticalLine#separation {
	position: absolute;
	left: 50%;
	transform: translate(-50%, -50%);
	top: 50%;
	width: 4px;
	height: 32vw;
	background-color: rgba(255, 255, 255, 0.647);
}

.paddlePlayer {
	position: absolute;
	display: none;
	left: 30%;
	transform: translate(-50%, -50%);
	top: 56%;
	width: 4px;
	height: 4vw;
	background-color: rgba(255, 255, 255, 0.7);
}

.mousemove {
	height: 50px;
	width: 50px;
	border: 2px solid rgb(232, 116, 164);
	position: absolute;
	transform: translate(-50%, -50%);
	left: 50%;
	right: 50%;
	border-radius: 50px;
	/* transition: 0.2s ease; */
	z-index: -1;
}

.verticalLine#paddleOpponent {
	position: absolute;
	left: 80%;
	transform: translate(-50%, -50%);
	top: 50%;
	width: 4px;
	height: 4vw;
	background-color: rgba(255, 255, 255, 0.647);
}

#gameApp {
	border-top: 0.3vw solid white;
	border-left: 0.3vw solid white;
	border-right: 0.3vw solid var(--purple);
	border-bottom: 0.3vw solid var(--purple);
	margin-top: 50vh;
	padding: 2vw;
	transform: translateY(-20%);
}

</style>