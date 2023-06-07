<template>
    <h1>Profile page</h1>
    <p>Name of user is {{ player[0].userName }}</p>
    <h2>My friends</h2>

    <ul v-for="friend in player[0].friends" key="userData.id">
        <li>{{ friend.userName }}</li>
    </ul>

</template>
  
<script setup>
    import { usePlayerStore } from '../stores/PlayerStore'
    import { storeToRefs } from 'pinia'

    const playerStore = usePlayerStore()

    const { player } = storeToRefs(playerStore)

    playerStore.getUserName()
</script>