/**
 * Demo rules for exhibition-safe brief generation.
 */

export interface DemoRule {
  id: string;
  name: string;
  projectTypes: string[];
  triggerKeywords: string[];
  absentKeywords: string[];
  regions: string[];
  months: number[];
  riskOutput?: { type: string; description: string; severity: "high" | "medium" | "low" };
  missingOutputs?: { field: string; reason: string; impact: "blocking" | "important" | "optional" }[];
  nextStepOutputs?: { action: string; owner: string }[];
  proposalAngleOutputs?: { angle: string; reasoning: string }[];
}

export const DEMO_RULES: DemoRule[] = [
  {
    id: "R-Retail-Planning-01",
    name: "经营模型先于风格表达",
    projectTypes: ["零售门店"],
    triggerKeywords: ["高级感", "网红感", "好看", "风格", "视觉", "材料", "年轻化", "氛围"],
    absentKeywords: ["收银", "仓储", "试衣", "补货", "坪效", "商品结构"],
    regions: [],
    months: [],
    riskOutput: {
      type: "经营逻辑缺失",
      description: "当前需求更强调空间气质与视觉效果，但经营逻辑信息不足。若客群、品类结构、收银与仓储动线未前置确认，后续可能出现空间好看但运营效率不足的问题。",
      severity: "high",
    },
    missingOutputs: [
      { field: "目标客群与消费层级", reason: "门店经营模型的基础信息，会直接影响空间档次与商品配置", impact: "important" },
      { field: "收银位置与结算方式", reason: "收银动线直接影响顾客体验与运营效率", impact: "important" },
      { field: "试衣与仓储需求", reason: "功能分区不清会导致后续空间冲突", impact: "important" },
    ],
    nextStepOutputs: [
      { action: "先梳理商品结构与功能分区", owner: "客户 + 项目经理" },
      { action: "明确入口、收银、试衣、仓储和补货路径", owner: "设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "空间体验优化", reasoning: "将经营逻辑融入空间体验设计，确保好看的同时也好用" },
      { angle: "展示引流", reasoning: "在满足经营效率的前提下强化入口吸引与主推商品展示" },
    ],
  },
  {
    id: "R-Retail-Design-05",
    name: "动线设计应基于顾客行为而非纯视觉想象",
    projectTypes: ["零售门店"],
    triggerKeywords: ["高级感", "对称", "沉浸感", "层次", "丰富", "整齐", "视觉"],
    absentKeywords: ["入口策略", "主推", "停留", "顾客路径", "转化"],
    regions: [],
    months: [],
    riskOutput: {
      type: "动线与行为脱节",
      description: "当前需求重视视觉效果，但顾客行为路径信息不足。若入口、停留区、主推区与收银线关系未基于真实使用场景梳理，后续可能出现空间完整但转化效率偏低的问题。",
      severity: "high",
    },
    missingOutputs: [
      { field: "入口吸引策略", reason: "入口决定第一印象与进店率", impact: "important" },
      { field: "主推商品区位置", reason: "主推区与引流区布局会影响销售转化", impact: "important" },
    ],
    nextStepOutputs: [
      { action: "先画顾客行为动线草图", owner: "设计团队" },
      { action: "标记高毛利商品区与引流商品区", owner: "客户 + 设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "展示引流", reasoning: "围绕真实顾客行为设计展示逻辑，提升转化效率" },
    ],
  },
  {
    id: "R-Retail-Design-08",
    name: "预算必须拆项并设定优先级",
    projectTypes: ["零售门店"],
    triggerKeywords: ["预算", "万", "控制", "有限", "不要太贵", "中等", "成本", "省"],
    absentKeywords: ["硬装", "软装", "灯光预算", "拆项", "分档"],
    regions: [],
    months: [],
    riskOutput: {
      type: "预算结构缺失",
      description: "当前预算信息更接近总价表达，缺少拆项与优先级。若方案阶段不明确硬装、定制、灯光、设备与预备金结构，后续容易出现无序删减并影响核心体验。",
      severity: "high",
    },
    missingOutputs: [
      { field: "预算拆项结构", reason: "总价预算不足以支撑设计取舍，需拆分主要成本模块", impact: "important" },
      { field: "必保项与可调整项", reason: "预算紧张时需明确优先级，避免无序删减", impact: "important" },
    ],
    nextStepOutputs: [
      { action: "将预算拆解为主要成本模块", owner: "项目经理" },
      { action: "在概念方案阶段同步做分档报价", owner: "设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "控预算高效率", reasoning: "在有限预算内通过拆项优先级实现最大化落地效果" },
    ],
  },
  {
    id: "R-Booth-Planning-13",
    name: "展馆规则先于造型创意",
    projectTypes: ["展会展台"],
    triggerKeywords: ["科技感", "震撼", "大气", "吊装", "超高", "双层", "封顶", "高一点", "吊挂"],
    absentKeywords: ["限高", "吊点", "展馆规则", "报馆", "开口面"],
    regions: [],
    months: [],
    riskOutput: {
      type: "展馆合规风险",
      description: "当前需求强调展台表现力，但展馆规则信息不足。若限高、吊点、报馆要求与结构限制未前置核对，后续方案可能出现创意强但无法落地的问题。",
      severity: "high",
    },
    missingOutputs: [
      { field: "展馆与展会名称", reason: "不同展馆规则差异大，需明确具体场馆", impact: "important" },
      { field: "展位尺寸与限高", reason: "造型方案必须在限高和吊点条件内设计", impact: "blocking" },
      { field: "报馆与审图时间", reason: "报馆有截止日期，逾期影响搭建资格", impact: "important" },
    ],
    nextStepOutputs: [
      { action: "先核对展馆规则与参展商手册", owner: "客户" },
      { action: "明确展位尺寸、限高、开口面和吊点", owner: "客户 + 设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "快速落地", reasoning: "在展馆规则约束内做最大化视觉表达，确保方案可执行" },
      { angle: "展示引流", reasoning: "用合规范围内的创意手法实现品牌记忆点" },
    ],
  },
  {
    id: "R-Booth-Planning-14",
    name: "审图是项目里程碑",
    projectTypes: ["展会展台"],
    triggerKeywords: ["工期紧", "时间紧", "赶", "开幕", "快", "紧张", "吊挂", "双层", "超高", "特殊结构"],
    absentKeywords: ["审图", "报馆", "图纸"],
    regions: [],
    months: [],
    riskOutput: {
      type: "审图节点缺失",
      description: "当前项目时间信息存在压力，但审图节点尚未明确。对于展台项目，审图本身属于关键里程碑，若未纳入前期倒排计划，后续制作与进场时间将明显受压缩。",
      severity: "high",
    },
    nextStepOutputs: [
      { action: "确认报馆与审图截止日期", owner: "客户" },
      { action: "明确审图资料清单（平面/施工图/消防/电路）", owner: "设计团队" },
      { action: "将审图通过时间设为制作启动前置节点", owner: "项目经理" },
    ],
    proposalAngleOutputs: [
      { angle: "风险前置管理", reasoning: "将审图作为关键里程碑纳入项目计划，避免后期被动" },
    ],
  },
  {
    id: "R-Commercial-Design-25",
    name: "概念表达必须同步技术落地条件",
    projectTypes: ["商业空间升级", "办公/展示空间", "品牌快闪"],
    triggerKeywords: ["品牌感", "艺术感", "沉浸感", "概念感", "未来感", "强视觉", "复杂装置", "异形", "雕塑"],
    absentKeywords: ["机电", "消防", "结构", "维护", "检修"],
    regions: [],
    months: [],
    riskOutput: {
      type: "概念与技术脱节",
      description: "当前需求强调空间表达与品牌感，但技术落地条件信息不足。若机电、结构、消防、设备与维护条件未同步进入设计，后续可能出现概念强但落地代价过高的问题。",
      severity: "high",
    },
    missingOutputs: [
      { field: "机电与设备需求", reason: "复杂空间的机电条件会直接影响概念实现", impact: "important" },
      { field: "消防与结构限制", reason: "异形结构和特殊材料需提前确认消防合规", impact: "important" },
      { field: "维护与检修条件", reason: "高概念空间的后期维护成本容易被低估", impact: "optional" },
    ],
    nextStepOutputs: [
      { action: "在概念阶段同步引入技术约束", owner: "设计团队 + 工程顾问" },
      { action: "对复杂节点做提前技术校核", owner: "设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "品牌调性塑造", reasoning: "在技术可行范围内做最大化的概念表达" },
    ],
  },
  {
    id: "R-Cross-Schedule-31a",
    name: "梅雨季施工风险（5-6月）",
    projectTypes: ["零售门店", "商业空间升级", "展会展台", "办公/展示空间", "品牌快闪"],
    triggerKeywords: ["施工", "开业", "装修", "工期", "赶", "快", "开始"],
    absentKeywords: [],
    regions: ["江苏", "浙江", "上海", "安徽", "江西", "湖北", "湖南", "福建"],
    months: [5, 6],
    riskOutput: {
      type: "梅雨季施工风险",
      description: "当前项目施工期落在5-6月梅雨季，长三角及周边地区空气湿度极高（常超80%），涂料、乳胶漆、腻子等液体施工材料干燥时间将显著延长，基层含水率难以达标可能导致起泡、开裂、发霉。建议在总工期中预留额外缓冲时间，并对湿作业工序做专项排期。",
      severity: "high",
    },
    nextStepOutputs: [
      { action: "在总工期中增加梅雨季缓冲（建议 +20%-30%）", owner: "项目经理" },
      { action: "涂料、腻子、基层等湿作业工序单独放宽周期，安排除湿设备", owner: "施工团队" },
      { action: "确认是否需要工业除湿机辅助干燥", owner: "施工团队" },
    ],
    proposalAngleOutputs: [
      { angle: "风险前置管理", reasoning: "提前识别梅雨季高湿度施工风险，避免赶工导致质量隐患" },
    ],
  },
  {
    id: "R-Cross-Schedule-31b",
    name: "冬季低温施工风险（11-2月）",
    projectTypes: ["零售门店", "商业空间升级", "展会展台", "办公/展示空间", "品牌快闪"],
    triggerKeywords: ["施工", "开业", "装修", "工期", "赶", "快", "开始"],
    absentKeywords: [],
    regions: ["江苏", "浙江", "上海", "安徽", "江西", "山东", "河南", "河北", "北京", "天津", "辽宁", "吉林", "黑龙江", "内蒙古", "湖北"],
    months: [11, 12, 1, 2],
    riskOutput: {
      type: "冬季低温施工风险",
      description: "当前项目施工期落在11月至次年2月，气温偏低（部分地区低于5°C），涂料、油漆、胶粘剂等液体施工材料固化速度明显变慢，水泥砂浆强度发展延迟，极端低温下甚至无法正常施工。建议在总工期中预留额外缓冲时间，并关注夜间低温对已施工面的影响。",
      severity: "high",
    },
    nextStepOutputs: [
      { action: "在总工期中增加冬季施工缓冲（建议 +15%-25%）", owner: "项目经理" },
      { action: "涂料、油漆类工序避开极端低温日施工，必要时增加临时供暖", owner: "施工团队" },
      { action: "确认施工现场是否具备保温条件（封闭空间、临时暖风机等）", owner: "项目经理" },
    ],
    proposalAngleOutputs: [
      { angle: "风险前置管理", reasoning: "提前识别冬季低温对液体材料施工的影响，在工期倒排中预留合理缓冲" },
    ],
  },
  {
    id: "R-Cross-Schedule-32",
    name: "高造价特制定制件拉长周期",
    projectTypes: ["零售门店", "商业空间升级", "展会展台", "办公/展示空间", "品牌快闪"],
    triggerKeywords: ["雕塑", "玻璃钢", "烤漆", "异形", "超长玻璃", "特殊装置", "定制艺术", "复杂装置", "高端效果", "记忆点", "独特"],
    absentKeywords: [],
    regions: [],
    months: [],
    riskOutput: {
      type: "定制件周期风险",
      description: "当前需求若采用较多特制定制件，虽能提升空间识别度，但也会显著增加生产、运输、安装与返修的不确定性。对于强调高效推进的项目，这类内容可能成为工期与成本的主要风险来源。",
      severity: "high",
    },
    nextStepOutputs: [
      { action: "对高造价定制件做清单化评估", owner: "设计团队" },
      { action: "提前确认加工周期与安装条件", owner: "项目经理" },
      { action: "为关键定制件准备替代方案", owner: "设计团队" },
    ],
    proposalAngleOutputs: [
      { angle: "控预算高效率", reasoning: "优先采用标准化模块、常规工艺或可替代材料减少不确定性" },
      { angle: "快速落地", reasoning: "减少高不确定性的特制定制内容以保障交付节奏" },
    ],
  },
];
