/**
 * 水镜先生 · 八字排盘 & 紫微主星速查引擎
 */
window.ShuijingBazi = (function () {
  const { STEM_WUXING, BRANCH_WUXING, getFourPillars } = window.ShuijingCalendar;

  // 十天干日主命格解析
  const DAY_MASTER_PROFILES = {
    甲: {
      title: '甲木 · 参天乔木',
      element: '阳木',
      personality: '正直仁厚，有担当与向上生长的魄力，遇事讲究原则，具备天然的领导气质，但有时略显固执。',
      career: '适合管理统筹、教育文化、创意规划或独立创业，越是在有清晰目标与成长空间的平台越能发光。',
      love: '重情重义且有保护欲，表达偏务实而非甜言蜜语；学会在关系中柔软倾听，感情会更加长久稳定。'
    },
    乙: {
      title: '乙木 · 花草藤蔓',
      element: '阴木',
      personality: '温和细腻，适应力极强，外柔内刚且善于借势成长；心思敏锐，审美与共情能力出众。',
      career: '适合设计美学、公关沟通、咨询顾问、内容创作及需要精细协作的行业，善用人脉能事半功倍。',
      love: '温柔体贴、重视氛围与精神契合，容易为爱付出；保持独立边界感会让对方更加珍惜你。'
    },
    丙: {
      title: '丙火 · 骄阳烈火',
      element: '阳火',
      personality: '热情开朗、光明磊落，自带感染力与行动力，乐于助人；情绪来得快去得也快，忌急躁冒进。',
      career: '适合市场营销、演艺传媒、品牌运营、团队领袖或新兴科技领域，需要舞台与正向反馈。',
      love: '热烈直接、真诚大方，喜欢与伴侣共同探索新鲜世界；在日常琐碎中多留一份耐心便能长甜。'
    },
    丁: {
      title: '丁火 · 烛光星火',
      element: '阴火',
      personality: '温润内敛却充满洞察力，思维缜密，富有艺术感与理想主义色彩，表面平静而内心炽热。',
      career: '适合研发分析、心理学、文字创作、金融策略、精致消费品等需要深度专注的领域。',
      love: '深情专一、注重细节与灵魂共鸣，偶尔容易想太多；坦诚表达需求能让彼此更安心。'
    },
    戊: {
      title: '戊土 · 高山厚土',
      element: '阳土',
      personality: '沉稳厚重、信守承诺，抗压能力强，是身边人最可靠的后盾；节奏偏稳，不太喜欢仓促变动。',
      career: '适合金融风控、地产基建、企业运营、供应链管理或长期价值型投资，越沉淀越有底气。',
      love: '务实专情、把承诺落在行动上，给伴侣十足安全感；偶尔制造一点小浪漫会大大加分。'
    },
    己: {
      title: '己土 · 田园沃土',
      element: '阴土',
      personality: '包容体贴、心思周全，懂得照顾他人情绪，务实且有韧性；容易思虑过多而替人操心。',
      career: '适合人力资源、财务管理、医疗健康、客户成功、教育辅导等滋养型与服务型岗位。',
      love: '细水长流、善于经营家庭与生活质感；别忘了先照顾好自己的感受，再付出温柔。'
    },
    庚: {
      title: '庚金 · 刀剑顽金',
      element: '阳金',
      personality: '果断刚毅、讲义气、重效率，面对挑战敢于破局，执行力极强；言辞有时偏直率。',
      career: '适合法律合规、工程技术、商业谈判、竞技管理或改革攻坚类角色，越磨砺越锋利。',
      love: '爱憎分明、行动力强，认定后非常护短；多用温和语气沟通，能避免不必要的误会。'
    },
    辛: {
      title: '辛金 · 珠玉精金',
      element: '阴金',
      personality: '精致聪慧、自尊心强、追求品质与美感，观察入微且很有主见，对细节有极高要求。',
      career: '适合时尚珠宝、产品设计、精密技术、财经分析、高端服务及需要高审美标准的行业。',
      love: '重视仪式感与精神格调，慢热但深情；遇到懂你品味且尊重你空间的人会非常幸福。'
    },
    壬: {
      title: '壬水 · 江河湖海',
      element: '阳水',
      personality: '胸怀宽广、机智灵活，思维跳跃且善于变通，好奇心旺盛，适应新环境的能力一流。',
      career: '适合互联网、跨境贸易、投资咨询、物流出行、媒体传播等流动与变化丰富的行业。',
      love: '自由洒脱、富有魅力，喜欢彼此独立又互相欣赏的关系；明确共同目标能让感情稳固落地。'
    },
    癸: {
      title: '癸水 · 雨露清泉',
      element: '阴水',
      personality: '温婉灵动、直觉敏锐，善解人意且富有想象力，做事润物细无声，内心藏着惊人韧性。',
      career: '适合策划创意、数据分析、疗愈艺术、学术研究或幕后智囊角色，灵感往往是最大武器。',
      love: '细腻浪漫、极具共情力，渴望深度情绪链接；少一点自我内耗，多相信自己的吸引力。'
    }
  };

  // 紫微斗数十四主星简表（致敬科技紫微网分类：开创型、领导型、支援型、合作型）
  const ZIWEI_STARS = [
    { name: '紫微星', category: '领导型', keywords: '尊贵稳重 · 全局视野 · 统筹力强', desc: '帝王之星，天生具备大局观与自我期许，喜欢掌握主动权。宜修宽容之心，善用团队之力，格局自成。' },
    { name: '天机星', category: '支援型', keywords: '足智多谋 · 反应敏捷 · 善于策划', desc: '智慧之星，脑筋转动极快，点子层出不穷，极具分析与学习天赋。避免思虑过度，选定方向果断落地更易成功。' },
    { name: '太阳星', category: '支援型', keywords: '热情博爱 · 光明磊落 · 乐于奉献', desc: '光芒之星，精力充沛、表达力强，天生喜欢照顾和照亮他人。注意劳逸结合，别把所有责任都往自己肩上扛。' },
    { name: '武曲星', category: '领导型', keywords: '刚毅果决 · 务实进取 · 财星护佑', desc: '正财之星，执行力与抗压性一流，做事讲求结果与效率。在人际沟通中多添几分柔和，事业与人缘将双丰收。' },
    { name: '天同星', category: '合作型', keywords: '温和乐观 · 知足常乐 · 人缘极佳', desc: '福德之星，性格平易近人，懂得欣赏生活之美，贵人运佳。给自己设定适度挑战，能激发出意想不到的潜能。' },
    { name: '廉贞星', category: '开创型', keywords: '特立独行 · 才华横溢 · 敢爱敢恨', desc: '次桃花与公关之星，审美独到、社交手腕灵活，内心骄傲且有野心。学会以理性驾驭激情，成就非凡。' },
    { name: '天府星', category: '领导型', keywords: '稳健大气 · 善于守成 · 胸有丘壑', desc: '财库之星，气度从容、做事有条不紊，既懂享受生活又善管理资源。多主动拥抱变化，能让优势进一步放大。' },
    { name: '太阴星', category: '合作型', keywords: '温柔细腻 · 审美出众 · 注重内在', desc: '富贵柔和之星，心思缜密、直觉极准，擅长慢工出细活与长期积累。保持自信与行动力，后劲十足。' },
    { name: '贪狼星', category: '开创型', keywords: '多才多艺 · 魅力四射 · 欲望驱动', desc: '大桃花与交际之星，学习新鲜事物极快，极富表现力与商业嗅觉。聚焦一两个核心赛道深耕，必能脱颖而出。' },
    { name: '巨门星', category: '支援型', keywords: '口才出众 · 追根究底 · 洞察真相', desc: '思辨之星，逻辑清晰、观察锐利，擅长专业研究、谈判与表达。说话留三分余地，能化是非为贵人助力。' },
    { name: '天相星', category: '领导型', keywords: '公正严谨 · 忠诚可靠 · 讲究体面', desc: '印星与辅佐之星，注重原则、衣品与信誉，极受上司与伙伴信赖。遇事多果断表态，不必过度顾虑他人眼光。' },
    { name: '天梁星', category: '合作型', keywords: '古道热肠 · 成熟稳重 · 逢凶化吉', desc: '荫星与长者之星，有原则、爱照顾弱小，具备很强的专业权威感。少一点说教感、多一点轻松幽默，人气更高。' },
    { name: '七杀星', category: '开创型', keywords: '勇猛果断 · 独立破局 · 不畏艰难', desc: '将星之首，天生自带闯劲与改革魄力，越是逆境越能激发斗志。学会在冲刺前做好风险评估，赢面极大。' },
    { name: '破军星', category: '开创型', keywords: '先破后立 · 创意无限 · 敢于颠覆', desc: '先锋之星，讨厌一成不变，擅长打破旧框架开创新局面。给自己留好后备资源，大刀阔斧的同时稳住根基。' }
  ];

  const WUXING_COLORS = {
    木: '#2E7D5B',
    火: '#C84331',
    土: '#A87932',
    金: '#6B7280',
    水: '#2B5C8F'
  };

  function analyze(dateStr, hourBranchIdx, gender) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    const pillars = getFourPillars(date, hourBranchIdx);

    const list = [
      { key: 'year', label: '年柱', ...pillars.year },
      { key: 'month', label: '月柱', ...pillars.month },
      { key: 'day', label: '日柱（日主）', ...pillars.day },
      { key: 'hour', label: '时柱', ...pillars.hour }
    ].map(p => ({
      ...p,
      stemWx: STEM_WUXING[p.stem],
      branchWx: BRANCH_WUXING[p.branch]
    }));

    // 统计八字五行分布
    const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    list.forEach(p => {
      counts[p.stemWx] += 1;
      counts[p.branchWx] += 1;
    });

    const entries = Object.entries(counts);
    const maxWx = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const minWx = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
    const missing = entries.filter(([, v]) => v === 0).map(([k]) => k);

    let wuxingNote = `命盘中「${maxWx[0]}」行能量最旺（${maxWx[1]}个）。`;
    if (missing.length > 0) {
      wuxingNote += `五行缺「${missing.join('、')}」，日常穿搭、居住方位或行事节奏中可适当补充「${missing[0]}」系元素以求平衡。`;
    } else {
      wuxingNote += `五行金木水火土俱全，格局较为周正；相对偏弱的是「${minWx[0]}」行，平时可多加滋养。`;
    }

    // 紫微命宫主星速查（基于生辰干支与月份时辰确定性排定）
    const ziweiSeed = (pillars.year.gzIdx * 3 + (m * 7) + (d * 11) + hourBranchIdx * 5) % ZIWEI_STARS.length;
    const ziweiStar = ZIWEI_STARS[ziweiSeed];

    const dayMaster = DAY_MASTER_PROFILES[pillars.day.stem];

    return {
      genderLabel: gender === 'male' ? '乾造（男）' : '坤造（女）',
      shengxiao: pillars.shengxiao,
      pillars: list,
      counts,
      wuxingColors: WUXING_COLORS,
      wuxingNote,
      dayMaster,
      ziweiStar
    };
  }

  return { analyze };
})();
