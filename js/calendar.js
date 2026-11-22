/**
 * 水镜先生 · 历法与老黄历引擎
 * 提供：干支历（年/月/日/时）、农历格式化、节气、建除十二神宜忌、冲煞、财喜神方位、十二时辰吉凶
 */
window.ShuijingCalendar = (function () {
  const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  const STEM_WUXING = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水'
  };

  const BRANCH_WUXING = {
    子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
    午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水'
  };

  // 六十甲子纳音（每两年/两日共用一纳音，共30组）
  const NAYIN_30 = [
    '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
    '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
    '沙中金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
    '大溪水', '沙中土', '天上火', '石榴木', '大海水'
  ];

  // 日干对应的财神、喜神方位（传统通书口诀）
  const CAISHEN_DIR = ['东北', '东北', '正西', '正西', '正北', '正北', '正东', '正东', '正南', '正南'];
  const XISHEN_DIR = ['东北', '西北', '西南', '正南', '东南', '东北', '西北', '西南', '正南', '东南'];

  // 地支相冲与煞方
  const SHA_DIR = ['南', '东', '北', '西', '南', '东', '北', '西', '南', '东', '北', '西'];

  // 建除十二神对应的传统宜忌
  const JIANCHU_DATA = [
    { name: '建日', yi: ['出行', '赴任', '祈福', '求嗣', '纳采', '立券'], ji: ['动土', '开仓', '掘井', '安葬'] },
    { name: '除日', yi: ['沐浴', '扫舍', '求医', '治病', '解除', '出行'], ji: ['嫁娶', '赴任', '开市', '搬家'] },
    { name: '满日', yi: ['嫁娶', '祈福', '开市', '立券', '纳财', '祭祀'], ji: ['动土', '安葬', '破土', '服药'] },
    { name: '平日', yi: ['修造', '涂泥', '余事勿取', '修饰垣墙', '平治道涂'], ji: ['嫁娶', '开市', '动土', '远行'] },
    { name: '定日', yi: ['嫁娶', '纳采', '订盟', '祭祀', '交易', '签约'], ji: ['诉讼', '出行', '搬家', '词讼'] },
    { name: '执日', yi: ['祭祀', '捕捉', '签约', '立券', '纳采', '造屋'], ji: ['开市', '出行', '移徙', '入宅'] },
    { name: '破日', yi: ['破屋', '坏垣', '求医', '治病', '余事勿取'], ji: ['嫁娶', '开市', '签约', '搬家', '出行'] },
    { name: '危日', yi: ['祭祀', '祈福', '安床', '纳采', '入殓'], ji: ['登高', '行船', '动土', '破土'] },
    { name: '成日', yi: ['开市', '嫁娶', '签约', '入学', '搬家', '纳财', '出行'], ji: ['诉讼', '争执', '词讼'] },
    { name: '收日', yi: ['纳财', '收账', '祭祀', '捕捉', '入学', '嫁娶'], ji: ['开市', '安葬', '动土', '放债'] },
    { name: '开日', yi: ['开市', '搬家', '嫁娶', '出行', '求财', '签约', '动土'], ji: ['安葬', '破土', '伐木'] },
    { name: '闭日', yi: ['祭祀', '修补', '筑堤', '埋葬', '静养'], ji: ['开市', '嫁娶', '出行', '搬家', '求医'] }
  ];

  // 24节气近似公历日期（月-日）
  const SOLAR_TERMS = [
    { name: '小寒', m: 1, d: 5 }, { name: '大寒', m: 1, d: 20 },
    { name: '立春', m: 2, d: 4 }, { name: '雨水', m: 2, d: 19 },
    { name: '惊蛰', m: 3, d: 5 }, { name: '春分', m: 3, d: 20 },
    { name: '清明', m: 4, d: 5 }, { name: '谷雨', m: 4, d: 20 },
    { name: '立夏', m: 5, d: 5 }, { name: '小满', m: 5, d: 21 },
    { name: '芒种', m: 6, d: 6 }, { name: '夏至', m: 6, d: 21 },
    { name: '小暑', m: 7, d: 7 }, { name: '大暑', m: 7, d: 23 },
    { name: '立秋', m: 8, d: 7 }, { name: '处暑', m: 8, d: 23 },
    { name: '白露', m: 9, d: 7 }, { name: '秋分', m: 9, d: 23 },
    { name: '寒露', m: 10, d: 8 }, { name: '霜降', m: 10, d: 23 },
    { name: '立冬', m: 11, d: 7 }, { name: '小雪', m: 11, d: 22 },
    { name: '大雪', m: 12, d: 7 }, { name: '冬至', m: 12, d: 21 }
  ];

  const HOUR_RANGES = [
    '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
    '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
    '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
  ];

  // 青龙黄道十二神（吉神：青龙0、明堂1、金匮4、天德5、玉堂7、司命10）
  const HUANGDAO_GOOD = new Set([0, 1, 4, 5, 7, 10]);
  // 日支起青龙地支索引：子午起申(8)、丑未起戌(10)、寅申起子(0)、卯酉起寅(2)、辰戌起辰(4)、巳亥起午(6)
  const QINGLONG_START = [8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6];

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  /** 计算日干支序号 (0=甲子 .. 59=癸亥)。基准：2000-01-01 为戊午日 (54) */
  function getDayGanzhiIndex(date) {
    const utcTarget = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const utcBase = Date.UTC(2000, 0, 1);
    const diffDays = Math.round((utcTarget - utcBase) / 86400000);
    return mod(54 + diffDays, 60);
  }

  /** 根据节气推算八字节气月（寅月=0 .. 丑月=11）与八字年 */
  function getSolarMonthAndYear(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    // 十二节（交月节气）近似日期
    const jieStarts = [
      { m: 2, d: 4, idx: 0 },  // 立春 -> 寅月
      { m: 3, d: 6, idx: 1 },  // 惊蛰 -> 卯月
      { m: 4, d: 5, idx: 2 },  // 清明 -> 辰月
      { m: 5, d: 5, idx: 3 },  // 立夏 -> 巳月
      { m: 6, d: 6, idx: 4 },  // 芒种 -> 午月
      { m: 7, d: 7, idx: 5 },  // 小暑 -> 未月
      { m: 8, d: 7, idx: 6 },  // 立秋 -> 申月
      { m: 9, d: 8, idx: 7 },  // 白露 -> 酉月
      { m: 10, d: 8, idx: 8 }, // 寒露 -> 戌月
      { m: 11, d: 7, idx: 9 }, // 立冬 -> 亥月
      { m: 12, d: 7, idx: 10 } // 大雪 -> 子月
    ];

    let baziYear = y;
    let monthIdx = 11; // 默认丑月（小寒后、立春前）

    if (m === 1) {
      baziYear = y - 1;
      monthIdx = d >= 5 ? 11 : 10; // 小寒前为子月，小寒后为丑月
    } else if (m === 2 && d < 4) {
      baziYear = y - 1;
      monthIdx = 11;
    } else {
      for (let i = jieStarts.length - 1; i >= 0; i--) {
        const j = jieStarts[i];
        if (m > j.m || (m === j.m && d >= j.d)) {
          monthIdx = j.idx;
          break;
        }
      }
    }
    return { baziYear, monthIdx }; // monthIdx: 0=寅 .. 11=丑
  }

  /** 获取完整四柱（年、月、日、时） */
  function getFourPillars(date, hourBranchIdx) {
    const { baziYear, monthIdx } = getSolarMonthAndYear(date);

    // 年柱
    const yearGzIdx = mod(baziYear - 4, 60);
    const yearStem = mod(yearGzIdx, 10);
    const yearBranch = mod(yearGzIdx, 12);

    // 月柱（五虎遁：甲己之年丙作首 -> 寅月天干）
    const yinStem = mod(yearStem * 2 + 2, 10);
    const monthStem = mod(yinStem + monthIdx, 10);
    const monthBranch = mod(2 + monthIdx, 12); // 寅=2

    // 日柱
    const dayGzIdx = getDayGanzhiIndex(date);
    const dayStem = mod(dayGzIdx, 10);
    const dayBranch = mod(dayGzIdx, 12);

    // 时柱（五鼠遁：甲己还加甲 -> 子时天干）
    const ziStem = mod(dayStem * 2, 10);
    const hIdx = typeof hourBranchIdx === 'number' ? hourBranchIdx : getCurrentHourBranch(date);
    const hourStem = mod(ziStem + hIdx, 10);
    const hourBranch = mod(hIdx, 12);

    return {
      baziYear,
      year: { stem: STEMS[yearStem], branch: BRANCHES[yearBranch], stemIdx: yearStem, branchIdx: yearBranch, gzIdx: yearGzIdx },
      month: { stem: STEMS[monthStem], branch: BRANCHES[monthBranch], stemIdx: monthStem, branchIdx: monthBranch },
      day: { stem: STEMS[dayStem], branch: BRANCHES[dayBranch], stemIdx: dayStem, branchIdx: dayBranch, gzIdx: dayGzIdx },
      hour: { stem: STEMS[hourStem], branch: BRANCHES[hourBranch], stemIdx: hourStem, branchIdx: hourBranch },
      shengxiao: SHENGXIAO[yearBranch]
    };
  }

  /** 当前时间对应的时辰索引 (0=子 .. 11=亥) */
  function getCurrentHourBranch(date) {
    const h = date.getHours();
    if (h === 23 || h === 0) return 0;
    return Math.floor((h + 1) / 2);
  }

  /** 使用浏览器内置中华农历格式化（支持闰月） */
  function getLunarLabel(date) {
    try {
      const fmt = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { month: 'long', day: 'numeric' });
      const parts = fmt.formatToParts(date);
      const monthPart = parts.find(p => p.type === 'month')?.value || '';
      const dayNum = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
      const dayNames = [
        '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
      ];
      const dayText = dayNames[dayNum] || `${dayNum}日`;
      return `农历${monthPart}${dayText}`;
    } catch (e) {
      return '农历历法';
    }
  }

  /** 获取当日或最近节气标签 */
  function getSolarTermInfo(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    for (const term of SOLAR_TERMS) {
      if (term.m === m && Math.abs(term.d - d) <= 1) {
        return term.d === d ? `节气 · ${term.name}` : `临近 ${term.name}`;
      }
    }
    // 找上一个已过节气
    let current = SOLAR_TERMS[SOLAR_TERMS.length - 1].name;
    for (const term of SOLAR_TERMS) {
      if (m > term.m || (m === term.m && d >= term.d)) {
        current = term.name;
      }
    }
    return `${current}节气`;
  }

  /** 获取西洋星座名称 */
  function getZodiacByDate(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const list = [
      { name: '摩羯座', m: 1, d: 19 }, { name: '水瓶座', m: 2, d: 18 },
      { name: '双鱼座', m: 3, d: 20 }, { name: '白羊座', m: 4, d: 19 },
      { name: '金牛座', m: 5, d: 20 }, { name: '双子座', m: 6, d: 21 },
      { name: '巨蟹座', m: 7, d: 22 }, { name: '狮子座', m: 8, d: 22 },
      { name: '处女座', m: 9, d: 22 }, { name: '天秤座', m: 10, d: 23 },
      { name: '天蝎座', m: 11, d: 22 }, { name: '射手座', m: 12, d: 21 },
      { name: '摩羯座', m: 12, d: 31 }
    ];
    for (const item of list) {
      if (m < item.m || (m === item.m && d <= item.d)) return item.name;
    }
    return '摩羯座';
  }

  /** 获取某日的完整老黄历数据 */
  function getAlmanac(date) {
    const pillars = getFourPillars(date);
    const dayStemIdx = pillars.day.stemIdx;
    const dayBranchIdx = pillars.day.branchIdx;
    const monthBranchIdx = pillars.month.branchIdx;

    // 建除十二神：以月建地支起建，顺数至日支
    const jianchuIdx = mod(dayBranchIdx - monthBranchIdx, 12);
    const jianchu = JIANCHU_DATA[jianchuIdx];

    // 冲煞
    const chongBranchIdx = mod(dayBranchIdx + 6, 12);
    const chongSha = `冲${SHENGXIAO[chongBranchIdx]}煞${SHA_DIR[dayBranchIdx]}`;

    // 纳音
    const nayin = NAYIN_30[Math.floor(pillars.day.gzIdx / 2)];

    // 十二时辰吉凶（青龙黄道）
    const qlStart = QINGLONG_START[dayBranchIdx];
    const ziStem = mod(dayStemIdx * 2, 10);
    const hours = BRANCHES.map((br, idx) => {
      const offset = mod(idx - qlStart, 12);
      const isGood = HUANGDAO_GOOD.has(offset);
      const hStem = STEMS[mod(ziStem + idx, 10)];
      return {
        idx,
        branch: br,
        ganzhi: `${hStem}${br}时`,
        range: HOUR_RANGES[idx],
        isGood,
        luckText: isGood ? '吉' : '凶'
      };
    });

    return {
      date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: WEEKDAYS[date.getDay()],
      lunar: getLunarLabel(date),
      solarTerm: getSolarTermInfo(date),
      zodiac: getZodiacByDate(date),
      shengxiao: pillars.shengxiao,
      pillars,
      ganzhiText: `${pillars.year.stem}${pillars.year.branch}年 · ${pillars.month.stem}${pillars.month.branch}月 · ${pillars.day.stem}${pillars.day.branch}日`,
      jianchuName: jianchu.name,
      yi: jianchu.yi,
      ji: jianchu.ji,
      chongSha,
      caishen: CAISHEN_DIR[dayStemIdx],
      xishen: XISHEN_DIR[dayStemIdx],
      nayin,
      hours,
      wardrobe: getWardrobeGuide(dayBranchIdx)
    };
  }

  /** 每日五行穿衣搭配 & 今日生肖吉凶（依据日支五行生克与地支三合/六合/冲害刑） */
  function getWardrobeGuide(dayBranchIdx) {
    const dayBranch = BRANCHES[dayBranchIdx];
    const dayEl = BRANCH_WUXING[dayBranch];

    const WUXING_PALETTE = {
      金: { colors: '白色、银色、杏色、乳白色系', swatchBg: '#F1F5F9', swatchInk: '#334155', border: '#CBD5E1' },
      土: { colors: '黄色、咖啡、棕色、卡其、褐色系', swatchBg: '#FACC15', swatchInk: '#422006', border: '#EAB308' },
      木: { colors: '绿色、青色、翠色、浅绿系', swatchBg: '#34D399', swatchInk: '#064E3B', border: '#10B981' },
      火: { colors: '红色、粉色、橙色、紫色、花色系', swatchBg: '#FB7185', swatchInk: '#4C0519', border: '#F43F5E' },
      水: { colors: '黑色、蓝色、灰色系', swatchBg: '#334155', swatchInk: '#E2E8F0', border: '#64748B' }
    };

    const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
    const GENERATED_BY = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
    const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
    const CONTROLLED_BY = { 木: '金', 土: '木', 水: '土', 火: '水', 金: '火' };

    const tiers = [
      {
        level: '吉',
        badgeClass: 'ward-badge-best',
        name: '贵人色',
        element: GENERATES[dayEl],
        desc: '与当日五行相生，为贵人色，即大环境生你之意，易招贵人扶助、人缘与异性缘走高，与整体磁场合一圆融。'
      },
      {
        level: '次吉',
        badgeClass: 'ward-badge-good',
        name: '合作色',
        element: dayEl,
        desc: '与当日五行相符，为幸运合作色，适合商务沟通、谈判签约与团队协作，更容易达成共识与共赢。'
      },
      {
        level: '平',
        badgeClass: 'ward-badge-mid',
        name: '进财色',
        element: CONTROLLED_BY[dayEl],
        desc: '与当日五行相克，为奋斗进财色，做事需要付出更多精力，但通过主动调节带旺，成功后往往收获颇丰。'
      },
      {
        level: '较差',
        badgeClass: 'ward-badge-weak',
        name: '消耗色',
        element: GENERATED_BY[dayEl],
        desc: '生当日五行，即你去生大环境之意，容易感觉耗神较累，更适合内心能量充足时用来挑战突破。'
      },
      {
        level: '不宜',
        badgeClass: 'ward-badge-avoid',
        name: '不利色',
        element: CONTROLS[dayEl],
        desc: '即大环境克你，办事推进容易遇阻或事倍功半，重要场合建议尽量避开大面积穿着此色系。'
      }
    ].map(t => ({
      ...t,
      ...WUXING_PALETTE[t.element]
    }));

    // 今日生肖（三合+六合=特吉；冲+害+刑=需要注意；其余挑3个=次吉）
    const LIUHE = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const LIUHAI = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8];
    const XING = [3, 10, 5, 0, 4, 8, 6, 1, 2, 9, 7, 11];

    const bestSet = new Set([mod(dayBranchIdx + 8, 12), mod(dayBranchIdx + 4, 12), LIUHE[dayBranchIdx]]);
    const cautionSet = new Set([XING[dayBranchIdx], LIUHAI[dayBranchIdx], mod(dayBranchIdx + 6, 12)]);
    // 若自刑与特吉冲突，以特吉优先
    bestSet.forEach(x => cautionSet.delete(x));

    const secondaryList = [];
    const candidates = [dayBranchIdx, mod(dayBranchIdx + 1, 12), mod(dayBranchIdx + 7, 12), mod(dayBranchIdx + 2, 12), mod(dayBranchIdx + 3, 12)];
    for (const c of candidates) {
      if (!bestSet.has(c) && !cautionSet.has(c) && !secondaryList.includes(c)) {
        secondaryList.push(c);
      }
      if (secondaryList.length >= 3) break;
    }

    return {
      dayBranch,
      dayElement: dayEl,
      tiers,
      zodiacLuck: {
        best: Array.from(bestSet).map(i => SHENGXIAO[i]),
        secondary: secondaryList.map(i => SHENGXIAO[i]),
        caution: Array.from(cautionSet).map(i => SHENGXIAO[i])
      }
    };
  }

  return {
    STEMS,
    BRANCHES,
    SHENGXIAO,
    STEM_WUXING,
    BRANCH_WUXING,
    getFourPillars,
    getCurrentHourBranch,
    getAlmanac,
    getLunarLabel
  };
})();
