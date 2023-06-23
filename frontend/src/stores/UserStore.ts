import { defineStore } from "pinia";
import axios from "axios";

type State = {
  user: User
};

type Friends = {
  id: number
  username: string
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
      // get list of friends
      async getFriends(access_token) {
        await axios({
          url: "/api/user/friends",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.user.firends = response.data;
            console.log("loaded friends");
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
      
    }
})

