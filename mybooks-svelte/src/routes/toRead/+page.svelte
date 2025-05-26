<script>
    import { goto } from '$app/navigation';
    import { auth, db } from '$lib/firebase';
    import { signOut } from 'firebase/auth';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';
    import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
    import { selectedBook } from '$lib/stores/book';
    import { recommendBook } from '$lib/recommendBook';


    let currentUser;
    $: if ($user) {
        currentUser = $user.displayName || $user.email;
    }

    let toRead = [];

    $: if ($user && !toRead.length) {
        loadBooks();
    }

    async function loadBooks() {
        const userId = $user.uid;
        const snapshot = await getDocs(collection(db, 'users', userId, 'toRead'));
        toRead = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    }

    onMount(async () => {
        if ($user) {
            const booksRef = collection(db, 'users', $user.uid, 'toRead');
            const snapshot = await getDocs(booksRef);
            toRead = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    });

    const viewBookDetails = (book) => {
        selectedBook.set(book);
        goto('/book');
    };



    const closeSession = async () => {
        await signOut(auth);
        goto('/');
    };

    async function moveBook(book, targetList) {
        const userId = $user.uid;

        // Añadir el libro a la nueva lista
        if (targetList === 'recommended') {
            await setDoc(doc(db, 'recommended', book.id), {
                ...book,
                recommendedBy: currentUser || $user.email
            });
        } else {
            await setDoc(doc(db, 'users', userId, targetList, book.id), book);
            await deleteDoc(doc(db, 'users', userId, 'toRead', book.id));
            toRead = toRead.filter(b => b.id !== book.id);

        }
    }

    async function removeBook(bookId) {
        const userId = $user.uid;
        await deleteDoc(doc(db, 'users', userId, 'toRead', bookId));
        toRead = toRead.filter(b => b.id !== bookId);
    }
</script>

<main class="p-8 font-sans">
    <nav class="bg-white shadow-md p-4 flex justify-between items-center mb-4">
        <div class="text-2xl font-bold flex items-center gap-4">
            <a href="/home" class="flex items-center gap-2">
                <img src="/logo.svg" alt="MyBooks Logo" class="h-10 sm:h-20 md:h-15 w-auto" />
                MyBooks
            </a>
        </div>
        <div>
            {#if $user}
                <span class="mr-4">Bienvenido, {currentUser}</span>
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

    <section class="mb-8">
  <h1 class="text-2xl font-bold mb-4">Libros que planeas leer</h1>

  {#if toRead.length > 0}
    <ul class="space-y-4">
      {#each toRead as book}
        <li class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
          <!-- Book image -->
          {#if book.volumeInfo?.imageLinks?.thumbnail || book.image}
            <img
              src={book.volumeInfo?.imageLinks?.thumbnail || book.image}
              alt="Portada de {book.title}"
              class="w-24 h-full object-cover rounded-md cursor-pointer"
              on:click={() => viewBookDetails(book)}
            />
          {:else}
            <div class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
              Sin imagen
            </div>
          {/if}

          <!-- Book info block -->
          <div class="flex-1 cursor-pointer" on:click={() => viewBookDetails(book)}>
            <h2 class="text-xl font-semibold">{book.volumeInfo?.title || book.title}</h2>

            <div class="flex items-center text-yellow-500 text-lg mt-1">
              {#each Array(5) as _, i}
                {#if book.volumeInfo?.averageRating && i < Math.round(book.volumeInfo.averageRating)}
                  ★
                {:else}
                  ☆
                {/if}
              {/each}
              <span class="text-sm text-gray-600 ml-2">
                {#if book.volumeInfo?.ratingsCount}
                  ({book.volumeInfo.ratingsCount} reseñas)
                {:else}
                  Sin reseñas
                {/if}
              </span>
            </div>

            <p class="text-gray-700 mt-1">Autor: {book.volumeInfo?.authors?.[0] || book.author}</p>
            <p class="text-gray-500 text-sm">
              Publicado en {book.volumeInfo?.publishedDate?.slice(0, 4) || book.year || 'N/A'}
            </p>
          </div>

          <!-- Action buttons -->
          <div class="mt-2 flex flex-col gap-2">
            <button
              on:click={() => moveBook(book, 'readBooks')}
              class="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition"
            >
              Marcar como Leído
            </button>
            <button
              on:click={() => recommendBook(book, currentUser)}
              class="bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-600 transition"
            >
              Recomendar
            </button>
            <button
              on:click={() => removeBook(book.id)}
              class="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-gray-600">No hay libros que planeas leer todavía.</p>
  {/if}
</section>

</main>