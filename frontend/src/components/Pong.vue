<template>
	<!-- <div class="vertical-line" id = "separation"></div> -->
	<canvas ref="pong" id="pong" width="606" height="498">PONG GAME</canvas>
	<div @keydown="handleKeyDown" @keyup="handleKeyUp"></div>
</template>

<script setup>

	import { defineComponent, ref } from 'vue';
    const pong = ref(null);
	console.log(pong);
    const canvas = pong.value;
	console.log(canvas);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dessinez une ligne verticale
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(50, 100);
        ctx.strokeStyle = 'green';
        ctx.stroke();
      }
    }

const paddlePlayer = document.getElementById("paddlePlayer");
// console.log(paddlePlayer)

// const canvas = document.querySelector("canvas");
// const ctx = canvas.getContext("2d");
// ctx.fillStyle = "green";
// // Add a rectangle at (10, 10) with size 100x100 pixels
// ctx.fillRect(10, 10, 100, 100);
let paddlePos = 56;
document.addEventListener('keydown', (event) => {
let name = event.key;
// console.log(name);


if (name === "w")
{
	if (paddlePos > 36)
		paddlePos-= 2;
}
if (name === "s")
{ 
	if (paddlePos < 74)
		paddlePos+= 2;
}

paddlePlayer.style.top = paddlePos + "%";
// console.log(paddlePos);
});	



</script>
<style>

.vertical-line {
 	position: absolute;
 	background-color: rgba(255, 255, 255, 0.7);
 }

#separation {
	left: 50%;
	transform: translate(-50%, -50%);
	top: 50%;
	width: 4px;
	height: 70%;
}

#paddlePlayer {
	left: 25%;
	transform: translate(-50%, -50%);
	top: 50%;
	width: 4px;
	height: 4vw;
}

#paddleOpponent {
	left: 75%;
	transform: translate(-50%, -50%);
	top: 50%;
	width: 4px;
	height: 4vw;
}

</style>
