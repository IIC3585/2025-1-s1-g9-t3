<template>
  <div class="p-8 font-sans max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Búsqueda Avanzada</h1>
    <p class="text-gray-600">Esta página permitirá realizar búsquedas avanzadas de libros.</p>
    <button @click="router.push('/home')" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
      Volver al inicio
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>