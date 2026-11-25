/**
 * 水镜运见 2.0 · 确定性个人运势、趋势、大运流年、星座榜与复盘对账引擎
 * 原则：同人（出生档案）× 同日（日期）结果恒定，娱乐参考与复盘工具
 */
window.YunjianFortune = (function () {
  const PROFILE_KEY = 'yunjian2_profile';
  const CHECKINS_KEY = 'yunjian2_checkins';

  const DEFAULT_PROFILE = {
    name: '小运',
    gender: 'male',
    birthDate: '1995-08-18',
    birthHour: 5, // 巳时
    birthPlace: '北京',
    isCustom: false
  };

  const DAILY_KEYWORDS = [
    '顺势破局', '稳中求进', '贵人提携', '灵感迸发',
    '静心沉淀', '聚焦核心', '收获回响', '温和蓄力',
    '机缘敲门', '守正出奇', '松弛有序', '水到渠成'
  ];

  const DAILY_SUMMARIES = [
    '今日天时与命盘共振度高，适合推进悬而未决的关键沟通或启动新计划。',
    '整体节奏平稳向上，把精力集中在最核心的两件事上，比面面俱到更出成果。',
    '人际与合作气场偏旺，主动发出一句问候或分享想法，容易收获意料之外的助力。',
    '直觉与专注力在线，适合复盘整理、创意输出或敲定中长期财务与工作规划。',
    '偶有小插曲但不影响大局，遇事慢半拍确认细节，反而能把小变动转化为新机会。',
    '身心状态偏松弛，适合在高效收尾之余好好犒劳自己，保持好情绪即是开运。'
  ];

  const LIUNIAN_THEMES = [
    { tag: '蓄势扎根', tip: '打磨底层能力与口碑，少盲目扩张，把基本盘做厚。' },
    { tag: '破土而出', tip: '新赛道与新机会浮现，适合主动争取关键岗位或项目主导权。' },
    { tag: '贵人合局', tip: '合作运与人脉杠杆显著增强，借力优质伙伴事半功倍。' },
    { tag: '财星照临', tip: '正财稳健且具备变现契机，适合把过往积累转化为实际收益。' },
    { tag: '登高望远', tip: '视野与格局跃升之年，利于跨界学习、升级圈层或布局长远。' },
    { tag: '修心平衡', tip: '节奏宜张弛有度，兼顾健康与家庭关系，稳守成果待时而动。' }
  ];

  const DAYUN_STAGES = [
    { label: '初运启蒙', theme: '探索自我与建立底色，多尝试不同方向积累经验。' },
    { label: '青云立基', theme: '事业与专业快速成型期，选准主航道深耕回报极高。' },
    { label: '盛运纵横', theme: '资源整合与影响力放大阶段，善用团队与平台借势。' },
    { label: '稳运丰收', theme: '经验复利显现，重质量轻内耗，财务与生活更趋从容。' },
    { label: '通达自在', theme: '阅历通透、化繁为简，适合传承经验与享受内在丰盈。' }
  ];

  const isEn = () => !!(window.YunjianI18n && window.YunjianI18n.isEn());
  const DAILY_KEYWORDS_EN = [
    'Break Through with Flow', 'Steady Progress', 'Helpful Allies', 'Spark of Inspiration',
    'Quiet Consolidation', 'Focus on the Core', 'Echoes of Reward', 'Gentle Build-Up',
    'Opportunity Knocks', 'Principled Creativity', 'Relaxed Yet Orderly', 'Natural Momentum'
  ];
  const DAILY_SUMMARIES_EN = [
    'Today resonates strongly with your chart — a good moment to push a pending key conversation or kick off a new plan.',
    'The rhythm is steady and rising. Focus on your two most important tasks rather than trying to cover everything.',
    'Social and teamwork energy is strong. A simple greeting or shared idea may bring unexpected support.',
    'Intuition and focus are on point — great for reviewing, creative output, or settling mid-to-long-term plans.',
    'Small hiccups may appear but won’t change the big picture. Slow down to double-check details and turn changes into chances.',
    'You feel relaxed today. Wrap up efficiently, then treat yourself — a good mood is your best luck charm.'
  ];
  const LIUNIAN_THEMES_EN = [
    { tag: 'Rooting & Building', tip: 'Polish core skills and reputation; expand less, strengthen your foundation more.' },
    { tag: 'Breaking Ground', tip: 'New tracks and opportunities emerge — proactively go for key roles or project leadership.' },
    { tag: 'Allies Align', tip: 'Partnerships and network leverage grow — teaming up with great people multiplies results.' },
    { tag: 'Wealth Star Shines', tip: 'Steady income with chances to monetize — turn past accumulation into real returns.' },
    { tag: 'Climbing Higher', tip: 'A year of broader vision — good for cross-disciplinary learning and long-term positioning.' },
    { tag: 'Inner Balance', tip: 'Balance effort and rest, care for health and family, and protect your gains while waiting for timing.' }
  ];
  const DAYUN_STAGES_EN = [
    { label: 'Early Discovery', theme: 'Explore yourself and build your base; try many directions to gain experience.' },
    { label: 'Rising Foundation', theme: 'Career and expertise take shape fast; deepening one main track pays off greatly.' },
    { label: 'Peak Expansion', theme: 'A stage of integrating resources and amplifying influence — leverage teams and platforms.' },
    { label: 'Steady Harvest', theme: 'Experience compounds; favor quality over friction as finances and life grow easier.' },
    { label: 'Free & At Ease', theme: 'Clear-sighted and simplified — share your experience and enjoy inner abundance.' }
  ];

  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return { ...DEFAULT_PROFILE };
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }

  function saveProfile(profile) {
    const clean = {
      name: (profile.name || '小运').trim().slice(0, 16),
      gender: profile.gender === 'female' ? 'female' : 'male',
      birthDate: profile.birthDate || '1995-08-18',
      birthHour: Number.isFinite(Number(profile.birthHour)) ? Number(profile.birthHour) : 5,
      birthPlace: (profile.birthPlace || '北京').trim().slice(0, 20),
      isCustom: true
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(clean));
    return clean;
  }

  function profileFingerprint(profile) {
    return `${profile.birthDate}|${profile.birthHour}|${profile.gender}|${profile.name}`;
  }

  /** 确定性个人日运（同人同日恒定） */
  function getDailyPersonalFortune(profile, date = new Date()) {
    const dateKey = formatDateKey(date);
    const seed = hashStr(`yj2:${profileFingerprint(profile)}:${dateKey}`);

    const career = 62 + (seed % 36);
    const wealth = 60 + (Math.floor(seed / 13) % 38);
    const love = 61 + (Math.floor(seed / 29) % 37);
    const health = 65 + (Math.floor(seed / 53) % 33);
    const social = 62 + (Math.floor(seed / 97) % 36);
    const overall = Math.round((career * 0.24 + wealth * 0.22 + love * 0.2 + health * 0.16 + social * 0.18));

    return {
      dateKey,
      overall,
      keyword: (isEn() ? DAILY_KEYWORDS_EN : DAILY_KEYWORDS)[seed % DAILY_KEYWORDS.length],
      summary: (isEn() ? DAILY_SUMMARIES_EN : DAILY_SUMMARIES)[Math.floor(seed / 7) % DAILY_SUMMARIES.length],
      dimensions: [
        { key: 'career', label: '事业', score: career, color: '#38BDF8' },
        { key: 'wealth', label: '财运', score: wealth, color: '#E5B96B' },
        { key: 'love', label: '感情', score: love, color: '#FB7185' },
        { key: 'health', label: '健康', score: health, color: '#34D399' },
        { key: 'social', label: '人际', score: social, color: '#A78BFA' }
      ]
    };
  }

  /** 个人近 10 日（前 3 天 + 今天 + 后 6 天）运势趋势序列 */
  function getTrendSeries(profile, baseDate = new Date()) {
    const series = [];
    for (let offset = -3; offset <= 6; offset++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      const f = getDailyPersonalFortune(profile, d);
      series.push({
        offset,
        isToday: offset === 0,
        shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
        dateKey: f.dateKey,
        score: f.overall,
        keyword: f.keyword,
        summary: f.summary
      });
    }
    return series;
  }

  /** 流年（近 5 年）与大运（每 10 年一运）时间轴 */
  function getDayunAndLiunian(profile, currentYear = new Date().getFullYear()) {
    const STEMS = window.ShuijingCalendar.STEMS;
    const BRANCHES = window.ShuijingCalendar.BRANCHES;
    const birthYear = parseInt((profile.birthDate || '1995-08-18').split('-')[0], 10) || 1995;
    const currentAge = Math.max(1, currentYear - birthYear + 1);
    const fp = profileFingerprint(profile);

    const liunian = [];
    for (let y = currentYear - 1; y <= currentYear + 3; y++) {
      const gzIdx = ((y - 4) % 60 + 60) % 60;
      const gz = `${STEMS[gzIdx % 10]}${BRANCHES[gzIdx % 12]}年`;
      const s = hashStr(`ln:${fp}:${y}`);
      const score = 68 + (s % 29);
      const theme = (isEn() ? LIUNIAN_THEMES_EN : LIUNIAN_THEMES)[s % LIUNIAN_THEMES.length];
      liunian.push({
        year: y,
        age: Math.max(1, y - birthYear + 1),
        isCurrent: y === currentYear,
        ganzhi: gz,
        score,
        tag: theme.tag,
        tip: theme.tip
      });
    }

    const startAge = 6 + (hashStr(fp) % 4); // 6~9岁起运
    const dayun = DAYUN_STAGES.map((st, idx) => {
      const fromAge = startAge + idx * 10;
      const toAge = fromAge + 9;
      const isCurrent = currentAge >= fromAge && currentAge <= toAge;
      const pillarIdx = (hashStr(fp) + idx * 7) % 60;
      const pillar = isEn() ? `${STEMS[pillarIdx % 10]}${BRANCHES[pillarIdx % 12]} Cycle` : `${STEMS[pillarIdx % 10]}${BRANCHES[pillarIdx % 12]}运`;
      return {
        range: isEn() ? `Age ${fromAge} - ${toAge}` : `${fromAge} - ${toAge} 岁`,
        years: `${birthYear + fromAge - 1} - ${birthYear + toAge - 1}`,
        pillar,
        label: isEn() ? DAYUN_STAGES_EN[idx].label : st.label,
        theme: isEn() ? DAYUN_STAGES_EN[idx].theme : st.theme,
        isCurrent
      };
    });

    return { currentAge, liunian, dayun };
  }

  /** 十二星座今日好运榜（1-12 确定性排行） */
  function getZodiacDailyRanking(date = new Date()) {
    const dateKey = formatDateKey(date);
    const signs = window.ShuijingHoroscope.SIGNS;
    const list = signs.map(s => {
      const seed = hashStr(`zrank:${dateKey}:${s.id}`);
      const score = 62 + (seed % 37); // 62~98
      const horo = window.ShuijingHoroscope.getDailyHoroscope(s.id, date);
      return {
        ...s,
        score,
        luckyColor: horo.luckyColor,
        quote: horo.quote
      };
    });
    list.sort((a, b) => b.score - a.score);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  /** 复盘对账存储（近 90 天） */
  function getCheckins() {
    try {
      const raw = localStorage.getItem(CHECKINS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCheckin(entry) {
    const list = getCheckins().filter(item => item.dateKey !== entry.dateKey);
    list.unshift({
      dateKey: entry.dateKey,
      predicted: Number(entry.predicted),
      actual: Number(entry.actual),
      mood: entry.mood || '平稳',
      note: (entry.note || '').trim().slice(0, 120),
      updatedAt: Date.now()
    });
    const trimmed = list.slice(0, 90);
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(trimmed));
    return trimmed;
  }

  function getCheckinStats(list) {
    if (!list || list.length === 0) {
      return { count: 0, avgAccuracy: null, avgActual: null, avgPredicted: null };
    }
    let accSum = 0;
    let actSum = 0;
    let predSum = 0;
    list.forEach(item => {
      const diff = Math.abs(item.predicted - item.actual);
      accSum += Math.max(0, 100 - diff);
      actSum += item.actual;
      predSum += item.predicted;
    });
    return {
      count: list.length,
      avgAccuracy: Math.round(accSum / list.length),
      avgActual: Math.round(actSum / list.length),
      avgPredicted: Math.round(predSum / list.length)
    };
  }

  return {
    getProfile,
    saveProfile,
    formatDateKey,
    getDailyPersonalFortune,
    getTrendSeries,
    getDayunAndLiunian,
    getZodiacDailyRanking,
    getCheckins,
    saveCheckin,
    getCheckinStats
  };
})();
