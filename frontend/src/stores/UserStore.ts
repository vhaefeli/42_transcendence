import { defineStore } from "pinia";
import axios from "axios";

type State = {
  user: User
};

type Friends = {
  id: number
  username: string
  is_blocked: boolean
};

type From = {
  from: object
};

type Invites = {
  id: number
  invitations_received: From
};

interface User {
  id: number
  isLogged: boolean
  username: string
  avatar_url: string
  friends: Friends[]
  invites: Invites
  twoFA_enabled: false
  status: "OFFLINE"
}

export const useUserStore = defineStore("userStore", {
  state: (): State => ({
      user: {},
  }),
  actions: {
    // get user infos
    async getMe(access_token) {
        await axios({
          url: "/api/user/me",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.user = response.data;
            console.log("loaded profile");
          })
          .catch((error) => {
              console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`);
              alert('unexpected error with token!');
          });
      },
      // get list of friends
      async getFriends(access_token) {
        await axios({
          url: "/api/user/friends",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.user.friends = response.data;
            console.log("loaded friends");
          })
          .catch((error) => {
              console.error(`unexpected error: ${error.response.status} ${error.response.statusText}`)
          });
      },
      // get list of friends
      async getInvites(access_token) {
        await axios({
          url: "/api/invite/view",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.user.invites = response.data;
            console.log("loaded invites");
          })
          .catch((error) => {
            if (error.response.status == 401) {
              console.log(
                `invalid access token: ${error.response.status} ${error.response.statusText}`
              );
            } else
              console.error(
                `unexpected error: ${error.response.status} ${error.response.statusText}`
              );
          });
      },
      // accept a friend
      async acceptFriend(friendname, access_token) {
          await axios({
            url: `/api/invite/accept/${friendname}`,
            method: "post",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log('loaded invitation')
              console.log(`${response.status} + ${response.statusText}`);
              return true;
            })
            .catch((error) => {
              // To execute when the request fails
              if (error.response.status == 409)
                console.log(
                  `user already exists: ${error.response.status} ${error.response.statusText}`
                );
              else
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              return false;
            });
      },
      // add a friend
      async addFriend(friendname, access_token) {
       await axios({
         url: `/api/invite/${friendname}`,
         method: "post",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
       })
         .then((response) => {
           // To execute when the request is successful
           console.log('loaded invitation')
           console.log(`${response.status} + ${response.statusText}`);
           return true;
         })
         .catch((error) => {
           // To execute when the request fails
           if (error.response.status == 409)
             console.log(
               `user already exists: ${error.response.status} ${error.response.statusText}`
             );
           else
             console.error(
               `unexpected error: ${error.response.status} ${error.response.statusText}`
             );
           return false;
         });
      },
      // delete a friend
      async delFriend(friendname, access_token) {
       await axios({
         url: `/api/user/friend/${friendname}`,
         method: "delete",
         headers: { Authorization: `Bearer ${access_token}` },
       })
         .then((response) => {
           // To execute when the request is successful
           console.log(`friend ${friendname} deleted`)
           return true;
         })
         .catch((error) => {
           // To execute when the request fails
           if (error.response.status == 409)
             console.log(
               `user already exists: ${error.response.status} ${error.response.statusText}`
             );
           else
             console.error(
               `unexpected error: ${error.response.status} ${error.response.statusText}`
             );
           return false;
         });
      },
        // list all blocked users
        async listBlockedUsers(access_token) {
          await axios({
            url: `/api/user/block`,
            method: "get",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log('blocked users loaded')
              return true;
            })
            .catch((error) => {
              // To execute when the request fails
              if (error.response.status == 409)
                console.log(
                  `user already exists: ${error.response.status} ${error.response.statusText}`
                );
              else
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              return false;
            });
        },
        // block a user
        async blockUser(username, access_token) {
          await axios({
            url: `/api/user/block/${username}`,
            method: "post",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log('${username} is blocked')
              return true;
            })
            .catch((error) => {
              // To execute when the request fails
              if (error.response.status == 409)
                console.log(
                  `user already exists: ${error.response.status} ${error.response.statusText}`
                );
              else
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              return false;
            });
        },
        // unblock a user
        async unblockUser(username, access_token) {
          await axios({
            url: `/api/user/block/${username}`,
            method: "delete",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log('${username} is unblocked')
              return true;
            })
            .catch((error) => {
              // To execute when the request fails
              if (error.response.status == 409)
                console.log(
                  `user already exists: ${error.response.status} ${error.response.statusText}`
                );
              else
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              return false;
            });
        },
      
    }
})

// 401 > se délogger et rediriger vers le login
// gérer les erreurs