import { useState, useEffect, useCallback } from 'react';

// ==================== ЗВУКИ ====================
const playSound = (type: 'correct' | 'wrong' | 'reveal' | 'win' | 'tick') => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'correct':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        break;
      case 'wrong':
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'reveal':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'win':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        break;
      case 'tick':
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch {
    // Звук не поддерживается
  }
};

// ==================== ТИПЫ ====================
type GameScreen = 'start' | 'round-intro' | 'flag' | 'true-false' | 'emoji' | 'blitz' | 'final';
type Team = 'team1' | 'team2' | 'team3';

interface Scores {
  team1: number;
  team2: number;
  team3: number;
}

interface FlagQuestion {
  flag: string;
  options: string[];
  correct: number;
  funFact: string;
}

interface TrueFalseQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

interface EmojiQuestion {
  emojis: string;
  answer: string;
  options: string[];
  correct: number;
}

interface BlitzQuestion {
  question: string;
  options: string[];
  correct: number;
}

// ==================== ДАННЫЕ ====================
const flagQuestions: FlagQuestion[] = [
  { flag: '🇯🇵', options: ['Китай', 'Япония', 'Корея', 'Вьетнам'], correct: 1, funFact: 'Япония — страна восходящего солнца ☀️' },
  { flag: '🇧🇷', options: ['Аргентина', 'Колумбия', 'Бразилия', 'Перу'], correct: 2, funFact: 'В Бразилии больше всего футбольных стадионов в мире ⚽' },
  { flag: '🇮🇹', options: ['Франция', 'Ирландия', 'Мексика', 'Италия'], correct: 3, funFact: 'Италия имеет больше всего объектов ЮНЕСКО в мире 🏛️' },
  { flag: '🇨🇦', options: ['Канада', 'Дания', 'Норвегия', 'Швеция'], correct: 0, funFact: 'В Канаде больше озёр, чем во всех остальных странах вместе 🏔️' },
  { flag: '🇦🇺', options: ['Новая Зеландия', 'Индонезия', 'Австралия', 'Фиджи'], correct: 2, funFact: 'Австралия — единственный континент-страна 🦘' },
  { flag: '🇪🇬', options: ['Ливия', 'Египет', 'Судан', 'Саудовская Аравия'], correct: 1, funFact: 'Пирамиды строили не рабы, а наёмные рабочие! 🏗️' },
];

const trueFalseQuestions: TrueFalseQuestion[] = [
  { statement: 'В России больше всего часовых зон в мире', isTrue: true, explanation: 'В России 11 часовых зон — это рекорд! 🕐' },
  { statement: 'Мёртвое море настолько солёное, что в нём невозможно утонуть', isTrue: true, explanation: 'Солёность 34% — вы буквально лежите на воде! 🏊' },
  { statement: 'Африка — это страна', isTrue: false, explanation: 'Африка — это континент с 54 странами! 🌍' },
  { statement: 'Самая длинная река в мире — Нил', isTrue: false, explanation: 'По последним данным — Амазонка! Но учёные до сих пор спорят 🤷' },
  { statement: 'В Антарктиде есть действующий вулкан', isTrue: true, explanation: 'Вулкан Эребус извергается уже более 100 лет! 🌋' },
  { statement: 'Озеро Байкал содержит 20% всей пресной воды планеты', isTrue: true, explanation: 'Самое глубокое озеро в мире — 1642 метра! 💧' },
];

const emojiQuestions: EmojiQuestion[] = [
  { emojis: '🗼🥐🍷', answer: 'Франция', options: ['Италия', 'Франция', 'Испания', 'Бельгия'], correct: 1 },
  { emojis: '🏜️🐫🔺', answer: 'Египет', options: ['Марокко', 'Саудовская Аравия', 'Египет', 'ОАЭ'], correct: 2 },
  { emojis: '🗽🍔🎬', answer: 'США', options: ['Канада', 'США', 'Мексика', 'Англия'], correct: 1 },
  { emojis: '🦘🏄‍♂️🪃', answer: 'Австралия', options: ['Новая Зеландия', 'Гавайи', 'Австралия', 'ЮАР'], correct: 2 },
  { emojis: '🍣🗾🌸', answer: 'Япония', options: ['Китай', 'Таиланд', 'Япония', 'Корея'], correct: 2 },
  { emojis: '🎭🏛️🫒', answer: 'Греция', options: ['Италия', 'Греция', 'Турция', 'Хорватия'], correct: 1 },
];

const blitzQuestions: BlitzQuestion[] = [
  { question: 'Самая большая страна в мире по площади?', options: ['Канада', 'Китай', 'Россия', 'США'], correct: 2 },
  { question: 'Столица Австралии?', options: ['Сидней', 'Мельбурн', 'Канберра', 'Перт'], correct: 2 },
  { question: 'Какой океан самый большой?', options: ['Атлантический', 'Тихий', 'Индийский', 'Северный Ледовитый'], correct: 1 },
  { question: 'Сколько континентов на Земле?', options: ['5', '6', '7', '8'], correct: 2 },
  { question: 'Самый маленький материк?', options: ['Европа', 'Антарктида', 'Австралия', 'Южная Америка'], correct: 2 },
  { question: 'В какой стране находится самый большой водопад (по ширине)?', options: ['Бразилия', 'Замбия/Зимбабве', 'США', 'Канада'], correct: 1 },
  { question: 'Какая страна имеет форму сапога?', options: ['Греция', 'Италия', 'Португалия', 'Чили'], correct: 1 },
  { question: 'Самое глубокое озеро в мире?', options: ['Каспийское', 'Танганьика', 'Байкал', 'Виктория'], correct: 2 },
];

// ==================== КОМПОНЕНТ ====================
export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [teamNames, setTeamNames] = useState({ team1: 'Ряд 1', team2: 'Ряд 2', team3: 'Ряд 3' });
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0, team3: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [blitzTimer, setBlitzTimer] = useState(15);
  const [blitzActive, setBlitzActive] = useState(false);
  const [answeredTeams, setAnsweredTeams] = useState<Set<Team>>(new Set());
  const [roundScores, setRoundScores] = useState<Scores>({ team1: 0, team2: 0, team3: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [confetti, setConfetti] = useState(false);

  const rounds: GameScreen[] = ['flag', 'true-false', 'emoji', 'blitz'];
  const roundNames = ['🏳️ Угадай Флаг', '🤔 Правда или Фейк', '🌍 Страна по Эмодзи', '⚡ Блиц'];

  // Таймер для блица
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (blitzActive && blitzTimer > 0) {
      interval = setInterval(() => {
        setBlitzTimer(prev => {
          if (prev <= 5 && prev > 0) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    } else if (blitzTimer === 0) {
      setBlitzActive(false);
    }
    return () => clearInterval(interval);
  }, [blitzActive, blitzTimer]);

  const startGame = () => {
    setScreen('round-intro');
    setCurrentRound(1);
    setScores({ team1: 0, team2: 0, team3: 0 });
  };

  const startRound = () => {
    setScreen(rounds[currentRound - 1]);
    setCurrentQuestion(0);
    setShowAnswer(false);
    setRoundScores({ team1: 0, team2: 0, team3: 0 });
    setAnsweredTeams(new Set());
    if (rounds[currentRound - 1] === 'blitz') {
      setBlitzTimer(15);
      setBlitzActive(false);
    }
  };

  const nextQuestion = useCallback(() => {
    const questionsPerRound = [flagQuestions.length, trueFalseQuestions.length, emojiQuestions.length, blitzQuestions.length];
    const maxQ = questionsPerRound[currentRound - 1];

    if (currentQuestion < maxQ - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowAnswer(false);
      setAnsweredTeams(new Set());
      if (rounds[currentRound - 1] === 'blitz') {
        setBlitzTimer(15);
        setBlitzActive(false);
      }
    } else {
      // Раунд окончен
      setScores(prev => ({
        team1: prev.team1 + roundScores.team1,
        team2: prev.team2 + roundScores.team2,
        team3: prev.team3 + roundScores.team3,
      }));
      if (currentRound < 4) {
        setCurrentRound(prev => prev + 1);
        setScreen('round-intro');
      } else {
        setScreen('final');
        setConfetti(true);
        playSound('win');
      }
    }
  }, [currentQuestion, currentRound, roundScores]);

  const addScore = (team: Team) => {
    if (answeredTeams.has(team)) return;
    setAnsweredTeams(prev => new Set([...prev, team]));
    setRoundScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
    playSound('correct');
  };

  const removeScore = (team: Team) => {
    if (!answeredTeams.has(team)) return;
    setAnsweredTeams(prev => {
      const newSet = new Set(prev);
      newSet.delete(team);
      return newSet;
    });
    setRoundScores(prev => ({ ...prev, [team]: prev[team] - 1 }));
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    playSound('reveal');
  };

  const getWinner = (): string => {
    const max = Math.max(scores.team1, scores.team2, scores.team3);
    if (scores.team1 === max) return teamNames.team1;
    if (scores.team2 === max) return teamNames.team2;
    return teamNames.team3;
  };

  // ==================== РЕНДЕР ЭКРАНОВ ====================

  // СТАРТОВЫЙ ЭКРАН
  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">🌍</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            ГЕО-БАТТЛ
          </h1>
          <p className="text-xl text-purple-200 mb-8">Интерактивная битва знаний 🧠</p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-white text-xl font-bold mb-4">Назовите свои команды:</h2>
            <div className="space-y-3">
              {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                <div key={team} className="flex items-center gap-3">
                  <span className="text-2xl">{['🔴', '🔵', '🟢'][i]}</span>
                  <input
                    type="text"
                    value={teamNames[team]}
                    onChange={(e) => setTeamNames(prev => ({ ...prev, [team]: e.target.value }))}
                    className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/30 focus:outline-none focus:border-white/60"
                    placeholder={`Команда ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-2xl px-12 py-4 rounded-full hover:scale-105 transition-transform shadow-lg shadow-orange-500/30"
          >
            🚀 НАЧАТЬ БАТТЛ
          </button>
        </div>
      </div>
    );
  }

  // ЭКРАН ВСТУПЛЕНИЯ РАУНДА
  if (screen === 'round-intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center">
          <div className="text-sm text-purple-300 mb-2">Раунд {currentRound} из 4</div>
          <div className="text-8xl mb-6 animate-pulse">{roundNames[currentRound - 1].split(' ')[0]}</div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            {roundNames[currentRound - 1]}
          </h2>
          <p className="text-purple-200 text-lg mb-8">
            {currentRound === 1 && 'Угадайте страну по флагу! Команды поднимают руку.'}
            {currentRound === 2 && 'Верите ли вы этому факту? Правда или фейк!'}
            {currentRound === 3 && 'Какая страна скрывается за эмодзи? 🤔'}
            {currentRound === 4 && 'Быстрые вопросы! Кто первый — тот и отвечает!'}
          </p>

          {/* Табло */}
          <div className="flex justify-center gap-4 mb-8">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
              <div key={team} className="bg-white/10 backdrop-blur rounded-xl px-6 py-3">
                <div className="text-2xl">{['🔴', '🔵', '🟢'][i]}</div>
                <div className="text-white font-bold text-sm">{teamNames[team]}</div>
                <div className="text-yellow-400 font-black text-xl">{scores[team]}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startRound}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black text-xl px-10 py-4 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            ▶️ СТАРТ РАУНДА
          </button>
        </div>
      </div>
    );
  }

  // РАУНД: ФЛАГИ
  if (screen === 'flag') {
    const q = flagQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex flex-col">
        <ScoreBar scores={scores} teamNames={teamNames} roundScores={roundScores} currentRound={currentRound} roundNames={roundNames} />

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <div className="text-9xl mb-6">{q.flag}</div>
          <h3 className="text-2xl text-white font-bold mb-6">Какая это страна?</h3>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${
                  showAnswer
                    ? i === q.correct
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-white/10 text-white/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>

          {showAnswer && (
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4 mb-4 text-center">
              <p className="text-yellow-200 text-lg">💡 {q.funFact}</p>
            </div>
          )}

          <QuestionControls
            showAnswer={showAnswer}
            onReveal={revealAnswer}
            onNext={nextQuestion}
            onAddScore={addScore}
            onRemoveScore={removeScore}
            answeredTeams={answeredTeams}
            teamNames={teamNames}
          />
        </div>
      </div>
    );
  }

  // РАУНД: ПРАВДА ИЛИ ФЕЙК
  if (screen === 'true-false') {
    const q = trueFalseQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-4 flex flex-col">
        <ScoreBar scores={scores} teamNames={teamNames} roundScores={roundScores} currentRound={currentRound} roundNames={roundNames} />

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <div className="text-6xl mb-6">🤔</div>
          <h3 className="text-2xl md:text-3xl text-white font-bold mb-8 text-center max-w-2xl leading-relaxed">
            "{q.statement}"
          </h3>

          <div className="flex gap-6 mb-6">
            <div className={`px-8 py-4 rounded-xl text-2xl font-black transition-all ${
              showAnswer
                ? q.isTrue ? 'bg-green-500 text-white scale-110' : 'bg-red-500/30 text-white/50'
                : 'bg-green-500/80 text-white hover:scale-105'
            }`}>
              ✅ ПРАВДА
            </div>
            <div className={`px-8 py-4 rounded-xl text-2xl font-black transition-all ${
              showAnswer
                ? !q.isTrue ? 'bg-red-500 text-white scale-110' : 'bg-green-500/30 text-white/50'
                : 'bg-red-500/80 text-white hover:scale-105'
            }`}>
              ❌ ФЕЙК
            </div>
          </div>

          {showAnswer && (
            <div className="bg-cyan-400/20 border border-cyan-400/50 rounded-xl p-4 mb-4 text-center max-w-lg">
              <p className="text-cyan-200 text-lg">💡 {q.explanation}</p>
            </div>
          )}

          <QuestionControls
            showAnswer={showAnswer}
            onReveal={revealAnswer}
            onNext={nextQuestion}
            onAddScore={addScore}
            onRemoveScore={removeScore}
            answeredTeams={answeredTeams}
            teamNames={teamNames}
          />
        </div>
      </div>
    );
  }

  // РАУНД: ЭМОДЗИ
  if (screen === 'emoji') {
    const q = emojiQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4 flex flex-col">
        <ScoreBar scores={scores} teamNames={teamNames} roundScores={roundScores} currentRound={currentRound} roundNames={roundNames} />

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <div className="text-7xl md:text-8xl mb-6 tracking-wider">{q.emojis}</div>
          <h3 className="text-2xl text-white font-bold mb-6">Какая это страна?</h3>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${
                  showAnswer
                    ? i === q.correct
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-white/10 text-white/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>

          <QuestionControls
            showAnswer={showAnswer}
            onReveal={revealAnswer}
            onNext={nextQuestion}
            onAddScore={addScore}
            onRemoveScore={removeScore}
            answeredTeams={answeredTeams}
            teamNames={teamNames}
          />
        </div>
      </div>
    );
  }

  // РАУНД: БЛИЦ
  if (screen === 'blitz') {
    const q = blitzQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4 flex flex-col">
        <ScoreBar scores={scores} teamNames={teamNames} roundScores={roundScores} currentRound={currentRound} roundNames={roundNames} />

        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          {/* Таймер */}
          <div className={`text-6xl font-black mb-4 transition-colors ${
            blitzTimer <= 5 ? 'text-red-400 animate-pulse' : blitzTimer <= 10 ? 'text-yellow-400' : 'text-white'
          }`}>
            ⏱️ {blitzTimer}с
          </div>

          <h3 className="text-xl md:text-3xl text-white font-bold mb-8 text-center max-w-2xl">
            {q.question}
          </h3>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${
                  showAnswer
                    ? i === q.correct
                      ? 'bg-green-500 text-white scale-105'
                      : 'bg-white/10 text-white/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-4">
            {!blitzActive && !showAnswer && (
              <button
                onClick={() => setBlitzActive(true)}
                className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
              >
                ▶️ Старт таймера
              </button>
            )}
          </div>

          <QuestionControls
            showAnswer={showAnswer}
            onReveal={revealAnswer}
            onNext={nextQuestion}
            onAddScore={addScore}
            onRemoveScore={removeScore}
            answeredTeams={answeredTeams}
            teamNames={teamNames}
          />
        </div>
      </div>
    );
  }

  // ФИНАЛ
  if (screen === 'final') {
    const winner = getWinner();
    const sortedTeams = [
      { name: teamNames.team1, score: scores.team1, emoji: '🔴' },
      { name: teamNames.team2, score: scores.team2, emoji: '🔵' },
      { name: teamNames.team3, score: scores.team3, emoji: '🟢' },
    ].sort((a: { name: string; score: number; emoji: string }, b: { name: string; score: number; emoji: string }) => b.score - a.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        {confetti && <Confetti />}
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2">ПОБЕДИТЕЛИ!</h1>
          <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-8">{winner}</h2>

          <div className="space-y-4 mb-8">
            {sortedTeams.map((team: { name: string; score: number; emoji: string }, i: number) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  i === 0 ? 'bg-yellow-500/30 border-2 border-yellow-400' : 'bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-2xl">{team.emoji}</span>
                  <span className="text-white font-bold text-xl">{team.name}</span>
                </div>
                <span className="text-yellow-400 font-black text-3xl">{team.score}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setScreen('start');
              setScores({ team1: 0, team2: 0, team3: 0 });
              setRoundScores({ team1: 0, team2: 0, team3: 0 });
              setCurrentRound(1);
              setCurrentQuestion(0);
              setConfetti(false);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl px-10 py-4 rounded-full hover:scale-105 transition-transform"
          >
            🔄 Играть снова
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ====================

function ScoreBar({ scores, teamNames, roundScores, currentRound, roundNames }: {
  scores: Scores;
  teamNames: { team1: string; team2: string; team3: string };
  roundScores: Scores;
  currentRound: number;
  roundNames: string[];
}) {
  return (
    <div className="flex items-center justify-between bg-black/30 backdrop-blur rounded-xl p-3 mb-4">
      <div className="text-white font-bold text-sm">
        {roundNames[currentRound - 1]}
      </div>
      <div className="flex gap-3">
        {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
          <div key={team} className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-1">
            <span>{['🔴', '🔵', '🟢'][i]}</span>
            <span className="text-white text-sm font-bold">{scores[team] + roundScores[team]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionControls({ showAnswer, onReveal, onNext, onAddScore, onRemoveScore, answeredTeams, teamNames }: {
  showAnswer: boolean;
  onReveal: () => void;
  onNext: () => void;
  onAddScore: (team: Team) => void;
  onRemoveScore: (team: Team) => void;
  answeredTeams: Set<Team>;
  teamNames: { team1: string; team2: string; team3: string };
}) {
  return (
    <div className="w-full max-w-lg">
      {!showAnswer ? (
        <button
          onClick={onReveal}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg px-8 py-3 rounded-full hover:scale-105 transition-transform mb-3"
        >
          👁️ Показать ответ
        </button>
      ) : (
        <div className="space-y-3">
          <div className="text-center text-white font-bold mb-2">Кто ответил правильно?</div>
          <div className="flex gap-2">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
              <button
                key={team}
                onClick={() => answeredTeams.has(team) ? onRemoveScore(team) : onAddScore(team)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  answeredTeams.has(team)
                    ? 'bg-green-500 text-white scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {['🔴', '🔵', '🟢'][i]} {teamNames[team]}
              </button>
            ))}
          </div>
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg px-8 py-3 rounded-full hover:scale-105 transition-transform"
          >
            Далее →
          </button>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  const colors = ['bg-yellow-400', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: 8 + Math.random() * 12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-sm animate-confetti`}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
