import { HomeCatalog, TitleDetails, Episode } from '../types';

export const MOCK_HOME_CATALOG: HomeCatalog = {
  hero: {
    id: '550',
    title: 'Fight Club',
    type: 'movie',
    rating: '8.4',
    year: '1999',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.',
    genres: ['Drama', 'Thriller']
  },
  rails: [
    {
      id: 'rail-trending',
      title: 'Trending Now',
      type: 'movie',
      category: 'trending',
      items: [
        {
          id: '550',
          title: 'Fight Club',
          type: 'movie',
          rating: '8.4',
          year: '1999',
          poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
          overview: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker.',
          genres: ['Drama', 'Thriller']
        },
        {
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
        {
          id: '1396',
          title: 'Breaking Bad',
          type: 'tv',
          rating: '9.5',
          year: '2008',
          poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
          overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
          genres: ['Crime', 'Drama', 'Thriller']
        },
        {
          id: '27205',
          title: 'Inception',
          type: 'movie',
          rating: '8.8',
          year: '2010',
          poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
          overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
          genres: ['Action', 'Sci-Fi', 'Adventure']
        },
        {
          id: '680',
          title: 'Pulp Fiction',
          type: 'movie',
          rating: '8.9',
          year: '1994',
          poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
          overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
          genres: ['Crime', 'Drama']
        }
      ]
    },
    {
      id: 'rail-popular-tv',
      title: 'Popular TV Series',
      type: 'tv',
      category: 'popular',
      items: [
        {
          id: '1396',
          title: 'Breaking Bad',
          type: 'tv',
          rating: '9.5',
          year: '2008',
          poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
          overview: 'Walter White, a New Mexico chemistry teacher, enters the dangerous world of drugs and crime.',
          genres: ['Crime', 'Drama']
        },
        {
          id: '66732',
          title: 'Stranger Things',
          type: 'tv',
          rating: '8.7',
          year: '2016',
          poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
          overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
          genres: ['Drama', 'Fantasy', 'Horror']
        },
        {
          id: '94997',
          title: 'House of the Dragon',
          type: 'tv',
          rating: '8.4',
          year: '2022',
          poster: 'https://image.tmdb.org/t/p/w500/1X4h40fcB4WWUmIBK0auT4zRBAV.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/etj5CuMuam3hGQ3QIzegXiEb0Wq.jpg',
          overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke.',
          genres: ['Action', 'Adventure', 'Drama', 'Fantasy']
        }
      ]
    },
    {
      id: 'rail-action',
      title: 'Action & Adventure',
      type: 'movie',
      category: 'action',
      items: [
        {
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
        {
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
        {
          id: '24428',
          title: 'The Avengers',
          type: 'movie',
          rating: '8.0',
          year: '2012',
          poster: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
          backdrop: 'https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
          overview: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki.',
          genres: ['Action', 'Sci-Fi', 'Adventure']
        }
      ]
    }
  ]
};

export const MOCK_TITLES: Record<string, TitleDetails> = {
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
      { id: '680', title: 'Pulp Fiction', type: 'movie', rating: '8.9', poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
      { id: '27205', title: 'Inception', type: 'movie', rating: '8.8', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' }
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
      { id: '66732', title: 'Stranger Things', type: 'tv', rating: '8.7', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg' }
    ]
  }
};

export const MOCK_SEASONS: Record<string, Episode[]> = {
  '1396-s1': [
    {
      id: 62085,
      number: 1,
      name: 'Pilot',
      overview: 'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student to create top-of-the-line crystal meth.',
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
