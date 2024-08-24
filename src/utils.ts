/** I.e. https://covers.openlibrary.org/b/id/10521270-L.jpg */
export function coverIdToUrl(id: string, type: 'book' | 'author'): string {
  return `https://covers.openlibrary.org/${type === 'book' ? 'b' : 'a'}/id/${id}-L.jpg`
}
