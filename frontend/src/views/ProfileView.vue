<template>
    <h1>Profile page</h1>
    <p>Name of user is {{ player[0].username }}</p>
    <h2>My friends</h2>

    <ul v-for="friend in player[0].friends" key="userData.id">
        <li>{{ friend.username }}</li>
    </ul>

</template>
  
<script setup>
    import { usePlayerStore } from '../stores/PlayerStore'
    import { storeToRefs } from 'pinia'

    const playerStore = usePlayerStore()

    const { player } = storeToRefs(playerStore)

    playerStore.getUserName()
	playerStore.getUsers();
</script>
