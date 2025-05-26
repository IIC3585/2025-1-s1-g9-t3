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

    $: if ($user && !readBooks.length) {
        loadBooks();
    }

    async function loadBooks() {
        const userId = $user.uid;
        const snapshot = await getDocs(collection(db, 'users', userId, 'readBooks'));
        readBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }


    let readBooks = [];

    onMount(async () => {
        if (!$user) return;
        loadBooks();
    });


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
        }
    }

    async function removeBook(bookId) {
        const userId = $user.uid;
        await deleteDoc(doc(db, 'users', userId, 'readBooks', bookId));
        readBooks = readBooks.filter(b => b.id !== bookId);
    }

    const viewBookDetails = (book) => {
        selectedBook.set(book);
        goto('/book');
    };

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
    <h1 class="text-2xl font-bold mb-4">Libros Leídos</h1>

    {#if readBooks.length > 0}
        <ul class="space-y-4">
        {#each readBooks as book}
            <li class="transition p-4 border rounded-xl shadow-md flex gap-4 items-start">
            <!-- Image block -->
            {#if book.volumeInfo?.imageLinks?.thumbnail || book.image}
                <button
                    type="button"
                    class="p-0 border-none bg-transparent w-24 h-full"
                    on:click={() => viewBookDetails(book)}
                    aria-label="Ver detalles de {book.title}"
                >
                    <img
                        src={book.volumeInfo?.imageLinks?.thumbnail || book.image}
                        alt="Portada de {book.title}"
                        class="w-24 h-full object-cover rounded-md cursor-pointer"
                    />
                </button>

            {:else}
                <div class="w-24 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md">
                Sin imagen
                </div>
            {/if}

            <!-- Text content -->
            <button
                type="button"
                class="flex-1 text-left cursor-pointer bg-transparent border-none p-0"
                on:click={() => viewBookDetails(book)}
            >
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
            </button>



          <!-- Action buttons -->
          <div class="mt-2 flex flex-col gap-2">
            <button
              on:click={() => recommendBook(book, currentUser)}
              class="bg-yellow-500 text-white px-3 py-1 rounded-xl hover:bg-yellow-600 transition"
            >
              Recomendar
            </button>
            <button
              on:click={() => moveBook(book, 'toRead')}
              class="bg-blue-500 text-white px-3 py-1 rounded-xl hover:bg-blue-600 transition"
            >
              Leer después
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
    <p class="text-gray-600">No has marcado libros como leídos todavía.</p>
  {/if}
</section>

</main>