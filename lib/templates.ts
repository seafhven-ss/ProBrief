import type { Requirement, Risk, NextStep, ProposalAngle } from "./types";

// ─── Project type → core requirements ─────────────────────────────────────────

export const PROJECT_REQUIREMENTS: Record<string, Requirement[]> = {
  零售门店: [
    { category: "空间规划", description: "确认面积、层高、动线、功能分区（展示 / 试衣 / 收银 / 仓储）", priority: "high" },
    { category: "品牌视觉", description: "门头设计、店内 VI 落地、主色调与材质方向", priority: "high" },
    { category: "陈列系统", description: "货架 / 展台 / 挂通的布局方案与灵活性需求", priority: "high" },
    { category: "灯光照明", description: "基础照明 + 重点照明方案，营造空间氛围", priority: "medium" },
    { category: "施工落地", description: "施工图深化、材料选型、供应商对接", priority: "medium" },
  ],
  展会展台: [
    { category: "展位规格", description: "确认展位面积、位置（岛型 / 半岛 / 标准）、层高限制", priority: "high" },
    { category: "功能分区", description: "展示区、接待洽谈区、产品演示区、储物区", priority: "high" },
    { category: "品牌形象", description: "主视觉画面、灯箱 / LED、品牌墙设计", priority: "high" },
    { category: "搭建与撤展", description: "搭建时间窗口、现场施工限制、撤展流程", priority: "medium" },
    { category: "互动体验", description: "屏幕互动、产品试用、引流机制", priority: "medium" },
  ],
  品牌快闪: [
    { category: "场地条件", description: "场地面积、租期、进场限制、电力/网络条件", priority: "high" },
    { category: "主题概念", description: "快闪核心主题、视觉调性、打卡 / 传播设计", priority: "high" },
    { category: "动线体验", description: "顾客从入口到出口的完整体验流程设计", priority: "high" },
    { category: "物料制作", description: "结构搭建物、软装道具、平面输出物", priority: "medium" },
    { category: "运营配套", description: "开业活动、现场人员、社交媒体联动", priority: "low" },
  ],
  商业空间升级: [
    { category: "升级范围", description: "明确哪些区域改造、哪些保留，局部 vs 整体", priority: "high" },
    { category: "形象诊断", description: "现有空间问题分析（门头老化、动线不合理、品牌感弱）", priority: "high" },
    { category: "停业影响", description: "评估施工期间是否需要停业以及停业时长", priority: "high" },
    { category: "视觉刷新", description: "门头、主展示区、导视系统、灯光氛围升级", priority: "medium" },
    { category: "成本控制", description: "在有限预算内实现最大视觉提升的优先级排序", priority: "medium" },
  ],
  "办公/展示空间": [
    { category: "功能需求", description: "办公工位 / 会议室 / 展厅 / 接待区的面积与数量", priority: "high" },
    { category: "企业形象", description: "前台形象墙、企业文化展示、品牌调性融入", priority: "high" },
    { category: "空间规划", description: "开放 / 封闭区域比例、动线、采光通风", priority: "high" },
    { category: "基础设施", description: "强弱电、空调暖通、消防合规", priority: "medium" },
    { category: "家具软装", description: "工位系统、储物、软装风格与采购", priority: "medium" },
  ],
  其他: [
    { category: "项目范围", description: "明确项目边界、改造区域与不在范围内的内容", priority: "high" },
    { category: "交付物清单", description: "列出所有需提交的设计文件、施工图或成果物", priority: "high" },
    { category: "验收标准", description: "定义何为完成以及客户验收流程", priority: "medium" },
  ],
};

// ─── Project type → common risks ──────────────────────────────────────────────

export const PROJECT_RISKS: Record<string, Risk[]> = {
  零售门店: [
    { type: "品牌视觉不完整", description: "Logo、色值、字体等基础 VI 缺失，设计阶段需额外补齐，影响进度", severity: "high" },
    { type: "预算与效果预期差距", description: "客户期望高端效果但预算有限，需在材料与工艺上做取舍", severity: "high" },
    { type: "工期压缩风险", description: "赶开业节点可能导致施工质量下降或赶工加价", severity: "medium" },
    { type: "商场进场限制", description: "商场对施工时间、噪音、材料有严格限制，需提前报批", severity: "medium" },
  ],
  展会展台: [
    { type: "搭建时间紧张", description: "展会通常只给 1-2 天搭建时间，复杂结构可能无法完工", severity: "high" },
    { type: "预算不确定", description: "预算未锁定导致方案反复修改，影响整体进度", severity: "high" },
    { type: "展馆限制", description: "层高限制、用电限制、消防审批等场馆硬性规定", severity: "medium" },
    { type: "物流风险", description: "展具运输损坏或延迟到达影响搭建", severity: "medium" },
  ],
  品牌快闪: [
    { type: "场地审批延迟", description: "商场 / 物业审批流程长，方案可能被要求多轮修改", severity: "high" },
    { type: "天气与客流", description: "户外快闪受天气影响大，客流预估可能不准", severity: "medium" },
    { type: "周期短成本高", description: "短期租赁但搭建拆除成本高，投入产出比需提前评估", severity: "medium" },
  ],
  商业空间升级: [
    { type: "隐蔽工程问题", description: "拆除后发现水电管线老化、结构问题，追加预算", severity: "high" },
    { type: "停业损失", description: "施工期间停业带来的营业额损失可能超出预期", severity: "high" },
    { type: "局部改造连锁反应", description: "改一面墙可能牵动水电、消防、空调系统", severity: "medium" },
  ],
  "办公/展示空间": [
    { type: "消防报审周期", description: "消防审批流程长，可能延误整体工期", severity: "high" },
    { type: "需求变更频繁", description: "企业内部意见不统一导致方案反复修改", severity: "medium" },
    { type: "噪音与施工限制", description: "已入驻楼宇对施工时间和噪音有限制", severity: "medium" },
  ],
  其他: [
    { type: "目标不清晰", description: "项目需求描述模糊，导致方案方向偏离客户预期", severity: "high" },
    { type: "沟通断层", description: "项目干系人过多或决策链长，信息传递不对称", severity: "medium" },
  ],
};

// ─── Project type → next steps ────────────────────────────────────────────────

export const PROJECT_NEXT_STEPS: Record<string, NextStep[]> = {
  零售门店: [
    { order: 1, action: "实地量房，确认现场条件与限制", owner: "设计团队" },
    { order: 2, action: "收集品牌资产（Logo 源文件、VI 手册、参考图）", owner: "客户" },
    { order: 3, action: "确认预算区间与工期节点", owner: "双方" },
    { order: 4, action: "输出概念方案（平面布局 + 效果意向）", owner: "设计团队" },
    { order: 5, action: "方案确认后进入深化设计与施工图阶段", owner: "双方" },
  ],
  展会展台: [
    { order: 1, action: "确认展位图纸、展馆规则手册", owner: "客户" },
    { order: 2, action: "明确预算范围与核心展示诉求", owner: "双方" },
    { order: 3, action: "输出 2-3 个概念方案供选择", owner: "设计团队" },
    { order: 4, action: "确认方案后进入结构深化与物料制作", owner: "设计团队" },
    { order: 5, action: "安排搭建团队与物流计划", owner: "项目经理" },
  ],
  品牌快闪: [
    { order: 1, action: "确认场地条件、租期与进场规则", owner: "客户" },
    { order: 2, action: "确定快闪主题概念与核心体验", owner: "双方" },
    { order: 3, action: "输出空间方案与视觉设计", owner: "设计团队" },
    { order: 4, action: "物料制作与供应商对接", owner: "项目经理" },
    { order: 5, action: "现场搭建与开业活动执行", owner: "全团队" },
  ],
  商业空间升级: [
    { order: 1, action: "现场勘查，记录现状问题与可改造范围", owner: "设计团队" },
    { order: 2, action: "确认升级优先级（门头 > 主展区 > 软装）", owner: "双方" },
    { order: 3, action: "确认预算与停业安排", owner: "客户" },
    { order: 4, action: "输出升级方案与施工排期", owner: "设计团队" },
    { order: 5, action: "分阶段施工，最大限度减少停业时间", owner: "施工团队" },
  ],
  "办公/展示空间": [
    { order: 1, action: "收集企业需求（人数、部门、功能区）", owner: "客户" },
    { order: 2, action: "实地量房，确认建筑条件", owner: "设计团队" },
    { order: 3, action: "输出平面布局方案", owner: "设计团队" },
    { order: 4, action: "确认方案后启动深化设计", owner: "双方" },
    { order: 5, action: "施工图出图，启动招标或施工", owner: "项目经理" },
  ],
  其他: [
    { order: 1, action: "明确项目范围与核心诉求", owner: "双方" },
    { order: 2, action: "确定交付物清单与时间节点", owner: "双方" },
    { order: 3, action: "签署合同并确认付款节点", owner: "双方" },
    { order: 4, action: "安排项目启动会", owner: "项目经理" },
  ],
};

// ─── Project type → proposal angles ─────────────────────────────────────────

export const PROJECT_PROPOSAL_ANGLES: Record<string, ProposalAngle[]> = {
  零售门店: [
    { angle: "品牌调性塑造", reasoning: "新店需要从空间设计建立品牌认知，提案应围绕品牌视觉体系展开" },
    { angle: "控预算高效率", reasoning: "预算有限时，提案应突出高性价比材料方案和标准化模块" },
    { angle: "快速落地", reasoning: "工期紧张时，提案应强调成熟工艺、预制化构件、并行施工方案" },
  ],
  展会展台: [
    { angle: "品牌实力展示", reasoning: "展会是短时间内建立品牌形象的窗口，视觉冲击力是核心" },
    { angle: "功能复合高效", reasoning: "有限面积内兼顾展示、接待、演示，空间效率是提案亮点" },
    { angle: "快搭建易复用", reasoning: "时间紧、展会多时，可拆装重复使用的结构方案更有说服力" },
  ],
  品牌快闪: [
    { angle: "社交传播引爆", reasoning: "快闪核心价值是传播，提案应围绕打卡点和社交话题设计" },
    { angle: "沉浸体验设计", reasoning: "通过空间叙事创造独特体验，让顾客成为品牌故事的一部分" },
    { angle: "快落地强识别", reasoning: "快闪周期短，提案应强调高辨识度视觉和快速搭建方案" },
  ],
  商业空间升级: [
    { angle: "最小干预最大提升", reasoning: "局部升级的核心是用最少改动换最大视觉效果，聚焦门头和主展区" },
    { angle: "品牌年轻化", reasoning: "老店翻新往往为了吸引年轻客群，提案应体现新审美和新体验" },
    { angle: "控停业缩工期", reasoning: "减少停业损失是客户核心关切，提案应提供分阶段施工方案" },
  ],
  "办公/展示空间": [
    { angle: "企业文化落地", reasoning: "办公空间是企业文化的物理载体，提案应将价值观融入空间设计" },
    { angle: "功能优先体验并重", reasoning: "满足办公效率的同时提升空间品质感和员工体验" },
    { angle: "展厅引流转化", reasoning: "展示空间承担商务接待功能，提案应突出展示动线和品牌叙事" },
  ],
  其他: [
    { angle: "明确需求边界", reasoning: "项目类型特殊时，提案首先应帮客户厘清需求范围和优先级" },
    { angle: "分阶段推进", reasoning: "需求不明确时，建议先做诊断/调研阶段，再进入设计阶段" },
  ],
};

// ─── Missing field rules ───────────────────────────────────────────────────────

export interface MissingFieldRule {
  field: keyof { projectName: string; projectType: string; description: string };
  label: string;
  reason: string;
  impact: "blocking" | "important" | "optional";
}

export const MISSING_FIELD_RULES: MissingFieldRule[] = [
  {
    field: "description",
    label: "项目需求描述",
    reason: "需求描述是 brief 的核心输入，缺失将无法生成有效的结构化拆解",
    impact: "blocking",
  },
  {
    field: "projectType",
    label: "项目类型",
    reason: "项目类型决定需求拆解模板、风险库与下一步行动，建议明确",
    impact: "important",
  },
  {
    field: "projectName",
    label: "项目名称",
    reason: "缺少项目名称会导致 brief 文件无标题，建议在正式沟通前补充",
    impact: "optional",
  },
];
