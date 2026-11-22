/**
 * 水镜先生 · 十二星座每日运势 & 星座/生肖缘分合盘引擎
 */
window.ShuijingHoroscope = (function () {
  const SIGNS = [
    { id: 'aries', name: '白羊座', glyph: '♈', dates: '3.21-4.19', element: '火象' },
    { id: 'taurus', name: '金牛座', glyph: '♉', dates: '4.20-5.20', element: '土象' },
    { id: 'gemini', name: '双子座', glyph: '♊', dates: '5.21-6.21', element: '风象' },
    { id: 'cancer', name: '巨蟹座', glyph: '♋', dates: '6.22-7.22', element: '水象' },
    { id: 'leo', name: '狮子座', glyph: '♌', dates: '7.23-8.22', element: '火象' },
    { id: 'virgo', name: '处女座', glyph: '♍', dates: '8.23-9.22', element: '土象' },
    { id: 'libra', name: '天秤座', glyph: '♎', dates: '9.23-10.23', element: '风象' },
    { id: 'scorpio', name: '天蝎座', glyph: '♏', dates: '10.24-11.22', element: '水象' },
    { id: 'sagittarius', name: '射手座', glyph: '♐', dates: '11.23-12.21', element: '火象' },
    { id: 'capricorn', name: '摩羯座', glyph: '♑', dates: '12.22-1.19', element: '土象' },
    { id: 'aquarius', name: '水瓶座', glyph: '♒', dates: '1.20-2.18', element: '风象' },
    { id: 'pisces', name: '双鱼座', glyph: '♓', dates: '2.19-3.20', element: '水象' }
  ];

  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  const LUCKY_COLORS = ['朱砂红', '月白色', '黛青色', '琥珀金', '松石绿', '雾霾蓝', '米杏色', '绛紫色', '象牙白', '茶褐色'];

  const QUOTES = [
    '顺势而为，今天最值得信任的是你的第一直觉。',
    '慢下来整理节奏，清晰的方向比盲目加速更重要。',
    '主动迈出的一小步，可能带来意想不到的好消息。',
    '保持开放与好奇，贵人往往藏在轻松的对话之中。',
    '把精力留给真正重要的事，果断对消耗说不。',
    '沉淀与耐心正在开花，今天适合稳步推进计划。',
    '灵感在线的一天，不妨把脑海中的好点子立刻记下来。',
    '温柔对待自己与他人，好情绪会为你吸引好运气。'
  ];

  const LOVE_TEXTS = [
    '单身者容易在日常社交中遇到聊得来的对象；有伴侣者适合安排一次轻松的晚餐或散步，升温很快。',
    '沟通氛围温和，适合把心里的小期待坦诚说出来，对方比你想象中更愿意配合。',
    '情绪略敏感，不必过度解读对方的一句话，给自己和彼此留一点呼吸空间会更舒适。',
    '魅力值走高，真诚自然的表达最打动人；适合推进暧昧关系或共同规划接下来的小旅行。',
    '感情节奏平稳踏实，细水长流的陪伴胜过轰轰烈烈，一句贴心的问候就很有分量。'
  ];

  const CAREER_TEXTS = [
    '思路清晰、执行高效，非常适合攻克拖延已久的重点任务或参与头脑风暴。',
    '团队协作顺畅，主动分享进度和观点容易获得上级或伙伴的认可。',
    '细节决定成败的一天，提交方案或签署文件前多核对一遍，能省去后续麻烦。',
    '可能出现临时调整，不必慌张，你的应变能力会把变动转化为新机会。',
    '适合复盘与学习充电，把手头工作收尾后，为下一阶段做好结构化准备。'
  ];

  const WEALTH_TEXTS = [
    '正财运稳健，之前投入的时间或项目有望看到实际回馈，适合做中长期财务规划。',
    '消费欲略有上升，下单前不妨冷静十分钟，区分“想要”与“需要”能守住钱包。',
    '偏财与小确幸在线，可能收到优惠、红包或有价值的合作信息，保持敏锐。',
    '宜守不宜攻，避免盲目跟风高波动投资，把现金流握在手里最踏实。',
    '适合整理账单与订阅项，精简不必要开支后会有意想不到的结余。'
  ];

  // 确定性哈希（保证同一天同一星座结果一致）
  function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function getDailyHoroscope(signId, date = new Date()) {
    const signIdx = SIGNS.findIndex(s => s.id === signId);
    const sign = SIGNS[signIdx >= 0 ? signIdx : 0];
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const seed = hashSeed(`${dateKey}:${sign.id}`);

    const love = 3 + (seed % 3); // 3~5
    const career = 3 + (Math.floor(seed / 7) % 3);
    const wealth = 3 + (Math.floor(seed / 17) % 3);
    const overall = Math.min(5, Math.max(3, Math.round((love + career + wealth) / 3)));

    const matchSign = SIGNS[(signIdx + 4 + (seed % 5)) % 12];
    const luckyColor = LUCKY_COLORS[seed % LUCKY_COLORS.length];
    const luckyNumber = (seed % 9) + 1;

    return {
      sign,
      dateKey,
      scores: [
        { label: '综合运势', val: overall },
        { label: '爱情指数', val: love },
        { label: '事业学业', val: career },
        { label: '财富指数', val: wealth }
      ],
      luckyColor,
      luckyNumber,
      matchSign: matchSign.name,
      quote: QUOTES[seed % QUOTES.length],
      advice: [
        { title: '爱情与人际', text: LOVE_TEXTS[seed % LOVE_TEXTS.length] },
        { title: '事业与学业', text: CAREER_TEXTS[Math.floor(seed / 11) % CAREER_TEXTS.length] },
        { title: '财富与消费', text: WEALTH_TEXTS[Math.floor(seed / 23) % WEALTH_TEXTS.length] }
      ]
    };
  }

  /** 西洋星座合盘测算（基于黄道宫位相位与四元素） */
  function calcZodiacCompat(idxA, idxB) {
    const a = SIGNS[idxA];
    const b = SIGNS[idxB];
    const diff = Math.min(Math.abs(idxA - idxB), 12 - Math.abs(idxA - idxB));

    let score, tag, summary, pros, advice;
    if (idxA === idxB) {
      score = 86;
      tag = '镜像知己';
      summary = `同属${a.element}星座的你们像照镜子一样懂彼此，无需多言就能接住对方的情绪与节奏。`;
      pros = '价值观与生活步调高度一致，默契感天然拉满，容易成为彼此最信任的拍档。';
      advice = '因为太像，遇到分歧时容易同时固执；轮流退一步，关系会更有弹性。';
    } else if (diff === 4) {
      score = 95;
      tag = '天作之合 · 三合拱相';
      summary = `${a.name}与${b.name}同为${a.element}星座，在占星学中构成最和谐的120°三分相，相处轻松自然、互相滋养。`;
      pros = '气场同频，既有共同话题又能激发彼此最好的一面，是公认的高默契组合。';
      advice = '顺遂之余别忘了持续制造新鲜感，一起设定共同成长的目标会让缘分更深。';
    } else if (diff === 2) {
      score = 89;
      tag = '互补拍档 · 六合吉相';
      summary = `${a.element}与${b.element}构成60°六分相，彼此欣赏又刚好补足对方短板，交流充满火花。`;
      pros = '沟通顺畅、合作高效，既能做恋人也能成为生活与事业上的最佳盟友。';
      advice = '多表达对彼此付出的肯定，把小确幸融入日常，感情会越处越甜。';
    } else if (diff === 6) {
      score = 82;
      tag = '宿命吸引 · 对宫互补';
      summary = `${a.name}与${b.name}互为黄道对宫星座，仿佛磁铁两极，初见就极具张力与宿命吸引力。`;
      pros = '你们拥有对方最渴望的特质，强强联合时能打开全新视野，彼此成就感极强。';
      advice = '尊重彼此截然不同的处事方式，学会“求同存异”就是这段关系的通关密码。';
    } else if (diff === 3) {
      score = 72;
      tag = '欢喜冤家 · 磨合成长';
      summary = `你们在星盘上构成90°四分相，节奏与关注点各异，碰撞多但往往也能激发出深刻成长。`;
      pros = '彼此都不乏主见与个性，只要跨过初期磨合，反而比普通组合更具韧性。';
      advice = '遇事少争输赢、多聊感受，提前约定好沟通底线能大幅提升幸福感。';
    } else {
      score = 78;
      tag = '细水长流 · 渐入佳境';
      summary = `${a.name}（${a.element}）与${b.name}（${b.element}）属于需要时间慢慢读懂的类型，越了解越觉得对方迷人。`;
      pros = '没有刻板剧本，彼此都能从对方身上学到全新的看世界角度。';
      advice = '多一点耐心与好奇心，把差异当成惊喜而非挑剔的理由，缘分自会升温。';
    }

    return {
      pairTitle: `${a.name} ${a.glyph} × ${b.name} ${b.glyph}`,
      score,
      tag,
      summary,
      pros,
      advice
    };
  }

  /** 东方生肖合婚测算（基于传统三合、六合、六冲、相害） */
  function calcShengxiaoCompat(idxA, idxB) {
    const a = SHENGXIAO[idxA];
    const b = SHENGXIAO[idxB];
    const liuhePairs = new Set(['0-1', '2-11', '3-10', '4-9', '5-8', '6-7']);
    const chongDiff = Math.abs(idxA - idxB) === 6;
    const sanhe = (idxA - idxB + 12) % 4 === 0 && idxA !== idxB;
    const key = idxA < idxB ? `${idxA}-${idxB}` : `${idxB}-${idxA}`;

    let score, tag, summary, pros, advice;
    if (liuhePairs.has(key)) {
      score = 96;
      tag = '上上等婚 · 生肖六合';
      summary = `属${a}与属${b}在传统命理中为「六合贵人」，气场相融、彼此旺运，是极为难得的良缘组合。`;
      pros = '互相包容扶持，无论生活起居还是事业规划都能同心协力，家运渐旺。';
      advice = '珍惜这份天然默契，遇到外界杂音时坚定站在彼此身边即可。';
    } else if (sanhe) {
      score = 92;
      tag = '天赐良缘 · 生肖三合';
      summary = `属${a}与属${b}同属「三合」局，志趣相投、进退有度，相处起来舒心而有力量。`;
      pros = '三观契合度高，遇到困难时能第一时间想到一块儿去，合作与伴侣关系皆佳。';
      advice = '保持真诚坦率，定期一起规划家庭或人生大事，幸福感会持续攀升。';
    } else if (idxA === idxB) {
      score = 83;
      tag = '同频相惜 · 同属相伴';
      summary = `同为属${a}的两人性格底色相近，容易理解对方的顾虑与追求，相处自在。`;
      pros = '沟通成本低，生活习惯和审美偏好往往不谋而合。';
      advice = '遇到压力时避免同时情绪化，一方先冷静下来就能很快化解小摩擦。';
    } else if (chongDiff) {
      score = 68;
      tag = '动中求稳 · 六冲磨合';
      summary = `属${a}与属${b}在传统地支中为「六冲」，性格反差明显，相处需要多一分智慧与体谅。`;
      pros = '并非不能相守，相反你们能打破彼此的思维定势，磨合得当反而互补强劲。';
      advice = '凡事多商量少硬碰硬，给彼此保留独立空间，以柔克刚便能化解冲克。';
    } else {
      score = 80;
      tag = '平顺安稳 · 细水长流';
      summary = `属${a}与属${b}无明显冲克，属于平实温暖、靠日常经营愈发醇厚的缘分组合。`;
      pros = '关系平稳少大起大落，彼此尊重各自节奏，适合长久陪伴。';
      advice = '多制造共同回忆，把关心落到生活细节里，感情会越走越稳。';
    }

    return {
      pairTitle: `属${a} × 属${b}`,
      score,
      tag,
      summary,
      pros,
      advice
    };
  }

  return {
    SIGNS,
    SHENGXIAO,
    getDailyHoroscope,
    calcZodiacCompat,
    calcShengxiaoCompat
  };
})();
