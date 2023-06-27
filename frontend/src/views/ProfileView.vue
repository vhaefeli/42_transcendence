<template>
  <section class="ft-cover flex flex-col items-end justify-end">
    <a class="ft-color-chat t-btn-pink ft-other-profile"><span>Send message</span></a>
    <a class="ft-color-game t-btn-pink ft-other-profile"><span>Invite to play</span></a>
  </section>

  <section class="ft-content ft-container">
    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
      <div class="ft-profile-pic"></div>
      <!-- ajouter la valeur ft-circle-green ou ft-circle-gray selon le statut de connexion de la personne -->
      <div class="ft-connection-circle"></div>
      <div class="ft-tab-folder" id="title-profile"></div>
      <!-- Par defaut en ligne -->
      <div class="ft-tab-content ft-color-profile">Online</div>
      <div class="ft-tab-content ft-color-profile ft-title" id="username">
          Pouetteuuh
      </div>
      <!-- <div class="ft-tabContent ft-centralTab" id="buttonsContainer"> -->
      <div class="ft-tab-content ft-color-profile" id="buttons-container">
        <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-add ft-other-profile"><span>[+]</span></a>
        <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a>

        <!-- Bouton pour editer son profil (SON profil uniquement) -->
        <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a>
      </div>
      <!-- <div class="ft-color-profile ft-tabContent ft-centralTab">
      </div> -->
    </div>
                    
    <!-- CODE DE MICHELE -->
    <!-- <h1>Profile page</h1>
        <p>Name of user is {{ player[0].username }}</p>
        <h2>My friends</h2>
        
        <ul v-for="friend in player[0].friends" key="userData.id">
            <li>{{ friend.username }}</li>
        </ul> -->
    <!-- /CODE DE MICHELE -->

    <div class="flex flex-col text-center max-w-max ft-left-tab" id="stats">
      <div class="ft-tab-folder ft-tab-title">
        Stats
      </div>
      <!-- <div class="ft-tab-content ft-color-game flex flex-col text-left"> -->
      <div class="ft-tab-content ft-color-game ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left">
          <div class="ft-item-title ft-text ft-tab-separator ft-color-game">number of matches:</div>
          <div class="ft-item-title ft-text ft-tab-separator ft-color-game">victories:</div>
          <div class="ft-item-title ft-text ft-tab-separator ft-color-game">level:</div>
          <div class="ft-item-title ft-text ft-color-game">numbers of ...:</div>
            <!-- Ci-dessous le titre de l'onglet -->
      </div>
    </div>
    
  </section>
</template>
  
<script setup>
  // import TransButton from '../components/TransButton.vue'


    import { usePlayerStore } from '../stores/PlayerStore'
    import { storeToRefs } from 'pinia'
    
    const playerStore = usePlayerStore()

    const { player } = storeToRefs(playerStore)

    playerStore.getUserName()
</script>

<style scoped>

.ft-cover {
    background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg);
}

.ft-profile-pic {
    position: relative;
    top: 3em;
    width: 6em;
    height: 6em;
    border-radius: 20%;
    z-index:1;
    background: url(./../assets/img/chat.png);
    background-size: cover;
}

.ft-central-tab-container {
  position: relative;
  top: -16em;
  left: 50vw;
  transform: translateX(-50%);
}

.ft-tab-content {
  width: 100%;
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.4);
}

.ft-central-tab-container.ft-tab-content {
  background: var(--light-purple);
}

.ft-connection-circle {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tab-folder {
    width: fit-content;
    /* border-bottom: 1.5em solid var(--mint); */
}

.ft-tab-folder.ft-tab-title {
  border-bottom: 1.5em solid var(--mint);
}

/* .ft-tabContent#title-profile {
  text-overflow: ellipsis;
} */

#title-profile {
  text-overflow: ellipsis;
    font-size: 2rem;
    width: 10em;
    border-bottom: 1.5em solid var(--light-purple);
}

.ft-tab-content#buttons-container {
  padding: 2em 0 12em 0;
}

.ft-tab-separator {
  padding: 1em;
}

.ft-tab-border.ft-color-game, .ft-tab-separator.ft-color-game {
  border-color: var(--mint);
}

.ft-tab-content.ft-color-game {
  background: var(--gray);
}

.ft-left-tab#stats {
    position: relative;
    top:-23em;
    left: 20vw;
    width: 30em;
}

.ft-tab-border {
  width: 30em;
  border: 0.3em solid;
  padding: 1.5em;
}

.ft-tab-separator {
  border-bottom: 0.3em solid;
}


/* POUR DEBUG UNIQUEMENT */

/* .ft-other-profile {
  display: none;
} */

.ft-my-profile {
  display: none;
}

.ft-item-title {
  padding: 1.5em;
}

/* ^^ POUR DEBUG UNIQUEMENT ^^ */


</style>