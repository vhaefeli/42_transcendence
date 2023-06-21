import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("userStore", {
  state: () => {
    return {
      user: {} as User,
      isRequestLoading: false as boolean,
    }
  },
  actions: {
    // https://pinia.vuejs.org/core-concepts/actions.html
    async registerUser(login, access_token) {
     this.isRequestLoading = true
      try {
        this.user = await axios.get(`api/user/profile/${login}`, {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
      } catch (e) {
        console.log(e.response.status + " " + e.code);
      }
      this.isRequestLoading = false 
    }
  },
  persist: true
})

interface User {
  id: number
  isLogged: boolean
  username: string
  avatar_url: string
  friends: object
  is_friend: boolean
}