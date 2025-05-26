
import { defineStore } from 'pinia'

export const useBookStore = defineStore('book', {
  state: () => ({
    selectedBook: null
  }),
  actions: {
    setBook(book) {
      this.selectedBook = book
    }
  }
})
