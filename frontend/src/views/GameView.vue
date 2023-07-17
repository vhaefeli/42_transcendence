<template>
    <NavBar/>
    <section id="game-container">
        <div>Play a game</div>
    </section>
</template>
  
<script setup>
import NavBar from "../components/NavBar.vue";
</script>

<style>

#game-container {
    background: var(--gray);
	border: 4px solid var(--sunset);
    min-height: 100vh;
}

</style>
