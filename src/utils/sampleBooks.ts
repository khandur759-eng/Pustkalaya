import { Book, Chapter, PageData } from '../types';
import { createBookFromText } from './documentParser';

// Dedicated 24-page original demonstration volume
function createPrimaryDemoBook(): Book {
  const pages: PageData[] = [
    // Page 1: Front Cover
    {
      id: 1,
      pageNumber: 1,
      isCover: true,
      content: "The Alchemist of Alexandria",
      paragraphs: ["The Alchemist of Alexandria", "Lysander Thorne"],
      wordCount: 12,
    },
    // Page 2: Title & Epigraph Page
    {
      id: 2,
      pageNumber: 2,
      chapterTitle: "Title & Epigraph",
      content: "The Alchemist of Alexandria",
      paragraphs: [
        "Being a faithful chronicle of the hidden laboratories beneath the Pharos, the discovery of the Celestial Crucible, and the voyages across the Sea of Amber.",
        "Published in Alexandria & Florence, Anno Domini MDCLXXIV.",
      ],
      quote: "What is written in the stars can be deciphered in the dust; what is forged in the fire shall outlast the stone.",
      quoteAuthor: "Hermes Trismegistus, The Emerald Tablet",
      wordCount: 65,
    },
    // Page 3: Table of Contents
    {
      id: 3,
      pageNumber: 3,
      isTableOfContents: true,
      chapterTitle: "Table of Contents",
      content: "Table of Contents",
      paragraphs: [],
      wordCount: 40,
    },
    // Page 4: Chapter 1 - Opening
    {
      id: 4,
      pageNumber: 4,
      chapterTitle: "The Library of Brass",
      chapterIndex: 1,
      illustration: 'alchemist',
      content: "",
      paragraphs: [
        "In the winter of my forty-second year, when the Mediterranean winds carried the scent of crushed cedar and salt across the harbour of Alexandria, I discovered the third key.",
        "For three centuries, the scholars of the Western guilds had maintained that the subterranean vaults beneath the ancient Serapeum were destroyed by the great conflagration. They had not accounted for the water gates. Beneath the cisterns where the Nile floods were measured, behind sixteen paces of mortar and basalt, there lay a chamber untouched by sun or sovereign.",
        "It was not books made of parchment that lined those subterranean galleries, but thin leaves of beaten brass, inscribed with diamond points in a script that antedated the Ptolemies.",
      ],
      footnote: "* The Serapeum of Alexandria, partly preserved through subterranean hydraulic canals.",
      wordCount: 165,
    },
    // Page 5: Chapter 1 - Cont.
    {
      id: 5,
      pageNumber: 5,
      chapterTitle: "The Library of Brass",
      chapterIndex: 1,
      content: "",
      paragraphs: [
        "My lantern cast long, amber shadows across the interlocking dials. Each shelf was mounted on bronze gimbals, weighted so that the earth's natural tremors would never cast the plates onto the flags. I drew my finger across the uppermost plate; the metal was cool, vibrating with a resonance so faint it seemed more like a memory of sound than sound itself.",
        "There were three figures engraved upon the central leaf: a phoenix perched upon an armillary sphere, a serpent coiled about an hourglass, and seven stars aligned with the constellation of Cygnus.",
        "To read brass requires patience unlike the reading of ink. One must hold the lamp at an oblique angle of thirty degrees, allowing the shadow cast by the incision to create the illusion of dark letters on a field of burnished gold.",
      ],
      quote: "Knowledge is not acquired; it is remembered from the time before the elements parted.",
      quoteAuthor: "Archimedes of Syracuse (attr.)",
      wordCount: 178,
    },
    // Page 6: Chapter 1 - Cont.
    {
      id: 6,
      pageNumber: 6,
      chapterTitle: "The Library of Brass",
      chapterIndex: 1,
      content: "",
      paragraphs: [
        "By midnight, the translation began to take form upon my notebook. The text spoke of an instrument known as the Astrolabe of Tides—a mechanism capable of calculating not merely the positions of celestial bodies, but the ebb and flow of human fortunes across the empires.",
        "The author identified himself only as 'The Keeper of the Seventh Seal'. He warned that whoever should assemble the three fragments must possess the courage to unsee what the glass reveals.",
        "I looked down at my ink-stained hands. How many years had I spent in dusty garrets in Padua, chasing the rumors of this vault? I was no longer young, yet in that subterranean silence, with the distant rumble of the sea reverberating through forty cubits of limestone, I felt the sharp, electric vigor of a youth embarking upon his maiden voyage.",
      ],
      wordCount: 172,
    },
    // Page 7: Chapter 1 - Conclusion
    {
      id: 7,
      pageNumber: 7,
      chapterTitle: "The Library of Brass",
      chapterIndex: 1,
      illustration: 'hourglass',
      content: "",
      paragraphs: [
        "Before ascending to the upper world, I carefully wrapped the brass folios in oiled silk and placed them within my leather satchel. The morning light was just beginning to streak the eastern sky above the Pharos when I emerged through the well-head of the spice merchant's courtyard.",
        "A flock of white gulls circled the harbour bastions, their cries sharp in the crisp dawn air. In the bay, the Venetian galleasses were unfurling their sails, preparing for the long voyage across the Levant. I knew my own journey had only just commenced.",
      ],
      footnote: "† Recorded in the journal of Lysander Thorne, preserved in the Laurentian Library.",
      wordCount: 125,
    },
    // Page 8: Chapter 2 - The Constellation Vault
    {
      id: 8,
      pageNumber: 8,
      chapterTitle: "The Constellation Vault",
      chapterIndex: 2,
      illustration: 'constellation',
      content: "",
      paragraphs: [
        "The crossing from Alexandria to Candia occupied twelve days of foul weather and contrary tides. The Venetian captain, a superstitious veteran of the Lepanto campaigns named Morosini, crossed himself whenever he glanced toward the iron chest in my cabin.",
        "'There are things, Signor Thorne,' he murmured one evening over salt beef and watered wine, 'that the deep waters are meant to keep hidden. When the compass spins without iron, the seabed is opening its mouth.'",
        "He was not entirely wrong. For three consecutive nights, as we passed the shoals south of Crete, the needle of my binnacle ceased to point north. Instead, it aligned directly with the rising of Antares in the heart of Scorpio.",
      ],
      wordCount: 154,
    },
    // Page 9: Chapter 2 - Cont.
    {
      id: 9,
      pageNumber: 9,
      chapterTitle: "The Constellation Vault",
      chapterIndex: 2,
      content: "",
      paragraphs: [
        "On the island of Crete, high in the crags above the ruined palace of Knossos, there resides a brotherhood of monks who have guarded the mountain observatory since the fall of Constantinople.",
        "Their abbot, Father Callistus, received me in a scriptorium illuminated only by alabaster lamps filled with pressed olive oil. When I revealed the brass leaf bearing the seal of Cygnus, the old man remained motionless for a full minute, his breath shallow in the mountain cold.",
        "'We have awaited this since the year of the Great Comet,' he said softly, rising from his stool. 'Follow me, and walk only where the stones are dressed with lime.'",
      ],
      quote: "The sky is a mechanism of dials; we who watch are merely the pendulums counting the hours.",
      quoteAuthor: "Callistus of Mount Ida",
      wordCount: 162,
    },
    // Page 10: Chapter 2 - Cont.
    {
      id: 10,
      pageNumber: 10,
      chapterTitle: "The Constellation Vault",
      chapterIndex: 2,
      content: "",
      paragraphs: [
        "He led me down a winding staircase cut into the living mountain. The air grew colder, crisp and mineral, smelling of ancient snow and limestone water. We arrived at a circular dome thirty cubits in diameter.",
        "The ceiling was not stone, but a dome of polished obsidian, pierced with thousands of microscopic apertures that admitted the pure starlight from the summit. By some optical virtue known only to the ancient builders, the stars appeared magnified tenfold, their colours—amber, sapphire, and emerald—pulsing against the pitch darkness.",
        "In the exact centre of the chamber stood a pedestal of white porphyry, carved with twelve concentric rings that could be rotated by silver levers.",
      ],
      wordCount: 158,
    },
    // Page 11: Chapter 2 - Conclusion
    {
      id: 11,
      pageNumber: 11,
      chapterTitle: "The Constellation Vault",
      chapterIndex: 2,
      content: "",
      paragraphs: [
        "Together, Callistus and I aligned the rings according to the ephemeris inscribed upon the brass plates of Alexandria. As the final dial clicked into place, a beam of concentrated starlight struck the centre of the pedestal.",
        "A hidden compartment sprang open with the soft chime of a silver spring. Within lay the second relic: a crystal prism cut with sixty-four facets, within which floated a minute sphere of liquid gold that never touched the prism's walls.",
        "'The Heart of the Astrolabe,' whispered Callistus. 'Now you must seek the Navigator's Wheel in the city of the Doges.'",
      ],
      footnote: "‡ The mechanism reflects the astronomical principles of Claudius Ptolemy's Almagest.",
      wordCount: 138,
    },
    // Page 12: Chapter 3 - The Clockwork Compass
    {
      id: 12,
      pageNumber: 12,
      chapterTitle: "The Clockwork Compass",
      chapterIndex: 3,
      illustration: 'compass',
      content: "",
      paragraphs: [
        "Venice in the spring of 1675 was a city of mist and carnival masks. Behind the drawn shutters of the Palazzo Dandolo on the Grand Canal, Maestro Giacomo Bellini worked by the light of twelve tallow candles.",
        "Bellini was the last master horologist who understood the secret escapements of the Byzantine clock-makers. For forty days, he examined the brass plates and the floating golden sphere.",
        "'This is not a timepiece for hours or minutes, Lysander,' he declared, removing his magnifying loupe and rubbing his rheumy eyes. 'This counts the precession of the equinoxes. One full revolution of the outer ring requires twenty-five thousand, nine hundred and twenty solar years.'",
      ],
      wordCount: 150,
    },
    // Page 13: Chapter 3 - Cont.
    {
      id: 13,
      pageNumber: 13,
      chapterTitle: "The Clockwork Compass",
      chapterIndex: 3,
      content: "",
      paragraphs: [
        "To house the crystal prism, Bellini forged a casing from electrum—an alloy of silver and gold sacred to the ancient temple smiths. He fitted it with twenty-four jeweled bearings cut from Burmese rubies, ensuring that the friction of the moving parts would approach zero.",
        "When the assembly was completed, the instrument was no larger than a mariner's pocket compass, yet it possessed a weight and density that surprised everyone who held it.",
        "When placed upon a flat marble table, it began to tick. The rhythm was unlike any clock ever made: three rapid beats followed by a prolonged silence of seven seconds, perfectly synchronised with the tidal surges of the Venetian lagoon outside our window.",
      ],
      quote: "Time is the canvas upon which the universe paints the illusion of change.",
      quoteAuthor: "Giacomo Bellini, Treatise on Celestial Escapements",
      wordCount: 168,
    },
    // Page 14: Chapter 3 - Cont.
    {
      id: 14,
      pageNumber: 14,
      chapterTitle: "The Clockwork Compass",
      chapterIndex: 3,
      content: "",
      paragraphs: [
        "On the night before my departure for the Atlantic voyage, a visitor arrived at the palazzo. He wore the black mantle of the Council of Ten and spoke with the measured cadence of one accustomed to life-and-death authority.",
        "'The Republic is aware of what you have constructed, Signor Thorne,' the visitor stated, declining the offered chair. 'There are powers in Europe who would pay the ransom of three kingdoms for such an instrument. Our advice is simple: sail beyond the Pillars of Hercules before the spring fleet arrives from Spain.'",
        "He placed a purse of gold ducats on the table and departed into the foggy canal without another word.",
      ],
      wordCount: 145,
    },
    // Page 15: Chapter 3 - Conclusion
    {
      id: 15,
      pageNumber: 15,
      chapterTitle: "The Clockwork Compass",
      chapterIndex: 3,
      illustration: 'tower',
      content: "",
      paragraphs: [
        "By midnight, my chartered caravel was gliding past the Lido, heading south into the Adriatic. The city of lagoons faded behind us like a dream of marble and water.",
        "I stood at the quarterdeck with the compass resting in my palm. Under the light of the full moon, the liquid golden sphere began to glow with an ethereal opalescent sheen, pointing unerringly toward the open ocean beyond Gibraltar.",
      ],
      footnote: "§ The caravel 'San Zaccaria', captained by Matteo of Ragusa.",
      wordCount: 98,
    },
    // Page 16: Chapter 4 - The Whispering Sands
    {
      id: 16,
      pageNumber: 16,
      chapterTitle: "The Whispering Sands",
      chapterIndex: 4,
      illustration: 'feather',
      content: "",
      paragraphs: [
        "Beyond the straits of Gibraltar, where the ocean swells grow long and stately under the trade winds, the compass ceased to follow the geography of charted coasts. It led us past the Fortunate Isles, deep into the great Sargasso Sea where floating meadows of gold-green weed blanket the surface for leagues.",
        "The crew grew anxious as the sound of the hull cutting through weed replaced the crisp splash of open water. 'No ship has ever entered this weed and returned to Lisbon,' muttered the boatswain.",
        "Yet the compass continued its steady three-beat rhythm, drawing us toward an eye of clear sapphire water in the heart of the ocean.",
      ],
      wordCount: 145,
    },
    // Page 17: Chapter 4 - Cont.
    {
      id: 17,
      pageNumber: 17,
      chapterTitle: "The Whispering Sands",
      chapterIndex: 4,
      content: "",
      paragraphs: [
        "On the twenty-seventh day of ocean sailing, at the exact hour when the sun kissed the western horizon, the lookout shouted from the crosstrees: 'Land on the starboard bow! A tower of crystal!'",
        "It was not an island of earth or rock, but a ring of translucent white stone rising five fathoms above the calm sea, enclosing a lagoon so clear that the seabed, eighty cubits below, appeared within arm's reach.",
        "We anchored the caravel in the lee of the outer ring and launched the longboat. As my boots touched the white stone, a gentle warmth emanated through the soles of my leather shoes. The stone was alive with a slow, rhythmic pulse matching that of our electrum compass.",
      ],
      quote: "The earth holds islands that do not belong to the kingdoms of men, but to the architects of the stars.",
      quoteAuthor: "Lysander Thorne, Ocean Journal",
      wordCount: 162,
    },
    // Page 18: Chapter 4 - Cont.
    {
      id: 18,
      pageNumber: 18,
      chapterTitle: "The Whispering Sands",
      chapterIndex: 4,
      content: "",
      paragraphs: [
        "In the centre of the lagoon stood an open pavilion supported by twelve slender columns of green basalt. Upon the central altar rested an open book made not of paper or brass, but of sheets of polished amber.",
        "I approached the altar alone, carrying the compass and the brass leaves of Alexandria. As I placed the compass in the circular indentation on the amber book's cover, the pages began to turn of their own accord, driven by an unseen, gentle draft of warm air.",
        "Each leaf of amber revealed an illuminated diagram of the solar system, with planets whose orbits had never been witnessed by Galileo or Kepler.",
      ],
      wordCount: 144,
    },
    // Page 19: Chapter 4 - Conclusion
    {
      id: 19,
      pageNumber: 19,
      chapterTitle: "The Whispering Sands",
      chapterIndex: 4,
      content: "",
      paragraphs: [
        "It was then that I understood the true nature of the Great Work. The alchemists of old were not seeking to turn lead into common gold. Gold was merely the symbol of the perfected human intellect—a mind freed from the gravity of ignorance.",
        "The island was not a tomb, but an observatory established before the melting of the great northern glaciers, waiting for the human family to mature sufficiently to read its lessons.",
      ],
      footnote: "¶ Preserved in fragments in the Royal Society archive, London.",
      wordCount: 104,
    },
    // Page 20: Chapter 5 - The Celestial Crucible
    {
      id: 20,
      pageNumber: 20,
      chapterTitle: "The Celestial Crucible",
      chapterIndex: 5,
      illustration: 'tree',
      content: "",
      paragraphs: [
        "For seven days and nights, I transcribed the contents of the amber volume into my notebook. I drew the planetary tables, the harmonic progressions of the tides, and the medicinal properties of forty-eight herbs unknown to European botanists.",
        "When the work was finished, I felt a deep, abiding tranquility settle upon my spirit. The ambitions of my earlier years—the craving for academic honours, the fear of poverty, the bitterness of intellectual rivalries—all vanished like mist before the midday sun.",
        "I knew that I could not carry the amber book away with me; it belonged to the ocean and the stars. I took only the knowledge inscribed in my own hand and the memory of that starlit lagoon.",
      ],
      wordCount: 156,
    },
    // Page 21: Chapter 5 - Cont.
    {
      id: 21,
      pageNumber: 21,
      chapterTitle: "The Celestial Crucible",
      chapterIndex: 5,
      content: "",
      paragraphs: [
        "On the eighth morning, we weighed anchor and set our course eastward toward the coast of Portugal. As our caravel sailed past the outer reef, I looked back one final time.",
        "The white ring and the basalt pavilion were slowly submerging beneath the turquoise waves, returning to the sanctuary of the ocean floor until the cycle of the precession should summon them forth once more.",
        "The compass in my pocket ceased its ticking and became silent, its liquid sphere resting peacefully at the centre of the ruby bearings.",
      ],
      quote: "He who has seen the harmony of the spheres can never again walk the earth as a stranger.",
      quoteAuthor: "Pythagoras of Samos",
      wordCount: 135,
    },
    // Page 22: Epilogue & Historical Note
    {
      id: 22,
      pageNumber: 22,
      chapterTitle: "Epilogue & Historical Note",
      chapterIndex: 6,
      content: "",
      paragraphs: [
        "Lysander Thorne returned to Europe in the autumn of 1676. He lived the remainder of his life in a small cottage near Oxford, teaching mathematics to students and cultivating a remarkable medicinal garden.",
        "His manuscripts were bequeathed to the Bodleian Library upon his death in 1704, with the instruction that they should be opened only by those who seek truth for the betterment of humankind rather than for power or coin.",
        "This digital collector's volume has been faithfully reconstructed to honor the spirit of his journey.",
      ],
      wordCount: 110,
    },
    // Page 23: Back Matter - About the Edition
    {
      id: 23,
      pageNumber: 23,
      chapterTitle: "Colophon",
      content: "Colophon",
      paragraphs: [
        "DocuBook Real-Book Edition #001",
        "Set in EB Garamond and Cinzel Display typefaces, modeled upon the Venetian printing types of Nicolas Jenson (1470).",
        "Engineered with tactile 3D physical page-turn physics, deckled edge layer simulation, and multi-source ambient lighting.",
        "Alexandria • Venice • Oxford",
      ],
      wordCount: 52,
    },
    // Page 24: Finis / Back Cover
    {
      id: 24,
      pageNumber: 24,
      isBackCover: true,
      content: "Finis",
      paragraphs: [
        "Finis - End of Volume",
        "Completed reading 'The Alchemist of Alexandria' by Lysander Thorne.",
        "Total Pages: 24 • Words: 3,450",
      ],
      wordCount: 20,
    },
  ];

  const chapters: Chapter[] = [
    {
      id: 'ch-1',
      title: 'Chapter 1: The Library of Brass',
      pageNumber: 4,
      previewSnippet: 'In the winter of my forty-second year, when Mediterranean winds carried the scent of crushed cedar...',
    },
    {
      id: 'ch-2',
      title: 'Chapter 2: The Constellation Vault',
      pageNumber: 8,
      previewSnippet: 'The crossing from Alexandria to Candia occupied twelve days of foul weather and contrary tides...',
    },
    {
      id: 'ch-3',
      title: 'Chapter 3: The Clockwork Compass',
      pageNumber: 12,
      previewSnippet: 'Venice in the spring of 1675 was a city of mist and carnival masks. Behind drawn shutters...',
    },
    {
      id: 'ch-4',
      title: 'Chapter 4: The Whispering Sands',
      pageNumber: 16,
      previewSnippet: 'Beyond the straits of Gibraltar, where the ocean swells grow long and stately under trade winds...',
    },
    {
      id: 'ch-5',
      title: 'Chapter 5: The Celestial Crucible',
      pageNumber: 20,
      previewSnippet: 'For seven days and nights, I transcribed the contents of the amber volume into my notebook...',
    },
    {
      id: 'ch-6',
      title: 'Epilogue & Colophon',
      pageNumber: 22,
      previewSnippet: 'Lysander Thorne returned to Europe in the autumn of 1676...',
    },
  ];

  return {
    id: 'book-alchemist-alexandria',
    title: "The Alchemist of Alexandria",
    author: "Lysander Thorne",
    coverTheme: 'emerald-vintage',
    coverSubtitle: "Chronicles of the Forgotten Realm • 24 Pages",
    fileType: 'sample',
    pages,
    chapters,
    bookmarks: [
      {
        id: 'bm-demo-1',
        pageNumber: 4,
        previewText: 'In the winter of my forty-second year, when the Mediterranean winds...',
        createdAt: Date.now() - 3600000,
        note: 'The discovery of the subterranean brass library',
      },
    ],
    currentPage: 1,
    readingProgress: 0,
    totalWords: 3450,
    totalPages: 24,
    isFavorite: true,
    category: 'fiction',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  };
}

const ALICE_IN_WONDERLAND_TEXT = `Chapter I: Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.

Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled "ORANGE MARMALADE", but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody underneath, so managed to put it into one of the cupboards as she fell past it.

Chapter II: The Pool of Tears

"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I'm opening out like the largest telescope that ever was! Good-bye, feet!" (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). "Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can;—but I must be kind to them," thought Alice, "or perhaps they won't walk the way I want to go! Let me see: I'll give them a new pair of boots every Christmas."

Chapter III: A Caucus-Race and a Long Tale

They were indeed a queer-looking party that assembled on the bank—the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable.`;

const MEDITATIONS_TEXT = `Book I: Debts and Lessons

From my grandfather Verus I learned good morals and the government of my temper. From the reputation and remembrance of my father, modesty and a manly character. From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.

From my great-grandfather, not to have frequented public schools, and to have had good teachers at home, and to have understood that on such things a man should spend liberally.

From my governor, to be neither of the green nor of the blue party at the games in the Circus, nor a partizan either of the Parmularius or the Scutarius at the gladiators' fights; from him too I learned endurance of labour, and to want little, and to work with my own hands, and not to meddle with other people's affairs, and not to be ready to listen to slander.

Book II: On the River Gran

When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own—not of the same blood or birth, but the same mind, and possessing a share of the divine.

None of them can hurt me. No one can implicate me in ugliness. Nor can I feel angry at my kin, or hate him. We were born to work together like feet, hands, and eyes, like the two rows of teeth, upper and lower. To obstruct each other is unnatural. To feel anger at someone, to turn your back on him: these are obstructions.`;

const ART_OF_WAR_TEXT = `Chapter I: Laying Plans

Sun Tzu said: The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.

The art of war, then, is governed by five constant factors, to be taken into account in one's deliberations, when seeking to determine the conditions obtaining in the field. These are: The Moral Law; Heaven; Earth; The Commander; Method and discipline.

The Moral Law causes the people to be in complete accord with their ruler, so that they will follow him regardless of their lives, undismayed by any danger. Heaven signifies night and day, cold and heat, times and seasons. Earth comprises distances, great and small; danger and security; open ground and narrow passes; the chances of life and death.

All warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive; when we are near, we must make the enemy believe we are far away; when far away, we must make him believe we are near.

Chapter II: Waging War

Sun Tzu said: In the operations of war, where there are in the field a thousand swift chariots, as many heavy chariots, and a hundred thousand mail-clad soldiers, with provisions enough to carry them a thousand li, the expenditure at home and at the front will reach the total of a thousand ounces of silver per day. Such is the cost of raising an army of 100,000 men.`;

export const SAMPLE_BOOKS: Book[] = [
  createPrimaryDemoBook(),
  createBookFromText(ALICE_IN_WONDERLAND_TEXT, {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    coverTheme: 'navy-gold',
    fileType: 'sample',
    wordsPerPage: 220,
  }),
  createBookFromText(MEDITATIONS_TEXT, {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    coverTheme: 'classic-leather',
    fileType: 'sample',
    wordsPerPage: 210,
  }),
  createBookFromText(ART_OF_WAR_TEXT, {
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverTheme: 'burgundy-royal',
    fileType: 'sample',
    wordsPerPage: 210,
  }),
];
