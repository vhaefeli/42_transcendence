<template>
  <section class="ft-cover">
    <div>
        <!-- Conteneur des boutons dans cover -->
        <div>
            <p><button id="chat">Bouton "Send msg"</button></p>
            <p><button id="game">Bouton Invite to play</button></p>
        </div>
    </div>
  </section>

  <section class="ft-content ft-container">
    <div class="ft-flexContainer" id="centralTab">
      <div class="ft-profilePic"></div>
      <div class="ft-connectedCircle"></div>
      <div class="ft-tabContent ft-titleProfile"></div>
      <div id="onlineStatus">Online</div>
      <div class="ft-bodyContent ft-title">
          Pouetteuuh
      </div>
    </div>
                    
    <!-- CODE DE MICHELE -->
    <!-- <h1>Profile page</h1>
        <p>Name of user is {{ player[0].username }}</p>
        <h2>My friends</h2>
        
        <ul v-for="friend in player[0].friends" key="userData.id">
            <li>{{ friend.username }}</li>
        </ul> -->
    <!-- /CODE DE MICHELE -->

    <div class="ft-flexContainer" id="stats">
      <div class="ft-tabFolder"></div>
        
        <div class="ft-tabContent ft-title">
            <!-- Ci-dessous le titre de l'onglet -->
            Stats
        </div>
    </div>
    
  </section>
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

/* /JUSTE POUR REPERER FACILEMENT */

.ft-cover {
    background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg);
}

.ft-profilePic {
    position: relative;
    top: 3em;
    width: 6em;
    height: 6em;
    border-radius: 20%;
    z-index:1;
    background: url(./../assets/img/chat.png);
    background-size: cover;
}

.ft-flexContainer {
    width: max-content;
}

.ft-flexContainer#centralTab {
    position: relative;
    top: -12em;
    left: 50vw;
    transform: translateX(-50%);
    /* align-content: center; */
}

#onlineStatus {
  width: 100%;
}

.ft-flexContainer#stats {
    position: relative;
    top:1em;
    left: 5em;
    transform: translateX(-50%);
    /* align-content: center; */
}

.ft-connectedCircle {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tabContent {
    width: fit-content;
    border-bottom: 1.5em solid var(--mint);

    /* left: 200px;
    top: 100px; */

}

.ft-tabContent.ft-titleProfile {
  text-overflow: ellipsis;
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
    font-size: 2rem;
    /* text-align: center; */
    /* min-width:fit-content; */
    width: 10em;
    border-bottom: 1.5em solid var(--light-purple);
}

.ft-bodyContent, #onlineStatus {
  width:100%;
  background: var(--light-purple);
}

.ft-bodyContent {
  height: 10em;
  font-size: 2rem;
}

</style>