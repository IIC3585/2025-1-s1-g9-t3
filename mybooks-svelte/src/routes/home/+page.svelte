<script>
  import { goto } from '$app/navigation';
  import { auth } from '$lib/firebase';
  import { signOut } from 'firebase/auth';
  import { user } from '$lib/stores/user';

  let currentUser;
  $: if ($user) {
    currentUser = $user.displayName || $user.email;
  }

  const lists = [
    { name: '📘 Leídos', route: '/read' },
    { name: '📙 Recomendados', route: '/recommended' },
    { name: '📗 Quiero Leer', route: '/want_to_read' }
  ];

  const categories = [
    'Ficción', 'Historia', 'Tecnología', 'Ciencia', 'Misterio', 'Romance', 'Fantasía', 'Horror'
  ];

  const searchCategory = (category) => {
    goto(`/search?category=${encodeURIComponent(category)}`);
  };

  const closeSession = async () => {
    await signOut(auth);
    goto('/');
  };
</script>

<main class="p-8 font-sans">
  <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-4">
    <div class="text-2xl font-bold flex items-center gap-4">
      <a href="/" class="flex items-center gap-2">
        <img src="/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto" />
        Bienvenido a MyBooks
      </a>
    </div>
    <div>
      {#if $user}
        <span class="mr-4">Bienvenido, {currentUser}</span>
        <button
          on:click={closeSession}
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      {:else}
        <span class="text-gray-600">No has iniciado sesión.</span>
      {/if}
    </div>
  </nav>

  <section class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">Tus Listas</h2>
    <div class="flex flex-wrap gap-4">
      {#each lists as list}
        <a
          href={list.route}
          class="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
        >
          {list.name}
        </a>
      {/each}
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-semibold mb-4">Explorar por Categoría</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {#each categories as category}
        <button
          on:click={() => searchCategory(category)}
          class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          {category}
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
