<script>
  import { db } from '$lib/firebase';
  import { collection, getDocs } from 'firebase/firestore';

  let books = [];

  console.log("⚡ Componente cargado"); // <-- esta línea debe aparecer


  const fetchBooks = async () => {
    try {
      const snapshot = await getDocs(collection(db, "books"));
      books = snapshot.docs.map(doc => doc.data());
      console.log("Libros cargados:", books);
    } catch (error) {
      console.error("Error al obtener libros:", error);
    }
  };

  fetchBooks();
</script>

<h1>Libros en Firestore</h1>
<ul>
  {#each books as book}
    <li>{book.title}</li>
  {/each}
</ul>
