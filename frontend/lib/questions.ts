/**
 * Mini Personality Test
 * 9 questions, 3 dimensions
 * Each dimension: 3 questions, score 0-3
 */

export interface Question {
  id: number;
  text: string;
  dimension: "M" | "E" | "N"; // Mind, Energy, Nature
}

export const QUESTIONS: Question[] = [
  // Mind (M): Analytical vs Intuitive - 3 questions (bits 0-2)
  { id: 1, text: "I prefer logical reasoning over gut feelings", dimension: "M" },
  { id: 2, text: "I enjoy solving complex puzzles", dimension: "M" },
  { id: 3, text: "I make decisions based on facts, not emotions", dimension: "M" },

  // Energy (E): Outgoing vs Reserved - 3 questions (bits 3-5)
  { id: 4, text: "I feel energized after social events", dimension: "E" },
  { id: 5, text: "I enjoy being the center of attention", dimension: "E" },
  { id: 6, text: "I prefer working in teams over working alone", dimension: "E" },

  // Nature (N): Structured vs Flexible - 3 questions (bits 6-8)
  { id: 7, text: "I prefer having a detailed plan", dimension: "N" },
  { id: 8, text: "I like to follow schedules and routines", dimension: "N" },
  { id: 9, text: "I prefer clear rules over improvisation", dimension: "N" },
];

export const DIMENSIONS = {
  M: { name: "Mind", low: "Intuitive", high: "Analytical", emoji: "🧠", max: 3 },
  E: { name: "Energy", low: "Reserved", high: "Outgoing", emoji: "⚡", max: 3 },
  N: { name: "Nature", low: "Flexible", high: "Structured", emoji: "🎯", max: 3 },
};
