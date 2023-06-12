import axios from 'axios'
import { defineStore } from 'pinia'

type Player = {
    username: string
    friends: object
  }

type State = {
    player: Player[]
    isRequestLoading: boolean
}

export const usePlayerStore = defineStore('playerStore', {
    state: (): State => ({
        player: [],
        isRequestLoading: false,
      }),
     actions: {
        async getUsers(): Promise<void> {
          let info = null
          try {
            const res = await axios.get('http://localhost:3000/user/all').then((response) => (info = response))
            const status = res.status
            console.log('req status: ' + status)
            this.player[0].friends = res.data
          } catch (e) {
            console.log(e)
          }
        },
        async getUserName(): Promise<void> {
            const promise: Promise<Player[]> = new Promise((resolve) => {
                resolve([
                    {
                        username: 'pouette',
                        friends: [
                            {id: 1, username: "kevin"},
                            {id: 2, username: "Sabine"}
                        ],
                    },
                ])
            })
            this.player = await promise
        },
    }
})
