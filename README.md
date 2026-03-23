# Brief Builder

把模糊的项目需求变成结构化的提案文档。填表单，出 Brief。

Turn vague project requests into structured proposal briefs. Fill a form, get a Brief.

<!-- **[Live Demo →](https://brief-builder.vercel.app)** -->

---

## 它解决什么问题 / What it solves

写项目提案是一件重复且容易遗漏的事：每次从空白文档开始，格式不统一，关键信息靠经验记忆。

Brief Builder 把 Brief 写作变成 **填表 → 生成** 的流程。你填写项目基本信息，它输出一份包含需求拆解、缺失信息提醒、风险评估和下一步行动的完整 Brief。

Writing project proposals is repetitive and error-prone. Brief Builder turns it into a **form → structured output** workflow. You describe the project, it generates a complete brief with requirements breakdown, missing info alerts, risk assessment, and next steps.

## 核心功能 / Features

- **表单化输入** — 项目类型、描述、预算、时间线，不需要写 prompt
- **6 模块结构化输出** — 项目摘要 · 关键需求（按优先级）· 缺失信息（按影响等级）· 风险提示 · 下一步行动 · 提案角度
- **混合生成管线** — 行业规则引擎 + LLM，确定性规则兜底，AI 处理自然语言推理
- **冲突过滤** — 你说了预算，AI 就不会再问你预算。自动提取事实，过滤矛盾项
- **场景隔离** — 零售/展会/商业空间各有独立 prompt，不会串场
- **一键导出** — 复制到剪贴板或下载为文本文件

## 工作原理 / How it works

```
用户输入 → 事实提取 → 规则引擎 → LLM 生成 → 冲突过滤 → 安全护栏 → 结构化 Brief
                         ↓                        ↓
                  行业专业规则            移除与用户输入矛盾的条目
```

**不是纯 LLM 套壳。** 内置行业规则库提供确定性检查项（如零售项目自动检查收银动线和仓储需求），LLM 负责自然语言理解和生成，冲突过滤层确保输出不与用户已提供的信息矛盾。

## 快速开始 / Quick Start

```bash
git clone https://github.com/seafhven-ss/brief-builder.git
cd brief-builder
npm install

# 配置 LLM（复制并填入 API Key）
cp .env.example .env.local

# 启动
npm run dev
# → http://localhost:3000
```

需要一个 LLM API Key（Groq 免费 / OpenAI），见 `.env.example`。

## 项目类型 / Supported Project Types

| 类型 | Type | 说明 |
|------|------|------|
| 零售门店 | Retail Store | 含经营动线、坪效、仓储等行业规则 |
| 展会展台 | Exhibition Booth | 含搭建周期、吊点限制、安全合规等 |
| 品牌快闪 | Pop-up Store | 短期运营场景 |
| 商业空间升级 | Commercial Renovation | 改造翻新场景 |
| 办公/展示空间 | Office / Showroom | 企业空间场景 |
| 其他 | Other | 通用模板 |

## 项目结构 / Project Structure

```
brief-builder/
├── app/
│   ├── page.tsx                    # 首页
│   ├── builder/page.tsx            # Brief 生成器主页面
│   └── api/generate-brief/route.ts # LLM API 路由
├── components/
│   ├── BriefForm.tsx               # 项目信息表单
│   └── OutputCard.tsx              # 结构化输出展示
├── lib/
│   ├── types.ts                    # TypeScript 类型
│   ├── facts.ts                    # 事实提取引擎
│   ├── rule-engine.ts              # 规则匹配引擎
│   ├── conflict-filter.ts          # 冲突过滤器
│   ├── demo-safeguards.ts          # 安全护栏
│   └── generator.ts                # 生成器接口
├── data/
│   └── demo-rules-v1.ts            # 行业规则库（8+ 条）
├── prompts/                        # LLM 场景 prompt
│   ├── system.txt
│   ├── retail.txt
│   ├── booth.txt
│   └── commercial.txt
└── .env.example                    # 环境变量模板
```

**Tech stack**: Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript 5

## 技术设计 / Architecture

### 为什么用规则引擎 + LLM 而不是纯 LLM

1. **可预测** — 行业规则的输出是确定性的，不因 prompt 微调产生意外
2. **可审计** — 每条规则有 ID，调试面板可追溯触发原因
3. **低成本** — 规则层处理确定性判断，减少 LLM token 消耗
4. **可扩展** — 添加新行业 = 添加新规则文件 + 新 prompt，无需改架构

### LLM 支持

| Provider | Model | 特点 |
|----------|-------|------|
| Groq | qwen3-32b | 免费额度，速度快，当前默认 |
| OpenAI | gpt-4.1-mini | JSON Schema 严格模式，输出更稳定 |

通过 `LLM_PROVIDER` 环境变量切换，代码自动适配（Groq 用 json_object 模式，OpenAI 用 json_schema 严格模式）。

## Roadmap

- [x] 规则引擎 + 模板生成
- [x] LLM 集成（Groq / OpenAI）
- [x] 事实提取 + 冲突过滤
- [x] 场景隔离 prompt
- [ ] 多语言输出（中/英）
- [ ] Brief 历史记录
- [ ] Markdown / PDF 导出
- [ ] 自定义规则模板
- [ ] 团队协作

## License

MIT
