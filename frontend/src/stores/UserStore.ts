import { defineStore } from "pinia";
import axios from "axios";

type State = {
  user: User;
  isRequestLoading: boolean;
};

export const useUserStore = defineStore("userStore", {
  state: (): State => {
      user: {}
      isRequestLoading: false
  },
  actions: {
    // get request with acess token to backend to stock user infos in the Store
    async getUserInfosFromBack(access_token) {
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
              // LogOut(); TO DO
            } else
              console.error(
                `unexpected error: ${error.response.status} ${error.response.statusText}`
              );
          });
      }
    }
})

interface User {
  id: number
  isLogged: boolean
  username: string
  avatar_url: string
  friends: object
  twoFA_enabled: false
  status: "OFFLINE"
}
