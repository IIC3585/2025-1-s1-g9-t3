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

    <h1 class="text-3xl font-bold mb-6">Libros que planeas leer</h1>

    <div v-if="toRead.length">
      <ul class="space-y-4">
        <li
          v-for="book in toRead"
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
          </div>
          <div class="mt-2 flex flex-col gap-2">
            <button @click="moveBook(book, 'readBooks')" class="text-blue-600 hover:underline text-sm">Leído</button>
            <button @click="moveBook(book, 'recommended')" class="text-green-600 hover:underline text-sm">Recommended</button>
            <button @click="removeBook(book.id)" class="text-red-600 hover:underline text-sm">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>
    <p v-else>No hay libros que planeas leer todavía.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // Ajusta la ruta
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();
const user = userStore.user;

const toRead = ref([]);
const currentUser = ref(user?.displayName || user?.email || '');

const loadBooks = async () => {
  if (!user) return;
  const booksRef = collection(db, 'users', user.uid, 'toRead');
  const snapshot = await getDocs(booksRef);
  toRead.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

onMounted(loadBooks);

const moveBook = async (book, targetList) => {
  const userId = user.uid;

  if (targetList === 'recommended') {
    await setDoc(doc(db, 'recommended', book.id), {
      ...book,
      recommendedBy: currentUser.value
    });
  } else {
    await setDoc(doc(db, 'users', userId, targetList, book.id), book);
    await deleteDoc(doc(db, 'users', userId, 'toRead', book.id));
    toRead.value = toRead.value.filter(b => b.id !== book.id);
  }
};

const removeBook = async (bookId) => {
  const userId = user.uid;
  await deleteDoc(doc(db, 'users', userId, 'toRead', bookId));
  toRead.value = toRead.value.filter(b => b.id !== bookId);
};

const closeSession = async () => {
  await signOut(auth);
  router.push('/');
};
</script>
