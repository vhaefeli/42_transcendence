<template>
	<canvas></canvas>
  </template>
  
  <script lang="ts">
  import { Component, Vue } from 'vue';
  
  @Component
  export default class CanvasComponent extends Vue {
	rectangleX = 0; // Position horizontale du rectangle
	rectangleY = 0; // Position verticale du rectangle
	movementSpeed = 5; // Vitesse de déplacement du rectangle
	keysPressed: { [key: string]: boolean } = {}; // État des touches enfoncées
  
	mounted() {
	  // Écouteurs d'événements pour détecter les touches enfoncées et relâchées
	  window.addEventListener('keydown', this.handleKeyDown);
	  window.addEventListener('keyup', this.handleKeyUp);
  
	  // Lancer la boucle de rendu
	  this.renderLoop();
	}
  
	handleKeyDown(event: KeyboardEvent) {
	  this.keysPressed[event.key] = true;
	}
  
	handleKeyUp(event: KeyboardEvent) {
	  this.keysPressed[event.key] = false;
	}
  
	renderLoop() {
	  // Vérifier les touches enfoncées et effectuer les mouvements correspondants
	  if (this.keysPressed['ArrowUp']) {
		this.rectangleY -= this.movementSpeed; // Déplace le rectangle vers le haut
	  }
	  if (this.keysPressed['ArrowDown']) {
		this.rectangleY += this.movementSpeed; // Déplace le rectangle vers le bas
	  }
	  if (this.keysPressed['ArrowLeft']) {
		this.rectangleX -= this.movementSpeed; // Déplace le rectangle vers la gauche
	  }
	  if (this.keysPressed['ArrowRight']) {
		this.rectangleX += this.movementSpeed; // Déplace le rectangle vers la droite
	  }
  
	  // Effectuer des opérations supplémentaires si nécessaire
  
	  // Redessiner le canevas avec les nouvelles coordonnées du rectangle
	  this.drawCanvas();
  
	  // Demander une nouvelle frame d'animation
	  requestAnimationFrame(this.renderLoop);
	}
  
	drawCanvas() {
	  const canvas = document.querySelector('canvas');
	  const ctx = canvas.getContext('2d');
  
	  // Efface le canevas
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
	  // Dessine le rectangle à sa nouvelle position
	  ctx.fillRect(this.rectangleX, this.rectangleY, 50, 50);
	}
  }
  </script>
  