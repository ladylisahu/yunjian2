/**
 * 水镜先生 · 灵签与大阿卡纳塔罗引擎
 */
window.ShuijingDivination = (function () {
  const QIAN_LIST = [
    {
      num: '第一签', rank: '上上签', title: '潜龙出渊',
      poem: '云开雾散见青天，久蛰潜龙跃九渊。\n莫道前途多险阻，乘风破浪正当时。',
      meaning: '此前积蓄的力量与耐心终于迎来突破口，阻碍正在消散，是顺势展翅的绝佳时机。',
      guide: '事业可大胆推进新计划；感情宜主动表白或更进一步；财运渐入佳境。'
    },
    {
      num: '第二签', rank: '上签', title: '春风化雨',
      poem: '好雨知时润物声，春风拂面百花明。\n无须急躁求速效，静待良缘自然成。',
      meaning: '温和而持久的好运正在靠近，不必强求一步到位，顺着当下的好节奏稳步前行即可。',
      guide: '合作与人际尤为顺遂，多听取身边贵人建议，温和处事必有回响。'
    },
    {
      num: '第三签', rank: '中平签', title: '守静观澜',
      poem: '水面微风起细澜，扁舟暂泊莫贪欢。\n待得云晴风定后，一帆直指碧波宽。',
      meaning: '当前局势尚未完全明朗，贸然出手容易耗费心力。暂且按兵不动、观察变化反而是上策。',
      guide: '重大决策建议缓一缓；适合复盘整理、储备精力，静待更清晰信号。'
    },
    {
      num: '第四签', rank: '上上签', title: '明月当空',
      poem: '万里无云镜九州，最团圆夜是中秋。\n满船清梦压星河，所愿皆随流水酬。',
      meaning: '心境通透、诸事圆满之象。你最牵挂的事情有望迎来令人欣喜的结果。',
      guide: '适合签约、团聚、推进长期心愿，保持真诚分享会带来更多福气。'
    },
    {
      num: '第五签', rank: '上签', title: '柳暗花明',
      poem: '山重水复疑无路，柳暗花明又一村。\n莫叹眼前微有碍，转弯即见贵人门。',
      meaning: '看似卡住的难题其实暗藏转机，换个角度思考或向意想不到的人求助，局势便会豁然开朗。',
      guide: '打破惯性思维是破局关键，多走出去交流容易遇到关键助力。'
    },
    {
      num: '第六签', rank: '中平签', title: '磨镜生光',
      poem: '古镜蒙尘久未磨，一朝拭去影婆娑。\n功夫不负有心人，细处留神收获多。',
      meaning: '眼前的琐碎与打磨并非徒劳，而是在替你拭去浮尘。把基本功和细节做好，光芒自现。',
      guide: '工作学习重在细节核查；感情切忌敷衍，多一点用心陪伴能化解隔阂。'
    },
    {
      num: '第七签', rank: '上签', title: '鸿雁传书',
      poem: '碧落秋高鸿雁飞，佳音万里正相归。\n莫辞尺素勤相问，千里良缘一线牵。',
      meaning: '远方或久未联系的人事物将带来好消息，适合主动联络、拓展跨区域或新圈层的机会。',
      guide: '求职、投递、联络旧友或推进异地事务皆有佳音，宜主动出击。'
    },
    {
      num: '第八签', rank: '中下签', title: '谨行避礁',
      poem: '急流深处暗藏礁，切莫轻心放快篙。\n收桨缓行看水色，安然渡过再登高。',
      meaning: '提醒你放慢脚步，警惕过度自信或仓促承诺带来的小坑。保守稳健就能轻松化险为夷。',
      guide: '财务避免冲动消费与高风险投机；沟通中少说气话，留三分余地。'
    },
    {
      num: '第九签', rank: '上上签', title: '枯木逢春',
      poem: '寒尽冰消暖气回，枯枝一夜发新梅。\n旧事重提添喜色，前程锦绣任君裁。',
      meaning: '低谷已过，生机重现。曾经搁置的计划、机会或关系有机会焕发新生。',
      guide: '非常适合重启旧项目、修复关系或开启全新的生活习惯，能量回升明显。'
    },
    {
      num: '第十签', rank: '上签', title: '清风入怀',
      poem: '竹影扫阶尘不动，月穿潭底水无痕。\n放下执念心自阔，清风明月满乾坤。',
      meaning: '当你不再紧绷执着于单一结果，反而更容易收获轻松而美好的答案。',
      guide: '适合减负断舍离，把精力聚焦在一两件最核心的事情上，心情与运势同步转好。'
    },
    {
      num: '第十一签', rank: '中平签', title: '耕云种月',
      poem: '春播一粒秋收万，莫问今朝几许酬。\n但把心田勤灌溉，时来硕果自然稠。',
      meaning: '现在正处于播种与积累期，不必急着每天查看结果，你的每一次投入都在默默复利。',
      guide: '坚持长期主义，学业、健身、储蓄与专业深耕会在接下来几个月显露成效。'
    },
    {
      num: '第十二签', rank: '上签', title: '锦鲤跃门',
      poem: '碧波千顷跃金鳞，一举成名气象新。\n莫负少年凌云志，此时正是好光阴。',
      meaning: '脱颖而出之象，适合展示才华、参加考核竞聘或公开表达自己的作品与观点。',
      guide: '别再低调隐藏实力，勇敢站到台前，你会赢得应有的掌声与回报。'
    }
  ];

  const TAROT_MAJOR = [
    { roman: '0', symbol: '✧', cn: '愚者', en: 'The Fool',
      upKeywords: '新起点 · 自由 · 勇敢一跃',
      upDesc: '一段崭新的旅程正在向你招手，不必背负过多过往包袱，保持好奇心与轻盈步伐去探索吧。',
      upAdvice: '允许自己做一次新鲜尝试，今天最适合开启新计划或体验未曾走过的路。',
      revKeywords: '犹豫不决 · 准备不足 · 过度谨慎',
      revDesc: '你可能因害怕出错而停在原地，或者一时冲动忽略了必要的风险检查。',
      revAdvice: '行动前花十分钟列一张简单清单，既不盲目冒进，也别被担忧困住。'
    },
    { roman: 'I', symbol: '✦', cn: '魔术师', en: 'The Magician',
      upKeywords: '创造力 · 掌控感 · 化念为实',
      upDesc: '你手头已经拥有实现目标所需的全部资源与能力，现在缺的只是专注与立刻动手。',
      upAdvice: '把脑海中最清晰的想法落地成第一步行动，你的表现力今天格外有说服力。',
      revKeywords: '精力分散 · 自我怀疑 · 缺乏聚焦',
      revDesc: '想法太多却迟迟未聚焦，容易陷入“想了很多但做了一半”的内耗状态。',
      revAdvice: '今天只选一件最重要的事做到完成，找回掌控感比同时开五件事更有效。'
    },
    { roman: 'II', symbol: '☽', cn: '女祭司', en: 'The High Priestess',
      upKeywords: '直觉 · 洞察 · 静水流深',
      upDesc: '答案并不在喧嚣的外界，而在你安静下来的内心直觉里。先观察，再表态。',
      upAdvice: '留出一段独处时间，信任你对人和事的细微直觉，不必急于向所有人解释。',
      revKeywords: '忽视内心 · 信息杂乱 · 情绪起伏',
      revDesc: '外界声音太多干扰了你的判断，让你难以听清自己真正的想法。',
      revAdvice: '暂时关掉多余的社交噪音，用纸笔写下你最真实的感受。'
    },
    { roman: 'III', symbol: '✿', cn: '皇后', en: 'The Empress',
      upKeywords: '丰盛 · 滋养 · 美感与爱',
      upDesc: '充满生机与丰收气息的一张牌，无论情感、创意还是生活品质都处于被滋养的状态。',
      upAdvice: '好好款待自己，享受美食、自然或艺术，你的好状态会自然吸引好运。',
      revKeywords: '过度付出 · 创意瓶颈 · 忽略自我',
      revDesc: '你可能把太多精力放在照顾他人或迎合期待上，导致自身能量透支。',
      revAdvice: '今天把优先级还给自己，先让身心舒适下来，灵感自会回流。'
    },
    { roman: 'VI', symbol: '♥', cn: '恋人', en: 'The Lovers',
      upKeywords: '契合 · 真诚选择 · 共鸣',
      upDesc: '代表深度连接与顺从内心的选择。无论是感情还是合作，真诚都会带来高度默契。',
      upAdvice: '面对选择时，问问自己哪一个更符合长期价值观，而不是短期迎合。',
      revKeywords: '摇摆不定 · 沟通错位 · 内在冲突',
      revDesc: '理智与情感出现小小拉扯，或者在某段关系中还没把真实想法说透。',
      revAdvice: '温和而坦诚地沟通一次，比默默猜测更能消除误会。'
    },
    { roman: 'VII', symbol: '⚔', cn: '战车', en: 'The Chariot',
      upKeywords: '推进 · 胜利 · 意志坚定',
      upDesc: '明确目标后全力加速的时刻！只要方向笃定，眼前的阻力都能被你稳稳跨过。',
      upAdvice: '果断推进拖延已久的关键任务，你的执行力今天能带来立竿见影的突破。',
      revKeywords: '方向模糊 · 急于求成 · 阻力感',
      revDesc: '越想快进反而越容易卡壳，可能需要重新校准一下路线与节奏。',
      revAdvice: '稍微松一松油门，确认目标是否真的值得，再重新出发。'
    },
    { roman: 'IX', symbol: '✶', cn: '隐士', en: 'The Hermit',
      upKeywords: '沉淀 · 智慧 · 独立思考',
      upDesc: '这是一段宝贵的自我梳理期，远离浮躁、向内寻找答案，你会获得极清晰的洞见。',
      upAdvice: '适合阅读、复盘、整理计划，高质量的独处胜过无效社交。',
      revKeywords: '过度封闭 · 孤立感 · 钻牛角尖',
      revDesc: '独自思索太久容易陷入循环，不妨找一位信赖的朋友聊一聊换换空气。',
      revAdvice: '主动发出一条问候，外界的一句旁观者视角会让你豁然开朗。'
    },
    { roman: 'X', symbol: '☸', cn: '命运之轮', en: 'Wheel of Fortune',
      upKeywords: '转机 · 顺势 · 好运轮转',
      upDesc: '变化正在悄然发生，且大概率朝着对你有利的方向转动，抓住迎面而来的新契机。',
      upAdvice: '对突如其来的邀约或变动保持开放态度，顺水推舟往往事半功倍。',
      revKeywords: '暂时停滞 · 抗拒改变 · 旧循环',
      revDesc: '如果觉得事情在原地打转，往往是在提醒你换一种处理方式打破旧习惯。',
      revAdvice: '接纳不可控的小插曲，专注调整自己能掌控的那一部分。'
    },
    { roman: 'XVII', symbol: '★', cn: '星星', en: 'The Star',
      upKeywords: '希望 · 疗愈 · 灵感闪耀',
      upDesc: '风雨过后清澈宁静的星光，象征疗愈、愿景与温柔的祝福，一切正慢慢变好。',
      upAdvice: '相信你正在走的路，把长远愿望写下来，你比想象中更接近它。',
      revKeywords: '信心动摇 · 疲惫 · 暂时迷茫',
      revDesc: '只是有点累了，并非没有希望。给自己一点喘息与恢复的时间。',
      revAdvice: '早点休息或亲近自然，恢复精力后你会重新看见前方的光。'
    },
    { roman: 'XIX', symbol: '☀', cn: '太阳', en: 'The Sun',
      upKeywords: '喜悦 · 明朗 · 成功与活力',
      upDesc: '大阿卡纳中最温暖明亮的牌之一！阴霾散去，真挚与热情会为你赢得圆满成果。',
      upAdvice: '大方展现你的自信与善意，今天非常利于公开表达、合作与分享喜悦。',
      revKeywords: '延迟满足 · 低调光芒 · 小小自满',
      revDesc: '好结果已在路上只是稍慢半拍，保持谦逊与耐心，别因小插曲怀疑全局。',
      revAdvice: '多关注已经做成的小胜利，保持乐观心态，好事很快兑现。'
    },
    { roman: 'XXI', symbol: '◎', cn: '世界', en: 'The World',
      upKeywords: '圆满 · 达成 · 新阶段开启',
      upDesc: '一个重要周期即将画上圆满句号，你不仅收获了成果，也完成了自我成长的跃迁。',
      upAdvice: '好好庆祝当下的阶段性完成，同时敞开怀抱迎接更广阔的舞台。',
      revKeywords: '临门一脚 · 尚差收尾 · 迟疑完结',
      revDesc: '距离完成只差最后一步细节，别在终点线前松懈或拖延收尾。',
      revAdvice: '把剩下的最后10%踏实补齐，给自己一个干净利落的交代。'
    }
  ];

  function drawQian() {
    const idx = Math.floor(Math.random() * QIAN_LIST.length);
    return QIAN_LIST[idx];
  }

  function formatTarotCard(card, isReversed, position) {
    return {
      ...card,
      position: position || '今日指引',
      isReversed,
      orientationLabel: isReversed ? '逆位' : '正位',
      keywords: isReversed ? card.revKeywords : card.upKeywords,
      desc: isReversed ? card.revDesc : card.upDesc,
      advice: isReversed ? card.revAdvice : card.upAdvice
    };
  }

  function drawTarot() {
    const idx = Math.floor(Math.random() * TAROT_MAJOR.length);
    return formatTarotCard(TAROT_MAJOR[idx], Math.random() < 0.35, '今日指引');
  }

  function drawTarotSpread(count = 3) {
    const positions = count === 3 ? ['过去 · 缘起', '现在 · 当下', '未来 · 走向'] : ['今日指引'];
    const pool = [...TAROT_MAJOR];
    const picked = [];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const [card] = pool.splice(idx, 1);
      picked.push(formatTarotCard(card, Math.random() < 0.35, positions[i]));
    }
    return picked;
  }

  return { drawQian, drawTarot, drawTarotSpread };
})();
