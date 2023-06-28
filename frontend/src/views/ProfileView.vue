<template>
  <section class="ft-cover flex flex-col items-end justify-end">
    <a class="ft-bg-color-chat t-btn-pink ft-other-profile"><span>Send message</span></a>
    <a class="ft-bg-color-game t-btn-pink ft-other-profile"><span>Invite to play</span></a>
  </section>

  <section class="ft-container">
    <div class="flex flex-col items-center text-center max-w-max ft-central-tab-container">
      <div class="ft-profile-pic" id="current-profile-pic"></div>
      <!-- ajouter la valeur ft-circle-green ou ft-circle-gray selon le statut de connexion de la personne -->
      <div class="ft-connection-circle" id="current-profile-pic"></div>
      <div class="ft-tab-folder" id="title-profile"></div>
      <!-- Par defaut en ligne -->
      <div class="ft-tab-content ft-bg-color-profile">Online</div>
      <div class="ft-tab-content ft-bg-color-profile ft-title" id="username">
          Pouetteuuh
      </div>
      <!-- <div class="ft-tabContent ft-centralTab" id="buttonsContainer"> -->
      <div class="ft-tab-content ft-bg-color-profile" id="buttons-container">
        <!-- Bouton pour ajouter la personne en ami (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-add ft-other-profile"><span>[+]</span></a>
        <!-- Bouton pour bloquer la personne (profil d'un tiers) -->
        <a class="t-btn-pink ft-color-block ft-other-profile" id="block"><span>[blk]</span></a>

        <!-- Bouton pour editer son profil (SON profil uniquement) -->
        <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a>
      </div>
      <!-- <div class="ft-bg-color-profile ft-tabContent ft-centralTab">
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
      <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
      <div class="ft-tab-content ft-border-color-game ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left">
          <div class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">number of matches:</div>
          <div class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">victories:</div>
          <div class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">level:</div>
          <div class="ft-item-title ft-text ft-bb-color-game">numbers of ...:</div>
      </div>
    </div>

    <div class="flex flex-col text-center max-w-max ft-right-tab" id="match-history">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Match history</div>
      <div class="ft-tab-content ft-border-color-game ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
            <p><h2>12.05.2023</h2></p>
            lost against Thingy (Pitaya level)</li>
            <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
            <p><h2>13.05.2023</h2></p>
            lost against Thingy (Pitaya level)</li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-game">
            <p><h2>14.05.2023</h2></p>
            lost against Thingy (Pitaya level)</li>
          <li class="ft-item-title ft-text ft-bb-color-game">
            <p><h2>22.05.2023</h2></p>
            lost against everyone (Kumquat level)</li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center max-w-max ft-left-tab ft-my-profile" id="friends-requests">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends requests</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">
            Thingy
            <a class="t-btn-pink ft-color-add"><span>OK</span></a>
            <a class="t-btn-pink ft-color-block"><span>Nope</span></a>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">Cerise</li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">Jean-Daniel</li>
          <li class="ft-item-title ft-text ft-bb-color-profile">Anne-Sylvie</li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center max-w-max ft-right-tab ft-my-profile" id="friends-list">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">
            <div class="ft-profile-pic" id="friends-pic">
              <div class="ft-connection-circle" id="friends-pic"></div>
            </div>
            Thingy
            <a class="t-btn-pink ft-bg-color-profile"><span>[msg]</span></a>
            <a class="t-btn-pink ft-color-remove"><span>[rm]</span></a>
            <a class="t-btn-pink ft-color-block"><span>[blk]</span></a>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">Cerise</li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile">Jean-Daniel</li>
          <li class="ft-item-title ft-text ft-bb-color-profile">Anne-Sylvie</li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center max-w-max ft-left-tab ft-my-profile" id="friends-search">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border grid-cols-2 grid-rows-4 grid-flow-row text-left">
          <div class="flex flex-row justify-center">
            <input type="text" placeholder="Search by username">
            <a class="t-btn-pink ft-color-add"><span>Add</span></a>
          </div>
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

.ft-profile-pic#current-profile-pic {
  position: relative;
  top: 3em;
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

.ft-connection-circle#current-profile-pic {
  position:relative;
  top: 2.5em;
  z-index:2;
}

.ft-tab-folder {
  width: fit-content;
  border-bottom-style: solid;
  border-bottom-width: 1.5em;
    /* border-bottom: 1.5em solid var(--mint); */
}

/* .ft-tab-folder.ft-tab-title {
  /* border-bottom: 1.5em solid var(--mint);
  border-bottom: 1.5em solid;
} */



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

.ft-left-tab#stats {
  position: relative;
  top:-28em;
  left: 26vw;
  width: 30em;
}

.ft-right-tab#match-history {
  position: relative;
  top:-35em;
  left: 40vw;
  width: 50em;
}

.ft-tab-border {
  width: 30em;
  border-style: solid;
  border-width: 0.3em;
  padding: 1em 4em 1em 4em;
}

.ft-tab-separator {
  border-bottom-width: 0.3em;
  border-bottom-style:solid;
}

/* Piste : pour perso des barres de défilement, utiliser "PerfectScrollbar" ou "Custom Scrollbar" (JS). */
.ft-scrollable {
  height: 20em;
  overflow: auto;
}

.ft-left-tab#friends-requests {
  position: relative;
  top:-40em;
  left: 22vw;
  width: 50em;
}

.ft-right-tab#friends-list {
  position: relative;
  top:-48em;
  left: 50vw;
  width: 50em;
}

.ft-profile-pic#friends-pic {
  position: relative;
  background: url(./../assets/img/ben-neale-zpxKdH_xNSI-unsplash.jpg);
  background-size: cover;
}

.ft-connection-circle#friends-pic {
  position:absolute;
  top: 2.5em;
  right: -0.6em;
  z-index:2;
  /* align-content: end; */
  align-items: end;
}

.ft-left-tab#friends-search {
  position: relative;
  top:-52em;
  left: 15vw;
  width: 50em;
}

/* POUR DEBUG UNIQUEMENT */

.ft-other-profile {
  display: none;
}

/* .ft-my-profile {
  display: none;
} */

.ft-item-title {
  padding: 1.5em;
}

/* ^^ POUR DEBUG UNIQUEMENT ^^ */



</style>