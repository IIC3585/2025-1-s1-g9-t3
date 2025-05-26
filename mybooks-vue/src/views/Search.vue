
<template>
  <main class="p-8 font-sans max-w-5xl mx-auto bg-gray-50 min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-6 rounded-xl">
      <div class="text-2xl font-bold flex items-center gap-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <img src="/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto max-h-20" />
          MyBooks
        </RouterLink>
      </div>
      <div>
        <span v-if="user" class="mr-4 text-xl">Bienvenido, {{ displayName }}</span>
        <button
          v-if="user"
          @click="closeSession"
          class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
        <span v-else class="text-gray-600">No has iniciado sesión.</span>
      </div>
    </nav>

    <!-- Lista de accesos -->
    <section class="mb-8 flex gap-4 justify-center">
      <RouterLink
        v-for="list in lists"
        :key="list.name"
        :to="list.route"
        class="px-6 py-3 rounded-xl font-semibold text-white transition"
        :class="{
          'bg-green-600 hover:bg-green-700': list.name.includes('Leídos'),
          'bg-yellow-600 hover:bg-yellow-700': list.name.includes('Recomendados'),
          'bg-blue-600 hover:bg-blue-700': list.name.includes('Quiero Leer')
        }"
      >
        {{ list.name }}
      </RouterLink>
    </section>

    <!-- Buscador -->
    <section>
      <h2 class="text-2xl font-bold mb-4">Buscar Libros</h2>

      <div class="mb-4">
        <input
          v-model="query"
          @keydown.enter="searchBooks"
          type="text"
          placeholder="Buscar libros..."
          class="border p-2 w-full mb-2 rounded-lg"
        />

        <div class="flex justify-between flex-wrap gap-2">
          <button
            @click="searchBooks"
            class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Buscar
          </button>
          <button
            v-if="results.length"
            @click="clearResults"
            class="bg-gray-300 text-gray-800 px-4 py-1 rounded-xl hover:bg-gray-400 transition"
          >
            X
          </button>
        </div>
      </div>

      <ul v-if="results.length" class="space-y-4">
        <li v-for="book in results" :key="book.id" class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
          <img
            v-if="book.volumeInfo.imageLinks?.thumbnail"
            :src="book.volumeInfo.imageLinks.thumbnail"
            :alt="'Portada de ' + book.volumeInfo.title"
            class="w-24 h-full object-cover rounded-md cursor-pointer hover:bg-gray-50"
            @click="viewBookDetails(book)"
          />
          <div v-else class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
            Sin imagen
          </div>

          <div class="flex-1">
            <div class="cursor-pointer" @click="viewBookDetails(book)">
              <h3 class="text-xl font-semibold">{{ book.volumeInfo.title }}</h3>
              <div class="flex items-center text-yellow-500 text-lg">
                <span v-for="i in 5" :key="i">{{ i <= Math.round(book.volumeInfo.averageRating || 0) ? '★' : '☆' }}</span>
                <span class="text-sm text-gray-600 ml-2">
                  {{ book.volumeInfo.ratingsCount ? '(' + book.volumeInfo.ratingsCount + ' reseñas)' : 'Sin reseñas' }}
                </span>
              </div>
              <p class="text-gray-700">Autor: {{ book.volumeInfo.authors?.[0] || 'Desconocido' }}</p>
              <p class="text-gray-500 text-sm">Publicado en {{ book.volumeInfo.publishedDate?.slice(0, 4) || 'N/A' }}</p>
            </div>

            <div class="mt-2 flex gap-2 flex-wrap">
              <button @click="addBookToList(book, 'readBooks')" class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600">
                Agregar a Leídos
              </button>
              <button @click="recommend(book)" class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">
                Recomendar
              </button>
              <button @click="addBookToList(book, 'toRead')" class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                Agregar a Quiero Leer
              </button>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="text-gray-600">No hay resultados aún. Busca un libro arriba.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase'
import { signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const router = useRouter()

const query = ref('')
const results = ref([])
const user = ref(null)
const displayName = ref('')

const lists = [
  { name: 'Leídos', route: '/read' },
  { name: 'Recomendados', route: '/recommended' },
  { name: 'Quiero Leer', route: '/toRead' }
]

onMounted(() => {
  user.value = auth.currentUser
  displayName.value = user.value?.displayName || user.value?.email || ''
})

const searchBooks = async () => {
  if (!query.value.trim()) {
    results.value = []
    return
  }
  try {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(query.value))
    const data = await res.json()
    results.value = data.items || []
  } catch (err) {
    console.error('Error buscando libros:', err)
    results.value = []
  }
}

const addBookToList = async (book, listName) => {
  const userId = auth.currentUser?.uid
  if (!userId) return alert('Debes iniciar sesión para agregar libros.')
  const bookId = book.id
  try {
    const ref = doc(db, 'users/' + userId + '/' + listName, bookId)
    const docSnap = await getDoc(ref)
    if (docSnap.exists()) {
      alert('Este libro ya está en tu lista.')
      return
    }
    await setDoc(ref, book)
    alert('Libro agregado a la lista "' + listName + '"')
  } catch (err) {
    console.error(err)
    alert('No se pudo agregar el libro.')
  }
}

const recommend = async (book) => {
  const bookId = book.id
  const docRef = doc(db, 'recommended', bookId)
  const snap = await getDoc(docRef)
  const userEmail = displayName.value

  if (snap.exists()) {
    const data = snap.data()
    const already = (data.recommendedBy || []).includes(userEmail)
    if (already) return alert('Ya has recomendado este libro.')
    await setDoc(docRef, {
      ...data,
      recommendedBy: [...data.recommendedBy, userEmail]
    })
  } else {
    await setDoc(docRef, {
      ...book,
      recommendedBy: [userEmail]
    })
  }
  alert('Libro recomendado correctamente.')
}

const viewBookDetails = (book) => {
  localStorage.setItem('selectedBook', JSON.stringify(book))
  router.push('/book')
}

const closeSession = async () => {
  await signOut(auth)
  router.push('/')
}

const clearResults = () => {
  query.value = ''
  results.value = []
}
</script>
