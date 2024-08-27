import { expect, test } from 'bun:test'
import { parseSeriesString } from './series'

// prettier-ignore
const testCases = [
  { input: 'Supplements to Vetus Testamentum -- v. 107', expected: { name: 'Supplements to Vetus Testamentum', position: 107 } },
  { input: 'Library of American civilization -- LAC 10825.', expected: { name: 'Library of American civilization', position: 10825 } },
  { input: 'FED facts ; 12', expected: { name: 'FED facts', position: 12 } },
  { input: 'Harry Potter, #6', expected: { name: 'Harry Potter', position: 6 } },
  { input: 'Nihon no meicho, 23', expected: { name: 'Nihon no meicho', position: 23 } },
  { input: 'Kröners Taschenausgabe -- Bd.91', expected: { name: 'Kröners Taschenausgabe', position: 91 } },
  { input: 'Technical report ; no. 34B', expected: { name: 'Technical report', position: 34 } },
  { input: 'Cyfres llyfryddiaethau -- rhif 1 ; -- no.1.', expected: { name: 'Cyfres llyfryddiaethau', position: 1 } },  
  { input: 'On your own in the classroom -- booklet no.14', expected: { name: 'On your own in the classroom', position: 14 } },
  { input: 'Duaḥ Be-tselem -- mis. 13', expected: { name: 'Duaḥ Be-tselem', position: 13 } },
  { input: 'Wright American fiction -- v. 3 (1876-1900), reel S-23, no. 4911A.', expected: { name: 'Wright American fiction', position: 3 } },
  { input: 'Hallische Monographien -- Nr. 16', expected: { name: 'Hallische Monographien', position: 16 } },
  { input: 'Magasin théatral -- t. 14 [no 10]', expected: { name: 'Magasin théatral', position: 14 } },
  { input: 'Redwall (6)', expected: { name: 'Redwall', position: 6 } },
  { input: 'Harlequin Romance #2634', expected: { name: 'Harlequin Romance', position: 2634 } },
  { input: 'Grisha Trilogy ; book 1', expected: { name: 'Grisha Trilogy', position: 1 } },
  { input: 'Invincible #1', expected: { name: 'Invincible', position: 1 } },
  { input: 'Lucifer (2001) #1', expected: { name: 'Lucifer', position: 1 } },
  { input: 'Harlequin Presents 1051', expected: { name: 'Harlequin Presents', position: 1051 } },
  { input: 'book two of the Riyria chronicles', expected: { name: 'Riyria chronicles', position: 2 } },
  { input: 'Bobiverse, 1', expected: { name: 'Bobiverse', position: 1 } },
  { input: 'All Souls Trilogy (Book 2)', expected: { name: 'All Souls Trilogy', position: 2 } },
  { input: 'Broken empire -- bk. 2', expected: { name: 'Broken empire', position: 2 } },
  { input: 'Chronicle of the Unhewn Throne -- book II', expected: { name: 'Chronicle of the Unhewn Throne', position: 2 } },
  { input: 'The Dark Tower III', expected: { name: 'The Dark Tower', position: 3 } },
  { input: 'Red queen -- [1]', expected: { name: 'Red queen', position: 1 } },
  { input: 'Forgotten Realms: The Legend of Drizzt, part 7', expected: { name: 'Forgotten Realms: The Legend of Drizzt', position: 7 } },
  { input: 'Warriors, power of three -- [bk. 5]', expected: { name: 'Warriors, power of three', position: 5 } },

  // TODO:
  // { input: 'Texte deutscher Literatur 1500-1800', expected: { name: 'Texte deutscher Literatur 1500-1800' } },
  // { input: 'Silhouette Romance, 1363; Silhouette Romance, No. 1363', expected: { name: 'Silhouette Romance', position: 1363 } },
]

for (const testCase of testCases) {
  test(`parses single string series: "${testCase.input}"`, () => {
    const result = parseSeriesString(testCase.input)
    expect(result).toEqual(testCase.expected)
  })
}
