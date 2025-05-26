
export function recommendBooks(books, userPreferences) {
  if (!books || books.length === 0) return []

  // Ejemplo simple de recomendación
  return books.filter(book =>
    userPreferences.genres.includes(book.genre)
  ).slice(0, 10)
}
