
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    results: [],
    query: ''
  }),
  actions: {
    setResults(results) {
      this.results = results
    },
    setQuery(query) {
      this.query = query
    }
  }
})
