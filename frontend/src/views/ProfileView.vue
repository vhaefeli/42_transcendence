<template>
  <section class="ft-cover flex flex-col items-end justify-end">
        <!-- Conteneur des boutons dans cover -->
          <!-- ajouter classes pour les couleurs par activite -->
            <a class="ft-color-chat t-btn-pink ft-other-profile"><span>Send msg</span></a>
            <a class="ft-color-game t-btn-pink ft-other-profile"><span>Invite to play</span></a>
  </section>

  <section class="ft-content ft-container">
    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container ft-centralTab">
      <div class="ft-profile-pic"></div>
      <div class="ft-connectedCircle"></div>
      <div class="ft-tabFolder" id="titleProfile"></div>
      <div id="onlineStatus">Online</div>
      <div class="ft-tabContent ft-title ft-centralTab">
          Pouetteuuh
      </div>
      <div class="ft-tabContent ft-centralTab" id="buttonsContainer">
        <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-add ft-other-profile"><span>[+]</span></a>
        <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a>

        <!-- Bouton pour editer son profil (SON profil uniquement) -->
        <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a>
      </div>
      <div class="ft-color-profile ft-tabContent ft-centralTab">
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

    <div class="flex flex-col items-center text-center max-w-max ft-leftTab" id="stats">
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
  // import TransButton from '../components/TransButton.vue'


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
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 1em;
  margin: 0.5em;
}
/* /JUSTE POUR REPERER FACILEMENT */



/* button#add {
  background: var(--mint);
}

button#block {
  background: var(--red);
}

button#edit {
  background: var(--gray);
} */


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

/* .ft-centralTab {
    position: relative;
    top: -16em;
    left: 50vw;
    transform: translateX(-50%);
} */

/* .ft-tabContent.ft-centralTab {
  background: var(--light-purple);
} */

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

/* .ft-other-profile {
  display: none;
} */

.ft-my-profile {
  display: none;
}

</style>