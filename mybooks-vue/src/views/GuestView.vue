<template>
  <div class="p-8 font-sans max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Modo Invitado</h1>
    <p class="text-gray-600">Estás navegando como invitado. Algunas funciones están limitadas.</p>
    <button @click="router.push('/')" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
      Volver al inicio
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>