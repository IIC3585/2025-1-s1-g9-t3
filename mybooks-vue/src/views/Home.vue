
<template>
  <section class="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-orange-200 flex flex-col justify-between font-sans">
    <!-- Hero -->
    <div class="flex justify-center mt-16 sm:mt-1 px-4">
      <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 sm:-translate-x-10 text-center sm:text-left">
        <img src="/logo.svg" alt="MyBooks Logo" class="max-h-32 sm:max-h-40 md:max-h-48 w-auto" />
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">My Books</h1>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 sm:px-10 mt-14 text-gray-700 text-center max-w-7xl mx-auto">
      <FeatureCard icon="🔍" title="Explora y opina sobre libros" description="Descubre nuevos títulos, ve las reseñas y comparte tu opinión con otros lectores." />
      <FeatureCard icon="📖" title="Lleva el registro de tu lectura" description="Marca los libros que ya leíste, los que te interesan y observa tu progreso." />
      <FeatureCard icon="🌐" title="Accede desde cualquier dispositivo" description="Tu biblioteca siempre estará sincronizada entre dispositivos y respaldada en la nube." />
    </div>

    <!-- Call to Action -->
    <div class="text-center mt-12 mb-16 px-4">
      <button
        class="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:bg-amber-700 transform hover:scale-105 transition-transform duration-300 w-full sm:w-auto cursor-pointer"
        @click="goToAuth">
        Comenzar ahora
      </button>
    </div>

    <!-- Footer -->
    <footer class="text-center text-gray-600 text-sm mb-6 px-4">
      &copy; 2025 My Books — Grupo 9
    </footer>

    <!-- Modales -->
    <AuthModal v-if="showModal && modalType === 'auth'" @close="closeModal" @login="switchToLogin" @register="switchToRegister" />
    <LoginModal v-if="showModal && modalType === 'login'" @close="closeModal" />
    <RegisterModal v-if="showModal && modalType === 'register'" @close="closeModal" />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser } from '@/authUser'

import FeatureCard from '@/components/FeatureCard.vue'
import AuthModal from '@/components/AuthModal.vue'
import LoginModal from '@/components/LoginModal.vue'
import RegisterModal from '@/components/RegisterModal.vue'

const showModal = ref(false)
const modalType = ref(null)
const router = useRouter()

const user = computed(() => currentUser.value)

const goToAuth = () => {
  if (user.value) {
    router.push('/search')
  } else {
    showModal.value = true
    modalType.value = 'auth'
  }
}

const closeModal = () => {
  showModal.value = false
}

const switchToLogin = () => {
  modalType.value = 'login'
}

const switchToRegister = () => {
  modalType.value = 'register'
}
</script>
