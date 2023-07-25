<template>
  <!-- <NavBar :showProfile="false" :isOtherProfile="true"></NavBar>
  <div id="profile-container"> -->
    <div v-if="route.params.username === userStore.user.username">
    <MyProfilePage/>
      </div>
      <div v-else-if="userExist">
        <OtherProfilePage/>
      </div>
      <div v-else>
        <div class="text-white">
          Something went wrong
        </div>
      </div>
  <!-- </div> -->
  <div id="ft-bottom-line"></div>
</template>
  
<script setup lang="ts">
    import MyProfilePage from "@/components/MyProfilePage.vue";

    import { ref, onBeforeMount } from "vue";
//     import { storeToRefs } from 'pinia'
    import { useRoute, useRouter } from 'vue-router'
    import axios, { AxiosError } from "axios";
    import { useUserStore } from '../stores/UserStore'
    import { useSessionStore } from "@/stores/SessionStore";
    import NavBar from "@/components/NavBar.vue";
    import OtherProfilePage from "@/components/OtherProfilePage.vue";
//     import { ModelListSelect } from "vue-search-select";
//     import EmptyText from "@/components/EmptyText.vue";

    type type_user = {
      id: number;
      username: string;
    };

    checkIfUserExist()
    const userExist = ref<boolean>(false);

    async function checkIfUserExist() {
      let users = new Array<type_user>;

      await axios({
        url: "/api/user/all",
        method: "get",
      })
        .then((response) => {
          users = response.data;
          if (users.find((user) => user.username === route.params.username)) {
            userExist.value = true;
          }
        })
        .catch((error) => {
          console.error(
            `unexpected error: ${error.response.status} ${error.response.statusText}`
          );
          return;
        });
      }

//     const userList = ref<Array<type_user>>([]);
//     const selectedUser = ref<number>();

//     loadUserList();

//     async function loadUserList() {
//       let users = new Array<type_user>();

//       await axios({
//         url: "/api/user/all",
//         method: "get",
//       })
//         .then((response) => {
//           users = response.data;
//         })
//         .catch((error) => {
//           console.error(
//             `unexpected error: ${error.response.status} ${error.response.statusText}`
//           );
//           return;
//         });

//       await axios({
//         url: "/api/user/friend/all",
//         method: "get",
//         headers: { Authorization: `Bearer ${sessionStore.access_token}` },
//       })
//         .then((response) => {
//           users = users.filter(
//             (user) => !response.data?.find((friend) => friend.id === user.id)
//           );
//         })
//         .catch((error) => {
//           console.error(
//             `unexpected error: ${error.response.status} ${error.response.statusText}`
//           );
//           return;
//         });
//       userList.value = users.filter((user) => user.id != userStore.user.id);
//     }
//     // to have the token we need sessionStore
    const sessionStore = useSessionStore()
    
//     // routes
    const route = useRoute()
    // const router = useRouter()
    
//     // we need userStore and a variable to check if logged in
    const userStore = useUserStore()
//     const isLoggedIn = ref(false);

//     // other variables
//     const foregroundTab = ref('')
//     const newFriend = ref('')
//     let allUsers: { id: number, username: string }[];

//     const { user, friends, invites, blocked, invitesSent, gameLog } = storeToRefs(userStore)

//     function setForegroundTab(tab) {
//       foregroundTab.value = tab
//     }

//     // onBeforeMount is executed before the component is mounted
//     // way of using await because we can't do it in setup
    onBeforeMount(async () => {
        if (sessionStore.isLoggedIn) {
            // isLoggedIn.value = true;

            // get user infos, friends, and invitations
            await userStore.getMe(sessionStore.access_token);
            // if (user.value.isLogged) {
            //     await userStore.getFriends(sessionStore.access_token);
            //     await userStore.getInvites(sessionStore.access_token);
            //     await userStore.getBlockedUsers(sessionStore.access_token);
            //     await userStore.getInvitesSent(sessionStore.access_token);
            //     await userStore.getGameHistory(sessionStore.access_token);
            // } else {
            //     isLoggedIn.value = false;
            //     sessionStore.isLoggedIn = false;
            //     sessionStore.access_token = "";
            //     router.push({ name: 'login' })
            // }
        }
    });

//     // list all users
//     axios({
//         url: "/api/user/all",
//         method: "get",
//         headers: { },
//     })
//         .then((response) => {
//         allUsers = response.data;
//         console.log("all users loaded");
//         })
//         .catch((error) => {
//             console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
//     });


//     async function validateSelection() {
//       console.log(
//         `selected: ${
//           userList.value.find((element) => element.id === selectedUser.value)
//             ?.username
//         }`
//       );
//     }

//     // functions to delete because useless
//     function addFriend() {
//         if (newFriend.value) {
//             userStore.addFriend(newFriend.value, sessionStore.access_token);
//         }
//     }

//     function formatDate(dateString: string) {
//       const dateObj = new Date(dateString);
//       return dateObj.toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//       })
//     }

//     function acceptFriend(friendname) {
//         userStore.acceptFriend(friendname, sessionStore.access_token);
//     }

//     function iDontWantToBeFriend(friendname) {
//         userStore.declineFriend(friendname, sessionStore.access_token);
//     }

//     function removeFriend(friendname) {
//         userStore.delFriend(friendname, sessionStore.access_token)
//     }

//     function blockUser(username) {
//         userStore.blockUser(username, sessionStore.access_token)
//     }

//     function blockUserAndDelInvite(username) {
//         userStore.blockUser(username, sessionStore.access_token)
//         userStore.declineFriend(username, sessionStore.access_token);
//     }

//     function unblockUser(username) {
//         userStore.unblockUser(username, sessionStore.access_token)
//     }

//     function getGameHistory(username) {
//         userStore.getGameHistory(username, sessionStore.access_token);
//     }
    
//     // SCRIPT DAVI 2FA DEBUT ********************************************************************

// const tfa_code = ref("");
// const tfa_email = ref("");
// const show_tfa_enable_disable_confirmation = ref(false);
// let tfaRegistrationEnable = true;

// async function tfaEnable() {
//   if (!tfa_email.value.length) {
//     console.log("email must not be empty");
//     return;
//   }
//   await axios({
//     url: "/api/auth/2fa/enable",
//     method: "patch",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//     data: { email: tfa_email.value },
//   })
//     .then(() => {
//       console.log("code has been sent");
//       show_tfa_enable_disable_confirmation.value = true;
//       tfaRegistrationEnable = true;
//     })
//     .catch((error) => {
//       if (error.response?.status === 409) {
//         show_tfa_enable_disable_confirmation.value = true;
//         tfaRegistrationEnable = true;
//       }
//       console.error(`${error.response.status} ${error.response.statusText}`);
//     });
// }

// async function tfaDisable() {
//   await axios({
//     url: "/api/auth/2fa/disable",
//     method: "patch",
//     headers: {
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//   })
//     .then(() => {
//       console.log("code has been sent");
//       show_tfa_enable_disable_confirmation.value = true;
//       tfaRegistrationEnable = false;
//     })
//     .catch((error) => {
//       if (error.response?.status === 409) {
//         show_tfa_enable_disable_confirmation.value = true;
//         tfaRegistrationEnable = false;
//       }
//       console.error(`${error.response.status} ${error.response.statusText}`);
//     });
// }

// async function validate2FARegistration() {
//   if (tfa_code.value.length == 0) {
//     console.log("please insert code");
//     return;
//   }
//   await axios({
//     url: `/api/auth/2fa/${tfaRegistrationEnable ? "enable" : "disable"}/confirm`,
//     method: "patch",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${sessionStore.access_token}`,
//     },
//     data: { code: tfa_code.value.trim() },
//   })
//     .then(() => {
//       userStore.getMe(sessionStore.access_token);
//       tfa_code.value = "";
//       show_tfa_enable_disable_confirmation.value = false;
//     })
//     .catch((error: AxiosError) => {
//       console.error(`${error.response?.status} ${error.response?.statusText}`);
//     });
// }

// function cancelTfaEnableDisable() {
//   show_tfa_enable_disable_confirmation.value = false;
// }
    // SCRIPT DAVI 2FA FIN **********************************************************************
</script>

<style scoped>
  #profile-container {
      background: var(--gray);
      border: 4px solid var(--light-purple);
      border-radius: 25px 25px 0 0;
      overflow: hidden;
  }
</style>
