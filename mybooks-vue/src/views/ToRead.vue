
<template>
  <main class="p-8 font-sans bg-gray-50 min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-6 rounded-xl">
      <div class="text-2xl font-bold flex items-center gap-4">
        <RouterLink to="/home" class="flex items-center gap-2">
          <img src="/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto max-h-20" />
          MyBooks
        </RouterLink>
      </div>
      <div>
        <span v-if="user" class="mr-4">Bienvenido, {{ user.displayName || user.email }}</span>
        <button
          v-if="user"
          @click="logout"
          class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
        <span v-else class="text-gray-600">No has iniciado sesión.</span>
      </div>
    </nav>

    <!-- Libros por Leer -->
    <section>
      <h1 class="text-2xl font-bold mb-4">Libros por Leer</h1>

      <ul v-if="books.length" class="space-y-4">
        <li v-for="book in books" :key="book.id" class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
          <!-- Imagen -->
          <img
            v-if="book.volumeInfo?.imageLinks?.thumbnail || book.image"
            :src="book.volumeInfo?.imageLinks?.thumbnail || book.image"
            :alt="'Portada de ' + (book.volumeInfo?.title || book.title)"
            class="w-24 h-full object-cover rounded-md cursor-pointer"
            @click="viewBookDetails(book)"
          />
          <div v-else class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
            Sin imagen
          </div>

          <!-- Detalles -->
          <div class="flex-1 cursor-pointer" @click="viewBookDetails(book)">
            <h2 class="text-xl font-semibold">{{ book.volumeInfo?.title || book.title }}</h2>
            <div class="flex items-center text-yellow-500 text-lg mt-1">
              <span v-for="i in 5" :key="i">
                {{ book.volumeInfo?.averageRating && i < Math.round(book.volumeInfo.averageRating) ? '★' : '☆' }}
              </span>
              <span class="text-sm text-gray-600 ml-2">
                {{ book.volumeInfo?.ratingsCount ? '(' + book.volumeInfo.ratingsCount + ' reseñas)' : 'Sin reseñas' }}
              </span>
            </div>
            <p class="text-gray-700 mt-1">Autor: {{ book.volumeInfo?.authors?.[0] || book.author }}</p>
            <p class="text-gray-500 text-sm">Publicado en {{ book.volumeInfo?.publishedDate?.slice(0, 4) || book.year || 'N/A' }}</p>
          </div>

          <!-- Botones -->
          <div class="mt-2 flex flex-col gap-2">
            <button @click="moveBook(book, 'readBooks')" class="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition">
              Marcar como Leído
            </button>
            <button @click="moveBook(book, 'recommended')" class="bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-600 transition">
              Recomendar
            </button>
            <button @click="removeBook(book.id)" class="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition">
              Eliminar
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="text-gray-600">No has guardado libros para leer todavía.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { currentUser } from '@/authUser'
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'

const router = useRouter()
const user = ref(null)
const books = ref([])

onMounted(() => {
  user.value = currentUser.value
  if (user.value) loadBooks()
})

watch(currentUser, (u) => {
  user.value = u
  if (u && books.value.length === 0) loadBooks()
})

const loadBooks = async () => {
  const snapshot = await getDocs(collection(db, 'users', user.value.uid, 'toRead'))
  books.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

const logout = async () => {
  await signOut(auth)
  router.push('/')
}

const viewBookDetails = (book) => {
  localStorage.setItem('selectedBook', JSON.stringify(book))
  router.push('/book')
}

const moveBook = async (book, targetList) => {
  if (!user.value) return
  await setDoc(doc(db, 'users', user.value.uid, targetList, book.id), book)
  await deleteDoc(doc(db, 'users', user.value.uid, 'toRead', book.id))
  books.value = books.value.filter(b => b.id !== book.id)
}

const removeBook = async (bookId) => {
  if (!user.value) return
  await deleteDoc(doc(db, 'users', user.value.uid, 'toRead', bookId))
  books.value = books.value.filter(b => b.id !== bookId)
}
</script>
