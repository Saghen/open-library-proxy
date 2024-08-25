import { createHash } from 'crypto'

/**
 * OpenLibrary IDs are structured like OL{id}{type} where {type} is W for works, A for authors, and M for editions.
 * BookInfo expects a numeric ID based on GoodReads which we can't retrieve, however
 * we can mimic a foreignId by excluding the prefix and suffix of the OpenLibrary ID
 **/
export function idToForeignId(id: string): number {
  return Number(id.slice(2, -1))
}

/** Opposite of `idToForeignId` */
export function foreignIdToId(foreignId: number | string, type: 'work' | 'author' | 'edition'): string {
  return `OL${foreignId}${type === 'work' ? 'W' : type === 'author' ? 'A' : 'M'}`
}

/**
 * Sometimes there's no ID to use but BookInfo expects one, so we generate an ID from a string with a hash
 * This should be unique enough for our purposes: https://en.wikipedia.org/wiki/Stars_and_bars_%28combinatorics%29
 * https://www.calculatorsoup.com/calculators/discretemathematics/combinationsreplacement.php
 * n = 16 (hex), r = 64 (hash length) = 5391644226101705
 **/
export function stringToForeignId(uniqueStr: string): number {
  const hash = createHash('sha256').update(uniqueStr).digest()
  // Read the first 4 bytes as a 32-bit integer
  return Math.abs(hash.readInt32BE(0))
}
