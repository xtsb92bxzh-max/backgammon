import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Check, BookOpen, RotateCcw, Lightbulb } from 'lucide-react';
import { apply, turns } from './engine.js';
import { curriculum, sameBoard, targetFor } from './curriculum.js';
import { selectLesson, completeLesson } from './progress.js';

export function LessonSelector({ progress, onProgress, label = 'Choose your lesson', id = 'training-lesson' }) {
  return <div className="lesson-selector">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={progress.training.currentLesson} onChange={event => onProgress(selectLesson(progress, event.target.value))}>
      {curriculum.map((lesson, index) => <option key={lesson.id} value={lesson.id}>
        {index + 1}. {lesson.title}{progress.training.completed.includes(lesson.id) ? ' — completed' : ''}
      </option>)}
    </select>
    <p>Start at lesson 1, or choose where you’re up to. You can revisit any lesson.</p>
  </div>;
}

export function TrainingProgress({ progress, onProgress, onLearn }) {
  return <section className="training-progress practice-card">
    <div className="section-heading"><div><h2>Your beginner journey</h2><p>{progress.training.completed.length} of {curriculum.length} lessons completed</p></div><BookOpen size={24}/></div>
    <LessonSelector progress={progress} onProgress={onProgress} id="progress-lesson" label="I’m up to this lesson"/>
    <button className="primary" onClick={onLearn}>Continue this lesson <ArrowRight size={16}/></button>
    <div className="curriculum-list">
      {curriculum.map((lesson, index) => <button key={lesson.id} className="curriculum-row" onClick={() => { onProgress(selectLesson(progress, lesson.id)); onLearn(); }}>
        <span className={progress.training.completed.includes(lesson.id) ? 'complete-circle' : 'empty-circle'}>
          {progress.training.completed.includes(lesson.id) ? <Check size={18}/> : index + 1}
        </span><span><b>{lesson.title}</b><small>{lesson.summary}</small></span><ArrowRight size={16}/>
      </button>)}
    </div>
  </section>;
}

export default function BeginnerTraining({ progress, onProgress, onPractice }) {
  const index = curriculum.findIndex(lesson => lesson.id === progress.training.currentLesson);
  const lesson = curriculum[index];
  const [board, setBoard] = useState(lesson.setup);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [hint, setHint] = useState(false);
  const [moveMessage, setMoveMessage] = useState('');
  const paths = lesson.best ? turns(lesson.setup(), lesson.dice) : [];
  const compatible = paths.filter(path => history.every((move, i) => path[i]?.from === move.from && path[i]?.to === move.to && path[i]?.die === move.die));
  const next = compatible.flatMap(path => path[history.length] ? [path[history.length]] : []);
  const destinations = next.filter(move => move.from === selected);
  const finished = !!lesson.best && next.length === 0;
  const practiceCorrect = !lesson.best || (finished && sameBoard(board, targetFor(lesson)));
  const completed = progress.training.completed.includes(lesson.id);
  const remaining = [...lesson.dice];
  history.forEach(move => remaining.splice(remaining.indexOf(move.die), 1));

  function move(point) {
    if (!lesson.best || finished) return;
    const candidate = destinations.find(m => m.to === point);
    if (candidate) {
      setBoard(apply(board, candidate)); setHistory([...history, candidate]); setSelected(null); setMoveMessage('');
    } else if (next.some(m => m.from === point)) {
      setSelected(point); setMoveMessage('');
    } else {
      setMoveMessage(board.p[point] <= -2 ? `Point ${point} is closed by two or more dark checkers. Choose another landing.` : 'Tap a white checker with a legal move, then one of its highlighted destinations.');
    }
  }

  function restart() { setBoard(lesson.setup()); setHistory([]); setSelected(null); setMoveMessage(''); }
  function undo() {
    const previous = history.slice(0, -1);
    setHistory(previous); setBoard(previous.reduce(apply, lesson.setup())); setSelected(null); setMoveMessage('');
  }

  function point(n, top) {
    const value = board.p[n];
    const legal = destinations.some(m => m.to === n);
    const available = next.some(m => m.from === n);
    return <button key={n} disabled={!lesson.best} aria-label={`Training point ${n}, ${Math.abs(value)} ${value < 0 ? 'opponent' : 'your'} checkers${legal ? ', legal destination' : ''}`}
      onClick={() => move(n)} className={`point ${top ? 'top' : 'bottom'}${selected === n ? ' selected' : ''}${legal ? ' legal' : ''}${available ? ' available' : ''}${n <= 6 ? ' home-point' : ''}`}>
      <span className="point-number">{n}</span><span className={`triangle ${n % 2 ? 'dark' : 'light'}`}/>
      <span className="checker-stack">{Array.from({ length: Math.min(Math.abs(value), 5) }, (_, i) => <span key={i} className={`checker ${value < 0 ? 'black' : 'white'}`}>{i === 4 && Math.abs(value) > 5 ? Math.abs(value) : ''}</span>)}</span>
      {legal && <span className="target-dot"/>}
    </button>;
  }

  return <section className="beginner-training">
    <div className="training-checkpoint">
      <LessonSelector progress={progress} onProgress={onProgress}/>
      <span className="checkpoint-count">{progress.training.completed.length} / {curriculum.length} completed</span>
    </div>
    <div className="beginner-layout">
      <article className="training-explanation practice-card">
        <span className="lesson-chip">START FROM ZERO · LESSON {index + 1} OF {curriculum.length}</span>
        <h2 tabIndex={-1}>{lesson.title}</h2>
        {lesson.paragraphs.map(text => <p key={text}>{text}</p>)}
        <fieldset className="lesson-quiz">
          <legend>Quick check: {lesson.question}</legend>
          {lesson.answers.map((text, i) => <label key={text} className={`quiz-option${answer === i ? ' chosen' : ''}`}>
            <input type="radio" name={`quiz-${lesson.id}`} checked={answer === i} onChange={() => { setAnswer(i); setQuizResult(null); }}/><span>{text}</span>
          </label>)}
          <button className="primary" disabled={answer === null || quizResult === true} onClick={() => setQuizResult(answer === lesson.correctAnswer)}>Check answer <Check size={16}/></button>
          {quizResult !== null && <div className={`feedback${quizResult ? ' success' : ''}`} role="status">
            <b>{quizResult ? 'That’s right.' : 'Give it another try.'}</b><p>{lesson.answerExplanation}</p>
          </div>}
        </fieldset>
      </article>
      <section className="training-practice practice-card" aria-label="Lesson practice board">
        <div className="card-heading"><div><span className="small-label">{lesson.best ? 'TRY IT ON THE BOARD' : 'YOUR FIRST LOOK'}</span><h2>{lesson.best ? 'One idea. One small practice.' : 'Your board, explained.'}</h2></div></div>
        <div className="training-instruction" aria-live="polite">
          {practiceCorrect && lesson.best ? 'You did it! Now answer the quick check and save this lesson.' : selected === 25 ? 'Your bar checker is selected. Tap a highlighted entry point.' : selected ? `Point ${selected} is selected. Tap a highlighted destination${destinations.some(m => m.to === 0) ? ' or Bear off' : ''}.` : lesson.instruction}
        </div>
        <div className="board-shell"><div className="board training-board">
          <div className="half-board"><div className="point-row">{[13, 14, 15, 16, 17, 18].map(n => point(n, true))}</div><div className="point-row">{[12, 11, 10, 9, 8, 7].map(n => point(n, false))}</div></div>
          <div className="bar"><span className="training-bar-label">BAR</span>
            {board.bar > 0 && <button className={`checker white${selected === 25 ? ' selected-bar' : ''}`} aria-label="Select your checker on the bar" onClick={() => move(25)}>{board.bar}</button>}
            {board.enemyBar > 0 && <span className="checker black" title="Opponent checkers on the bar">{board.enemyBar}</span>}
          </div>
          <div className="half-board"><div className="point-row">{[19, 20, 21, 22, 23, 24].map(n => point(n, true))}</div><div className="point-row home-row">{[6, 5, 4, 3, 2, 1].map(n => point(n, false))}</div></div>
        </div></div>
        <div className="board-key"><span><i className="white-key"/>You: white</span><span><i className="black-key"/>Opponent: dark</span><span>Home: points 1–6</span></div>
        <p className="training-position-note">{index === 0 || lesson.id === 'opening' ? 'Standard starting position · white moves toward smaller numbers.' : `Simplified position · ${lesson.setup().off} white checkers already off.`}</p>
        <div className="training-counters" aria-live="polite"><span>Your checkers on bar: <b>{board.bar}</b></span><span>Opponent on bar: <b>{board.enemyBar}</b></span><span>Your checkers off: <b>{board.off}</b></span></div>
        {lesson.best && <>
          <div className="training-move-controls"><span><b>Dice to use:</b> {remaining.length ? remaining.join(' · ') : 'all used'}</span>
            <button className="icon-button" aria-label="Undo training move" onClick={undo} disabled={!history.length}><RotateCcw size={17}/></button>
            <button className="training-secondary" onClick={() => move(0)} disabled={!destinations.some(m => m.to === 0)}>Bear off</button>
          </div>
          <div className="training-tools"><button onClick={() => setHint(!hint)}><Lightbulb size={16}/>{hint ? 'Hide hint' : 'Show me how'}</button><button onClick={restart}>Try again</button></div>
          {hint && <p className="training-hint">{lesson.hint}</p>}
          {moveMessage && <p className="training-hint" role="status">{moveMessage}</p>}
          {finished && !practiceCorrect && <p className="training-hint" role="status">Those moves are legal, but try the lesson’s goal. Tap Try again and use Show me how for a step-by-step hint.</p>}
        </>}
      </section>
    </div>
    <div className="training-next">
      <button className="training-secondary" disabled={index === 0} onClick={() => onProgress(selectLesson(progress, curriculum[index - 1].id))}><ChevronLeft size={16}/>Previous lesson</button>
      <div aria-live="polite"><b>{completed ? 'Lesson saved as complete' : practiceCorrect && quizResult ? 'Ready to save this lesson' : lesson.best ? 'Answer the quick check and finish the board exercise.' : 'Answer the quick check to finish this lesson.'}</b><small>Completion is saved here. Selecting a lesson does not complete earlier lessons.</small></div>
      {completed ? <button className="primary" onClick={() => index + 1 < curriculum.length ? onProgress(selectLesson(progress, curriculum[index + 1].id)) : onPractice()}>{index + 1 < curriculum.length ? 'Next lesson' : 'Try opening practice'}<ArrowRight size={16}/></button> : <button className="primary" disabled={!practiceCorrect || quizResult !== true} onClick={() => onProgress(completeLesson(progress, lesson.id))}>Save lesson as complete <Check size={16}/></button>}
    </div>
  </section>;
}
