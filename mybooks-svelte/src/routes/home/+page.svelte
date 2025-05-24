<script>
  import { goto } from '$app/navigation';
  import { auth } from '$lib/firebase';
  import { signOut } from 'firebase/auth';
  import { user } from '$lib/stores/user';

  let currentUser;
  $: if ($user) {
    currentUser = $user.displayName || $user.email;
  }

  const listas = [
    { nombre: '📘 Leídos', ruta: '/leidos' },
    { nombre: '📙 Recomendados', ruta: '/recomendados' },
    { nombre: '📗 Quiero Leer', ruta: '/quiero-leer' }
  ];

  const categorias = [
    'Ficción', 'Historia', 'Tecnología', 'Ciencia', 'Misterio', 'Romance', 'Fantasía', 'Horror'
  ];

  const irABusqueda = (categoria) => {
    goto(`/buscar?categoria=${encodeURIComponent(categoria)}`);
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    goto('/');
  };
</script>

<main class="p-8 font-sans">
  {#if $user}
    <p class="text-2xl font-bold mb-6">Bienvenido, {currentUser}</p>
    <button on:click={cerrarSesion}>Cerrar sesión</button>
  {:else}
    <p>No has iniciado sesión.</p>
  {/if}
  <h1 class="text-4xl font-bold mb-6">📚 Bienvenido a MyBooks</h1>

  <section class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">Tus Listas</h2>
    <div class="flex flex-wrap gap-4">
      {#each listas as lista}
        <a
          href={lista.ruta}
          class="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
        >
          {lista.nombre}
        </a>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-semibold mb-4">Explorar por Categoría</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {#each categorias as categoria}
        <button
          on:click={() => irABusqueda(categoria)}
          class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          {categoria}
        </button>
      {/each}
    </div>
  </section>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
