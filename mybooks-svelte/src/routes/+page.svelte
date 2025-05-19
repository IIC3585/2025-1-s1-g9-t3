<script>
  import { goto } from '$app/navigation';

  const irAAuth = () => {
    goto('/auth');
  };
</script>

<section class="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-orange-200 flex flex-col justify-between font-sans">
  <!-- Hero -->
  <div class="text-center mt-24 px-4">
    <h1 class="text-5xl font-extrabold text-gray-800 tracking-tight">📚 My Books</h1>
  </div>

  <!-- Features -->
    <div class="grid md:grid-cols-3 gap-8 px-8 mt-24 text-gray-700 text-center max-w-7xl mx-auto">

    <div class="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105">
        <div class="text-6xl mb-6">🔍</div>
        <h2 class="text-xl font-semibold mb-2">Explora y opina sobre libros</h2>
        <p>Descubre nuevos títulos, ve las reseñas y comparte tu opinión con otros lectores.</p>
    </div>

    <div class="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105">
        <div class="text-6xl mb-6">📖</div>
        <h2 class="text-xl font-semibold mb-2">Lleva el registro de tu lectura</h2>
        <p>Marca los libros que ya leíste, los que te interesan y observa tu progreso.</p>
    </div>

    <div class="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105">
        <div class="text-6xl mb-6">🌐</div>
        <h2 class="text-xl font-semibold mb-2">Accede desde cualquier dispositivo</h2>
        <p>Tu biblioteca siempre estará sincronizada entre dispositivos y respaldada en la nube.</p>
    </div>
    </div>



  <!-- Call to Action -->
  <div class="text-center mt-12 mb-16">
    <button
      class="px-8 py-4 bg-amber-600 text-white text-lg font-semibold rounded-full shadow-xl hover:bg-amber-700 transition"
      on:click={irAAuth}>
      Comenzar ahora
    </button>
  </div>

  <!-- Footer -->
  <footer class="text-center text-gray-600 text-sm mb-6">
    &copy; 2025 MyBooks — Grupo 9
  </footer>
</section>
