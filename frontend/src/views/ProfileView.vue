<template>
    <div>
        <!-- Conteneur de la page entiere -->
        <div class="ft-cover">
            <!-- Conteneur du cover -->
            <div>
                <!-- Conteneur des boutons dans cover -->
                <div>
                    <p><button id="chat">Bouton "Send msg"</button></p>
                    <p><button id="game">Bouton Invite to play</button></p>
                </div>
            </div>
        </div>

        <div class="ft-flexContainer" id="centralTab">
            <div>
                <img id="profilePic" src="./../assets/img/chat.png" alt="Profile image of (username)"/>
            </div>
            <div class="ft-connectedCircle"></div>
            <div class="ft-tabContent ft-titleProfile">
            </div>
            <!-- <div>

            </div> -->
            <div class="ft-bodyContent">
                Pouette
            </div>
        </div>


        <div class="ft-container">


        

            <!-- <h1>Profile page</h1>
            <p>Name of user is {{ player[0].username }}</p>
            <h2>My friends</h2>

            <ul v-for="friend in player[0].friends" key="userData.id">
                <li>{{ friend.username }}</li>
            </ul> -->
            <div class="ft-flexContainer" id="stats">

                <div class="ft-tabContent ft-stats">
                    <!-- Ci-dessous le titre de l'onglet -->
                    Stats
                </div>
            </div>
        
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

button {
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 0.5em;
  text-align: right;
  /* Aligner les boutons a droite de la cover */
}

button#chat {
  background: var(--mint);
}

button#game {
  background: var(--pink);
}

/* JUSTE POUR REPERER FACILEMENT */

.ft-cover {
    background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg);
}

#profilePic {
    width: 6em;
    height: 6em;
    border-radius: 20%;
}

.ft-flexContainer {
    width: max-content;
}

.ft-flexContainer#centralTab {
    position: absolute;
    top: 100px;
    left: 50vw;
    transform: translateX(-50%);
    /* align-content: center; */
}

.ft-flexContainer#stats {
    position: relative;
    top:1em;
    left: 5em;
    transform: translateX(-50%);
    /* align-content: center; */
}

.ft-connectedCircle {
    position: relative;
    top: -0.7em;
}

.ft-tabContent {
    width: fit-content;
    border-bottom: 1.5em solid var(--mint);

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
    border-bottom: 1.5em solid var(--light-purple);
}

.ft-bodyContent {
    width:100%;
    /* height: 300px; */
    height: 15em;
    background: var(--light-purple);
    font-size: 1.5rem;
}

/* .ft-connectedCircle {
    left: 50vw;
    transform: translateX(-50%);
} */

</style>