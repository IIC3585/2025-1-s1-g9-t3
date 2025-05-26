
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCgLlLgdGE7Y3IBxJAyMbVnA6i9aBUIIdA",
  authDomain: "mybooks-e4a30.firebaseapp.com",
  projectId: "mybooks-e4a30",
  storageBucket: "mybooks-e4a30.firebasestorage.app",
  messagingSenderId: "421221868497",
  appId: "1:421221868497:web:f323c4151ba533ca2af6f0"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
