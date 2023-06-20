import axios from "axios";
import { defineStore } from "pinia";

type Me = {
  id: number;
  username: string;
  access_token: string;
  avatar_url: string;
};

type State = {
  isLoggedIn: boolean;
  user: Me;
};

type Payload = {
  username: string;
  password: string;
};

export const useLoginStore = defineStore("LoginStore", {
  state: (): State => ({
    isLoggedIn: false,
    user: { id: 0, username: "", access_token: "", avatar_url: "" },
  }),
  actions: {
    async CreateUser(payload: Payload): Promise<boolean> {
      if (!payload.username.length || !payload.username.length) {
        console.log("Credentials are missing");
        return false;
      }

      await axios({
        url: "/api/user/new",
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: payload,
      })
        .then((response) => {
          // To execute when the request is successful
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

      //To execute whether the request succeeds or fails
      return true;
    },

    async LogIn(payload: Payload, createUser = false): Promise<boolean> {
      if (createUser) await this.CreateUser(payload);
      await axios({
        url: "/api/auth/login",
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: payload,
      })
        .then((response) => {
          this.user.username = payload.username;
          this.user.access_token = response.data.access_token;
          this.isLoggedIn = true;
          console.log("successfully logged in");
          this.LoadProfile();
          return true;
        })
        .catch((error) => {
          this.isLoggedIn = false;
          if (error.response.status == 401)
            console.log(
              `invalid credentials: ${error.response.status} ${error.response.statusText}`
            );
          else
            console.error(
              `unexpected error: ${error.response.status} ${error.response.statusText}`
            );
          return false;
        });
      return true;
    },

    async LoadProfile() {
      if (!this.isLoggedIn) {
        console.log("user is not logged in");
        return;
      }

      await axios({
        url: `/api/user/profile/${this.user.username}`,
        method: "get",
        headers: { Authorization: `Bearer ${this.user.access_token}` },
      })
        .then((response) => {
          this.user.id = response.data.id;
          this.user.username = response.data.username;
          this.user.avatar_url = response.data.avatar_url;
          console.log("loaded profile");
          console.log(this.user);
        })
        .catch((error) => {
          if (error.response.status == 401) {
            console.log(
              `invalid access token: ${error.response.status} ${error.response.statusText}`
            );
            this.LogOut();
          } else
            console.error(
              `unexpected error: ${error.response.status} ${error.response.statusText}`
            );
        });
    },

    LogOut() {
      this.user = { id: 0, username: "", access_token: "", avatar_url: "" };
      this.isLoggedIn = false;
    },
  },
});
