<template>
  <div class="p-8 font-sans max-w-5xl mx-auto">
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-6">
      <div class="text-2xl font-bold flex items-center gap-4">
        <router-link to="/home" class="flex items-center gap-2">
          <img src="../assets/logo.svg" alt="MyBooks Logo" class="h-10 w-auto" />
          MyBooks
        </router-link>
      </div>
      <div>
        <span v-if="user" class="mr-4">Bienvenido, {{ user.displayName || user.email }}</span>
        <button
          v-if="user"
          @click="closeSession"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>

    <h1 class="text-3xl font-bold mb-6">Libros Recomendados</h1>

    <div v-if="recommended.length">
      <ul class="space-y-4">
        <li
          v-for="book in recommended"
          :key="book.id"
          class="p-4 border rounded-xl shadow-md flex gap-4 items-start"
        >
          <img
            v-if="book.image"
            :src="book.image"
            :alt="'Portada de ' + book.title"
            class="w-24 h-auto object-cover rounded-md"
          />
          <div v-else class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
            Sin imagen
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ book.title }}</h2>
            <p class="text-gray-700">Autor: {{ book.author }}</p>
            <p class="text-gray-500 text-sm">Publicado en {{ book.year }}</p>
            <p class="text-gray-500 text-sm">Recomendado por: {{ book.recommendedBy }}</p>
          </div>
          <div class="mt-2 flex flex-col gap-2">
            <button @click="moveBook(book, 'readBooks')" class="text-blue-600 hover:underline text-sm">Leído</button>
            <button @click="moveBook(book, 'toRead')" class="text-green-600 hover:underline text-sm">Leer después</button>
            <div v-if="user.displayName === book.recommendedBy" class="mt-2">
              <button @click="removeBook(book.id)" class="text-red-600 hover:underline text-sm">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <p v-else>No hay libros recomendados todavía.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // Ajusta la ruta según tu estructura
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useUserStore } from '../store/user'; // o donde esté tu sistema de autenticación

const router = useRouter();
const userStore = useUserStore();
const user = userStore.user;

const recommended = ref([]);

const loadBooks = async () => {
  const snapshot = await getDocs(collection(db, 'recommended'));
  recommended.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

onMounted(() => {
  if (user) {
    loadBooks();
  }
});

const moveBook = async (book, targetList) => {
  const userId = user.uid;
  await setDoc(doc(db, 'users', userId, targetList, book.id), book);
};

const removeBook = async (bookId) => {
  await deleteDoc(doc(db, 'recommended', bookId));
  recommended.value = recommended.value.filter(b => b.id !== bookId);
};

const closeSession = async () => {
  await signOut(auth);
  router.push('/');
};
</script>
