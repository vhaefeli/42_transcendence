<template>
    <p class="ft-empty-msg" :class=" white ? 'text-white' : 'text-black'">{{ text }}</p>
</template>

<script setup>
    defineProps({
        text: String,
        white: Boolean
    })
</script>

<style scoped>
    .ft-empty-msg {
        width: 100%;
        text-align: center;
        opacity: 28%;
    }
</style>