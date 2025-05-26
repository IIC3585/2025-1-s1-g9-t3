
<template>
  <main v-if="book" class="p-8 max-w-5xl mx-auto font-sans space-y-10 bg-white rounded-xl shadow-lg mt-6">
    <button
      @click="router.back()"
      class="bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-xl hover:bg-gray-300 transition w-fit"
    >
      ← Volver
    </button>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Book cover -->
      <img
        v-if="book.volumeInfo?.imageLinks?.thumbnail"
        :src="book.volumeInfo.imageLinks.thumbnail"
        alt="Portada"
        class="w-40 h-auto object-cover rounded-md shadow"
      />

      <!-- Book details -->
      <div class="flex-1">
        <h1 class="text-4xl font-bold text-gray-900">{{ book.volumeInfo.title }}</h1>
        <h2 v-if="book.volumeInfo.subtitle" class="text-xl text-gray-600 italic mt-1">
          {{ book.volumeInfo.subtitle }}
        </h2>

        <p class="text-gray-800 mt-3">
          <strong>Autor:</strong> {{ book.volumeInfo.authors?.[0] || 'Desconocido' }}
        </p>
        <p class="text-gray-600 text-sm mt-1">
          <strong>Editorial:</strong> {{ book.volumeInfo.publisher || 'N/A' }}
          &nbsp;&bull;&nbsp;
          <strong>Publicado:</strong> {{ book.volumeInfo.publishedDate || 'N/A' }}
        </p>
        <p class="text-gray-600 text-sm mt-1">
          <strong>Páginas:</strong> {{ book.volumeInfo.pageCount || 'N/A' }}
        </p>

        <p
          v-if="book.volumeInfo.categories"
          class="mt-2 inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
        >
          {{ book.volumeInfo.categories[0] }}
        </p>

        <!-- Rating -->
        <div class="mt-4 flex items-center text-yellow-500 text-lg">
          <span v-for="i in 5" :key="i">
            {{ book.volumeInfo.averageRating && i < Math.round(book.volumeInfo.averageRating) ? '★' : '☆' }}
          </span>
          <span class="text-sm text-gray-600 ml-2">
            {{ book.volumeInfo.ratingsCount ? `(${book.volumeInfo.ratingsCount} reseñas)` : 'Sin reseñas' }}
          </span>
        </div>

        <!-- Purchase section -->
        <div v-if="book.saleInfo?.saleability === 'FOR_SALE'" class="mt-6">
          <p class="text-green-600 font-semibold text-lg">
            Precio: ${{ book.saleInfo.listPrice.amount }} {{ book.saleInfo.listPrice.currencyCode }}
          </p>
          <a
            :href="book.saleInfo.buyLink"
            target="_blank"
            class="mt-2 inline-block bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Comprar
          </a>
        </div>

        <!-- Preview link -->
        <a
          v-if="book.previewLink"
          :href="book.previewLink"
          target="_blank"
          class="mt-3 inline-block text-blue-500 underline text-sm hover:text-blue-700 transition"
        >
          Ver vista previa del libro →
        </a>

        <!-- Action buttons -->
        <div class="mt-6 flex gap-3 flex-wrap">
          <button
            @click="addBookToList('readBooks')"
            class="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
          >
            Agregar a Leídos
          </button>
          <button
            @click="recommendBook()"
            class="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
          >
            Recomendar
          </button>
          <button
            @click="addBookToList('toRead')"
            class="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Agregar a Quiero Leer
          </button>
        </div>
      </div>
    </div>

    <!-- Description -->
    <section class="bg-gray-50 p-6 rounded-md shadow-sm">
      <h2 class="text-2xl font-semibold text-gray-800 mb-3">Descripción</h2>
      <p class="text-gray-700 leading-relaxed text-justify">
        {{ book.volumeInfo.description || 'Sin descripción disponible.' }}
      </p>
    </section>
  </main>

  <p v-else class="text-gray-600 p-8 text-center">Cargando detalles del libro...</p>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase'
import { currentUser } from '@/authUser'
import { setDoc, getDoc, addDoc, doc, collection } from 'firebase/firestore'

const book = ref(null)
const router = useRouter()

onMounted(() => {
  const stored = localStorage.getItem('selectedBook')
  if (!stored) {
    router.push('/')
  } else {
    book.value = JSON.parse(stored)
  }
})

const addBookToList = async (listName) => {
  const user = auth.currentUser
  if (!user) {
    alert('Debes iniciar sesión para agregar libros.')
    return
  }

  const userId = user.uid
  const volumeInfo = book.value.volumeInfo
  const bookId = book.value.id

  const bookData = {
    title: volumeInfo.title,
    author: volumeInfo.authors?.[0] || 'Desconocido',
    year: volumeInfo.publishedDate?.slice(0, 4) || 'N/A',
    image: volumeInfo.imageLinks?.thumbnail || null
  }

  try {
    if (listName === 'recommended') {
      await addDoc(collection(db, 'recommended'), {
        ...bookData,
        recommendedBy: user.displayName || user.email
      })
      alert('Libro recomendado por ti y visible para todos los usuarios.')
    } else {
      const docRef = doc(db, `users/${userId}/${listName}`, bookId)
      const existing = await getDoc(docRef)
      if (existing.exists()) {
        alert('Este libro ya está en tu lista.')
        return
      }
      await setDoc(docRef, bookData)
      alert(`Libro agregado a la lista "${listName}"`)
    }
  } catch (err) {
    console.error('Error guardando libro:', err)
    alert('Hubo un problema al guardar el libro.')
  }
}

const recommendBook = async () => {
  addBookToList('recommended')
}
</script>
