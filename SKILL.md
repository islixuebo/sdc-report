---
name: sdc-report
description: "SDC数字化需求任务统计报告自动生成。从Jira拉取SDC数字化需求数据，生成Markdown+Excel+PPT三件套报告，可选推送飞书群。当用户说：生成报告、出报告、输出报告、重新生成、发报告时使用。"
metadata:
  requires:
    bins: ["python3", "node"]
---

# SDC 数字化需求任务统计报告

## 快速使用

用户说 **"生成报告"** 或 **"出报告"** 时，执行以下完整流程。

## 前置检查

### 1. 配置文件检查

检查项目工作目录下是否存在 `.sdc_report_config.json`。如不存在，引导用户运行初始化脚本。

```bash
# 初始化配置（首次使用）
bash scripts/init_config.sh
```

配置内容包括：
- Jira 服务器地址和 API Token
- JQL 查询条件（默认 `project = SDCDN AND issuetype in (任务, 改进) AND fixVersion = EMPTY`）
- 飞书群 chat_id 和用户 open_id（可选）

### 2. 依赖检查

```bash
# Python 依赖
pip install openpyxl --break-system-packages

# Node.js 依赖（使用 pnpm）
pnpm install pptxgenjs
```

## 完整执行流程

### Step 1: 生成数据报告（MD + Excel）

```bash
cd <项目目录>
python3 scripts/gen_report.py
```

输出：`SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.md` + `.xlsx`

- 版本号自动管理：同天递增 V01→V02→V03，跨天重置
- 旧版本自动归档到 `历史报告/` 目录
- 生成 `.ppt_data.json` 供下一步使用

### Step 2: 生成 PPT

```bash
node scripts/generate_ppt.js
```

输出：`SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.pptx`

- PPT 共 5 页：封面 → 系统分布 → 状态分布 → 优先级分布 → 周期 KPI
- 自动读取 `.ppt_data.json` 中的数据

### Step 3: 清理临时文件

```bash
rm -f .ppt_data.json .ver_info.tmp
```

### Step 4: 飞书推送（可选，配了才执行）

如 `feishu.chat_id` 已配置，尝试推送：

```bash
# 发送 PPT 文件（bot 身份优先，失败则 user 身份）
lark-cli im +messages-send --chat-id <chat_id> --file "./SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.pptx" --as bot

# 发送 @消息（user 身份）
lark-cli im +messages-send --chat-id <chat_id> --text '<at user_id="<user_id>">用户</at> SDC数字化需求任务统计报告 已发送，请查收。' --as user
```

## 关键规则

### 状态映射（JIRA → 公示）

| JIRA状态 | 公示状态 |
|---------|---------|
| 需求完善 | 补充需求 |
| 待排期 | 排期中 |
| 需求验收中 | 开发中 |
| 已排期 | 待开发 |
| 开发中 | 开发中 |
| 数字化审核 | 数字化领导审核 |
| 所长审核 | 需求方所长审核 |
| 暂停跟进 | 暂停跟进 |
| 已发布 | 已发布 |
| 评审关闭 | 已关闭 |

### 系统排序

RDM > SRDPM > MAP > OSM > TOM > JIRA > SCA > AI > SINE > SOM > Skills > Devops > 其他

### 统计维度

1. 按系统分布（任务数 + 占比）
2. 按状态分布（任务数 + 占比）
3. 按优先级分布（任务数 + 占比）
4. 周期分析 KPI（当月/当周 新增/完结）

### 报告人清洗

Jira 用户名的后缀职称自动剥离：
`SE|SPM|STM|SEng|SWE|Dev|QA|TL|PL|MGR|ENG|FAE|OME|SQM|HW|AE|TPM|PM|PD|PO|BA|DA|SA|SVP|VP|Director|STL`

## 故障处理

| 问题 | 处理方式 |
|------|----------|
| 未找到配置文件 | 运行 `bash scripts/init_config.sh` 初始化 |
| gen_report.py 报错 | 检查 Jira Token 是否过期，运行 `bash scripts/init_config.sh` 重新配置 |
| generate_ppt.js 报错 | 检查 pptxgenjs 是否已安装（`pnpm install pptxgenjs`） |
| 飞书推送失败 | 下载 PPT 手动发送到群 |
| 编码报错 | 确保系统支持 UTF-8 |

## 输出文件

| 文件 | 格式 | 说明 |
|------|------|------|
| `SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.md` | Markdown | 完整报告含所有统计维度 |
| `SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.xlsx` | Excel | 多 Sheet：总览 + 全部任务 + 各系统 + 周期分析 |
| `SDC数字化需求任务统计报告_YYYY-MM-DD.Vxx.pptx` | PPTX | 5 页幻灯片，含饼图/柱状图/KPI 卡片 |