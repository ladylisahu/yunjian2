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
    const label = TAB_LABELS[state.activeTab] || '星象历法';
    const userTag = state.profile ? `${state.profile.name}` : '访客';
    let detail = '';

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
    tag.textContent = hasLiveApi() ? `大模型：${state.apiConfig.model || '已接入'}` : '内置推演引擎';
  }

  function openDrawer(autoAskContext) {
    const drawer = document.getElementById('agentDrawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (autoAskContext) {
      setActiveTab(autoAskContext);
      const firstPrompt = (QUICK_PROMPTS[autoAskContext] && QUICK_PROMPTS[autoAskContext][0]) || '请为我深度解读当前内容';
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
    const prompts = QUICK_PROMPTS[state.activeTab] || QUICK_PROMPTS.today;
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

  function generateLocalReply(question) {
    const tab = state.activeTab;
    const ctx = state.context[tab];
    const name = state.profile?.name || '道友';
    const q = question.trim();

    if (tab === 'today' && ctx) {
      const { personal, almanac } = ctx;
      const topDim = [...personal.dimensions].sort((a, b) => b.score - a.score)[0];
      const goodHours = almanac.hours.filter(h => h.isGood).map(h => `${h.ganzhi}(${h.range})`).slice(0, 3);

      if (q.includes('穿') || q.includes('颜色') || q.includes('衣服') || q.includes('搭配')) {
        const w = almanac.wardrobe;
        if (w) {
          const [best, good, mid, , avoid] = w.tiers;
          return `${name}安好，老夫按今日（${almanac.lunar} · 日支「${w.dayBranch}」属${w.dayElement}）为你奉上五行穿衣指南：\n\n` +
            `✦ 首选《${best.name}》（大吉）：${best.colors} —— 大环境生你，最易招贵人与好人缘。\n` +
            `✦ 谈判《${good.name}》（次吉）：${good.colors} —— 商务沟通、合作洽谈首选。\n` +
            `✦ 奋斗《${mid.name}》（平）：${mid.colors} —— 适合拼业绩、攻坚进财。\n` +
            `✦ 尽量避开《${avoid.name}》：${avoid.colors}。\n` +
            `✦ 今日特吉生肖：${w.zodiacLuck.best.join('、')}；需要注意：${w.zodiacLuck.caution.join('、')}。`;
        }
      }
      if (q.includes('签约') || q.includes('合作')) {
        return `${name}安好，老夫结合你的生辰档案与今日黄历（${almanac.jianchuName}）为你推演：\n\n` +
          `✦ 今日个人综合分 ${personal.overall} 分，最强维度为【${topDim.label} ${topDim.score}分】。\n` +
          `✦ 今日黄历宜「${almanac.yi.slice(0, 4).join('、')}」，谈合作签约建议选在黄道吉时：${goodHours.join(' / ')}。\n` +
          `✦ 方位助力：财神在【${almanac.caishen}】，留意「${almanac.chongSha}」，保持清晰条款即是稳妥上策。`;
      }
      if (q.includes('财神') || q.includes('吉时') || q.includes('方位')) {
        return `今日财神坐落【${almanac.caishen}】，喜神在【${almanac.xishen}】，日纳音「${almanac.nayin}」。\n\n` +
          `✦ 今日推荐黄金吉时：${goodHours.join('、')}。\n` +
          `✦ 实操建议：把重要洽谈、汇报或决策放在上述吉时，工位或出行朝向【${almanac.caishen}】更易借势。`;
      }
      return `${name}安好，老夫已为你合参「个人日运 × 今日黄历」：\n\n` +
        `1. 个人气场：今日综合 ${personal.overall} 分，关键词【${personal.keyword}】，其中「${topDim.label}」最旺（${topDim.score}分）。\n` +
        `2. 天时黄历：${almanac.lunar}（${almanac.ganzhiText} · ${almanac.jianchuName}），宜「${almanac.yi.slice(0, 3).join('、')}」，忌「${almanac.ji.slice(0, 3).join('、')}」。\n` +
        `3. 行动建议：${personal.summary} 优先借用 ${goodHours[0]} 推进核心事务。`;
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
    const systemPrompt = `你是「水镜运见」平台的首席 AI 智者「水镜先生」，一位儒雅通透、兼具东方易理底蕴与现代理性复盘思维的白胡子古装老者。请结合以下页面实时数据，用温暖、清晰、不迷信、有建设性的中文回答用户问题，控制在 240 字以内。\n\n【当前页面上下文】\n${buildContextSnapshot()}`;

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
    const thinkingBubble = appendMessage('ai', '水镜先生正在推演命盘与星象矩阵...');

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
      const fallback = `（外接大模型暂未响应：${err.message}，已自动切回内置智能推演）\n\n` + generateLocalReply(q);
      await streamToBubble(thinkingBubble, fallback);
    } finally {
      state.isBusy = false;
    }
  }

  function init() {
    applyAvatar(state.avatar);
    updateEngineTag();
    renderQuickPrompts();

    appendMessage('ai',
      '道友幸会，老夫乃「水镜运见」首席 AI 智者——水镜先生。\n' +
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
      appendMessage('ai', hasLiveApi()
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
      appendMessage('ai', '已切回内置本地智能推演引擎，零配置随时畅问。');
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
