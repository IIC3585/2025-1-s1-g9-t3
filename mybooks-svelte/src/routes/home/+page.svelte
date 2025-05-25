<script>
  import { auth, db } from '$lib/firebase';
  import { addDoc, collection } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { signOut } from 'firebase/auth';
  import { user } from '$lib/stores/user';

  let currentUser;
  $: if ($user) {
    currentUser = $user.displayName || $user.email;
  }

  // Las tres listas como botones
  const lists = [
    { name: '📘 Leídos', route: '/read' },
    { name: '📙 Recomendados', route: '/recommended' },
    { name: '📗 Quiero Leer', route: '/toRead' }
  ];

  let query = '';
  let results = [];

  const searchBooks = async () => {
    if (!query.trim()) {
      results = [];
      return;
    }
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      results = data.items || [];
    } catch (error) {
      console.error('Error buscando libros:', error);
      results = [];
    }
  };

  const addBookToList = async (book, listName) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return alert("Debes iniciar sesión para agregar libros.");

    const volumeInfo = book.volumeInfo;
    const bookData = {
      title: volumeInfo.title,
      author: volumeInfo.authors?.[0] || 'Desconocido',
      year: volumeInfo.publishedDate?.slice(0, 4) || 'N/A',
      image: volumeInfo.imageLinks?.thumbnail || null
    };

    try {
      if (listName === 'recommended') {
        // Guardar en colección compartida
        await addDoc(collection(db, 'recommended'), {
          ...bookData,
          recommendedBy: currentUser || userEmail
        });
        alert(`Libro recomendado por ti y visible para todos los usuarios.`);
      } else {
        // Guardar en colección del usuario
        await addDoc(collection(db, `users/${userId}/${listName}`), bookData);
        alert(`Libro agregado a la lista "${listName}"`);
      }
    } catch (error) {
      console.error('Error agregando libro:', error);
      alert('No se pudo agregar el libro, intenta más tarde.');
    }
  };

  const closeSession = async () => {
    await signOut(auth);
    goto('/');
  };
</script>

<main class="p-8 font-sans max-w-5xl mx-auto">
  <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-6">
    <div class="text-2xl font-bold flex items-center gap-4">
      <a href="/" class="flex items-center gap-2">
        <img src="/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto" />
        MyBooks
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

  <section class="mb-8 flex gap-4 justify-center">
    {#each lists as list}
      <button
        on:click={() => goto(list.route)}
        class="px-6 py-3 rounded-md font-semibold text-white transition
              {list.name.includes('Leídos') ? 'bg-green-600 hover:bg-green-700' : ''}
              {list.name.includes('Recomendados') ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              {list.name.includes('Quiero Leer') ? 'bg-blue-600 hover:bg-blue-700' : ''}"
      >
        {list.name}
      </button>
    {/each}
  </section>

  <section>
    <h2 class="text-2xl font-bold mb-4">Buscar Libros</h2>

    <div class="mb-4">
      <input
        type="text"
        bind:value={query}
        placeholder="Buscar libros..."
        class="border p-2 w-full mb-2 rounded"
        on:keydown={(e) => e.key === 'Enter' && searchBooks()}
      />
      <button
        on:click={searchBooks}
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Buscar
      </button>
    </div>

    {#if results.length > 0}
      <ul class="space-y-4">
        {#each results as book}
          <li class="p-4 border rounded-xl shadow-md flex gap-4 items-start">
            {#if book.volumeInfo.imageLinks?.thumbnail}
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt="Portada de {book.volumeInfo.title}"
                class="w-24 h-auto object-cover rounded-md"
              />
            {:else}
              <div class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
                Sin imagen
              </div>
            {/if}

            <div class="flex-1">
              <h3 class="text-xl font-semibold">{book.volumeInfo.title}</h3>
              <p class="text-gray-700">Autor: {book.volumeInfo.authors?.[0] || 'Desconocido'}</p>
              <p class="text-gray-500 text-sm">Publicado en {book.volumeInfo.publishedDate?.slice(0, 4) || 'N/A'}</p>
              <div class="mt-2 flex gap-2 flex-wrap">
                <button
                  on:click={() => addBookToList(book, 'readBooks')}
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Agregar a Leídos
                </button>
                <button
                  on:click={() => addBookToList(book, 'recommended')}
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Recomendar
                </button>
                <button
                  on:click={() => addBookToList(book, 'toRead')}
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Agregar a Quiero Leer
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-600">No hay resultados aún. Busca un libro arriba.</p>
    {/if}
  </section>
</main>

<style>
  main {
    background: #f9fafb;
    min-height: 100vh;
  }
</style>