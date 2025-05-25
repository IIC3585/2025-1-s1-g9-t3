<script>
    import { auth, db } from '$lib/firebase';
    import { addDoc, collection } from 'firebase/firestore';
    import { onMount } from 'svelte';

    let query = '';
    let results = [];
    let selectedList = 'readBooks';

    const searchBooks = async () => {
        if (!query) return;
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        results = data.items || [];
    };

    const addBookToList = async (book) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return alert("Debes iniciar sesión.");

        const volumeInfo = book.volumeInfo;
        const bookData = {
            title: volumeInfo.title,
            author: volumeInfo.authors?.[0] || 'Desconocido',
            year: volumeInfo.publishedDate?.slice(0, 4) || 'N/A',
            image: volumeInfo.imageLinks?.thumbnail || null
        };


        await addDoc(collection(db, `users/${userId}/${selectedList}`), bookData);
        alert(`Libro agregado a la lista "${selectedList}"`);
    };
</script>

<div class="mb-4">
    <input
        type="text"
        bind:value={query}
        placeholder="Buscar libros..."
        class="border p-2 w-full mb-2"
    />
    <select bind:value={selectedList} class="border p-2 w-full mb-2">
        <option value="readBooks">Leídos</option>
        <option value="toRead">Por Leer</option>
        <option value="recommended">Recomendados</option>
    </select>
    <button on:click={searchBooks} class="bg-blue-600 text-white px-4 py-2 rounded">
        Buscar
    </button>
</div>

{#if results.length > 0}
    <ul class="space-y-4">
        {#each results as book}
            <li class="p-4 border rounded-xl shadow-md flex gap-4 items-start">
                <!-- Imagen del libro -->
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

                <!-- Info del libro -->
                <div class="flex-1">
                    <h2 class="text-xl font-semibold">{book.volumeInfo.title}</h2>
                    <p class="text-gray-700">Autor: {book.volumeInfo.authors?.[0] || 'Desconocido'}</p>
                    <p class="text-gray-500 text-sm">Publicado en {book.volumeInfo.publishedDate?.slice(0, 4)}</p>
                    <button
                        on:click={() => addBookToList(book)}
                        class="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                        Agregar a "{selectedList}"
                    </button>
                </div>
            </li>
        {/each}

    </ul>
{:else}
    <p>No hay resultados aún. Busca un libro arriba.</p>
{/if}
