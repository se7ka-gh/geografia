import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag, CheckCircle, XCircle, Camera, Map, Trophy, Play,
  ChevronRight, RotateCcw, Timer, Sparkles, Globe, Eye,
  Users, Target
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
  // Сложные
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
  // Сложные
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
  // Сложные
  { emojis: '🏔️ 🧘 🐘', options: ['Индия', 'Непал', 'Тибет', 'Бутан'], correct: 1 },
  { emojis: '🌋 🏝️ 🌺', options: ['Индонезия', 'Филиппины', 'Гавайи', 'Мадагаскар'], correct: 0 },
  { emojis: '🏰 🧇 🍺', options: ['Германия', 'Бельгия', 'Нидерланды', 'Швейцария'], correct: 1 },
];

const photoQuestions: PhotoQuestion[] = [
  { image: 'https://images.unsplash.com/photo-1502602682916-037bb0d46fb8?w=800&q=80', hint: 'Металлическая решётчатая башня, символ города', options: ['Лондон', 'Париж', 'Берлин', 'Рим'], correct: 1, funFact: 'Эйфелева башня должна была быть демонтирована через 20 лет после постройки.' },
  { image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', hint: 'Амфитеатр, где сражались гладиаторы', options: ['Афины', 'Стамбул', 'Рим', 'Каир'], correct: 2, funFact: 'Колизей вмещал до 80 000 зрителей — больше, чем многие современные стадионы.' },
  { image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80', hint: 'Монумент на острове с факелом в руке', options: ['Вашингтон', 'Лондон', 'Нью-Йорк', 'Париж'], correct: 2, funFact: 'Статуя Свободы — подарок Франции. Изначально медного цвета.' },
  { image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80', hint: 'Древние монументальные гробницы в пустыне', options: ['Марокко', 'Египет', 'Иордания', 'Саудовская Аравия'], correct: 1, funFact: 'Великая пирамида оставалась самым высоким сооружением 3 800 лет.' },
  { image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80', hint: 'Священная гора с идеальной конической формой', options: ['Корея', 'Непал', 'Япония', 'Китай'], correct: 2, funFact: 'Фудзи — действующий вулкан. Последнее извержение в 1707 году.' },
  { image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80', hint: 'Древний город в облаках, затерянный в горах', options: ['Боливия', 'Перу', 'Эквадор', 'Мексика'], correct: 1, funFact: 'Мачу-Пикчу был «открыт заново» американским историком в 1911 году.' },
  { image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80', hint: 'Масштабное фортификационное сооружение через горы', options: ['Монголия', 'Корея', 'Китай', 'Япония'], correct: 2, funFact: 'Общая длина — более 21 000 км. Строительство длилось два тысячелетия.' },
  { image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80', hint: 'Античный храм с мраморными колоннами', options: ['Рим', 'Афины', 'Стамбул', 'Каир'], correct: 1, funFact: 'Парфенон построен в 438 году до н.э. — ему более 2 400 лет.' },
  // Сложные
  { image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', hint: 'Бело-мраморный мавзолей с куполом', options: ['Пакистан', 'Индия', 'Иран', 'Турция'], correct: 1, funFact: 'Тадж-Махал построен императором в память о любимой жене.' },
  { image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80', hint: 'Водопад на границе двух стран', options: ['Бразилия/Аргентина', 'США/Канада', 'Замбия/Зимбабве', 'Венесуэла/Гайана'], correct: 0, funFact: 'Игуасу — система из 275 водопадов шириной 2,7 км.' },
  { image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80', hint: 'Древний город, высеченный в скалах', options: ['Иордания', 'Йемен', 'Оман', 'Саудовская Аравия'], correct: 0, funFact: 'Петра — столица Набатейского царства, высечена в розовых скалах.' },
  { image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80', hint: 'Город с видом на залив и мост', options: ['Рио-де-Жанейро', 'Кейптаун', 'Сидней', 'Сан-Франциско'], correct: 2, funFact: 'Оперный театр в Сиднее — шедевр экспрессионизма XX века.' },
];

// ============================================
// ANIMATION VARIANTS
// ============================================
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
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

  // Auto-start timer on new question
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
    
    // Сразу добавляем очки к общему счёту
    const questions = getQuestions();
    const q = questions[currentQuestion];
    const newScores = { ...scores };
    
    (['team1', 'team2', 'team3'] as Team[]).forEach(team => {
      if (answers[team] === q.correct) {
        newScores[team] += 1;
      }
    });
    
    setScores(newScores);
  }, [currentQuestion, currentRound, scores]);

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
      // Раунд окончен
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

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <AnimatePresence mode="wait">
        {/* ===== START SCREEN ===== */}
        {screen === 'start' && (
          <motion.div key="start" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="min-h-screen flex items-center justify-center p-6 relative grain">
            <HeroBackground />
            <div className="max-w-xl w-full relative z-10">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <div className="flex items-center gap-3 mb-6">
                  <Globe size={24} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
                  <span className="text-sm tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    Интерактивный урок
                  </span>
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-black leading-tight mb-4"
                  style={{ color: 'var(--color-text)' }}>
                  Гео-<br />Баттл
                </h1>

                <p className="text-lg mb-12 text-measure" style={{ color: 'var(--color-text-muted)' }}>
                  Четыре раунда. Три команды. Один победитель.
                  Проверьте свои знания о планете в формате соревнования.
                </p>

                <div className="space-y-4 mb-10">
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                    Названия команд
                  </p>
                  {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                    <motion.div key={team} variants={staggerItem} initial="initial" animate="animate"
                      className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{
                        background: [`var(--color-team-1)`, `var(--color-team-2)`, `var(--color-team-3)`][i]
                      }} />
                      <input
                        type="text"
                        value={teamNames[team]}
                        onChange={(e) => setTeamNames(prev => ({ ...prev, [team]: e.target.value }))}
                        className="flex-1 bg-transparent border-b text-lg py-2 focus:outline-none transition-colors"
                        style={{
                          borderColor: 'var(--color-border-strong)',
                          color: 'var(--color-text)',
                        }}
                        placeholder={`Команда ${i + 1}`}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setScreen('round-intro'); setCurrentRound(1); setScores({ team1: 0, team2: 0, team3: 0 }); }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-lg font-medium text-base transition-all"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
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
            className="min-h-screen flex items-center justify-center p-6 relative grain">
            <HeroBackground />
            <div className="max-w-2xl w-full text-center relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className="text-sm tracking-widest uppercase font-mono" style={{ color: 'var(--color-accent)' }}>
                  Раунд {currentRound} из 4
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-8 flex justify-center"
              >
                {(() => {
                  const Icon = roundMeta[currentRound - 1].icon;
                  return (
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--color-accent-muted)', border: '1px solid var(--color-accent-glow)' }}>
                      <Icon size={36} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
                    </div>
                  );
                })()}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-4xl md:text-5xl font-bold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                {roundMeta[currentRound - 1].name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg mb-10 text-measure mx-auto"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {roundMeta[currentRound - 1].desc}
              </motion.p>

              {/* Scoreboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-6 mb-10"
              >
                {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
                  <div key={team} className="text-center px-5 py-4 rounded-xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{
                      background: [`var(--color-team-1)`, `var(--color-team-2)`, `var(--color-team-3)`][i]
                    }} />
                    <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      {teamNames[team]}
                    </div>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text)' }}>
                      {scores[team]}
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setScreen(rounds[currentRound - 1]);
                  setCurrentQuestion(0);
                  setShowResult(false);
                  setTeamAnswers({ team1: null, team2: null, team3: null });
                  setTimer(ROUND_TIME);
                  setTimerActive(false);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-medium transition-all"
                style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
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
            className="min-h-screen flex items-center justify-center p-6 relative grain">
            <HeroBackground />
            {confetti && <Confetti />}
            <div className="max-w-xl w-full text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-8"
              >
                <Trophy size={64} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl font-bold mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                Победители
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-display font-bold mb-10"
                style={{ color: 'var(--color-accent)' }}
              >
                {getWinner()}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-10"
              >
                {[
                  { name: teamNames.team1, score: scores.team1, color: 'var(--color-team-1)', bg: 'var(--color-team-1-bg)' },
                  { name: teamNames.team2, score: scores.team2, color: 'var(--color-team-2)', bg: 'var(--color-team-2-bg)' },
                  { name: teamNames.team3, score: scores.team3, color: 'var(--color-team-3)', bg: 'var(--color-team-3-bg)' },
                ].sort((a, b) => b.score - a.score).map((team, i) => (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: i === 0 ? 'var(--color-accent-muted)' : 'var(--color-surface)',
                      border: i === 0 ? '1px solid var(--color-accent-glow)' : '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-mono font-bold" style={{ color: 'var(--color-text-subtle)' }}>
                        {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                      </span>
                      <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{team.name}</span>
                    </div>
                    <span className="text-2xl font-bold font-mono" style={{ color: 'var(--color-accent)' }}>
                      {team.score}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setScreen('start');
                  setScores({ team1: 0, team2: 0, team3: 0 });
                  setCurrentRound(1);
                  setCurrentQuestion(0);
                  setConfetti(false);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-medium transition-all"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)', border: '1px solid var(--color-border-strong)' }}
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
      className="min-h-screen flex flex-col p-4 md:p-6 relative grain"
    >
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent-muted)' }}>
            <Icon size={18} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {roundMeta[currentRound - 1].name}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--color-text-subtle)' }}>
              {currentQuestion + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, i) => (
              <div key={team} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}>
                <div className="w-2 h-2 rounded-full" style={{
                  background: [`var(--color-team-1)`, `var(--color-team-2)`, `var(--color-team-3)`][i]
                }} />
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                  {scores[team]}
                </span>
              </div>
            ))}        </div>
      </header>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          {/* Question Visual */}
          <div className="flex justify-center mb-8">
            {screen === 'flag' && (
              <div className="rounded-xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid var(--color-border-strong)' }}>
                <img
                  src={`https://flagcdn.com/w640/${(q as any).flagCode}.png`}
                  alt="Флаг страны"
                  className="w-56 h-40 md:w-72 md:h-52 object-cover"
                />
              </div>
            )}
            {screen === 'true-false' && (
              <div className="text-center max-w-2xl">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-accent-muted)' }}>
                    <Sparkles size={24} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="font-display text-2xl md:text-3xl font-bold leading-snug text-measure mx-auto"
                  style={{ color: 'var(--color-text)' }}>
                  «{(trueFalseQuestions[currentQuestion]).statement}»
                </p>
              </div>
            )}
            {screen === 'emoji' && (
              <div className="text-center">
                <p className="text-5xl md:text-6xl tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>
                  {(q as EmojiQuestion).emojis}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Какая это страна?</p>
              </div>
            )}
            {screen === 'photo' && (
              <div className="text-center">
                <div className="rounded-xl overflow-hidden shadow-2xl mb-4"
                  style={{ border: '1px solid var(--color-border-strong)' }}>
                  <img
                    src={(q as PhotoQuestion).image}
                    alt="Достопримечательность"
                    className="w-72 h-44 md:w-[420px] md:h-60 object-cover"
                  />
                </div>
                <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                  {(q as PhotoQuestion).hint}
                </p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="flex justify-center mb-8">
            <CircularTimer time={timer} maxTime={ROUND_TIME} active={true} />
          </div>

          {/* Team Panels */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(['team1', 'team2', 'team3'] as Team[]).map((team, teamIdx) => {
              const teamColors = [
                { bg: 'var(--color-team-1-bg)', border: 'var(--color-team-1-border)', color: 'var(--color-team-1)' },
                { bg: 'var(--color-team-2-bg)', border: 'var(--color-team-2-border)', color: 'var(--color-team-2)' },
                { bg: 'var(--color-team-3-bg)', border: 'var(--color-team-3-border)', color: 'var(--color-team-3)' },
              ][teamIdx];
              const selected = teamAnswers[team];
              const isCorrect = showResult && selected === q.correct;
              const isWrong = showResult && selected !== null && selected !== q.correct;

              return (
                <motion.div key={team} variants={staggerItem}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: teamColors.bg,
                    border: `1px solid ${isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : teamColors.border}`,
                    boxShadow: isCorrect ? '0 0 20px var(--color-success-bg)' : 'none',
                  }}>
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: teamColors.color }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {teamNames[team]}
                      </span>
                    </div>
                    {isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                        <CheckCircle size={14} strokeWidth={2} /> +1
                      </span>
                    )}
                    {isWrong && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-error)' }}>
                        <XCircle size={14} strokeWidth={2} />
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className={`grid ${screen === 'true-false' ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrectOpt = showResult && optIdx === q.correct;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => onSelectAnswer(team, optIdx)}
                          disabled={showResult}
                          className="touch-target py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: isCorrectOpt
                              ? 'var(--color-success)'
                              : isSelected && !showResult
                              ? 'var(--color-text)'
                              : isSelected && showResult
                              ? 'var(--color-error-bg)'
                              : 'var(--color-surface)',
                            color: isCorrectOpt
                              ? 'var(--color-bg)'
                              : isSelected && !showResult
                              ? 'var(--color-bg)'
                              : 'var(--color-text)',
                            border: `1px solid ${isCorrectOpt ? 'var(--color-success)' : isSelected ? 'var(--color-text)' : 'var(--color-border)'}`,
                            opacity: isWrong && isSelected ? 0.6 : 1,
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl mb-4 max-w-lg mx-auto"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <Eye size={18} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p className="text-sm text-left" style={{ color: 'var(--color-text-muted)' }}>
                  {screen === 'flag' ? (q as any).funFact : (q as any).funFact}
                </p>
              </motion.div>
            )}
            {showResult && screen === 'true-false' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl mb-4 max-w-lg mx-auto"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <Eye size={18} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p className="text-sm text-left" style={{ color: 'var(--color-text-muted)' }}>
                  {trueFalseQuestions[currentQuestion].explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <button
                  onClick={onNext}
                  className="touch-target inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                >
                  {currentQuestion < totalQuestions - 1 ? (
                    <>Далее <ChevronRight size={16} strokeWidth={2} /></>
                  ) : (
                    <>Итоги раунда <Target size={16} strokeWidth={2} /></>
                  )}
                </button>
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

function CircularTimer({ time, maxTime, active }: { time: number; maxTime: number; active: boolean }) {
  const pct = time / maxTime;
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const color = time <= 5 ? 'var(--color-error)' : time <= 10 ? 'var(--color-warning)' : 'var(--color-accent)';

  return (
    <div className={`relative w-16 h-16 flex items-center justify-center transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={radius} fill="none"
          stroke="var(--color-border)" strokeWidth="3" />
        <circle cx="30" cy="30" r={radius} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="flex items-center gap-1.5">
        <Timer size={14} style={{ color }} strokeWidth={1.5} />
        <span className="text-lg font-mono font-bold" style={{ color: time <= 5 ? 'var(--color-error)' : 'var(--color-text)' }}>
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
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--color-accent)' }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--color-team-2)' }} />
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />
    </div>
  );
}

function Confetti() {
  const colors = ['var(--color-accent)', 'var(--color-team-1)', 'var(--color-team-2)', 'var(--color-team-3)', 'var(--color-warning)'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
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
