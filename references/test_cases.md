# SDC Report Skill — 测试用例

## TC-1: 完整流程测试（本地生成）
1. 进入项目工作目录
2. 运行 `bash scripts/init_config.sh`
   - 预期：生成 `.sdc_report_config.json`
3. 运行 `python3 scripts/gen_report.py`
   - 预期：拉取 Jira 数据，输出 MD + Excel，生成 `.ppt_data.json`
   - 验证：输出文件存在，版本号正确
4. 运行 `node scripts/generate_ppt.js`
   - 预期：输出 PPTX，5 页幻灯片
   - 验证：PPT 文件存在，可打开

## TC-2: 版本号管理测试
1. 连续运行 gen_report.py 两次
   - 预期：第二次版本号递增 V01→V02
2. 跨天运行
   - 预期：版本号重置为 V01

## TC-3: 未配置初始化测试
1. 删除 .sdc_report_config.json
2. 运行 gen_report.py
   - 预期：提示"首次使用"信息，给出配置示例，正常退出

## TC-4: 报告人清洗测试
- 输入 "吴焕杰TPM" → 预期输出 "吴焕杰"
- 输入 "刘丽君STL" → 预期输出 "刘丽君"
- 输入 "郑彩玲 SPM" → 预期输出 "郑彩玲"
- 输入 "李桉鹏" → 预期输出 "李桉鹏"

## TC-5: 系统分类测试
- 输入 "RDM" → 预期 "RDM"
- 输入 "SRDPM【MOKA】" → 预期 "SRDPM"（括号去除）
- 输入 "AI" → 预期 "AI"
- 输入 "未知系统" → 预期 "其他"