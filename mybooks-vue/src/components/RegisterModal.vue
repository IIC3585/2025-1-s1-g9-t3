<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-8 relative">
      <button class="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" @click="$emit('close')">×</button>

      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Registrarse</h2>

      <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <input
          type="text"
          v-model="name"
          placeholder="Nombre"
          class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          type="email"
          v-model="email"
          placeholder="Correo electrónico"
          class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <input
          type="password"
          v-model="password"
          placeholder="Contraseña"
          class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>

        <button
          type="submit"
          class="w-4/5 mx-auto bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Crear cuenta
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');

const handleRegister = async () => {
  error.value = '';
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Agrega el nombre al perfil de Firebase Auth
    await updateProfile(user, { displayName: name.value });

    // Guarda el usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name.value,
      email: email.value,
      createdAt: serverTimestamp()
    });

    userStore.setUser(user);
    $emit('close'); // Cerrar modal si todo funciona
  } catch (err) {
    error.value = err.message;
    console.error(err);
  }
};

const emit = defineEmits(['close']);
</script>
