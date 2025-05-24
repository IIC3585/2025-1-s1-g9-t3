<script>
    import { goto } from '$app/navigation';
    import { auth } from '$lib/firebase';
    import { signOut } from 'firebase/auth';
    import { user } from '$lib/stores/user';

    let currentUser;
    $: if ($user) {
        currentUser = $user.displayName || $user.email;
    }

    let readBooks = [
        { id: 1, title: '1984', author: 'George Orwell', year: 1949 },
        { id: 2, title: 'El nombre de la rosa', author: 'Umberto Eco', year: 1980 },
        { id: 3, title: 'Cien años de soledad', author: 'Gabriel García Márquez', year: 1967 }
    ];

    const closeSession = async () => {
        await signOut(auth);
        goto('/');
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
        <h1 class="text-2xl font-bold mb-4">Libros Recomendados</h1>

        {#if readBooks.length > 0}
        <ul class="space-y-4">
            {#each readBooks as book}
            <li class="p-4 border rounded-xl shadow-md">
                <h2 class="text-xl font-semibold">{book.title}</h2>
                <p class="text-gray-700">Autor: {book.author}</p>
                <p class="text-gray-500 text-sm">Publicado en {book.year}</p>
            </li>
            {/each}
        </ul>
        {:else}
        <p>No has marcado libros como leídos todavía.</p>
        {/if}
    </section>
</main>