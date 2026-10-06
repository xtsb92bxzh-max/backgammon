import { lessonIds, openingIds } from './curriculum.js';

export function newProgress() {
  return { completed: [], attempts: 0, correct: 0, days: [], training: { currentLesson: lessonIds[0], completed: [] } };
}

export function normalizeProgress(value) {
  const defaults = newProgress();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  const unique = (list, allowed) => Array.isArray(list) ? [...new Set(list.filter(id => allowed.includes(id)))] : [];
  const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
  const attempts = count(value.attempts);
  return {
    completed: unique(value.completed, openingIds), attempts, correct: Math.min(count(value.correct), attempts),
    days: Array.isArray(value.days) ? [...new Set(value.days.filter(day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)))] : [],
    training: {
      currentLesson: lessonIds.includes(value.training?.currentLesson) ? value.training.currentLesson : defaults.training.currentLesson,
      completed: unique(value.training?.completed, lessonIds)
    }
  };
}

export function readProgress(storage) {
  try { return normalizeProgress(JSON.parse((storage ?? globalThis.localStorage).getItem('bg-progress'))); }
  catch { return newProgress(); }
}

export function progressStorageAvailable(storage) {
  try { (storage ?? globalThis.localStorage).getItem('bg-progress'); return true; }
  catch { return false; }
}

export function saveProgress(progress, storage) {
  try { (storage ?? globalThis.localStorage).setItem('bg-progress', JSON.stringify(progress)); return true; }
  catch { return false; }
}

export function selectLesson(progress, id) {
  if (!lessonIds.includes(id)) return progress;
  return { ...progress, training: { ...progress.training, currentLesson: id } };
}

export function completeLesson(progress, id) {
  if (!lessonIds.includes(id)) return progress;
  return {
    ...progress,
    days: [...new Set([...progress.days, new Date().toISOString().slice(0, 10)])],
    training: { ...progress.training, completed: [...new Set([...progress.training.completed, id])] }
  };
}
