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
    <div class="ft-flexContainer ft-centralTab">
      <div class="ft-profilePic"></div>
      <div class="ft-connectedCircle"></div>
      <div class="ft-tabFolder" id="titleProfile"></div>
      <div id="onlineStatus">Online</div>
      <div class="ft-tabContent ft-title ft-centralTab">
          Pouetteuuh
      </div>
      <div class="ft-tabContent ft-centralTab" id="buttonsContainer">
        <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
        <button class="otherProfile" id="add">[+]</button>
        <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
        <button class="otherProfile" id="block">[blk]</button>

        <!-- Bouton pour editer son profil (SON profil uniquement) -->
        <button class="myProfile" id="edit">[ed.]</button>
      </div>
      <div class="ft-tabContent ft-centralTab">
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

    <div class="ft-flexContainer ft-leftTab" id="stats">
      <div class="ft-tabFolder ft-title">
        Stats
      </div>
      <div class="ft-tabContent">
        tabContent de stats
            <!-- Ci-dessous le titre de l'onglet -->
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

button#add {
  background: var(--mint);
}

button#block {
  background: var(--red);
}

button#edit {
  background: var(--gray);
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

.ft-flexContainer.ft-centralTab {
    position: relative;
    top: -16em;
    left: 50vw;
    transform: translateX(-50%);
}
.ft-tabContent.ft-centralTab {
  background: var(--light-purple);
}

#onlineStatus {
  width: 100%;
}

.ft-flexContainer#stats {
    position: relative;
    top:-23em;
    left: 8em;
    width: 30em;
    /* align-content: center; */
}

.ft-connectedCircle {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tabFolder {
    width: fit-content;
    border-bottom: 1.5em solid var(--mint);
}

.ft-tabContent#titleProfile {
  text-overflow: ellipsis;
}

#titleProfile {
    font-size: 2rem;
    width: 10em;
    border-bottom: 1.5em solid var(--light-purple);
}

.ft-tabContent.ft-centralTab, #onlineStatus {
  width:100%;
  background: var(--light-purple);
}

.ft-tabContent {
  /* height: 10em; */
  font-size: 2rem;
}

.ft-tabContent#buttonsContainer {
  /* padding-top: 3em; */
  padding: 2em 0 5em 0;
}

</style>