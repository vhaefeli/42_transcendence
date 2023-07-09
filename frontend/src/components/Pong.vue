<template>
	<!-- <div class="vertical-line" id = "separation"></div> -->
	<canvas ref="pong" id="pong" width="606" height="498">PONG GAME</canvas>
	<div @keydown="handleKeyDown" @keyup="handleKeyUp"></div>
</template>

<script setup>
        var canvas = document.getElementById('pong');
        if (!canvas.getContext) {
            throw "Error";
        }
        var ctx = canvas.getContext('2d');
		console.log(ctx);

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
