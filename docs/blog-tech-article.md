# 规则引擎 + LLM 混合架构：我如何让 AI 生成可靠的项目提案

## 从一个真实痛点说起

做过商业空间项目的人都知道，写项目提案（brief）是一件既重要又痛苦的事。

每次接到新项目，不管是零售门店、展览空间还是商业综合体，第一步永远是坐下来写 brief：梳理客户需求、拆解功能分区、评估预算风险、列出缺失信息……一份合格的 brief 通常要花半天到一天，而且写完还得反复检查有没有遗漏或前后矛盾。

我试过直接用 ChatGPT 来写。结果你猜怎么着——它确实能写出看起来很专业的文档，但内容经不起推敲。它会在预算段落里写"建议预留充足预算"，但具体多少钱、基于什么标准，完全是编的。它会把零售空间的规范套到展览项目上。更要命的是，同一份 brief 里前面说"工期 3 个月"，后面的风险评估又按 6 个月来算。

纯 LLM 生成结构化商业文档，**不靠谱**。

这不是 prompt 写得好不好的问题，而是 LLM 的根本特性决定的：它是概率模型，不是逻辑引擎。它擅长语言组织，但不擅长事实一致性检查。

所以我花了大概两周时间，写了一个混合架构的 brief 生成器：**ProBrief**。规则引擎负责"对不对"，LLM 负责"好不好"。

## 架构设计：六步流水线

整个系统的核心是一条六步流水线，每一步各司其职：

```
用户输入
  │
  ▼
┌─────────────┐
│  事实提取    │  从自然语言中提取结构化字段
│ Fact Extract │  （项目类型、面积、预算、地区、工期…）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  规则引擎    │  8+ 条行业规则，确定性输出
│ Rule Engine  │  （预算基准、合规要求、风险标记…）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  LLM 生成   │  基于事实 + 规则结果，生成自然语言段落
│ LLM Gen     │  （需求描述、风险分析、下一步建议…）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  冲突过滤    │  提取 LLM 输出中的事实，与规则结果对比
│ Conflict     │  发现矛盾则修正或删除
│ Filter       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  安全护栏    │  敏感词、格式校验、字段完整性检查
│ Guardrails   │
└──────┬──────┘
       │
       ▼
  结构化输出（JSON → 渲染为专业文档）
```

这不是为了好看才画成六步的。每一步都解决一个具体问题，去掉任何一步，输出质量都会明显下降。

## 规则引擎：让确定性的事情不经过概率模型

规则引擎是整个系统的骨架。我设计了 8 条以上的行业规则，每条规则都有明确的 ID、触发条件和确定性输出。

举几个例子：

```typescript
// 规则结构定义
interface IndustryRule {
  id: string;           // 如 "RULE-BUDGET-RETAIL-T1"
  trigger: {
    projectType: string[];    // ["retail", "flagship-store"]
    region?: string[];        // ["一线城市", "新一线城市"]
    month?: number[];         // 季节性规则
    keywords?: string[];      // 用户输入中的关键词匹配
  };
  output: {
    budgetBaseline: number;   // 元/㎡
    complianceNotes: string[];
    riskFlags: string[];
    timelineMultiplier: number;
  };
}

// 示例规则：一线城市零售门店预算基准
const RULE_BUDGET_RETAIL_T1: IndustryRule = {
  id: "RULE-BUDGET-RETAIL-T1",
  trigger: {
    projectType: ["retail", "flagship-store"],
    region: ["一线城市"],
  },
  output: {
    budgetBaseline: 8500,  // 8500 元/㎡
    complianceNotes: [
      "需符合商业建筑消防规范 GB50016",
      "一线城市商铺需额外考虑环评审批周期",
    ],
    riskFlags: ["高租金区域，需确认租约期限与装修摊销周期匹配"],
    timelineMultiplier: 1.2,
  },
};
```

规则匹配逻辑很直接——关键词匹配、地区匹配、月份匹配，三者取交集。没有机器学习，没有向量检索，就是 `if-else` 加查表。

为什么要这么"土"？因为**商业提案里的硬性指标不能有随机性**。客户问你预算基准是多少，你不能每次给一个不同的数字。规则引擎的输出是可审计的——每条建议都能追溯到具体的规则 ID，出了问题知道改哪里。

## 冲突过滤：LLM 说的和事实不一样怎么办

LLM 生成的文本虽然基于规则引擎的输出，但它仍然可能"发挥"。比如规则引擎算出预算基准是 8500 元/㎡，LLM 在风险分析段落里可能写成"预计成本约 6000-7000 元/㎡"。

冲突过滤器做的事情很简单：

1. **从 LLM 输出中提取事实声明**——数字、日期、面积、预算范围等
2. **与规则引擎的确定性输出逐一对比**
3. **发现矛盾时，用规则引擎的值替换 LLM 的值**；无法替换的（如语义矛盾），直接删除该句

```typescript
function filterConflicts(
  llmOutput: GeneratedSections,
  ruleResults: RuleEngineOutput
): GeneratedSections {
  const facts = extractFactClaims(llmOutput);

  for (const fact of facts) {
    const ruleValue = ruleResults.getFactByKey(fact.key);
    if (ruleValue && !isConsistent(fact.value, ruleValue)) {
      // 用规则引擎的确定值覆盖 LLM 的幻觉值
      llmOutput = replaceFact(llmOutput, fact, ruleValue);
    }
  }

  return llmOutput;
}
```

这一步不算优雅，但极其实用。它把 LLM 幻觉的影响范围从"整份文档不可信"缩小到"最多某句话被替换"。

## 场景隔离：不同项目类型用不同 Prompt

零售门店、展览空间、商业综合体——这三类项目的关注点完全不同。零售关注坪效和动线，展览关注体验节奏和临时结构安全，商业综合体关注多业态协调和人流分配。

如果用一个通用 prompt 处理所有类型，LLM 会倾向于输出"正确但无用"的泛泛之谈。所以我做了场景隔离：每种项目类型有独立的 prompt 模板，强调该场景下最关键的维度。

```typescript
const SCENE_PROMPTS: Record<ProjectType, string> = {
  retail: `你是资深零售空间顾问。重点关注：
    - 坪效分析与动线规划
    - 品牌调性与空间表达的匹配度
    - 季节性陈列更换的灵活性设计...`,

  exhibition: `你是展览空间设计专家。重点关注：
    - 参观动线与体验节奏
    - 临时结构的安全合规
    - 多媒体设备的电力与网络预留...`,

  commercial: `你是商业综合体策划顾问。重点关注：
    - 多业态配比与租户组合
    - 主力店与次主力店的人流导入关系
    - 公共空间的运营坪效...`,
};
```

场景隔离的另一个好处是**可以独立迭代**。零售场景的 prompt 改了十几版了，展览场景才改了两版——它们互不影响。

## 技术选型：刻意保持简单

整个项目的技术栈：

- **Next.js 16 + React 19 + TypeScript 5**
- 全部代码约 **1600 行**
- Next.js 之外**零外部依赖**

没有用 LangChain，没有用任何 "AI 框架"。规则引擎就是纯 TypeScript 函数，冲突过滤就是字符串处理加正则，prompt 模板就是模板字符串。

LLM 调用支持两个后端，通过环境变量切换：

```bash
# 用 Groq（免费，qwen3-32b）
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_xxxx

# 或者用 OpenAI（gpt-4.1-mini）
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxxx
```

Groq 跑 qwen3-32b 是免费的，延迟大概 1-2 秒出完整 brief。对于一个内部工具来说，完全够用。OpenAI 的 gpt-4.1-mini 输出质量略好一些，但成本和延迟都更高，适合对外交付的场景。

选择不引入框架是有意为之。1600 行代码，任何一个中级开发者半小时就能读完。出了 bug 不用去翻框架源码，直接看业务逻辑。这对于一个需要长期维护的工具来说，比"开发时省了两小时"重要得多。

## 为什么是规则引擎 + LLM，而不是纯 LLM

总结一下这个架构的核心优势：

**可预测性**。同样的输入，规则引擎的部分永远输出同样的结果。客户预算基准不会因为 LLM 的温度参数变化而波动。

**可审计性**。每条建议都关联到规则 ID。三个月后客户质疑某个预算数字，你可以直接说"这是基于 RULE-BUDGET-RETAIL-T1，一线城市零售空间基准 8500 元/㎡"。

**低延迟**。规则引擎部分是纯计算，微秒级完成。LLM 只负责文本润色，prompt 短、输出短，整体延迟控制在 2-3 秒。

**低成本**。用 Groq 免费额度就能跑。即使用 OpenAI，因为 prompt 精简（大量工作已被规则引擎完成），单次调用成本也极低。

**LLM 可替换**。今天用 qwen3-32b，明天换成别的模型，规则引擎的部分完全不受影响。LLM 只是"最后一公里"的润色层。

这套思路不只适用于项目提案。任何"需要结构化输出 + 行业知识 + 自然语言表达"的场景——合同审查、报价单生成、尽调报告——都可以用类似的混合架构。

核心理念就一句话：**把确定性的交给规则，把创造性的交给 LLM，中间加一层过滤防止 LLM 越界。**

## 开源

ProBrief 已开源，MIT 协议，欢迎 star 和 PR：

**GitHub**: [https://github.com/seafhven-ss/ProBrief](https://github.com/seafhven-ss/ProBrief)

clone 下来，配个 Groq API key（免费），`npm run dev` 就能跑。

如果你也在做类似的"规则 + AI"混合系统，欢迎交流。
