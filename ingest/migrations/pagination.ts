export type Pagination = {
  preliminaryLeaves?: number
  numberedPages?: number
  unnumberedPages?: number
  specialSections?: {
    romanNumerals?: number
    alphabeticalPages?: string
    foldoutPages?: number
    plates?: number
  }
  additionalNotes?: string
}

// TODO: AI generated, test it
export function parsePagination(paginationString: string): Pagination {
  const result: Pagination = {}

  // Regular expressions for matching different parts
  const prelimLeavesRegex = /(\d+)\s*p\.\s*l\./
  const numberedPagesRegex = /,?\s*(\d+)\s*/
  const unnumberedPagesRegex = /\[(\d+)\]\s*p\./

  // Match preliminary leaves
  const prelimLeavesMatch = paginationString.match(prelimLeavesRegex)
  if (prelimLeavesMatch) {
    result.preliminaryLeaves = parseInt(prelimLeavesMatch[1], 10)
  }

  // Match numbered pages
  const numberedPagesMatch = paginationString.match(numberedPagesRegex)
  if (numberedPagesMatch) {
    result.numberedPages = parseInt(numberedPagesMatch[1], 10)
  }

  // Match unnumbered pages
  const unnumberedPagesMatch = paginationString.match(unnumberedPagesRegex)
  if (unnumberedPagesMatch) {
    result.unnumberedPages = parseInt(unnumberedPagesMatch[1], 10)
  }

  return result
}
