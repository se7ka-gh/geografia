import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== ТИПЫ ====================
type GameScreen = 'start' | 'round-intro' | 'flag' | 'true-false' | 'emoji' | 'photo' | 'final';
type Team = 'team1' | 'team2' | 'team3';

interface Scores { team1: number; team2: number; team3: number; }
interface TeamAnswers { team1: number | null; team2: number | null; team3: number | null; }

interface FlagQuestion {
  flagCode: string;
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
  options: string[];
  correct: number;
}
interface PhotoQuestion {
  image: string;
  hint: string;
  options: string[];
  correct: number;
  funFact: string;
}

// ==================== ДАННЫЕ ====================
const ROUND_TIME = 20; // секунд на ответ

const flagQuestions: FlagQuestion[] = [
  { flagCode: 'jp', options: ['Китай', 'Япония', 'Корея', 'Вьетнам'], correct: 1, funFact: 'Япония — страна восходящего солнца ☀️' },
  { flagCode: 'br', options: ['Аргентина', 'Колумбия', 'Бразилия', 'Перу'], correct: 2, funFact: 'В Бразилии больше всего футбольных стадионов ⚽' },
  { flagCode: 'it', options: ['Франция', 'Ирландия', 'Мексика', 'Италия'], correct: 3, funFact: 'Италия — рекордсмен по объектам ЮНЕСКО 🏛️' },
  { flagCode: 'ca', options: ['Канада', 'Дания', 'Норвегия', 'Швеция'], correct: 0, funFact: 'В Канаде больше озёр, чем во всех остальных странах 🏔️' },
  { flagCode: 'au', options: ['Новая Зеландия', 'Индонезия', 'Австралия', 'Фиджи'], correct: 2, funFact: 'Австралия — единственный континент-страна 🦘' },
  { flagCode: 'eg', options: ['Ливия', 'Египет', 'Судан', 'Саудовская Аравия'], correct: 1, funFact: 'Пирамиды строили наёмные рабочие, а не рабы! 🏗️' },
  { flagCode: 'mx', options: ['Мексика', 'Испания', 'Португалия', 'Колумбия'], correct: 0, funFact: 'В Мексике изобрели шоколад! 🍫' },
  { flagCode: 'kr', options: ['Япония', 'Китай', 'Южная Корея', 'Таиланд'], correct: 2, funFact: 'Корея — родина к-попа и Samsung 🎶' },
];

const trueFalseQuestions: TrueFalseQuestion[] = [
  { statement: 'В России больше всего часовых зон в мире', isTrue: true, explanation: 'В России 11 часовых зон — это рекорд! 🕐' },
  { statement: 'Мёртвое море настолько солёное, что в нём невозможно утонуть', isTrue: true, explanation: 'Солёность 34% — вы буквально лежите на воде! 🏊' },
  { statement: 'Африка — это страна', isTrue: false, explanation: 'Африка — континент с 54 странами! 🌍' },
  { statement: 'Самая длинная река в мире — Нил', isTrue: false, explanation: 'По последним данным — Амазонка! 🤷' },
  { statement: 'В Антарктиде есть действующий вулкан', isTrue: true, explanation: 'Вулкан Эребус извергается уже 100+ лет! 🌋' },
  { statement: 'Озеро Байкал содержит 20% всей пресной воды планеты', isTrue: true, explanation: 'Самое глубокое озеро — 1642 метра! 💧' },
  { statement: 'В Исландии нет комаров', isTrue: true, explanation: 'Из-за перепадов температуры комары не выживают! 🦟❌' },
  { statement: 'Великая Китайская стена видна из космоса', isTrue: false, explanation: 'Это миф! Стена слишком узкая 🛰️' },
];

const emojiQuestions: EmojiQuestion[] = [
  { emojis: '🗼🥐🍷', options: ['Италия', 'Франция', 'Испания', 'Бельгия'], correct: 1 },
  { emojis: '🏜️🐫🔺', options: ['Марокко', 'Саудовская Аравия', 'Египет', 'ОАЭ'], correct: 2 },
  { emojis: '🗽🍔🎬', options: ['Канада', 'США', 'Мексика', 'Англия'], correct: 1 },
  { emojis: '🦘🏄‍♂️🪃', options: ['Новая Зеландия', 'Гавайи', 'Австралия', 'ЮАР'], correct: 2 },
  { emojis: '🍣🗾🌸', options: ['Китай', 'Таиланд', 'Япония', 'Корея'], correct: 2 },
  { emojis: '🎭🏛️🫒', options: ['Италия', 'Греция', 'Турция', 'Хорватия'], correct: 1 },
  { emojis: '🌮🏖️💀', options: ['Бразилия', 'Мексика', 'Куба', 'Колумбия'], correct: 1 },
];

const photoQuestions: PhotoQuestion[] = [
  {
    image: 'https://images.unsplash.com/photo-1502602682916-037bb0d46fb8?w=800&q=80',
    hint: '🗼 Металлическая башня, символ любви',
    options: ['Лондон', 'Париж', 'Берлин', 'Рим'],
    correct: 1,
    funFact: 'Эйфелева башня должна была быть временной — её хотели снести через 20 лет! 🗼'
  },
  {
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    hint: '🏟️ Древний амфитеатр, где сражались гладиаторы',
    options: ['Афины', 'Стамбул', 'Рим', 'Каир'],
    correct: 2,
    funFact: 'В Колизее одновременно помещалось 80 000 зрителей! 🏟️'
  },
  {
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80',
    hint: '🗽 Женщина с факелом на острове',
    options: ['Вашингтон', 'Лондон', 'Нью-Йорк', 'Париж'],
    correct: 2,
    funFact: 'Статуя Свободы — подарок Франции! Изначально она была медного цвета 🗽'
  },
  {
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
    hint: '🔺 Древние гробницы в пустыне',
    options: ['Марокко', 'Египет', 'Иордания', 'Саудовская Аравия'],
    correct: 1,
    funFact: 'Великая пирамида была самым высоким сооружением в мире 3800 лет! 🔺'
  },
  {
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    hint: '🗻 Священная гора с идеальной формой',
    options: ['Корея', 'Непал', 'Япония', 'Китай'],
    correct: 2,
    funFact: 'Гора Фудзи — это действующий вулкан! Последнее извержение в 1707 году 🌋'
  },
  {
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
    hint: '🏔️ Древний город инков в облаках',
    options: ['Боливия', 'Перу', 'Эквадор', 'Мексика'],
    correct: 1,
    funFact: 'Мачу-Пикчу был «потерян» и найден заново только в 1911 году! 🏔️'
  },
  {
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
    hint: '🧱 Огромная стена через горы',
    options: ['Монголия', 'Корея', 'Китай', 'Япония'],
    correct: 2,
    funFact: 'Строительство длило более 2000 лет! Общая длина — 21 000 км 🧱'
  },
  {
    image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
    hint: '🏛️ Древний храм с колоннами на холме',
    options: ['Рим', 'Афины', 'Стамбул', 'Каир'],
    correct: 1,
    funFact: 'Парфенон построен в 438 году до н.э. — ему более 2400 лет! 🏛️'
  },
];

// ==================== ЗВУКИ ====================
const playSound = (type: 'correct' | 'reveal' | 'win' | 'tick' | 'select') => {
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
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        break;
      case 'select':
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
        break;
      case 'reveal':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'win':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
        break;
      case 'tick':
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch { /* no audio */ }
};

// ==================== MAIN ====================
export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [teamNames, setTeamNames] = useState({ team1: 'Ряд 1', team2: 'Ряд 2', team3: 'Ряд 3' });
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0, team3: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [teamAnswers, setTeamAnswers] = useState<TeamAnswers>({ team1: null, team2: null, team3: null });
  const [roundScores, setRoundScores] = useState<Scores>({ team1: 0, team2: 0, team3: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [timer, setTimer] = useState(ROUND_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [shakeCorrect, setShakeCorrect] = useState<Team | null>(null);
  const teamAnswersRef = useRef<TeamAnswers>({ team1: null, team2: null, team3: null });
  
  // Синхронизация ref с состоянием
  useEffect(() => {
    teamAnswersRef.current = teamAnswers;
  }, [teamAnswers]);

  const rounds: GameScreen[] = ['flag', 'true-false', 'emoji', 'photo'];
  const roundNames = ['🏳️ Угадай Флаг', '🤔 Правда или Фейк', '🌍 Страна по Эмодзи', '📸 Угадай по Фото'];
  const roundColors = [
    'from-blue-900 via-indigo-900 to-purple-900',
    'from-emerald-900 via-teal-900 to-cyan-900',
    'from-orange-900 via-red-900 to-pink-900',
    'from-violet-900 via-purple-900 to-fuchsia-900',
  ];

  const getQuestions = (): { options: string[]; correct: number }[] => {
    switch (rounds[currentRound - 1]) {
      case 'flag': return flagQuestions;
      case 'true-false': return trueFalseQuestions.map(q => ({
        options: ['Правда ✅', 'Фейк ❌'], correct: q.isTrue ? 0 : 1
      }));
      case 'emoji': return emojiQuestions;
      case 'photo': return photoQuestions;
      default: return [];
    }
  };

  const getTotalQuestions = () => {
    switch (rounds[currentRound - 1]) {
      case 'flag': return flagQuestions.length;
      case 'true-false': return trueFalseQuestions.length;
      case 'emoji': return emojiQuestions.length;
      case 'photo': return photoQuestions.length;
      default: return 0;
    }
  };

  const calculateScores = useCallback((answers: TeamAnswers) => {
    const questions = getQuestions();
    const q = questions[currentQuestion];
    const newRoundScores: Scores = { team1: 0, team2: 0, team3: 0 };

    (['team1', 'team2', 'team3'] as Team[]).forEach(team => {
      if (answers[team] === q.correct) {
        newRoundScores[team] = 1;
        setShakeCorrect(team);
        setTimeout(() => setShakeCorrect(null), 600);
      }
    });

    return newRoundScores;
  }, [currentQuestion, currentRound]);

  const showResults = useCallback((answers: TeamAnswers) => {
    setShowResult(true);
    setTimerActive(false);
    playSound('reveal');
    const newRoundScores = calculateScores(answers);
    setRoundScores(newRoundScores);
  }, [calculateScores]);

  // Таймер
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) {
      setTimerActive(false);
      // Используем ref для актуальных ответов
      showResults(teamAnswersRef.current);
      return;
    }
    const id = setTimeout(() => {
      setTimer(t => {
        if (t <= 5 && t > 1) playSound('tick');
        return t - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive, showResults]);

  const selectAnswer = (team: Team, answerIdx: number) => {
    if (showResult) return;
    if (!timerActive) {
      setTimerActive(true);
      setTimer(ROUND_TIME);
    }
    const newAnswers = { ...teamAnswers, [team]: answerIdx };
    setTeamAnswers(newAnswers);
    playSound('select');

    // Проверка — все ли выбрали
    if (newAnswers.team1 !== null && newAnswers.team2 !== null && newAnswers.team3 !== null) {
      setTimeout(() => showResults(newAnswers), 500);
    }
  };

  const nextQuestion = () => {
    const maxQ = getTotalQuestions();
    if (currentQuestion < maxQ - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowResult(false);
      setTeamAnswers({ team1: null, team2: null, team3: null });
      setTimer(ROUND_TIME);
      setTimerActive(false);
      setRoundScores({ team1: 0, team2: 0, team3: 0 });
    } else {
      // Раунд окончен — добавляем очки
      const newScores = {
        team1: scores.team1 + roundScores.team1,
        team2: scores.team2 + roundScores.team2,
        team3: scores.team3 + roundScores.team3,
      };
      setScores(newScores);
      if (currentRound < 4) {
        setCurrentRound(prev => prev + 1);
        setScreen('round-intro');
      } else {
        setScreen('final');
        setConfetti(true);
        playSound('win');
      }
    }
  };

  const getWinner = (): string => {
    const max = Math.max(scores.team1, scores.team2, scores.team3);
    if (scores.team1 === max) return teamNames.team1;
    if (scores.team2 === max) return teamNames.team2;
    return teamNames.team3;
  };

  const startGame = () => {
    setScreen('round-intro');
    setCurrentRound(1);
    setScores({ team1: 0, team2: 0, team3: 0 });
  };

  const startRound = () => {
    setScreen(rounds[currentRound - 1]);
    setCurrentQuestion(0);
    setShowResult(false);
    setRoundScores({ team1: 0, team2: 0, team3: 0 });
    setTeamAnswers({ team1: null, team2: null, team3: null });
    setTimer(ROUND_TIME);
    setTimerActive(false);
  };

  // ==================== РЕНДЕР ====================

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBg />
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="text-7xl mb-4 animate-bounce">🌍</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight">
            ГЕО-БАТТЛ
          </h1>
          <p className="text-xl text-purple-200 mb-2">Интерактивная битва знаний 🧠</p>
          <p className="text-sm text-purple-300/60 mb-8">4 раунда • 3 команды • 1 победитель</p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
            <h2 className="text-white text-xl font-bold mb-4">👥 Назовите свои команды:</h2>
            <div className="space-y-3">
              {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                <div key={team} className="flex items-center gap-3">
                  <span className="text-3xl">{['🔴', '🔵', '🟢'][i]}</span>
                  <input
                    type="text"
                    value={teamNames[team]}
                    onChange={(e) => setTeamNames(prev => ({ ...prev, [team]: e.target.value }))}
                    className="flex-1 bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 border border-white/30 focus:outline-none focus:border-white/60 text-lg"
                    placeholder={`Команда ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-2xl px-12 py-4 rounded-full hover:scale-110 transition-all shadow-lg shadow-orange-500/30 active:scale-95"
          >
            🚀 НАЧАТЬ БАТТЛ
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'round-intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBg />
        <div className="max-w-3xl w-full text-center relative z-10">
          <div className="text-sm text-purple-300 mb-2 font-mono">РАУНД {currentRound} / 4</div>
          <div className="text-8xl mb-6 animate-pulse">{roundNames[currentRound - 1].split(' ')[0]}</div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            {roundNames[currentRound - 1]}
          </h2>
          <p className="text-purple-200 text-lg mb-4">
            {currentRound === 1 && 'Угадайте страну по флагу! У каждой команды ⏱️ 20 секунд'}
            {currentRound === 2 && 'Верите ли вы этому факту? Правда или фейк!'}
            {currentRound === 3 && 'Какая страна скрывается за эмодзи? 🤔'}
            {currentRound === 4 && 'Узнаете достопримечательность? Покажите свои знания! 📸'}
          </p>
          <p className="text-purple-300/70 text-sm mb-8">
            Каждая команда выбирает свой вариант. Таймер запускается с первым ответом!
          </p>

          <div className="flex justify-center gap-4 mb-8">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
              <div key={team} className="bg-white/10 backdrop-blur rounded-xl px-6 py-3 border border-white/10">
                <div className="text-2xl">{['🔴', '🔵', '🟢'][i]}</div>
                <div className="text-white font-bold text-sm">{teamNames[team]}</div>
                <div className="text-yellow-400 font-black text-xl">{scores[team]}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startRound}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-black font-black text-xl px-10 py-4 rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"
          >
            ▶️ СТАРТ РАУНДА
          </button>
        </div>
      </div>
    );
  }

  // ИГРОВЫЕ ЭКРАНЫ
  if (['flag', 'true-false', 'emoji', 'photo'].includes(screen)) {
    const questions = getQuestions();
    const q = questions[currentQuestion];
    const totalQ = getTotalQuestions();
    const colorClass = roundColors[currentRound - 1];

    return (
      <div className={`min-h-screen bg-gradient-to-br ${colorClass} p-3 flex flex-col relative overflow-hidden`}>
        <AnimatedBg />

        {/* Верхняя панель */}
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-2.5 mb-3 relative z-10 border border-white/10">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <span>{roundNames[currentRound - 1]}</span>
            <span className="text-white/40 text-xs font-mono">{currentQuestion + 1}/{totalQ}</span>
          </div>
          <div className="flex gap-2">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
              <div key={team} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                shakeCorrect === team ? 'bg-green-500 scale-110 animate-pulse' : 'bg-white/10'
              }`}>
                <span className="text-sm">{['🔴', '🔵', '🟢'][i]}</span>
                <span className="text-white text-sm font-bold">{scores[team] + roundScores[team]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Контент вопроса */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full relative z-10">
          {/* Вопрос */}
          <div className="mb-4 w-full flex justify-center">
            {screen === 'flag' && (
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={`https://flagcdn.com/w640/${(q as FlagQuestion).flagCode}.png`}
                  alt="Флаг"
                  className="w-56 h-40 md:w-72 md:h-52 object-cover"
                />
              </div>
            )}
            {screen === 'true-false' && (
              <div className="text-center">
                <div className="text-5xl mb-4">🤔</div>
                <h3 className="text-xl md:text-3xl text-white font-bold max-w-2xl leading-relaxed">
                  "{(trueFalseQuestions[currentQuestion]).statement}"
                </h3>
              </div>
            )}
            {screen === 'emoji' && (
              <div className="text-center">
                <div className="text-6xl md:text-8xl mb-2 tracking-wider animate-pulse">{(q as EmojiQuestion).emojis}</div>
                <h3 className="text-xl text-white font-bold">Какая это страна?</h3>
              </div>
            )}
            {screen === 'photo' && (
              <div className="text-center">
                <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 mb-3">
                  <img
                    src={(q as PhotoQuestion).image}
                    alt="Достопримечательность"
                    className="w-72 h-44 md:w-96 md:h-60 object-cover"
                  />
                </div>
                <p className="text-white/80 text-lg">{(q as PhotoQuestion).hint}</p>
              </div>
            )}
          </div>

          {/* Таймер */}
          <div className="mb-4 flex items-center gap-3">
            <CircularTimer time={timer} maxTime={ROUND_TIME} active={timerActive} />
            {!timerActive && !showResult && (
              <span className="text-white/50 text-sm animate-pulse">Выберите ответ — таймер запустится ⏱️</span>
            )}
          </div>

          {/* Панели команд */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, teamIdx) => {
              const teamColor = ['from-red-500/30 to-red-600/30 border-red-400/50', 'from-blue-500/30 to-blue-600/30 border-blue-400/50', 'from-green-500/30 to-green-600/30 border-green-400/50'][teamIdx];
              const teamEmoji = ['🔴', '🔵', '🟢'][teamIdx];
              const selected = teamAnswers[team];
              const isCorrect = showResult && selected === q.correct;
              const isWrong = showResult && selected !== null && selected !== q.correct;

              return (
                <div key={team} className={`bg-gradient-to-b ${teamColor} border rounded-xl p-3 transition-all ${
                  isCorrect ? 'ring-4 ring-green-400 scale-105' : isWrong ? 'ring-4 ring-red-400 opacity-60' : ''
                }`}>
                  <div className="text-center mb-2 flex items-center justify-center gap-1">
                    <span className="text-lg">{teamEmoji}</span>
                    <span className="text-white font-bold text-sm">{teamNames[team]}</span>
                    {isCorrect && <span className="text-green-400 text-sm">✓ +1</span>}
                    {isWrong && <span className="text-red-400 text-sm">✗</span>}
                  </div>
                  <div className={`grid ${screen === 'true-false' ? 'grid-cols-2' : 'grid-cols-2'} gap-1.5`}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrectOpt = showResult && optIdx === q.correct;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectAnswer(team, optIdx)}
                          disabled={showResult}
                          className={`p-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                            isCorrectOpt
                              ? 'bg-green-500 text-white scale-105'
                              : isSelected && !showResult
                              ? 'bg-white text-black scale-105'
                              : isSelected && showResult
                              ? 'bg-red-500/50 text-white'
                              : 'bg-white/15 text-white hover:bg-white/25 active:scale-95'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Факт после ответа */}
          {showResult && (screen === 'flag' || screen === 'photo') && (
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-3 mb-3 text-center max-w-lg animate-fade-in">
              <p className="text-yellow-200 text-base">
                💡 {(screen === 'flag' ? (q as FlagQuestion).funFact : (q as PhotoQuestion).funFact)}
              </p>
            </div>
          )}
          {showResult && screen === 'true-false' && (
            <div className="bg-cyan-400/20 border border-cyan-400/50 rounded-xl p-3 mb-3 text-center max-w-lg animate-fade-in">
              <p className="text-cyan-200 text-base">💡 {trueFalseQuestions[currentQuestion].explanation}</p>
            </div>
          )}

          {/* Кнопка далее */}
          {showResult && (
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg px-8 py-3 rounded-full hover:scale-105 transition-all active:scale-95 animate-fade-in"
            >
              {currentQuestion < totalQ - 1 ? 'Далее →' : '🏆 Результаты раунда'}
            </button>
          )}
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
    ].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBg />
        {confetti && <Confetti />}
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2">ПОБЕДИТЕЛИ!</h1>
          <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-8">{winner}</h2>

          <div className="space-y-4 mb-8">
            {sortedTeams.map((team, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  i === 0 ? 'bg-yellow-500/30 border-2 border-yellow-400 scale-105' : 'bg-white/10'
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl px-10 py-4 rounded-full hover:scale-110 transition-all active:scale-95"
          >
            🔄 Играть снова
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ==================== КОМПОНЕНТЫ ====================

function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/5 animate-float"
          style={{
            width: `${20 + Math.random() * 60}px`,
            height: `${20 + Math.random() * 60}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

function CircularTimer({ time, maxTime, active }: { time: number; maxTime: number; active: boolean }) {
  const pct = time / maxTime;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const color = time <= 5 ? '#ef4444' : time <= 10 ? '#eab308' : '#22c55e';

  return (
    <div className={`relative w-16 h-16 ${active ? '' : 'opacity-40'}`}>
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-black ${time <= 5 && active ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {time}
        </span>
      </div>
    </div>
  );
}

function Confetti() {
  const colors = ['bg-yellow-400', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: 8 + Math.random() * 14,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <div
          key={p.id}
          className={`absolute ${p.color} rounded-sm animate-confetti`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
