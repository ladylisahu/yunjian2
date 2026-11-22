/**
 * 水镜运见 2.0 · 主控调度
 */
(function () {
  const Cal = window.ShuijingCalendar;
  const Bazi = window.ShuijingBazi;
  const Horo = window.ShuijingHoroscope;
  const Div = window.ShuijingDivination;
  const Fortune = window.YunjianFortune;
  const Agent = window.ShuijingAgent;

  const HOUR_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

  let profile = Fortune.getProfile();
  let currentDate = new Date();
  let selectedZodiacId = 'aries';
  let currentCompatMode = 'zodiac';
  let selectedMood = '顺遂高效';
  let currentTrendSeries = [];

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function renderStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  // ==================== 导航切换 ====================
  function activateTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `tab-${tabId}`));
    if (Agent) Agent.setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });
    const brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('today');
      });
    }
    const goReviewBtn = document.getElementById('goReviewFromTodayBtn');
    if (goReviewBtn) {
      goReviewBtn.addEventListener('click', () => activateTab('review'));
    }
  }

  // ==================== 全局档案条 ====================
  function renderProfileStrip() {
    const genderTxt = profile.gender === 'female' ? '坤造' : '乾造';
    const hourTxt = HOUR_NAMES[profile.birthHour] || '巳时';
    document.getElementById('profileModeBadge').textContent = profile.isCustom ? '我的专属档案' : '演示档案';
    document.getElementById('profileSummaryText').textContent =
      `${profile.name} · ${genderTxt} · ${profile.birthDate} · ${hourTxt} · ${profile.birthPlace || '中国'}`;

    document.getElementById('profName').value = profile.name;
    document.getElementById('profGender').value = profile.gender;
    document.getElementById('profBirthDate').value = profile.birthDate;
    document.getElementById('profBirthHour').value = String(profile.birthHour);
    document.getElementById('profBirthPlace').value = profile.birthPlace || '';

    if (Agent) Agent.setProfile(profile);
  }

  function initProfileBar() {
    const editor = document.getElementById('profileEditorForm');
    document.getElementById('toggleProfileEditorBtn').addEventListener('click', () => {
      editor.classList.toggle('hidden');
    });
    document.getElementById('closeProfileEditorBtn').addEventListener('click', () => {
      editor.classList.add('hidden');
    });

    editor.addEventListener('submit', (e) => {
      e.preventDefault();
      profile = Fortune.saveProfile({
        name: document.getElementById('profName').value,
        gender: document.getElementById('profGender').value,
        birthDate: document.getElementById('profBirthDate').value,
        birthHour: parseInt(document.getElementById('profBirthHour').value, 10),
        birthPlace: document.getElementById('profBirthPlace').value
      });
      editor.classList.add('hidden');
      refreshAllProfileBoundViews();
    });
  }

  function refreshAllProfileBoundViews() {
    renderProfileStrip();
    renderTodayView(currentDate);
    renderBaziAndCycles();
    renderTrendAndZodiac();
    renderReviewSection();
  }

  // ==================== 顶部天象监测条 ====================
  function renderTicker() {
    const today = new Date();
    const alm = Cal.getAlmanac(today);
    document.getElementById('tickerDate').textContent =
      `今日 ${alm.year}年${alm.month}月${alm.day}日 ${alm.weekday} · ${alm.lunar}（${alm.ganzhiText}）`;
    document.getElementById('tickerMeta').textContent =
      `宜：${alm.yi.slice(0, 3).join(' ')} ｜ 财神：${alm.caishen} ｜ ${alm.chongSha}`;
  }

  // ==================== 1. 今日运势 · 黄历 ====================
  function renderTodayView(date) {
    currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const alm = Cal.getAlmanac(currentDate);
    const personal = Fortune.getDailyPersonalFortune(profile, currentDate);
    const now = new Date();
    const viewingToday = isSameDay(currentDate, now);
    const nowHourIdx = Cal.getCurrentHourBranch(now);

    // 个人今日五维运势
    document.getElementById('pfOverallScore').textContent = personal.overall;
    document.getElementById('pfKeyword').textContent = personal.keyword;
    document.getElementById('pfTitle').textContent = `${profile.name} · ${personal.dateKey} 能量雷达`;
    document.getElementById('pfSummary').textContent = personal.summary;
    document.getElementById('pfDimsGrid').innerHTML = personal.dimensions.map(d => `
      <div class="pf-dim-item">
        <div class="pf-dim-top">
          <span>${d.label}</span>
          <strong style="color:${d.color}">${d.score}</strong>
        </div>
        <div class="pf-dim-bar">
          <div class="pf-dim-fill" style="width:${d.score}%; background:${d.color}"></div>
        </div>
      </div>
    `).join('');

    // 老黄历
    document.getElementById('almanacDateInput').value = Fortune.formatDateKey(currentDate);
    document.getElementById('almWeekday').textContent = `${alm.weekday} · ${alm.jianchuName}`;
    document.getElementById('almSolarTerm').textContent = alm.solarTerm;
    document.getElementById('almDayNum').textContent = alm.day;
    document.getElementById('almGregorian').textContent = `${alm.year}年 ${alm.month}月`;
    document.getElementById('almLunar').textContent = alm.lunar;
    document.getElementById('almGanzhi').textContent = alm.ganzhiText;
    document.getElementById('almZodiac').textContent = `生肖：${alm.shengxiao}`;
    document.getElementById('almConstellation').textContent = alm.zodiac;

    document.getElementById('almYi').innerHTML = alm.yi.map(i => `<span class="yiji-tag">${i}</span>`).join('');
    document.getElementById('almJi').innerHTML = alm.ji.map(i => `<span class="yiji-tag">${i}</span>`).join('');

    document.getElementById('almChongSha').textContent = alm.chongSha;
    document.getElementById('almCaishen').textContent = alm.caishen;
    document.getElementById('almXishen').textContent = alm.xishen;
    document.getElementById('almNayin').textContent = alm.nayin;

    // 每日五行穿衣指南
    const w = alm.wardrobe;
    if (w) {
      document.getElementById('wardrobeDayElBadge').textContent = `日支「${w.dayBranch}」· 五行属${w.dayElement}`;
      document.getElementById('wardrobeSubtitle').textContent =
        `${alm.year}年${alm.month}月${alm.day}日 · ${alm.lunar}（${alm.ganzhiText}）`;

      const shirtSvg = (ink) => `
        <svg viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 4l-5 3 2 4 3-1.5V20h8V9.5L19 11l2-4-5-3a4 4 0 0 1-8 0z"/>
        </svg>`;

      document.getElementById('wardrobeList').innerHTML = w.tiers.map(t => `
        <div class="wardrobe-row">
          <div class="wardrobe-swatch" style="background:${t.swatchBg}; border:1.5px solid ${t.border};">
            ${shirtSvg(t.swatchInk)}
          </div>
          <div>
            <div class="wardrobe-head">
              <span class="ward-badge ${t.badgeClass}">${t.level} ·《${t.name}》</span>
              <span class="wardrobe-colors">${t.colors}</span>
              <span class="muted-note">（五行属${t.element}）</span>
            </div>
            <p class="wardrobe-desc">${t.desc}</p>
          </div>
        </div>
      `).join('');

      document.getElementById('wardrobeZodiacBar').innerHTML = `
        <div class="wz-box">
          <span class="wz-label">今日特吉生肖</span>
          <span class="wz-vals best">${w.zodiacLuck.best.join('、')}</span>
        </div>
        <div class="wz-box">
          <span class="wz-label">今日次吉生肖</span>
          <span class="wz-vals sec">${w.zodiacLuck.secondary.join('、')}</span>
        </div>
        <div class="wz-box">
          <span class="wz-label">今日需要注意</span>
          <span class="wz-vals caution">${w.zodiacLuck.caution.join('、')}</span>
        </div>
      `;
    }

    document.getElementById('almHoursGrid').innerHTML = alm.hours.map(h => {
      const isNow = viewingToday && h.idx === nowHourIdx;
      return `
        <div class="hour-cell ${isNow ? 'is-now' : ''}">
          ${isNow ? '<span class="hour-now-tag">当前</span>' : ''}
          <div class="hour-name">${h.ganzhi}</div>
          <div class="hour-range">${h.range}</div>
          <span class="hour-luck ${h.isGood ? 'ji' : 'xiong'}">${h.luckText}</span>
        </div>
      `;
    }).join('');

    if (Agent) Agent.setContext('today', { personal, almanac: alm });
  }

  function initTodayControls() {
    document.getElementById('almanacDateInput').addEventListener('change', (e) => {
      if (!e.target.value) return;
      const [y, m, d] = e.target.value.split('-').map(Number);
      renderTodayView(new Date(y, m - 1, d));
    });
    document.getElementById('prevDayBtn').addEventListener('click', () => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      renderTodayView(d);
    });
    document.getElementById('nextDayBtn').addEventListener('click', () => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      renderTodayView(d);
    });
    document.getElementById('todayBtn').addEventListener('click', () => {
      renderTodayView(new Date());
    });
  }

  // ==================== 2. 八字紫微 · 大运流年 ====================
  function renderBaziAndCycles() {
    const res = Bazi.analyze(profile.birthDate, profile.birthHour, profile.gender);
    const cycle = Fortune.getDayunAndLiunian(profile, new Date().getFullYear());

    document.getElementById('baziSummaryBadge').textContent = `${profile.name} · ${res.genderLabel} · 属${res.shengxiao}`;
    document.getElementById('pillarsGrid').innerHTML = res.pillars.map(p => `
      <div class="pillar-box">
        <div class="pillar-label">${p.label}</div>
        <div class="pillar-chars">
          <span class="gz-char wx-${p.stemWx}">${p.stem}</span>
          <span class="gz-char wx-${p.branchWx}">${p.branch}</span>
        </div>
        <div class="pillar-wuxing">${p.stemWx} · ${p.branchWx}</div>
      </div>
    `).join('');

    document.getElementById('wuxingBars').innerHTML = ['金', '木', '水', '火', '土'].map(wx => {
      const count = res.counts[wx];
      const pct = Math.round((count / 8) * 100);
      return `
        <div class="wx-bar-row">
          <strong style="color:${res.wuxingColors[wx]}">${wx}</strong>
          <div class="wx-track">
            <div class="wx-fill" style="width:${Math.max(pct, count > 0 ? 12 : 0)}%; background:${res.wuxingColors[wx]}"></div>
          </div>
          <span class="muted-note">${count} 个</span>
        </div>
      `;
    }).join('');
    document.getElementById('wuxingNote').textContent = res.wuxingNote;

    document.getElementById('ziweiCategory').textContent = res.ziweiStar.category;
    document.getElementById('ziweiStarName').textContent = res.ziweiStar.name;
    document.getElementById('ziweiKeywords').textContent = res.ziweiStar.keywords;
    document.getElementById('ziweiDesc').textContent = res.ziweiStar.desc;

    document.getElementById('dayMasterTitle').textContent = `日主命格：${res.dayMaster.title}`;
    document.getElementById('dayMasterElement').textContent = `五行属${res.dayMaster.element}`;
    document.getElementById('dayMasterGrid').innerHTML = `
      <div class="tip-box"><strong>性格特质</strong><p>${res.dayMaster.personality}</p></div>
      <div class="tip-box"><strong>事业方向</strong><p>${res.dayMaster.career}</p></div>
      <div class="tip-box"><strong>感情与人际</strong><p>${res.dayMaster.love}</p></div>
    `;

    // 近5年流年
    document.getElementById('liunianGrid').innerHTML = cycle.liunian.map(ln => `
      <div class="cycle-card ${ln.isCurrent ? 'is-current' : ''}">
        <div class="cycle-head">
          <span class="cycle-year">${ln.year}</span>
          ${ln.isCurrent ? '<span class="badge badge-gold">今年</span>' : `<span class="muted-note">${ln.age}岁</span>`}
        </div>
        <div class="cycle-gz">${ln.ganzhi} · ${ln.tag}</div>
        <div class="cycle-score">能量指数 ${ln.score} 分</div>
        <p class="cycle-tip">${ln.tip}</p>
      </div>
    `).join('');

    // 大运时间轴
    document.getElementById('currentAgeBadge').textContent = `当前约 ${cycle.currentAge} 虚岁`;
    document.getElementById('dayunGrid').innerHTML = cycle.dayun.map(dy => `
      <div class="cycle-card ${dy.isCurrent ? 'is-current' : ''}">
        <div class="cycle-head">
          <span class="cycle-year">${dy.range}</span>
          ${dy.isCurrent ? '<span class="badge badge-gold">当前大运</span>' : ''}
        </div>
        <div class="cycle-gz">${dy.pillar} · ${dy.label}</div>
        <div class="muted-note" style="font-size:11.5px;">${dy.years}</div>
        <p class="cycle-tip">${dy.theme}</p>
      </div>
    `).join('');

    if (Agent) Agent.setContext('bazi', { bazi: res, cycle });
  }

  // ==================== 3. 趋势 · 十二星座榜 ====================
  function selectTrendPoint(idx) {
    const pt = currentTrendSeries[idx];
    if (!pt) return;
    document.getElementById('trendDetailStrip').innerHTML = `
      <div>
        <strong style="color:#38BDF8">${pt.dateKey}${pt.isToday ? '（今日）' : ''}</strong>
        <span class="badge badge-gold" style="margin-left:8px;">${pt.score} 分 · ${pt.keyword}</span>
      </div>
      <span class="muted-note">${pt.summary}</span>
    `;
  }

  function renderTrendChart(series) {
    currentTrendSeries = series;
    const W = 760, H = 200, padX = 42, padTop = 32, padBottom = 38;
    const stepX = (W - padX * 2) / (series.length - 1);
    const minScore = 50, maxScore = 100;

    const coords = series.map((pt, i) => {
      const x = padX + i * stepX;
      const y = padTop + ((maxScore - pt.score) / (maxScore - minScore)) * (H - padTop - padBottom);
      return { x, y, pt, i };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${H - padBottom} L ${coords[0].x.toFixed(1)} ${H - padBottom} Z`;

    const svg = `
      <svg class="trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="${H - padBottom}" x2="${W - padX}" y2="${H - padBottom}" stroke="rgba(125,211,252,0.2)" />
        <path d="${areaPath}" fill="url(#trendAreaGrad)" />
        <path d="${linePath}" fill="none" stroke="#38BDF8" stroke-width="2.6" stroke-linejoin="round" />
        ${coords.map(c => `
          <g class="trend-node-btn" data-idx="${c.i}">
            <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.pt.isToday ? 7 : 5}"
              fill="${c.pt.isToday ? '#E5B96B' : '#0B1325'}" stroke="${c.pt.isToday ? '#FFF7E6' : '#38BDF8'}" stroke-width="2.5" />
            <text x="${c.x.toFixed(1)}" y="${(c.y - 12).toFixed(1)}" text-anchor="middle"
              fill="${c.pt.isToday ? '#E5B96B' : '#E6EDF7'}" font-size="12" font-family="JetBrains Mono, monospace">${c.pt.score}</text>
            <text x="${c.x.toFixed(1)}" y="${H - 14}" text-anchor="middle"
              fill="${c.pt.isToday ? '#E5B96B' : '#8B9BB4'}" font-size="11.5">${c.pt.isToday ? '今日' : c.pt.shortDate}</text>
          </g>
        `).join('')}
      </svg>
    `;

    const wrap = document.getElementById('trendChartWrap');
    wrap.innerHTML = svg;
    wrap.querySelectorAll('.trend-node-btn').forEach(g => {
      g.addEventListener('click', () => selectTrendPoint(parseInt(g.dataset.idx, 10)));
    });

    const todayIdx = series.findIndex(s => s.isToday);
    selectTrendPoint(todayIdx >= 0 ? todayIdx : 0);
  }

  function renderHoroscopeDetail(signId, ranking) {
    selectedZodiacId = signId;
    document.querySelectorAll('#zodiacRankingList .rank-item').forEach(el => {
      el.classList.toggle('active', el.dataset.sign === signId);
    });

    const data = Horo.getDailyHoroscope(signId, new Date());
    document.getElementById('horoGlyph').textContent = data.sign.glyph;
    document.getElementById('horoName').textContent = data.sign.name;
    document.getElementById('horoDateRange').textContent = `${data.sign.dates} · ${data.sign.element}星座`;
    document.getElementById('horoLuckyPills').innerHTML = `
      <span class="lucky-pill">幸运色：<strong>${data.luckyColor}</strong></span>
      <span class="lucky-pill">幸运数字：<strong>${data.luckyNumber}</strong></span>
      <span class="lucky-pill">速配星座：<strong>${data.matchSign}</strong></span>
    `;
    document.getElementById('horoQuote').textContent = `「${data.quote}」`;
    document.getElementById('horoScores').innerHTML = data.scores.map(s => `
      <div class="score-box">
        <div class="score-top">
          <span>${s.label}</span>
          <span class="score-stars">${renderStars(s.val)}</span>
        </div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${s.val * 20}%"></div></div>
      </div>
    `).join('');
    document.getElementById('horoAdviceGrid').innerHTML = data.advice.map(a => `
      <div class="tip-box"><strong>${a.title}</strong><p>${a.text}</p></div>
    `).join('');

    if (Agent) Agent.setContext('trends', { trend: currentTrendSeries, horoscope: data, ranking });
  }

  function renderTrendAndZodiac() {
    const today = new Date();
    const series = Fortune.getTrendSeries(profile, today);
    renderTrendChart(series);

    const ranking = Fortune.getZodiacDailyRanking(today);
    const listBox = document.getElementById('zodiacRankingList');
    listBox.innerHTML = ranking.map(item => `
      <button type="button" class="rank-item ${item.id === selectedZodiacId ? 'active' : ''}" data-sign="${item.id}">
        <span class="rank-left">
          <span class="rank-num ${item.rank <= 3 ? 'top3' : ''}">${item.rank}</span>
          <span>${item.glyph} ${item.name}</span>
        </span>
        <span class="rank-score">${item.score} 分</span>
      </button>
    `).join('');

    listBox.querySelectorAll('.rank-item').forEach(btn => {
      btn.addEventListener('click', () => renderHoroscopeDetail(btn.dataset.sign, ranking));
    });

    if (!ranking.some(r => r.id === selectedZodiacId)) {
      selectedZodiacId = ranking[0].id;
    }
    renderHoroscopeDetail(selectedZodiacId, ranking);
  }

  // ==================== 4. 缘分合盘 ====================
  function populateCompatSelects(mode) {
    const selA = document.getElementById('compatA');
    const selB = document.getElementById('compatB');
    if (mode === 'zodiac') {
      const opts = Horo.SIGNS.map((s, idx) => `<option value="${idx}">${s.glyph} ${s.name}（${s.element}）</option>`).join('');
      selA.innerHTML = opts;
      selB.innerHTML = opts;
      selA.value = '0';
      selB.value = '4';
    } else {
      const opts = Horo.SHENGXIAO.map((sx, idx) => `<option value="${idx}">属${sx}</option>`).join('');
      selA.innerHTML = opts;
      selB.innerHTML = opts;
      selA.value = '2';
      selB.value = '6';
    }
  }

  function renderCompatResult() {
    const idxA = parseInt(document.getElementById('compatA').value, 10);
    const idxB = parseInt(document.getElementById('compatB').value, 10);
    const res = currentCompatMode === 'zodiac'
      ? Horo.calcZodiacCompat(idxA, idxB)
      : Horo.calcShengxiaoCompat(idxA, idxB);

    document.getElementById('compatScore').textContent = res.score;
    document.getElementById('compatPairTitle').textContent = res.pairTitle;
    document.getElementById('compatTag').textContent = res.tag;
    document.getElementById('compatSummary').textContent = res.summary;
    document.getElementById('compatPros').textContent = res.pros;
    document.getElementById('compatAdvice').textContent = res.advice;

    if (Agent) Agent.setContext('compatibility', res);
  }

  function initCompatibility() {
    populateCompatSelects(currentCompatMode);
    renderCompatResult();

    document.querySelectorAll('#compatModeSwitch .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCompatMode = btn.dataset.mode;
        document.querySelectorAll('#compatModeSwitch .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        populateCompatSelects(currentCompatMode);
        renderCompatResult();
      });
    });
    document.getElementById('compatCalcBtn').addEventListener('click', renderCompatResult);
  }

  // ==================== 5. 灵签 · 塔罗（1张 / 3张） ====================
  function renderTarotSpread(count) {
    const cards = Div.drawTarotSpread(count);
    const grid = document.getElementById('tarotSpreadGrid');
    grid.innerHTML = cards.map(c => `
      <div class="card tarot-spread-card">
        <span class="badge badge-cyan">${c.position}</span>
        <div class="tarot-face ${c.isReversed ? 'reversed' : ''}">
          <span class="tarot-roman">${c.roman}</span>
          <span class="tarot-symbol">${c.symbol}</span>
          <strong class="tarot-name-cn">${c.cn}</strong>
          <span class="tarot-name-en">${c.en}</span>
        </div>
        <div class="compat-title-row" style="justify-content:center; margin-bottom:0;">
          <h3>${c.cn} · ${c.orientationLabel}</h3>
          <span class="badge badge-gold">${c.orientationLabel}</span>
        </div>
        <p class="ziwei-keywords">${c.keywords}</p>
        <p class="analysis-note" style="margin-top:0; text-align:left;">${c.desc}</p>
        <div class="tip-box" style="width:100%; text-align:left;">
          <strong>行动建议</strong>
          <p>${c.advice}</p>
        </div>
      </div>
    `).join('');
    grid.classList.remove('hidden');
    grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (Agent) Agent.setContext('divination', { type: 'tarot', cards });
  }

  function initDivination() {
    document.querySelectorAll('#divModeSwitch .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        document.querySelectorAll('#divModeSwitch .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.getElementById('divQianPanel').classList.toggle('active', mode === 'qian');
        document.getElementById('divTarotPanel').classList.toggle('active', mode === 'tarot');
      });
    });

    const cylinder = document.getElementById('qianCylinder');
    const qianCard = document.getElementById('qianResultCard');
    function performQianDraw() {
      cylinder.classList.remove('shaking');
      void cylinder.offsetWidth;
      cylinder.classList.add('shaking');
      setTimeout(() => {
        const q = Div.drawQian();
        document.getElementById('qianRank').textContent = q.rank;
        document.getElementById('qianNumber').textContent = q.num;
        document.getElementById('qianTitle').textContent = q.title;
        document.getElementById('qianPoem').textContent = q.poem;
        document.getElementById('qianMeaning').textContent = q.meaning;
        document.getElementById('qianGuide').textContent = q.guide;
        qianCard.classList.remove('hidden');
        qianCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (Agent) Agent.setContext('divination', { type: 'qian', data: q });
      }, 450);
    }

    document.getElementById('drawQianBtn').addEventListener('click', performQianDraw);
    document.getElementById('redrawQianBtn').addEventListener('click', performQianDraw);
    document.getElementById('drawTarot1Btn').addEventListener('click', () => renderTarotSpread(1));
    document.getElementById('drawTarot3Btn').addEventListener('click', () => renderTarotSpread(3));
  }

  // ==================== 6. 复盘对账 ====================
  function renderReviewSection() {
    const today = new Date();
    const todayKey = Fortune.formatDateKey(today);
    const todayFortune = Fortune.getDailyPersonalFortune(profile, today);
    const list = Fortune.getCheckins();
    const stats = Fortune.getCheckinStats(list);

    document.getElementById('reviewTodayDate').textContent = todayKey;
    document.getElementById('reviewPredictedVal').textContent = todayFortune.overall;

    document.getElementById('statCount').textContent = `${stats.count} 天`;
    document.getElementById('statAccuracy').textContent = stats.avgAccuracy !== null ? `${stats.avgAccuracy}%` : '待记录';
    document.getElementById('statAvgActual').textContent = stats.avgActual !== null ? `${stats.avgActual} 分` : '待记录';

    const listEl = document.getElementById('checkinList');
    if (list.length === 0) {
      listEl.innerHTML = `<div class="checkin-empty">还没有复盘记录。今晚花 10 秒打个体感分，看看预测和真实感受有多契合吧！</div>`;
    } else {
      listEl.innerHTML = list.map(item => {
        const diff = item.actual - item.predicted;
        const diffLabel = diff === 0 ? '完全一致' : (diff > 0 ? `体感高于预测 +${diff}` : `体感低于预测 ${diff}`);
        return `
          <div class="checkin-item">
            <div class="checkin-top">
              <strong>${item.dateKey} · <span class="badge badge-gold">${item.mood}</span></strong>
              <span class="checkin-scores">预测 ${item.predicted} vs 体感 ${item.actual}（${diffLabel}）</span>
            </div>
            ${item.note ? `<p class="checkin-note">${item.note}</p>` : ''}
          </div>
        `;
      }).join('');
    }

    if (Agent) Agent.setContext('review', { stats, list, todayPredicted: todayFortune.overall });
  }

  function initReviewForm() {
    const range = document.getElementById('reviewActualRange');
    const display = document.getElementById('reviewActualDisplay');
    range.addEventListener('input', () => {
      display.textContent = range.value;
    });

    document.querySelectorAll('#moodChips .mood-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedMood = chip.dataset.mood;
        document.querySelectorAll('#moodChips .mood-chip').forEach(c => c.classList.toggle('active', c === chip));
      });
    });

    document.getElementById('reviewForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const today = new Date();
      const todayFortune = Fortune.getDailyPersonalFortune(profile, today);
      Fortune.saveCheckin({
        dateKey: Fortune.formatDateKey(today),
        predicted: todayFortune.overall,
        actual: parseInt(range.value, 10),
        mood: selectedMood,
        note: document.getElementById('reviewNote').value
      });
      document.getElementById('reviewNote').value = '';
      renderReviewSection();
    });
  }

  // ==================== 启动 ====================
  document.addEventListener('DOMContentLoaded', () => {
    if (Agent) Agent.init();
    initNavigation();
    initProfileBar();
    renderTicker();
    initTodayControls();
    initCompatibility();
    initDivination();
    initReviewForm();
    refreshAllProfileBoundViews();
  });
})();
