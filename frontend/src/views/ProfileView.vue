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
        <!-- <a class="t-btn-pink ft-color-edit ft-my-profile" id="edit"><span>[ed.]</span></a> -->
        <a class="t-btn-pink ft-color-edit ft-my-profile ft-icon-small" id="edit"><img src="../assets/img/icons/user-pen-solid.svg" alt="edit my profile"></a>
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

    <div class="flex flex-col text-center ft-left-tab" id="stats">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-game">Stats</div>
      <div class="ft-tab-content ft-border-color-game ft-tab-border flex flex-row justify-evenly ">
        <!-- <div class="flex flex-col">3</div> -->
          <div class="ft-item-title ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">23</div>
            <div class="ft-text">matches</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">12</div>
            <div class="ft-text">victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">2</div>
            <div class="ft-text">perfect victories</div>
          </div>
          <div class="ft-item-title ft-text ft-bb-color-game flex flex-col">
            <div class="ft-result-drk-text">Pitaya</div>
            <div class="ft-text">level</div>
          </div>
      </div>
    </div>

    <div class="flex flex-col text-center ft-right-tab" id="match-history">
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

    <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-requests">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends requests</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Thingy</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>

          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE THINGY CI-DESSOUS. NE PAS MODIFIER ICI-->
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Cerise</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Annabelle</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">Jean-Pierre</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <!-- Le dernier element n'a pas la classe ft-tab-separator -->
          <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between items-center">
            <ul class="flex flex-row items-center">
              <li class="ft-profile-pic ft-friend-pic"></li>
              <li class="ft-text ml-2">John</li>
            </ul>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/circle-check-solid.svg" alt="accept friend request"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/circle-xmark-solid.svg" alt="decline friend request"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE THINGY CI-DESSOUS. NE PAS MODIFIER ICI-->
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center ft-right-tab ft-my-profile" id="friends-list">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Friends</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left ft-scrollable">
        <ul>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status"></div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Jean-Eudes</li>
                <li class="ft-level-text ml-2">Pitaya level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE JEAN-EUDES CI-DESSOUS. NE PAS MODIFIER ICI-->
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status"></div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Chris</li>
                <li class="ft-level-text ml-2">Lemongrass level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <li class="ft-item-title ft-text ft-tab-separator ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status"></div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Danielle</li>
                <li class="ft-level-text ml-2">Cherry tomato level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- Le dernier element n'a pas la classe ft-tab-separator -->
          <li class="ft-item-title ft-text ft-bb-color-profile flex flex-row justify-between">
            <div class="flex flex-row items-center">
              <div class="flex flex-col">
                <div class="ft-profile-pic ft-friend-pic">
                  <div class="ft-connection-circle ft-friend-status"></div>
                </div>
              </div>
              <ul class="flex flex-col justify-center">
                <li class="ft-text ml-2">Pouette</li>
                <li class="ft-level-text ml-2">Yam level</li>
              </ul>
            </div>
            <ul class="flex flex-row">
              <li><a class="t-btn-pink ft-bg-color-chat ft-icon-small"><img src="../assets/img/icons/message-solid.svg" alt="send them a message"></a></li>
              <li><a class="t-btn-pink ft-color-block ft-icon-small"><img src="../assets/img/icons/ban-solid.svg" alt="block them"></a></li>
              <li><a class="t-btn-pink ft-color-remove ft-icon-small"><img src="../assets/img/icons/user-minus-solid.svg" alt="remove friendship"></a></li>
            </ul>
          </li>
          <!-- UNIQUEMENT POUR GENERER CONTENU, COPIE DE JEAN-EUDES CI-DESSUS. NE PAS MODIFIER ICI -->
        </ul>
      </div>
    </div>

    <div class="flex flex-col text-center ft-left-tab ft-my-profile" id="friends-search">
      <div class="ft-tab-folder ft-tab-title ft-bb-color-profile">Add a new friend</div>
      <div class="ft-tab-content ft-border-color-profile ft-tab-border text-left">
          <div class="flex flex-row justify-center">
            <input type="text" placeholder="Search by username">
            <a class="t-btn-pink ft-color-add ft-icon-small"><img src="../assets/img/icons/user-plus-solid.svg" alt="send a friend request"></a>
          </div>
      </div>
    </div>

    <img src="../assets/img/icons/table-tennis-paddle-ball-solid.svg" alt="is playing" class="ft-connection-circle">
    <!-- <div class="ft-icon-test"></div> -->

    <!-- Pour les blocked, ajouter id="blocked" pour appliquer le bon fond -->
    
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
    background: url(./../assets/img/fond.png);
    /* background: url(./../assets/img/jr-korpa-9XngoIpxcEo-unsplash.jpg); */
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
  min-width: 100%;
  /* width: 100%; */
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
  top:-28rem;
  left: 10vw;
  width: 30em;

  z-index: 1;
}

.ft-right-tab#match-history {
  position: relative;
  top:-35em;
  left: 45vw;
  width: 40rem;
}

.ft-tab-border {
  /* width: 30em; */
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
  left: 15vw;
  width: 52em;
}

.ft-right-tab#friends-list {
  position: relative;
  top:-48em;
  left: 40vw;
  width: 50em;
}

.ft-profile-pic.ft-friend-pic {
  width: 3em;
  height: 3em;
  position: relative;
  background: url(./../assets/img/ben-neale-zpxKdH_xNSI-unsplash.jpg);
  background-size: cover;
}

.ft-connection-circle.ft-friend-status {
  position:relative;
  top: 2.3rem;
  right: -0.8rem;
  z-index:2;
  align-items: end;
}

.ft-left-tab#friends-search {
  position: relative;
  top:-52em;
  left: 15vw;
  width: 30em;
}

.ft-tab-content.ft-tab-border#blocked {
  background: var(--dark-gray);
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

.ft-icon-test {
  background: url(./../assets/img/icons/table-tennis-paddle-ball-solid.svg);
  background-size: cover;
}


</style>