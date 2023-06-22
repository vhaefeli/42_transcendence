<template>
    <div class="ft-cover">
        Cover
        <div>
            Bouton "Send msg"
        </div>
        
        <div>
            Bouton Invite to play
        </div>
    </div>
    <div class="ft-flexContainer">
        <div>
            Photo
        </div>
        <div class="ft-connectedCircle"></div>
        <div class="ft-tabContent ft-titleProfile">
            (tab)
        </div>
        <div>

        </div>
        <div class="ft-bodyContent">
            Pouette (body)
        </div>
    </div>


    <div class="ft-container">


    

        <!-- <h1>Profile page</h1>
        <p>Name of user is {{ player[0].username }}</p>
        <h2>My friends</h2>

        <ul v-for="friend in player[0].friends" key="userData.id">
            <li>{{ friend.username }}</li>
        </ul> -->

        <div class="ft-tabContent ft-stats">
            <!-- Ci-dessous le titre de l'onglet -->
            Stats
        </div>
    
    </div>
</template>
  
<script setup>
    import { usePlayerStore } from '../stores/PlayerStore'
    import { storeToRefs } from 'pinia'

    const playerStore = usePlayerStore()

    const { player } = storeToRefs(playerStore)

    playerStore.getUserName()
</script>

<style scoped>

/* JUSTE POUR REPERER FACILEMENT */
/* div {
    background-color: var(--red);
} */
/* JUSTE POUR REPERER FACILEMENT */

.ft-cover {
    background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg);
}

.ft-flexContainer {
    width: max-content;
    position: absolute;
    top: 100px;
    left: 50vw;
    transform: translateX(-50%);
    /* align-content: center; */

}

.ft-tabContent {
    width: fit-content;

    /* left: 200px;
    top: 100px; */

}

.ft-titleProfile {
    /* color: var(--light); */

    /* position: relative;
    left: 50vw;
    transform: translateX(-50%);
    top:15vh; */


    /* display: flex;
    flex-direction: column; */
    /* font-weight: 400; */
    font-size: 3rem;
    /* text-align: center; */
    min-width:fit-content;
    width: 40vw;
}

.ft-bodyContent {
    /* width: 40vw; */
    /* height: 300px; */
    height: 500px;
    background: var(--mint);
}

/* .ft-connectedCircle {
    left: 50vw;
    transform: translateX(-50%);
} */

</style>