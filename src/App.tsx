import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, Sparkles, Camera, Map, Trophy, Play,
  ChevronRight, RotateCcw, Timer, Eye, Globe,
  Target, Check, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type GameScreen = 'start' | 'round-intro' | 'flag' | 'true-false' | 'emoji' | 'photo' | 'final';
type Team = 'team1' | 'team2' | 'team3';

interface Scores { team1: number; team2: number; team3: number; }
interface TeamAnswers { team1: number | null; team2: number | null; team3: number | null; }

interface FlagQuestion { flagCode: string; options: string[]; correct: number; funFact: string; }
interface TrueFalseQuestion { statement: string; isTrue: boolean; explanation: string; }
interface EmojiQuestion { emojis: string; options: string[]; correct: number; }
interface PhotoQuestion { image: string; hint: string; options: string[]; correct: number; funFact: string; }

// ============================================
// DATA
// ============================================
const ROUND_TIME = 20;

const flagQuestions: FlagQuestion[] = [
  { flagCode: 'jp', options: ['Китай', 'Япония', 'Корея', 'Вьетнам'], correct: 1, funFact: 'Япония — страна восходящего солнца. Флаг символизирует рассвет над Тихим океаном.' },
  { flagCode: 'br', options: ['Аргентина', 'Колумбия', 'Бразилия', 'Перу'], correct: 2, funFact: 'Звёзды на флаге — это созвездия, видимые из Рио 15 ноября 1889 года.' },
  { flagCode: 'it', options: ['Франция', 'Ирландия', 'Мексика', 'Италия'], correct: 3, funFact: 'Италия имеет больше всего объектов ЮНЕСКО в мире — более 58.' },
  { flagCode: 'ca', options: ['Канада', 'Дания', 'Норвегия', 'Швеция'], correct: 0, funFact: 'Кленовый лист на флаге имеет 11 кончиков — не больше и не меньше.' },
  { flagCode: 'au', options: ['Новая Зеландия', 'Индонезия', 'Австралия', 'Фиджи'], correct: 2, funFact: 'Австралия — единственный континент, занимающий одна страна.' },
  { flagCode: 'eg', options: ['Ливия', 'Египет', 'Судан', 'Саудовская Аравия'], correct: 1, funFact: 'Орёл Саладина на гербе — символ силы и отваги с XIII века.' },
  { flagCode: 'mx', options: ['Мексика', 'Испания', 'Португалия', 'Колумбия'], correct: 0, funFact: 'Орёл на кактусе — ацтекская легенда об основании Теночтитлана.' },
  { flagCode: 'kr', options: ['Япония', 'Китай', 'Южная Корея', 'Таиланд'], correct: 2, funFact: 'Тхыгук — символ инь и ян, окружённый четырьмя триграммами.' },
  { flagCode: 'nz', options: ['Австралия', 'Новая Зеландия', 'Фиджи', 'Самоа'], correct: 1, funFact: 'Флаг Новой Зеландии содержит созвездие Южного Креста.' },
  { flagCode: 'se', options: ['Норвегия', 'Дания', 'Швеция', 'Финляндия'], correct: 2, funFact: 'Скандинавский крест на флаге символизирует христианство.' },
  { flagCode: 'ar', options: ['Уругвай', 'Чили', 'Аргентина', 'Парагвай'], correct: 2, funFact: 'Солнце Мая на флаге — символ независимости от Испании.' },
  { flagCode: 'th', options: ['Вьетнам', 'Камбоджа', 'Лаос', 'Таиланд'], correct: 3, funFact: 'Таиланд — единственная страна Юго-Восточной Азии, не бывшая колонией.' },
];

const trueFalseQuestions: TrueFalseQuestion[] = [
  { statement: 'В России больше всего часовых зон в мире', isTrue: true, explanation: '11 часовых зон — абсолютный мировой рекорд.' },
  { statement: 'В Мёртвом море невозможно утонуть', isTrue: true, explanation: 'Солёность 34% — плотность воды не позволяет погрузиться.' },
  { statement: 'Африка — это страна', isTrue: false, explanation: 'Африка — континент, объединяющий 54 независимых государства.' },
  { statement: 'Самая длинная река в мире — Нил', isTrue: false, explanation: 'По последним данным — Амазонка. Споры продолжаются.' },
  { statement: 'В Антарктиде есть действующий вулкан', isTrue: true, explanation: 'Эребус извергается непрерывно более 100 лет.' },
  { statement: 'Байкал содержит 20% всей пресной воды планеты', isTrue: true, explanation: 'Глубина 1642 м — самое глубокое озеро на Земле.' },
  { statement: 'В Исландии нет комаров', isTrue: true, explanation: 'Резкие перепады температуры нарушают жизненный цикл насекомых.' },
  { statement: 'Великая Китайская стена видна из космоса', isTrue: false, explanation: 'Миф: стена слишком узка для наблюдения с орбиты.' },
  { statement: 'В Атлантическом океане больше воды, чем в Тихом', isTrue: false, explanation: 'Тихий океан — крупнейший, занимает треть поверхности Земли.' },
  { statement: 'Сахара — самая большая пустыня в мире', isTrue: false, explanation: 'Антарктида технически является пустыней и больше Сахары.' },
  { statement: 'Венесуэла имеет самый высокий водопад в мире', isTrue: true, explanation: 'Анхель — 979 метров, выше Эйфелевой башни в 3 раза.' },
  { statement: 'Россия граничит с 14 странами', isTrue: true, explanation: 'Рекорд: ни одна другая страна не граничит с таким количеством государств.' },
];

const emojiQuestions: EmojiQuestion[] = [
  { emojis: '🗼 🥐 🍷', options: ['Италия', 'Франция', 'Испания', 'Бельгия'], correct: 1 },
  { emojis: '🏜️ 🐫 🔺', options: ['Марокко', 'Саудовская Аравия', 'Египет', 'ОАЭ'], correct: 2 },
  { emojis: '🗽 🍔 🎬', options: ['Канада', 'США', 'Мексика', 'Англия'], correct: 1 },
  { emojis: '🦘 🏄 🪃', options: ['Новая Зеландия', 'Гавайи', 'Австралия', 'ЮАР'], correct: 2 },
  { emojis: '🍣 🌸 ⛩️', options: ['Китай', 'Таиланд', 'Япония', 'Корея'], correct: 2 },
  { emojis: '🏛️ 🫒 🎭', options: ['Италия', 'Греция', 'Турция', 'Хорватия'], correct: 1 },
  { emojis: '🌮 🏖️ 💀', options: ['Бразилия', 'Мексика', 'Куба', 'Колумбия'], correct: 1 },
  { emojis: '🏔️ 🧘 🐘', options: ['Индия', 'Непал', 'Тибет', 'Бутан'], correct: 1 },
  { emojis: '🌋 🏝️ 🌺', options: ['Индонезия', 'Филиппины', 'Гавайи', 'Мадагаскар'], correct: 0 },
  { emojis: '🏰 🧇 🍺', options: ['Германия', 'Бельгия', 'Нидерланды', 'Швейцария'], correct: 1 },
];

const photoQuestions: PhotoQuestion[] = [
  { image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&q=80', hint: 'Металлическая решётчатая башня, символ города', options: ['Лондон', 'Париж', 'Берлин', 'Рим'], correct: 1, funFact: 'Эйфелева башня должна была быть демонтирована через 20 лет после постройки.' },
  { image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', hint: 'Амфитеатр, где сражались гладиаторы', options: ['Афины', 'Стамбул', 'Рим', 'Каир'], correct: 2, funFact: 'Колизей вмещал до 80 000 зрителей — больше, чем многие современные стадионы.' },
  { image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&q=80', hint: 'Монумент на острове с факелом в руке', options: ['Вашингтон', 'Лондон', 'Нью-Йорк', 'Париж'], correct: 2, funFact: 'Статуя Свободы — подарок Франции. Изначально медного цвета.' },
  { image: 'https://images.unsplash.com/photo-1539650466573-600e3b334147?w=800&q=80', hint: 'Древние монументальные гробницы в пустыне', options: ['Марокко', 'Египет', 'Иордания', 'Саудовская Аравия'], correct: 1, funFact: 'Великая пирамида оставалась самым высоким сооружением 3 800 лет.' },
  { image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80', hint: 'Священная гора с идеальной конической формой', options: ['Корея', 'Непал', 'Япония', 'Китай'], correct: 2, funFact: 'Фудзи — действующий вулкан. Последнее извержение в 1707 году.' },
  { image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80', hint: 'Древний город в облаках, затерянный в горах', options: ['Боливия', 'Перу', 'Эквадор', 'Мексика'], correct: 1, funFact: 'Мачу-Пикчу был «открыт заново» американским историком в 1911 году.' },
  { image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80', hint: 'Масштабное фортификационное сооружение через горы', options: ['Монголия', 'Корея', 'Китай', 'Япония'], correct: 2, funFact: 'Общая длина — более 21 000 км. Строительство длилось два тысячелетия.' },
  { image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80', hint: 'Античный храм с мраморными колоннами', options: ['Рим', 'Афины', 'Стамбул', 'Каир'], correct: 1, funFact: 'Парфенон построен в 438 году до н.э. — ему более 2 400 лет.' },
  { image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80', hint: 'Бело-мраморный мавзолей с куполом', options: ['Пакистан', 'Индия', 'Иран', 'Турция'], correct: 1, funFact: 'Тадж-Махал построен императором в память о любимой жене.' },
  { image: 'https://images.unsplash.com/photo-1598968615351-a7e1f1b50681?w=800&q=80', hint: 'Мощный водопад на границе двух стран', options: ['Бразилия/Аргентина', 'США/Канада', 'Замбия/Зимбабве', 'Венесуэла/Гайана'], correct: 0, funFact: 'Игуасу — система из 275 водопадов шириной 2,7 км.' },
  { image: 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&q=80', hint: 'Древний город, высеченный в розовых скалах', options: ['Иордания', 'Йемен', 'Оман', 'Саудовская Аравия'], correct: 0, funFact: 'Петра — столица Набатейского царства, высечена в розовых скалах.' },
  { image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80', hint: 'Знаменитый оперный театр с парусами', options: ['Рио-де-Жанейро', 'Кейптаун', 'Сидней', 'Сан-Франциско'], correct: 2, funFact: 'Оперный театр в Сиднее — шедевр экспрессионизма XX века.' },
];

// ============================================
// ANIMATION VARIANTS
// ============================================
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [teamNames, setTeamNames] = useState({ team1: 'Ряд 1', team2: 'Ряд 2', team3: 'Ряд 3' });
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0, team3: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [teamAnswers, setTeamAnswers] = useState<TeamAnswers>({ team1: null, team2: null, team3: null });
  const [currentRound, setCurrentRound] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [timer, setTimer] = useState(ROUND_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const teamAnswersRef = useRef<TeamAnswers>({ team1: null, team2: null, team3: null });

  useEffect(() => { teamAnswersRef.current = teamAnswers; }, [teamAnswers]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', 'dark'); }, []);

  const rounds: GameScreen[] = ['flag', 'true-false', 'emoji', 'photo'];
  const roundMeta = [
    { name: 'Угадай Флаг', icon: Flag, desc: 'Определите страну по государственному символу' },
    { name: 'Правда или Фейк', icon: Sparkles, desc: 'Проверьте интуицию — верите ли вы этому факту?' },
    { name: 'Страна по Эмодзи', icon: Map, desc: 'Расшифруйте комбинацию символов' },
    { name: 'Угадай по Фото', icon: Camera, desc: 'Узнайте достопримечательность на снимке' },
  ];

  const getQuestions = (): { options: string[]; correct: number }[] => {
    switch (rounds[currentRound - 1]) {
      case 'flag': return flagQuestions;
      case 'true-false': return trueFalseQuestions.map(q => ({ options: ['Правда', 'Фейк'], correct: q.isTrue ? 0 : 1 }));
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

  // Auto-start timer
  useEffect(() => {
    if (['flag', 'true-false', 'emoji', 'photo'].includes(screen)) {
      setTimer(ROUND_TIME);
      setTimerActive(true);
    }
  }, [currentQuestion, screen]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) {
      setTimerActive(false);
      showResults(teamAnswersRef.current);
      return;
    }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive]);

  const showResults = useCallback((answers: TeamAnswers) => {
    setShowResult(true);
    setTimerActive(false);
    const questions = getQuestions();
    const q = questions[currentQuestion];
    
    // Используем функциональное обновление для актуальных значений
    setScores(prev => {
      const newScores = { ...prev };
      (['team1', 'team2', 'team3'] as Team[]).forEach(team => {
        if (answers[team] === q.correct) newScores[team] += 1;
      });
      return newScores;
    });
  }, [currentQuestion, currentRound]);

  const selectAnswer = (team: Team, answerIdx: number) => {
    if (showResult) return;
    const newAnswers = { ...teamAnswers, [team]: answerIdx };
    setTeamAnswers(newAnswers);
    if (newAnswers.team1 !== null && newAnswers.team2 !== null && newAnswers.team3 !== null) {
      setTimeout(() => showResults(newAnswers), 400);
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
    } else {
      if (currentRound < 4) {
        setCurrentRound(prev => prev + 1);
        setScreen('round-intro');
      } else {
        setScreen('final');
        setConfetti(true);
      }
    }
  };

  const getWinner = (): string => {
    const max = Math.max(scores.team1, scores.team2, scores.team3);
    if (scores.team1 === max) return teamNames.team1;
    if (scores.team2 === max) return teamNames.team2;
    return teamNames.team3;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>


      <AnimatePresence mode="wait">
        {/* ===== START SCREEN ===== */}
        {screen === 'start' && (
          <motion.div key="start" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="min-h-screen flex items-center justify-center p-6 md:p-12 relative">
            <HeroBackground />
            <div className="max-w-xl w-full relative z-10">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                
                {/* Label */}
                <div className="flex items-center gap-3 mb-8">
                  <Globe size={20} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                  <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
                    Интерактивный урок географии
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
                  style={{ color: 'var(--text-primary)' }}>
                  Гео-Баттл
                </h1>

                <p className="text-lg md:text-xl mb-12 text-measure" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Четыре раунда. Три команды. Один победитель.
                  Проверьте свои знания о планете.
                </p>

                {/* Team Names */}
                <div className="mb-12">
                  <p className="text-xs tracking-[0.15em] uppercase mb-5" style={{ color: 'var(--text-subtle)' }}>
                    Названия команд
                  </p>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
                    {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                      <motion.div key={team} variants={staggerItem}
                        className="flex items-center gap-4 p-4 rounded-xl transition-all"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{
                          background: [`var(--team-1)`, `var(--team-2)`, `var(--team-3)`][i]
                        }} />
                        <input
                          type="text"
                          value={teamNames[team]}
                          onChange={(e) => setTeamNames(prev => ({ ...prev, [team]: e.target.value }))}
                          className="flex-1 bg-transparent text-lg focus:outline-none"
                          style={{ color: 'var(--text-primary)' }}
                          placeholder={`Команда ${i + 1}`}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Start Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setScreen('round-intro'); setCurrentRound(1); setScores({ team1: 0, team2: 0, team3: 0 }); }}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-medium text-base transition-all"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <Play size={18} strokeWidth={2} />
                  Начать баттл
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ===== ROUND INTRO ===== */}
        {screen === 'round-intro' && (
          <motion.div key={`round-${currentRound}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="min-h-screen flex items-center justify-center p-6 md:p-12 relative">
            <HeroBackground />
            <div className="max-w-2xl w-full text-center relative z-10">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs tracking-[0.2em] uppercase font-mono mb-6 block"
                style={{ color: 'var(--accent-primary)' }}
              >
                Раунд {currentRound} из 4
              </motion.span>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-10 flex justify-center"
              >
                {(() => {
                  const Icon = roundMeta[currentRound - 1].icon;
                  return (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
                      <Icon size={36} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                    </div>
                  );
                })()}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-4xl md:text-5xl font-bold mb-5"
                style={{ color: 'var(--text-primary)' }}
              >
                {roundMeta[currentRound - 1].name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg mb-12 text-measure mx-auto"
                style={{ color: 'var(--text-muted)' }}
              >
                {roundMeta[currentRound - 1].desc}
              </motion.p>

              {/* Scoreboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-4 mb-12"
              >
                {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                  <div key={team} className="text-center px-6 py-5 rounded-xl"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-3" style={{
                      background: [`var(--team-1)`, `var(--team-2)`, `var(--team-3)`][i]
                    }} />
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                      {teamNames[team]}
                    </div>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      {scores[team]}
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setScreen(rounds[currentRound - 1]);
                  setCurrentQuestion(0);
                  setShowResult(false);
                  setTeamAnswers({ team1: null, team2: null, team3: null });
                  setTimer(ROUND_TIME);
                  setTimerActive(false);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--bg-primary)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Play size={18} strokeWidth={2} />
                Начать раунд
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ===== GAME SCREENS ===== */}
        {['flag', 'true-false', 'emoji', 'photo'].includes(screen) && (
          <GameScreen
            key={`game-${currentRound}-${currentQuestion}`}
            screen={screen}
            currentQuestion={currentQuestion}
            totalQuestions={getTotalQuestions()}
            questions={getQuestions()}
            teamNames={teamNames}
            scores={scores}
            timer={timer}
            timerActive={timerActive}
            showResult={showResult}
            teamAnswers={teamAnswers}
            currentRound={currentRound}
            roundMeta={roundMeta}
            onSelectAnswer={selectAnswer}
            onNext={nextQuestion}
          />
        )}

        {/* ===== FINAL ===== */}
        {screen === 'final' && (
          <motion.div key="final" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="min-h-screen flex items-center justify-center p-6 md:p-12 relative">
            <HeroBackground />
            {confetti && <Confetti />}
            <div className="max-w-xl w-full text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-10"
              >
                <Trophy size={64} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Победители
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl md:text-3xl font-display font-bold mb-12"
                style={{ color: 'var(--accent-primary)' }}
              >
                {getWinner()}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-12"
              >
                {[
                  { name: teamNames.team1, score: scores.team1, color: 'var(--team-1)', bg: 'var(--team-1-bg)' },
                  { name: teamNames.team2, score: scores.team2, color: 'var(--team-2)', bg: 'var(--team-2-bg)' },
                  { name: teamNames.team3, score: scores.team3, color: 'var(--team-3)', bg: 'var(--team-3-bg)' },
                ].sort((a, b) => b.score - a.score).map((team, i) => (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center justify-between p-5 rounded-xl"
                    style={{
                      background: i === 0 ? 'var(--accent-muted)' : 'var(--bg-secondary)',
                      border: i === 0 ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-mono font-bold" style={{ color: 'var(--text-subtle)' }}>
                        {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                      </span>
                      <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
                      <span className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>{team.name}</span>
                    </div>
                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-primary)' }}>
                      {team.score}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setScreen('start');
                  setScores({ team1: 0, team2: 0, team3: 0 });
                  setCurrentRound(1);
                  setCurrentQuestion(0);
                  setConfetti(false);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)' }}
              >
                <RotateCcw size={18} strokeWidth={1.5} />
                Играть снова
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// GAME SCREEN COMPONENT
// ============================================
function GameScreen({ screen, currentQuestion, totalQuestions, questions, teamNames, scores, timer, timerActive, showResult, teamAnswers, currentRound, roundMeta, onSelectAnswer, onNext }: {
  screen: string;
  currentQuestion: number;
  totalQuestions: number;
  questions: { options: string[]; correct: number }[];
  teamNames: { team1: string; team2: string; team3: string };
  scores: Scores;
  timer: number;
  timerActive: boolean;
  showResult: boolean;
  teamAnswers: TeamAnswers;
  currentRound: number;
  roundMeta: { name: string; icon: any; desc: string }[];
  onSelectAnswer: (team: Team, idx: number) => void;
  onNext: () => void;
}) {
  const q = questions[currentQuestion];
  const Icon = roundMeta[currentRound - 1].icon;

  return (
    <motion.div
      key={`gs-${currentRound}-${currentQuestion}`}
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="min-h-screen flex flex-col p-4 md:p-6 relative"
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
            <Icon size={20} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {roundMeta[currentRound - 1].name}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>
              {currentQuestion + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
            <div key={team} className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-2 h-2 rounded-full" style={{
                background: [`var(--team-1)`, `var(--team-2)`, `var(--team-3)`][i]
              }} />
              <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {scores[team]}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl"
        >
          {/* Question Visual */}
          <div className="flex justify-center mb-10">
            {screen === 'flag' && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-lg)' }}>
                <img
                  src={`https://flagcdn.com/w640/${(q as any).flagCode}.png`}
                  alt="Флаг страны"
                  className="w-60 h-44 md:w-80 md:h-56 object-cover"
                />
              </div>
            )}
            {screen === 'true-false' && (
              <div className="text-center max-w-2xl">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
                    <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="font-display text-2xl md:text-3xl font-bold leading-snug text-measure mx-auto"
                  style={{ color: 'var(--text-primary)' }}>
                  «{(trueFalseQuestions[currentQuestion]).statement}»
                </p>
              </div>
            )}
            {screen === 'emoji' && (
              <div className="text-center">
                <p className="text-5xl md:text-7xl tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>
                  {(q as EmojiQuestion).emojis}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Какая это страна?</p>
              </div>
            )}
            {screen === 'photo' && (
              <div className="text-center">
                <div className="rounded-2xl overflow-hidden mb-5"
                  style={{ border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-lg)' }}>
                  <img
                    src={(q as PhotoQuestion).image}
                    alt="Достопримечательность"
                    className="w-80 h-48 md:w-[440px] md:h-64 object-cover"
                  />
                </div>
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  {(q as PhotoQuestion).hint}
                </p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="flex justify-center mb-10">
            <CircularTimer time={timer} maxTime={ROUND_TIME} />
          </div>

          {/* Team Panels */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, teamIdx) => {
              const teamVars = [
                { bg: 'var(--team-1-bg)', border: 'var(--team-1-border)', color: 'var(--team-1)', glow: 'var(--team-1-glow)' },
                { bg: 'var(--team-2-bg)', border: 'var(--team-2-border)', color: 'var(--team-2)', glow: 'var(--team-2-glow)' },
                { bg: 'var(--team-3-bg)', border: 'var(--team-3-border)', color: 'var(--team-3)', glow: 'var(--team-3-glow)' },
              ][teamIdx];
              const selected = teamAnswers[team];
              const isCorrect = showResult && selected === q.correct;
              const isWrong = showResult && selected !== null && selected !== q.correct;

              return (
                <motion.div key={team} variants={staggerItem}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    background: teamVars.bg,
                    border: `1px solid ${isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : teamVars.border}`,
                    boxShadow: isCorrect ? `0 0 30px ${teamVars.glow}` : 'var(--shadow-sm)',
                  }}>
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: teamVars.color }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {teamNames[team]}
                      </span>
                    </div>
                    {isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md"
                        style={{ color: 'var(--success)', background: 'var(--success-bg)' }}>
                        <Check size={12} strokeWidth={2.5} /> +1
                      </span>
                    )}
                    {isWrong && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md"
                        style={{ color: 'var(--error)', background: 'var(--error-bg)' }}>
                        <X size={12} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrectOpt = showResult && optIdx === q.correct;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => onSelectAnswer(team, optIdx)}
                          disabled={showResult}
                          className="touch-target py-3 px-3 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: isCorrectOpt ? 'var(--success)' : isSelected && !showResult ? 'var(--text-primary)' : isSelected && showResult ? 'var(--error-bg)' : 'var(--bg-secondary)',
                            color: isCorrectOpt ? '#FFFFFF' : isSelected && !showResult ? 'var(--bg-primary)' : 'var(--text-primary)',
                            border: `1px solid ${isCorrectOpt ? 'var(--success)' : isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                            opacity: isWrong && isSelected ? 0.5 : 1,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Fun Fact */}
          <AnimatePresence>
            {showResult && (screen === 'flag' || screen === 'photo') && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 p-5 rounded-xl mb-6 max-w-lg mx-auto"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Eye size={18} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p className="text-sm text-left leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {screen === 'flag' ? (q as any).funFact : (q as any).funFact}
                </p>
              </motion.div>
            )}
            {showResult && screen === 'true-false' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4 p-5 rounded-xl mb-6 max-w-lg mx-auto"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}
              >
                <Eye size={18} style={{ color: 'var(--accent-primary)' }} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p className="text-sm text-left leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {trueFalseQuestions[currentQuestion].explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNext}
                  className="touch-target inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-primary)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  {currentQuestion < totalQuestions - 1 ? (
                    <>Далее <ChevronRight size={16} strokeWidth={2} /></>
                  ) : (
                    <>Итоги раунда <Target size={16} strokeWidth={2} /></>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================
// UI COMPONENTS
// ============================================

function CircularTimer({ time, maxTime }: { time: number; maxTime: number }) {
  const pct = time / maxTime;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const color = time <= 5 ? 'var(--error)' : time <= 10 ? 'var(--warning)' : 'var(--accent-primary)';

  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none"
          stroke="var(--border-subtle)" strokeWidth="3" />
        <circle cx="32" cy="32" r={radius} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="flex items-center gap-1.5">
        <Timer size={14} style={{ color }} strokeWidth={1.5} />
        <span className="text-lg font-mono font-bold" style={{ color: time <= 5 ? 'var(--error)' : 'var(--text-primary)' }}>
          {time}
        </span>
      </div>
    </div>
  );
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'var(--accent-primary)' }} />
      <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{ background: 'var(--team-2)' }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />
    </div>
  );
}

function Confetti() {
  const colors = ['var(--accent-primary)', 'var(--team-1)', 'var(--team-2)', 'var(--team-3)', 'var(--warning)'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    size: 6 + Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
