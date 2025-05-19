<script>
  import FeatureCard from '$lib/FeatureCard.svelte';
  import AuthModal from '$lib/AuthModal.svelte';
  import LoginModal from '$lib/LoginModal.svelte';
  import RegisterModal from '$lib/RegisterModal.svelte';

  import { user } from '$lib/stores/user';
  import { goto } from '$app/navigation';

  let showModal = false;
  let modalType = null;

  const goToAuth = () => {
    if ($user) {
      goto('/search'); // Redirige directo si hay sesión activa
    } else {
      showModal = true;
      modalType = 'auth';
    }
  };
</script>

<section class="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-orange-200 flex flex-col justify-between font-sans">
  <!-- Hero -->
  <div class="flex justify-center mt-16 sm:mt-20 px-4">
    <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 sm:-translate-x-10 text-center sm:text-left">
      <img src="/logo.svg" alt="MyBooks Logo" class="h-20 sm:h-28 md:h-32 w-auto" />
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
      on:click={goToAuth}>
      Comenzar ahora
    </button>
  </div>

  <!-- Footer -->
  <footer class="text-center text-gray-600 text-sm mb-6 px-4">
    &copy; 2025 My Books — Grupo 9
  </footer>
</section>

{#if showModal && modalType === 'auth'}
  <AuthModal
    on:close={() => (showModal = false)}
    on:login={() => (modalType = 'login')}
    on:register={() => (modalType = 'register')} />
{/if}

{#if showModal && modalType === 'login'}
  <LoginModal on:close={() => (showModal = false)} />
{/if}

{#if showModal && modalType === 'register'}
  <RegisterModal on:close={() => (showModal = false)} />
{/if}
