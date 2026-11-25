/**
 * 水镜运见 2.0 · 水镜先生 AI 智能体引擎
 * 实时感知：个人生辰档案、今日日运+黄历、八字紫微+大运流年、趋势+星座榜、合盘、灵签/塔罗(1/3张)、复盘对账
 */
window.ShuijingAgent = (function () {
  const STORAGE_AVATAR = 'yunjian2_avatar';
  const STORAGE_API = 'yunjian2_llm_api';

  const state = {
    activeTab: 'today',
    avatar: localStorage.getItem(STORAGE_AVATAR) || 'assets/sage-a.jpg',
    apiConfig: loadApiConfig(),
    profile: null,
    context: {
      today: null,
      bazi: null,
      trends: null,
      compatibility: null,
      divination: null,
      review: null
    },
    isBusy: false
  };

  const TAB_LABELS = {
    today: '今日运势 · 黄历',
    bazi: '八字紫微 · 大运',
    trends: '趋势 · 星座榜',
    compatibility: '缘分合盘',
    divination: '灵签 · 塔罗',
    review: '复盘对账'
  };

  const QUICK_PROMPTS = {
    today: ['今天穿什么颜色最旺贵人和合作？', '综合解读我今天的运势与择吉', '今天适合签约或谈重要合作吗？'],
    bazi: ['串联解读我的八字、紫微与今年流年', '我五行强弱该如何日常调理？', '我当前所处大运有什么关键机会？'],
    trends: ['分析我未来几天运势走势与节奏', '今日星座运势有哪些开运细节？', '这周哪一天最适合推进大事？'],
    compatibility: ['深度剖析我们俩的相处之道', '遇到分歧时怎么化解最有效？', '我们适合长期发展或合伙吗？'],
    divination: ['结合我刚抽到的签/塔罗深度解说', '如果我问的是事业，这卦怎么解？', '如果我问的是感情，有何启示？'],
    review: ['点评我最近的复盘对账记录', '预测分和体感分有偏差说明什么？', '怎么利用复盘找到我的高效节奏？']
  };

  const isEn = () => !!(window.YunjianI18n && window.YunjianI18n.isEn());

  const TAB_LABELS_EN = {
    today: 'Today · Almanac',
    bazi: 'BaZi · Ziwei · Cycles',
    trends: 'Trends · Zodiac Ranking',
    compatibility: 'Compatibility',
    divination: 'Fortune Lots · Tarot',
    review: 'Daily Reflection'
  };

  const QUICK_PROMPTS_EN = {
    today: ['What color should I wear today for helpful people and teamwork?', 'Give me an overall reading of today', 'Is today good for signing or an important deal?'],
    bazi: ['Connect my BaZi, Ziwei star and this year’s cycle', 'How can I balance my Five Elements day to day?', 'What key opportunities does my current 10-year cycle bring?'],
    trends: ['Analyze my trend and rhythm for the coming days', 'Any lucky details in today’s horoscope?', 'Which day this week is best for big moves?'],
    compatibility: ['Deep dive into how we get along', 'How do we best resolve disagreements?', 'Are we suited for a long-term relationship or partnership?'],
    divination: ['Interpret the lot / tarot I just drew', 'What does it mean for my career?', 'What does it suggest about love?'],
    review: ['Review my recent check-ins', 'What does a gap between forecast and feeling mean?', 'How can reflection help me find my productive rhythm?']
  };

  const tabLabels = () => (isEn() ? TAB_LABELS_EN : TAB_LABELS);
  const quickPrompts = () => (isEn() ? QUICK_PROMPTS_EN : QUICK_PROMPTS);

  function loadApiConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_API);
      return raw ? JSON.parse(raw) : { baseUrl: '', apiKey: '', model: '' };
    } catch {
      return { baseUrl: '', apiKey: '', model: '' };
    }
  }

  function hasLiveApi() {
    return Boolean(state.apiConfig && state.apiConfig.apiKey && state.apiConfig.baseUrl);
  }

  function setProfile(profile) {
    state.profile = profile;
    updateContextUI();
  }

  function setContext(tab, data) {
    state.context[tab] = data;
    updateContextUI();
  }

  function setActiveTab(tab) {
    state.activeTab = tab;
    updateContextUI();
    renderQuickPrompts();
  }

  function updateContextUI() {
    const line = document.getElementById('agentContextLine');
    if (!line) return;
    const en = isEn();
    const label = tabLabels()[state.activeTab] || (en ? 'Almanac' : '星象历法');
    const userTag = state.profile ? `${state.profile.name}` : (en ? 'Guest' : '访客');
    let detail = '';

    if (en) {
      if (state.activeTab === 'today' && state.context.today) {
        detail = ` · Overall ${state.context.today.personal.overall} pts`;
      } else if (state.activeTab === 'bazi' && state.context.bazi) {
        detail = ` · ${state.context.bazi.bazi.dayMaster.title.split(' · ')[0]} · ${state.context.bazi.bazi.ziweiStar.name}`;
      } else if (state.activeTab === 'trends' && state.context.trends) {
        const sn = state.context.trends.horoscope.sign;
        detail = ` · ${(window.YunjianI18n.ZODIAC_EN || {})[sn.id] || sn.name}`;
      } else if (state.activeTab === 'compatibility' && state.context.compatibility) {
        detail = ` · ${state.context.compatibility.pairTitle} (${state.context.compatibility.score} pts)`;
      } else if (state.activeTab === 'divination' && state.context.divination) {
        const d = state.context.divination;
        detail = d.type === 'qian' ? ` · ${d.data.num} “${d.data.title}”` : ` · ${d.cards.length}-card tarot spread`;
      } else if (state.activeTab === 'review' && state.context.review) {
        detail = ` · ${state.context.review.stats.count} days logged`;
      }
      line.textContent = `Live context (${userTag}): ${label}${detail}`;
      return;
    }

    if (state.activeTab === 'today' && state.context.today) {
      detail = ` · 综合${state.context.today.personal.overall}分 · ${state.context.today.almanac.jianchuName}`;
    } else if (state.activeTab === 'bazi' && state.context.bazi) {
      detail = ` · ${state.context.bazi.bazi.dayMaster.title.split(' ')[0]} · ${state.context.bazi.bazi.ziweiStar.name}`;
    } else if (state.activeTab === 'trends' && state.context.trends) {
      detail = ` · ${state.context.trends.horoscope.sign.name}`;
    } else if (state.activeTab === 'compatibility' && state.context.compatibility) {
      detail = ` · ${state.context.compatibility.pairTitle} (${state.context.compatibility.score}分)`;
    } else if (state.activeTab === 'divination' && state.context.divination) {
      const d = state.context.divination;
      detail = d.type === 'qian'
        ? ` · ${d.data.num}「${d.data.title}」`
        : ` · 塔罗${d.cards.length}张牌阵`;
    } else if (state.activeTab === 'review' && state.context.review) {
      detail = ` · 已复盘${state.context.review.stats.count}天`;
    }
    line.textContent = `实时感知(${userTag})：${label}${detail}`;
  }

  function applyAvatar(src) {
    state.avatar = src;
    localStorage.setItem(STORAGE_AVATAR, src);
    document.querySelectorAll('.js-sage-avatar').forEach(img => {
      img.src = src;
    });
    document.querySelectorAll('#avatarPicker .avatar-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatar === src);
    });
  }

  function updateEngineTag() {
    const tag = document.getElementById('agentEngineTag');
    if (!tag) return;
    if (isEn()) {
      tag.textContent = hasLiveApi() ? `LLM: ${state.apiConfig.model || 'Connected'}` : 'Built-in Engine';
      return;
    }
    tag.textContent = hasLiveApi() ? `大模型：${state.apiConfig.model || '已接入'}` : '内置推演引擎';
  }

  function openDrawer(autoAskContext) {
    const drawer = document.getElementById('agentDrawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (autoAskContext) {
      setActiveTab(autoAskContext);
      const qp = quickPrompts();
      const firstPrompt = (qp[autoAskContext] && qp[autoAskContext][0]) || (isEn() ? 'Please interpret the current content for me' : '请为我深度解读当前内容');
      handleUserMessage(firstPrompt);
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('agentDrawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function renderQuickPrompts() {
    const box = document.getElementById('agentQuickPrompts');
    if (!box) return;
    const qp = quickPrompts();
    const prompts = qp[state.activeTab] || qp.today;
    box.innerHTML = prompts.map(p => `<button class="quick-chip" type="button">${p}</button>`).join('');
    box.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => handleUserMessage(chip.textContent));
    });
  }

  function appendMessage(role, text) {
    const container = document.getElementById('agentMessages');
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;

    if (role === 'ai') {
      const img = document.createElement('img');
      img.className = 'msg-avatar js-sage-avatar';
      img.src = state.avatar;
      img.alt = '水镜先生';
      row.appendChild(img);
    }

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);

    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  function streamToBubble(bubble, fullText) {
    const container = document.getElementById('agentMessages');
    return new Promise(resolve => {
      let i = 0;
      bubble.textContent = '';
      const timer = setInterval(() => {
        const step = Math.min(3, fullText.length - i);
        bubble.textContent += fullText.slice(i, i + step);
        i += step;
        container.scrollTop = container.scrollHeight;
        if (i >= fullText.length) {
          clearInterval(timer);
          resolve();
        }
      }, 16);
    });
  }

  function buildContextSnapshot() {
    const tab = state.activeTab;
    const ctx = state.context[tab];
    const p = state.profile;
    const profileDesc = p ? `用户档案：${p.name}，${p.gender === 'male' ? '男' : '女'}，公历${p.birthDate}，出生地${p.birthPlace}。` : '';

    if (!ctx) return `${profileDesc} 当前模块：${TAB_LABELS[tab]}`;
    if (tab === 'today') {
      const dims = ctx.personal.dimensions.map(d => `${d.label}${d.score}`).join('、');
      return `${profileDesc} 今日运势：综合${ctx.personal.overall}分（${ctx.personal.keyword}），五维：${dims}。黄历：${ctx.almanac.lunar}，${ctx.almanac.ganzhiText}，${ctx.almanac.jianchuName}，宜${ctx.almanac.yi.join('、')}，忌${ctx.almanac.ji.join('、')}，财神${ctx.almanac.caishen}，${ctx.almanac.chongSha}。`;
    }
    if (tab === 'bazi') {
      const bz = ctx.bazi.pillars.map(x => `${x.label}${x.stem}${x.branch}`).join('，');
      const curLn = ctx.cycle.liunian.find(l => l.isCurrent);
      return `${profileDesc} 八字：${bz}，日主${ctx.bazi.dayMaster.title}，紫微主星${ctx.bazi.ziweiStar.name}。今年流年：${curLn ? `${curLn.year}${curLn.ganzhi}(${curLn.score}分·${curLn.tag})` : ''}。`;
    }
    if (tab === 'trends') {
      const best = [...ctx.trend].sort((a, b) => b.score - a.score)[0];
      return `${profileDesc} 近10日趋势峰值：${best.dateKey}（${best.score}分·${best.keyword}）。当前选中星座：${ctx.horoscope.sign.name}，幸运色${ctx.horoscope.luckyColor}。`;
    }
    if (tab === 'compatibility') {
      return `${profileDesc} 缘分合盘：${ctx.pairTitle}，共振分${ctx.score}分（${ctx.tag}）。`;
    }
    if (tab === 'divination') {
      if (ctx.type === 'qian') {
        return `${profileDesc} 灵签：${ctx.data.num}（${ctx.data.rank}）「${ctx.data.title}」。`;
      }
      return `${profileDesc} 塔罗牌阵：${ctx.cards.map(c => `${c.position}:${c.cn}(${c.orientationLabel})`).join('；')}。`;
    }
    if (tab === 'review') {
      return `${profileDesc} 复盘对账：已记录${ctx.stats.count}天，平均吻合度${ctx.stats.avgAccuracy ?? '暂无'}%，平均体感${ctx.stats.avgActual ?? '暂无'}分。`;
    }
    return profileDesc;
  }

  /** 根据用户提问动态识别目标日期（支持 明天/后天/昨天/具体月日 或 当前页面选中日期） */
  function resolveDateContext(question, fallbackCtx) {
    const Cal = window.ShuijingCalendar;
    const Fortune = window.YunjianFortune;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let targetDate = null;

    if (/后天|后日|day after tomorrow/i.test(question)) {
      targetDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 2);
    } else if (/明天|明日|次日|tomorrow/i.test(question)) {
      targetDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 1);
    } else if (/昨天|昨日|yesterday/i.test(question)) {
      targetDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - 1);
    } else if (/今天|今日|today|tonight/i.test(question)) {
      targetDate = todayStart;
    } else {
      const m = question.match(/(\d{1,2})\s*[月\-\/]\s*(\d{1,2})/);
      if (m) {
        targetDate = new Date(todayStart.getFullYear(), parseInt(m[1], 10) - 1, parseInt(m[2], 10));
      }
    }

    let almanac, personal;
    if (targetDate && Cal && Fortune && state.profile) {
      almanac = Cal.getAlmanac(targetDate);
      personal = Fortune.getDailyPersonalFortune(state.profile, targetDate);
    } else if (fallbackCtx) {
      almanac = fallbackCtx.almanac;
      personal = fallbackCtx.personal;
      targetDate = almanac.date;
    } else if (Cal && Fortune && state.profile) {
      targetDate = todayStart;
      almanac = Cal.getAlmanac(targetDate);
      personal = Fortune.getDailyPersonalFortune(state.profile, targetDate);
    }

    if (!almanac || !personal) return null;

    const diffDays = Math.round((new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()) - todayStart) / 86400000);
    const dayLabel = isEn() ? (diffDays === 0 ? 'Today'
      : diffDays === 1 ? 'Tomorrow'
      : diffDays === 2 ? 'The day after tomorrow'
      : diffDays === -1 ? 'Yesterday'
      : `${almanac.year}-${String(almanac.month).padStart(2, '0')}-${String(almanac.day).padStart(2, '0')}`)
      : diffDays === 0 ? '今日'
      : diffDays === 1 ? '明日'
      : diffDays === 2 ? '后日'
      : diffDays === -1 ? '昨日'
      : `${almanac.month}月${almanac.day}日`;

    return { almanac, personal, dayLabel, dateKey: personal.dateKey };
  }

  /** 优先挑选白天清醒时段的黄道吉时（07:00 - 21:00） */
  function pickPracticalGoodHours(almanac, limit = 3) {
    const daytime = almanac.hours.filter(h => h.isGood && h.idx >= 4 && h.idx <= 10);
    const pool = daytime.length > 0 ? daytime : almanac.hours.filter(h => h.isGood);
    return pool.slice(0, limit).map(h => `${h.ganzhi}(${h.range})`);
  }

  /** 英文内置推演回复（与中文分支共用同一确定性数据） */
  function generateLocalReplyEn(question) {
    const I18n = window.YunjianI18n;
    const tab = state.activeTab;
    const ctx = state.context[tab];
    const name = state.profile?.name || 'friend';
    const q = question.trim();
    const el = (x) => (I18n.ELEMENT_EN[x] || x);
    const dir = (x) => (I18n.DIR_EN[x] || x);
    const finance = /stock|invest|fund|crypto|money|wealth|financ|trade|trading/i;
    const wear = /wear|color|colour|outfit|cloth|dress/i;
    const work = /sign|contract|deal|cooperat|partner|interview|career|job|work|business/i;
    const love = /love|date|dating|crush|confess|romance|relationship/i;
    const travel = /travel|trip|direction|lucky hour|good hour|move|moving|journey/i;
    const asksTopic = /tomorrow|yesterday|today|tonight/i.test(q) || finance.test(q) || wear.test(q) || work.test(q) || love.test(q) || travel.test(q);

    if ((tab === 'today' && ctx) || (asksTopic && tab !== 'divination')) {
      const resolved = resolveDateContext(q, state.context.today);
      if (resolved) {
        const { personal, dayLabel, dateKey } = resolved;
        const almanac = I18n.localizeAlmanac ? I18n.localizeAlmanac(resolved.almanac) : resolved.almanac;
        const dimMap = Object.fromEntries(personal.dimensions.map(d => [d.key, d.score]));
        const goodHours = pickPracticalGoodHours(almanac, 3).map(h => h.replace(/^[^(]*/, '').replace(/[()]/g, ''));
        const hoursTxt = goodHours.join(' / ') || 'midday';

        if (finance.test(q)) {
          const ws = dimMap.wealth ?? personal.overall;
          const tone = ws >= 82
            ? 'your money energy is strong and thinking is clear — follow your own rules, build positions gradually or take profits.'
            : ws >= 70
              ? 'a steady range — favor research, regular small investments or light positions; avoid chasing highs.'
              : 'a bit volatile — emotions may follow the market, so watch more, act less and avoid adding impulsively.';
          return `Hi ${name}, here is the money outlook for ${dayLabel} (${dateKey}):\n\n` +
            `✦ Overall ${personal.overall} pts · Wealth ${ws} pts · Keyword: ${personal.keyword}\n` +
            `✦ Reading: ${tone}\n` +
            `✦ Almanac: favorable for ${almanac.yi.slice(0, 3).join(', ')}; wealth direction ${dir(resolved.almanac.caishen)}; good daytime hours ${hoursTxt}.\n` +
            `✦ Reminder: this is a mindset and rhythm reference only, not investment advice — rely on fundamentals, position sizing and stop-losses.`;
        }

        if (wear.test(q) && almanac.wardrobe) {
          const w = almanac.wardrobe;
          const [best, good, mid, , avoid] = w.tiers;
          const pal = (t) => (I18n.PALETTE_EN[t.element] || t.colors);
          return `Hi ${name}, your Five-Element wardrobe guide for ${dayLabel} (${dateKey}, day element ${el(w.dayElement)}):\n\n` +
            `✦ Best — Noble Color: ${pal(best)} (attracts helpful people and goodwill)\n` +
            `✦ Good — Partner Color: ${pal(good)} (meetings and negotiations)\n` +
            `✦ Neutral — Wealth Color: ${pal(mid)} (focused effort)\n` +
            `✦ Avoid large areas of: ${pal(avoid)}\n` +
            `✦ Best signs: ${w.zodiacLuck.best.map(a => I18n.ANIMAL_EN[a] || a).join(', ')}.`;
        }

        if (work.test(q)) {
          const cs = dimMap.career ?? personal.overall;
          return `Hi ${name}, career & deal outlook for ${dayLabel} (${dateKey} · ${almanac.jianchuName}):\n\n` +
            `✦ Overall ${personal.overall} pts · Career ${cs} pts (${personal.keyword})\n` +
            `✦ Almanac: favorable for ${almanac.yi.slice(0, 3).join(', ')}; avoid ${almanac.ji.slice(0, 3).join(', ')}.\n` +
            `✦ Suggested hours: ${hoursTxt}. ${cs >= 80 ? 'Momentum is good — prepare well and go for it.' : 'Double-check the terms and leave room to negotiate.'}`;
        }

        if (love.test(q)) {
          const ls = dimMap.love ?? personal.overall;
          return `Hi ${name}, relationship outlook for ${dayLabel} (${dateKey}):\n\n` +
            `✦ Love ${ls} pts · Social ${dimMap.social} pts · Joy direction ${dir(resolved.almanac.xishen)}\n` +
            `✦ Tip: ${ls >= 80 ? 'emotional resonance is high — a good time to reach out, express your feelings or plan a relaxed dinner.' : 'a gentle rhythm — listen more, stay relaxed, and trust builds naturally.'}\n` +
            `✦ Good times to meet: ${goodHours.slice(0, 2).join(' / ') || hoursTxt}.`;
        }

        if (travel.test(q)) {
          return `${dayLabel} (${dateKey}): wealth direction ${dir(resolved.almanac.caishen)}, joy direction ${dir(resolved.almanac.xishen)}, ${almanac.chongSha}, day Nayin ${almanac.nayin}.\n\n` +
            `✦ Good daytime hours: ${hoursTxt}.\n` +
            `✦ Practical tip: schedule key trips, meetings or decisions in these windows — treat it as a gentle planning cue.`;
        }

        const top = [...personal.dimensions].sort((a, b) => b.score - a.score)[0];
        const dimEn = { career: 'Career', wealth: 'Wealth', love: 'Love', health: 'Health', social: 'Social' };
        return `Hi ${name}, here is your combined reading for ${dayLabel} (${dateKey}):\n\n` +
          `1. Personal energy: ${personal.overall} pts, keyword “${personal.keyword}”; strongest area is ${dimEn[top.key] || top.label} (${top.score}).\n` +
          `2. Almanac: ${almanac.jianchuName}; favorable for ${almanac.yi.slice(0, 3).join(', ')}; avoid ${almanac.ji.slice(0, 3).join(', ')}.\n` +
          `3. Action: ${personal.summary} Try using ${goodHours[0] || 'your best-focus hours'} for core tasks.`;
      }
    }

    if (tab === 'bazi' && ctx) {
      const { bazi, cycle } = ctx;
      const curLn = cycle.liunian.find(l => l.isCurrent) || cycle.liunian[0];
      const curDy = cycle.dayun.find(d => d.isCurrent) || cycle.dayun[1];
      if (/element|balance|wuxing/i.test(q)) {
        return `${name}, ${bazi.wuxingNote}\n\n✦ Everyday ideas: spend time in nature (Wood), get sunlight and move (Fire), keep regular meals and routines (Earth), declutter your space (Metal), hydrate and journal (Water) — lean toward the element you lack.`;
      }
      if (/cycle|dayun|decade|10-year/i.test(q)) {
        return `${name}, you are in the ${curDy.range} cycle (${curDy.pillar} · ${curDy.label}).\n\n✦ Theme: ${curDy.theme}\n✦ With your Ziwei star ${bazi.ziweiStar.name}, this year ${curLn.year} (${curLn.tag}) focuses on: ${curLn.tip}`;
      }
      return `${name}, connecting your BaZi, Ziwei and annual cycle:\n\n` +
        `✦ Day Master: ${bazi.dayMaster.title}\n` +
        `✦ Ziwei star: ${bazi.ziweiStar.name} (${bazi.ziweiStar.category}) — ${bazi.ziweiStar.keywords}\n` +
        `✦ ${curLn.year} (${curLn.score} pts): “${curLn.tag}”. ${curLn.tip}`;
    }

    if (tab === 'trends' && ctx) {
      const { trend, horoscope, ranking } = ctx;
      const peak = [...trend.filter(t => t.offset >= 0)].sort((a, b) => b.score - a.score)[0];
      const top1 = ranking[0];
      const zn = (s) => (I18n.ZODIAC_EN[s.id] || s.name);
      return `${name}, your coming week and today’s zodiac board:\n\n` +
        `✦ Peak day: ${peak.dateKey} (${peak.score} pts · ${peak.keyword}) — good for key talks, launches or important meetings.\n` +
        `✦ ${zn(horoscope.sign)} today: lucky color ${horoscope.luckyColor}, lucky number ${horoscope.luckyNumber}.\n` +
        `✦ Today’s #1 sign is ${zn(top1)} (${top1.score} pts).`;
    }

    if (tab === 'compatibility' && ctx) {
      return `Reading ${ctx.pairTitle} (resonance ${ctx.score} pts · ${ctx.tag}):\n\n✦ Foundation: ${ctx.summary}\n✦ Strengths: ${ctx.pros}\n✦ Advice: ${ctx.advice}`;
    }

    if (tab === 'divination') {
      if (!ctx) return `${name}, you haven’t drawn yet. Shake a fortune lot or draw 1 / 3 tarot cards first, then ask me again.`;
      if (ctx.type === 'qian') {
        return `Your lot: ${ctx.data.num} · ${ctx.data.rank} · “${ctx.data.title}”\n\n“${ctx.data.poem.replace(/\n/g, ' / ')}”\n\n✦ Meaning: ${ctx.data.meaning}\n✦ Guidance: ${ctx.data.guide}`;
      }
      const lines = ctx.cards.map(c => `· ${c.position}: ${c.en} (${c.orientationLabel}) — ${c.keywords}. ${c.advice}`).join('\n');
      return `${name}, your ${ctx.cards.length}-card spread:\n\n${lines}\n\n✦ Overall: treat the cards as a mirror for reflection — act decisively when things flow, steady yourself and adjust when reversed.`;
    }

    if (tab === 'review' && ctx) {
      const { stats, list } = ctx;
      if (stats.count === 0) return `${name}, no check-ins yet. Not superstition — reflection: rate your real day each evening for 3+ days and I’ll help you spot your patterns.`;
      const latest = list[0];
      const diff = latest.actual - latest.predicted;
      const diffText = Math.abs(diff) <= 8 ? 'your feeling closely matched the forecast — your rhythm is smooth.'
        : diff > 8 ? `you felt ${diff} pts better than forecast — your own actions lifted the day.`
          : `you felt ${Math.abs(diff)} pts below forecast — check whether energy went to non-core tasks.`;
      return `${name}, reviewing ${stats.count} days of check-ins:\n\n✦ Avg. match ${stats.avgAccuracy}% (feeling ${stats.avgActual} vs forecast ${stats.avgPredicted})\n✦ Latest (${latest.dateKey} · ${I18n.trMood ? I18n.trMood(latest.mood) : latest.mood}): ${diffText}\n✦ Tip: keep logging 1–2 weeks and notice what you did on your best days.`;
    }

    return `Hi ${name}, I can interpret your profile, almanac, BaZi cycles, horoscope and check-ins anytime. Use ⚙ to switch avatars or connect your own LLM API.`;
  }

  function generateLocalReply(question) {
    if (isEn()) return generateLocalReplyEn(question);
    const tab = state.activeTab;
    const ctx = state.context[tab];
    const name = state.profile?.name || '道友';
    const q = question.trim();

    // 无论用户在哪个标签页，只要明确问了“明天/后天/今天/某月某日”或“穿衣/股票/签约/感情/出行”，都能直接推演该日运势
    const asksSpecificDayOrTopic = /明天|明日|后天|后日|昨天|昨日|穿|颜色|衣服|搭配|股票|炒股|基金|投资|理财|买币|财运|签约|合作|面试|约会|表白|出行|搬家/.test(q);

    if ((tab === 'today' && ctx) || (asksSpecificDayOrTopic && tab !== 'divination')) {
      const resolved = resolveDateContext(q, state.context.today);
      if (resolved) {
        const { personal, almanac, dayLabel, dateKey } = resolved;
        const dimMap = Object.fromEntries(personal.dimensions.map(d => [d.label, d.score]));
        const topDim = [...personal.dimensions].sort((a, b) => b.score - a.score)[0];
        const goodHours = pickPracticalGoodHours(almanac, 3);

        // 1. 股票 / 投资 / 理财 / 财运
        if (/股票|炒股|基金|投资|理财|买币|财运|发财/.test(q)) {
          const wealthScore = dimMap['财运'] ?? personal.overall;
          const hasWealthYi = almanac.yi.some(x => ['纳财', '开市', '交易', '立券'].includes(x));
          const tone = wealthScore >= 82
            ? `${dayLabel}财运指数偏旺（${wealthScore} 分），思路较清晰，适合按既定纪律关注机会、分批布局或止盈复盘。`
            : wealthScore >= 70
              ? `${dayLabel}财运属于稳健区间（${wealthScore} 分），宜守不宜激进，适合做研究、低吸定投或控制轻仓试探，忌追高。`
              : `${dayLabel}财运略偏波动（${wealthScore} 分），情绪容易受盘面牵动，建议多看少动、管住手不盲目加仓。`;
          return `${name}安好，老夫为你推演${dayLabel}（${dateKey} · ${almanac.lunar} · ${almanac.pillars.day.stem}${almanac.pillars.day.branch}日 ${almanac.jianchuName}）的财运与投资气场：\n\n` +
            `✦ 个人财运：综合 ${personal.overall} 分｜财运 ${wealthScore} 分｜关键词【${personal.keyword}】\n` +
            `✦ 老夫判断：${tone}\n` +
            `✦ 黄历参考：${dayLabel}宜「${almanac.yi.slice(0, 4).join('、')}」${hasWealthYi ? '（见纳财/开市之象，偏利稳健筹划）' : ''}，财神方位在【${almanac.caishen}】，白天吉时为 ${goodHours.join(' / ')}。\n` +
            `✦ 理性提醒：命理与星象仅作心态和节奏参考，不构成投资建议；入市仍须以基本面、仓位管理与止损纪律为准。`;
        }

        // 2. 五行穿衣搭配
        if (/穿|颜色|衣服|搭配/.test(q)) {
          const w = almanac.wardrobe;
          if (w) {
            const [best, good, mid, , avoid] = w.tiers;
            return `${name}安好，老夫按${dayLabel}（${dateKey} · ${almanac.lunar} · 日支「${w.dayBranch}」属${w.dayElement}）为你奉上五行穿衣指南：\n\n` +
              `✦ 首选《${best.name}》（大吉）：${best.colors} —— 大环境生你，最易招贵人与好人缘。\n` +
              `✦ 谈判《${good.name}》（次吉）：${good.colors} —— 商务沟通、合作洽谈首选。\n` +
              `✦ 奋斗《${mid.name}》（平）：${mid.colors} —— 适合拼业绩、攻坚进财。\n` +
              `✦ 尽量避开《${avoid.name}》：${avoid.colors}。\n` +
              `✦ ${dayLabel}特吉生肖：${w.zodiacLuck.best.join('、')}；需要注意：${w.zodiacLuck.caution.join('、')}。`;
          }
        }

        // 3. 签约 / 合作 / 事业 / 面试
        if (/签约|合作|面试|工作|事业/.test(q)) {
          const careerScore = dimMap['事业'] ?? personal.overall;
          return `${name}安好，老夫结合你的生辰档案与${dayLabel}黄历（${dateKey} · ${almanac.jianchuName}）为你推演：\n\n` +
            `✦ 事业气场：${dayLabel}综合 ${personal.overall} 分，事业指数【${careerScore} 分】（${personal.keyword}）。\n` +
            `✦ 黄历参考：${dayLabel}宜「${almanac.yi.slice(0, 4).join('、')}」，忌「${almanac.ji.slice(0, 3).join('、')}」。\n` +
            `✦ 优选白天吉时：${goodHours.join(' / ')}；谈事可优先面向【${almanac.caishen}】（财神位），并留意「${almanac.chongSha}」。`;
        }

        // 4. 感情 / 约会 / 表白
        if (/感情|约会|表白|桃花|恋爱/.test(q)) {
          const loveScore = dimMap['感情'] ?? personal.overall;
          return `${name}安好，老夫观你${dayLabel}（${dateKey}）情感星象：\n\n` +
            `✦ 感情指数：${loveScore} 分｜人际指数：${dimMap['人际']} 分｜喜神方位在【${almanac.xishen}】。\n` +
            `✦ 相处建议：${loveScore >= 80 ? '情感共振度很高，适合主动邀约、坦诚表达心意或安排轻松的晚餐散步。' : '节奏偏温和，重在倾听与松弛陪伴，少一点猜忌就能让关系稳稳升温。'}\n` +
            `✦ 推荐见面吉时：${goodHours.slice(0, 2).join(' / ')}。`;
        }

        // 5. 财神 / 吉时 / 方位 / 出行
        if (/财神|吉时|方位|出行|搬家/.test(q)) {
          return `${dayLabel}（${dateKey} · ${almanac.lunar}）财神坐落【${almanac.caishen}】，喜神在【${almanac.xishen}】，冲煞为「${almanac.chongSha}」，日纳音「${almanac.nayin}」。\n\n` +
            `✦ 白天推荐黄道吉时：${goodHours.join('、')}。\n` +
            `✦ 实操建议：把重要洽谈、出门或决策安排在上述吉时，并避开冲煞方向即可。`;
        }

        // 6. 综合日运与黄历解读
        return `${name}安好，老夫已为你合参${dayLabel}（${dateKey}）的「个人日运 × 老黄历」：\n\n` +
          `1. 个人气场：${dayLabel}综合 ${personal.overall} 分，关键词【${personal.keyword}】，其中「${topDim.label}」最旺（${topDim.score}分）。\n` +
          `2. 天时黄历：${almanac.lunar}（${almanac.ganzhiText} · ${almanac.jianchuName}），宜「${almanac.yi.slice(0, 3).join('、')}」，忌「${almanac.ji.slice(0, 3).join('、')}」。\n` +
          `3. 行动建议：${personal.summary} 优先借用白天吉时 ${goodHours[0]} 推进核心事务。`;
      }
    }

    if (tab === 'bazi' && ctx) {
      const { bazi, cycle } = ctx;
      const four = bazi.pillars.map(p => `${p.stem}${p.branch}`).join(' · ');
      const curLn = cycle.liunian.find(l => l.isCurrent) || cycle.liunian[0];
      const curDy = cycle.dayun.find(d => d.isCurrent) || cycle.dayun[1];

      if (q.includes('五行') || q.includes('调理')) {
        const missing = Object.entries(bazi.counts).filter(([, v]) => v === 0).map(([k]) => k);
        const target = missing[0] || Object.entries(bazi.counts).sort((a, b) => a[1] - b[1])[0][0];
        const tips = {
          木: '多亲近绿植自然，穿搭可选青绿色，晨间舒展最益木气。',
          火: '多晒太阳、保持热情表达，暖色系（红/琥珀金）与适度运动可提气。',
          土: '规律三餐作息，大地色/米金色系及稳重节奏有助于安神定心。',
          金: '保持空间整洁有序，白/银金属质感与果断断舍离能增强决断力。',
          水: '多补水与阅读冥想，深蓝/玄黑色系能滋养你的直觉与松弛感。'
        };
        return `${name}，你四柱为【${four}】，${bazi.wuxingNote}\n\n✦ 补益建议（滋养「${target}」行）：\n${tips[target]}`;
      }
      if (q.includes('大运')) {
        return `${name}当前正步入【${curDy.range} · ${curDy.pillar}（${curDy.label}）】大运阶段：\n\n` +
          `✦ 阶段主线：${curDy.theme}\n` +
          `✦ 配合你命宫主星【${bazi.ziweiStar.name}（${bazi.ziweiStar.category}）】，今年 ${curLn.year} ${curLn.ganzhi}（${curLn.tag}）的重点在于：${curLn.tip}`;
      }
      return `${name}，老夫为你串联解读「八字 × 紫微 × 流年」：\n\n` +
        `✦ 四柱格局：${four}（${bazi.dayMaster.title}）\n` +
        `✦ 紫微命宫：【${bazi.ziweiStar.name} · ${bazi.ziweiStar.category}】——${bazi.ziweiStar.keywords}\n` +
        `✦ 今年流年（${curLn.year} ${curLn.ganzhi} · ${curLn.score}分）：主调为「${curLn.tag}」。${curLn.tip}`;
    }

    if (tab === 'trends' && ctx) {
      const { trend, horoscope, ranking } = ctx;
      const future = trend.filter(t => t.offset >= 0);
      const peak = [...future].sort((a, b) => b.score - a.score)[0];
      const top1 = ranking[0];
      return `${name}，老夫观你未来 7 日运势曲线与今日星象榜：\n\n` +
        `✦ 个人峰值日：【${peak.dateKey}】（预测 ${peak.score} 分 · ${peak.keyword}），最适合安排关键谈判、发布或重要约见。\n` +
        `✦ 当前查看星座：${horoscope.sign.name}，今日幸运色「${horoscope.luckyColor}」、数字「${horoscope.luckyNumber}」。\n` +
        `✦ 今日星座榜魁首为【${top1.name}（${top1.score}分）】，身边若有此星座伙伴不妨多沾沾喜气！`;
    }

    if (tab === 'compatibility' && ctx) {
      return `老夫细看【${ctx.pairTitle}】合盘（共振指数 ${ctx.score} 分 · ${ctx.tag}）：\n\n` +
        `✦ 缘分底色：${ctx.summary}\n` +
        `✦ 默契亮点：${ctx.pros}\n` +
        `✦ 相处锦囊：${ctx.advice}`;
    }

    if (tab === 'divination') {
      if (!ctx) {
        return `${name}尚未起签或翻牌呢。请先在页面中点击「摇签问卜」或「抽 1 张 / 抽 3 张塔罗」，老夫即刻为你深度拆解！`;
      }
      if (ctx.type === 'qian') {
        return `老夫细品你求得的【${ctx.data.num} · ${ctx.data.rank} · ${ctx.data.title}】：\n\n` +
          `「${ctx.data.poem.replace('\n', ' / ')}」\n\n` +
          `✦ 白话拆解：${ctx.data.meaning}\n` +
          `✦ 落地指引：${ctx.data.guide}`;
      }
      const summaryLines = ctx.cards.map(c => `· ${c.position}：【${c.cn}·${c.orientationLabel}】(${c.keywords}) — ${c.advice}`).join('\n');
      return `${name}，老夫为你串联解读本次抽出的 ${ctx.cards.length} 张塔罗星象牌阵：\n\n${summaryLines}\n\n✦ 水镜总评：牌阵是一面镜子，顺势时果断落子，逆位时先稳心神再微调方向。`;
    }

    if (tab === 'review' && ctx) {
      const { stats, list } = ctx;
      if (stats.count === 0) {
        return `${name}还没有留下复盘记录呢。「不是玄学，是复盘」——今晚花 10 秒给今天的真实体感打个分、记一句话，连续记录 3 天以上，老夫就能帮你找出属于你自己的高效运势规律！`;
      }
      const latest = list[0];
      const diff = latest.actual - latest.predicted;
      const diffText = Math.abs(diff) <= 8
        ? '体感与预测高度贴合，说明你近期的生活节奏非常顺畅。'
        : diff > 8
          ? `你的实际体感比预测高出 ${diff} 分！说明你的主观行动力正在主动拉高运势上限。`
          : `实际体感略低于预测 ${Math.abs(diff)} 分，不妨回顾一下今天是不是消耗在了非核心琐事上。`;
      return `${name}，老夫已审阅你累计 ${stats.count} 天的复盘对账档案：\n\n` +
        `✦ 历史平均吻合度：${stats.avgAccuracy}%（平均体感 ${stats.avgActual} 分 vs 平均预测 ${stats.avgPredicted} 分）\n` +
        `✦ 最近一次复盘（${latest.dateKey} · ${latest.mood}）：${diffText}\n` +
        `✦ 水镜建议：持续记录 1–2 周，留意体感分最高的那几天你做了什么，那就是你最真实的好运密码。`;
    }

    return `${name}安好，老夫可随时结合你当前的档案、黄历、八字流年、星象与复盘记录为你解说。点击右上角「⚙」还可切换 3 款白胡子形象或接入你的大模型 API。`;
  }

  async function callLiveLLM(question) {
    const endpoint = state.apiConfig.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    const systemPrompt = `你是「水镜运见」平台的首席 AI 智者「水镜先生」，一位儒雅通透、兼具东方易理底蕴与现代理性复盘思维的白胡子古装老者。请结合以下页面实时数据，用温暖、清晰、不迷信、有建设性的${(window.YunjianI18n && window.YunjianI18n.isEn()) ? '英文（English）' : '中文'}回答用户问题，控制在 240 字以内。\n\n【当前页面上下文】\n${buildContextSnapshot()}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: state.apiConfig.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7
      })
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json.choices?.[0]?.message?.content?.trim() || generateLocalReply(question);
  }

  async function handleUserMessage(text) {
    const q = (text || '').trim();
    if (!q || state.isBusy) return;
    state.isBusy = true;

    appendMessage('user', q);
    const thinkingBubble = appendMessage('ai', isEn() ? 'Master Shuijing is reading your chart and the stars...' : '水镜先生正在推演命盘与星象矩阵...');

    try {
      let answer;
      if (hasLiveApi()) {
        answer = await callLiveLLM(q);
      } else {
        await new Promise(r => setTimeout(r, 340));
        answer = generateLocalReply(q);
      }
      await streamToBubble(thinkingBubble, answer);
    } catch (err) {
      const fallback = (isEn() ? `(LLM API unavailable: ${err.message}. Switched to the built-in engine.)\n\n` : `（外接大模型暂未响应：${err.message}，已自动切回内置智能推演）\n\n`) + generateLocalReply(q);
      await streamToBubble(thinkingBubble, fallback);
    } finally {
      state.isBusy = false;
    }
  }

  function init() {
    applyAvatar(state.avatar);
    updateEngineTag();
    renderQuickPrompts();

    const en = window.YunjianI18n && window.YunjianI18n.isEn();
    appendMessage('ai', en
      ? 'Greetings, traveler. I am Master Shuijing, the AI sage of YunJian.\n' +
        'I have synced your birth profile and all six modules — ask me about today’s lucky colors, your BaZi chart, trends, compatibility, tarot, or your daily review.\n' +
        'Tip: use ⚙ to switch avatars or connect your own LLM API.'
      : '道友幸会，老夫乃「水镜运见」首席 AI 智者——水镜先生。\n' +
        '我已同步你的生辰档案与全站六大模块数据，既能为你解盘择吉、看流年大运，也能陪你做每日「复盘对账」。\n' +
        '点击右上角「⚙」可随时切换我的 3 款古装形象或接入你的大模型 API。'
    );

    document.getElementById('agentFab').addEventListener('click', () => openDrawer());
    document.getElementById('agentCloseBtn').addEventListener('click', closeDrawer);

    document.querySelectorAll('.js-ask-ai').forEach(btn => {
      btn.addEventListener('click', () => openDrawer(btn.dataset.context));
    });

    const settingsPanel = document.getElementById('agentSettingsPanel');
    document.getElementById('agentSettingsToggle').addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });

    document.querySelectorAll('#avatarPicker .avatar-opt').forEach(btn => {
      btn.addEventListener('click', () => applyAvatar(btn.dataset.avatar));
    });

    const baseInput = document.getElementById('apiBaseUrl');
    const keyInput = document.getElementById('apiKeyInput');
    const modelInput = document.getElementById('apiModelInput');
    baseInput.value = state.apiConfig.baseUrl || '';
    keyInput.value = state.apiConfig.apiKey || '';
    modelInput.value = state.apiConfig.model || '';

    document.getElementById('saveApiBtn').addEventListener('click', () => {
      state.apiConfig = {
        baseUrl: baseInput.value.trim(),
        apiKey: keyInput.value.trim(),
        model: modelInput.value.trim()
      };
      localStorage.setItem(STORAGE_API, JSON.stringify(state.apiConfig));
      updateEngineTag();
      settingsPanel.classList.add('hidden');
      appendMessage('ai', isEn() ? (hasLiveApi()
        ? `LLM connected (${state.apiConfig.model || 'default model'}). Replies will now be generated by the LLM using your live chart.`
        : 'Settings updated — using the built-in engine.') : hasLiveApi()
        ? `已接入大模型（${state.apiConfig.model || '默认模型'}），接下来的解说将结合你的实时命盘由大模型生成。`
        : '配置已更新，当前使用内置智能推演引擎。'
      );
    });

    document.getElementById('clearApiBtn').addEventListener('click', () => {
      state.apiConfig = { baseUrl: '', apiKey: '', model: '' };
      baseInput.value = '';
      keyInput.value = '';
      modelInput.value = '';
      localStorage.removeItem(STORAGE_API);
      updateEngineTag();
      settingsPanel.classList.add('hidden');
      appendMessage('ai', isEn() ? 'Switched back to the built-in engine — no setup needed.' : '已切回内置本地智能推演引擎，零配置随时畅问。');
    });

    window.addEventListener('yunjian:langchange', () => {
      renderQuickPrompts();
      updateContextUI();
      updateEngineTag();
    });

    const form = document.getElementById('agentForm');
    const input = document.getElementById('agentInput');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      handleUserMessage(val);
    });
  }

  return { init, setProfile, setContext, setActiveTab, openDrawer };
})();
