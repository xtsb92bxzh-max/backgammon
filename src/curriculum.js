import { initialBoard, apply, exercises } from './engine.js';

function position(points, bar = 0) {
  const p = Array(25).fill(0);
  for (const [point, count] of Object.entries(points)) p[Number(point)] = count;
  return { p, bar, enemyBar: 0, off: 15 - bar - p.filter(n => n > 0).reduce((a, b) => a + b, 0) };
}

export const curriculum = [
  {
    id: 'board', title: 'Meet the board', summary: 'The pieces, the board, and how to win.',
    paragraphs: [
      'Backgammon is a race for two players. Each player starts with 15 round pieces called checkers. In this app you play the white checkers; the dark checkers belong to your opponent.',
      'The 24 triangles are called points. A point can hold several checkers. The raised strip down the middle is the bar. Your home board is points 1–6, highlighted below.',
      'Your goal is to move all your checkers into your home board, then remove them from the board. Removing a checker is called bearing off. The first player to bear off all 15 wins.'
    ],
    question: 'How do you win a game of backgammon?',
    answers: ['Bear off all 15 of your checkers first', 'Capture all the opponent’s checkers', 'Keep every checker on its starting point'], correctAnswer: 0,
    answerExplanation: 'Bring your checkers home, then bear them off. Hitting an opponent helps you race, but capturing checkers is not the goal.',
    setup: initialBoard, dice: [], instruction: 'Explore the starting board. White starts with 2 checkers on 24, 5 on 13, 3 on 8, and 5 on 6.'
  },
  {
    id: 'movement', title: 'Move your first checker', summary: 'Count spaces and follow the direction of play.',
    paragraphs: [
      'Your white checkers move toward smaller point numbers: 24, 23, 22, and so on, down to 1. The path bends around the board; you do not always move left or always right on the screen. Your opponent travels the other way.',
      'A die tells you how many points to move. With a 3, a checker on point 8 moves to point 5: count 7, 6, 5. Do not count the point you started on. We will use just one die in this first exercise.'
    ],
    question: 'A white checker is on point 8. Where does a die showing 3 take it?',
    answers: ['Point 11', 'Point 5', 'Point 3'], correctAnswer: 1,
    answerExplanation: 'Count three spaces toward lower numbers: 7, 6, 5.',
    setup: () => position({ 8: 1 }), dice: [3], best: [{ from: 8, to: 5, die: 3 }],
    instruction: 'Tap the white checker on point 8, then tap highlighted point 5.', hint: '8 minus 3 is 5. Tap 8, then 5.'
  },
  {
    id: 'dice', title: 'Use both dice', summary: 'Two dice mean two separate moves.',
    paragraphs: [
      'On a normal turn you roll two dice. You can move two different checkers, or move the same checker twice. Each die is a separate move, and each landing point must be legal.',
      'You must use both dice if a legal way exists, even if that means changing the order. If you can use either die but not both, use the larger one. If neither die can be used, your turn ends. Here, play 3 and 1 in either order to move from 8 to 4.'
    ],
    question: 'Can one checker use both dice in a turn?',
    answers: ['Yes, if both separate landings are legal', 'No, you must use two different checkers', 'Yes, without checking the intermediate landing'], correctAnswer: 0,
    answerExplanation: 'One checker may move twice. You must be allowed to land after each die, not just after adding the two numbers together.',
    setup: () => position({ 8: 1 }), dice: [3, 1], best: [{ from: 8, to: 5, die: 3 }, { from: 5, to: 4, die: 1 }],
    instruction: 'Move the checker from 8 to 4 using both dice. Tap it again after its first move.', hint: 'Try 8 to 5 with the 3, then 5 to 4 with the 1.'
  },
  {
    id: 'points', title: 'Know where you can land', summary: 'Two opposing checkers close a point.',
    paragraphs: [
      'You may land on an empty point or on a point occupied by your own checkers. A point with two or more opponent checkers is closed: you cannot land there. You may pass over closed points if your landing point is open.',
      'Putting at least two of your own checkers together makes a point that blocks your opponent. In this exercise, dark checkers close point 5. A 3 cannot move your checker from 8 to 5, but your checker on 6 can move to 3.'
    ],
    question: 'Can you land on a point with two opponent checkers?',
    answers: ['Yes, and hit both of them', 'No, that point is closed', 'Only if you roll doubles'], correctAnswer: 1,
    answerExplanation: 'Two or more opposing checkers block a landing. They do not block a move that passes over them.',
    setup: () => position({ 8: 1, 6: 1, 5: -2 }), dice: [3], best: [{ from: 6, to: 3, die: 3 }],
    instruction: 'Use the 3 without landing on the two dark checkers. Find a white checker with a legal move.', hint: 'The checker on 6 can move to 3. The checker on 8 is blocked by point 5.'
  },
  {
    id: 'hitting', title: 'Hit a single checker', summary: 'Learn about blots and the bar.',
    paragraphs: [
      'A single checker sitting alone on a point is called a blot. You can land on an opponent’s blot. This is a hit: their checker goes to the bar, and yours takes its place.',
      'Your own single checkers can be hit too. Making a point with two checkers protects them. Here the dark checker on point 5 is a blot: move your white checker from 8 to 5 with a 3.'
    ],
    question: 'What happens when you land on one opponent checker?',
    answers: ['Their checker goes to the bar', 'Their checker leaves the game permanently', 'Both checkers are removed'], correctAnswer: 0,
    answerExplanation: 'A hit checker goes to the bar and must re-enter the board. It is not permanently removed.',
    setup: () => position({ 8: 1, 5: -1 }), dice: [3], best: [{ from: 8, to: 5, die: 3 }],
    instruction: 'Tap 8, then 5 to hit the dark blot. Watch the opponent’s bar count.', hint: 'One dark checker is vulnerable. Land on it with 8 to 5.'
  },
  {
    id: 'bar', title: 'Return from the bar', summary: 'Re-enter before moving other checkers.',
    paragraphs: [
      'If one of your checkers is hit, it waits on the bar. You must bring all your bar checkers back onto the board before moving any others. White re-enters on the opponent’s home board: a 1 enters on 24, a 2 on 23, through to a 6 on 19.',
      'The landing must still be open. If neither die can enter, you lose the turn. After your last bar checker enters, use any remaining playable dice. Here a 3 cannot enter on closed point 22, so use the 1 to enter on 24 first, then the 3 to move to 21.'
    ],
    question: 'You have a checker on the bar. What must you do first?',
    answers: ['Move any checker you like', 'Re-enter the bar checker', 'Bear off a checker'], correctAnswer: 1,
    answerExplanation: 'Bar checkers have priority. You must re-enter them before moving checkers already on the board.',
    setup: () => position({ 22: -2 }, 1), dice: [1, 3], best: [{ from: 25, to: 24, die: 1 }, { from: 24, to: 21, die: 3 }],
    instruction: 'Tap your white checker on the bar, then point 24. Use the remaining 3 to move it to 21.', hint: 'Bar to 24 uses the 1. Then tap 24 and 21 to use the 3.'
  },
  {
    id: 'doubles', title: 'Play doubles', summary: 'Matching dice give four moves.',
    paragraphs: [
      'When both dice show the same number, you have rolled doubles. You play that number four times. Two 2s give four moves of two points each.',
      'You can spread those moves across different checkers, or move the same checker again. Use all four moves if possible; otherwise use as many as you legally can. This exercise moves one checker from 13 to 5 in four small steps.'
    ],
    question: 'How many moves of two points do double 2s give you?',
    answers: ['Two moves', 'Four moves', 'One move of four points'], correctAnswer: 1,
    answerExplanation: 'Doubles give four uses of the number shown. Double 2s mean four separate moves of two points.',
    setup: () => position({ 13: 1 }), dice: [2, 2, 2, 2], best: [13, 11, 9, 7].map(from => ({ from, to: from - 2, die: 2 })),
    instruction: 'Move the white checker four times: 13 to 11 to 9 to 7 to 5.', hint: 'Tap the checker at each new point, then the highlighted point two spaces lower.'
  },
  {
    id: 'bearing-off', title: 'Bring them home and bear off', summary: 'Remove your checkers to win the race.',
    paragraphs: [
      'You can start bearing off only when every checker still in play is in your home board, points 1–6, with none on the bar. A 3 can remove a checker from point 3. You can also use a die to move within the home board.',
      'A larger die can remove a checker from a lower point only if no checker sits on a higher point. If a checker is hit while you are bearing off, re-enter it and bring it home before bearing off again. In this exercise, 14 checkers are already off and the last checker is on point 3.'
    ],
    question: 'When can you start bearing off?',
    answers: ['As soon as one checker reaches point 1', 'When all your remaining checkers are home and none are on the bar', 'Whenever you roll a 6'], correctAnswer: 1,
    answerExplanation: 'All your checkers still in play must be on points 1–6. A checker outside home or on the bar prevents bearing off.',
    setup: () => position({ 3: 1 }), dice: [3], best: [{ from: 3, to: 0, die: 3 }],
    instruction: 'Tap your last white checker on 3, then tap Bear off to finish the race.', hint: 'A 3 bears off a checker from point 3. Select it, then choose Bear off.'
  },
  {
    id: 'opening', title: 'Try your first opening', summary: 'Put your new rules into practice.',
    paragraphs: [
      'To start a real game, each player rolls one die. If the numbers tie, both roll again. The player with the higher number goes first and uses both numbers already rolled. After that, players alternate turns, rolling two dice each turn.',
      'For an opening 3–1, move 8 to 5 with the 3 and 6 to 5 with the 1. You make your 5-point: two checkers together, protected from hits and blocking your opponent’s landing. Move notation writes this as 8/5 · 6/5.',
      'You now know the core rules. The opening practice board offers three useful openings to learn next. It teaches individual positions; it does not play a whole game against you. The cube marked 64 is for optional doubling stakes, which you can leave aside while learning the basic game.'
    ],
    question: 'Who starts a real game?',
    answers: ['The player whose single opening die is higher, using both dice', 'White always starts', 'The first player to roll doubles'], correctAnswer: 0,
    answerExplanation: 'Each player rolls one die. The higher roll starts with those two numbers; ties are rolled again.',
    setup: initialBoard, dice: [3, 1], best: exercises[0].best,
    instruction: 'Make your 5-point: move 8 to 5 and 6 to 5, in either order.', hint: exercises[0].hint
  }
];

export const lessonIds = curriculum.map(lesson => lesson.id);
export const openingIds = exercises.map(exercise => exercise.id);
export function targetFor(lesson) { return lesson.best?.reduce(apply, lesson.setup()); }
export function sameBoard(a, b) {
  return !!a && !!b && a.bar === b.bar && a.enemyBar === b.enemyBar && a.off === b.off && a.p.every((n, i) => n === b.p[i]);
}
