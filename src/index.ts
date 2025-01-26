const { PersonalityAnalyzer } = require('./services/personalityAnalyzer');
const { MatchingEngine } = require('./services/matchingEngine');
const { MatchingMetrics } = require('./utils/metrics');

async function initializeSystem() {
  // 初始化人格分析器
  const analyzer = new PersonalityAnalyzer();
  await analyzer.initialize();
  
  // 初始化匹配引擎
  const matchingEngine = new MatchingEngine();

  // 示例用户数据
  const userProfile = {
    responses: [
      "上周和同事发生争执时,我很快就平静下来并试图理解对方的观点。",
      "我喜欢尝试新事物,但也需要独处的时间来思考和充电。"
    ],
    voiceData: new ArrayBuffer(0), // 实际项目中需要真实的语音数据
    socialMedia: [
      "最近在学习摄影,发现构图和光线真是门大学问...",
      "周末去爬山,大自然总能让我感到平静。"
    ]
  };

  // 生成性格档案
  const personalityProfile = await analyzer.generatePersonalityProfile(userProfile);
  console.log('性格分析结果:', personalityProfile);

  // 示例候选人列表
  const candidates = [
    {
      age: 28,
      location: { coordinates: [116.4, 39.9] },
      dealBreakers: ['smoking'],
      interests: ['photography', 'hiking'],
      // ... 其他属性
    }
    // ... 更多候选人
  ];

  // 寻找匹配
  const matches = await matchingEngine.findMatches(
    { ...userProfile, ...personalityProfile },
    candidates
  );
  console.log('匹配结果:', matches);

  // 计算匹配指标
  const surpriseRate = MatchingMetrics.calculateSurpriseRate(matches.matches);
  console.log('惊喜指数:', surpriseRate);
}

// 运行系统
initializeSystem().catch(console.error); 