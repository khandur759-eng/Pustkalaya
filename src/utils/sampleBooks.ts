import { Book, Chapter, PageData } from '../types';
import { createBookFromText } from './documentParser';

export function createTheAlchemistBook(): Book {
  const pages: PageData[] = [
    // Page 1: Front Cover
    {
      id: 1,
      pageNumber: 1,
      isCover: true,
      content: "The Alchemist",
      paragraphs: ["The Alchemist", "Paulo Coelho"],
      wordCount: 12,
    },
    // Page 2: Title & Epigraph Page
    {
      id: 2,
      pageNumber: 2,
      chapterTitle: "Title & Epigraph",
      content: "The Alchemist",
      paragraphs: [
        "A magical fable about following your dream.",
        "Translated by Alan R. Clarke. HarperTorch.",
      ],
      quote: "When you want something, all the universe conspires in helping you to achieve it.",
      quoteAuthor: "Paulo Coelho",
      wordCount: 45,
    },
    // Page 3: Table of Contents
    {
      id: 3,
      pageNumber: 3,
      isTableOfContents: true,
      chapterTitle: "Table of Contents",
      content: "Table of Contents",
      paragraphs: [],
      wordCount: 35,
    },
    // Page 4: Prologue
    {
      id: 4,
      pageNumber: 4,
      chapterTitle: "Prologue",
      chapterIndex: 0,
      content: "",
      paragraphs: [
        "The alchemist picked up a book that someone in the caravan had brought. Leafing through the pages, he found a story about Narcissus.",
        "The alchemist knew the legend of Narcissus, a youth who knelt daily beside a lake to contemplate his own beauty. He was so fascinated by himself that, one morning, he fell into the lake and drowned. At the spot where he fell, a flower was born, which was called the narcissus.",
        "But this was not how the author of the book ended the story.",
      ],
      wordCount: 120,
    },
    // Page 5: Prologue Cont.
    {
      id: 5,
      pageNumber: 5,
      chapterTitle: "Prologue",
      chapterIndex: 0,
      content: "",
      paragraphs: [
        "He said that when Narcissus died, the goddesses of the forest appeared and found the lake, which had been fresh water, transformed into a lake of salty tears.",
        "“Why do you weep?” the goddesses asked.",
        "“I weep for Narcissus,” the lake replied.",
        "“Ah, it is no surprise that you weep for Narcissus,” they said, “for though we always pursued him in the forest, you were the only one who could contemplate his beauty close at hand.”",
        "“Was Narcissus beautiful?” the lake asked.",
      ],
      wordCount: 130,
    },
    // Page 6: Prologue Conclusion
    {
      id: 6,
      pageNumber: 6,
      chapterTitle: "Prologue",
      chapterIndex: 0,
      content: "",
      paragraphs: [
        "“Who could know that better than you?” the goddesses asked in wonder. “After all, it was by your banks that he knelt each day!”",
        "The lake was silent for some time. Finally, it said: “I weep for Narcissus, but I never noticed that Narcissus was beautiful. I weep because each time he knelt by my banks, I could see, in the depths of his eyes, my own beauty reflected.”",
        "“What a lovely story,” the alchemist thought.",
      ],
      wordCount: 110,
    },
    // Page 7: Part One Introduction
    {
      id: 7,
      pageNumber: 7,
      chapterTitle: "Part One",
      content: "Part One",
      paragraphs: [
        "The boy's name was Santiago. Dusk was falling as the boy arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy had once stood.",
        "He decided to spend the night there. He saw to it that all the sheep entered through the ruined gate, and then laid some planks across it to prevent the flock from wandering away during the night.",
      ],
      wordCount: 115,
    },
    // Page 8: Santiago's Flocks
    {
      id: 8,
      pageNumber: 8,
      chapterTitle: "Part One",
      content: "",
      paragraphs: [
        "He swept the floor with his jacket and lay down, using the book he had just finished reading as a pillow. He told himself that he would have to start reading thicker books: they lasted longer, and made more comfortable pillows.",
        "When he woke, it was still dark, and looking up, he could see the stars through the half-destroyed roof. He had had the same dream that he had had a week ago, and once again he had awakened before it ended.",
      ],
      wordCount: 120,
    },
    // Page 9: Chapter 1 - The Two Dreams (Matches Image 3 & 4!)
    {
      id: 9,
      pageNumber: 9,
      chapterTitle: "The Two Dreams",
      chapterIndex: 1,
      content: "",
      paragraphs: [
        "The boy had a recurring dream.",
        "He dreamed that he was in Egypt, standing before the pyramids.",
        "In the dream, a treasure was hidden there. And each time he tried to reach it, something stopped him.",
        "One night, the boy decided to seek out an old king who was said to understand the language of dreams.",
        "“I keep dreaming about a treasure in the pyramids,” the boy told him.",
        "The king listened and smiled.",
      ],
      wordCount: 135,
    },
    // Page 10: Chapter 1 - Cont. (Matches Image 4!)
    {
      id: 10,
      pageNumber: 10,
      chapterTitle: "The Two Dreams",
      chapterIndex: 1,
      content: "",
      paragraphs: [
        "One night, the boy decided to seek out an old king who was said to understand the language of dreams.",
        "“I keep dreaming about a treasure in the pyramids,” the boy told him.",
        "The king listened and smiled.",
        "“When you want something, all the universe conspires in helping you to achieve it.”",
        "The boy asked, “How will I know it’s the treasure I’m meant to find?”",
        "The king replied, “Everything tells you something.”",
      ],
      wordCount: 140,
    },
    // Page 11: The Secret of Happiness
    {
      id: 11,
      pageNumber: 11,
      chapterTitle: "The Secret of Happiness",
      chapterIndex: 2,
      content: "",
      paragraphs: [
        "A certain shopkeeper sent his son to learn about the secret of happiness from the wisest man in the world. The lad wandered through the desert for forty days, and finally came upon a beautiful castle, high atop a mountain.",
        "There the sage lived. Instead of finding a saintly man, though, our hero entered a hall where activity abounded: tradesmen came and went, people were conversing in corners, and a small orchestra was playing soft melodies.",
      ],
      wordCount: 125,
    },
    // Page 12: The Drops of Oil
    {
      id: 12,
      pageNumber: 12,
      chapterTitle: "The Secret of Happiness",
      chapterIndex: 2,
      content: "",
      paragraphs: [
        "The wise man listened attentively to the boy's reason for coming, but told him he didn't have time just then to explain the secret of happiness. He suggested that the boy look around the palace and return in two hours.",
        "“Meanwhile, I want to ask you to do something,” said the wise man, handing the boy a teaspoon that held two drops of oil. “As you wander around, carry this spoon with you without spilling a drop of the oil.”",
      ],
      quote: "The secret of happiness is to see all the marvels of the world, and never to forget the two drops of oil on the spoon.",
      quoteAuthor: "The Wise Sage of the Mountain",
      wordCount: 145,
    },
    // Page 13: The Journey Across the Desert
    {
      id: 13,
      pageNumber: 13,
      chapterTitle: "The Desert Journey",
      chapterIndex: 3,
      content: "",
      paragraphs: [
        "The desert was vast and silent, an endless sea of sand shifting beneath the hooves of the camels. The boy rode alongside the Englishman, whose nose was perpetually buried in thick alchemical treatises.",
        "“I am trying to find the Alchemist,” the Englishman said. “He lives at the oasis of Al-Fayoum, and knows how to turn any metal into gold with the Philosopher's Stone.”",
      ],
      wordCount: 120,
    },
    // Page 14: The Language of the World
    {
      id: 14,
      pageNumber: 14,
      chapterTitle: "The Language of the World",
      chapterIndex: 4,
      content: "",
      paragraphs: [
        "The desert wind whispered secrets to those who knew how to listen. Santiago learned that the world had a soul, and that anyone who understood that soul could understand the language of things.",
        "He saw that lead would play its role until the world had no further need for lead; and then lead would have to turn itself into gold. That was what the alchemists did: they showed that, when we strive to become better than we are, everything around us becomes better, too.",
      ],
      wordCount: 130,
    },
    // Page 15: The Emerald Tablet
    {
      id: 15,
      pageNumber: 15,
      chapterTitle: "The Master Work",
      chapterIndex: 5,
      content: "",
      paragraphs: [
        "“What is the Emerald Tablet?” the boy asked.",
        "The alchemist took a stick and began to draw in the sand. “It is a direct passage to the Soul of the World. The ancient masters understood that the physical world is only an image and a copy of paradise. The existence of this world is simply a guarantee that there exists a world that is perfect.”",
      ],
      footnote: "* The Emerald Tablet is an ancient text attributed to Hermes Trismegistus.",
      wordCount: 110,
    },
    // Page 16: Epilogue & Finis
    {
      id: 16,
      pageNumber: 16,
      isBackCover: true,
      chapterTitle: "Epilogue",
      content: "",
      paragraphs: [
        "The boy dug in the roots of the sycamore at the abandoned church in Spain, laughing as his shovel struck the heavy wooden chest filled with ancient gold Spanish coins.",
        "“I am coming, Fatima,” he said.",
      ],
      wordCount: 85,
    },
  ];

  const chapters: Chapter[] = [
    { id: 'ch-prologue', title: 'Prologue', pageNumber: 4, previewSnippet: 'The alchemist picked up a book about Narcissus...' },
    { id: 'ch-1', title: 'Chapter 1: The Two Dreams', pageNumber: 9, previewSnippet: 'The boy had a recurring dream of Egypt...' },
    { id: 'ch-2', title: 'Chapter 2: The Secret of Happiness', pageNumber: 11, previewSnippet: 'A shopkeeper sent his son to learn about happiness...' },
    { id: 'ch-3', title: 'Chapter 3: The Desert Journey', pageNumber: 13, previewSnippet: 'The caravan moved across the silent sands...' },
    { id: 'ch-4', title: 'Chapter 4: The Language of the World', pageNumber: 14, previewSnippet: 'The boy learned the world had a soul...' },
    { id: 'ch-5', title: 'Chapter 5: The Master Work', pageNumber: 15, previewSnippet: 'The Emerald Tablet and the Soul of the World...' },
    { id: 'ch-6', title: 'Epilogue: The Hidden Treasure', pageNumber: 16, previewSnippet: 'Beneath the roots of the sycamore tree...' },
  ];

  return {
    id: 'book-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverTheme: 'navy-gold',
    coverSubtitle: 'A Fable About Following Your Dream • 16 Pages',
    fileType: 'sample',
    pages,
    chapters,
    bookmarks: [
      {
        id: 'bm-alch-1',
        pageNumber: 9,
        previewText: 'The boy had a recurring dream. He dreamed that he was in Egypt...',
        createdAt: Date.now() - 3600000,
        note: 'The Two Dreams chapter opening',
      },
    ],
    currentPage: 9,
    readingProgress: 45,
    totalWords: 2150,
    totalPages: 16,
    isFavorite: true,
    category: 'fiction',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  };
}

export function createAtomicHabitsBook(): Book {
  const text = `Chapter 1: The Surprising Power of Atomic Habits

Success is the product of daily habits—not once-in-a-lifetime transformations.

It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action. Whether it is losing weight, building a business, writing a book, winning a championship, or achieving any other goal, we put pressure on ourselves to make some earth-shattering improvement that everyone will talk about.

Meanwhile, improving by 1 percent isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful, especially in the long run. The difference a tiny improvement can make over time is astounding. Here's how the math works out: if you can get 1 percent better each day for one year, you'll end up thirty-seven times better by the time you're done.

Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous.

Chapter 2: How Your Habits Shape Your Identity

The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.

Your identity emerges out of your habits. Every action is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, the evidence of your new identity grows.

The real reason habits matter is not because they can get you better results (although they can do that), but because they can change your beliefs about yourself.

Chapter 3: The 4 Laws of Behavior Change

If you want to build a better habit, follow the Four Laws:
1. Make it Obvious.
2. Make it Attractive.
3. Make it Easy.
4. Make it Satisfying.

To break a bad habit, invert these rules: Make it invisible, unattractive, difficult, and unsatisfying.`;

  const book = createBookFromText(text, {
    title: 'Atomic Habits',
    author: 'James Clear',
    coverTheme: 'classic-leather',
    fileType: 'sample',
    wordsPerPage: 180,
  });
  book.id = 'book-atomic-habits';
  book.currentPage = 1;
  book.readingProgress = 12;
  book.isFavorite = true;
  book.category = 'self-help';
  return book;
}

export function createSapiensBook(): Book {
  const text = `Part One: The Cognitive Revolution

About 70,000 years ago, organisms belonging to the species Homo sapiens started to form even more elaborate structures called cultures. The subsequent development of these human cultures is called history.

Three important revolutions shaped the course of history: the Cognitive Revolution kick-started history about 70,000 years ago. The Agricultural Revolution sped it up about 12,000 years ago. The Scientific Revolution, which got under way only 500 years ago, may well end history and start something completely different.

What was the secret of Sapiens' success? How did we manage to settle in so many distant and ecologically diverse habitats so rapidly? The secret was our unique ability to speak about things that do not exist: fiction, myths, and shared stories.

Part Two: The Agricultural Revolution

For 2.5 million years humans fed themselves by gathering edible plants and hunting wild animals. All this changed some 10,000 years ago when Sapiens began to devote almost all their time and effort to manipulating the lives of a few animal and plant species.

This transition to agriculture was not necessarily an easier life. The average farmer worked harder than the average hunter-gatherer, and got a worse diet in return. The Agricultural Revolution was history's biggest fraud.`;

  const book = createBookFromText(text, {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    coverTheme: 'parchment-gold',
    fileType: 'sample',
    wordsPerPage: 190,
  });
  book.id = 'book-sapiens';
  book.currentPage = 1;
  book.readingProgress = 28;
  book.isFavorite = true;
  book.category = 'history';
  return book;
}

export function createPsychologyOfMoneyBook(): Book {
  const text = `Introduction: The Greatest Show On Earth

Doing well with money has a little to do with how smart you are and a lot to do with how you behave. And behavior is hard to teach, even to really smart people.

A genius who loses control of their emotions can be a financial disaster. The opposite is also true. Ordinary folks with no financial education can be wealthy if they have a handful of behavioral skills that have nothing to do with formal measures of intelligence.

Chapter 1: No One's Crazy

Your personal experiences with money make up maybe 0.00000001% of what’s happened in the world, but maybe 80% of how you think the world works.

People from different generations, raised by different parents who earned different incomes and held different values in different parts of the world, learn vastly different lessons.

Chapter 2: Luck & Risk

Nothing is as good or as bad as it seems. Luck and risk are both the reality that every outcome in life is guided by forces other than individual effort.`;

  const book = createBookFromText(text, {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    coverTheme: 'emerald-vintage',
    fileType: 'sample',
    wordsPerPage: 190,
  });
  book.id = 'book-psychology-money';
  book.currentPage = 1;
  book.readingProgress = 65;
  book.isFavorite = true;
  book.category = 'business';
  return book;
}

export function createThinkingFastAndSlowBook(): Book {
  const text = `Part 1: Two Systems

The characters of the story are two systems in the mind:
System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.
System 2 allocates attention to the effortful mental operations that demand it, including complex computations.

When we think of ourselves, we identify with System 2, the conscious, reasoning self that has beliefs, makes choices, and decides what to think about and what to do. But System 1 is the effortless originator of impressions and feelings that are the main sources of the explicit beliefs and deliberate choices of System 2.

The automatic operations of System 1 generate surprisingly complex patterns of ideas, but only the slower System 2 can construct thoughts in an orderly series of steps.`;

  const book = createBookFromText(text, {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverTheme: 'classic-leather',
    fileType: 'sample',
    wordsPerPage: 200,
  });
  book.id = 'book-thinking-fast-slow';
  book.category = 'science';
  return book;
}

export function createFourAgreementsBook(): Book {
  const text = `The Four Agreements: A Practical Guide to Personal Freedom

1. Be Impeccable With Your Word:
Speak with integrity. Say only what you mean. Avoid using the word to speak against yourself or to gossip about others. Use the power of your word in the direction of truth and love.

2. Don't Take Anything Personally:
Nothing others do is because of you. What others say and do is a projection of their own reality, their own dream. When you are immune to the opinions and actions of others, you won't be the victim of needless suffering.

3. Don't Make Assumptions:
Find the courage to ask questions and to express what you really want. Communicate with others as clearly as you can to avoid misunderstandings, sadness, and drama.

4. Always Do Your Best:
Your best is going to change from moment to moment; it will be different when you are healthy as opposed to sick. Under any circumstance, simply do your best, and you will avoid self-judgment, self-abuse, and regret.`;

  const book = createBookFromText(text, {
    title: 'The Four Agreements',
    author: 'Don Miguel Ruiz',
    coverTheme: 'burgundy-royal',
    fileType: 'sample',
    wordsPerPage: 180,
  });
  book.id = 'book-four-agreements';
  book.category = 'philosophy';
  return book;
}

export function createIkigaiBook(): Book {
  const text = `Ikigai: The Japanese Secret to a Long and Happy Life

According to the Japanese, everyone has an ikigai—a reason for being. Some people have found their ikigai, while others are still looking, though they carry it within them.

Our ikigai is hidden deep inside each of us, and finding it requires a patient search. As those from Okinawa—the island with the most centenarians in the world—will tell you, the key to a long and fulfilling life is finding your purpose and staying active until the very end.

The 10 Rules of Ikigai:
1. Stay active; don’t retire.
2. Take it slow.
3. Don’t fill your stomach (eat to 80% fullness).
4. Surround yourself with good friends.
5. Get in shape for your next birthday.
6. Smile.
7. Reconnect with nature.
8. Give thanks.
9. Live in the moment.
10. Follow your ikigai.`;

  const book = createBookFromText(text, {
    title: 'IKIGAI: The Japanese Secret to a Long and Happy Life',
    author: 'Héctor García & Francesc Miralles',
    coverTheme: 'navy-gold',
    fileType: 'sample',
    wordsPerPage: 180,
  });
  book.id = 'book-ikigai';
  book.category = 'lifestyle';
  return book;
}

export function createDeepWorkBook(): Book {
  const text = `Chapter 1: Deep Work Is Valuable

Deep work: Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value, improve your skill, and are hard to replicate.

Shallow work: Noncognitively demanding, logistical-style tasks, often performed while distracted. These efforts tend not to create much new value in the world and are easy to replicate.

In our current economy, the ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable. As a consequence, the few who cultivate this skill, and then make it the core of their working life, will thrive.`;

  const book = createBookFromText(text, {
    title: 'Deep Work',
    author: 'Cal Newport',
    coverTheme: 'burgundy-royal',
    fileType: 'sample',
    wordsPerPage: 190,
  });
  book.id = 'book-deep-work';
  book.category = 'business';
  return book;
}

export const SAMPLE_BOOKS: Book[] = [
  createTheAlchemistBook(),
  createAtomicHabitsBook(),
  createSapiensBook(),
  createPsychologyOfMoneyBook(),
  createThinkingFastAndSlowBook(),
  createFourAgreementsBook(),
  createIkigaiBook(),
  createDeepWorkBook(),
];
