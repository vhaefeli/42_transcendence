import axios from "axios";
import { defineStore } from "pinia";

type Player = {
  username: string;
  friends: object;
};

type State = {
  player: Player[];
  isRequestLoading: boolean;
};

export const usePlayerStore = defineStore("playerStore", {
  state: (): State => ({
    player: [],
    isRequestLoading: false,
  }),
  actions: {
    async getUsers(): Promise<void> {
      try {
        const response = await axios
          .get("/api/user/all")
        console.log("req status: " + response.status);
        this.player[0].friends = response.data;
      } catch (e) {
        console.log(e);
      }
    },
    async getUserName(): Promise<void> {
      const promise: Promise<Player[]> = new Promise((resolve) => {
        resolve([
          {
            username: "pouette",
            friends: [
              { id: 1, username: "kevin" },
              { id: 2, username: "Sabine" },
            ],
          },
        ]);
      });
      this.player = await promise;
    },
  },
});
