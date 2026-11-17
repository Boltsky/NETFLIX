import { HomeCatalog, CatalogRail, MediaItem, CategoryQueryParams, CategoryResponse, TitleDetails } from '../types/index.js';

export const RICH_ITEMS: Record<string, MediaItem> = {
  "13": {
    "id": "13",
    "title": "Forrest Gump",
    "type": "movie",
    "rating": "8.5",
    "year": "1994",
    "poster": "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/66Kn4XWhkuPkJxOJyPEx4U2CUfN.jpg",
    "overview": "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
    "genres": []
  },
  "27": {
    "id": "27",
    "title": "9 Songs",
    "type": "movie",
    "rating": "5.5",
    "year": "2004",
    "poster": "https://image.tmdb.org/t/p/w500/91O7z0vo7MiNWd5xD2BoivwbQsb.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/bybAHw5fenKXRFI4phanPhpljlT.jpg",
    "overview": "Matt, a young glaciologist, soars across the vast, silent, icebound immensities of the South Pole as he recalls his love affair with Lisa. They meet at a mobbed rock concert in a vast music hall - London's Brixton Academy. They are in bed at night's end. Together, over a period of several months, they pursue a mutual sexual passion whose inevitable stages unfold in counterpoint to nine live-concert songs.",
    "genres": []
  },
  "129": {
    "id": "129",
    "title": "Spirited Away",
    "type": "movie",
    "rating": "8.5",
    "year": "2001",
    "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
    "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    "genres": []
  },
  "155": {
    "id": "155",
    "title": "The Dark Knight",
    "type": "movie",
    "rating": "8.5",
    "year": "2008",
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
    "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    "genres": []
  },
  "278": {
    "id": "278",
    "title": "The Shawshank Redemption",
    "type": "movie",
    "rating": "8.7",
    "year": "1994",
    "poster": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/pNjh59JSxChQktamG3LMp9ZoQzp.jpg",
    "overview": "Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
    "genres": []
  },
  "456": {
    "id": "456",
    "title": "The Simpsons",
    "type": "tv",
    "rating": "8.0",
    "year": "1989",
    "poster": "https://image.tmdb.org/t/p/w500/tf0CUEynk6GfmrlHIQKQ5mfFP5P.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/jIArNHIekrCSVgdMbKPAXpPY03Y.jpg",
    "overview": "Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.",
    "genres": []
  },
  "597": {
    "id": "597",
    "title": "Titanic",
    "type": "movie",
    "rating": "7.9",
    "year": "1997",
    "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/sCzcYW9h55WcesOqA12cgEr9Exw.jpg",
    "overview": "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
    "genres": []
  },
  "873": {
    "id": "873",
    "title": "Columbo",
    "type": "tv",
    "rating": "8.1",
    "year": "1971",
    "poster": "https://image.tmdb.org/t/p/w500/2JCD8vab3fircOU8cM2HJCxfv4I.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/d7cH4zt3xoqRQnLqYXMPOrUz5k3.jpg",
    "overview": "Columbo is a friendly, verbose, disheveled-looking police detective who is consistently underestimated by his suspects. Despite his unprepossessing appearance and apparent absentmindedness, he shrewdly solves all of his cases and secures all evidence needed for indictment. His formidable eye for detail and meticulously dedicated approach often become clear to the killer only late in the storyline.",
    "genres": []
  },
  "1100": {
    "id": "1100",
    "title": "How I Met Your Mother",
    "type": "tv",
    "rating": "8.1",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/b34jPzmB0wZy7EjUZoleXOl2RRI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3f8aW6vcYRP6mTZdgXm83BiuB9t.jpg",
    "overview": "A father recounts to his children - through a series of flashbacks - the journey he and his four best friends took leading up to him meeting their mother.",
    "genres": []
  },
  "1400": {
    "id": "1400",
    "title": "Seinfeld",
    "type": "tv",
    "rating": "8.2",
    "year": "1989",
    "poster": "https://image.tmdb.org/t/p/w500/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/tMRdEsMg9MyXAkcufK9YJEeIaNW.jpg",
    "overview": "A stand-up comedian and his three offbeat friends weather the pitfalls and payoffs of life in New York City in the '90s. It's a show about nothing.",
    "genres": []
  },
  "1408": {
    "id": "1408",
    "title": "House",
    "type": "tv",
    "rating": "8.6",
    "year": "2004",
    "poster": "https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/r0Q6eeN9L1ORL9QsV0Sg8ZV3vnv.jpg",
    "overview": "Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.",
    "genres": []
  },
  "1411": {
    "id": "1411",
    "title": "Person of Interest",
    "type": "tv",
    "rating": "8.1",
    "year": "2011",
    "poster": "https://image.tmdb.org/t/p/w500/f8aIvYk5h7Z8EP3dinCmVgQFYow.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/efeMgQn6iRALsOqDa2cqlf6Pw5O.jpg",
    "overview": "John Reese, former CIA paramilitary operative, is presumed dead and teams up with reclusive billionaire Finch to prevent violent crimes in New York City by initiating their own type of justice. With the special training that Reese has had in Covert Operations and Finch's genius software inventing mind, the two are a perfect match for the job that they have to complete. With the help of surveillance equipment, they work \"outside the law\" and get the right criminal behind bars. ",
    "genres": []
  },
  "1413": {
    "id": "1413",
    "title": "American Horror Story",
    "type": "tv",
    "rating": "8.1",
    "year": "2011",
    "poster": "https://image.tmdb.org/t/p/w500/yCkPLQ10qKIUgRBXmQVVMF1h96d.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/5G4Bnc4Q0YUK1bwLEUYmIsmm2Ib.jpg",
    "overview": "An anthology horror drama series centering on different characters and locations, including a house with a murderous past, an asylum, a witch coven, a freak show, a hotel, a farmhouse in Roanoke, a cult, the apocalypse and a summer camp.",
    "genres": []
  },
  "1416": {
    "id": "1416",
    "title": "Grey's Anatomy",
    "type": "tv",
    "rating": "8.2",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/gO8Fo47KV1opiutRDdBS5jclTQB.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/A4NwkQXTXElE5iAsne5RpvS8R2Z.jpg",
    "overview": "Follows the personal and professional lives of a group of doctors at Seattle's Grey Sloan Memorial Hospital.",
    "genres": []
  },
  "1421": {
    "id": "1421",
    "title": "Modern Family",
    "type": "tv",
    "rating": "7.9",
    "year": "2009",
    "poster": "https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/nO7EzksrBzlNpAg5rgv8HzaBIkx.jpg",
    "overview": "The Pritchett-Dunphy-Tucker clan is a wonderfully large and blended family. They give us an honest and often hilarious look into the sometimes warm, sometimes twisted, embrace of the modern family.",
    "genres": []
  },
  "1877": {
    "id": "1877",
    "title": "Phineas and Ferb",
    "type": "tv",
    "rating": "7.9",
    "year": "2007",
    "poster": "https://image.tmdb.org/t/p/w500/g6TidT7be954rrzPPBTIXkSmfXj.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/5MWFjQ3NuNtNeOE9FdrVLeNMNPs.jpg",
    "overview": "Each day, two kindhearted suburban stepbrothers on summer vacation embark on some grand new project, which annoys their controlling sister, Candace, who tries to bust them. Meanwhile, their pet platypus plots against evil Dr. Doofenshmirtz.",
    "genres": []
  },
  "2025": {
    "id": "2025",
    "title": "Beverly Hills, 90210",
    "type": "tv",
    "rating": "7.3",
    "year": "1990",
    "poster": "https://image.tmdb.org/t/p/w500/b7BYfkhu653D894krwGO1ysIKTf.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/iMFsQ7yyToYg7SkS9Ml0by9UJ0X.jpg",
    "overview": "Follow the lives of a group of teenagers living in the upscale, star-studded community of Beverly Hills, California and attending the fictitious West Beverly Hills High School and, subsequently, the fictitious California University after graduation.",
    "genres": []
  },
  "2119": {
    "id": "2119",
    "title": "Airwolf",
    "type": "tv",
    "rating": "7.6",
    "year": "1984",
    "poster": "https://image.tmdb.org/t/p/w500/4PAN7zPqmR9b73een97WkxqCTQN.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8693rGsfkROQjiwlJD8O2WQV1Et.jpg",
    "overview": "As part of a deal with an intelligence agency to look for his missing brother, a renegade pilot goes on missions with an advanced battle helicopter.",
    "genres": []
  },
  "2316": {
    "id": "2316",
    "title": "The Office",
    "type": "tv",
    "rating": "8.6",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/9vMzIrMIncPmtalcxh1MOrgcE6C.jpg",
    "overview": "The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.",
    "genres": []
  },
  "2734": {
    "id": "2734",
    "title": "Law & Order: Special Victims Unit",
    "type": "tv",
    "rating": "8.0",
    "year": "1999",
    "poster": "https://image.tmdb.org/t/p/w500/pHNhUwSXuDQ9jPZOCb8SgJaQZsc.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
    "overview": "In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.",
    "genres": []
  },
  "3933": {
    "id": "3933",
    "title": "Corpse Bride",
    "type": "movie",
    "rating": "7.6",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/3RAoVTxUk1OzZClscAsynuu670p.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/v23fWgJUEt8EMmvn19btIacxP8E.jpg",
    "overview": "In a 19th-century European village, a young man about to be married is whisked away to the underworld and wed to a mysterious corpse bride, while his real bride waits bereft in the land of the living.",
    "genres": []
  },
  "4057": {
    "id": "4057",
    "title": "Criminal Minds",
    "type": "tv",
    "rating": "8.3",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/hWSb4UnIjlTvnvrP98NbFSO60HA.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/tUtXfyVy54BY7eJnRtI8Xnmr1ZL.jpg",
    "overview": "An elite team of FBI profilers analyze the country's most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit's most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases.",
    "genres": []
  },
  "4620": {
    "id": "4620",
    "title": "Eureka",
    "type": "tv",
    "rating": "7.7",
    "year": "2006",
    "poster": "https://image.tmdb.org/t/p/w500/f2l5hUk63hPqYTucnFy2HmElFV0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8MQeyFsWrp2ILjbumtxrinmk7t4.jpg",
    "overview": "The sleepy Pacific Northwest town of Eureka is hiding a mysterious secret. The government has been relocating the world's geniuses and their families to this rustic town for years where innovation and chaos have lived hand in hand. U.S. Marshal Jack Carter stumbles upon this odd town after wrecking his car and becoming stranded there. When the denizens of the town unleash an unknown scientific creation, Carter jumps in to try to restore order and consequently learns of one of the country's best kept secrets.",
    "genres": []
  },
  "5920": {
    "id": "5920",
    "title": "The Mentalist",
    "type": "tv",
    "rating": "8.4",
    "year": "2008",
    "poster": "https://image.tmdb.org/t/p/w500/k0kMdO52LpC5JWgd0uWEH7gqcCe.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg",
    "overview": "Patrick Jane, a former celebrity psychic medium, uses his razor sharp skills of observation and expertise at \"reading\" people to solve serious crimes with the California Bureau of Investigation.",
    "genres": []
  },
  "9479": {
    "id": "9479",
    "title": "The Nightmare Before Christmas",
    "type": "movie",
    "rating": "7.9",
    "year": "1993",
    "poster": "https://image.tmdb.org/t/p/w500/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/dSfrsjhqC6lYe7LYDYnzWeXZmEl.jpg",
    "overview": "Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly Pumpkin King of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning in his place. But, as the holiday approaches, Jack's rag-doll girlfriend Sally tries to foil his well-meaning yet misguided plans.",
    "genres": []
  },
  "9674": {
    "id": "9674",
    "title": "Ring 0",
    "type": "movie",
    "rating": "6.1",
    "year": "2000",
    "poster": "https://image.tmdb.org/t/p/w500/nuhEWlaoMD00rTDCiYxdEc7d1tD.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/noRX8VyyAFK1tt0DQSq5qy1tE10.jpg",
    "overview": "Taking place thirty years before the events of Ringu, Ringu 0 provides the shocking background story of how the girl on the video became a deadly, vengeful spirit.",
    "genres": []
  },
  "9963": {
    "id": "9963",
    "title": "Premonition",
    "type": "movie",
    "rating": "6.3",
    "year": "2007",
    "poster": "https://image.tmdb.org/t/p/w500/vKW1XIYrIqVrbCaYj9FQDHKXR8R.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/esXYvlivZ8j0HGqob949CIjqnGi.jpg",
    "overview": "A depressed housewife who learns her husband was killed in a car accident the day previously awakens the next morning to find him alive and well at home, and then awakens the day after to a world in which he is still dead.",
    "genres": []
  },
  "12323": {
    "id": "12323",
    "title": "Beyond Belief: Fact or Fiction",
    "type": "tv",
    "rating": "7.3",
    "year": "1997",
    "poster": "https://image.tmdb.org/t/p/w500/x6t4LPGYdCLqsdijZqSOxzic3Tj.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/meku4H3J2lIxIqo7M8wkCqJ52cb.jpg",
    "overview": "Can you tell the difference between fact and fiction? Several stories of strange, mysterious and incredible occurrences are chronicled during each episode. It is up to the viewer to decide which stories actually happened and which were completely fabricated by the show’s writers. The answer is revealed by Jonathan Frakes at the conclusion of each episode.",
    "genres": []
  },
  "14836": {
    "id": "14836",
    "title": "Coraline",
    "type": "movie",
    "rating": "8.0",
    "year": "2009",
    "poster": "https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/hofnlIyF6bePkgQOpcuRWLvzf15.jpg",
    "overview": "Wandering her rambling old house in her boring new town, 11-year-old Coraline discovers a hidden door to a strangely idealized version of her life. In order to stay in the fantasy, she must make a frighteningly real sacrifice.",
    "genres": []
  },
  "18165": {
    "id": "18165",
    "title": "The Vampire Diaries",
    "type": "tv",
    "rating": "8.3",
    "year": "2009",
    "poster": "https://image.tmdb.org/t/p/w500/aBkVgChtyyJaHyZh1gfd8DbzQon.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/cJYLon9ejKJV7ua03ab8Tj9u067.jpg",
    "overview": "The story of two vampire brothers obsessed with the same girl, who bears a striking resemblance to the beautiful but ruthless vampire they knew and loved in 1864.",
    "genres": []
  },
  "22980": {
    "id": "22980",
    "title": "Watch What Happens Live with Andy Cohen",
    "type": "tv",
    "rating": "4.9",
    "year": "2009",
    "poster": "https://image.tmdb.org/t/p/w500/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg",
    "overview": "Bravo network executive Andy Cohen discusses pop culture topics with celebrities and reality show personalities.",
    "genres": []
  },
  "27205": {
    "id": "27205",
    "title": "Inception",
    "type": "movie",
    "rating": "8.4",
    "year": "2010",
    "poster": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    "genres": []
  },
  "32573": {
    "id": "32573",
    "title": "Strike Back",
    "type": "tv",
    "rating": "7.4",
    "year": "2010",
    "poster": "https://image.tmdb.org/t/p/w500/c0ItaC2Grf4WVJ06G87BjNn9pRs.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/2tL3pNaPQb2ioEYswMkDGVTo1pt.jpg",
    "overview": "The series follows John Porter, a former British Special Forces soldier, who is drafted back into service by Section 20, a fictional branch of the Secret Intelligence Service.",
    "genres": []
  },
  "37678": {
    "id": "37678",
    "title": "The Voice",
    "type": "tv",
    "rating": "5.8",
    "year": "2011",
    "poster": "https://image.tmdb.org/t/p/w500/7ah1WExcMkzbq7sARCTmcC23tBr.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/x8pSFa3BXyVpkjHyn7YxmLyhjoh.jpg",
    "overview": "The strongest vocalists from across the United states compete in a blockbusters vocal competition, the winner becomes “The Voice.” The show's innovative format features four stages of competition: the blind auditions, the battle rounds, the knockouts and, finally, the live performance shows.",
    "genres": []
  },
  "37854": {
    "id": "37854",
    "title": "One Piece",
    "type": "tv",
    "rating": "8.8",
    "year": "1999",
    "poster": "https://image.tmdb.org/t/p/w500/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg",
    "overview": "Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving a huge pile of treasure and the famous \"One Piece\" behind. Whoever claims the \"One Piece\" will be named the new King of the Pirates.\n\nMonkey D. Luffy, a boy who consumed a \"Devil Fruit,\" decides to follow in the footsteps of his idol, the pirate Shanks, and find the One Piece. It helps, of course, that his body has the properties of rubber and that he's surrounded by a bevy of skilled fighters and thieves to help him along the way.\n\nLuffy will do anything to get the One Piece and become King of the Pirates!",
    "genres": []
  },
  "46648": {
    "id": "46648",
    "title": "True Detective",
    "type": "tv",
    "rating": "8.3",
    "year": "2014",
    "poster": "https://image.tmdb.org/t/p/w500/cuV2O5ZyDLHSOWzg3nLVljp1ubw.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/v8YFr8BbU9qsO8PYIulzTeM6Qk.jpg",
    "overview": "An American anthology police detective series utilizing multiple timelines in which investigations seem to unearth personal and professional secrets of those involved, both within or outside the law.",
    "genres": []
  },
  "48650": {
    "id": "48650",
    "title": "Room in Rome",
    "type": "movie",
    "rating": "6.4",
    "year": "2010",
    "poster": "https://image.tmdb.org/t/p/w500/w90ItYf9qagQKVEBr1uFxPomAtf.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/abQxLSkGxpHyUxRjRXACt8NbiGf.jpg",
    "overview": "A hotel room in the center of Rome serves as the setting for Alba and Natasha, two sexy and recently acquainted women, to have a physical adventure that touches their very souls.",
    "genres": []
  },
  "48866": {
    "id": "48866",
    "title": "The 100",
    "type": "tv",
    "rating": "7.9",
    "year": "2014",
    "poster": "https://image.tmdb.org/t/p/w500/wHIMMLFsk32wIzDmawWkYVbxFCS.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8ZerYKvIaNUJZvAHXYTQu4qTwFw.jpg",
    "overview": "100 years in the future, when the Earth has been abandoned due to radioactivity, the last surviving humans live on an ark orbiting the planet — but the ark won't last forever. So the repressive regime picks 100 expendable juvenile delinquents to send down to Earth to see if the planet is still habitable.",
    "genres": []
  },
  "57243": {
    "id": "57243",
    "title": "Doctor Who",
    "type": "tv",
    "rating": "7.6",
    "year": "2005",
    "poster": "https://image.tmdb.org/t/p/w500/lHfmc6d8pOVFrD0eOKPiDbjeucG.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/vcFW09U4834DyFOeRZpsx9x1D3S.jpg",
    "overview": "The Doctor is a Time Lord: a 900 year old alien with 2 hearts, part of a gifted civilization who mastered time travel. The Doctor saves planets for a living—more of a hobby actually, and the Doctor's very, very good at it.",
    "genres": []
  },
  "60735": {
    "id": "60735",
    "title": "The Flash",
    "type": "tv",
    "rating": "7.7",
    "year": "2014",
    "poster": "https://image.tmdb.org/t/p/w500/yZevl2vHQgmosfwUdVNzviIfaWS.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/gFkHcIh7iE5G0oVOgpmY8ONQjhl.jpg",
    "overview": "After being struck by lightning, CSI investigator Barry Allen awakens from a nine-month coma to discover he has been  granted the gift of super speed.  Teaming up with S.T.A.R. Labs, Barry takes on the persona of The Flash, the Fastest  Man Alive, to protect his city.",
    "genres": []
  },
  "61733": {
    "id": "61733",
    "title": "Empire",
    "type": "tv",
    "rating": "7.1",
    "year": "2015",
    "poster": "https://image.tmdb.org/t/p/w500/gTrzYR6gWMhQ8yINW9JCLeoJHvf.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/FNeJtRUd5XID186SHzjNNneP3f.jpg",
    "overview": "A powerful family drama about the head of a music empire whose three sons and ex-wife all battle for his throne.",
    "genres": []
  },
  "61923": {
    "id": "61923",
    "title": "Star vs. the Forces of Evil",
    "type": "tv",
    "rating": "8.4",
    "year": "2015",
    "poster": "https://image.tmdb.org/t/p/w500/dKFL1AOdKNoazqZDg1zq2z69Lx1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/2UElp7Dkm3SiB9ZEdKEWNmAOijB.jpg",
    "overview": "Intergalactic warrior Star Butterfly arrives on Earth to live with the Diaz family. She continues to battle villains throughout the universe and high school, mainly to protect her extremely powerful wand, an object that still confuses her.",
    "genres": []
  },
  "61928": {
    "id": "61928",
    "title": "Lucha Underground",
    "type": "tv",
    "rating": "7.1",
    "year": "2014",
    "poster": "https://image.tmdb.org/t/p/w500/by1AztJ9I1gjWKPL3XdYxiFOU5T.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/lQp79IOcrLdPps9BvnKPvOeX6pD.jpg",
    "overview": "Lucha Underground introduces U.S. audiences to the high-flying, explosive moves of lucha libre. An ancient combat tradition, watch as good and evil wage war in a gritty battleground called “The Temple.”",
    "genres": []
  },
  "63333": {
    "id": "63333",
    "title": "The Last Kingdom",
    "type": "tv",
    "rating": "8.3",
    "year": "2015",
    "poster": "https://image.tmdb.org/t/p/w500/8eJf0hxgIhE6QSxbtuNCekTddy1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/QbtctI8EzlhsyFDMUMyG3fli8B.jpg",
    "overview": "A show of heroic deeds and epic battles with a thematic depth that embraces politics, religion, warfare, courage, love, loyalty and our universal search for identity. Combining real historical figures and events with fictional characters, it is the story of how a people combined their strength under one of the most iconic kings of history in order to reclaim their land for themselves and build a place they call home.",
    "genres": []
  },
  "64414": {
    "id": "64414",
    "title": "Wakfu",
    "type": "tv",
    "rating": "8.3",
    "year": "2008",
    "poster": "https://image.tmdb.org/t/p/w500/nA8Z1fq3OTE2IrM8BiWxlPmrCpU.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/794lCiKgncQg4tE2FDY8GVcEubZ.jpg",
    "overview": "Follow Yugo and his friends Amalia, Evangelyne, Tristepin, Ruel and Az as they try to rescue the world of Wakfu from destruction.",
    "genres": []
  },
  "82873": {
    "id": "82873",
    "title": "The Kelly Clarkson Show",
    "type": "tv",
    "rating": "6.2",
    "year": "2019",
    "poster": "https://image.tmdb.org/t/p/w500/sBix25bie9UQFzbarN51DpFO5ky.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/bk7QdAIUqkGpZO5GUX4AMB2AZIB.jpg",
    "overview": "Kelly Clarkson presents the biggest newsmakers and names in film, television and music; as well as emerging new talent and everyday people who are beacons of hope in their communities.",
    "genres": []
  },
  "83631": {
    "id": "83631",
    "title": "What We Do in the Shadows",
    "type": "tv",
    "rating": "8.0",
    "year": "2019",
    "poster": "https://image.tmdb.org/t/p/w500/wa3ZQE9kLnqwN3vQ0NNjg1NPsCa.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/mKikck71CvVISUSTLk29fwRbH4y.jpg",
    "overview": "A documentary-style look into the daily (or rather, nightly) lives of a group of vampires in Staten Island who have “lived” together for hundreds and hundreds of years.",
    "genres": []
  },
  "84773": {
    "id": "84773",
    "title": "The Lord of the Rings: The Rings of Power",
    "type": "tv",
    "rating": "7.2",
    "year": "2022",
    "poster": "https://image.tmdb.org/t/p/w500/bMXWXKM9ydUmMTNvDnYo9QtCBRt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/uVOcz7JBOuZxsx9IYpx6Ah174LX.jpg",
    "overview": "Beginning in a time of relative peace, we follow an ensemble cast of characters as they confront the re-emergence of evil to Middle-earth. From the darkest depths of the Misty Mountains, to the majestic forests of Lindon, to the breathtaking island kingdom of Númenor, to the furthest reaches of the map, these kingdoms and characters will carve out legacies that live on long after they are gone.",
    "genres": []
  },
  "157336": {
    "id": "157336",
    "title": "Interstellar",
    "type": "movie",
    "rating": "8.5",
    "year": "2014",
    "poster": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    "genres": []
  },
  "231100": {
    "id": "231100",
    "title": "Boundless Love",
    "type": "tv",
    "rating": "8.1",
    "year": "2023",
    "poster": "https://image.tmdb.org/t/p/w500/1BQSLOIvjnBzrxkXjX9R0JfHTWI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/vV5GFJtp8DgAysY1F0WfIwedi81.jpg",
    "overview": "When he was a little child, Halil İbrahim lost his father due to a blood feud and was exiled to Istanbul. Twenty years later, he returns to his homeland in the Karadeniz region as a handsome, powerful young man. He plans to marry the girl he loves, Yasemin, and start a new life. However, events do not allow this. Halil İbrahim embarks on a journey of revenge, and his life will change completely when he encounters Zeynep from the Leto family.",
    "genres": []
  },
  "247718": {
    "id": "247718",
    "title": "MobLand",
    "type": "tv",
    "rating": "8.7",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/5Xc7WpWsgflfgEMoBlf9TmWhfbH.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/h0OC7ouop8YLwbAVfS3UUE2Lw4T.jpg",
    "overview": "Two mob families clash in a war that threatens to topple empires and lives.",
    "genres": []
  },
  "253376": {
    "id": "253376",
    "title": "The Girlfriend",
    "type": "tv",
    "rating": "7.1",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/ktrp3tdZ5IQpFux4nLy8z70bt3n.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/lnVWmFvLv2pTZGsuAJytiqKu541.jpg",
    "overview": "Laura has it all: a glittering career, a loving husband, and her precious son, Daniel. But her perfect life unravels when Daniel brings home Cherry, a girlfriend who changes everything. After a tense introduction, Laura becomes convinced Cherry is hiding something. Is she a manipulative social climber, or is Laura just paranoid? The truth is a matter of perspective.",
    "genres": []
  },
  "299534": {
    "id": "299534",
    "title": "Avengers: Endgame",
    "type": "movie",
    "rating": "8.2",
    "year": "2019",
    "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    "genres": []
  },
  "299536": {
    "id": "299536",
    "title": "Avengers: Infinity War",
    "type": "movie",
    "rating": "8.2",
    "year": "2018",
    "poster": "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
    "overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
    "genres": []
  },
  "354912": {
    "id": "354912",
    "title": "Coco",
    "type": "movie",
    "rating": "8.2",
    "year": "2017",
    "poster": "https://image.tmdb.org/t/p/w500/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg",
    "overview": "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
    "genres": []
  },
  "399783": {
    "id": "399783",
    "title": "Summer with Mika",
    "type": "movie",
    "rating": "2.7",
    "year": "2016",
    "poster": "https://image.tmdb.org/t/p/w500/uPD3uYiJD5PKmR1bM4id6LUAwYh.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/eeuafT0yXn0T7YA9ScmAbp1XMoO.jpg",
    "overview": "Jeong Min is a writer. He comes to a coffee shop because his writing comes to a stand. Inspired by a Japanese woman who drops by the coffee shop for job, Jeong Min decides to write 3 short stories of a Japanese woman / omnibus fantasy melodrama.",
    "genres": []
  },
  "494656": {
    "id": "494656",
    "title": "The Legend of the Black Charro",
    "type": "movie",
    "rating": "8.3",
    "year": "2018",
    "poster": "https://image.tmdb.org/t/p/w500/fDLJ5vIeRL68cIHlob11w2pBzH0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3AXR3AFTHdU38OR14jfcK8FjJ5H.jpg",
    "overview": "After releasing the Chupacabras, Leo San Juan decides that it is time to return together with his brother Nando to his grandmother's house. Halfway down the road, Charro Negro manages to confuse Leo and because of him, an innocent girl is dragged into the underworld. Leo is forced to repair the damage. His friends will come to try to help him and get out of there as soon as possible. But it is no coincidence that the Charro has chosen to involve Leo, his intentions go beyond getting a new soul.",
    "genres": []
  },
  "533535": {
    "id": "533535",
    "title": "Deadpool & Wolverine",
    "type": "movie",
    "rating": "7.6",
    "year": "2024",
    "poster": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
    "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    "genres": []
  },
  "656908": {
    "id": "656908",
    "title": "Ramayana: Rise of a Legend",
    "type": "movie",
    "rating": "7.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
    "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
    "genres": []
  },
  "687163": {
    "id": "687163",
    "title": "Project Hail Mary",
    "type": "movie",
    "rating": "8.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
    "overview": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
    "genres": []
  },
  "755898": {
    "id": "755898",
    "title": "War of the Worlds",
    "type": "movie",
    "rating": "4.0",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
    "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
    "genres": []
  },
  "791523": {
    "id": "791523",
    "title": "Wildwood",
    "type": "movie",
    "rating": "8.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/snFM00mpNAfUzUtkdEW0uDEvXA0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
    "overview": "Prue and her classmate Curtis are drawn into a magical forest filled with enchanted creatures, loyal allies, and formidable adversaries as they embark on a desperate quest to rescue Prue's abducted baby brother from a murder of crows led by a mysterious woman named Alexandra.",
    "genres": []
  },
  "822653": {
    "id": "822653",
    "title": "Puella Magi Madoka Magica the Movie -Walpurgisnacht: Rising-",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/g4kCd4rMuN7G3VQQDUT6mLbrBqQ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/xzm3RfWh932rS28WErNC3u8qzVm.jpg",
    "overview": "After the events of Rebellion, the world appears to be in balance—but that peace is fragile. As a new threat connected to Walpurgisnacht emerges, Homura Akemi is forced to face the consequences of her choices and question how far she is willing to go to protect Madoka.",
    "genres": []
  },
  "891621": {
    "id": "891621",
    "title": "Wild Horse Nine",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/dNJFRtVg3xLQ7dbNIQ55cmmIniD.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3uLA0ujne91bkzFStZICCYeqhnt.jpg",
    "overview": "Shortly before the 1973 Chilean coup, CIA agents Chris and Lee are dispatched from Santiago to Easter Island by their bureau chief, MJ. Amongst the Island's iconic statues, and as the longtime partners wrestle with their dark pasts and present conspiracies, Chris's newfound bond with a pair of rebellious students threatens to send everyone’s trip to this remote paradise sideways.",
    "genres": []
  },
  "940721": {
    "id": "940721",
    "title": "Godzilla Minus One",
    "type": "movie",
    "rating": "7.6",
    "year": "2023",
    "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
    "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
    "genres": []
  },
  "969681": {
    "id": "969681",
    "title": "Spider-Man: Brand New Day",
    "type": "movie",
    "rating": "8.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
    "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
    "genres": []
  },
  "980431": {
    "id": "980431",
    "title": "Avatar Aang: The Last Airbender",
    "type": "movie",
    "rating": "9.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg",
    "overview": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
    "genres": []
  },
  "1058424": {
    "id": "1058424",
    "title": "Hope",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/j96rurZqmBjyY37Fncl3IB0qJNe.jpg",
    "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
    "genres": []
  },
  "1084242": {
    "id": "1084242",
    "title": "Zootopia 2",
    "type": "movie",
    "rating": "7.7",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/lgotja3xMoJZbynwHfcQcJAEMWH.jpg",
    "overview": "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
    "genres": []
  },
  "1084244": {
    "id": "1084244",
    "title": "Toy Story 5",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
    "overview": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
    "genres": []
  },
  "1101383": {
    "id": "1101383",
    "title": "The End of Oak Street",
    "type": "movie",
    "rating": "7.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/7DmtuAK5gYGlMFA45Oxkl1bEpIC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/wnR8pwWtoL3TFwP41mLCt91ReCt.jpg",
    "overview": "After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.",
    "genres": []
  },
  "1101412": {
    "id": "1101412",
    "title": "Fall 2: Deadpoint",
    "type": "movie",
    "rating": "7.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
    "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
    "genres": []
  },
  "1108427": {
    "id": "1108427",
    "title": "Moana",
    "type": "movie",
    "rating": "7.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
    "overview": "Teenage Moana answers the Ocean's call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people.",
    "genres": []
  },
  "1117898": {
    "id": "1117898",
    "title": "The Cat in the Hat",
    "type": "movie",
    "rating": "7.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/9y9o686DsQg0KzPtERzcW7Cf8IE.jpg",
    "overview": "Assigned his toughest mission yet, the Cat must cheer up siblings Gabby and Sebastian as they adjust to life in a new town. Known for pushing boundaries, this agent of chaos must prove himself or risk losing his magical hat forever.",
    "genres": []
  },
  "1128204": {
    "id": "1128204",
    "title": "Feed",
    "type": "movie",
    "rating": "6.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/nICoMIb6FcHqnrKeO43zKY3w8vT.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/4ZeaWA6DzFVOjWTi70b9ZAaQktf.jpg",
    "overview": "Five social media influencers spend a weekend at a forest retreat but inadvertently awaken and confront the world's first vampire.",
    "genres": []
  },
  "1148365": {
    "id": "1148365",
    "title": "Matchbox the Movie",
    "type": "movie",
    "rating": "7.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/aHhHRz6nOpwkqJs5ASeRGAdK2dt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg",
    "overview": "When a group of former childhood friends reconnect, their reunion takes a wild turn as they stumble upon a dangerous international plot—and must save the world.",
    "genres": []
  },
  "1153576": {
    "id": "1153576",
    "title": "Street Fighter",
    "type": "movie",
    "rating": "6.3",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
    "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
    "genres": []
  },
  "1185344": {
    "id": "1185344",
    "title": "The Beast",
    "type": "movie",
    "rating": "5.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
    "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
    "genres": []
  },
  "1185806": {
    "id": "1185806",
    "title": "PAW Patrol: The Dino Movie",
    "type": "movie",
    "rating": "8.1",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/cxXSF4aY5N2cOGwaga5OnpPFHzk.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/dY4LyVSvjk9dN20YsxuouaMIMox.jpg",
    "overview": "The Paw Patrol lands on a mysterious dinosaur island after a storm, where they meet Rex, a stranded pup. When Humdinger's reckless mining triggers a volcano, the team faces their biggest rescue mission yet to save the island.",
    "genres": []
  },
  "1187326": {
    "id": "1187326",
    "title": "Tad and The Magic Lamp",
    "type": "movie",
    "rating": "8.3",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/AdDxZgNmRYgDuweY8899buyVqlr.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/zbpimMxf6Ms96v3Zypuv8WltMSO.jpg",
    "overview": "Tadeo, his girlfriend Sara, and his friends Momia, Jeff, and Belzoni embark on an adventure after Tadeo accidentally unleashes an ancient spell.",
    "genres": []
  },
  "1195803": {
    "id": "1195803",
    "title": "Wicker",
    "type": "movie",
    "rating": "7.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/6FcBZOKvyrLCKGCyBG0ySCR4okt.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/xVh1ypMoVkMf5IB7y3hnRplJ14c.jpg",
    "overview": "On the outskirts of a village by the sea, lives a Fisherwoman; smelly, single and perpetually ridiculed. One day, fed up with her stuffy, small-minded neighbours, she commissions herself a husband to be made from wicker. In an otherwise conservative town, this unconventional romance sparks outrage, jealousy and chaos.",
    "genres": []
  },
  "1204680": {
    "id": "1204680",
    "title": "Coyote vs. Acme",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
    "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
    "genres": []
  },
  "1218925": {
    "id": "1218925",
    "title": "Chainsaw Man - The Movie: Reze Arc",
    "type": "movie",
    "rating": "8.5",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/i69jR67amezdJ3sx6OOvOGn7HAR.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/gqTz24ZRsCP6AKjARmEivY7m0cK.jpg",
    "overview": "In a world where devils are born from humanity’s fears, Denji has only ever dreamed of living a simple life, eating good food, finding happiness, and experiencing the warmth of being loved. Then, one rainy afternoon, fate leads him to Reze, a mysterious girl working at a small café. With her disarming smile, playful charm, and unexpected kindness, she offers Denji something he has rarely known—a glimpse of an ordinary life beyond bloodshed and chaos.",
    "genres": []
  },
  "1226863": {
    "id": "1226863",
    "title": "The Super Mario Galaxy Movie",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/kxQiIJ4gVcD3K6o14MJ72p5yRcE.jpg",
    "overview": "Having thwarted Bowser's previous plot to marry Princess Peach, Mario and Luigi now face a fresh threat in Bowser Jr., who is determined to liberate his father from captivity and restore the family legacy. Alongside companions new and old, the brothers travel across the stars to stop the young heir's crusade.",
    "genres": []
  },
  "1228834": {
    "id": "1228834",
    "title": "The Fix",
    "type": "movie",
    "rating": "5.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
    "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
    "genres": []
  },
  "1232569": {
    "id": "1232569",
    "title": "Pinocchio: Unstrung",
    "type": "movie",
    "rating": "6.3",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/hJNdizFlxOW89edX3Rzr6OliSFI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/7RsPdXLDNugDIlwXPVeeprNfMx.jpg",
    "overview": "Influenced by a sinister Cricket and created by Geppetto, Pinocchio launches a violent crusade to carve himself into a real boy like his brother James, one piece at a time.",
    "genres": []
  },
  "1234139": {
    "id": "1234139",
    "title": "Jailer 2",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/upwdEyhhYZ7pT2hD535fr2MGfpx.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/m0ks2o59mOAz6WdCybJ5FAUNTOU.jpg",
    "overview": "When a dangerous syndicate threatens his family, retired jailer Tiger Muthuvel Pandian goes undercover as a driver to battle enemies from the shadows.",
    "genres": []
  },
  "1244523": {
    "id": "1244523",
    "title": "Beware Boiúna",
    "type": "movie",
    "rating": "6.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
    "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
    "genres": []
  },
  "1263337": {
    "id": "1263337",
    "title": "Heart of the Beast",
    "type": "movie",
    "rating": "7.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
    "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
    "genres": []
  },
  "1275779": {
    "id": "1275779",
    "title": "Disclosure Day",
    "type": "movie",
    "rating": "7.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/AnJ8IQJI23hNpYXVNaythu061Ru.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/1e0KDRYKRPHiVNj8yQKYuU2jVyQ.jpg",
    "overview": "A cybersecurity expert becomes a whistleblower after uncovering secrets about aliens, putting him on the run from a corporation. Meanwhile, a meteorologist experiencing strange phenomena joins forces with him to prove there's life beyond our understanding.",
    "genres": []
  },
  "1283515": {
    "id": "1283515",
    "title": "Verity",
    "type": "movie",
    "rating": "7.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
    "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
    "genres": []
  },
  "1286656": {
    "id": "1286656",
    "title": "I Play Rocky",
    "type": "movie",
    "rating": "8.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/xE5tY3lppZUyG7WKKThsuYHuAHr.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/1lnnjBCRLZzKRhQipK5zm61YkPe.jpg",
    "overview": "The electrifying true story about an unknown actor with an unshakable belief that he wasn't just meant to write Rocky—he was meant to be Rocky Balboa. Told \"no\" at every turn, Sylvester Stallone bets everything on himself, holding the line on playing the lead against seemingly impossible odds.",
    "genres": []
  },
  "1288445": {
    "id": "1288445",
    "title": "Mutiny",
    "type": "movie",
    "rating": "7.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
    "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
    "genres": []
  },
  "1291595": {
    "id": "1291595",
    "title": "Insidious: Out of the Further",
    "type": "movie",
    "rating": "7.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
    "overview": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
    "genres": []
  },
  "1294189": {
    "id": "1294189",
    "title": "The Mongoose",
    "type": "movie",
    "rating": "6.3",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
    "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
    "genres": []
  },
  "1302904": {
    "id": "1302904",
    "title": "Practical Magic 2",
    "type": "movie",
    "rating": "7.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
    "overview": "The Owens sisters must confront the dark curse that threatens to unravel their family once and for all.",
    "genres": []
  },
  "1310458": {
    "id": "1310458",
    "title": "Saayavanam",
    "type": "movie",
    "rating": "N/A",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/tSuqCq3YYLS8VOdiU9ikKOBs5Tz.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/anz69m07H9b2zG5Hw5OSQ71dwxJ.jpg",
    "overview": "Sita tries to live an honest and truthful life following all religious and social norms of her upbringing while unraveling the true agenda of men around her. In this process, she emerges victorious as a strong and brave woman.",
    "genres": []
  },
  "1311031": {
    "id": "1311031",
    "title": "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
    "type": "movie",
    "rating": "8.8",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/fWVSwgjpT2D78VUh6X8UBd2rorW.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/1RgPyOhN4DRs225BGTlHJqCudII.jpg",
    "overview": "The Demon Slayer Corps are drawn into the Infinity Castle, where Tanjiro, Nezuko, and the Hashira face terrifying Upper Rank demons in a desperate fight as the final battle against Muzan Kibutsuji begins.",
    "genres": []
  },
  "1315772": {
    "id": "1315772",
    "title": "Minions & Monsters",
    "type": "movie",
    "rating": "7.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
    "overview": "This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created.",
    "genres": []
  },
  "1327819": {
    "id": "1327819",
    "title": "Hoppers",
    "type": "movie",
    "rating": "8.1",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/u53UYu5XG2hNgWGvs3xGhAVzypl.jpg",
    "overview": "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
    "genres": []
  },
  "1339713": {
    "id": "1339713",
    "title": "Obsession",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/5lTZyuBTNOfawsfPT8Q0cIg6qAF.jpg",
    "overview": "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
    "genres": []
  },
  "1368337": {
    "id": "1368337",
    "title": "The Odyssey",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
    "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
    "genres": []
  },
  "1375441": {
    "id": "1375441",
    "title": "Primetime",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/lmrulvLbmaejTix1YaMxo1oGhH1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/sEsMwSDUWGIx9EfNxzM6KzVSsSQ.jpg",
    "overview": "In 2006, To Catch a Predator host Chris Hansen sets out to make television history. When a high stakes operation goes fatally wrong, his veneered dream of fame curdles into a nightmare of performative justice.",
    "genres": []
  },
  "1375646": {
    "id": "1375646",
    "title": "Colony",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/enz3WLx5QU1FUyhXZld04QWIc6N.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/iGViga8sDCET1S6GfwOlAbuhSGQ.jpg",
    "overview": "Professor Se-jeong is thrust into a bloody nightmare when a rapidly mutating virus is released during a biotech conference causing authorities to seal the facility. Trapped inside with no escape, Se-jeong along with a small group of survivors must fight to stay alive while the infected undergo horrific transformations.",
    "genres": []
  },
  "1377237": {
    "id": "1377237",
    "title": "Runner",
    "type": "movie",
    "rating": "8.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/vJk2TW1QZAmBiD7oj9ZF9EPTYY1.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg",
    "overview": "A former soldier is thrown into a brutal race against time when a critical medical delivery makes him and his unlikely partner the targets of a ruthless cartel. As the mission spirals into a deadly manhunt, every detour, delay, and bullet pushes them closer to failure. With betrayal closing in from every side, they must survive the chase and deliver their cargo to save the life of a little girl.",
    "genres": []
  },
  "1378742": {
    "id": "1378742",
    "title": "Drive Through Fire",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/lmQKEJ4Te7CQ5mhnXwr3zCLnOvc.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8Tw90S4hVrvUoqmQWDoO6U4toZT.jpg",
    "overview": "The story follows an addict war veteran turned rideshare driver who helps a terrified passenger escape a human trafficking ring serving wealthy clients.",
    "genres": []
  },
  "1381071": {
    "id": "1381071",
    "title": "Godzilla Minus Zero",
    "type": "movie",
    "rating": "7.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
    "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
    "genres": []
  },
  "1381078": {
    "id": "1381078",
    "title": "Love of Your Life",
    "type": "movie",
    "rating": "6.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/dL3Tcv4FU2K85bgnGRBgLjFSrLr.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/4hneB0UFKOZAGJHqJ3VhDcG72uH.jpg",
    "overview": "After a chance encounter sparks a sweeping romance, Maya's future is suddenly upended, sending her on an unexpected journey to love and live again.",
    "genres": []
  },
  "1384216": {
    "id": "1384216",
    "title": "The Dog Stars",
    "type": "movie",
    "rating": "7.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/5O616X9vmRzQdB68PHzBewPittd.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3k7GzxOdLZkN3eZsuhLi2eRzkXO.jpg",
    "overview": "After the world's population has been ravaged by a pandemic, a man lives a lonesome existence in a Colorado airplane hangar with his dog and a dour gunman he has befriended. When a mysterious transmission comes through on the radio while he’s flying his old Cessna, it sparks a hunt for the provenance of the sound.",
    "genres": []
  },
  "1389379": {
    "id": "1389379",
    "title": "Ranabaali",
    "type": "movie",
    "rating": "5.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/cXaCyYYbafVyMrs8rwKmxezBYPJ.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/xpImgnsxuqb3VOp0QRtXTS5uBRi.jpg",
    "overview": "Set in 19th-century British India, a fierce leader rises from a drought-stricken land to fight colonial oppression and atrocities.",
    "genres": []
  },
  "1400837": {
    "id": "1400837",
    "title": "Other Mommy",
    "type": "movie",
    "rating": "6.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
    "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
    "genres": []
  },
  "1400940": {
    "id": "1400940",
    "title": "Clayface",
    "type": "movie",
    "rating": "7.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/9l1NuFjel2j89hiuiJbsxfblqjy.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/xSDoxv4pHvs4xZjvTb0Iqg1A6ro.jpg",
    "overview": "Matt Hagen's meteoric rise from Gotham street kid to Hollywood leading man is tragically cut short when a local crime boss's actions leave him horribly disfigured. Abandoned by his team and with nothing left, Matt seeks out a cutting edge treatment that miraculously returns him to his former self… but also unexpectedly affects his grip on reality, spiraling him down a destructive path of all-consuming revenge.",
    "genres": []
  },
  "1422041": {
    "id": "1422041",
    "title": "La Bola Negra",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/7HwFQTMghL6HOvzEnXYUvyuZXeh.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/bDsmYvrzto7xrEwqDpLC3SPhn9A.jpg",
    "overview": "The intertwined lives of three men in three different eras, three lives intimately linked by sexuality and desire, pain, and legacy.",
    "genres": []
  },
  "1423191": {
    "id": "1423191",
    "title": "Resident Evil",
    "type": "movie",
    "rating": "7.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
    "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
    "genres": []
  },
  "1432306": {
    "id": "1432306",
    "title": "Sleepwalker",
    "type": "movie",
    "rating": "4.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/760SP4VsZagpyB9WLfeZykE3DFg.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/2dYKSPT1SJZVlKwXHic4Ma53f0X.jpg",
    "overview": "A grieving mother is haunted by the tragic loss of her daughter in a car accident that left her abusive husband in a coma. As she battles a surreal descent into darkness, her sleepwalking episodes intensify. Plagued by haunting visions of her husband inside their home, she grapples with the blurred lines between reality and nightmare.",
    "genres": []
  },
  "1437396": {
    "id": "1437396",
    "title": "Your Mother Your Mother Your Mother",
    "type": "movie",
    "rating": "6.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/4KaPZSKnInnArErTTgy9Oy14leR.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/45Mbs6dmn2W0hvuyxXPDkKREHpP.jpg",
    "overview": "Latif, a devoutly religious hitman, struggles to balance work, faith and fatherhood. When his wife dies, he embarks on a desperate journey across Houston to protect his children, confronting the forces closing in around him – and the beliefs threatening to unravel within.",
    "genres": []
  },
  "1437511": {
    "id": "1437511",
    "title": "How to Rob a Bank",
    "type": "movie",
    "rating": "6.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/ifYDZkr2qkHFz87TNVvlxajOxl5.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/u38hNQbxvIicUdfrHpqa9puBnA9.jpg",
    "overview": "A crew of social media-savvy bank robbers broadcasts their daring heists, unaware that their growing viral fame has put them in the crosshairs of a veteran FBI agent and a brilliant software engineer. Despite the unlikely duo closing in, the crime ring pushes past their limits, putting everything on the line for their most ambitious heist yet.",
    "genres": []
  },
  "1465063": {
    "id": "1465063",
    "title": "Forgotten Island",
    "type": "movie",
    "rating": "8.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/myd1K3gefdNAWFsGNRDdMeiK9Qg.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/2o9FzuBzCqrDTdlHRuEVnGD2d5h.jpg",
    "overview": "While celebrating their last night together, high school graduates and best friends Jo and Raissa stumble upon a mysterious portal that transports them to the fantastical island of Nakali. When they discover that the memories of their entire friendship are the price for returning home, Jo and Raissa must race to find a way to leave the island before they forget each other forever.",
    "genres": []
  },
  "1474226": {
    "id": "1474226",
    "title": "Evil Dress",
    "type": "movie",
    "rating": "6.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/4346oRUfjNtBezOQoKiu31J34L9.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/ftfnS4ABocBNkwrvkIjkkxaBjgH.jpg",
    "overview": "After a difficult divorce, Alicia moves into an old house with her daughter Carla, unaware that it hides a past of recurrent tragedy. As Carla senses perturbing presences, Alicia begins to doubt her own sanity. A blue dress connects Carla to the ghost of a girl from the past, triggering terrifying events. Mother and daughter will try to escape the house, but the house won’t let them get away so easily.",
    "genres": []
  },
  "1503762": {
    "id": "1503762",
    "title": "Sense and Sensibility",
    "type": "movie",
    "rating": "7.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/czsyPHosFNbh4PPqXfqWu1aBXnA.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/tIcONOFK9D3F89ETK8DBS1hIwVF.jpg",
    "overview": "A charming, witty, and deeply relatable story of love and sisterhood.",
    "genres": []
  },
  "1507696": {
    "id": "1507696",
    "title": "Apocalypse Z: New World",
    "type": "movie",
    "rating": "6.1",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
    "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
    "genres": []
  },
  "1514026": {
    "id": "1514026",
    "title": "Buddy",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
    "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
    "genres": []
  },
  "1516698": {
    "id": "1516698",
    "title": "The Last Sunrise",
    "type": "movie",
    "rating": "6.9",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/zFCWfU2ViMIm38G1W8UsnSpqmWn.jpg",
    "overview": "Ry, a college student with a chronic illness, escapes to Mallorca for the summer with her mother, where she unexpectedly falls for a local and begins to embrace living in the moment. But as her condition worsens and long-hidden family secrets come to light, everything she has found before summer's end is threatened.",
    "genres": []
  },
  "1518204": {
    "id": "1518204",
    "title": "Allen",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
    "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
    "genres": []
  },
  "1523145": {
    "id": "1523145",
    "title": "Your Heart Will Be Broken",
    "type": "movie",
    "rating": "7.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/fRjy6zDeNjfzmjpKz8mElA9Aa6l.jpg",
    "overview": "High school student Polina is saved from bullying at her new school and makes a deal with the main bully Bars: he must pretend to be her boyfriend and protect her, and she must do everything he says. During this game, the couple develops real feelings, but her family and classmates have reasons to separate the lovers.",
    "genres": []
  },
  "1543469": {
    "id": "1543469",
    "title": "Heartland",
    "type": "movie",
    "rating": "6.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
    "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
    "genres": []
  },
  "1562642": {
    "id": "1562642",
    "title": "Ghost Soldier",
    "type": "movie",
    "rating": "9.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
    "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
    "genres": []
  },
  "1567605": {
    "id": "1567605",
    "title": "Ebenezer",
    "type": "movie",
    "rating": "7.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
    "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
    "genres": []
  },
  "1570488": {
    "id": "1570488",
    "title": "A Dog's Perfect Christmas",
    "type": "movie",
    "rating": "7.2",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/zvsNAohDHRWcGvbPSD7r3WojpKb.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/hhQT0TySg3LXCE8BEPpfPJ5zJA2.jpg",
    "overview": "When a medical emergency pulls the Goss family apart, determined dog Winstead will do all he can to bring his humans back together before Christmas Eve.",
    "genres": []
  },
  "1571955": {
    "id": "1571955",
    "title": "Collision Course",
    "type": "movie",
    "rating": "6.3",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/s2eAK0uiODjlNUSIiOBwdp3at2u.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/uI3kWI7kGW5E0F8WduewgQYPt34.jpg",
    "overview": "Spain, 2013. After robbing a bank, a getaway crash reveals the hidden side of each thief, exposing betrayals and lies that began long before the heist.",
    "genres": []
  },
  "1595325": {
    "id": "1595325",
    "title": "The Anacondas",
    "type": "movie",
    "rating": "3.6",
    "year": "2025",
    "poster": "https://image.tmdb.org/t/p/w500/yphysF14qWFvrIbFVg3vEnbudwT.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/ryA5uYC7mVZv9dEnAGvL9Iv8kVZ.jpg",
    "overview": "Explorers in Mexico uncover the ruins of an ancient snake-worshiping civilization. Celebration turns to horror when they awaken an ever-growing anaconda, starved of human sacrifices for centuries. Now, the team must band together to survive.",
    "genres": []
  },
  "1596275": {
    "id": "1596275",
    "title": "Drive - The Pretenders",
    "type": "movie",
    "rating": "7.6",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
    "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
    "genres": []
  },
  "1616419": {
    "id": "1616419",
    "title": "The Good Lawyer",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/rVkMvD7CpBueGmNIz2uVgluhTjS.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/fzlch1j1aVGJKI0GB6IdgbG5gpJ.jpg",
    "overview": "After a courtroom overdose lands him in rehab, a lawyer has one week to save his career and prepare for his own trial, with the help of a dogged intern.",
    "genres": []
  },
  "1616687": {
    "id": "1616687",
    "title": "Never Surrender",
    "type": "movie",
    "rating": "7.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
    "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
    "genres": []
  },
  "1623376": {
    "id": "1623376",
    "title": "Blue Lock",
    "type": "movie",
    "rating": "8.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/nmYfihKTVUKQnHfnKE46uYMPEul.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/znXyQgqITDm8fJxcvmlRpKlw49T.jpg",
    "overview": "After years of defeat, Japan's Football Union gathers 300 high school players in a ruthless training program to find the world's greatest striker, where failure means permanent exclusion from the national team.",
    "genres": []
  },
  "1644210": {
    "id": "1644210",
    "title": "Robotica",
    "type": "movie",
    "rating": "3.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/fZD9b4RRmFWwYVn6MCcrHebTDDc.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/g6yVfiCdVITgpMRY1R9VHRxR4uu.jpg",
    "overview": "Two security guards working the midnight shift in an adult toy company find themselves the target of a half-dismantled and severely malfunctioning female sex doll prototype named Robotica.",
    "genres": []
  },
  "1654940": {
    "id": "1654940",
    "title": "One Year to Live, Buy a Man",
    "type": "movie",
    "rating": "7.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/fez7kLyGzpowduJapTFZZ1feCS0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/6vGH7JZFLzFawpwCcnNweF8j3KD.jpg",
    "overview": "Given a year to live, frugal 40-year-old Yui finally lets herself spend: \"buying\" nightclub host Sena. What begins as a contract takes an unexpected turn.",
    "genres": []
  },
  "1657630": {
    "id": "1657630",
    "title": "The Awakening",
    "type": "movie",
    "rating": "6.5",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
    "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
    "genres": []
  },
  "1659441": {
    "id": "1659441",
    "title": "Savage Prey",
    "type": "movie",
    "rating": "7.9",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/sw51DrxbE1PuJxiqfl3dsZHA3tX.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/aLKeC5KEC4YQEwyZcXOivHJHlq4.jpg",
    "overview": "In the remote Scottish Highlands, a desperate mother searches for her missing son, finding herself trapped in a twisted struggle for survival.",
    "genres": []
  },
  "1664264": {
    "id": "1664264",
    "title": "A Very Arctic Christmas",
    "type": "movie",
    "rating": "6.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/iyuVTpASpRy2FpsLbGbwF7T2PtI.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/zskxUdaCFkDNiS3slxQXFEDtL37.jpg",
    "overview": "Single dad Jim and his spirited, science-minded 20-year-old daughter, Isla, share a tradition of alternating who decides how they spend Christmas each year. Jim, a former major league baseball player turned broadcaster, never misses hosting his annual Christmas Eve show from Times Square – until Isla persuades him to take a once-in-a-lifetime Arctic cruise, promising they will return in time for his broadcast.",
    "genres": []
  },
  "1669915": {
    "id": "1669915",
    "title": "Angel and the Badman",
    "type": "movie",
    "rating": "8.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/mJe53zlhGBdcjtN1GqncNZ5Unm0.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/hULWeQoEJUhiZ6NlANxsLoMJJ5p.jpg",
    "overview": "A wounded outlaw finds unexpected mercy in the care of a rancher's daughter. The hope of love pulls him toward a different life until the law, and his violent past, close in on his new home. Now he must choose the kind of man he'll become.",
    "genres": []
  },
  "1697911": {
    "id": "1697911",
    "title": "Drummer Boy",
    "type": "movie",
    "rating": "7.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/bhjdgMm2fFrysSzVqv5RwRwIbVf.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/5KF459N6jOfRV7kV9XV7ZQdCLKK.jpg",
    "overview": "As America’s fight for independence begins, a young drummer boy, an enslaved woman, and a divided family search for freedom. Through battle and loss, music carries hope in a deeply human story of faith and forgiveness.",
    "genres": []
  },
  "1751701": {
    "id": "1751701",
    "title": "After Impact",
    "type": "movie",
    "rating": "5.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/yzDuAQCY2n6zzOlBkn6JzhLhY3k.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/k22XyPbce7zvzzf5OnT4uaY8ZD1.jpg",
    "overview": "After losing his father, Ethan Nichols inherits one of the largest greenhouses in the country, just as the world faces a devastating threat from an approaching asteroid. As society begins to unravel, Ethan grapples with personal betrayal, overwhelming loneliness, and the growing fear that survival may come at the cost of his humanity. Seeking refuge in his family’s bunker, Ethan endures the harsh aftermath of the impact, wrestling with physical injury and emotional despair. When a faint voice crackles over his radio, Ethan discovers he's not as alone as he believed.",
    "genres": []
  },
  "1757174": {
    "id": "1757174",
    "title": "The Christmas Switch",
    "type": "movie",
    "rating": "6.8",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/9kHrUoPF2rl5Hj0QMquAy3xznXT.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/4BsOLok9WaTTTcSpmoMtCLERScS.jpg",
    "overview": "Craving a change of pace, work-hard-play-hard city girl Freddie swaps lives with her homebody sister Mattie at Christmas time, only to unwrap a whole new kind of mess.",
    "genres": []
  },
  "1780005": {
    "id": "1780005",
    "title": "Surviving Hurricane Otis",
    "type": "movie",
    "rating": "7.4",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/chZa8Jd9kSDj11bekGjwwotFPEw.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/cpNMIRCrDl0sxDL1tHBzfWi0UZC.jpg",
    "overview": "Two estranged brothers struggle to survive Hurricane Otis in Acapulco, where their bond and courage turn adversity into hope.",
    "genres": []
  },
  "1780407": {
    "id": "1780407",
    "title": "Snoopy Presents: 12 Days of Snoopy",
    "type": "movie",
    "rating": "7.0",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/9wZAvvAZgwp2Lxbhjkp9N6HHJBm.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/3gIGgmK27lt3YK9EUnZ6iXMHg7Q.jpg",
    "overview": "Eager to get off Santa's naughty list, Snoopy goes all out to be the nicest beagle in town.",
    "genres": []
  },
  "1813355": {
    "id": "1813355",
    "title": "A Story of Derry",
    "type": "movie",
    "rating": "6.7",
    "year": "2026",
    "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
    "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
    "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
    "genres": []
  }
};

export const RICH_RAILS: CatalogRail[] = [
  {
    "id": "rail-trending",
    "title": "Trending Now",
    "type": "movie",
    "category": "trending",
    "items": [
      {
        "id": "1368337",
        "title": "The Odyssey",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
        "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
        "genres": []
      },
      {
        "id": "1185344",
        "title": "The Beast",
        "type": "movie",
        "rating": "5.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
        "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "1400837",
        "title": "Other Mommy",
        "type": "movie",
        "rating": "6.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
        "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
        "genres": []
      },
      {
        "id": "1567605",
        "title": "Ebenezer",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
        "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
        "genres": []
      },
      {
        "id": "969681",
        "title": "Spider-Man: Brand New Day",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
        "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        "genres": []
      },
      {
        "id": "1423191",
        "title": "Resident Evil",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
        "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
        "genres": []
      },
      {
        "id": "1263337",
        "title": "Heart of the Beast",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
        "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
        "genres": []
      },
      {
        "id": "1543469",
        "title": "Heartland",
        "type": "movie",
        "rating": "6.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
        "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
        "genres": []
      },
      {
        "id": "1378742",
        "title": "Drive Through Fire",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/lmQKEJ4Te7CQ5mhnXwr3zCLnOvc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Tw90S4hVrvUoqmQWDoO6U4toZT.jpg",
        "overview": "The story follows an addict war veteran turned rideshare driver who helps a terrified passenger escape a human trafficking ring serving wealthy clients.",
        "genres": []
      },
      {
        "id": "1375441",
        "title": "Primetime",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/lmrulvLbmaejTix1YaMxo1oGhH1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sEsMwSDUWGIx9EfNxzM6KzVSsSQ.jpg",
        "overview": "In 2006, To Catch a Predator host Chris Hansen sets out to make television history. When a high stakes operation goes fatally wrong, his veneered dream of fame curdles into a nightmare of performative justice.",
        "genres": []
      },
      {
        "id": "1518204",
        "title": "Allen",
        "type": "movie",
        "rating": "6.9",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
        "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
        "genres": []
      },
      {
        "id": "1616687",
        "title": "Never Surrender",
        "type": "movie",
        "rating": "7.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
        "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
        "genres": []
      },
      {
        "id": "1286656",
        "title": "I Play Rocky",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/xE5tY3lppZUyG7WKKThsuYHuAHr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1lnnjBCRLZzKRhQipK5zm61YkPe.jpg",
        "overview": "The electrifying true story about an unknown actor with an unshakable belief that he wasn't just meant to write Rocky—he was meant to be Rocky Balboa. Told \"no\" at every turn, Sylvester Stallone bets everything on himself, holding the line on playing the lead against seemingly impossible odds.",
        "genres": []
      },
      {
        "id": "1437511",
        "title": "How to Rob a Bank",
        "type": "movie",
        "rating": "6.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ifYDZkr2qkHFz87TNVvlxajOxl5.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/u38hNQbxvIicUdfrHpqa9puBnA9.jpg",
        "overview": "A crew of social media-savvy bank robbers broadcasts their daring heists, unaware that their growing viral fame has put them in the crosshairs of a veteran FBI agent and a brilliant software engineer. Despite the unlikely duo closing in, the crime ring pushes past their limits, putting everything on the line for their most ambitious heist yet.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-top-10",
    "title": "Top 10 in Movies & TV Today",
    "type": "movie",
    "category": "top-10",
    "items": [
      {
        "id": "1368337",
        "title": "The Odyssey",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
        "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
        "genres": []
      },
      {
        "id": "1185344",
        "title": "The Beast",
        "type": "movie",
        "rating": "5.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
        "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "1400837",
        "title": "Other Mommy",
        "type": "movie",
        "rating": "6.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
        "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
        "genres": []
      },
      {
        "id": "1567605",
        "title": "Ebenezer",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
        "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
        "genres": []
      },
      {
        "id": "969681",
        "title": "Spider-Man: Brand New Day",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
        "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        "genres": []
      },
      {
        "id": "1423191",
        "title": "Resident Evil",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
        "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
        "genres": []
      },
      {
        "id": "1263337",
        "title": "Heart of the Beast",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
        "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
        "genres": []
      },
      {
        "id": "1543469",
        "title": "Heartland",
        "type": "movie",
        "rating": "6.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
        "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
        "genres": []
      },
      {
        "id": "1378742",
        "title": "Drive Through Fire",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/lmQKEJ4Te7CQ5mhnXwr3zCLnOvc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Tw90S4hVrvUoqmQWDoO6U4toZT.jpg",
        "overview": "The story follows an addict war veteran turned rideshare driver who helps a terrified passenger escape a human trafficking ring serving wealthy clients.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-popular-movies",
    "title": "Popular Movies",
    "type": "movie",
    "category": "popular",
    "items": [
      {
        "id": "1263337",
        "title": "Heart of the Beast",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
        "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
        "genres": []
      },
      {
        "id": "1368337",
        "title": "The Odyssey",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
        "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
        "genres": []
      },
      {
        "id": "1423191",
        "title": "Resident Evil",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
        "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
        "genres": []
      },
      {
        "id": "1400837",
        "title": "Other Mommy",
        "type": "movie",
        "rating": "6.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
        "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
        "genres": []
      },
      {
        "id": "969681",
        "title": "Spider-Man: Brand New Day",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
        "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        "genres": []
      },
      {
        "id": "687163",
        "title": "Project Hail Mary",
        "type": "movie",
        "rating": "8.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
        "overview": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
        "genres": []
      },
      {
        "id": "1058424",
        "title": "Hope",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg",
        "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
        "genres": []
      },
      {
        "id": "1813355",
        "title": "A Story of Derry",
        "type": "movie",
        "rating": "6.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
        "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
        "genres": []
      },
      {
        "id": "1616687",
        "title": "Never Surrender",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
        "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
        "genres": []
      },
      {
        "id": "1507696",
        "title": "Apocalypse Z: New World",
        "type": "movie",
        "rating": "6.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
        "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
        "genres": []
      },
      {
        "id": "1244523",
        "title": "Beware Boiúna",
        "type": "movie",
        "rating": "6.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
        "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
        "genres": []
      },
      {
        "id": "1294189",
        "title": "The Mongoose",
        "type": "movie",
        "rating": "6.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
        "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "1562642",
        "title": "Ghost Soldier",
        "type": "movie",
        "rating": "9.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
        "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
        "genres": []
      },
      {
        "id": "1567605",
        "title": "Ebenezer",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
        "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
        "genres": []
      },
      {
        "id": "1422041",
        "title": "La Bola Negra",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7HwFQTMghL6HOvzEnXYUvyuZXeh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bDsmYvrzto7xrEwqDpLC3SPhn9A.jpg",
        "overview": "The intertwined lives of three men in three different eras, three lives intimately linked by sexuality and desire, pain, and legacy.",
        "genres": []
      },
      {
        "id": "656908",
        "title": "Ramayana: Rise of a Legend",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
        "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
        "genres": []
      },
      {
        "id": "1101412",
        "title": "Fall 2: Deadpoint",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
        "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
        "genres": []
      },
      {
        "id": "1283515",
        "title": "Verity",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
        "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-popular-tv",
    "title": "Popular TV Series",
    "type": "tv",
    "category": "popular",
    "items": [
      {
        "id": "2734",
        "title": "Law & Order: Special Victims Unit",
        "type": "tv",
        "rating": "8.0",
        "year": "1999",
        "poster": "https://image.tmdb.org/t/p/w500/pHNhUwSXuDQ9jPZOCb8SgJaQZsc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
        "overview": "In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.",
        "genres": []
      },
      {
        "id": "1413",
        "title": "American Horror Story",
        "type": "tv",
        "rating": "8.1",
        "year": "2011",
        "poster": "https://image.tmdb.org/t/p/w500/yCkPLQ10qKIUgRBXmQVVMF1h96d.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5G4Bnc4Q0YUK1bwLEUYmIsmm2Ib.jpg",
        "overview": "An anthology horror drama series centering on different characters and locations, including a house with a murderous past, an asylum, a witch coven, a freak show, a hotel, a farmhouse in Roanoke, a cult, the apocalypse and a summer camp.",
        "genres": []
      },
      {
        "id": "84773",
        "title": "The Lord of the Rings: The Rings of Power",
        "type": "tv",
        "rating": "7.2",
        "year": "2022",
        "poster": "https://image.tmdb.org/t/p/w500/bMXWXKM9ydUmMTNvDnYo9QtCBRt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/uVOcz7JBOuZxsx9IYpx6Ah174LX.jpg",
        "overview": "Beginning in a time of relative peace, we follow an ensemble cast of characters as they confront the re-emergence of evil to Middle-earth. From the darkest depths of the Misty Mountains, to the majestic forests of Lindon, to the breathtaking island kingdom of Númenor, to the furthest reaches of the map, these kingdoms and characters will carve out legacies that live on long after they are gone.",
        "genres": []
      },
      {
        "id": "1100",
        "title": "How I Met Your Mother",
        "type": "tv",
        "rating": "8.1",
        "year": "2005",
        "poster": "https://image.tmdb.org/t/p/w500/b34jPzmB0wZy7EjUZoleXOl2RRI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3f8aW6vcYRP6mTZdgXm83BiuB9t.jpg",
        "overview": "A father recounts to his children - through a series of flashbacks - the journey he and his four best friends took leading up to him meeting their mother.",
        "genres": []
      },
      {
        "id": "57243",
        "title": "Doctor Who",
        "type": "tv",
        "rating": "7.6",
        "year": "2005",
        "poster": "https://image.tmdb.org/t/p/w500/lHfmc6d8pOVFrD0eOKPiDbjeucG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vcFW09U4834DyFOeRZpsx9x1D3S.jpg",
        "overview": "The Doctor is a Time Lord: a 900 year old alien with 2 hearts, part of a gifted civilization who mastered time travel. The Doctor saves planets for a living—more of a hobby actually, and the Doctor's very, very good at it.",
        "genres": []
      },
      {
        "id": "2316",
        "title": "The Office",
        "type": "tv",
        "rating": "8.6",
        "year": "2005",
        "poster": "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9vMzIrMIncPmtalcxh1MOrgcE6C.jpg",
        "overview": "The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.",
        "genres": []
      },
      {
        "id": "5920",
        "title": "The Mentalist",
        "type": "tv",
        "rating": "8.4",
        "year": "2008",
        "poster": "https://image.tmdb.org/t/p/w500/k0kMdO52LpC5JWgd0uWEH7gqcCe.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg",
        "overview": "Patrick Jane, a former celebrity psychic medium, uses his razor sharp skills of observation and expertise at \"reading\" people to solve serious crimes with the California Bureau of Investigation.",
        "genres": []
      },
      {
        "id": "1408",
        "title": "House",
        "type": "tv",
        "rating": "8.6",
        "year": "2004",
        "poster": "https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/r0Q6eeN9L1ORL9QsV0Sg8ZV3vnv.jpg",
        "overview": "Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.",
        "genres": []
      },
      {
        "id": "456",
        "title": "The Simpsons",
        "type": "tv",
        "rating": "8.0",
        "year": "1989",
        "poster": "https://image.tmdb.org/t/p/w500/tf0CUEynk6GfmrlHIQKQ5mfFP5P.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jIArNHIekrCSVgdMbKPAXpPY03Y.jpg",
        "overview": "Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.",
        "genres": []
      },
      {
        "id": "1421",
        "title": "Modern Family",
        "type": "tv",
        "rating": "7.9",
        "year": "2009",
        "poster": "https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nO7EzksrBzlNpAg5rgv8HzaBIkx.jpg",
        "overview": "The Pritchett-Dunphy-Tucker clan is a wonderfully large and blended family. They give us an honest and often hilarious look into the sometimes warm, sometimes twisted, embrace of the modern family.",
        "genres": []
      },
      {
        "id": "60735",
        "title": "The Flash",
        "type": "tv",
        "rating": "7.7",
        "year": "2014",
        "poster": "https://image.tmdb.org/t/p/w500/yZevl2vHQgmosfwUdVNzviIfaWS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gFkHcIh7iE5G0oVOgpmY8ONQjhl.jpg",
        "overview": "After being struck by lightning, CSI investigator Barry Allen awakens from a nine-month coma to discover he has been  granted the gift of super speed.  Teaming up with S.T.A.R. Labs, Barry takes on the persona of The Flash, the Fastest  Man Alive, to protect his city.",
        "genres": []
      },
      {
        "id": "1400",
        "title": "Seinfeld",
        "type": "tv",
        "rating": "8.2",
        "year": "1989",
        "poster": "https://image.tmdb.org/t/p/w500/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tMRdEsMg9MyXAkcufK9YJEeIaNW.jpg",
        "overview": "A stand-up comedian and his three offbeat friends weather the pitfalls and payoffs of life in New York City in the '90s. It's a show about nothing.",
        "genres": []
      },
      {
        "id": "18165",
        "title": "The Vampire Diaries",
        "type": "tv",
        "rating": "8.3",
        "year": "2009",
        "poster": "https://image.tmdb.org/t/p/w500/aBkVgChtyyJaHyZh1gfd8DbzQon.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cJYLon9ejKJV7ua03ab8Tj9u067.jpg",
        "overview": "The story of two vampire brothers obsessed with the same girl, who bears a striking resemblance to the beautiful but ruthless vampire they knew and loved in 1864.",
        "genres": []
      },
      {
        "id": "4057",
        "title": "Criminal Minds",
        "type": "tv",
        "rating": "8.3",
        "year": "2005",
        "poster": "https://image.tmdb.org/t/p/w500/hWSb4UnIjlTvnvrP98NbFSO60HA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tUtXfyVy54BY7eJnRtI8Xnmr1ZL.jpg",
        "overview": "An elite team of FBI profilers analyze the country's most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit's most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases.",
        "genres": []
      },
      {
        "id": "37678",
        "title": "The Voice",
        "type": "tv",
        "rating": "5.8",
        "year": "2011",
        "poster": "https://image.tmdb.org/t/p/w500/7ah1WExcMkzbq7sARCTmcC23tBr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/x8pSFa3BXyVpkjHyn7YxmLyhjoh.jpg",
        "overview": "The strongest vocalists from across the United states compete in a blockbusters vocal competition, the winner becomes “The Voice.” The show's innovative format features four stages of competition: the blind auditions, the battle rounds, the knockouts and, finally, the live performance shows.",
        "genres": []
      },
      {
        "id": "2025",
        "title": "Beverly Hills, 90210",
        "type": "tv",
        "rating": "7.3",
        "year": "1990",
        "poster": "https://image.tmdb.org/t/p/w500/b7BYfkhu653D894krwGO1ysIKTf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iMFsQ7yyToYg7SkS9Ml0by9UJ0X.jpg",
        "overview": "Follow the lives of a group of teenagers living in the upscale, star-studded community of Beverly Hills, California and attending the fictitious West Beverly Hills High School and, subsequently, the fictitious California University after graduation.",
        "genres": []
      },
      {
        "id": "4620",
        "title": "Eureka",
        "type": "tv",
        "rating": "7.7",
        "year": "2006",
        "poster": "https://image.tmdb.org/t/p/w500/f2l5hUk63hPqYTucnFy2HmElFV0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8MQeyFsWrp2ILjbumtxrinmk7t4.jpg",
        "overview": "The sleepy Pacific Northwest town of Eureka is hiding a mysterious secret. The government has been relocating the world's geniuses and their families to this rustic town for years where innovation and chaos have lived hand in hand. U.S. Marshal Jack Carter stumbles upon this odd town after wrecking his car and becoming stranded there. When the denizens of the town unleash an unknown scientific creation, Carter jumps in to try to restore order and consequently learns of one of the country's best kept secrets.",
        "genres": []
      },
      {
        "id": "1877",
        "title": "Phineas and Ferb",
        "type": "tv",
        "rating": "7.9",
        "year": "2007",
        "poster": "https://image.tmdb.org/t/p/w500/g6TidT7be954rrzPPBTIXkSmfXj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5MWFjQ3NuNtNeOE9FdrVLeNMNPs.jpg",
        "overview": "Each day, two kindhearted suburban stepbrothers on summer vacation embark on some grand new project, which annoys their controlling sister, Candace, who tries to bust them. Meanwhile, their pet platypus plots against evil Dr. Doofenshmirtz.",
        "genres": []
      },
      {
        "id": "61923",
        "title": "Star vs. the Forces of Evil",
        "type": "tv",
        "rating": "8.4",
        "year": "2015",
        "poster": "https://image.tmdb.org/t/p/w500/dKFL1AOdKNoazqZDg1zq2z69Lx1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2UElp7Dkm3SiB9ZEdKEWNmAOijB.jpg",
        "overview": "Intergalactic warrior Star Butterfly arrives on Earth to live with the Diaz family. She continues to battle villains throughout the universe and high school, mainly to protect her extremely powerful wand, an object that still confuses her.",
        "genres": []
      },
      {
        "id": "32573",
        "title": "Strike Back",
        "type": "tv",
        "rating": "7.4",
        "year": "2010",
        "poster": "https://image.tmdb.org/t/p/w500/c0ItaC2Grf4WVJ06G87BjNn9pRs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2tL3pNaPQb2ioEYswMkDGVTo1pt.jpg",
        "overview": "The series follows John Porter, a former British Special Forces soldier, who is drafted back into service by Section 20, a fictional branch of the Secret Intelligence Service.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-new-releases",
    "title": "New Releases",
    "type": "movie",
    "category": "new_releases",
    "items": [
      {
        "id": "1263337",
        "title": "Heart of the Beast",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
        "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
        "genres": []
      },
      {
        "id": "1423191",
        "title": "Resident Evil",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
        "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
        "genres": []
      },
      {
        "id": "1400837",
        "title": "Other Mommy",
        "type": "movie",
        "rating": "6.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
        "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
        "genres": []
      },
      {
        "id": "1058424",
        "title": "Hope",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg",
        "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
        "genres": []
      },
      {
        "id": "1813355",
        "title": "A Story of Derry",
        "type": "movie",
        "rating": "6.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
        "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
        "genres": []
      },
      {
        "id": "1616687",
        "title": "Never Surrender",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
        "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
        "genres": []
      },
      {
        "id": "1507696",
        "title": "Apocalypse Z: New World",
        "type": "movie",
        "rating": "6.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
        "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
        "genres": []
      },
      {
        "id": "1244523",
        "title": "Beware Boiúna",
        "type": "movie",
        "rating": "6.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
        "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
        "genres": []
      },
      {
        "id": "1294189",
        "title": "The Mongoose",
        "type": "movie",
        "rating": "6.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
        "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "1562642",
        "title": "Ghost Soldier",
        "type": "movie",
        "rating": "9.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
        "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
        "genres": []
      },
      {
        "id": "1567605",
        "title": "Ebenezer",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
        "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
        "genres": []
      },
      {
        "id": "1422041",
        "title": "La Bola Negra",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7HwFQTMghL6HOvzEnXYUvyuZXeh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bDsmYvrzto7xrEwqDpLC3SPhn9A.jpg",
        "overview": "The intertwined lives of three men in three different eras, three lives intimately linked by sexuality and desire, pain, and legacy.",
        "genres": []
      },
      {
        "id": "656908",
        "title": "Ramayana: Rise of a Legend",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
        "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
        "genres": []
      },
      {
        "id": "1101412",
        "title": "Fall 2: Deadpoint",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
        "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
        "genres": []
      },
      {
        "id": "1283515",
        "title": "Verity",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
        "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
        "genres": []
      },
      {
        "id": "1543469",
        "title": "Heartland",
        "type": "movie",
        "rating": "6.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
        "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
        "genres": []
      },
      {
        "id": "1228834",
        "title": "The Fix",
        "type": "movie",
        "rating": "5.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
        "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
        "genres": []
      },
      {
        "id": "1514026",
        "title": "Buddy",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
        "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
        "genres": []
      },
      {
        "id": "1596275",
        "title": "Drive - The Pretenders",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
        "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-action",
    "title": "Action & Adventure",
    "type": "movie",
    "category": "action",
    "items": [
      {
        "id": "1368337",
        "title": "The Odyssey",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
        "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
        "genres": []
      },
      {
        "id": "969681",
        "title": "Spider-Man: Brand New Day",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
        "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        "genres": []
      },
      {
        "id": "1058424",
        "title": "Hope",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/j96rurZqmBjyY37Fncl3IB0qJNe.jpg",
        "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
        "genres": []
      },
      {
        "id": "1507696",
        "title": "Apocalypse Z: New World",
        "type": "movie",
        "rating": "6.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
        "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
        "genres": []
      },
      {
        "id": "1616687",
        "title": "Never Surrender",
        "type": "movie",
        "rating": "7.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
        "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
        "genres": []
      },
      {
        "id": "1244523",
        "title": "Beware Boiúna",
        "type": "movie",
        "rating": "6.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
        "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "1294189",
        "title": "The Mongoose",
        "type": "movie",
        "rating": "6.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
        "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
        "genres": []
      },
      {
        "id": "1562642",
        "title": "Ghost Soldier",
        "type": "movie",
        "rating": "9.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
        "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
        "genres": []
      },
      {
        "id": "656908",
        "title": "Ramayana: Rise of a Legend",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
        "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
        "genres": []
      },
      {
        "id": "1228834",
        "title": "The Fix",
        "type": "movie",
        "rating": "5.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
        "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
        "genres": []
      },
      {
        "id": "1595325",
        "title": "The Anacondas",
        "type": "movie",
        "rating": "3.6",
        "year": "2025",
        "poster": "https://image.tmdb.org/t/p/w500/yphysF14qWFvrIbFVg3vEnbudwT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ryA5uYC7mVZv9dEnAGvL9Iv8kVZ.jpg",
        "overview": "Explorers in Mexico uncover the ruins of an ancient snake-worshiping civilization. Celebration turns to horror when they awaken an ever-growing anaconda, starved of human sacrifices for centuries. Now, the team must band together to survive.",
        "genres": []
      },
      {
        "id": "940721",
        "title": "Godzilla Minus One",
        "type": "movie",
        "rating": "7.6",
        "year": "2023",
        "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
        "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
        "genres": []
      },
      {
        "id": "1657630",
        "title": "The Awakening",
        "type": "movie",
        "rating": "6.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
        "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
        "genres": []
      },
      {
        "id": "299534",
        "title": "Avengers: Endgame",
        "type": "movie",
        "rating": "8.2",
        "year": "2019",
        "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
        "genres": []
      },
      {
        "id": "1185344",
        "title": "The Beast",
        "type": "movie",
        "rating": "5.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
        "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
        "genres": []
      },
      {
        "id": "1153576",
        "title": "Street Fighter",
        "type": "movie",
        "rating": "6.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
        "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
        "genres": []
      },
      {
        "id": "1288445",
        "title": "Mutiny",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
        "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
        "genres": []
      },
      {
        "id": "155",
        "title": "The Dark Knight",
        "type": "movie",
        "rating": "8.5",
        "year": "2008",
        "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-scifi",
    "title": "Sci-Fi & Fantasy",
    "type": "movie",
    "category": "scifi",
    "items": [
      {
        "id": "1423191",
        "title": "Resident Evil",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
        "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
        "genres": []
      },
      {
        "id": "687163",
        "title": "Project Hail Mary",
        "type": "movie",
        "rating": "8.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
        "overview": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
        "genres": []
      },
      {
        "id": "969681",
        "title": "Spider-Man: Brand New Day",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
        "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
        "genres": []
      },
      {
        "id": "1058424",
        "title": "Hope",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/j96rurZqmBjyY37Fncl3IB0qJNe.jpg",
        "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
        "genres": []
      },
      {
        "id": "1381071",
        "title": "Godzilla Minus Zero",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
        "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
        "genres": []
      },
      {
        "id": "755898",
        "title": "War of the Worlds",
        "type": "movie",
        "rating": "4.0",
        "year": "2025",
        "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
        "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
        "genres": []
      },
      {
        "id": "940721",
        "title": "Godzilla Minus One",
        "type": "movie",
        "rating": "7.6",
        "year": "2023",
        "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
        "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
        "genres": []
      },
      {
        "id": "299534",
        "title": "Avengers: Endgame",
        "type": "movie",
        "rating": "8.2",
        "year": "2019",
        "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
        "genres": []
      },
      {
        "id": "1518204",
        "title": "Allen",
        "type": "movie",
        "rating": "6.9",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
        "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
        "genres": []
      },
      {
        "id": "1400940",
        "title": "Clayface",
        "type": "movie",
        "rating": "7.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/9l1NuFjel2j89hiuiJbsxfblqjy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xSDoxv4pHvs4xZjvTb0Iqg1A6ro.jpg",
        "overview": "Matt Hagen's meteoric rise from Gotham street kid to Hollywood leading man is tragically cut short when a local crime boss's actions leave him horribly disfigured. Abandoned by his team and with nothing left, Matt seeks out a cutting edge treatment that miraculously returns him to his former self… but also unexpectedly affects his grip on reality, spiraling him down a destructive path of all-consuming revenge.",
        "genres": []
      },
      {
        "id": "1644210",
        "title": "Robotica",
        "type": "movie",
        "rating": "3.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fZD9b4RRmFWwYVn6MCcrHebTDDc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/g6yVfiCdVITgpMRY1R9VHRxR4uu.jpg",
        "overview": "Two security guards working the midnight shift in an adult toy company find themselves the target of a half-dismantled and severely malfunctioning female sex doll prototype named Robotica.",
        "genres": []
      },
      {
        "id": "1384216",
        "title": "The Dog Stars",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/5O616X9vmRzQdB68PHzBewPittd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3k7GzxOdLZkN3eZsuhLi2eRzkXO.jpg",
        "overview": "After the world's population has been ravaged by a pandemic, a man lives a lonesome existence in a Colorado airplane hangar with his dog and a dour gunman he has befriended. When a mysterious transmission comes through on the radio while he’s flying his old Cessna, it sparks a hunt for the provenance of the sound.",
        "genres": []
      },
      {
        "id": "1101383",
        "title": "The End of Oak Street",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7DmtuAK5gYGlMFA45Oxkl1bEpIC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/wnR8pwWtoL3TFwP41mLCt91ReCt.jpg",
        "overview": "After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.",
        "genres": []
      },
      {
        "id": "157336",
        "title": "Interstellar",
        "type": "movie",
        "rating": "8.5",
        "year": "2014",
        "poster": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
        "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        "genres": []
      },
      {
        "id": "1275779",
        "title": "Disclosure Day",
        "type": "movie",
        "rating": "7.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/AnJ8IQJI23hNpYXVNaythu061Ru.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1e0KDRYKRPHiVNj8yQKYuU2jVyQ.jpg",
        "overview": "A cybersecurity expert becomes a whistleblower after uncovering secrets about aliens, putting him on the run from a corporation. Meanwhile, a meteorologist experiencing strange phenomena joins forces with him to prove there's life beyond our understanding.",
        "genres": []
      },
      {
        "id": "299536",
        "title": "Avengers: Infinity War",
        "type": "movie",
        "rating": "8.2",
        "year": "2018",
        "poster": "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
        "genres": []
      },
      {
        "id": "1375646",
        "title": "Colony",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/enz3WLx5QU1FUyhXZld04QWIc6N.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iGViga8sDCET1S6GfwOlAbuhSGQ.jpg",
        "overview": "Professor Se-jeong is thrust into a bloody nightmare when a rapidly mutating virus is released during a biotech conference causing authorities to seal the facility. Trapped inside with no escape, Se-jeong along with a small group of survivors must fight to stay alive while the infected undergo horrific transformations.",
        "genres": []
      },
      {
        "id": "27205",
        "title": "Inception",
        "type": "movie",
        "rating": "8.4",
        "year": "2010",
        "poster": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-thriller",
    "title": "Thrillers & Suspense",
    "type": "movie",
    "category": "thriller",
    "items": [
      {
        "id": "1263337",
        "title": "Heart of the Beast",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
        "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
        "genres": []
      },
      {
        "id": "1507696",
        "title": "Apocalypse Z: New World",
        "type": "movie",
        "rating": "6.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
        "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
        "genres": []
      },
      {
        "id": "1616687",
        "title": "Never Surrender",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
        "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
        "genres": []
      },
      {
        "id": "1244523",
        "title": "Beware Boiúna",
        "type": "movie",
        "rating": "6.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
        "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
        "genres": []
      },
      {
        "id": "1294189",
        "title": "The Mongoose",
        "type": "movie",
        "rating": "6.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
        "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
        "genres": []
      },
      {
        "id": "1562642",
        "title": "Ghost Soldier",
        "type": "movie",
        "rating": "9.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
        "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
        "genres": []
      },
      {
        "id": "1101412",
        "title": "Fall 2: Deadpoint",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
        "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
        "genres": []
      },
      {
        "id": "1283515",
        "title": "Verity",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
        "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
        "genres": []
      },
      {
        "id": "1228834",
        "title": "The Fix",
        "type": "movie",
        "rating": "5.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
        "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
        "genres": []
      },
      {
        "id": "1543469",
        "title": "Heartland",
        "type": "movie",
        "rating": "6.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
        "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
        "genres": []
      },
      {
        "id": "1596275",
        "title": "Drive - The Pretenders",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
        "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
        "genres": []
      },
      {
        "id": "1432306",
        "title": "Sleepwalker",
        "type": "movie",
        "rating": "4.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/760SP4VsZagpyB9WLfeZykE3DFg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2dYKSPT1SJZVlKwXHic4Ma53f0X.jpg",
        "overview": "A grieving mother is haunted by the tragic loss of her daughter in a car accident that left her abusive husband in a coma. As she battles a surreal descent into darkness, her sleepwalking episodes intensify. Plagued by haunting visions of her husband inside their home, she grapples with the blurred lines between reality and nightmare.",
        "genres": []
      },
      {
        "id": "1185344",
        "title": "The Beast",
        "type": "movie",
        "rating": "5.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
        "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
        "genres": []
      },
      {
        "id": "755898",
        "title": "War of the Worlds",
        "type": "movie",
        "rating": "4.0",
        "year": "2025",
        "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
        "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
        "genres": []
      },
      {
        "id": "1657630",
        "title": "The Awakening",
        "type": "movie",
        "rating": "6.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
        "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
        "genres": []
      },
      {
        "id": "1291595",
        "title": "Insidious: Out of the Further",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
        "overview": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
        "genres": []
      },
      {
        "id": "1288445",
        "title": "Mutiny",
        "type": "movie",
        "rating": "7.6",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
        "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
        "genres": []
      },
      {
        "id": "1339713",
        "title": "Obsession",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5lTZyuBTNOfawsfPT8Q0cIg6qAF.jpg",
        "overview": "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
        "genres": []
      },
      {
        "id": "155",
        "title": "The Dark Knight",
        "type": "movie",
        "rating": "8.5",
        "year": "2008",
        "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        "genres": []
      },
      {
        "id": "1659441",
        "title": "Savage Prey",
        "type": "movie",
        "rating": "7.9",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/sw51DrxbE1PuJxiqfl3dsZHA3tX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/aLKeC5KEC4YQEwyZcXOivHJHlq4.jpg",
        "overview": "In the remote Scottish Highlands, a desperate mother searches for her missing son, finding herself trapped in a twisted struggle for survival.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-comedy",
    "title": "Comedy & Family",
    "type": "movie",
    "category": "comedy",
    "items": [
      {
        "id": "1567605",
        "title": "Ebenezer",
        "type": "movie",
        "rating": "7.7",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
        "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
        "genres": []
      },
      {
        "id": "1514026",
        "title": "Buddy",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
        "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
        "genres": []
      },
      {
        "id": "1570488",
        "title": "A Dog's Perfect Christmas",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/zvsNAohDHRWcGvbPSD7r3WojpKb.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hhQT0TySg3LXCE8BEPpfPJ5zJA2.jpg",
        "overview": "When a medical emergency pulls the Goss family apart, determined dog Winstead will do all he can to bring his humans back together before Christmas Eve.",
        "genres": []
      },
      {
        "id": "1153576",
        "title": "Street Fighter",
        "type": "movie",
        "rating": "6.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
        "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
        "genres": []
      },
      {
        "id": "1518204",
        "title": "Allen",
        "type": "movie",
        "rating": "6.8",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
        "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
        "genres": []
      },
      {
        "id": "1465063",
        "title": "Forgotten Island",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/myd1K3gefdNAWFsGNRDdMeiK9Qg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2o9FzuBzCqrDTdlHRuEVnGD2d5h.jpg",
        "overview": "While celebrating their last night together, high school graduates and best friends Jo and Raissa stumble upon a mysterious portal that transports them to the fantastical island of Nakali. When they discover that the memories of their entire friendship are the price for returning home, Jo and Raissa must race to find a way to leave the island before they forget each other forever.",
        "genres": []
      },
      {
        "id": "1084244",
        "title": "Toy Story 5",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
        "overview": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
        "genres": []
      },
      {
        "id": "1234139",
        "title": "Jailer 2",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/upwdEyhhYZ7pT2hD535fr2MGfpx.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/m0ks2o59mOAz6WdCybJ5FAUNTOU.jpg",
        "overview": "When a dangerous syndicate threatens his family, retired jailer Tiger Muthuvel Pandian goes undercover as a driver to battle enemies from the shadows.",
        "genres": []
      },
      {
        "id": "891621",
        "title": "Wild Horse Nine",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/dNJFRtVg3xLQ7dbNIQ55cmmIniD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3uLA0ujne91bkzFStZICCYeqhnt.jpg",
        "overview": "Shortly before the 1973 Chilean coup, CIA agents Chris and Lee are dispatched from Santiago to Easter Island by their bureau chief, MJ. Amongst the Island's iconic statues, and as the longtime partners wrestle with their dark pasts and present conspiracies, Chris's newfound bond with a pair of rebellious students threatens to send everyone’s trip to this remote paradise sideways.",
        "genres": []
      },
      {
        "id": "1148365",
        "title": "Matchbox the Movie",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/aHhHRz6nOpwkqJs5ASeRGAdK2dt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg",
        "overview": "When a group of former childhood friends reconnect, their reunion takes a wild turn as they stumble upon a dangerous international plot—and must save the world.",
        "genres": []
      },
      {
        "id": "1108427",
        "title": "Moana",
        "type": "movie",
        "rating": "7.4",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
        "overview": "Teenage Moana answers the Ocean's call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people.",
        "genres": []
      },
      {
        "id": "1204680",
        "title": "Coyote vs. Acme",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
        "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
        "genres": []
      },
      {
        "id": "1377237",
        "title": "Runner",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/vJk2TW1QZAmBiD7oj9ZF9EPTYY1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg",
        "overview": "A former soldier is thrown into a brutal race against time when a critical medical delivery makes him and his unlikely partner the targets of a ruthless cartel. As the mission spirals into a deadly manhunt, every detour, delay, and bullet pushes them closer to failure. With betrayal closing in from every side, they must survive the chase and deliver their cargo to save the life of a little girl.",
        "genres": []
      },
      {
        "id": "1117898",
        "title": "The Cat in the Hat",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9y9o686DsQg0KzPtERzcW7Cf8IE.jpg",
        "overview": "Assigned his toughest mission yet, the Cat must cheer up siblings Gabby and Sebastian as they adjust to life in a new town. Known for pushing boundaries, this agent of chaos must prove himself or risk losing his magical hat forever.",
        "genres": []
      },
      {
        "id": "1187326",
        "title": "Tad and The Magic Lamp",
        "type": "movie",
        "rating": "8.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/AdDxZgNmRYgDuweY8899buyVqlr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zbpimMxf6Ms96v3Zypuv8WltMSO.jpg",
        "overview": "Tadeo, his girlfriend Sara, and his friends Momia, Jeff, and Belzoni embark on an adventure after Tadeo accidentally unleashes an ancient spell.",
        "genres": []
      },
      {
        "id": "1315772",
        "title": "Minions & Monsters",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
        "overview": "This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created.",
        "genres": []
      },
      {
        "id": "1302904",
        "title": "Practical Magic 2",
        "type": "movie",
        "rating": "7.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
        "overview": "The Owens sisters must confront the dark curse that threatens to unravel their family once and for all.",
        "genres": []
      },
      {
        "id": "1195803",
        "title": "Wicker",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/6FcBZOKvyrLCKGCyBG0ySCR4okt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xVh1ypMoVkMf5IB7y3hnRplJ14c.jpg",
        "overview": "On the outskirts of a village by the sea, lives a Fisherwoman; smelly, single and perpetually ridiculed. One day, fed up with her stuffy, small-minded neighbours, she commissions herself a husband to be made from wicker. In an otherwise conservative town, this unconventional romance sparks outrage, jealousy and chaos.",
        "genres": []
      },
      {
        "id": "533535",
        "title": "Deadpool & Wolverine",
        "type": "movie",
        "rating": "7.6",
        "year": "2024",
        "poster": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
        "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
        "genres": []
      }
    ]
  },
  {
    "id": "rail-anime",
    "title": "Acclaimed Anime & Animation",
    "type": "anime",
    "category": "popular",
    "items": [
      {
        "id": "354912",
        "title": "Coco",
        "type": "movie",
        "rating": "8.2",
        "year": "2017",
        "poster": "https://image.tmdb.org/t/p/w500/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg",
        "overview": "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
        "genres": []
      },
      {
        "id": "791523",
        "title": "Wildwood",
        "type": "movie",
        "rating": "8.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/snFM00mpNAfUzUtkdEW0uDEvXA0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
        "overview": "Prue and her classmate Curtis are drawn into a magical forest filled with enchanted creatures, loyal allies, and formidable adversaries as they embark on a desperate quest to rescue Prue's abducted baby brother from a murder of crows led by a mysterious woman named Alexandra.",
        "genres": []
      },
      {
        "id": "1465063",
        "title": "Forgotten Island",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/myd1K3gefdNAWFsGNRDdMeiK9Qg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2o9FzuBzCqrDTdlHRuEVnGD2d5h.jpg",
        "overview": "While celebrating their last night together, high school graduates and best friends Jo and Raissa stumble upon a mysterious portal that transports them to the fantastical island of Nakali. When they discover that the memories of their entire friendship are the price for returning home, Jo and Raissa must race to find a way to leave the island before they forget each other forever.",
        "genres": []
      },
      {
        "id": "1084244",
        "title": "Toy Story 5",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
        "overview": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
        "genres": []
      },
      {
        "id": "1204680",
        "title": "Coyote vs. Acme",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
        "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
        "genres": []
      },
      {
        "id": "1117898",
        "title": "The Cat in the Hat",
        "type": "movie",
        "rating": "6.9",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9y9o686DsQg0KzPtERzcW7Cf8IE.jpg",
        "overview": "Assigned his toughest mission yet, the Cat must cheer up siblings Gabby and Sebastian as they adjust to life in a new town. Known for pushing boundaries, this agent of chaos must prove himself or risk losing his magical hat forever.",
        "genres": []
      },
      {
        "id": "1187326",
        "title": "Tad and The Magic Lamp",
        "type": "movie",
        "rating": "8.3",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/AdDxZgNmRYgDuweY8899buyVqlr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zbpimMxf6Ms96v3Zypuv8WltMSO.jpg",
        "overview": "Tadeo, his girlfriend Sara, and his friends Momia, Jeff, and Belzoni embark on an adventure after Tadeo accidentally unleashes an ancient spell.",
        "genres": []
      },
      {
        "id": "1315772",
        "title": "Minions & Monsters",
        "type": "movie",
        "rating": "7.5",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
        "overview": "This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created.",
        "genres": []
      },
      {
        "id": "822653",
        "title": "Puella Magi Madoka Magica the Movie -Walpurgisnacht: Rising-",
        "type": "movie",
        "rating": "8.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/g4kCd4rMuN7G3VQQDUT6mLbrBqQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xzm3RfWh932rS28WErNC3u8qzVm.jpg",
        "overview": "After the events of Rebellion, the world appears to be in balance—but that peace is fragile. As a new threat connected to Walpurgisnacht emerges, Homura Akemi is forced to face the consequences of her choices and question how far she is willing to go to protect Madoka.",
        "genres": []
      },
      {
        "id": "980431",
        "title": "Avatar Aang: The Last Airbender",
        "type": "movie",
        "rating": "9.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg",
        "overview": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
        "genres": []
      },
      {
        "id": "14836",
        "title": "Coraline",
        "type": "movie",
        "rating": "8.0",
        "year": "2009",
        "poster": "https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hofnlIyF6bePkgQOpcuRWLvzf15.jpg",
        "overview": "Wandering her rambling old house in her boring new town, 11-year-old Coraline discovers a hidden door to a strangely idealized version of her life. In order to stay in the fantasy, she must make a frighteningly real sacrifice.",
        "genres": []
      },
      {
        "id": "494656",
        "title": "The Legend of the Black Charro",
        "type": "movie",
        "rating": "8.3",
        "year": "2018",
        "poster": "https://image.tmdb.org/t/p/w500/fDLJ5vIeRL68cIHlob11w2pBzH0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3AXR3AFTHdU38OR14jfcK8FjJ5H.jpg",
        "overview": "After releasing the Chupacabras, Leo San Juan decides that it is time to return together with his brother Nando to his grandmother's house. Halfway down the road, Charro Negro manages to confuse Leo and because of him, an innocent girl is dragged into the underworld. Leo is forced to repair the damage. His friends will come to try to help him and get out of there as soon as possible. But it is no coincidence that the Charro has chosen to involve Leo, his intentions go beyond getting a new soul.",
        "genres": []
      },
      {
        "id": "1084242",
        "title": "Zootopia 2",
        "type": "movie",
        "rating": "7.7",
        "year": "2025",
        "poster": "https://image.tmdb.org/t/p/w500/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lgotja3xMoJZbynwHfcQcJAEMWH.jpg",
        "overview": "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
        "genres": []
      },
      {
        "id": "1226863",
        "title": "The Super Mario Galaxy Movie",
        "type": "movie",
        "rating": "8.2",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kxQiIJ4gVcD3K6o14MJ72p5yRcE.jpg",
        "overview": "Having thwarted Bowser's previous plot to marry Princess Peach, Mario and Luigi now face a fresh threat in Bowser Jr., who is determined to liberate his father from captivity and restore the family legacy. Alongside companions new and old, the brothers travel across the stars to stop the young heir's crusade.",
        "genres": []
      },
      {
        "id": "129",
        "title": "Spirited Away",
        "type": "movie",
        "rating": "8.5",
        "year": "2001",
        "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
        "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
        "genres": []
      },
      {
        "id": "1311031",
        "title": "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
        "type": "movie",
        "rating": "8.8",
        "year": "2025",
        "poster": "https://image.tmdb.org/t/p/w500/fWVSwgjpT2D78VUh6X8UBd2rorW.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1RgPyOhN4DRs225BGTlHJqCudII.jpg",
        "overview": "The Demon Slayer Corps are drawn into the Infinity Castle, where Tanjiro, Nezuko, and the Hashira face terrifying Upper Rank demons in a desperate fight as the final battle against Muzan Kibutsuji begins.",
        "genres": []
      },
      {
        "id": "9479",
        "title": "The Nightmare Before Christmas",
        "type": "movie",
        "rating": "7.9",
        "year": "1993",
        "poster": "https://image.tmdb.org/t/p/w500/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dSfrsjhqC6lYe7LYDYnzWeXZmEl.jpg",
        "overview": "Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly Pumpkin King of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning in his place. But, as the holiday approaches, Jack's rag-doll girlfriend Sally tries to foil his well-meaning yet misguided plans.",
        "genres": []
      },
      {
        "id": "1780407",
        "title": "Snoopy Presents: 12 Days of Snoopy",
        "type": "movie",
        "rating": "7.0",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/9wZAvvAZgwp2Lxbhjkp9N6HHJBm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3gIGgmK27lt3YK9EUnZ6iXMHg7Q.jpg",
        "overview": "Eager to get off Santa's naughty list, Snoopy goes all out to be the nicest beagle in town.",
        "genres": []
      },
      {
        "id": "1185806",
        "title": "PAW Patrol: The Dino Movie",
        "type": "movie",
        "rating": "8.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/cxXSF4aY5N2cOGwaga5OnpPFHzk.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dY4LyVSvjk9dN20YsxuouaMIMox.jpg",
        "overview": "The Paw Patrol lands on a mysterious dinosaur island after a storm, where they meet Rex, a stranded pup. When Humdinger's reckless mining triggers a volcano, the team faces their biggest rescue mission yet to save the island.",
        "genres": []
      },
      {
        "id": "1327819",
        "title": "Hoppers",
        "type": "movie",
        "rating": "8.1",
        "year": "2026",
        "poster": "https://image.tmdb.org/t/p/w500/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/u53UYu5XG2hNgWGvs3xGhAVzypl.jpg",
        "overview": "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
        "genres": []
      }
    ]
  }
];

export const RICH_HOME_CATALOG: HomeCatalog = {
  hero: {
  "id": "1368337",
  "title": "The Odyssey",
  "type": "movie",
  "rating": "8.0",
  "year": "2026",
  "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
  "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
  "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
  "genres": []
},
  rails: RICH_RAILS
};

export const CATEGORY_COLLECTIONS: Record<string, MediaItem[]> = {
  "movies": [
    {
      "id": "1263337",
      "title": "Heart of the Beast",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
      "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
      "genres": []
    },
    {
      "id": "1368337",
      "title": "The Odyssey",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
      "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
      "genres": []
    },
    {
      "id": "1423191",
      "title": "Resident Evil",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
      "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
      "genres": []
    },
    {
      "id": "1400837",
      "title": "Other Mommy",
      "type": "movie",
      "rating": "6.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
      "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
      "genres": []
    },
    {
      "id": "969681",
      "title": "Spider-Man: Brand New Day",
      "type": "movie",
      "rating": "8.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
      "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
      "genres": []
    },
    {
      "id": "687163",
      "title": "Project Hail Mary",
      "type": "movie",
      "rating": "8.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
      "overview": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
      "genres": []
    },
    {
      "id": "1058424",
      "title": "Hope",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qqHFLg90IUSoTmSMpKOOW5RyqN3.jpg",
      "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
      "genres": []
    },
    {
      "id": "1813355",
      "title": "A Story of Derry",
      "type": "movie",
      "rating": "6.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
      "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
      "genres": []
    },
    {
      "id": "1616687",
      "title": "Never Surrender",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
      "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
      "genres": []
    },
    {
      "id": "1507696",
      "title": "Apocalypse Z: New World",
      "type": "movie",
      "rating": "6.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
      "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
      "genres": []
    },
    {
      "id": "1244523",
      "title": "Beware Boiúna",
      "type": "movie",
      "rating": "6.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
      "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
      "genres": []
    },
    {
      "id": "1294189",
      "title": "The Mongoose",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
      "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
      "genres": []
    },
    {
      "id": "1381071",
      "title": "Godzilla Minus Zero",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
      "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
      "genres": []
    },
    {
      "id": "1562642",
      "title": "Ghost Soldier",
      "type": "movie",
      "rating": "9.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
      "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
      "genres": []
    },
    {
      "id": "1567605",
      "title": "Ebenezer",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
      "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
      "genres": []
    },
    {
      "id": "1422041",
      "title": "La Bola Negra",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7HwFQTMghL6HOvzEnXYUvyuZXeh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bDsmYvrzto7xrEwqDpLC3SPhn9A.jpg",
      "overview": "The intertwined lives of three men in three different eras, three lives intimately linked by sexuality and desire, pain, and legacy.",
      "genres": []
    },
    {
      "id": "656908",
      "title": "Ramayana: Rise of a Legend",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
      "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
      "genres": []
    },
    {
      "id": "1101412",
      "title": "Fall 2: Deadpoint",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
      "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
      "genres": []
    },
    {
      "id": "1283515",
      "title": "Verity",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
      "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
      "genres": []
    },
    {
      "id": "1543469",
      "title": "Heartland",
      "type": "movie",
      "rating": "6.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
      "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
      "genres": []
    },
    {
      "id": "1228834",
      "title": "The Fix",
      "type": "movie",
      "rating": "5.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
      "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
      "genres": []
    },
    {
      "id": "1514026",
      "title": "Buddy",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
      "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
      "genres": []
    },
    {
      "id": "1596275",
      "title": "Drive - The Pretenders",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
      "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
      "genres": []
    },
    {
      "id": "354912",
      "title": "Coco",
      "type": "movie",
      "rating": "8.2",
      "year": "2017",
      "poster": "https://image.tmdb.org/t/p/w500/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg",
      "overview": "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
      "genres": []
    },
    {
      "id": "1432306",
      "title": "Sleepwalker",
      "type": "movie",
      "rating": "4.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/760SP4VsZagpyB9WLfeZykE3DFg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2dYKSPT1SJZVlKwXHic4Ma53f0X.jpg",
      "overview": "A grieving mother is haunted by the tragic loss of her daughter in a car accident that left her abusive husband in a coma. As she battles a surreal descent into darkness, her sleepwalking episodes intensify. Plagued by haunting visions of her husband inside their home, she grapples with the blurred lines between reality and nightmare.",
      "genres": []
    },
    {
      "id": "1185344",
      "title": "The Beast",
      "type": "movie",
      "rating": "5.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
      "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
      "genres": []
    },
    {
      "id": "1657630",
      "title": "The Awakening",
      "type": "movie",
      "rating": "6.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
      "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
      "genres": []
    },
    {
      "id": "1570488",
      "title": "A Dog's Perfect Christmas",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/zvsNAohDHRWcGvbPSD7r3WojpKb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hhQT0TySg3LXCE8BEPpfPJ5zJA2.jpg",
      "overview": "When a medical emergency pulls the Goss family apart, determined dog Winstead will do all he can to bring his humans back together before Christmas Eve.",
      "genres": []
    },
    {
      "id": "940721",
      "title": "Godzilla Minus One",
      "type": "movie",
      "rating": "7.6",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
      "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
      "genres": []
    },
    {
      "id": "299534",
      "title": "Avengers: Endgame",
      "type": "movie",
      "rating": "8.2",
      "year": "2019",
      "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
      "genres": []
    },
    {
      "id": "1595325",
      "title": "The Anacondas",
      "type": "movie",
      "rating": "3.6",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yphysF14qWFvrIbFVg3vEnbudwT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ryA5uYC7mVZv9dEnAGvL9Iv8kVZ.jpg",
      "overview": "Explorers in Mexico uncover the ruins of an ancient snake-worshiping civilization. Celebration turns to horror when they awaken an ever-growing anaconda, starved of human sacrifices for centuries. Now, the team must band together to survive.",
      "genres": []
    },
    {
      "id": "755898",
      "title": "War of the Worlds",
      "type": "movie",
      "rating": "4.0",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
      "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
      "genres": []
    },
    {
      "id": "1291595",
      "title": "Insidious: Out of the Further",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
      "overview": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
      "genres": []
    },
    {
      "id": "1153576",
      "title": "Street Fighter",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
      "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
      "genres": []
    },
    {
      "id": "1288445",
      "title": "Mutiny",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
      "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
      "genres": []
    },
    {
      "id": "1474226",
      "title": "Evil Dress",
      "type": "movie",
      "rating": "6.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4346oRUfjNtBezOQoKiu31J34L9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ftfnS4ABocBNkwrvkIjkkxaBjgH.jpg",
      "overview": "After a difficult divorce, Alicia moves into an old house with her daughter Carla, unaware that it hides a past of recurrent tragedy. As Carla senses perturbing presences, Alicia begins to doubt her own sanity. A blue dress connects Carla to the ghost of a girl from the past, triggering terrifying events. Mother and daughter will try to escape the house, but the house won’t let them get away so easily.",
      "genres": []
    },
    {
      "id": "1518204",
      "title": "Allen",
      "type": "movie",
      "rating": "6.9",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
      "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
      "genres": []
    },
    {
      "id": "791523",
      "title": "Wildwood",
      "type": "movie",
      "rating": "8.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/snFM00mpNAfUzUtkdEW0uDEvXA0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
      "overview": "Prue and her classmate Curtis are drawn into a magical forest filled with enchanted creatures, loyal allies, and formidable adversaries as they embark on a desperate quest to rescue Prue's abducted baby brother from a murder of crows led by a mysterious woman named Alexandra.",
      "genres": []
    }
  ],
  "tv": [
    {
      "id": "2734",
      "title": "Law & Order: Special Victims Unit",
      "type": "tv",
      "rating": "8.0",
      "year": "1999",
      "poster": "https://image.tmdb.org/t/p/w500/pHNhUwSXuDQ9jPZOCb8SgJaQZsc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
      "overview": "In the criminal justice system, sexually-based offenses are considered especially heinous. In New York City, the dedicated detectives who investigate these vicious felonies are members of an elite squad known as the Special Victims Unit. These are their stories.",
      "genres": []
    },
    {
      "id": "1413",
      "title": "American Horror Story",
      "type": "tv",
      "rating": "8.1",
      "year": "2011",
      "poster": "https://image.tmdb.org/t/p/w500/yCkPLQ10qKIUgRBXmQVVMF1h96d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5G4Bnc4Q0YUK1bwLEUYmIsmm2Ib.jpg",
      "overview": "An anthology horror drama series centering on different characters and locations, including a house with a murderous past, an asylum, a witch coven, a freak show, a hotel, a farmhouse in Roanoke, a cult, the apocalypse and a summer camp.",
      "genres": []
    },
    {
      "id": "84773",
      "title": "The Lord of the Rings: The Rings of Power",
      "type": "tv",
      "rating": "7.2",
      "year": "2022",
      "poster": "https://image.tmdb.org/t/p/w500/bMXWXKM9ydUmMTNvDnYo9QtCBRt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uVOcz7JBOuZxsx9IYpx6Ah174LX.jpg",
      "overview": "Beginning in a time of relative peace, we follow an ensemble cast of characters as they confront the re-emergence of evil to Middle-earth. From the darkest depths of the Misty Mountains, to the majestic forests of Lindon, to the breathtaking island kingdom of Númenor, to the furthest reaches of the map, these kingdoms and characters will carve out legacies that live on long after they are gone.",
      "genres": []
    },
    {
      "id": "1100",
      "title": "How I Met Your Mother",
      "type": "tv",
      "rating": "8.1",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/b34jPzmB0wZy7EjUZoleXOl2RRI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3f8aW6vcYRP6mTZdgXm83BiuB9t.jpg",
      "overview": "A father recounts to his children - through a series of flashbacks - the journey he and his four best friends took leading up to him meeting their mother.",
      "genres": []
    },
    {
      "id": "57243",
      "title": "Doctor Who",
      "type": "tv",
      "rating": "7.6",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/lHfmc6d8pOVFrD0eOKPiDbjeucG.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/vcFW09U4834DyFOeRZpsx9x1D3S.jpg",
      "overview": "The Doctor is a Time Lord: a 900 year old alien with 2 hearts, part of a gifted civilization who mastered time travel. The Doctor saves planets for a living—more of a hobby actually, and the Doctor's very, very good at it.",
      "genres": []
    },
    {
      "id": "2316",
      "title": "The Office",
      "type": "tv",
      "rating": "8.6",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9vMzIrMIncPmtalcxh1MOrgcE6C.jpg",
      "overview": "The everyday lives of office employees in the Scranton, Pennsylvania branch of the fictional Dunder Mifflin Paper Company.",
      "genres": []
    },
    {
      "id": "5920",
      "title": "The Mentalist",
      "type": "tv",
      "rating": "8.4",
      "year": "2008",
      "poster": "https://image.tmdb.org/t/p/w500/k0kMdO52LpC5JWgd0uWEH7gqcCe.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/rJFqKcmMSttdNP58l0dVzY2NcTA.jpg",
      "overview": "Patrick Jane, a former celebrity psychic medium, uses his razor sharp skills of observation and expertise at \"reading\" people to solve serious crimes with the California Bureau of Investigation.",
      "genres": []
    },
    {
      "id": "1408",
      "title": "House",
      "type": "tv",
      "rating": "8.6",
      "year": "2004",
      "poster": "https://image.tmdb.org/t/p/w500/3Cz7ySOQJmqiuTdrc6CY0r65yDI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/r0Q6eeN9L1ORL9QsV0Sg8ZV3vnv.jpg",
      "overview": "Dr. Gregory House, a drug-addicted, unconventional, misanthropic medical genius, leads a team of diagnosticians at the fictional Princeton–Plainsboro Teaching Hospital in New Jersey.",
      "genres": []
    },
    {
      "id": "456",
      "title": "The Simpsons",
      "type": "tv",
      "rating": "8.0",
      "year": "1989",
      "poster": "https://image.tmdb.org/t/p/w500/tf0CUEynk6GfmrlHIQKQ5mfFP5P.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/jIArNHIekrCSVgdMbKPAXpPY03Y.jpg",
      "overview": "Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.",
      "genres": []
    },
    {
      "id": "1421",
      "title": "Modern Family",
      "type": "tv",
      "rating": "7.9",
      "year": "2009",
      "poster": "https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nO7EzksrBzlNpAg5rgv8HzaBIkx.jpg",
      "overview": "The Pritchett-Dunphy-Tucker clan is a wonderfully large and blended family. They give us an honest and often hilarious look into the sometimes warm, sometimes twisted, embrace of the modern family.",
      "genres": []
    },
    {
      "id": "60735",
      "title": "The Flash",
      "type": "tv",
      "rating": "7.7",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/yZevl2vHQgmosfwUdVNzviIfaWS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gFkHcIh7iE5G0oVOgpmY8ONQjhl.jpg",
      "overview": "After being struck by lightning, CSI investigator Barry Allen awakens from a nine-month coma to discover he has been  granted the gift of super speed.  Teaming up with S.T.A.R. Labs, Barry takes on the persona of The Flash, the Fastest  Man Alive, to protect his city.",
      "genres": []
    },
    {
      "id": "1400",
      "title": "Seinfeld",
      "type": "tv",
      "rating": "8.2",
      "year": "1989",
      "poster": "https://image.tmdb.org/t/p/w500/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tMRdEsMg9MyXAkcufK9YJEeIaNW.jpg",
      "overview": "A stand-up comedian and his three offbeat friends weather the pitfalls and payoffs of life in New York City in the '90s. It's a show about nothing.",
      "genres": []
    },
    {
      "id": "18165",
      "title": "The Vampire Diaries",
      "type": "tv",
      "rating": "8.3",
      "year": "2009",
      "poster": "https://image.tmdb.org/t/p/w500/aBkVgChtyyJaHyZh1gfd8DbzQon.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cJYLon9ejKJV7ua03ab8Tj9u067.jpg",
      "overview": "The story of two vampire brothers obsessed with the same girl, who bears a striking resemblance to the beautiful but ruthless vampire they knew and loved in 1864.",
      "genres": []
    },
    {
      "id": "4057",
      "title": "Criminal Minds",
      "type": "tv",
      "rating": "8.3",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/hWSb4UnIjlTvnvrP98NbFSO60HA.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tUtXfyVy54BY7eJnRtI8Xnmr1ZL.jpg",
      "overview": "An elite team of FBI profilers analyze the country's most twisted criminal minds, anticipating their next moves before they strike again. The Behavioral Analysis Unit's most experienced agent is David Rossi, a founding member of the BAU who returns to help the team solve new cases.",
      "genres": []
    },
    {
      "id": "37678",
      "title": "The Voice",
      "type": "tv",
      "rating": "5.8",
      "year": "2011",
      "poster": "https://image.tmdb.org/t/p/w500/7ah1WExcMkzbq7sARCTmcC23tBr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/x8pSFa3BXyVpkjHyn7YxmLyhjoh.jpg",
      "overview": "The strongest vocalists from across the United states compete in a blockbusters vocal competition, the winner becomes “The Voice.” The show's innovative format features four stages of competition: the blind auditions, the battle rounds, the knockouts and, finally, the live performance shows.",
      "genres": []
    },
    {
      "id": "2025",
      "title": "Beverly Hills, 90210",
      "type": "tv",
      "rating": "7.3",
      "year": "1990",
      "poster": "https://image.tmdb.org/t/p/w500/b7BYfkhu653D894krwGO1ysIKTf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iMFsQ7yyToYg7SkS9Ml0by9UJ0X.jpg",
      "overview": "Follow the lives of a group of teenagers living in the upscale, star-studded community of Beverly Hills, California and attending the fictitious West Beverly Hills High School and, subsequently, the fictitious California University after graduation.",
      "genres": []
    },
    {
      "id": "4620",
      "title": "Eureka",
      "type": "tv",
      "rating": "7.7",
      "year": "2006",
      "poster": "https://image.tmdb.org/t/p/w500/f2l5hUk63hPqYTucnFy2HmElFV0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8MQeyFsWrp2ILjbumtxrinmk7t4.jpg",
      "overview": "The sleepy Pacific Northwest town of Eureka is hiding a mysterious secret. The government has been relocating the world's geniuses and their families to this rustic town for years where innovation and chaos have lived hand in hand. U.S. Marshal Jack Carter stumbles upon this odd town after wrecking his car and becoming stranded there. When the denizens of the town unleash an unknown scientific creation, Carter jumps in to try to restore order and consequently learns of one of the country's best kept secrets.",
      "genres": []
    },
    {
      "id": "1877",
      "title": "Phineas and Ferb",
      "type": "tv",
      "rating": "7.9",
      "year": "2007",
      "poster": "https://image.tmdb.org/t/p/w500/g6TidT7be954rrzPPBTIXkSmfXj.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5MWFjQ3NuNtNeOE9FdrVLeNMNPs.jpg",
      "overview": "Each day, two kindhearted suburban stepbrothers on summer vacation embark on some grand new project, which annoys their controlling sister, Candace, who tries to bust them. Meanwhile, their pet platypus plots against evil Dr. Doofenshmirtz.",
      "genres": []
    },
    {
      "id": "61923",
      "title": "Star vs. the Forces of Evil",
      "type": "tv",
      "rating": "8.4",
      "year": "2015",
      "poster": "https://image.tmdb.org/t/p/w500/dKFL1AOdKNoazqZDg1zq2z69Lx1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2UElp7Dkm3SiB9ZEdKEWNmAOijB.jpg",
      "overview": "Intergalactic warrior Star Butterfly arrives on Earth to live with the Diaz family. She continues to battle villains throughout the universe and high school, mainly to protect her extremely powerful wand, an object that still confuses her.",
      "genres": []
    },
    {
      "id": "32573",
      "title": "Strike Back",
      "type": "tv",
      "rating": "7.4",
      "year": "2010",
      "poster": "https://image.tmdb.org/t/p/w500/c0ItaC2Grf4WVJ06G87BjNn9pRs.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2tL3pNaPQb2ioEYswMkDGVTo1pt.jpg",
      "overview": "The series follows John Porter, a former British Special Forces soldier, who is drafted back into service by Section 20, a fictional branch of the Secret Intelligence Service.",
      "genres": []
    },
    {
      "id": "231100",
      "title": "Boundless Love",
      "type": "tv",
      "rating": "8.1",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/1BQSLOIvjnBzrxkXjX9R0JfHTWI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/vV5GFJtp8DgAysY1F0WfIwedi81.jpg",
      "overview": "When he was a little child, Halil İbrahim lost his father due to a blood feud and was exiled to Istanbul. Twenty years later, he returns to his homeland in the Karadeniz region as a handsome, powerful young man. He plans to marry the girl he loves, Yasemin, and start a new life. However, events do not allow this. Halil İbrahim embarks on a journey of revenge, and his life will change completely when he encounters Zeynep from the Leto family.",
      "genres": []
    },
    {
      "id": "253376",
      "title": "The Girlfriend",
      "type": "tv",
      "rating": "7.1",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/ktrp3tdZ5IQpFux4nLy8z70bt3n.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lnVWmFvLv2pTZGsuAJytiqKu541.jpg",
      "overview": "Laura has it all: a glittering career, a loving husband, and her precious son, Daniel. But her perfect life unravels when Daniel brings home Cherry, a girlfriend who changes everything. After a tense introduction, Laura becomes convinced Cherry is hiding something. Is she a manipulative social climber, or is Laura just paranoid? The truth is a matter of perspective.",
      "genres": []
    },
    {
      "id": "48866",
      "title": "The 100",
      "type": "tv",
      "rating": "7.9",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/wHIMMLFsk32wIzDmawWkYVbxFCS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8ZerYKvIaNUJZvAHXYTQu4qTwFw.jpg",
      "overview": "100 years in the future, when the Earth has been abandoned due to radioactivity, the last surviving humans live on an ark orbiting the planet — but the ark won't last forever. So the repressive regime picks 100 expendable juvenile delinquents to send down to Earth to see if the planet is still habitable.",
      "genres": []
    },
    {
      "id": "1416",
      "title": "Grey's Anatomy",
      "type": "tv",
      "rating": "8.2",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/gO8Fo47KV1opiutRDdBS5jclTQB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/A4NwkQXTXElE5iAsne5RpvS8R2Z.jpg",
      "overview": "Follows the personal and professional lives of a group of doctors at Seattle's Grey Sloan Memorial Hospital.",
      "genres": []
    },
    {
      "id": "82873",
      "title": "The Kelly Clarkson Show",
      "type": "tv",
      "rating": "6.2",
      "year": "2019",
      "poster": "https://image.tmdb.org/t/p/w500/sBix25bie9UQFzbarN51DpFO5ky.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bk7QdAIUqkGpZO5GUX4AMB2AZIB.jpg",
      "overview": "Kelly Clarkson presents the biggest newsmakers and names in film, television and music; as well as emerging new talent and everyday people who are beacons of hope in their communities.",
      "genres": []
    },
    {
      "id": "61923",
      "title": "Star vs. the Forces of Evil",
      "type": "tv",
      "rating": "8.4",
      "year": "2015",
      "poster": "https://image.tmdb.org/t/p/w500/dKFL1AOdKNoazqZDg1zq2z69Lx1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2UElp7Dkm3SiB9ZEdKEWNmAOijB.jpg",
      "overview": "Intergalactic warrior Star Butterfly arrives on Earth to live with the Diaz family. She continues to battle villains throughout the universe and high school, mainly to protect her extremely powerful wand, an object that still confuses her.",
      "genres": []
    },
    {
      "id": "61733",
      "title": "Empire",
      "type": "tv",
      "rating": "7.1",
      "year": "2015",
      "poster": "https://image.tmdb.org/t/p/w500/gTrzYR6gWMhQ8yINW9JCLeoJHvf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/FNeJtRUd5XID186SHzjNNneP3f.jpg",
      "overview": "A powerful family drama about the head of a music empire whose three sons and ex-wife all battle for his throne.",
      "genres": []
    },
    {
      "id": "83631",
      "title": "What We Do in the Shadows",
      "type": "tv",
      "rating": "8.0",
      "year": "2019",
      "poster": "https://image.tmdb.org/t/p/w500/wa3ZQE9kLnqwN3vQ0NNjg1NPsCa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mKikck71CvVISUSTLk29fwRbH4y.jpg",
      "overview": "A documentary-style look into the daily (or rather, nightly) lives of a group of vampires in Staten Island who have “lived” together for hundreds and hundreds of years.",
      "genres": []
    },
    {
      "id": "64414",
      "title": "Wakfu",
      "type": "tv",
      "rating": "8.3",
      "year": "2008",
      "poster": "https://image.tmdb.org/t/p/w500/nA8Z1fq3OTE2IrM8BiWxlPmrCpU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/794lCiKgncQg4tE2FDY8GVcEubZ.jpg",
      "overview": "Follow Yugo and his friends Amalia, Evangelyne, Tristepin, Ruel and Az as they try to rescue the world of Wakfu from destruction.",
      "genres": []
    },
    {
      "id": "12323",
      "title": "Beyond Belief: Fact or Fiction",
      "type": "tv",
      "rating": "7.3",
      "year": "1997",
      "poster": "https://image.tmdb.org/t/p/w500/x6t4LPGYdCLqsdijZqSOxzic3Tj.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/meku4H3J2lIxIqo7M8wkCqJ52cb.jpg",
      "overview": "Can you tell the difference between fact and fiction? Several stories of strange, mysterious and incredible occurrences are chronicled during each episode. It is up to the viewer to decide which stories actually happened and which were completely fabricated by the show’s writers. The answer is revealed by Jonathan Frakes at the conclusion of each episode.",
      "genres": []
    },
    {
      "id": "873",
      "title": "Columbo",
      "type": "tv",
      "rating": "8.1",
      "year": "1971",
      "poster": "https://image.tmdb.org/t/p/w500/2JCD8vab3fircOU8cM2HJCxfv4I.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d7cH4zt3xoqRQnLqYXMPOrUz5k3.jpg",
      "overview": "Columbo is a friendly, verbose, disheveled-looking police detective who is consistently underestimated by his suspects. Despite his unprepossessing appearance and apparent absentmindedness, he shrewdly solves all of his cases and secures all evidence needed for indictment. His formidable eye for detail and meticulously dedicated approach often become clear to the killer only late in the storyline.",
      "genres": []
    },
    {
      "id": "61928",
      "title": "Lucha Underground",
      "type": "tv",
      "rating": "7.1",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/by1AztJ9I1gjWKPL3XdYxiFOU5T.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lQp79IOcrLdPps9BvnKPvOeX6pD.jpg",
      "overview": "Lucha Underground introduces U.S. audiences to the high-flying, explosive moves of lucha libre. An ancient combat tradition, watch as good and evil wage war in a gritty battleground called “The Temple.”",
      "genres": []
    },
    {
      "id": "2119",
      "title": "Airwolf",
      "type": "tv",
      "rating": "7.6",
      "year": "1984",
      "poster": "https://image.tmdb.org/t/p/w500/4PAN7zPqmR9b73een97WkxqCTQN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8693rGsfkROQjiwlJD8O2WQV1Et.jpg",
      "overview": "As part of a deal with an intelligence agency to look for his missing brother, a renegade pilot goes on missions with an advanced battle helicopter.",
      "genres": []
    },
    {
      "id": "63333",
      "title": "The Last Kingdom",
      "type": "tv",
      "rating": "8.3",
      "year": "2015",
      "poster": "https://image.tmdb.org/t/p/w500/8eJf0hxgIhE6QSxbtuNCekTddy1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/QbtctI8EzlhsyFDMUMyG3fli8B.jpg",
      "overview": "A show of heroic deeds and epic battles with a thematic depth that embraces politics, religion, warfare, courage, love, loyalty and our universal search for identity. Combining real historical figures and events with fictional characters, it is the story of how a people combined their strength under one of the most iconic kings of history in order to reclaim their land for themselves and build a place they call home.",
      "genres": []
    },
    {
      "id": "22980",
      "title": "Watch What Happens Live with Andy Cohen",
      "type": "tv",
      "rating": "4.9",
      "year": "2009",
      "poster": "https://image.tmdb.org/t/p/w500/onSD9UXfJwrMXWhq7UY7hGF2S1h.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg",
      "overview": "Bravo network executive Andy Cohen discusses pop culture topics with celebrities and reality show personalities.",
      "genres": []
    },
    {
      "id": "46648",
      "title": "True Detective",
      "type": "tv",
      "rating": "8.3",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/cuV2O5ZyDLHSOWzg3nLVljp1ubw.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v8YFr8BbU9qsO8PYIulzTeM6Qk.jpg",
      "overview": "An American anthology police detective series utilizing multiple timelines in which investigations seem to unearth personal and professional secrets of those involved, both within or outside the law.",
      "genres": []
    },
    {
      "id": "247718",
      "title": "MobLand",
      "type": "tv",
      "rating": "8.7",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/5Xc7WpWsgflfgEMoBlf9TmWhfbH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/h0OC7ouop8YLwbAVfS3UUE2Lw4T.jpg",
      "overview": "Two mob families clash in a war that threatens to topple empires and lives.",
      "genres": []
    },
    {
      "id": "1411",
      "title": "Person of Interest",
      "type": "tv",
      "rating": "8.1",
      "year": "2011",
      "poster": "https://image.tmdb.org/t/p/w500/f8aIvYk5h7Z8EP3dinCmVgQFYow.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/efeMgQn6iRALsOqDa2cqlf6Pw5O.jpg",
      "overview": "John Reese, former CIA paramilitary operative, is presumed dead and teams up with reclusive billionaire Finch to prevent violent crimes in New York City by initiating their own type of justice. With the special training that Reese has had in Covert Operations and Finch's genius software inventing mind, the two are a perfect match for the job that they have to complete. With the help of surveillance equipment, they work \"outside the law\" and get the right criminal behind bars. ",
      "genres": []
    },
    {
      "id": "37854",
      "title": "One Piece",
      "type": "tv",
      "rating": "8.8",
      "year": "1999",
      "poster": "https://image.tmdb.org/t/p/w500/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg",
      "overview": "Years ago, the fearsome Pirate King, Gol D. Roger was executed leaving a huge pile of treasure and the famous \"One Piece\" behind. Whoever claims the \"One Piece\" will be named the new King of the Pirates.\n\nMonkey D. Luffy, a boy who consumed a \"Devil Fruit,\" decides to follow in the footsteps of his idol, the pirate Shanks, and find the One Piece. It helps, of course, that his body has the properties of rubber and that he's surrounded by a bevy of skilled fighters and thieves to help him along the way.\n\nLuffy will do anything to get the One Piece and become King of the Pirates!",
      "genres": []
    }
  ],
  "action": [
    {
      "id": "1368337",
      "title": "The Odyssey",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mIi99BK2mDpLp2lGsa8jCBDFit4.jpg",
      "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
      "genres": []
    },
    {
      "id": "969681",
      "title": "Spider-Man: Brand New Day",
      "type": "movie",
      "rating": "8.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
      "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
      "genres": []
    },
    {
      "id": "1058424",
      "title": "Hope",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/j96rurZqmBjyY37Fncl3IB0qJNe.jpg",
      "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
      "genres": []
    },
    {
      "id": "1507696",
      "title": "Apocalypse Z: New World",
      "type": "movie",
      "rating": "6.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
      "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
      "genres": []
    },
    {
      "id": "1616687",
      "title": "Never Surrender",
      "type": "movie",
      "rating": "7.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
      "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
      "genres": []
    },
    {
      "id": "1244523",
      "title": "Beware Boiúna",
      "type": "movie",
      "rating": "6.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
      "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
      "genres": []
    },
    {
      "id": "1381071",
      "title": "Godzilla Minus Zero",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
      "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
      "genres": []
    },
    {
      "id": "1294189",
      "title": "The Mongoose",
      "type": "movie",
      "rating": "6.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
      "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
      "genres": []
    },
    {
      "id": "1562642",
      "title": "Ghost Soldier",
      "type": "movie",
      "rating": "9.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
      "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
      "genres": []
    },
    {
      "id": "656908",
      "title": "Ramayana: Rise of a Legend",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
      "overview": "An ancient epic follows a young prince and princess whose marriage and subsequent exile mark the beginning of a legendary journey. Their story of love, duty and destiny sets the stage for greater challenges ahead.",
      "genres": []
    },
    {
      "id": "1228834",
      "title": "The Fix",
      "type": "movie",
      "rating": "5.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
      "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
      "genres": []
    },
    {
      "id": "1595325",
      "title": "The Anacondas",
      "type": "movie",
      "rating": "3.6",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yphysF14qWFvrIbFVg3vEnbudwT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ryA5uYC7mVZv9dEnAGvL9Iv8kVZ.jpg",
      "overview": "Explorers in Mexico uncover the ruins of an ancient snake-worshiping civilization. Celebration turns to horror when they awaken an ever-growing anaconda, starved of human sacrifices for centuries. Now, the team must band together to survive.",
      "genres": []
    },
    {
      "id": "940721",
      "title": "Godzilla Minus One",
      "type": "movie",
      "rating": "7.6",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
      "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
      "genres": []
    },
    {
      "id": "1657630",
      "title": "The Awakening",
      "type": "movie",
      "rating": "6.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
      "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
      "genres": []
    },
    {
      "id": "299534",
      "title": "Avengers: Endgame",
      "type": "movie",
      "rating": "8.2",
      "year": "2019",
      "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
      "genres": []
    },
    {
      "id": "1185344",
      "title": "The Beast",
      "type": "movie",
      "rating": "5.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
      "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
      "genres": []
    },
    {
      "id": "1153576",
      "title": "Street Fighter",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
      "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
      "genres": []
    },
    {
      "id": "1288445",
      "title": "Mutiny",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
      "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
      "genres": []
    },
    {
      "id": "155",
      "title": "The Dark Knight",
      "type": "movie",
      "rating": "8.5",
      "year": "2008",
      "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
      "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
      "genres": []
    }
  ],
  "scifi": [
    {
      "id": "1423191",
      "title": "Resident Evil",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
      "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
      "genres": []
    },
    {
      "id": "687163",
      "title": "Project Hail Mary",
      "type": "movie",
      "rating": "8.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8Tfys3mDZVp4tNoH2ktm06a0Tau.jpg",
      "overview": "Science teacher Ryland Grace wakes up on a spaceship light years from home with no recollection of who he is or how he got there. As his memory returns, he begins to uncover his mission: solve the riddle of the mysterious substance causing the sun to die out. He must call on his scientific knowledge and unorthodox ideas to save everything on Earth from extinction.",
      "genres": []
    },
    {
      "id": "969681",
      "title": "Spider-Man: Brand New Day",
      "type": "movie",
      "rating": "8.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
      "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
      "genres": []
    },
    {
      "id": "1058424",
      "title": "Hope",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6VY1ZKgpsc8CfGsQcCGiYEgHdH0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/j96rurZqmBjyY37Fncl3IB0qJNe.jpg",
      "overview": "In the remote South Korean village of Hope Harbor, police chief Bum-seok and officer Sung-ae are called to investigate a mysterious creature wreaking havoc on the community. But all is not as it seems, and perceptions can be misleading. What begins as ignorance plants the seed of disaster, escalating through human conflict into a tragedy of cosmic proportions.",
      "genres": []
    },
    {
      "id": "1381071",
      "title": "Godzilla Minus Zero",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
      "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
      "genres": []
    },
    {
      "id": "755898",
      "title": "War of the Worlds",
      "type": "movie",
      "rating": "4.0",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
      "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
      "genres": []
    },
    {
      "id": "940721",
      "title": "Godzilla Minus One",
      "type": "movie",
      "rating": "7.6",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
      "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
      "genres": []
    },
    {
      "id": "299534",
      "title": "Avengers: Endgame",
      "type": "movie",
      "rating": "8.2",
      "year": "2019",
      "poster": "https://image.tmdb.org/t/p/w500/jtDv3lCnST0fZRvdYFwR5CVwK2x.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
      "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
      "genres": []
    },
    {
      "id": "1518204",
      "title": "Allen",
      "type": "movie",
      "rating": "6.9",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
      "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
      "genres": []
    },
    {
      "id": "1400940",
      "title": "Clayface",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/9l1NuFjel2j89hiuiJbsxfblqjy.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xSDoxv4pHvs4xZjvTb0Iqg1A6ro.jpg",
      "overview": "Matt Hagen's meteoric rise from Gotham street kid to Hollywood leading man is tragically cut short when a local crime boss's actions leave him horribly disfigured. Abandoned by his team and with nothing left, Matt seeks out a cutting edge treatment that miraculously returns him to his former self… but also unexpectedly affects his grip on reality, spiraling him down a destructive path of all-consuming revenge.",
      "genres": []
    },
    {
      "id": "1644210",
      "title": "Robotica",
      "type": "movie",
      "rating": "3.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fZD9b4RRmFWwYVn6MCcrHebTDDc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g6yVfiCdVITgpMRY1R9VHRxR4uu.jpg",
      "overview": "Two security guards working the midnight shift in an adult toy company find themselves the target of a half-dismantled and severely malfunctioning female sex doll prototype named Robotica.",
      "genres": []
    },
    {
      "id": "1384216",
      "title": "The Dog Stars",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/5O616X9vmRzQdB68PHzBewPittd.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3k7GzxOdLZkN3eZsuhLi2eRzkXO.jpg",
      "overview": "After the world's population has been ravaged by a pandemic, a man lives a lonesome existence in a Colorado airplane hangar with his dog and a dour gunman he has befriended. When a mysterious transmission comes through on the radio while he’s flying his old Cessna, it sparks a hunt for the provenance of the sound.",
      "genres": []
    },
    {
      "id": "1101383",
      "title": "The End of Oak Street",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7DmtuAK5gYGlMFA45Oxkl1bEpIC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/wnR8pwWtoL3TFwP41mLCt91ReCt.jpg",
      "overview": "After a mysterious cosmic event rips Oak Street from suburbia and transports their neighborhood to someplace unknown, the Platt family soon discovers that their very survival depends on them sticking together as they navigate their now unrecognizable surroundings.",
      "genres": []
    },
    {
      "id": "157336",
      "title": "Interstellar",
      "type": "movie",
      "rating": "8.5",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
      "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
      "genres": []
    },
    {
      "id": "1275779",
      "title": "Disclosure Day",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AnJ8IQJI23hNpYXVNaythu061Ru.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1e0KDRYKRPHiVNj8yQKYuU2jVyQ.jpg",
      "overview": "A cybersecurity expert becomes a whistleblower after uncovering secrets about aliens, putting him on the run from a corporation. Meanwhile, a meteorologist experiencing strange phenomena joins forces with him to prove there's life beyond our understanding.",
      "genres": []
    },
    {
      "id": "299536",
      "title": "Avengers: Infinity War",
      "type": "movie",
      "rating": "8.2",
      "year": "2018",
      "poster": "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
      "overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
      "genres": []
    },
    {
      "id": "1375646",
      "title": "Colony",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/enz3WLx5QU1FUyhXZld04QWIc6N.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iGViga8sDCET1S6GfwOlAbuhSGQ.jpg",
      "overview": "Professor Se-jeong is thrust into a bloody nightmare when a rapidly mutating virus is released during a biotech conference causing authorities to seal the facility. Trapped inside with no escape, Se-jeong along with a small group of survivors must fight to stay alive while the infected undergo horrific transformations.",
      "genres": []
    },
    {
      "id": "27205",
      "title": "Inception",
      "type": "movie",
      "rating": "8.4",
      "year": "2010",
      "poster": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
      "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
      "genres": []
    }
  ],
  "animation": [
    {
      "id": "354912",
      "title": "Coco",
      "type": "movie",
      "rating": "8.2",
      "year": "2017",
      "poster": "https://image.tmdb.org/t/p/w500/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g7CHF8gTLGooTbP4GznIGwaqAGL.jpg",
      "overview": "Despite his family’s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel's family history.",
      "genres": []
    },
    {
      "id": "791523",
      "title": "Wildwood",
      "type": "movie",
      "rating": "8.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/snFM00mpNAfUzUtkdEW0uDEvXA0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
      "overview": "Prue and her classmate Curtis are drawn into a magical forest filled with enchanted creatures, loyal allies, and formidable adversaries as they embark on a desperate quest to rescue Prue's abducted baby brother from a murder of crows led by a mysterious woman named Alexandra.",
      "genres": []
    },
    {
      "id": "1465063",
      "title": "Forgotten Island",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/myd1K3gefdNAWFsGNRDdMeiK9Qg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2o9FzuBzCqrDTdlHRuEVnGD2d5h.jpg",
      "overview": "While celebrating their last night together, high school graduates and best friends Jo and Raissa stumble upon a mysterious portal that transports them to the fantastical island of Nakali. When they discover that the memories of their entire friendship are the price for returning home, Jo and Raissa must race to find a way to leave the island before they forget each other forever.",
      "genres": []
    },
    {
      "id": "1084244",
      "title": "Toy Story 5",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
      "overview": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
      "genres": []
    },
    {
      "id": "1204680",
      "title": "Coyote vs. Acme",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
      "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
      "genres": []
    },
    {
      "id": "1117898",
      "title": "The Cat in the Hat",
      "type": "movie",
      "rating": "6.9",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9y9o686DsQg0KzPtERzcW7Cf8IE.jpg",
      "overview": "Assigned his toughest mission yet, the Cat must cheer up siblings Gabby and Sebastian as they adjust to life in a new town. Known for pushing boundaries, this agent of chaos must prove himself or risk losing his magical hat forever.",
      "genres": []
    },
    {
      "id": "1187326",
      "title": "Tad and The Magic Lamp",
      "type": "movie",
      "rating": "8.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AdDxZgNmRYgDuweY8899buyVqlr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zbpimMxf6Ms96v3Zypuv8WltMSO.jpg",
      "overview": "Tadeo, his girlfriend Sara, and his friends Momia, Jeff, and Belzoni embark on an adventure after Tadeo accidentally unleashes an ancient spell.",
      "genres": []
    },
    {
      "id": "1315772",
      "title": "Minions & Monsters",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
      "overview": "This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created.",
      "genres": []
    },
    {
      "id": "822653",
      "title": "Puella Magi Madoka Magica the Movie -Walpurgisnacht: Rising-",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/g4kCd4rMuN7G3VQQDUT6mLbrBqQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xzm3RfWh932rS28WErNC3u8qzVm.jpg",
      "overview": "After the events of Rebellion, the world appears to be in balance—but that peace is fragile. As a new threat connected to Walpurgisnacht emerges, Homura Akemi is forced to face the consequences of her choices and question how far she is willing to go to protect Madoka.",
      "genres": []
    },
    {
      "id": "980431",
      "title": "Avatar Aang: The Last Airbender",
      "type": "movie",
      "rating": "9.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg",
      "overview": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
      "genres": []
    },
    {
      "id": "14836",
      "title": "Coraline",
      "type": "movie",
      "rating": "8.0",
      "year": "2009",
      "poster": "https://image.tmdb.org/t/p/w500/4jeFXQYytChdZYE9JYO7Un87IlW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hofnlIyF6bePkgQOpcuRWLvzf15.jpg",
      "overview": "Wandering her rambling old house in her boring new town, 11-year-old Coraline discovers a hidden door to a strangely idealized version of her life. In order to stay in the fantasy, she must make a frighteningly real sacrifice.",
      "genres": []
    },
    {
      "id": "494656",
      "title": "The Legend of the Black Charro",
      "type": "movie",
      "rating": "8.3",
      "year": "2018",
      "poster": "https://image.tmdb.org/t/p/w500/fDLJ5vIeRL68cIHlob11w2pBzH0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3AXR3AFTHdU38OR14jfcK8FjJ5H.jpg",
      "overview": "After releasing the Chupacabras, Leo San Juan decides that it is time to return together with his brother Nando to his grandmother's house. Halfway down the road, Charro Negro manages to confuse Leo and because of him, an innocent girl is dragged into the underworld. Leo is forced to repair the damage. His friends will come to try to help him and get out of there as soon as possible. But it is no coincidence that the Charro has chosen to involve Leo, his intentions go beyond getting a new soul.",
      "genres": []
    },
    {
      "id": "1084242",
      "title": "Zootopia 2",
      "type": "movie",
      "rating": "7.7",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/oJ7g2CifqpStmoYQyaLQgEU32qO.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lgotja3xMoJZbynwHfcQcJAEMWH.jpg",
      "overview": "After cracking the biggest case in Zootopia's history, rookie cops Judy Hopps and Nick Wilde find themselves on the twisting trail of a great mystery when Gary De'Snake arrives and turns the animal metropolis upside down. To crack the case, Judy and Nick must go undercover to unexpected new parts of town, where their growing partnership is tested like never before.",
      "genres": []
    },
    {
      "id": "1226863",
      "title": "The Super Mario Galaxy Movie",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kxQiIJ4gVcD3K6o14MJ72p5yRcE.jpg",
      "overview": "Having thwarted Bowser's previous plot to marry Princess Peach, Mario and Luigi now face a fresh threat in Bowser Jr., who is determined to liberate his father from captivity and restore the family legacy. Alongside companions new and old, the brothers travel across the stars to stop the young heir's crusade.",
      "genres": []
    },
    {
      "id": "129",
      "title": "Spirited Away",
      "type": "movie",
      "rating": "8.5",
      "year": "2001",
      "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
      "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
      "genres": []
    },
    {
      "id": "1311031",
      "title": "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
      "type": "movie",
      "rating": "8.8",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/fWVSwgjpT2D78VUh6X8UBd2rorW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1RgPyOhN4DRs225BGTlHJqCudII.jpg",
      "overview": "The Demon Slayer Corps are drawn into the Infinity Castle, where Tanjiro, Nezuko, and the Hashira face terrifying Upper Rank demons in a desperate fight as the final battle against Muzan Kibutsuji begins.",
      "genres": []
    },
    {
      "id": "9479",
      "title": "The Nightmare Before Christmas",
      "type": "movie",
      "rating": "7.9",
      "year": "1993",
      "poster": "https://image.tmdb.org/t/p/w500/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dSfrsjhqC6lYe7LYDYnzWeXZmEl.jpg",
      "overview": "Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly Pumpkin King of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning in his place. But, as the holiday approaches, Jack's rag-doll girlfriend Sally tries to foil his well-meaning yet misguided plans.",
      "genres": []
    },
    {
      "id": "1780407",
      "title": "Snoopy Presents: 12 Days of Snoopy",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/9wZAvvAZgwp2Lxbhjkp9N6HHJBm.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3gIGgmK27lt3YK9EUnZ6iXMHg7Q.jpg",
      "overview": "Eager to get off Santa's naughty list, Snoopy goes all out to be the nicest beagle in town.",
      "genres": []
    },
    {
      "id": "1185806",
      "title": "PAW Patrol: The Dino Movie",
      "type": "movie",
      "rating": "8.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/cxXSF4aY5N2cOGwaga5OnpPFHzk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dY4LyVSvjk9dN20YsxuouaMIMox.jpg",
      "overview": "The Paw Patrol lands on a mysterious dinosaur island after a storm, where they meet Rex, a stranded pup. When Humdinger's reckless mining triggers a volcano, the team faces their biggest rescue mission yet to save the island.",
      "genres": []
    },
    {
      "id": "1327819",
      "title": "Hoppers",
      "type": "movie",
      "rating": "8.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/xjtWQ2CL1mpmMNwuU5HeS4Iuwuu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/u53UYu5XG2hNgWGvs3xGhAVzypl.jpg",
      "overview": "Scientists have discovered how to 'hop' human consciousness into lifelike robotic animals, allowing people to communicate with animals as animals. Animal lover Mabel seizes an opportunity to use the technology, uncovering mysteries within the animal world beyond anything she could have imagined.",
      "genres": []
    }
  ],
  "comedy": [
    {
      "id": "1567605",
      "title": "Ebenezer",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
      "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
      "genres": []
    },
    {
      "id": "1514026",
      "title": "Buddy",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
      "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
      "genres": []
    },
    {
      "id": "1570488",
      "title": "A Dog's Perfect Christmas",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/zvsNAohDHRWcGvbPSD7r3WojpKb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hhQT0TySg3LXCE8BEPpfPJ5zJA2.jpg",
      "overview": "When a medical emergency pulls the Goss family apart, determined dog Winstead will do all he can to bring his humans back together before Christmas Eve.",
      "genres": []
    },
    {
      "id": "1153576",
      "title": "Street Fighter",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8nP4lF51Ea861YfHEEqhZBLYv3e.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3BBjkQmdGacKYZtpmK2vIfuDmON.jpg",
      "overview": "In 1993, estranged Street Fighters Ryu and Ken Masters are thrown back into combat when the mysterious Chun-Li recruits them for the next World Warrior Tournament: a brutal clash of fists, fate, and fury. But behind this battle royale lies a deadly conspiracy that forces them to face off against each other and the demons of their past. And if they don't, it's GAME OVER!",
      "genres": []
    },
    {
      "id": "1518204",
      "title": "Allen",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/alhhrpj1PSAn5bfz4Os1k7Bweoj.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/51fGmBW7WjyJouP9TjIcxRpCUNk.jpg",
      "overview": "20 years after his encounter with an alien, Petey never moved on. Now his old friend has returned, and the reason why is complicated — and unexpected.",
      "genres": []
    },
    {
      "id": "1465063",
      "title": "Forgotten Island",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/myd1K3gefdNAWFsGNRDdMeiK9Qg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2o9FzuBzCqrDTdlHRuEVnGD2d5h.jpg",
      "overview": "While celebrating their last night together, high school graduates and best friends Jo and Raissa stumble upon a mysterious portal that transports them to the fantastical island of Nakali. When they discover that the memories of their entire friendship are the price for returning home, Jo and Raissa must race to find a way to leave the island before they forget each other forever.",
      "genres": []
    },
    {
      "id": "1084244",
      "title": "Toy Story 5",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
      "overview": "When Bonnie receives a Lilypad tablet as a gift and becomes obsessed, Buzz, Woody, Jessie and the rest of the gang's jobs become exponentially harder when they have to go head to head with the all-new threat to playtime.",
      "genres": []
    },
    {
      "id": "1234139",
      "title": "Jailer 2",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/upwdEyhhYZ7pT2hD535fr2MGfpx.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/m0ks2o59mOAz6WdCybJ5FAUNTOU.jpg",
      "overview": "When a dangerous syndicate threatens his family, retired jailer Tiger Muthuvel Pandian goes undercover as a driver to battle enemies from the shadows.",
      "genres": []
    },
    {
      "id": "891621",
      "title": "Wild Horse Nine",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/dNJFRtVg3xLQ7dbNIQ55cmmIniD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3uLA0ujne91bkzFStZICCYeqhnt.jpg",
      "overview": "Shortly before the 1973 Chilean coup, CIA agents Chris and Lee are dispatched from Santiago to Easter Island by their bureau chief, MJ. Amongst the Island's iconic statues, and as the longtime partners wrestle with their dark pasts and present conspiracies, Chris's newfound bond with a pair of rebellious students threatens to send everyone’s trip to this remote paradise sideways.",
      "genres": []
    },
    {
      "id": "1148365",
      "title": "Matchbox the Movie",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/aHhHRz6nOpwkqJs5ASeRGAdK2dt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/jdJsnhHfkIi3J7jwfiCFT4gXNx5.jpg",
      "overview": "When a group of former childhood friends reconnect, their reunion takes a wild turn as they stumble upon a dangerous international plot—and must save the world.",
      "genres": []
    },
    {
      "id": "1108427",
      "title": "Moana",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
      "overview": "Teenage Moana answers the Ocean's call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people.",
      "genres": []
    },
    {
      "id": "1204680",
      "title": "Coyote vs. Acme",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/rueyXwlewVPAP5NkqCUJx4RjhqB.jpg",
      "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
      "genres": []
    },
    {
      "id": "1377237",
      "title": "Runner",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/vJk2TW1QZAmBiD7oj9ZF9EPTYY1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/npXZNWjOEYrqdMDPQ11SGBrXqAG.jpg",
      "overview": "A former soldier is thrown into a brutal race against time when a critical medical delivery makes him and his unlikely partner the targets of a ruthless cartel. As the mission spirals into a deadly manhunt, every detour, delay, and bullet pushes them closer to failure. With betrayal closing in from every side, they must survive the chase and deliver their cargo to save the life of a little girl.",
      "genres": []
    },
    {
      "id": "1117898",
      "title": "The Cat in the Hat",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/mWN6knIVJ2o7eGwSm7mOgSCwNUc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9y9o686DsQg0KzPtERzcW7Cf8IE.jpg",
      "overview": "Assigned his toughest mission yet, the Cat must cheer up siblings Gabby and Sebastian as they adjust to life in a new town. Known for pushing boundaries, this agent of chaos must prove himself or risk losing his magical hat forever.",
      "genres": []
    },
    {
      "id": "1187326",
      "title": "Tad and The Magic Lamp",
      "type": "movie",
      "rating": "8.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AdDxZgNmRYgDuweY8899buyVqlr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zbpimMxf6Ms96v3Zypuv8WltMSO.jpg",
      "overview": "Tadeo, his girlfriend Sara, and his friends Momia, Jeff, and Belzoni embark on an adventure after Tadeo accidentally unleashes an ancient spell.",
      "genres": []
    },
    {
      "id": "1315772",
      "title": "Minions & Monsters",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
      "overview": "This is the rambunctious, ridiculous and totally true story of how the Minions conquered Hollywood, became movie stars, lost everything, unleashed monsters onto the world and then banded together to try and save the planet from the mayhem they had just created.",
      "genres": []
    },
    {
      "id": "1302904",
      "title": "Practical Magic 2",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
      "overview": "The Owens sisters must confront the dark curse that threatens to unravel their family once and for all.",
      "genres": []
    },
    {
      "id": "1195803",
      "title": "Wicker",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6FcBZOKvyrLCKGCyBG0ySCR4okt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xVh1ypMoVkMf5IB7y3hnRplJ14c.jpg",
      "overview": "On the outskirts of a village by the sea, lives a Fisherwoman; smelly, single and perpetually ridiculed. One day, fed up with her stuffy, small-minded neighbours, she commissions herself a husband to be made from wicker. In an otherwise conservative town, this unconventional romance sparks outrage, jealousy and chaos.",
      "genres": []
    },
    {
      "id": "533535",
      "title": "Deadpool & Wolverine",
      "type": "movie",
      "rating": "7.6",
      "year": "2024",
      "poster": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
      "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
      "genres": []
    }
  ],
  "thriller": [
    {
      "id": "1263337",
      "title": "Heart of the Beast",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
      "overview": "After a harrowing plane crash, Special Forces officer James Belmont and his combat dog, Odin, find themselves stranded deep in the Alaskan wilderness. Together, they are forced into a brutal fight for survival against the elements.",
      "genres": []
    },
    {
      "id": "1507696",
      "title": "Apocalypse Z: New World",
      "type": "movie",
      "rating": "6.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
      "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
      "genres": []
    },
    {
      "id": "1616687",
      "title": "Never Surrender",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hKROmLddpzpjkxKKVFYFRAOXX1b.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/umxN2kMcUm6VoxSOdcEcQoXuC4q.jpg",
      "overview": "When a deadly gang descends on his remote home, a guilt-ridden veteran and the estranged grandchildren he barely knows must unite to survive.",
      "genres": []
    },
    {
      "id": "1244523",
      "title": "Beware Boiúna",
      "type": "movie",
      "rating": "6.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
      "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
      "genres": []
    },
    {
      "id": "1294189",
      "title": "The Mongoose",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bySCyjQXNPgsnLTlgJpSMnRazPD.jpg",
      "overview": "A falsely accused war hero with nothing to lose leads police on an epic televised cross-country car chase, helped by members of his former Special Forces Army battalion and closely monitored by a fascinated public rooting for his safe getaway.",
      "genres": []
    },
    {
      "id": "1562642",
      "title": "Ghost Soldier",
      "type": "movie",
      "rating": "9.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/8Y4oJ5iUs3hgPcDB3SIEmsNYjZk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ggqvhSdAASrseKuMlzk51sbvbE8.jpg",
      "overview": "Henry “Fitz” Fitzgerald has spent years living quietly off the grid, hiding from a past few people know anything about. But when a powerful foreign corporation moves into his hometown to seize his neighbors’ land for a massive payday, Fitz is forced to reveal who he really is: a former Special Forces soldier and advanced weapons developer. Armed with experimental technology, lethal combat skills, and an unwavering code of justice, Fitz wages a one-man war against an enemy that never saw him coming.",
      "genres": []
    },
    {
      "id": "1101412",
      "title": "Fall 2: Deadpoint",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
      "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
      "genres": []
    },
    {
      "id": "1283515",
      "title": "Verity",
      "type": "movie",
      "rating": "7.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/rmaNMA1seHqpjtnYKzyynFAr1g8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cKetrF2dAnQ0AMV5i4BMOs41I5P.jpg",
      "overview": "Lowen Ashleigh, hired to ghostwrite for best-selling author Verity Crawford, uncovers Verity's autobiographical notes, and becomes involved in what may prove to be a lethal conspiracy.",
      "genres": []
    },
    {
      "id": "1228834",
      "title": "The Fix",
      "type": "movie",
      "rating": "5.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/jlP8XDjZN89GrpM3je5Uf8Grqx8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dJTWIecL2vxsCRl5G0lRhPsfrhc.jpg",
      "overview": "Disillusioned by the end of the war in Afghanistan, a group of disgraced, war-torn ex-CIA operatives set out to Tehran to take down a life-changing score.",
      "genres": []
    },
    {
      "id": "1543469",
      "title": "Heartland",
      "type": "movie",
      "rating": "6.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/zhxlzxBlO1sWB1rPn7RmAoeQ2na.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/psTMZj8gvsfYVfvd7FZCHH4xL6P.jpg",
      "overview": "Former country music legend Misty Jones returns to Nashville to unravel the truth behind her rising-star niece's disappearance.",
      "genres": []
    },
    {
      "id": "1596275",
      "title": "Drive - The Pretenders",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
      "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
      "genres": []
    },
    {
      "id": "1432306",
      "title": "Sleepwalker",
      "type": "movie",
      "rating": "4.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/760SP4VsZagpyB9WLfeZykE3DFg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2dYKSPT1SJZVlKwXHic4Ma53f0X.jpg",
      "overview": "A grieving mother is haunted by the tragic loss of her daughter in a car accident that left her abusive husband in a coma. As she battles a surreal descent into darkness, her sleepwalking episodes intensify. Plagued by haunting visions of her husband inside their home, she grapples with the blurred lines between reality and nightmare.",
      "genres": []
    },
    {
      "id": "1185344",
      "title": "The Beast",
      "type": "movie",
      "rating": "5.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v5Wb9NoE0s1mGmC5wVeQR1OK22V.jpg",
      "overview": "When a militia of unidentified hostiles coordinates a coup against the United States, the president must fight back by utilizing the highly classified offensive capabilities of his armored limousine, nicknamed The Beast.",
      "genres": []
    },
    {
      "id": "755898",
      "title": "War of the Worlds",
      "type": "movie",
      "rating": "4.0",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yvirUYrva23IudARHn3mMGVxWqM.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iZLqwEwUViJdSkGVjePGhxYzbDb.jpg",
      "overview": "Will Radford is a top analyst for Homeland Security who tracks potential threats through a mass surveillance program, until one day an attack by an unknown entity leads him to question whether the government is hiding something from him... and from the rest of the world.",
      "genres": []
    },
    {
      "id": "1657630",
      "title": "The Awakening",
      "type": "movie",
      "rating": "6.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
      "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
      "genres": []
    },
    {
      "id": "1291595",
      "title": "Insidious: Out of the Further",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
      "overview": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
      "genres": []
    },
    {
      "id": "1288445",
      "title": "Mutiny",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qDa0fqDqIBCovRp975RvtGPcuN3.jpg",
      "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
      "genres": []
    },
    {
      "id": "1339713",
      "title": "Obsession",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5lTZyuBTNOfawsfPT8Q0cIg6qAF.jpg",
      "overview": "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
      "genres": []
    },
    {
      "id": "155",
      "title": "The Dark Knight",
      "type": "movie",
      "rating": "8.5",
      "year": "2008",
      "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
      "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
      "genres": []
    },
    {
      "id": "1659441",
      "title": "Savage Prey",
      "type": "movie",
      "rating": "7.9",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/sw51DrxbE1PuJxiqfl3dsZHA3tX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aLKeC5KEC4YQEwyZcXOivHJHlq4.jpg",
      "overview": "In the remote Scottish Highlands, a desperate mother searches for her missing son, finding herself trapped in a twisted struggle for survival.",
      "genres": []
    }
  ],
  "horror": [
    {
      "id": "1423191",
      "title": "Resident Evil",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8R79AZjX1Bt4219Ub3CrRMsPQsW.jpg",
      "overview": "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful, horrifying night collapses around him in chaos.",
      "genres": []
    },
    {
      "id": "1400837",
      "title": "Other Mommy",
      "type": "movie",
      "rating": "6.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
      "overview": "Young Bela forms a relationship with a sinister entity in her home that looks uncannily like her own mother, drawing her into a terrifying and increasingly dark world.",
      "genres": []
    },
    {
      "id": "1813355",
      "title": "A Story of Derry",
      "type": "movie",
      "rating": "6.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
      "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
      "genres": []
    },
    {
      "id": "1507696",
      "title": "Apocalypse Z: New World",
      "type": "movie",
      "rating": "6.1",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/wXln4DUrwcyjcFPwgQxFPYTlG1Z.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/o3XwuDUj0n8qnK91p6q8LKfr6rj.jpg",
      "overview": "The Canary Islands have become Europe’s last refuge following the outbreak of the TSJ virus. When a special mission sets out for the mainland in search of vital supplies, Roberto joins the team with questionable intentions. The dangerous operation turns into a desperate race for survival, and Roberto and his companions find themselves caught between hordes of infected and divided loyalties.",
      "genres": []
    },
    {
      "id": "1244523",
      "title": "Beware Boiúna",
      "type": "movie",
      "rating": "6.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7mI13sTZcuwWEIUK9fckAb8Zmba.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9nU0FKNefmhbgi2xXlvZchZsqwm.jpg",
      "overview": "A medical mission deep in the Amazon becomes a desperate fight for survival when a colossal ancient predator awakens, turning the jungle into a deadly battleground where nature decides who lives and dies.",
      "genres": []
    },
    {
      "id": "1381071",
      "title": "Godzilla Minus Zero",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hSmIJluOJmTWvJs4d7kHRxjc8s8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oqrYIDH4tvfEzPe1yqT4jzmAWHQ.jpg",
      "overview": "War reduced Japan to zero, and Godzilla plunged it into minus. Two years have passed since then, and the country has faced agonizing struggles to achieve recovery and finally reclaim its daily life. Just as humanity managed to cling to a hard-won peace, a new threat strikes, crushing hope in an instant. There is no third time. Everything ends here.",
      "genres": []
    },
    {
      "id": "1567605",
      "title": "Ebenezer",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6H2N59jJW1hZEzn2ZdrMvJw5vNI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fdOVxyNNL95SuI8BGaN6vudEuYX.jpg",
      "overview": "An elderly miser embarks on a supernatural journey after visits from the ghost of his former business partner and the Spirits of Christmas Past, Present, and Yet to Come force him to confront his past and fight for a second chance at happiness.",
      "genres": []
    },
    {
      "id": "1514026",
      "title": "Buddy",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/1BdZbNvl1SfrrX8J9X5tQzN6Ivu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sMmG82PtjK8A9rVc34gwKQtCm3A.jpg",
      "overview": "Inside the colorful world of \"It's Buddy!\", a group of children spend their days singing, dancing, and helping Buddy - bright orange unicorn - spread happiness. But when one child refuses to play along, Buddy is not pleased and cracks begin to appear in this seemingly perfect world.",
      "genres": []
    },
    {
      "id": "1432306",
      "title": "Sleepwalker",
      "type": "movie",
      "rating": "4.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/760SP4VsZagpyB9WLfeZykE3DFg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2dYKSPT1SJZVlKwXHic4Ma53f0X.jpg",
      "overview": "A grieving mother is haunted by the tragic loss of her daughter in a car accident that left her abusive husband in a coma. As she battles a surreal descent into darkness, her sleepwalking episodes intensify. Plagued by haunting visions of her husband inside their home, she grapples with the blurred lines between reality and nightmare.",
      "genres": []
    },
    {
      "id": "1595325",
      "title": "The Anacondas",
      "type": "movie",
      "rating": "3.6",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/yphysF14qWFvrIbFVg3vEnbudwT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ryA5uYC7mVZv9dEnAGvL9Iv8kVZ.jpg",
      "overview": "Explorers in Mexico uncover the ruins of an ancient snake-worshiping civilization. Celebration turns to horror when they awaken an ever-growing anaconda, starved of human sacrifices for centuries. Now, the team must band together to survive.",
      "genres": []
    },
    {
      "id": "940721",
      "title": "Godzilla Minus One",
      "type": "movie",
      "rating": "7.6",
      "year": "2023",
      "poster": "https://image.tmdb.org/t/p/w500/2E2WTX0TJEflAged6kzErwqX1kt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oHBhHoNe59VH6bUMazDtJmWOFSS.jpg",
      "overview": "In postwar Japan, Godzilla brings new devastation to an already scorched landscape. With no military intervention or government help in sight, the survivors must join together in the face of despair and fight back against an unrelenting horror.",
      "genres": []
    },
    {
      "id": "1657630",
      "title": "The Awakening",
      "type": "movie",
      "rating": "6.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/AhP971WogMHbF5iKJPKi6e6oaya.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4pYKqctQvvdyhuGjiK4szH9jEv9.jpg",
      "overview": "An elite military unit on a mission in the South American jungle encounters a deadly supernatural force revealing an ancient presence that continues to claim anyone who dares enter its domain.",
      "genres": []
    },
    {
      "id": "1291595",
      "title": "Insidious: Out of the Further",
      "type": "movie",
      "rating": "7.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4tTrW9dXCByS5wt2pXVWb58zNjz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
      "overview": "Gemma, a young mother raising her daughter in the house she grew up in, discovers she can travel into The Further, where she possesses an ability to bring what lives there back to the real world.",
      "genres": []
    },
    {
      "id": "1474226",
      "title": "Evil Dress",
      "type": "movie",
      "rating": "6.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4346oRUfjNtBezOQoKiu31J34L9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ftfnS4ABocBNkwrvkIjkkxaBjgH.jpg",
      "overview": "After a difficult divorce, Alicia moves into an old house with her daughter Carla, unaware that it hides a past of recurrent tragedy. As Carla senses perturbing presences, Alicia begins to doubt her own sanity. A blue dress connects Carla to the ghost of a girl from the past, triggering terrifying events. Mother and daughter will try to escape the house, but the house won’t let them get away so easily.",
      "genres": []
    },
    {
      "id": "1339713",
      "title": "Obsession",
      "type": "movie",
      "rating": "8.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5lTZyuBTNOfawsfPT8Q0cIg6qAF.jpg",
      "overview": "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for but soon discovers that some desires come at a dark, sinister price.",
      "genres": []
    },
    {
      "id": "1644210",
      "title": "Robotica",
      "type": "movie",
      "rating": "3.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fZD9b4RRmFWwYVn6MCcrHebTDDc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g6yVfiCdVITgpMRY1R9VHRxR4uu.jpg",
      "overview": "Two security guards working the midnight shift in an adult toy company find themselves the target of a half-dismantled and severely malfunctioning female sex doll prototype named Robotica.",
      "genres": []
    },
    {
      "id": "1232569",
      "title": "Pinocchio: Unstrung",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/hJNdizFlxOW89edX3Rzr6OliSFI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7RsPdXLDNugDIlwXPVeeprNfMx.jpg",
      "overview": "Influenced by a sinister Cricket and created by Geppetto, Pinocchio launches a violent crusade to carve himself into a real boy like his brother James, one piece at a time.",
      "genres": []
    },
    {
      "id": "1400940",
      "title": "Clayface",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/9l1NuFjel2j89hiuiJbsxfblqjy.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xSDoxv4pHvs4xZjvTb0Iqg1A6ro.jpg",
      "overview": "Matt Hagen's meteoric rise from Gotham street kid to Hollywood leading man is tragically cut short when a local crime boss's actions leave him horribly disfigured. Abandoned by his team and with nothing left, Matt seeks out a cutting edge treatment that miraculously returns him to his former self… but also unexpectedly affects his grip on reality, spiraling him down a destructive path of all-consuming revenge.",
      "genres": []
    },
    {
      "id": "1128204",
      "title": "Feed",
      "type": "movie",
      "rating": "6.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/nICoMIb6FcHqnrKeO43zKY3w8vT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4ZeaWA6DzFVOjWTi70b9ZAaQktf.jpg",
      "overview": "Five social media influencers spend a weekend at a forest retreat but inadvertently awaken and confront the world's first vampire.",
      "genres": []
    },
    {
      "id": "9674",
      "title": "Ring 0",
      "type": "movie",
      "rating": "6.1",
      "year": "2000",
      "poster": "https://image.tmdb.org/t/p/w500/nuhEWlaoMD00rTDCiYxdEc7d1tD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/noRX8VyyAFK1tt0DQSq5qy1tE10.jpg",
      "overview": "Taking place thirty years before the events of Ringu, Ringu 0 provides the shocking background story of how the girl on the video became a deadly, vengeful spirit.",
      "genres": []
    }
  ],
  "drama": [
    {
      "id": "1813355",
      "title": "A Story of Derry",
      "type": "movie",
      "rating": "6.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
      "overview": "Hundreds of years before Pennywise, three youngsters venture into the Western Wood...where they encounter a terrifying ancient spirit.",
      "genres": []
    },
    {
      "id": "1422041",
      "title": "La Bola Negra",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7HwFQTMghL6HOvzEnXYUvyuZXeh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bDsmYvrzto7xrEwqDpLC3SPhn9A.jpg",
      "overview": "The intertwined lives of three men in three different eras, three lives intimately linked by sexuality and desire, pain, and legacy.",
      "genres": []
    },
    {
      "id": "1570488",
      "title": "A Dog's Perfect Christmas",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/zvsNAohDHRWcGvbPSD7r3WojpKb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hhQT0TySg3LXCE8BEPpfPJ5zJA2.jpg",
      "overview": "When a medical emergency pulls the Goss family apart, determined dog Winstead will do all he can to bring his humans back together before Christmas Eve.",
      "genres": []
    },
    {
      "id": "1234139",
      "title": "Jailer 2",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/upwdEyhhYZ7pT2hD535fr2MGfpx.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/m0ks2o59mOAz6WdCybJ5FAUNTOU.jpg",
      "overview": "When a dangerous syndicate threatens his family, retired jailer Tiger Muthuvel Pandian goes undercover as a driver to battle enemies from the shadows.",
      "genres": []
    },
    {
      "id": "1571955",
      "title": "Collision Course",
      "type": "movie",
      "rating": "6.3",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/s2eAK0uiODjlNUSIiOBwdp3at2u.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uI3kWI7kGW5E0F8WduewgQYPt34.jpg",
      "overview": "Spain, 2013. After robbing a bank, a getaway crash reveals the hidden side of each thief, exposing betrayals and lies that began long before the heist.",
      "genres": []
    },
    {
      "id": "157336",
      "title": "Interstellar",
      "type": "movie",
      "rating": "8.5",
      "year": "2014",
      "poster": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
      "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
      "genres": []
    },
    {
      "id": "9963",
      "title": "Premonition",
      "type": "movie",
      "rating": "6.3",
      "year": "2007",
      "poster": "https://image.tmdb.org/t/p/w500/vKW1XIYrIqVrbCaYj9FQDHKXR8R.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/esXYvlivZ8j0HGqob949CIjqnGi.jpg",
      "overview": "A depressed housewife who learns her husband was killed in a car accident the day previously awakens the next morning to find him alive and well at home, and then awakens the day after to a world in which he is still dead.",
      "genres": []
    },
    {
      "id": "1780005",
      "title": "Surviving Hurricane Otis",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/chZa8Jd9kSDj11bekGjwwotFPEw.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cpNMIRCrDl0sxDL1tHBzfWi0UZC.jpg",
      "overview": "Two estranged brothers struggle to survive Hurricane Otis in Acapulco, where their bond and courage turn adversity into hope.",
      "genres": []
    },
    {
      "id": "27",
      "title": "9 Songs",
      "type": "movie",
      "rating": "5.5",
      "year": "2004",
      "poster": "https://image.tmdb.org/t/p/w500/91O7z0vo7MiNWd5xD2BoivwbQsb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bybAHw5fenKXRFI4phanPhpljlT.jpg",
      "overview": "Matt, a young glaciologist, soars across the vast, silent, icebound immensities of the South Pole as he recalls his love affair with Lisa. They meet at a mobbed rock concert in a vast music hall - London's Brixton Academy. They are in bed at night's end. Together, over a period of several months, they pursue a mutual sexual passion whose inevitable stages unfold in counterpoint to nine live-concert songs.",
      "genres": []
    },
    {
      "id": "1375441",
      "title": "Primetime",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/lmrulvLbmaejTix1YaMxo1oGhH1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sEsMwSDUWGIx9EfNxzM6KzVSsSQ.jpg",
      "overview": "In 2006, To Catch a Predator host Chris Hansen sets out to make television history. When a high stakes operation goes fatally wrong, his veneered dream of fame curdles into a nightmare of performative justice.",
      "genres": []
    },
    {
      "id": "9674",
      "title": "Ring 0",
      "type": "movie",
      "rating": "6.1",
      "year": "2000",
      "poster": "https://image.tmdb.org/t/p/w500/nuhEWlaoMD00rTDCiYxdEc7d1tD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/noRX8VyyAFK1tt0DQSq5qy1tE10.jpg",
      "overview": "Taking place thirty years before the events of Ringu, Ringu 0 provides the shocking background story of how the girl on the video became a deadly, vengeful spirit.",
      "genres": []
    },
    {
      "id": "1503762",
      "title": "Sense and Sensibility",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/czsyPHosFNbh4PPqXfqWu1aBXnA.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tIcONOFK9D3F89ETK8DBS1hIwVF.jpg",
      "overview": "A charming, witty, and deeply relatable story of love and sisterhood.",
      "genres": []
    },
    {
      "id": "822653",
      "title": "Puella Magi Madoka Magica the Movie -Walpurgisnacht: Rising-",
      "type": "movie",
      "rating": "8.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/g4kCd4rMuN7G3VQQDUT6mLbrBqQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xzm3RfWh932rS28WErNC3u8qzVm.jpg",
      "overview": "After the events of Rebellion, the world appears to be in balance—but that peace is fragile. As a new threat connected to Walpurgisnacht emerges, Homura Akemi is forced to face the consequences of her choices and question how far she is willing to go to protect Madoka.",
      "genres": []
    },
    {
      "id": "278",
      "title": "The Shawshank Redemption",
      "type": "movie",
      "rating": "8.7",
      "year": "1994",
      "poster": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/pNjh59JSxChQktamG3LMp9ZoQzp.jpg",
      "overview": "Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
      "genres": []
    },
    {
      "id": "1310458",
      "title": "Saayavanam",
      "type": "movie",
      "rating": "N/A",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/tSuqCq3YYLS8VOdiU9ikKOBs5Tz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/anz69m07H9b2zG5Hw5OSQ71dwxJ.jpg",
      "overview": "Sita tries to live an honest and truthful life following all religious and social norms of her upbringing while unraveling the true agenda of men around her. In this process, she emerges victorious as a strong and brave woman.",
      "genres": []
    },
    {
      "id": "1389379",
      "title": "Ranabaali",
      "type": "movie",
      "rating": "5.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/cXaCyYYbafVyMrs8rwKmxezBYPJ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xpImgnsxuqb3VOp0QRtXTS5uBRi.jpg",
      "overview": "Set in 19th-century British India, a fierce leader rises from a drought-stricken land to fight colonial oppression and atrocities.",
      "genres": []
    },
    {
      "id": "1437396",
      "title": "Your Mother Your Mother Your Mother",
      "type": "movie",
      "rating": "6.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/4KaPZSKnInnArErTTgy9Oy14leR.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/45Mbs6dmn2W0hvuyxXPDkKREHpP.jpg",
      "overview": "Latif, a devoutly religious hitman, struggles to balance work, faith and fatherhood. When his wife dies, he embarks on a desperate journey across Houston to protect his children, confronting the forces closing in around him – and the beliefs threatening to unravel within.",
      "genres": []
    },
    {
      "id": "1751701",
      "title": "After Impact",
      "type": "movie",
      "rating": "5.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/yzDuAQCY2n6zzOlBkn6JzhLhY3k.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/k22XyPbce7zvzzf5OnT4uaY8ZD1.jpg",
      "overview": "After losing his father, Ethan Nichols inherits one of the largest greenhouses in the country, just as the world faces a devastating threat from an approaching asteroid. As society begins to unravel, Ethan grapples with personal betrayal, overwhelming loneliness, and the growing fear that survival may come at the cost of his humanity. Seeking refuge in his family’s bunker, Ethan endures the harsh aftermath of the impact, wrestling with physical injury and emotional despair. When a faint voice crackles over his radio, Ethan discovers he's not as alone as he believed.",
      "genres": []
    },
    {
      "id": "1616419",
      "title": "The Good Lawyer",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/rVkMvD7CpBueGmNIz2uVgluhTjS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fzlch1j1aVGJKI0GB6IdgbG5gpJ.jpg",
      "overview": "After a courtroom overdose lands him in rehab, a lawyer has one week to save his career and prepare for his own trial, with the help of a dogged intern.",
      "genres": []
    },
    {
      "id": "1623376",
      "title": "Blue Lock",
      "type": "movie",
      "rating": "8.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/nmYfihKTVUKQnHfnKE46uYMPEul.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/znXyQgqITDm8fJxcvmlRpKlw49T.jpg",
      "overview": "After years of defeat, Japan's Football Union gathers 300 high school players in a ruthless training program to find the world's greatest striker, where failure means permanent exclusion from the national team.",
      "genres": []
    }
  ],
  "romance": [
    {
      "id": "1596275",
      "title": "Drive - The Pretenders",
      "type": "movie",
      "rating": "7.6",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/s9syckECnUYhKePQ1A0DC0mFVZ9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hbz4aeVsjnKb2HRoFbbr46Egh8y.jpg",
      "overview": "A young mechanic fakes an engagement with racing's most scandalous star — officially for his reputation, secretly for her own shot behind the wheel. But soon the lie threatens to destroy everything — including what's already become so much more than just a deal.",
      "genres": []
    },
    {
      "id": "1669915",
      "title": "Angel and the Badman",
      "type": "movie",
      "rating": "8.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/mJe53zlhGBdcjtN1GqncNZ5Unm0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hULWeQoEJUhiZ6NlANxsLoMJJ5p.jpg",
      "overview": "A wounded outlaw finds unexpected mercy in the care of a rancher's daughter. The hope of love pulls him toward a different life until the law, and his violent past, close in on his new home. Now he must choose the kind of man he'll become.",
      "genres": []
    },
    {
      "id": "27",
      "title": "9 Songs",
      "type": "movie",
      "rating": "5.5",
      "year": "2004",
      "poster": "https://image.tmdb.org/t/p/w500/91O7z0vo7MiNWd5xD2BoivwbQsb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/bybAHw5fenKXRFI4phanPhpljlT.jpg",
      "overview": "Matt, a young glaciologist, soars across the vast, silent, icebound immensities of the South Pole as he recalls his love affair with Lisa. They meet at a mobbed rock concert in a vast music hall - London's Brixton Academy. They are in bed at night's end. Together, over a period of several months, they pursue a mutual sexual passion whose inevitable stages unfold in counterpoint to nine live-concert songs.",
      "genres": []
    },
    {
      "id": "1503762",
      "title": "Sense and Sensibility",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/czsyPHosFNbh4PPqXfqWu1aBXnA.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tIcONOFK9D3F89ETK8DBS1hIwVF.jpg",
      "overview": "A charming, witty, and deeply relatable story of love and sisterhood.",
      "genres": []
    },
    {
      "id": "1697911",
      "title": "Drummer Boy",
      "type": "movie",
      "rating": "7.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/bhjdgMm2fFrysSzVqv5RwRwIbVf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5KF459N6jOfRV7kV9XV7ZQdCLKK.jpg",
      "overview": "As America’s fight for independence begins, a young drummer boy, an enslaved woman, and a divided family search for freedom. Through battle and loss, music carries hope in a deeply human story of faith and forgiveness.",
      "genres": []
    },
    {
      "id": "1302904",
      "title": "Practical Magic 2",
      "type": "movie",
      "rating": "7.2",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/ogwQOLbCfncjvBhFb5l0OmQH8KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
      "overview": "The Owens sisters must confront the dark curse that threatens to unravel their family once and for all.",
      "genres": []
    },
    {
      "id": "1195803",
      "title": "Wicker",
      "type": "movie",
      "rating": "7.5",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/6FcBZOKvyrLCKGCyBG0ySCR4okt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xVh1ypMoVkMf5IB7y3hnRplJ14c.jpg",
      "overview": "On the outskirts of a village by the sea, lives a Fisherwoman; smelly, single and perpetually ridiculed. One day, fed up with her stuffy, small-minded neighbours, she commissions herself a husband to be made from wicker. In an otherwise conservative town, this unconventional romance sparks outrage, jealousy and chaos.",
      "genres": []
    },
    {
      "id": "1757174",
      "title": "The Christmas Switch",
      "type": "movie",
      "rating": "6.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/9kHrUoPF2rl5Hj0QMquAy3xznXT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4BsOLok9WaTTTcSpmoMtCLERScS.jpg",
      "overview": "Craving a change of pace, work-hard-play-hard city girl Freddie swaps lives with her homebody sister Mattie at Christmas time, only to unwrap a whole new kind of mess.",
      "genres": []
    },
    {
      "id": "1523145",
      "title": "Your Heart Will Be Broken",
      "type": "movie",
      "rating": "7.8",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fRjy6zDeNjfzmjpKz8mElA9Aa6l.jpg",
      "overview": "High school student Polina is saved from bullying at her new school and makes a deal with the main bully Bars: he must pretend to be her boyfriend and protect her, and she must do everything he says. During this game, the couple develops real feelings, but her family and classmates have reasons to separate the lovers.",
      "genres": []
    },
    {
      "id": "597",
      "title": "Titanic",
      "type": "movie",
      "rating": "7.9",
      "year": "1997",
      "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sCzcYW9h55WcesOqA12cgEr9Exw.jpg",
      "overview": "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later. A young Rose boards the ship with her mother and fiancé. Meanwhile, Jack Dawson and Fabrizio De Rossi win third-class tickets aboard the ship. Rose tells the whole story from Titanic's departure through to its death—on its first and last voyage—on April 15, 1912.",
      "genres": []
    },
    {
      "id": "1654940",
      "title": "One Year to Live, Buy a Man",
      "type": "movie",
      "rating": "7.4",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/fez7kLyGzpowduJapTFZZ1feCS0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/6vGH7JZFLzFawpwCcnNweF8j3KD.jpg",
      "overview": "Given a year to live, frugal 40-year-old Yui finally lets herself spend: \"buying\" nightclub host Sena. What begins as a contract takes an unexpected turn.",
      "genres": []
    },
    {
      "id": "13",
      "title": "Forrest Gump",
      "type": "movie",
      "rating": "8.5",
      "year": "1994",
      "poster": "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/66Kn4XWhkuPkJxOJyPEx4U2CUfN.jpg",
      "overview": "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.",
      "genres": []
    },
    {
      "id": "1381078",
      "title": "Love of Your Life",
      "type": "movie",
      "rating": "6.7",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/dL3Tcv4FU2K85bgnGRBgLjFSrLr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4hneB0UFKOZAGJHqJ3VhDcG72uH.jpg",
      "overview": "After a chance encounter sparks a sweeping romance, Maya's future is suddenly upended, sending her on an unexpected journey to love and live again.",
      "genres": []
    },
    {
      "id": "3933",
      "title": "Corpse Bride",
      "type": "movie",
      "rating": "7.6",
      "year": "2005",
      "poster": "https://image.tmdb.org/t/p/w500/3RAoVTxUk1OzZClscAsynuu670p.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v23fWgJUEt8EMmvn19btIacxP8E.jpg",
      "overview": "In a 19th-century European village, a young man about to be married is whisked away to the underworld and wed to a mysterious corpse bride, while his real bride waits bereft in the land of the living.",
      "genres": []
    },
    {
      "id": "1516698",
      "title": "The Last Sunrise",
      "type": "movie",
      "rating": "6.9",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/3PWJqDfygN0YNNjWsDUOXclCp3h.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zFCWfU2ViMIm38G1W8UsnSpqmWn.jpg",
      "overview": "Ry, a college student with a chronic illness, escapes to Mallorca for the summer with her mother, where she unexpectedly falls for a local and begins to embrace living in the moment. But as her condition worsens and long-hidden family secrets come to light, everything she has found before summer's end is threatened.",
      "genres": []
    },
    {
      "id": "48650",
      "title": "Room in Rome",
      "type": "movie",
      "rating": "6.4",
      "year": "2010",
      "poster": "https://image.tmdb.org/t/p/w500/w90ItYf9qagQKVEBr1uFxPomAtf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/abQxLSkGxpHyUxRjRXACt8NbiGf.jpg",
      "overview": "A hotel room in the center of Rome serves as the setting for Alba and Natasha, two sexy and recently acquainted women, to have a physical adventure that touches their very souls.",
      "genres": []
    },
    {
      "id": "1664264",
      "title": "A Very Arctic Christmas",
      "type": "movie",
      "rating": "6.0",
      "year": "2026",
      "poster": "https://image.tmdb.org/t/p/w500/iyuVTpASpRy2FpsLbGbwF7T2PtI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zskxUdaCFkDNiS3slxQXFEDtL37.jpg",
      "overview": "Single dad Jim and his spirited, science-minded 20-year-old daughter, Isla, share a tradition of alternating who decides how they spend Christmas each year. Jim, a former major league baseball player turned broadcaster, never misses hosting his annual Christmas Eve show from Times Square – until Isla persuades him to take a once-in-a-lifetime Arctic cruise, promising they will return in time for his broadcast.",
      "genres": []
    },
    {
      "id": "1218925",
      "title": "Chainsaw Man - The Movie: Reze Arc",
      "type": "movie",
      "rating": "8.5",
      "year": "2025",
      "poster": "https://image.tmdb.org/t/p/w500/i69jR67amezdJ3sx6OOvOGn7HAR.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gqTz24ZRsCP6AKjARmEivY7m0cK.jpg",
      "overview": "In a world where devils are born from humanity’s fears, Denji has only ever dreamed of living a simple life, eating good food, finding happiness, and experiencing the warmth of being loved. Then, one rainy afternoon, fate leads him to Reze, a mysterious girl working at a small café. With her disarming smile, playful charm, and unexpected kindness, she offers Denji something he has rarely known—a glimpse of an ordinary life beyond bloodshed and chaos.",
      "genres": []
    },
    {
      "id": "399783",
      "title": "Summer with Mika",
      "type": "movie",
      "rating": "2.7",
      "year": "2016",
      "poster": "https://image.tmdb.org/t/p/w500/uPD3uYiJD5PKmR1bM4id6LUAwYh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/eeuafT0yXn0T7YA9ScmAbp1XMoO.jpg",
      "overview": "Jeong Min is a writer. He comes to a coffee shop because his writing comes to a stand. Inspired by a Japanese woman who drops by the coffee shop for job, Jeong Min decides to write 3 short stories of a Japanese woman / omnibus fantasy melodrama.",
      "genres": []
    }
  ]
};

export function getRichHomeCatalog(): HomeCatalog {
  return RICH_HOME_CATALOG;
}

export function getRichCategory(options: CategoryQueryParams): CategoryResponse {
  const category = (options.category || 'popular').toLowerCase();
  const page = Math.max(1, Number(options.page || 1));
  const pageSize = 18;

  let pool: MediaItem[] = [];

  if (category === 'movies' || category === 'popular_movies' || category === 'popular') {
    pool = (CATEGORY_COLLECTIONS['movies'] || []).concat(Object.values(RICH_ITEMS).filter(i => i.type === 'movie'));
  } else if (category === 'tv' || category === 'popular_tv') {
    pool = (CATEGORY_COLLECTIONS['tv'] || []).concat(Object.values(RICH_ITEMS).filter(i => i.type === 'tv'));
  } else if (category === 'anime' || category === 'animation') {
    pool = CATEGORY_COLLECTIONS['animation'] || [];
  } else if (CATEGORY_COLLECTIONS[category]) {
    pool = CATEGORY_COLLECTIONS[category];
  } else if (options.genreId) {
    const gId = options.genreId;
    const genreMap: Record<number, string> = {
      28: 'action',
      878: 'scifi',
      16: 'animation',
      35: 'comedy',
      53: 'thriller',
      27: 'horror',
      18: 'drama',
      10749: 'romance'
    };
    const key = genreMap[gId];
    if (key && CATEGORY_COLLECTIONS[key]) {
      pool = CATEGORY_COLLECTIONS[key];
    }
  }

  if (pool.length === 0) {
    pool = Object.values(RICH_ITEMS);
  }

  // Deduplicate pool
  const seen = new Set<string>();
  const uniquePool: MediaItem[] = [];
  for (const item of pool) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      uniquePool.push(item);
    }
  }

  const totalResults = uniquePool.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = ((page - 1) * pageSize) % Math.max(1, totalResults);
  const results = uniquePool.slice(startIndex, startIndex + pageSize);

  return {
    success: true,
    category,
    genreId: options.genreId,
    page,
    totalPages,
    totalResults,
    results
  };
}

export function searchRichCatalog(query: string): MediaItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: MediaItem[] = [];
  for (const item of Object.values(RICH_ITEMS)) {
    if (
      item.title.toLowerCase().includes(q) ||
      (item.overview && item.overview.toLowerCase().includes(q)) ||
      (item.genres && item.genres.some(g => g.toLowerCase().includes(q)))
    ) {
      results.push(item);
    }
  }
  return results.slice(0, 30);
}

export function getRichTitleDetails(id: string, type: 'movie' | 'tv' | 'anime'): TitleDetails {
  const item = RICH_ITEMS[id] || Object.values(RICH_ITEMS).find(i => String(i.id) === String(id));
  const effectiveType = item?.type || type;
  const title = item?.title || 'Streaming Title';

  const recommendations = Object.values(RICH_ITEMS)
    .filter(i => String(i.id) !== String(id) && (i.type === effectiveType))
    .slice(0, 12);

  return {
    id: String(id),
    title,
    type: effectiveType,
    poster: item?.poster,
    backdrop: item?.backdrop,
    overview: item?.overview || 'Now streaming on Netflix.',
    year: item?.year || '2024',
    rating: item?.rating || '8.0',
    genres: item?.genres || ['Entertainment'],
    cast: [],
    recommendations,
    numberOfSeasons: effectiveType === 'tv' ? 1 : undefined,
    seasons: effectiveType === 'tv' ? [{ id: 1, number: 1, name: 'Season 1', overview: '', episodeCount: 10 }] : undefined
  };
}
