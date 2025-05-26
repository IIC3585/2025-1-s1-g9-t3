<script>
  import { get } from 'svelte/store';
  import { auth, db } from '$lib/firebase';
  import { addDoc, collection, doc, setDoc, getDoc } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { signOut } from 'firebase/auth';
  import { user } from '$lib/stores/user';
  import { selectedBook } from '$lib/stores/book';
  import { searchedBooks } from '$lib/stores/search';

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
  let results = get(searchedBooks);

  const searchBooks = async () => {
    if (!query.trim()) {
      results = [];
      return;
    }
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      results = data.items || [];
      searchedBooks.set(results)
      console.log(results);
    } catch (error) {
      console.error('Error buscando libros:', error);
      results = [];
    }
  };

  const addBookToList = async (book, listName) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return alert("Debes iniciar sesión para agregar libros.");

    const volumeInfo = book.volumeInfo;
    const bookId = book.id; // this is the unique Google Books volume ID
    const bookData = {
      title: volumeInfo.title,
      author: volumeInfo.authors?.[0] || 'Desconocido',
      year: volumeInfo.publishedDate?.slice(0, 4) || 'N/A',
      image: volumeInfo.imageLinks?.thumbnail || null
    };

    try {
      if (listName === 'recommended') {
        await addDoc(collection(db, 'recommended'), {
          ...bookData,
          recommendedBy: currentUser
        });
        alert(`Libro recomendado por ti y visible para todos los usuarios.`);
      } else {
        const bookRef = doc(db, `users/${userId}/${listName}`, bookId);
        const docSnap = await getDoc(bookRef);

        if (docSnap.exists()) {
          alert("Este libro ya está en tu lista.");
          return;
        }

        await setDoc(bookRef, bookData);
        alert(`Libro agregado a la lista "${listName}"`);
      }
    } catch (error) {
      console.error('Error agregando libro:', error);
      alert('No se pudo agregar el libro, intenta más tarde.');
    }
  };


  const viewBookDetails = (book) => {
    selectedBook.set(book);
    goto('/book');
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
        <span class="mr-4 text-xl">Bienvenido, {currentUser}</span>
        <button
          on:click={closeSession}
          class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
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
              {list.name.includes('Leídos') ? 'bg-green-600 rounded-xl hover:bg-green-700' : ''}
              {list.name.includes('Recomendados') ? 'bg-yellow-600 rounded-xl hover:bg-yellow-700' : ''}
              {list.name.includes('Quiero Leer') ? 'bg-blue-600 rounded-xl hover:bg-blue-700' : ''}"
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
        class="border p-2 w-full mb-2 rounded-lg"
        on:keydown={(e) => e.key === 'Enter' && searchBooks()}
      />

      <div class="flex justify-between flex-wrap gap-2">
        <button
          on:click={searchBooks}
          class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Buscar
        </button>
        {#if results.length > 0}
        <div class="flex-1 text-right">
          <button
            on:click={() => {
              query = '';
              results = [];
              searchedBooks.set([]);
            }}
            class="bg-gray-300 text-gray-800 px-4 py-1 rounded-xl hover:bg-gray-400 transition"
          >
            X
          </button>
        </div>
        {/if}
      </div>
    </div>


    {#if results.length > 0}
      <ul class="space-y-4">
        {#each results as book}
          <li class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
            {#if book.volumeInfo.imageLinks?.thumbnail}
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt="Portada de {book.volumeInfo.title}"
                class="w-24 h-full object-cover rounded-md cursor-pointer hover:bg-gray-50"
              />
            {:else}
              <div class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
                Sin imagen
              </div>
            {/if}

            <div>
            <div class="flex-1 cursor-pointer" on:click={() => viewBookDetails(book)}>
            <h3 class="text-xl font-semibold">{book.volumeInfo.title}</h3>
            <div class="flex items-center text-yellow-500 text-lg">
            {#each Array(5) as _, i}
              {#if book.volumeInfo.averageRating && i < Math.round(book.volumeInfo.averageRating)}
                ★
              {:else}
                ☆
              {/if}
            {/each}
            <span class="text-sm text-gray-600 ml-2">
              {#if book.volumeInfo.ratingsCount}
                ({book.volumeInfo.ratingsCount} reseñas)
              {:else}
                Sin reseñas
              {/if}
            </span>
          </div>

            <p class="text-gray-700">Autor: {book.volumeInfo.authors?.[0] || 'Desconocido'}</p>
            <p class="text-gray-500 text-sm">Publicado en {book.volumeInfo.publishedDate?.slice(0, 4) || 'N/A'}</p>
            </div>

              <div class="mt-2 flex gap-2 flex-wrap">
                <button
                  on:click={() => addBookToList(book, 'readBooks')}
                  class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                >
                  Agregar a Leídos
                </button>
                <button
                  on:click={() => addBookToList(book, 'recommended')}
                  class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                >
                  Recomendar
                </button>
                <button
                  on:click={() => addBookToList(book, 'toRead')}
                  class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
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