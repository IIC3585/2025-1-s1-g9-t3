import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initializeAuthListener } from './firebase'

// Create the app
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Initialize Firebase auth listener
initializeAuthListener()

// Use Vue Router
app.use(router)

// Mount the app
app.mount('#app')
