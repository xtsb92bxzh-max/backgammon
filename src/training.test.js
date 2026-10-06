import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, turns } from './engine.js';
import { curriculum, lessonIds, sameBoard, targetFor } from './curriculum.js';
import { newProgress, normalizeProgress, readProgress, saveProgress, selectLesson, completeLesson, progressStorageAvailable } from './progress.js';

test('every beginner exercise has a legal complete solution and preserves 15 white checkers', () => {
  assert.equal(new Set(lessonIds).size, curriculum.length);
  for (const lesson of curriculum) {
    const start = lesson.setup();
    assert.equal(start.off + start.bar + start.p.filter(n => n > 0).reduce((a, b) => a + b, 0), 15, lesson.id);
    assert.ok(lesson.answers[lesson.correctAnswer], lesson.id);
    if (!lesson.best) continue;
    const paths = turns(start, lesson.dice);
    assert.ok(paths.some(path => JSON.stringify(path) === JSON.stringify(lesson.best)), lesson.id);
    assert.ok(paths.some(path => sameBoard(path.reduce(apply, start), targetFor(lesson))), lesson.id);
    assert.deepEqual(lesson.setup(), start, 'Creating a lesson board must not retain earlier moves');
  }
});

test('the first opening accepts the two recommended moves in either order', () => {
  const lesson = curriculum.at(-1);
  const reversed = [...lesson.best].reverse().reduce(apply, lesson.setup());
  assert.ok(sameBoard(reversed, targetFor(lesson)));
});

test('old opening progress gains a beginner checkpoint without losing achievements', () => {
  const migrated = normalizeProgress({ completed: ['opening31'], attempts: 4, correct: 3, days: ['2026-10-06'] });
  assert.deepEqual(migrated.completed, ['opening31']);
  assert.equal(migrated.attempts, 4); assert.equal(migrated.correct, 3);
  assert.deepEqual(migrated.days, ['2026-10-06']);
  assert.deepEqual(migrated.training, { currentLesson: 'board', completed: [] });
});

test('choosing a later lesson saves the checkpoint without completing earlier lessons', () => {
  const original = newProgress();
  const updated = selectLesson(original, 'bar');
  assert.equal(updated.training.currentLesson, 'bar');
  assert.deepEqual(updated.training.completed, []);
  assert.equal(original.training.currentLesson, 'board');
  assert.equal(selectLesson(original, 'missing'), original);
});

test('completion is idempotent and never inflates opening accuracy', () => {
  const progress = completeLesson(completeLesson(newProgress(), 'board'), 'board');
  assert.deepEqual(progress.training.completed, ['board']);
  assert.equal(progress.days.length, 1);
  assert.equal(progress.attempts, 0); assert.equal(progress.correct, 0);
});

test('a selected checkpoint and completions survive saving and reading', () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (key, next) => { assert.equal(key, 'bg-progress'); value = next; } };
  const progress = selectLesson(completeLesson(newProgress(), 'board'), 'dice');
  assert.equal(saveProgress(progress, storage), true);
  assert.deepEqual(readProgress(storage), progress);
});

test('corrupt or unavailable browser storage does not crash learning', () => {
  assert.deepEqual(readProgress({ getItem: () => '{bad json' }), newProgress());
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
  assert.deepEqual(readProgress(blocked), newProgress());
  assert.equal(progressStorageAvailable(blocked), false);
  assert.equal(saveProgress(newProgress(), blocked), false);
  const normalized = normalizeProgress({ completed: 'bad', attempts: -1, correct: 20, days: [null], training: { currentLesson: 'obsolete', completed: ['board', 'board', 'obsolete'] } });
  assert.equal(normalized.training.currentLesson, 'board');
  assert.deepEqual(normalized.training.completed, ['board']);
  assert.equal(normalized.correct, 0);
});
