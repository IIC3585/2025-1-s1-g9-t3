
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

    <!-- Libros Recomendados -->
    <section>
      <h1 class="text-2xl font-bold mb-4">Libros Recomendados</h1>

      <ul v-if="recommended.length" class="space-y-4">
        <li v-for="book in recommended" :key="book.id" class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
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
            <p class="text-gray-500 text-sm">Recomendado por: {{ book.recommendedBy?.join(', ') }}</p>
          </div>

          <!-- Botones -->
          <div class="mt-2 flex flex-col gap-2">
            <button @click="moveBook(book, 'readBooks')" class="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition">
              Marcar como Leído
            </button>

            <button v-if="book.recommendedBy?.includes(user.email)" @click="removeRecommendation(book.id)"
              class="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition">
              Quitar recomendación
            </button>

            <button v-else @click="recommend(book)" class="bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-600 transition">
              Recomendar
            </button>

            <button @click="moveBook(book, 'toRead')" class="bg-blue-500 text-white px-3 py-1 rounded-xl hover:bg-blue-600 transition">
              Leer después
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="text-gray-600">No hay libros recomendados todavía.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { currentUser } from '@/authUser'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

const router = useRouter()
const user = ref(null)
const recommended = ref([])

onMounted(() => {
  user.value = currentUser.value
  if (user.value) loadBooks()
})

watch(currentUser, (u) => {
  user.value = u
  if (u && recommended.value.length === 0) loadBooks()
})

const loadBooks = async () => {
  const snapshot = await getDocs(collection(db, 'recommended'))
  recommended.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
}

const recommend = async (book) => {
  const docRef = doc(db, 'recommended', book.id)
  const snap = await getDoc(docRef)
  const email = user.value.email
  if (snap.exists()) {
    const data = snap.data()
    if ((data.recommendedBy || []).includes(email)) {
      alert('Ya has recomendado este libro.')
      return
    }
    await setDoc(docRef, {
      ...data,
      recommendedBy: [...data.recommendedBy, email]
    })
  } else {
    await setDoc(docRef, {
      ...book,
      recommendedBy: [email]
    })
  }
  loadBooks()
}

const removeRecommendation = async (bookId) => {
  const docRef = doc(db, 'recommended', bookId)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return

  const data = snap.data()
  const email = user.value.email
  const updatedList = (data.recommendedBy || []).filter(e => e !== email)

  if (updatedList.length === 0) {
    await deleteDoc(docRef)
  } else {
    await setDoc(docRef, {
      ...data,
      recommendedBy: updatedList
    })
  }

  recommended.value = recommended.value
    .map(b => b.id === bookId ? { ...b, recommendedBy: updatedList } : b)
    .filter(b => b.recommendedBy?.length > 0)
}
</script>
