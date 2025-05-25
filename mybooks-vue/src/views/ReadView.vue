<template>
  <main class="p-8 font-sans max-w-5xl mx-auto">
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-8">
      <div class="text-2xl font-bold flex items-center gap-4">
        <router-link to="/home" class="flex items-center gap-2">
          <img src="../assets/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto" />
          MyBooks
        </router-link>
      </div>
      <div>
        <span v-if="user" class="mr-4">Bienvenido, {{ user.displayName || user.email }}</span>
        <button v-if="user" @click="logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Cerrar sesión
        </button>
        <span v-else class="text-gray-600">No has iniciado sesión.</span>
      </div>
    </nav>

    <section>
      <h1 class="text-2xl font-bold mb-4">Libros Leídos</h1>

      <ul v-if="readBooks.length" class="space-y-4">
        <li v-for="book in readBooks" :key="book.id" class="p-4 border rounded-xl shadow-md flex gap-4 items-start">
          <img
            v-if="book.image"
            :src="book.image"
            :alt="`Portada de ${book.title}`"
            class="w-24 h-auto object-cover rounded-md"
          />
          <div v-else class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
            Sin imagen
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ book.title }}</h2>
            <p class="text-gray-700">Autor: {{ book.author }}</p>
            <p class="text-gray-500 text-sm">Publicado en {{ book.year }}</p>
          </div>
          <div class="mt-2 flex flex-col gap-2">
            <button @click="moveBook(book, 'recommended')" class="text-blue-600 hover:underline text-sm">
              Recomendar
            </button>
            <button @click="moveBook(book, 'toRead')" class="text-green-600 hover:underline text-sm">
              Agregar a leer después
            </button>
            <button @click="removeBook(book.id)" class="text-red-600 hover:underline text-sm">
              Eliminar
            </button>
          </div>
        </li>
      </ul>

      <p v-else>No has marcado libros como leídos todavía.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '@/firebase'; // Asegúrate de que la ruta es correcta
import { signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const router = useRouter();
const user = ref(null);
const readBooks = ref([]);

onAuthStateChanged(auth, async (u) => {
  if (u) {
    user.value = u;
    await loadBooks();
  }
});

async function loadBooks() {
  const userId = user.value.uid;
  const snapshot = await getDocs(collection(db, 'users', userId, 'readBooks'));
  readBooks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function moveBook(book, targetList) {
  const userId = user.value.uid;

  if (targetList === 'recommended') {
    await setDoc(doc(db, targetList, book.id), {
      ...book,
      recommendedBy: user.value.displayName || user.value.email
    });
  } else {
    await setDoc(doc(db, 'users', userId, targetList, book.id), book);
  }
}

async function removeBook(bookId) {
  const userId = user.value.uid;
  await deleteDoc(doc(db, 'users', userId, 'readBooks', bookId));
  readBooks.value = readBooks.value.filter(b => b.id !== bookId);
}

async function logout() {
  await signOut(auth);
  router.push('/');
}
</script>
