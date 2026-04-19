export interface HabitQuote {
  text: string;
  author: string;
}

export const HABIT_QUOTES: HabitQuote[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Rohn" },
  { text: "Small habits make a big difference.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Sow a thought, reap an action; sow an action, reap a habit; sow a habit, reap a character; sow a character, reap a destiny.", author: "Stephen R. Covey" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Successful people are simply those with successful habits.", author: "Brian Tracy" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "First we make our habits, then our habits make us.", author: "John Dryden" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "Your net worth to the world is usually determined by what remains after your bad habits are subtracted from your good ones.", author: "Benjamin Franklin" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Habits are first cobwebs, then cables.", author: "Spanish Proverb" },
  { text: "Take care of your habits, for they will take care of your life.", author: "Unknown" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "You'll never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { text: "Habit is a cable; we weave a thread each day, and at last we cannot break it.", author: "Horace Mann" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Excellence is the gradual result of always striving to do better.", author: "Pat Riley" },
  { text: "Good habits formed at youth make all the difference.", author: "Aristotle" },
  { text: "Drop by drop fills the tub.", author: "Latin Proverb" },
  { text: "Habits change into character.", author: "Ovid" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "The only way to make a habit stick is to enjoy the doing of it.", author: "Unknown" },
  { text: "Bad habits are easier to abandon today than tomorrow.", author: "Yiddish Proverb" },
  { text: "Repetition is the mother of learning, the father of action, which makes it the architect of accomplishment.", author: "Zig Ziglar" },
  { text: "Be faithful in small things because it is in them that your strength lies.", author: "Mother Teresa" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Practice isn't the thing you do once you're good. It's the thing you do that makes you good.", author: "Malcolm Gladwell" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "How we spend our days is, of course, how we spend our lives.", author: "Annie Dillard" },
  { text: "Showing up consistently is more important than showing up perfectly.", author: "Unknown" },
];

export function pickHabitQuote(seed?: number): HabitQuote {
  const i = (seed ?? Date.now()) % HABIT_QUOTES.length;
  return HABIT_QUOTES[Math.abs(Math.floor(i))];
}
