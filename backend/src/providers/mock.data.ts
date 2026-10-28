import { HomeCatalog, TitleDetails, Episode, MediaItem } from '../types/index.js';

export const MOCK_ITEMS: Record<string, MediaItem> = {
  '66732': {
    id: '66732',
    title: 'Stranger Things',
    type: 'tv',
    rating: '8.7',
    year: '2016',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    genres: ['Sci-Fi', 'Drama', 'Mystery']
  },
  '93405': {
    id: '93405',
    title: 'Squid Game',
    type: 'tv',
    rating: '8.4',
    year: '2021',
    poster: 'https://image.tmdb.org/t/p/w500/dDlG06q6wYxH61yGzX0bU2n3M9V.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/oaGvjB0DvdhX9ar97fqBLoQYAwK.jpg',
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games. Inside, a tempting prize awaits with deadly high stakes.',
    genres: ['Action', 'Mystery', 'Drama']
  },
  '119051': {
    id: '119051',
    title: 'Wednesday',
    type: 'tv',
    rating: '8.5',
    year: '2022',
    poster: 'https://image.tmdb.org/t/p/w500/9PFonQ9cc19qMXCuA1V4WpLoYqS.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxKuOCzgEcBmILti4P.jpg',
    overview: 'A sleuthing, supernaturally infused mystery charting Wednesday Addams\' years as a student at Nevermore Academy.',
    genres: ['Comedy', 'Fantasy', 'Mystery']
  },
  '71446': {
    id: '71446',
    title: 'Money Heist',
    type: 'tv',
    rating: '8.2',
    year: '2017',
    poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbk5r6ry1xOkMntk.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/gFZriCkpJYsApPwyQ9GKnMFv20E.jpg',
    overview: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    genres: ['Crime', 'Drama', 'Action']
  },
  '94605': {
    id: '94605',
    title: 'Arcane',
    type: 'tv',
    rating: '9.0',
    year: '2021',
    poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn397rWW2vvgd.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/rkB4LyZHo1NHXSTXYZaOXv7Z3IR.jpg',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    genres: ['Animation', 'Sci-Fi', 'Action']
  },
  '1396': {
    id: '1396',
    title: 'Breaking Bad',
    type: 'tv',
    rating: '9.5',
    year: '2008',
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and enters the dangerous world of drugs and crime.',
    genres: ['Crime', 'Drama', 'Thriller']
  },
  '60059': {
    id: '60059',
    title: 'Better Call Saul',
    type: 'tv',
    rating: '8.9',
    year: '2015',
    poster: 'https://image.tmdb.org/t/p/w500/fC2HDm5t0kHsf7TmFEeQP6q9IR2.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdFaF06JBTw.jpg',
    overview: 'Six years before he begins to represent Walter White, small-time attorney Jimmy McGill transforms into the charismatic criminal lawyer Saul Goodman.',
    genres: ['Crime', 'Drama']
  },
  '42009': {
    id: '42009',
    title: 'Black Mirror',
    type: 'tv',
    rating: '8.3',
    year: '2011',
    poster: 'https://image.tmdb.org/t/p/w500/7RumFHkKYxV8D0eJ3j5gL6k0aU1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/sS67pW0aE8v1g5gM5G6t0q3Vz1L.jpg',
    overview: 'A contemporary British re-working of The Twilight Zone with stories that tap into the collective unease about our modern world.',
    genres: ['Sci-Fi', 'Drama', 'Thriller']
  },
  '87108': {
    id: '87108',
    title: 'Chernobyl',
    type: 'tv',
    rating: '9.3',
    year: '2019',
    poster: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/uL6Ad12Fe4I5uK5q4qY0B6fVbM6.jpg',
    overview: 'The true story of one of the worst human-made catastrophes in history: the catastrophic nuclear accident in Soviet Ukraine in 1986.',
    genres: ['Drama', 'History']
  },
  '70523': {
    id: '70523',
    title: 'Dark',
    type: 'tv',
    rating: '8.7',
    year: '2017',
    poster: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/3lBDg3i6nn5R2NKFCJGF1zS0Gk0.jpg',
    overview: 'A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations.',
    genres: ['Sci-Fi', 'Mystery', 'Drama']
  },
  '157336': {
    id: '157336',
    title: 'Interstellar',
    type: 'movie',
    rating: '8.7',
    year: '2014',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    genres: ['Adventure', 'Drama', 'Sci-Fi']
  },
  '27205': {
    id: '27205',
    title: 'Inception',
    type: 'movie',
    rating: '8.8',
    year: '2010',
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    genres: ['Action', 'Sci-Fi', 'Adventure']
  },
  '155': {
    id: '155',
    title: 'The Dark Knight',
    type: 'movie',
    rating: '9.0',
    year: '2008',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    genres: ['Action', 'Crime', 'Drama']
  },
  '550': {
    id: '550',
    title: 'Fight Club',
    type: 'movie',
    rating: '8.4',
    year: '1999',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    genres: ['Drama', 'Thriller']
  },
  '680': {
    id: '680',
    title: 'Pulp Fiction',
    type: 'movie',
    rating: '8.9',
    year: '1994',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    genres: ['Crime', 'Drama']
  },
  '299536': {
    id: '299536',
    title: 'Avengers: Infinity War',
    type: 'movie',
    rating: '8.4',
    year: '2018',
    poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
    overview: 'As the Avengers and their allies have continued to protect the world, a new danger has emerged from the cosmic shadows: Thanos.',
    genres: ['Action', 'Adventure', 'Sci-Fi']
  },
  '438631': {
    id: '438631',
    title: 'Dune',
    type: 'movie',
    rating: '8.1',
    year: '2021',
    poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/jYEW4xZkZk2WTrdbMGAPFuBqbDc.jpg',
    overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.',
    genres: ['Sci-Fi', 'Adventure']
  },
  '693134': {
    id: '693134',
    title: 'Dune: Part Two',
    type: 'movie',
    rating: '8.6',
    year: '2024',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    genres: ['Sci-Fi', 'Adventure', 'Action']
  },
  '324857': {
    id: '324857',
    title: 'Spider-Man: Into the Spider-Verse',
    type: 'movie',
    rating: '8.4',
    year: '2018',
    poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/uUiId67v2BMVdpVMvtHaVLIqfgz.jpg',
    overview: 'Teen Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from parallel dimensions to stop a threat to all reality.',
    genres: ['Animation', 'Action', 'Adventure']
  },
  '569094': {
    id: '569094',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    rating: '8.6',
    year: '2023',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genres: ['Animation', 'Action', 'Adventure']
  },
  '496243': {
    id: '496243',
    title: 'Parasite',
    type: 'movie',
    rating: '8.5',
    year: '2019',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    genres: ['Comedy', 'Thriller', 'Drama']
  },
  '98': {
    id: '98',
    title: 'Gladiator',
    type: 'movie',
    rating: '8.5',
    year: '2000',
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/ArWnZQIrQB2snEVfrZeRQCMe2Ur.jpg',
    overview: 'In the year 180, the death of Emperor Marcus Aurelius throws the Roman Empire into turmoil. His general, Maximus, is condemned to the arena.',
    genres: ['Action', 'Drama', 'Adventure']
  },
  '129': {
    id: '129',
    title: 'Spirited Away',
    type: 'movie',
    rating: '8.5',
    year: '2001',
    poster: 'https://image.tmdb.org/t/p/w500/393r3eYA0HHvO37ReptJstqqiL8.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had.',
    genres: ['Animation', 'Family', 'Fantasy']
  },
  '1429': {
    id: '1429',
    title: 'Attack on Titan',
    type: 'tv',
    rating: '9.0',
    year: '2013',
    poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/dK1l3b1r0yVn1dK0U5O5jM5Z1c5.jpg',
    overview: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.',
    genres: ['Animation', 'Action', 'Sci-Fi']
  },
  '94997': {
    id: '94997',
    title: 'House of the Dragon',
    type: 'tv',
    rating: '8.4',
    year: '2022',
    poster: 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/etj5CuMuam3hGQ3QIzegXiEb0Wq.jpg',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke.',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy']
  },
  '60625': {
    id: '60625',
    title: 'Rick and Morty',
    type: 'tv',
    rating: '8.7',
    year: '2013',
    poster: 'https://image.tmdb.org/t/p/w500/cvhNj9eoRBe5SxjCbQTkh05UP5K.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/9xxLWtn8hK5r75a3t6mIoc1c2G.jpg',
    overview: 'An eccentric sociopathic scientist drags his unintelligent grandson on insanely dangerous adventures across alternate dimensions.',
    genres: ['Animation', 'Comedy', 'Sci-Fi']
  },
  '60574': {
    id: '60574',
    title: 'Peaky Blinders',
    type: 'tv',
    rating: '8.6',
    year: '2013',
    poster: 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcTTW.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/75gn9z1wE872688hWc5wXQy5oQv.jpg',
    overview: 'A notorious gang in 1919 Birmingham, England, is led by the fierce Tommy Shelby, a crime boss set on moving up in the world.',
    genres: ['Crime', 'Drama', 'History']
  },
  '87739': {
    id: '87739',
    title: 'The Queen\'s Gambit',
    type: 'tv',
    rating: '8.6',
    year: '2020',
    poster: 'https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9lf6vBi3V.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/34OGjFEbHj0E3lE2wFlhvTl521.jpg',
    overview: 'In a 1950s orphanage, a young girl reveals an astonishing talent for chess and begins an unlikely journey to stardom while grappling with addiction.',
    genres: ['Drama']
  }
};

export const MOCK_HOME_CATALOG: HomeCatalog = {
  hero: MOCK_ITEMS['66732'], // Stranger Things
  rails: [
    {
      id: 'rail-trending',
      title: 'Trending Now',
      type: 'tv',
      category: 'trending',
      items: [
        MOCK_ITEMS['66732'], // Stranger Things
        MOCK_ITEMS['93405'], // Squid Game
        MOCK_ITEMS['119051'], // Wednesday
        MOCK_ITEMS['94605'], // Arcane
        MOCK_ITEMS['693134'], // Dune 2
        MOCK_ITEMS['569094'], // Across the Spider-Verse
        MOCK_ITEMS['1396'], // Breaking Bad
        MOCK_ITEMS['157336'] // Interstellar
      ]
    },
    {
      id: 'rail-top-10',
      title: 'Top 10 in Movies & TV Today',
      type: 'movie',
      category: 'top-10',
      items: [
        MOCK_ITEMS['66732'],
        MOCK_ITEMS['93405'],
        MOCK_ITEMS['693134'],
        MOCK_ITEMS['119051'],
        MOCK_ITEMS['155'],
        MOCK_ITEMS['94605'],
        MOCK_ITEMS['71446'],
        MOCK_ITEMS['27205'],
        MOCK_ITEMS['438631'],
        MOCK_ITEMS['1396']
      ]
    },
    {
      id: 'rail-popular-series',
      title: 'Popular TV Series',
      type: 'tv',
      category: 'popular',
      items: [
        MOCK_ITEMS['1396'], // Breaking Bad
        MOCK_ITEMS['60059'], // Better Call Saul
        MOCK_ITEMS['60574'], // Peaky Blinders
        MOCK_ITEMS['70523'], // Dark
        MOCK_ITEMS['42009'], // Black Mirror
        MOCK_ITEMS['71446'], // Money Heist
        MOCK_ITEMS['87739'], // The Queen's Gambit
        MOCK_ITEMS['94997'] // House of the Dragon
      ]
    },
    {
      id: 'rail-popular-movies',
      title: 'Blockbuster Movies',
      type: 'movie',
      category: 'popular',
      items: [
        MOCK_ITEMS['157336'], // Interstellar
        MOCK_ITEMS['27205'], // Inception
        MOCK_ITEMS['155'], // The Dark Knight
        MOCK_ITEMS['693134'], // Dune 2
        MOCK_ITEMS['438631'], // Dune
        MOCK_ITEMS['299536'], // Avengers: Infinity War
        MOCK_ITEMS['550'], // Fight Club
        MOCK_ITEMS['680'] // Pulp Fiction
      ]
    },
    {
      id: 'rail-action',
      title: 'Action & Sci-Fi Thrillers',
      type: 'movie',
      category: 'action',
      items: [
        MOCK_ITEMS['155'], // The Dark Knight
        MOCK_ITEMS['98'], // Gladiator
        MOCK_ITEMS['27205'], // Inception
        MOCK_ITEMS['157336'], // Interstellar
        MOCK_ITEMS['299536'], // Infinity War
        MOCK_ITEMS['550'], // Fight Club
        MOCK_ITEMS['438631'], // Dune
        MOCK_ITEMS['693134'] // Dune 2
      ]
    },
    {
      id: 'rail-anime',
      title: 'Acclaimed Anime & Animation',
      type: 'anime',
      category: 'popular',
      items: [
        MOCK_ITEMS['94605'], // Arcane
        MOCK_ITEMS['324857'], // Into the Spider-Verse
        MOCK_ITEMS['569094'], // Across the Spider-Verse
        MOCK_ITEMS['129'], // Spirited Away
        MOCK_ITEMS['1429'], // Attack on Titan
        MOCK_ITEMS['60625'] // Rick and Morty
      ]
    }
  ]
};

export const MOCK_TITLES: Record<string, TitleDetails> = {
  '66732': {
    id: '66732',
    title: 'Stranger Things',
    type: 'tv',
    tagline: 'Every ending has a beginning.',
    rating: '8.7',
    year: '2016',
    releaseDate: '2016-07-15',
    runtime: 50,
    status: 'Returning Series',
    voteCount: 17200,
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    numberOfSeasons: 4,
    numberOfEpisodes: 34,
    seasons: [
      { id: 77680, number: 1, name: 'Season 1', overview: 'A young boy vanishes into thin air.', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', episodeCount: 8, airDate: '2016-07-15' },
      { id: 90944, number: 2, name: 'Season 2', overview: 'Will Byers sees giant shadow creatures.', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', episodeCount: 9, airDate: '2017-10-27' },
      { id: 104576, number: 3, name: 'Season 3', overview: 'A summer in Hawkins turns ominous.', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', episodeCount: 8, airDate: '2019-07-04' },
      { id: 154562, number: 4, name: 'Season 4', overview: 'Darkness returns to Hawkins.', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', episodeCount: 9, airDate: '2022-05-27' }
    ],
    cast: [
      { id: 135651, name: 'Millie Bobby Brown', character: 'Eleven', profile: 'https://image.tmdb.org/t/p/w185/873rC87X1yVqU8uF2h3D4lK.jpg' },
      { id: 31549, name: 'Winona Ryder', character: 'Joyce Byers', profile: 'https://image.tmdb.org/t/p/w185/7VfF3iHn3yM2G0fX4k.jpg' },
      { id: 35158, name: 'David Harbour', character: 'Jim Hopper', profile: 'https://image.tmdb.org/t/p/w185/chPekukMF5EWnW6bBmrg5Bu9wGa.jpg' }
    ],
    recommendations: [
      MOCK_ITEMS['93405'],
      MOCK_ITEMS['119051'],
      MOCK_ITEMS['70523']
    ]
  },
  '550': {
    id: '550',
    title: 'Fight Club',
    type: 'movie',
    tagline: 'Mischief. Mayhem. Soap.',
    rating: '8.4',
    year: '1999',
    releaseDate: '1999-10-15',
    runtime: 139,
    status: 'Released',
    voteCount: 27500,
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    genres: ['Drama', 'Thriller'],
    cast: [
      { id: 819, name: 'Edward Norton', character: 'The Narrator', profile: 'https://image.tmdb.org/t/p/w185/8A5epLg1H6kP2gJ8E5GjVf2Z0dC.jpg' },
      { id: 287, name: 'Brad Pitt', character: 'Tyler Durden', profile: 'https://image.tmdb.org/t/p/w185/cckcYc2v0yh1tc9QjRelptsqqoW.jpg' },
      { id: 1283, name: 'Helena Bonham Carter', character: 'Marla Singer', profile: 'https://image.tmdb.org/t/p/w185/DDeItmAStLq8wgk7p4E89yv3xM.jpg' }
    ],
    recommendations: [
      MOCK_ITEMS['680'],
      MOCK_ITEMS['27205']
    ]
  },
  '1396': {
    id: '1396',
    title: 'Breaking Bad',
    type: 'tv',
    tagline: 'Change the equation.',
    rating: '9.5',
    year: '2008',
    releaseDate: '2008-01-20',
    runtime: 47,
    status: 'Ended',
    voteCount: 14200,
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He enters the dangerous world of drugs and crime.',
    genres: ['Crime', 'Drama', 'Thriller'],
    numberOfSeasons: 5,
    numberOfEpisodes: 62,
    seasons: [
      { id: 3572, number: 1, name: 'Season 1', overview: 'Walter White is transformed by a dire diagnosis.', poster: 'https://image.tmdb.org/t/p/w500/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg', episodeCount: 7, airDate: '2008-01-20' },
      { id: 3573, number: 2, name: 'Season 2', overview: 'Walt must deal with the chain reaction of his choice.', poster: 'https://image.tmdb.org/t/p/w500/e3oGYpoTUhOFK0BJfloru5ZmGV.jpg', episodeCount: 13, airDate: '2009-03-08' },
      { id: 3575, number: 3, name: 'Season 3', overview: 'Walt battles dueling identities.', poster: 'https://image.tmdb.org/t/p/w500/ffP8Q8ew048YofHRnFVM18B2fPG.jpg', episodeCount: 13, airDate: '2010-03-21' }
    ],
    cast: [
      { id: 17419, name: 'Bryan Cranston', character: 'Walter White', profile: 'https://image.tmdb.org/t/p/w185/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg' },
      { id: 84497, name: 'Aaron Paul', character: 'Jesse Pinkman', profile: 'https://image.tmdb.org/t/p/w185/8Ac9uuoYwZoYVAIJfRLzzLsGGJn.jpg' }
    ],
    recommendations: [
      MOCK_ITEMS['60059'],
      MOCK_ITEMS['71446']
    ]
  },
  '157336': {
    id: '157336',
    title: 'Interstellar',
    type: 'movie',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    rating: '8.7',
    year: '2014',
    releaseDate: '2014-11-05',
    runtime: 169,
    status: 'Released',
    voteCount: 35000,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    cast: [
      { id: 10297, name: 'Matthew McConaughey', character: 'Joseph Cooper', profile: 'https://image.tmdb.org/t/p/w185/ehoVd06jB18V7k3g1L8s5h.jpg' },
      { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', profile: 'https://image.tmdb.org/t/p/w185/tLel4A4WNBfl32Fi1q4.jpg' }
    ],
    recommendations: [
      MOCK_ITEMS['27205'],
      MOCK_ITEMS['438631']
    ]
  },
  '27205': {
    id: '27205',
    title: 'Inception',
    type: 'movie',
    tagline: 'Your mind is the scene of the crime.',
    rating: '8.8',
    year: '2010',
    releaseDate: '2010-07-15',
    runtime: 148,
    status: 'Released',
    voteCount: 36000,
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    cast: [
      { id: 6193, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile: 'https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' }
    ],
    recommendations: [
      MOCK_ITEMS['157336'],
      MOCK_ITEMS['155']
    ]
  }
};

export const MOCK_SEASONS: Record<string, Episode[]> = {
  '66732-s1': [
    {
      id: 1198538,
      number: 1,
      name: 'Chapter One: The Vanishing of Will Byers',
      overview: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a secret lab harbors a sinister secret.',
      still: 'https://image.tmdb.org/t/p/w300/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      airDate: '2016-07-15',
      rating: 8.6
    },
    {
      id: 1198539,
      number: 2,
      name: 'Chapter Two: The Weirdo on Maple Street',
      overview: 'Lucas, Mike and Dustin try to talk to the girl they found. Hopper questions an anxious Joyce about a bizarre phone call.',
      still: 'https://image.tmdb.org/t/p/w300/AbMoecO0ZZio0LcgeLxlzdyGs6X.jpg',
      airDate: '2016-07-15',
      rating: 8.5
    },
    {
      id: 1198540,
      number: 3,
      name: 'Chapter Three: Holly, Jolly',
      overview: 'An increasingly frantic Joyce thinks Will is trying to communicate with her through the Christmas lights.',
      still: 'https://image.tmdb.org/t/p/w300/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
      airDate: '2016-07-15',
      rating: 8.8
    }
  ],
  '1396-s1': [
    {
      id: 62085,
      number: 1,
      name: 'Pilot',
      overview: 'When an unassuming high school chemistry teacher discovers he has lung cancer, he decides to team up with a former student to create crystal meth.',
      still: 'https://image.tmdb.org/t/p/w300/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
      airDate: '2008-01-20',
      rating: 8.5
    },
    {
      id: 62086,
      number: 2,
      name: "Cat's in the Bag...",
      overview: 'Walt and Jesse attempt to tie up loose ends. The desperate situation gets more complicated with the flip of a coin.',
      still: 'https://image.tmdb.org/t/p/w300/AbMoecO0ZZio0LcgeLxlzdyGs6X.jpg',
      airDate: '2008-01-27',
      rating: 8.3
    },
    {
      id: 62087,
      number: 3,
      name: "...And the Bag's in the River",
      overview: 'Walter fights with Jesse over his drug use, causing him to leave Walter alone with their captive, Krazy-8.',
      still: 'https://image.tmdb.org/t/p/w300/n8Dah3Tc1vlc4i7bQ9zYPWaFO0e.jpg',
      airDate: '2008-02-10',
      rating: 8.4
    }
  ]
};
