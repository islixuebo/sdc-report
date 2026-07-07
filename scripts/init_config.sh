#!/usr/bin/env bash
# =====================================================
# SDC 报告系统 — 首次初始化配置
# 引导用户输入 Jira Token、飞书配置
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_DIR/.sdc_report_config.json"

echo ""
echo "=============================================="
echo "  SDC 数字化需求报告系统 — 首次初始化配置"
echo "=============================================="
echo ""
echo "本向导将引导您配置 Jira 连接和飞书推送参数。"
echo "配置将保存在项目目录下的 .sdc_report_config.json 文件中。"
echo ""
echo "提示：所有项目都有默认值，直接回车=使用默认值，输入内容=替换默认值。"
echo ""

# ----- Jira 配置 -----
echo "【1/2】Jira 连接配置"
echo "--------------------"
echo ""

DEFAULT_JIRA_URL="https://idisplayvision.com/jira/rest/api/2/search"
echo "Jira 服务器地址（默认: $DEFAULT_JIRA_URL）"
echo "  直接回车使用默认，或输入新地址替换："
read -p "  输入: " input_jira_url
JIRA_URL="${input_jira_url:-$DEFAULT_JIRA_URL}"

echo ""
echo "Jira API Token（必填，不会保存在 Git 仓库中）"
read -p "  输入: " input_jira_token
if [ -z "$input_jira_token" ]; then
    echo "错误：Jira Token 不能为空，初始化退出。"
    exit 1
fi
JIRA_TOKEN="$input_jira_token"

DEFAULT_JQL="project = SDCDN AND issuetype in (任务, 改进) AND fixVersion = EMPTY"
echo ""
echo "JQL 查询条件（默认: $DEFAULT_JQL）"
echo "  直接回车使用默认，或输入新 JQL 替换："
read -p "  输入: " input_jql
JQL="${input_jql:-$DEFAULT_JQL}"

echo ""
# ----- 飞书配置 -----
echo "【2/2】飞书推送配置（可选，留空则跳过推送）"
echo "-----------------------------"
echo ""

read -p "飞书群 chat_id（留空则不推送）: " input_chat_id
FEISHU_CHAT_ID="${input_chat_id:-}"

read -p "飞书用户 open_id（用于 @ 消息，留空则不发 @）: " input_user_id
FEISHU_USER_ID="${input_user_id:-}"

# ----- 写入配置文件 -----
cat > "$CONFIG_FILE" << CONFIG_EOF
{
  "jira_url": "$JIRA_URL",
  "jira_token": "$JIRA_TOKEN",
  "jql_active": "$JQL",
  "fields_base": "key,summary,status,priority,customfield_10348,customfield_10300,customfield_10302,customfield_10458,created,reporter,name,resolutiondate",
  "feishu": {
    "chat_id": "$FEISHU_CHAT_ID",
    "user_id": "$FEISHU_USER_ID"
  }
}
CONFIG_EOF

echo ""
echo "=============================================="
echo "  初始化完成！"
echo "  配置文件已保存至: $CONFIG_FILE"
echo ""
echo "  已配置:"
echo "    Jira 服务器: $JIRA_URL"
if [ -n "$FEISHU_CHAT_ID" ]; then
    echo "    飞书群 chat_id: $FEISHU_CHAT_ID"
else
    echo "    飞书推送: 未配置（跳过）"
fi
echo ""
echo "  现在可以运行以下命令生成报告："
echo "    cd $PROJECT_DIR"
echo "    python3 scripts/gen_report.py"
echo "    node scripts/generate_ppt.js"
echo "=============================================="