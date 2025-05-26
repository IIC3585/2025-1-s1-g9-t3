
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-gray-50 rounded-xl shadow-xl w-full max-w-md p-8 relative">
      <button class="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" @click="$emit('close')">×</button>
      <h2 class="text-2xl font-bold mb-6 text-center">¿Cómo quieres comenzar?</h2>
      <div class="flex flex-col gap-4">
        <button
          @click="$emit('login')"
          class="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition w-8/10 mx-auto"
        >
          Iniciar sesión
        </button>
        <button
          @click="$emit('register')"
          class="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition w-8/10 mx-auto"
        >
          Registrarse
        </button>
      </div>
    </div>
  </div>
</template>
