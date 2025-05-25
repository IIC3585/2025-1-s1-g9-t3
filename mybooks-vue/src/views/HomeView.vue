<template>
  <main class="p-8 font-sans max-w-5xl mx-auto">
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-6">
      <div class="text-2xl font-bold flex items-center gap-4">
        <a href="/" class="flex items-center gap-2">
          <img src="@/assets/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto" />
          MyBooks
        </a>
      </div>
      <div>
        <span v-if="userStore.user" class="mr-4">Bienvenido, {{ currentUser }}</span>
        <button
          v-if="userStore.user"
          @click="closeSession"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
        <span v-else class="text-gray-600">No has iniciado sesión.</span>
      </div>
    </nav>

    <section class="mb-8 flex gap-4 justify-center">
      <button
        v-for="list in lists"
        :key="list.route"
        @click="router.push(list.route)"
        :class="[
          'px-6 py-3 rounded-md font-semibold text-white transition',
          list.name.includes('Leídos') ? 'bg-green-600 hover:bg-green-700' : '',
          list.name.includes('Recomendados') ? 'bg-yellow-600 hover:bg-yellow-700' : '',
          list.name.includes('Quiero Leer') ? 'bg-blue-600 hover:bg-blue-700' : ''
        ]"
      >
        {{ list.name }}
      </button>
    </section>

    <section>
      <h2 class="text-2xl font-bold mb-4">Buscar Libros</h2>

      <div class="mb-4">
        <input
          type="text"
          v-model="query"
          placeholder="Buscar libros..."
          class="border p-2 w-full mb-2 rounded"
          @keydown.enter="searchBooks"
        />
        <button
          @click="searchBooks"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Buscar
        </button>
      </div>

      <ul v-if="results.length > 0" class="space-y-4">
        <li v-for="book in results" :key="book.id" class="p-4 border rounded-xl shadow-md flex gap-4 items-start">
          <img
            v-if="book.volumeInfo.imageLinks?.thumbnail"
            :src="book.volumeInfo.imageLinks.thumbnail"
            :alt="'Portada de ' + book.volumeInfo.title"
            class="w-24 h-auto object-cover rounded-md"
          />
          <div v-else class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
            Sin imagen
          </div>

          <div class="flex-1">
            <h3 class="text-xl font-semibold">{{ book.volumeInfo.title }}</h3>
            <p class="text-gray-700">Autor: {{ book.volumeInfo.authors?.[0] || 'Desconocido' }}</p>
            <p class="text-gray-500 text-sm">Publicado en {{ book.volumeInfo.publishedDate?.slice(0, 4) || 'N/A' }}</p>
            <div class="mt-2 flex gap-2 flex-wrap">
              <button
                @click="addBookToList(book, 'readBooks')"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Agregar a Leídos
              </button>
              <button
                @click="addBookToList(book, 'recommended')"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Recomendar
              </button>
              <button
                @click="addBookToList(book, 'want_to_read')"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const currentUser = computed(() => {
  if (userStore.user) {
    return userStore.user.displayName || userStore.user.email;
  }
  return '';
});

// Las tres listas como botones
const lists = [
  { name: '📘 Leídos', route: '/read' },
  { name: '📙 Recomendados', route: '/recommended' },
  { name: '📗 Quiero Leer', route: '/want_to_read' }
];

const query = ref('');
const results = ref([]);

const searchBooks = async () => {
  if (!query.value.trim()) {
    results.value = [];
    return;
  }
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query.value)}`);
    const data = await res.json();
    results.value = data.items || [];
  } catch (error) {
    console.error('Error buscando libros:', error);
    results.value = [];
  }
};

const addBookToList = async (book, listName) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return alert("Debes iniciar sesión para agregar libros.");

  const volumeInfo = book.volumeInfo;
  const bookData = {
    title: volumeInfo.title,
    author: volumeInfo.authors?.[0] || 'Desconocido',
    year: volumeInfo.publishedDate?.slice(0, 4) || 'N/A',
    image: volumeInfo.imageLinks?.thumbnail || null
  };

  try {
    await addDoc(collection(db, `users/${userId}/${listName}`), bookData);
    alert(`Libro agregado a la lista "${listName}"`);
  } catch (error) {
    console.error('Error agregando libro:', error);
    alert('No se pudo agregar el libro, intenta más tarde.');
  }
};

const closeSession = async () => {
  await signOut(auth);
  userStore.clearUser();
  router.push('/');
};
</script>

<style scoped>
main {
  background: #f9fafb;
  min-height: 100vh;
}
</style>
