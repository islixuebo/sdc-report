#!/usr/bin/env python3
"""
SDC 上周变更任务查询 — 拉取上周一至今有变更的任务
包含：四个终态（需求验收中、已发布、不是需求、评审关闭）+ 无版本任务
"""
import json, os, sys, ssl, urllib.request, urllib.parse
from datetime import datetime, timedelta
from collections import Counter
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ===== 读取配置 =====
CONFIG_FILE = None
for candidate in [os.path.join(os.path.dirname(BASE_DIR), '.sdc_report_config.json'),
                  os.path.join(BASE_DIR, '.sdc_report_config.json'),
                  os.path.join(os.getcwd(), '.sdc_report_config.json')]:
    if os.path.isfile(candidate):
        CONFIG_FILE = candidate
        break
if not CONFIG_FILE:
    print("错误：未找到配置文件 .sdc_report_config.json，请先运行 bash scripts/init_config.sh")
    sys.exit(1)

with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
    config = json.load(f)

JIRA_URL = config.get('jira_url', '')
JIRA_USERNAME = config.get('jira_username', '') or ''
JIRA_TOKEN = config.get('jira_token', '')
if not JIRA_URL or not JIRA_TOKEN:
    print("错误：配置缺少 jira_url 或 jira_token")
    sys.exit(1)

# ===== 计算上周一日期 =====
today = datetime.now()
last_monday = today - timedelta(days=today.weekday() + 7)
since_date = last_monday.strftime('%Y-%m-%d')
print(f"今日: {today.strftime('%Y-%m-%d')}  ({'一二三四五六日'[today.weekday()]})")
print(f"上周一: {since_date}")
print(f"查询范围: {since_date} ~ 至今\n")

# ===== JQL =====
JQL = (
    f'project = SDCDN AND issuetype in (任务, 改进) '
    f'AND (status in (需求验收中, 已发布, 不是需求, 评审关闭) OR fixVersion = EMPTY) '
    f'AND updated >= {since_date} '
    f'ORDER BY updated DESC'
)
FIELDS = 'key,summary,status,fixVersions,priority,customfield_10348,customfield_10300,created,reporter,updated,resolutiondate'

# ===== 认证 =====
def auth_header():
    if JIRA_USERNAME:
        import base64
        return f'Basic {base64.b64encode(f"{JIRA_USERNAME}:{JIRA_TOKEN}".encode()).decode()}'
    return f'Bearer {JIRA_TOKEN}'

# ===== 拉取数据 =====
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

params = urllib.parse.urlencode({'jql': JQL, 'fields': FIELDS, 'maxResults': 200})
req = urllib.request.Request(f'{JIRA_URL}?{params}', method='GET')
req.add_header('Authorization', auth_header())
with urllib.request.urlopen(req, context=ctx) as resp:
    issues = json.loads(resp.read().decode('utf-8')).get('issues', [])

# ===== 数据处理 =====
def clean_system(val):
    if not val: return '其他'
    if isinstance(val, dict): s = val.get('value', '') or ''
    else: s = str(val)
    s = s.strip()
    s = re.sub(r'^【[^】]+】', '', s).strip()
    if not s: return '其他'
    SYSTEMS = ['RDM', 'SRDPM', 'MAP', 'OSM', 'TOM', 'JIRA', 'SCA', 'AI', 'SINE', 'SOM', 'Skills', 'Devops']
    for name in SYSTEMS:
        if s.upper() == name.upper(): return name
    for name in SYSTEMS:
        if name.upper() in s.upper(): return name
    return '其他'

def clean_reporter(name):
    if not name: return ''
    name = name.strip()
    name = re.sub(r'(?:\s+)(SE|SPM|STM|SEng|SWE|Dev|QA|TL|PL|MGR|ENG|FAE|OME|SQM|HW|AE|TPM|PM|PD|PO|BA|DA|SA|SVP|VP|Director|STL)$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'(?<=[\u4e00-\u9fa5a-zA-Z])(SE|SPM|STM|SEng|SWE|Dev|QA|TL|PL|MGR|ENG|FAE|OME|SQM|HW|AE|TPM|PM|PD|PO|BA|DA|SA|SVP|VP|Director|STL)$', '', name, flags=re.IGNORECASE)
    return name.strip()

sys_counts = Counter()
status_counts = Counter()

for issue in issues:
    fields = issue.get('fields', {})
    system = clean_system(fields.get('customfield_10348'))
    raw_status = fields.get('status', {}).get('name', '')
    sys_counts[system] += 1
    status_counts[raw_status] += 1

# ===== 输出结果 =====
print(f'共 {len(issues)} 条任务\n')

print('系统分布:')
for s, c in sorted(sys_counts.items(), key=lambda x: -x[1]):
    print(f'  {s}: {c}')
print()

print('状态分布:')
for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
    print(f'  {s}: {c}')
print()
print()

print(f'{"系统":<12} {"任务":<12} {"状态":<10} {"版本":<15} {"更新日":<12} {"报告人":<10} 概要')
print('-' * 120)
for issue in issues:
    fields = issue.get('fields', {})
    key = issue['key']
    summary = fields.get('summary', '')[:45]
    system = clean_system(fields.get('customfield_10348'))
    reporter = clean_reporter(fields.get('reporter', {}).get('displayName', ''))
    updated = (fields.get('updated', '') or '')[:10]
    raw_status = fields.get('status', {}).get('name', '')
    fix_ver = fields.get('fixVersions', [])
    ver_str = ','.join(v.get('name', '') for v in fix_ver) if fix_ver else '(无版本)'
    print(f'{system:<12} {key:<12} {raw_status:<10} {ver_str:<15} {updated:<12} {reporter:<10} {summary}')