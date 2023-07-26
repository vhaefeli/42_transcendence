import { defineStore } from "pinia";
import axios, { AxiosError } from "axios";

type User = {
  id: number
  isLogged: boolean
  username: string
  avatar_url: string
  friends: Friends[]
  invites: Invites[]
  twoFA_enabled: boolean
  status: string
  level: string
  rank: number
  nb_match: number
  nb_jeux: number
}

type Friends = {
  id: number
  username: string
  is_blocked: boolean
};

type Blocked = {
  id: number
  username: string
  is_friend: boolean
};

type Invites = {
  id: number
  username: string
};

type InvitesSent = {
  id: number
  username: string
};

type GameLog = {
  date: string
  Resul: string
};

type State = {
  user: User,
  friends: Friends[],
  invites: Invites[],
  invitesSent: InvitesSent[],
  blocked: Blocked[],
  gameLog: GameLog[],
};

export const useUserStore = defineStore("userStore", {
  state: (): State => ({
      user: {
        id: 0,
        isLogged: false,
        username: "",
        avatar_url: "",
        friends: [],
        invites: [],
        twoFA_enabled: false,
        status: "",
        level: "",
        rank: 0,
        nb_match: 0,
        nb_jeux: 0,
      },
      friends: [],
      invites: [],
      invitesSent: [],
      blocked: [],
      gameLog: [],
  }),
  actions: {
    // get user infos
    async getMe(access_token: string) {
        await axios({
          url: "/api/user/me",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.user = response.data
            this.user.isLogged = true
            console.log("me loaded")
            return true;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              console.log(
                `invalid access token: ${error.response.status} ${error.response.statusText}`
              );
              this.user.isLogged = false
            } else {
              console.log(`unexpected error: ${error.response.status} ${error.response.statusText}`)
            }
            return false;
          })
      },
      // get list of friends
      async getFriends(access_token: string) {
        await axios({
          url: "/api/user/friend/all",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.friends = response.data;
            console.log("loaded friends");
            return true;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              console.log(
                `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else {
              console.log(`unexpected error: ${error.response.status} ${error.response.statusText}`)
            }
            return false;
          });
      },
      // get list of friends
      async getInvites(access_token: string) {
        await axios({
          url: "/api/user/friend/invite/received",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.invites = response.data;
            console.log("loaded invites");
            return true;
          })
          .catch((error) => {
            if (error.response.status == 401) {
              console.log(
                `invalid access token: ${error.response.status} ${error.response.statusText}`
              );
              this.user.isLogged = false
            } else {
              console.error(
                `unexpected error: ${error.response.status} ${error.response.statusText}`
              );
            }
            return false;
          });
      },
      // get list of friends
      async getInvitesSent(access_token: string) {
        await axios({
          url: "/api/user/friend/invite/sent",
          method: "get",
          headers: { Authorization: `Bearer ${access_token}` },
        })
          .then((response) => {
            this.invitesSent = response.data;
            console.log("loaded sent invites");
            return true;
          })
          .catch((error) => {
            if (error.response?.status == 401) {
              console.log(
                `invalid access token: ${error.response.status} ${error.response.statusText}`
              );
              this.user.isLogged = false
            } else {
              console.error(
                `unexpected error: ${error.response?.status} ${error.response?.statusText}`
              );
            }
            return false;
          });
      },
      // accept a friend
      async acceptFriend(friendname: string, access_token: string) {
          await axios({
            url: `/api/user/friend/invite/accept/${friendname}`,
            method: "post",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log('loaded invitation')
              // update the friends list
              this.getFriends(access_token)
              // update pending list
              this.getInvites(access_token)
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else if (error.response.status == 404) {
                console.log(
                  `invitation not found: ${error.response.status} ${error.response.statusText}`
                );
              } else {
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              }
              return false;
            });
      },
      // delete invitation to deny
      async declineFriend(friendname: string, access_token: string) {
          await axios({
            url: `/api/user/friend/invite/${friendname}`,
            method: "delete",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log(`invitation from ${friendname} declined`)

              // update pending list
              this.getInvites(access_token)
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else if (error.response.status == 404) {
                console.log(
                  `invitation not found: ${error.response.status} ${error.response.statusText}`
                );
              } else {
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              }
              return false;
            });
      },
      // add a friend
      async addFriend(friendname: string, access_token: string) {
       await axios({
         url: `/api/user/friend/invite/${friendname}`,
         method: "post",
         headers: { Authorization: `Bearer ${access_token}` },
       })
         .then((response) => {
           // To execute when the request is successful
           this.getInvitesSent(access_token)
           console.log('loaded invitation')
           return true;
         })
         .catch((error) => {
          if (error.response?.status == 401) {
            console.log(
              `invalid access token: ${error.response.status} ${error.response.statusText}`
            );
            this.user.isLogged = false
          } else if (error.response?.status == 404) {
            console.log(
              `user not found: ${error.response.status} ${error.response.statusText}`
            );
          } else if (error.response?.status == 409) {
            console.log(
              `can't send invitation to this user: ${error.response.status} ${error.response.statusText}`
            );
          } else {
            console.error(
              `unexpected error: ${error.response?.status} ${error.response?.statusText}`
            );
          }
          return false;
         });
      },
      // delete a friend
      async delFriend(friendname: string, access_token: string) {
       await axios({
         url: `/api/user/friend/${friendname}`,
         method: "delete",
         headers: { Authorization: `Bearer ${access_token}` },
       })
         .then((response) => {
           // To execute when the request is successful

            // update the array
            this.friends = this.friends.filter(
              friend => friend.username !== friendname
            );
           console.log(`friend ${friendname} deleted`)
           return true;
         })
         .catch((error) => {
          if (error.response.status == 401) {
            console.log(
              `invalid access token: ${error.response.status} ${error.response.statusText}`
            );
            this.user.isLogged = false
          } else if (error.response.status == 404) {
            console.log(
              `friend not found: ${error.response.status} ${error.response.statusText}`
            );
          } else {
            console.error(
              `unexpected error: ${error.response.status} ${error.response.statusText}`
            );
          }
          return false;
         });
      },
        // list all blocked users
        async getBlockedUsers(access_token: string) {
          await axios({
            url: `/api/user/block`,
            method: "get",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              this.blocked = response.data;
              console.log('blocked users loaded')
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else {
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              }
              return false;
            });
        },
        // block a user
        async blockUser(username: string, access_token: string) {
          await axios({
            url: `/api/user/block/${username}`,
            method: "post",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log(`${username} is blocked`)
              this.getBlockedUsers(access_token)
              this.getFriends(access_token)
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else if (error.response.status == 404) {
                console.log(
                  `user to block not found: ${error.response.status} ${error.response.statusText}`
                );
              } else {
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              }
              return false;
            });
        },
        // unblock a user
        async unblockUser(username: string, access_token: string) {
          await axios({
            url: `/api/user/block/${username}`,
            method: "delete",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              // To execute when the request is successful
              console.log(`${username} is unblocked`)
              this.getBlockedUsers(access_token)
              this.getFriends(access_token)
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else if (error.response.status == 404) {
                console.log(
                  `user to unblock not found: ${error.response.status} ${error.response.statusText}`
                );
              } else {
                console.error(
                  `unexpected error: ${error.response.status} ${error.response.statusText}`
                );
              }
              return false;
            });
        },
    
        // get games history
        async getGameHistory(access_token: string) {
          await axios({
            url: "/api/player/log",
            method: "get",
            headers: { Authorization: `Bearer ${access_token}` },
          })
            .then((response) => {
              this.gameLog = response.data;
              console.log("loaded game history");
              return true;
            })
            .catch((error) => {
              if (error.response.status == 401) {
                console.log(
                  `invalid access token: ${error.response.status} ${error.response.statusText}`
                );
                this.user.isLogged = false
              } else {
                console.log(`unexpected error: ${error.response.status} ${error.response.statusText}`)
              }
              return false;
            });
        },

        // redirect to the profile of the user
        async redirectToMyProfile(access_token: string) {
          await this.getMe(access_token);
          this.router.push(`/user/${this.user.username}`);
        },

        // flush datas 
        flush() {
          console.log("cleaning user datas...")
          this.user = {
            id: 0,
            isLogged: false,
            username: "",
            avatar_url: "",
            friends: [],
            invites: [],
            twoFA_enabled: false,
            status: "",
            level: "",
            rank: 0,
            nb_match: 0,
            nb_jeux: 0,
          }
          this.friends = []
          this.invites = []
          this.invitesSent = []
          this.blocked = []
          this.gameLog = []
        },
    }
})
