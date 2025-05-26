
import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    init() {
      onAuthStateChanged(auth, (u) => {
        this.user = u
      })
    },
    setUser(user) {
      this.user = user
    },
    logout() {
      this.user = null
    }
  }
})
