<template>
	<canvas id="pong"></canvas>
	<div @keydown="handleKeyDown" @keyup="handleKeyUp"></div>
</template>

<script setup>
	const canvas = document.getElementById("pong");

const paddlePlayer = document.getElementById("paddlePlayer");
console.log(paddlePlayer)
game: true
// paddlePlayer.style.display = "block";


let paddlePos = 56;
document.addEventListener('keydown', (event) => {
let name = event.key;
console.log(name);


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
console.log(paddlePos);
});	



</script>
<style>

#pong {
	background-color: pink;
}
.Paddle {
	position: absolute;
	left: 30%;
	transform: translate(-50%, -50%);
	width: 4px;
	height: 4vw;
	background-color: rgba(255, 255, 255, 0);
}
</style>
