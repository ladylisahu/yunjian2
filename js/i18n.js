/**
 * 水镜运见 2.0 · 中英双语国际化引擎 (zh / en)
 * 支持 URL 参数 ?lang=en / ?lang=zh 与 localStorage 记忆
 */
window.YunjianI18n = (function () {
  const STORAGE_KEY = 'yunjian2_lang';

  function detectInitialLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('lang');
      if (q === 'en' || q === 'zh') {
        localStorage.setItem(STORAGE_KEY, q);
        return q;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'zh') return saved;
    } catch {}
    return 'zh';
  }

  let lang = detectInitialLang();

  const UI_STRINGS = {
    zh: {
      docTitle: '水镜运见 · yunjians.com — 东方星象科技 · 运势 · 八字紫微 · 复盘对账',
      brandName: '水镜运见',
      brandSub: '东方星象科技 · 确定性推演 · 水镜 AI',
      navToday: '今日运势 · 黄历',
      navBazi: '八字紫微 · 大运',
      navTrends: '趋势 · 星座榜',
      navCompat: '缘分合盘',
      navDiv: '灵签 · 塔罗',
      navReview: '复盘对账',
      editProfileBtn: '修改我的生辰档案',
      profileEditorTitle: '建立你的专属命盘档案（免登录 · 仅存本机浏览器）',
      profileEditorSub: '保存后，今日日运、八字紫微、流年大运、趋势曲线、复盘对账与水镜 AI 将全站同步联动。',
      lblName: '姓名 / 昵称',
      lblGender: '性别',
      lblBirthDate: '出生公历日期',
      lblBirthHour: '出生时辰',
      lblBirthPlace: '出生地',
      saveProfileBtn: '保存并全站同步',
      todayH1: '今日专属运势 & 智能老黄历',
      todayDesc: '确定性引擎按「生辰档案 × 日期」推演（同人同日结果恒定），融合传统干支黄历与十二时辰吉凶。',
      prevDay: '← 前日',
      nextDay: '次日 →',
      backToday: '回到今日',
      askTodayAi: '✦ 水镜先生 AI 解读今日',
      overallLabel: '综合运势',
      goReviewBtn: '今晚去复盘对账 →',
      yiLabel: '宜',
      jiLabel: '忌',
      chongShaLbl: '今日冲煞',
      caishenLbl: '财神方位',
      xishenLbl: '喜神方位',
      nayinLbl: '五行纳音',
      wardrobeTitle: '每日五行穿衣指南',
      hoursTitle: '十二时辰黄道吉凶',
      hoursNote: '实时定位当前时辰 · 绿色为黄道吉时',
      baziH1: '八字排盘 · 紫微主星 · 大运流年',
      baziDesc: '自动读取你的生辰档案，完整呈现四柱五行、日主命格、紫微命宫主星及近 5 年流年与人生大运。',
      askBaziAi: '✦ 请水镜先生 AI 深度解盘',
      pillarsTitle: '四柱八字命盘',
      wuxingTitle: '五行能量频谱',
      ziweiTitle: '紫微命宫主星',
      liunianTitle: '近五年流年运势推演',
      liunianNote: '自动标注今年流年 · 宏观节拍参考',
      dayunTitle: '人生大运时间轴',
      trendsH1: '个人十日趋势 & 十二星座今日榜',
      trendsDesc: '可视化查看前后 10 日个人运势波动曲线，并与今日十二星座好运排行榜联动速查。',
      askTrendsAi: '✦ AI 剖析未来走势',
      trendChartTitle: '个人运势十日曲线（前 3 日 ~ 后 6 日）',
      trendHint: '点击节点查看当日要点',
      zodiacRankTitle: '十二星座今日好运榜',
      zodiacRankNote: '点击任意星座查看详情',
      compatH1: '缘分合盘速配',
      compatDesc: '融合西洋黄道相位与东方地支三合六合模型，即时测算双人共振指数。',
      modeZodiac: '星座配对',
      modeShengxiao: '生肖配对',
      askCompatAi: '✦ AI 剖析相处之道',
      partyA: '甲方',
      partyB: '乙方',
      calcCompatBtn: '测算共振',
      prosTitle: '合拍亮点',
      adviceTitle: '相处建议',
      divH1: '水镜问卜 · 灵签与塔罗',
      divDesc: '静心默念心中所惑，支持东方水镜灵签及塔罗「单张指引 / 三张时间阵」，结果直连水镜 AI 深度解说。',
      modeQian: '水镜灵签',
      modeTarot: '每日塔罗',
      askDivAi: '✦ 请水镜先生 AI 解签',
      qianPrompt: '心诚则灵 · 默念心中所惑后点击求签',
      drawQianBtn: '摇签问卜',
      redrawQianBtn: '再求一签',
      qianMeaningLbl: '白话解签',
      qianGuideLbl: '运势指引',
      tarotPrompt: '默念想问之事，选择「单张今日指引」或「三张时间牌阵（过去·现在·未来）」',
      drawTarot1Btn: '✦ 抽 1 张 · 今日指引',
      drawTarot3Btn: '✦ 抽 3 张 · 过去 / 现在 / 未来',
      reviewH1: '每日复盘对账',
      reviewDesc: '每晚记录一下真实体感分，与白天系统预测的综合分对照。连续对账，看清真正适合自己的生活节奏。',
      askReviewAi: '✦ 水镜先生 AI 点评复盘',
      reviewCardTitle: '今日对账打卡',
      predictedLbl: '白天预测综合分',
      actualLbl: '你的真实体感分',
      sliderLbl: '滑动给今天的真实状态打分（0 - 100）',
      moodLbl: '今日体感标签',
      noteLbl: '一句话复盘随笔（选填）',
      notePh: '例如：上午方案顺利通过，下午少刷手机效率高了很多...',
      saveReviewBtn: '保存今日对账记录',
      statCountLbl: '累计对账天数',
      statAccLbl: '预测平均吻合度',
      statAvgLbl: '历史平均体感分',
      checkinHistoryTitle: '对账记录（近 90 条 · 本地保存）',
      checkinHistoryNote: '预测分 vs 体感分',
      footerBrand: '水镜运见 · yunjians.com',
      footerDisclaimer: '运势分析与占卜内容仅供文化交流、日常复盘与娱乐参考，不构成任何人生、投资、医疗或法律建议。农历与节气为近似推算。',
      footerRight: '本地优先存储 · 免登录保护隐私 · 水镜 AI 引擎',
      fabText: '问水镜先生',
      agentName: '水镜先生 · AI',
      avatarSwitchLbl: '白胡子老者形象切换',
      apiSectionLbl: '外接大模型 API（可选 · 留空使用内置智能推演）',
      saveApiBtn: '保存配置',
      clearApiBtn: '切回内置引擎',
      agentInputPh: '向水镜先生提问（如：明天适合买股票吗？）',
      sendBtn: '发送'
    },
    en: {
      docTitle: 'Shuijing YunJian · yunjians.com — Eastern Astrology, Five-Element Guide, Tarot & AI Sage',
      brandName: 'Shuijing YunJian',
      brandSub: 'NEO-CELESTIAL · ASTROLOGY · BAZI · AI SAGE',
      navToday: 'Today & Almanac',
      navBazi: 'BaZi & Ziwei',
      navTrends: 'Trends & Zodiac',
      navCompat: 'Compatibility',
      navDiv: 'Oracle & Tarot',
      navReview: 'Daily Review',
      editProfileBtn: 'Edit Birth Profile',
      profileEditorTitle: 'Your Personal Birth Profile (No Sign-Up · Stored Locally)',
      profileEditorSub: 'Once saved, your Daily Fortune, BaZi & Ziwei, 10-Day Trend, Daily Review, and Master Shuijing AI sync automatically.',
      lblName: 'Name / Nickname',
      lblGender: 'Gender',
      lblBirthDate: 'Birth Date (Solar)',
      lblBirthHour: 'Birth Hour',
      lblBirthPlace: 'Birth City',
      saveProfileBtn: 'Save & Sync All',
      todayH1: 'Daily Personal Fortune & Eastern Almanac',
      todayDesc: 'Deterministic daily energy by Birth Profile × Date, combined with traditional Chinese Almanac & Five-Element Lucky Colors.',
      prevDay: '← Prev',
      nextDay: 'Next →',
      backToday: 'Today',
      askTodayAi: '✦ Ask Master Shuijing AI',
      overallLabel: 'Overall',
      goReviewBtn: 'Log Evening Review →',
      yiLabel: 'Do',
      jiLabel: 'Avoid',
      chongShaLbl: 'Daily Clash',
      caishenLbl: 'Wealth Dir.',
      xishenLbl: 'Joy Dir.',
      nayinLbl: 'Day Element',
      wardrobeTitle: 'Daily Five-Element Lucky Color Guide',
      hoursTitle: '12 Auspicious Hours',
      hoursNote: 'Current hour highlighted · Green = Auspicious',
      baziH1: 'BaZi Four Pillars · Ziwei Star · Life Cycles',
      baziDesc: 'Automatically calculated from your birth profile: Four Pillars, Five-Element balance, Day Master, Ziwei Main Star & 5-Year forecast.',
      askBaziAi: '✦ Deep AI Chart Reading',
      pillarsTitle: 'Four Pillars of Destiny (BaZi)',
      wuxingTitle: 'Five-Element Spectrum',
      ziweiTitle: 'Ziwei Main Star',
      liunianTitle: '5-Year Annual Forecast',
      liunianNote: 'Current year highlighted · Macro rhythm guide',
      dayunTitle: '10-Year Major Life Cycles',
      trendsH1: '10-Day Energy Trend & Zodiac Ranking',
      trendsDesc: 'Track your 10-day personal energy curve and explore today’s 12 Western Zodiac lucky leaderboard.',
      askTrendsAi: '✦ AI Trend Analysis',
      trendChartTitle: '10-Day Personal Energy Curve (-3d to +6d)',
      trendHint: 'Click any node for daily insights',
      zodiacRankTitle: 'Today’s Zodiac Ranking',
      zodiacRankNote: 'Click a sign for full details',
      compatH1: 'Compatibility & Synastry',
      compatDesc: 'Explore Western Zodiac elemental harmony and Eastern Chinese Zodiac synastry scores.',
      modeZodiac: 'Western Zodiac',
      modeShengxiao: 'Chinese Zodiac',
      askCompatAi: '✦ AI Relationship Insight',
      partyA: 'Person A',
      partyB: 'Person B',
      calcCompatBtn: 'Check Match',
      prosTitle: 'Strengths',
      adviceTitle: 'Relationship Advice',
      divH1: 'Eastern Oracle Sticks & Major Arcana Tarot',
      divDesc: 'Focus on your question, draw a traditional Shuijing Fortune Stick or a 1-Card / 3-Card Tarot spread, then ask Master Shuijing AI.',
      modeQian: 'Oracle Sticks',
      modeTarot: 'Daily Tarot',
      askDivAi: '✦ Ask AI to Interpret',
      qianPrompt: 'Clear your mind, focus on your question, and shake the oracle cylinder',
      drawQianBtn: 'Draw Oracle Stick',
      redrawQianBtn: 'Draw Again',
      qianMeaningLbl: 'Interpretation',
      qianGuideLbl: 'Guidance',
      tarotPrompt: 'Focus on your question and choose a 1-Card Daily Draw or 3-Card Past / Present / Future spread',
      drawTarot1Btn: '✦ Draw 1 Card · Daily Guidance',
      drawTarot3Btn: '✦ Draw 3 Cards · Past / Present / Future',
      reviewH1: 'Daily Reflection & Score Reconciliation',
      reviewDesc: 'Not superstition—self-reflection. Rate your real-world evening feeling vs. morning forecast to discover your true peak rhythms.',
      askReviewAi: '✦ AI Review Coaching',
      reviewCardTitle: 'Evening Check-In',
      predictedLbl: 'Morning Forecast',
      actualLbl: 'Your Real Feeling',
      sliderLbl: 'Slide to rate how your day actually felt (0 - 100)',
      moodLbl: 'Today’s Vibe',
      noteLbl: 'One-Line Reflection (Optional)',
      notePh: 'e.g. Nailed the morning presentation, stayed focused in the afternoon...',
      saveReviewBtn: 'Save Today’s Check-In',
      statCountLbl: 'Days Logged',
      statAccLbl: 'Avg. Match Rate',
      statAvgLbl: 'Avg. Feeling',
      checkinHistoryTitle: 'Check-In History (Last 90 Days · Local)',
      checkinHistoryNote: 'Forecast vs. Actual',
      footerBrand: 'Shuijing YunJian · yunjians.com',
      footerDisclaimer: 'All astrology, BaZi, Five-Element wardrobe, and tarot readings are for cultural inspiration, reflection, and entertainment only—not financial, medical, or legal advice.',
      footerRight: 'Local-First Privacy · No Sign-Up · Shuijing AI',
      fabText: 'Ask Master AI',
      agentName: 'Master Shuijing · AI',
      avatarSwitchLbl: 'Switch AI Sage Avatar',
      apiSectionLbl: 'Optional LLM API (Leave blank for built-in engine)',
      saveApiBtn: 'Save API',
      clearApiBtn: 'Use Built-In',
      agentInputPh: 'Ask Master Shuijing (e.g., What color should I wear tomorrow?)',
      sendBtn: 'Send'
    }
  };

  // 常用命理词典映射（用于英文模式平滑翻译）
  const ELEMENT_EN = { 金: 'Metal', 木: 'Wood', 水: 'Water', 火: 'Fire', 土: 'Earth' };
  const ANIMAL_EN = {
    鼠: 'Rat', 牛: 'Ox', 虎: 'Tiger', 兔: 'Rabbit', 龙: 'Dragon', 蛇: 'Snake',
    马: 'Horse', 羊: 'Goat', 猴: 'Monkey', 鸡: 'Rooster', 狗: 'Dog', 猪: 'Pig'
  };
  const DIR_EN = {
    正东: 'East', 正西: 'West', 正南: 'South', 正北: 'North',
    东北: 'Northeast', 东南: 'Southeast', 西北: 'Northwest', 西南: 'Southwest'
  };
  const ZODIAC_EN = {
    aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
    leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
    sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces'
  };
  const ZODIAC_CN_TO_EN = {
    白羊座: 'Aries', 金牛座: 'Taurus', 双子座: 'Gemini', 巨蟹座: 'Cancer',
    狮子座: 'Leo', 处女座: 'Virgo', 天秤座: 'Libra', 天蝎座: 'Scorpio',
    射手座: 'Sagittarius', 摩羯座: 'Capricorn', 水瓶座: 'Aquarius', 双鱼座: 'Pisces'
  };
  const COLOR_TIER_EN = {
    贵人色: { level: 'Best', name: 'Noble Color', desc: 'Generated by today’s element — attracts helpful people, harmony, and smooth social energy.' },
    合作色: { level: 'Good', name: 'Partner Color', desc: 'Matches today’s element — ideal for teamwork, client meetings, and negotiations.' },
    进财色: { level: 'Neutral', name: 'Wealth Color', desc: 'Controls today’s element — rewards focused effort and proactive breakthroughs.' },
    消耗色: { level: 'Weak', name: 'Drain Color', desc: 'Feeds today’s element — can feel slightly tiring; best worn when your energy is high.' },
    不利色: { level: 'Avoid', name: 'Unfavorable', desc: 'Controlled by today’s element — may add friction; avoid wearing in large areas for key events.' }
  };
  const PALETTE_EN = {
    金: 'White, Silver, Ivory, Cream',
    土: 'Yellow, Camel, Brown, Khaki, Earthy Tones',
    木: 'Green, Emerald, Teal, Mint',
    火: 'Red, Pink, Coral, Orange, Purple',
    水: 'Black, Navy Blue, Slate Grey'
  };

  function getLang() {
    return lang;
  }

  function isEn() {
    return lang === 'en';
  }

  function t(key) {
    return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS.zh[key] || key;
  }

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      const url = new URL(window.location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      window.history.replaceState({}, '', url.toString());
    } catch {}
    applyStaticDOM();
    window.dispatchEvent(new CustomEvent('yunjian:langchange', { detail: { lang } }));
  }

  function toggleLang() {
    setLang(lang === 'en' ? 'zh' : 'en');
  }

  function applyStaticDOM() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = t('docTitle');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });

    const toggleBtn = document.getElementById('langToggleBtn');
    if (toggleBtn) {
      toggleBtn.textContent = lang === 'en' ? '中文' : 'EN';
      toggleBtn.title = lang === 'en' ? '切换至中文' : 'Switch to English';
    }
  }

  return {
    getLang,
    isEn,
    t,
    setLang,
    toggleLang,
    applyStaticDOM,
    ELEMENT_EN,
    ANIMAL_EN,
    DIR_EN,
    ZODIAC_EN,
    ZODIAC_CN_TO_EN,
    COLOR_TIER_EN,
    PALETTE_EN
  };
})();
