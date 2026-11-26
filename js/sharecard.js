/**
 * 水镜运见 2.0 · 每日五行穿衣分享卡片生成器（Canvas 1080x1440 · 3:4 竖版，适配小红书 & Pinterest）
 * 支持一键切换中/英双版卡片、下载高清 PNG、一键复制社媒配文
 */
window.YunjianShareCard = (function () {
  let currentAlm = null;
  let cardLang = 'zh';
  let lastDataUrl = '';

  function getI18n() {
    return window.YunjianI18n || null;
  }

  function formatDateStr(alm) {
    const m = String(alm.month).padStart(2, '0');
    const d = String(alm.day).padStart(2, '0');
    return `${alm.year}-${m}-${d}`;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapLines(ctx, text, maxWidth, maxLines) {
    const lines = [];
    const isAsciiSpace = /\s/.test(text);
    const tokens = isAsciiSpace ? text.split(' ') : Array.from(text);
    let line = '';
    for (let i = 0; i < tokens.length; i++) {
      const sep = isAsciiSpace && line ? ' ' : '';
      const test = line + sep + tokens[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = tokens[i];
        if (maxLines && lines.length >= maxLines - 1) {
          // fit remainder with ellipsis
          let rest = tokens.slice(i).join(isAsciiSpace ? ' ' : '');
          while (rest.length > 1 && ctx.measureText(rest + '…').width > maxWidth) {
            rest = rest.slice(0, -1);
          }
          lines.push(rest + (ctx.measureText(tokens.slice(i).join(isAsciiSpace ? ' ' : '')).width > maxWidth ? '…' : ''));
          return lines;
        }
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawShirtIcon(ctx, cx, cy, strokeColor) {
    ctx.save();
    ctx.translate(cx - 22, cy - 22);
    ctx.scale(1.85, 1.85);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(3, 7);
    ctx.lineTo(5, 11);
    ctx.lineTo(8, 9.5);
    ctx.lineTo(8, 20);
    ctx.lineTo(16, 20);
    ctx.lineTo(16, 9.5);
    ctx.lineTo(19, 11);
    ctx.lineTo(21, 7);
    ctx.lineTo(16, 4);
    ctx.arc(12, 4, 4, 0, Math.PI, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function renderPosterCanvas(canvas, rawAlm, lang) {
    const W = 1080;
    const H = 1440;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const I18n = getI18n();
    const en = lang === 'en';

    // 背景渐变（深空星象蓝）
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#070B14');
    bgGrad.addColorStop(0.5, '#0D172B');
    bgGrad.addColorStop(1, '#091122');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 氛围星光晕
    const glow1 = ctx.createRadialGradient(180, 180, 10, 180, 180, 420);
    glow1.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    glow1.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(900, 1240, 10, 900, 1240, 440);
    glow2.addColorStop(0, 'rgba(229, 185, 107, 0.20)');
    glow2.addColorStop(1, 'rgba(229, 185, 107, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // 细密星点
    ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
    for (let i = 0; i < 42; i++) {
      const sx = ((i * 197 + 73) % (W - 80)) + 40;
      const sy = ((i * 313 + 41) % (H - 80)) + 40;
      const sr = (i % 3 === 0) ? 2 : 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 外框描金边
    ctx.strokeStyle = 'rgba(229, 185, 107, 0.35)';
    ctx.lineWidth = 2;
    roundRect(ctx, 32, 32, W - 64, H - 64, 32);
    ctx.stroke();

    const padX = 72;
    const contentW = W - padX * 2;
    const fontSerif = '"Noto Serif SC", "Songti SC", Georgia, serif';
    const fontSans = '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const fontMono = '"JetBrains Mono", Menlo, monospace';

    // 顶部品牌印章与域名
    roundRect(ctx, padX, 74, 62, 62, 14);
    ctx.fillStyle = 'rgba(229, 185, 107, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(229, 185, 107, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#E5B96B';
    ctx.font = `700 22px ${fontSerif}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('水鏡', padX + 31, 106);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `700 30px ${fontSerif}`;
    ctx.fillText(en ? 'Shuijing YunJian' : '水镜运见', padX + 80, 94);

    ctx.fillStyle = '#7DD3FC';
    ctx.font = `500 18px ${fontMono}`;
    ctx.fillText('YUNJIANS.COM · NEO-CELESTIAL', padX + 80, 124);

    // 右上角日期胶囊
    const dateLabel = formatDateStr(rawAlm);
    ctx.font = `600 22px ${fontMono}`;
    const pillW = 210;
    roundRect(ctx, W - padX - pillW, 82, pillW, 46, 23);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#7DD3FC';
    ctx.textAlign = 'center';
    ctx.fillText(dateLabel, W - padX - pillW / 2, 106);

    // 主标题区
    ctx.textAlign = 'left';
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `700 ${en ? 46 : 52}px ${fontSerif}`;
    ctx.fillText(en ? 'Daily Five-Element Lucky Colors' : '每日五行穿衣指南', padX, 206);

    const w = rawAlm.wardrobe;
    const dayElEn = I18n ? (I18n.ELEMENT_EN[w.dayElement] || w.dayElement) : w.dayElement;
    const subText = en
      ? `Day Element: ${dayElEn} (${w.dayBranch})  ·  Lunar ${rawAlm.lunar}  ·  ${rawAlm.ganzhiText}`
      : `${rawAlm.year}年${rawAlm.month}月${rawAlm.day}日 ${rawAlm.weekday} · ${rawAlm.lunar} · 日支「${w.dayBranch}」五行属${w.dayElement}`;
    ctx.fillStyle = '#94A3B8';
    ctx.font = `400 22px ${fontSans}`;
    ctx.fillText(subText, padX, 254);

    // 分隔线
    const lineGrad = ctx.createLinearGradient(padX, 0, W - padX, 0);
    lineGrad.addColorStop(0, 'rgba(229, 185, 107, 0.6)');
    lineGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
    lineGrad.addColorStop(1, 'rgba(229, 185, 107, 0.08)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(padX, 282, contentW, 2);

    // 五行穿衣 5 档卡片
    const badgePalette = {
      'tier-best': { bg: 'rgba(229, 185, 107, 0.22)', fg: '#F3D299', border: 'rgba(229, 185, 107, 0.55)' },
      'tier-good': { bg: 'rgba(56, 189, 248, 0.20)', fg: '#7DD3FC', border: 'rgba(56, 189, 248, 0.5)' },
      'tier-wealth': { bg: 'rgba(52, 211, 153, 0.20)', fg: '#6EE7B7', border: 'rgba(52, 211, 153, 0.45)' },
      'tier-drain': { bg: 'rgba(148, 163, 184, 0.18)', fg: '#CBD5E1', border: 'rgba(148, 163, 184, 0.35)' },
      'tier-avoid': { bg: 'rgba(251, 113, 133, 0.18)', fg: '#FDA4AF', border: 'rgba(251, 113, 133, 0.45)' }
    };

    let y = 312;
    const cardH = 154;
    const gapY = 18;

    w.tiers.forEach((t, idx) => {
      const enTier = (I18n && I18n.COLOR_TIER_EN && I18n.COLOR_TIER_EN[t.name]) || null;
      const levelTxt = en && enTier ? enTier.level : t.level;
      const nameTxt = en && enTier ? enTier.name : t.name;
      const colorsTxt = en && I18n && I18n.PALETTE_EN[t.element] ? I18n.PALETTE_EN[t.element] : t.colors;
      const elTxt = en && I18n ? (I18n.ELEMENT_EN[t.element] || t.element) : t.element;
      const descTxt = en && enTier ? enTier.desc : t.desc;

      // 卡片背景
      roundRect(ctx, padX, y, contentW, cardH, 22);
      ctx.fillStyle = idx === 0 ? 'rgba(229, 185, 107, 0.08)' : 'rgba(15, 23, 42, 0.72)';
      ctx.fill();
      ctx.strokeStyle = idx === 0 ? 'rgba(229, 185, 107, 0.45)' : 'rgba(125, 211, 252, 0.16)';
      ctx.lineWidth = idx === 0 ? 2 : 1.2;
      ctx.stroke();

      // 左侧色块 + 衣服图标
      const swSize = 96;
      const swX = padX + 26;
      const swY = y + (cardH - swSize) / 2;
      roundRect(ctx, swX, swY, swSize, swSize, 20);
      ctx.fillStyle = t.swatchBg;
      ctx.fill();
      ctx.strokeStyle = t.border;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      drawShirtIcon(ctx, swX + swSize / 2, swY + swSize / 2, t.swatchInk);

      // 右侧文字区
      const tx = swX + swSize + 28;
      const tw = contentW - (swSize + 26 + 28 + 26);

      // 档位标签胶囊
      const bp = badgePalette[t.badgeClass] || badgePalette['tier-good'];
      const badgeLabel = en ? `${levelTxt} · ${nameTxt}` : `${levelTxt} ·《${nameTxt}》`;
      ctx.font = `600 22px ${fontSans}`;
      const bw = ctx.measureText(badgeLabel).width + 28;
      roundRect(ctx, tx, y + 22, bw, 38, 19);
      ctx.fillStyle = bp.bg;
      ctx.fill();
      ctx.strokeStyle = bp.border;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = bp.fg;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeLabel, tx + 14, y + 41);

      // 五行角标
      ctx.fillStyle = '#94A3B8';
      ctx.font = `500 20px ${fontSans}`;
      ctx.fillText(en ? `Element: ${elTxt}` : `五行属${elTxt}`, tx + bw + 14, y + 41);

      // 推荐色系
      ctx.fillStyle = '#F8FAFC';
      ctx.font = `600 25px ${fontSans}`;
      ctx.fillText(colorsTxt, tx, y + 84);

      // 一句话解读（自动换行最多2行）
      ctx.fillStyle = '#94A3B8';
      ctx.font = `400 19px ${fontSans}`;
      const descLines = wrapLines(ctx, descTxt, tw, 2);
      descLines.forEach((line, li) => {
        ctx.fillText(line, tx, y + 116 + li * 24);
      });

      y += cardH + gapY;
    });

    // 今日生肖吉凶条
    const zodY = y + 8;
    const zodH = 108;
    roundRect(ctx, padX, zodY, contentW, zodH, 20);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const mapAnimals = (arr) => en && I18n
      ? arr.map(a => I18n.ANIMAL_EN[a] || a).join(', ')
      : arr.join('、');

    const cols = [
      { label: en ? 'Best Zodiacs' : '今日特吉生肖', val: mapAnimals(w.zodiacLuck.best), color: '#E5B96B' },
      { label: en ? 'Good Zodiacs' : '今日次吉生肖', val: mapAnimals(w.zodiacLuck.secondary), color: '#7DD3FC' },
      { label: en ? 'Caution Signs' : '今日需要注意', val: mapAnimals(w.zodiacLuck.caution), color: '#FDA4AF' }
    ];
    const colW = contentW / 3;
    cols.forEach((c, ci) => {
      const cx = padX + ci * colW + colW / 2;
      if (ci > 0) {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.14)';
        ctx.fillRect(padX + ci * colW, zodY + 20, 1, zodH - 40);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94A3B8';
      ctx.font = `500 20px ${fontSans}`;
      ctx.fillText(c.label, cx, zodY + 36);
      ctx.fillStyle = c.color;
      ctx.font = `700 ${en ? 22 : 26}px ${fontSans}`;
      ctx.fillText(c.val, cx, zodY + 74);
    });

    // 底部品牌水印 & 引流提示
    const footY = H - 102;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E5B96B';
    ctx.font = `600 24px ${fontMono}`;
    ctx.fillText(en ? 'https://yunjians.com/?lang=en' : 'https://yunjians.com', padX, footY);

    ctx.fillStyle = '#94A3B8';
    ctx.font = `400 19px ${fontSans}`;
    ctx.fillText(
      en
        ? 'Free Eastern Almanac · BaZi · Five-Element Colors · AI Sage (No Sign-Up)'
        : '免登录查每日五行穿衣 · 智能老黄历 · 八字紫微 · 水镜先生 AI 实时解说',
      padX,
      footY + 34
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
    ctx.font = `600 19px ${fontSans}`;
    ctx.fillText(en ? 'Save & Share ✦' : '长按 / 下载保存分享 ✦', W - padX, footY + 14);

    lastDataUrl = canvas.toDataURL('image/png');
    return lastDataUrl;
  }

  function buildSocialCaption(rawAlm, lang) {
    const I18n = getI18n();
    const w = rawAlm.wardrobe;
    const dateStr = formatDateStr(rawAlm);
    const best = w.tiers[0];
    const good = w.tiers[1];
    const avoid = w.tiers[4];

    if (lang === 'en') {
      const dayEl = I18n ? (I18n.ELEMENT_EN[w.dayElement] || w.dayElement) : w.dayElement;
      const bestColors = I18n ? (I18n.PALETTE_EN[best.element] || best.colors) : best.colors;
      const goodColors = I18n ? (I18n.PALETTE_EN[good.element] || good.colors) : good.colors;
      const avoidColors = I18n ? (I18n.PALETTE_EN[avoid.element] || avoid.colors) : avoid.colors;
      const bestZ = I18n ? w.zodiacLuck.best.map(a => I18n.ANIMAL_EN[a] || a).join(', ') : w.zodiacLuck.best.join(', ');
      return (
        `✨ ${dateStr} Five-Element Lucky Color Guide (Day Element: ${dayEl})\n\n` +
        `🌟 Best (Noble Color): ${bestColors}\n` +
        `🤝 Good (Partner Color): ${goodColors}\n` +
        `⚠️ Avoid Large Areas: ${avoidColors}\n` +
        `🐉 Luckiest Zodiacs Today: ${bestZ}\n\n` +
        `Check your personal BaZi & daily lucky colors free (no sign-up): https://yunjians.com/?lang=en\n\n` +
        `#LuckyColor #FiveElements #ChineseAstrology #BaZi #OOTD #DailyHoroscope #FengShui`
      );
    }

    return (
      `✨ ${rawAlm.year}年${rawAlm.month}月${rawAlm.day}日（${rawAlm.lunar}）每日五行穿衣指南\n` +
      `今日日支「${w.dayBranch}」五行属${w.dayElement}：\n\n` +
      `🌟 大吉·贵人色：${best.colors}（轻松顺遂、旺贵人）\n` +
      `🤝 次吉·合作色：${good.colors}（利于谈判签约、团队协作）\n` +
      `⚠️ 尽量避开：${avoid.colors}\n` +
      `🐉 今日特吉生肖：${w.zodiacLuck.best.join('、')}\n\n` +
      `👉 每天 10 秒查专属运势与穿衣配色（免登录）：yunjians.com\n\n` +
      `#五行穿衣 #每日五行穿衣 #今日幸运色 #穿搭灵感 #老黄历 #水镜运见`
    );
  }

  function updateModalContent() {
    if (!currentAlm) return;
    const canvas = document.getElementById('shareCardCanvas');
    const previewImg = document.getElementById('shareCardPreviewImg');
    if (!canvas || !previewImg) return;

    const url = renderPosterCanvas(canvas, currentAlm, cardLang);
    previewImg.src = url;

    document.querySelectorAll('#shareCardLangSwitch .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cardlang === cardLang);
    });

    const captionBox = document.getElementById('shareCardCaption');
    if (captionBox) {
      captionBox.value = buildSocialCaption(currentAlm, cardLang);
    }
  }

  function open(rawAlm) {
    if (!rawAlm || !rawAlm.wardrobe) return;
    currentAlm = rawAlm;
    const I18n = getI18n();
    cardLang = (I18n && I18n.isEn()) ? 'en' : 'zh';

    const modal = document.getElementById('shareCardModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateModalContent();
  }

  function close() {
    const modal = document.getElementById('shareCardModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function init() {
    const modal = document.getElementById('shareCardModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeShareCardBtn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
    });

    document.querySelectorAll('#shareCardLangSwitch .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cardLang = btn.dataset.cardlang === 'en' ? 'en' : 'zh';
        updateModalContent();
      });
    });

    const dlBtn = document.getElementById('downloadShareCardBtn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        if (!lastDataUrl || !currentAlm) return;
        const a = document.createElement('a');
        a.href = lastDataUrl;
        a.download = `yunjians-wardrobe-${formatDateStr(currentAlm)}-${cardLang}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    const copyBtn = document.getElementById('copyShareCaptionBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const captionBox = document.getElementById('shareCardCaption');
        if (!captionBox) return;
        const orig = copyBtn.textContent;
        try {
          await navigator.clipboard.writeText(captionBox.value);
          copyBtn.textContent = cardLang === 'en' ? '✓ Copied!' : '✓ 已复制文案';
        } catch {
          captionBox.select();
          document.execCommand('copy');
          copyBtn.textContent = cardLang === 'en' ? '✓ Copied!' : '✓ 已复制文案';
        }
        setTimeout(() => { copyBtn.textContent = orig; }, 1800);
      });
    }
  }

  return { init, open, close, buildSocialCaption };
})();
