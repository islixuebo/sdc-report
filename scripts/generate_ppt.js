#!/usr/bin/env node
/**
 * SDC数字化需求任务统计报告 — PPT 生成脚本
 * 读取 .ppt_data.json 中的数据生成 PPTX
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// ===== 读取数据 =====
const scriptDir = __dirname;
const dataPath = path.join(scriptDir, '.ppt_data.json');

if (!fs.existsSync(dataPath)) {
    console.error('错误：未找到 .ppt_data.json，请先运行 gen_report.py');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const { today, ver_tag, total_tasks, sys_stats, status_stats, priority_stats } = data;

// ===== 颜色方案 =====
const BG_BLUE = '1A365D';
const BG_LIGHT = 'F7FAFC';
const TEXT_DARK = '1A202C';
const TEXT_WHITE = 'FFFFFF';
const ACCENT_BLUE = '2B6CB0';
const ACCENT_GREEN = '38A169';
const ACCENT_ORANGE = 'DD6B20';
const ACCENT_PURPLE = '6B46C1';
const ACCENT_TEAL = '319795';

const STATUS_COLORS = {
    '排期中': { hold: '3B82F6', text: TEXT_WHITE },
    '需求方所长审核': { hold: 'F59E0B', text: TEXT_WHITE },
    '补充需求': { hold: 'EF4444', text: TEXT_WHITE },
    '暂停跟进': { hold: '94A3B8', text: TEXT_WHITE },
    '待开发': { hold: '8B5CF6', text: TEXT_WHITE },
    '已发布': { hold: '10B981', text: TEXT_WHITE },
    '已关闭': { hold: '64748B', text: TEXT_WHITE },
    '开发中': { hold: 'EC4899', text: TEXT_WHITE },
};

// ===== 创建PPT =====
const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';

const FONT_TITLE = 'Arial';
const FONT_BODY = 'Arial';

// ===== Helper: 生成饼图数据 =====
function pieSlice(stats, maxItems = 8) {
    const sorted = [...stats].sort((a, b) => b.count - a.count);
    if (sorted.length > maxItems) {
        const others = sorted.slice(maxItems - 1);
        const otherCount = others.reduce((s, x) => s + x.count, 0);
        const result = sorted.slice(0, maxItems - 1);
        result.push({ name: '其他', count: otherCount, pct: (otherCount / total_tasks * 100).toFixed(1) + '%' });
        return result;
    }
    return sorted;
}

// ===== Slide 1: 封面 =====
const slide1 = pptx.addSlide();
slide1.background = { fill: BG_BLUE };
slide1.addText('SDC 数字化需求任务统计报告', {
    x: 0.8, y: 1.5, w: 11.73, h: 1.2,
    fontSize: 42, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true, align: 'center',
});
slide1.addText(`统计日期: ${today}  |  版本: ${ver_tag.trim()}`, {
    x: 0.8, y: 3.0, w: 11.73, h: 0.8,
    fontSize: 22, fontFace: FONT_BODY, color: '90CDF4', align: 'center',
});
slide1.addText(`任务总数: ${total_tasks} 条`, {
    x: 0.8, y: 3.8, w: 11.73, h: 0.8,
    fontSize: 28, fontFace: FONT_BODY, color: TEXT_WHITE, bold: true, align: 'center',
});
slide1.addText('数据来源: JIRA Filter #11503 - SDC 数字化需求（未发布）', {
    x: 1.5, y: 5.0, w: 10.33, h: 0.5,
    fontSize: 14, fontFace: FONT_BODY, color: 'A0AEC0', align: 'center',
});
slide1.addShape(pptx.ShapeType.rect, {
    x: 3.5, y: 5.6, w: 6.33, h: 0.04, fill: { color: '63B3ED' },
});
slide1.addText('SDC 数字化需求团队', {
    x: 0.8, y: 6.0, w: 11.73, h: 0.5,
    fontSize: 16, fontFace: FONT_BODY, color: 'A0AEC0', align: 'center',
});

// ===== Slide 2: 按系统分布 =====
const slide2 = pptx.addSlide();
slide2.background = { fill: BG_LIGHT };
slide2.addText('按系统分布', {
    x: 0.8, y: 0.3, w: 11.73, h: 0.7,
    fontSize: 28, fontFace: FONT_TITLE, color: TEXT_DARK, bold: true,
});

const sysSlice = pieSlice(sys_stats, 9);
const sysLabels = sysSlice.map(s => `${s.name} (${s.count})`);
const sysValues = sysSlice.map(s => s.count);
const sysColors = ['2B6CB0', '38A169', 'DD6B20', '6B46C1', 'E53E3E', '319795', '805AD5', '2C7A7B', '718096'];

slide2.addChart(pptx.ChartType.pie, sysValues, sysLabels, {
    x: 0.3, y: 1.2, w: 5.5, h: 5.8,
    showLegend: false,
    showPercent: true,
    dataLabelFontSize: 10,
    dataLabelColor: TEXT_DARK,
    chartColors: sysColors.slice(0, sysLabels.length),
    holeSize: 0,
});

// 右侧统计表
const sysTableData = [['系统', '任务数', '占比', ''].map(h => ({ text: h, options: { bold: true, color: TEXT_WHITE, fill: { color: BG_BLUE }, fontSize: 10, align: 'center' } }))];
sysSlice.forEach(s => {
    sysTableData.push([
        { text: s.name, options: { fontSize: 10, align: 'center' } },
        { text: s.count.toString(), options: { fontSize: 10, align: 'center' } },
        { text: s.pct, options: { fontSize: 10, align: 'center' } },
        { text: '', options: {} },
    ]);
});
// Add total row
sysTableData.push([
    { text: '合计', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: total_tasks.toString(), options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '', options: {} },
]);

slide2.addTable(sysTableData, {
    x: 6.3, y: 1.2, w: 6.5,
    fontSize: 10,
    border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
    colW: [2.2, 1.2, 1.2, 0, 1.9],
    margin: 4,
    rowH: [0.35],
});

// ===== Slide 3: 按状态分布 =====
const slide3 = pptx.addSlide();
slide3.background = { fill: BG_LIGHT };
slide3.addText('按状态分布', {
    x: 0.8, y: 0.3, w: 11.73, h: 0.7,
    fontSize: 28, fontFace: FONT_TITLE, color: TEXT_DARK, bold: true,
});

const statusSlice = pieSlice(status_stats, 9);
const statusLabels = statusSlice.map(s => `${s.name} (${s.count})`);
const statusValues = statusSlice.map(s => s.count);
const statusColors = ['3B82F6', 'F59E0B', 'EF4444', '8B5CF6', '10B981', 'EC4899', '94A3B8', '64748B', 'A0AEC0'];

slide3.addChart(pptx.ChartType.pie, statusValues, statusLabels, {
    x: 0.3, y: 1.2, w: 5.5, h: 5.8,
    showLegend: false,
    showPercent: true,
    dataLabelFontSize: 10,
    dataLabelColor: TEXT_DARK,
    chartColors: statusColors.slice(0, statusLabels.length),
    holeSize: 0,
});

const statusTableData = [['公示状态', '任务数', '占比', ''].map(h => ({ text: h, options: { bold: true, color: TEXT_WHITE, fill: { color: BG_BLUE }, fontSize: 10, align: 'center' } }))];
statusSlice.forEach(s => {
    statusTableData.push([
        { text: s.name, options: { fontSize: 10, align: 'center' } },
        { text: s.count.toString(), options: { fontSize: 10, align: 'center' } },
        { text: s.pct, options: { fontSize: 10, align: 'center' } },
        { text: '', options: {} },
    ]);
});
statusTableData.push([
    { text: '合计', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: total_tasks.toString(), options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '', options: {} },
]);

slide3.addTable(statusTableData, {
    x: 6.3, y: 1.2, w: 6.5,
    fontSize: 10,
    border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
    colW: [2.2, 1.2, 1.2, 0, 1.9],
    margin: 4,
    rowH: [0.35],
});

// ===== Slide 4: 优先级分布 =====
const slide4 = pptx.addSlide();
slide4.background = { fill: BG_LIGHT };
slide4.addText('优先级分布', {
    x: 0.8, y: 0.3, w: 11.73, h: 0.7,
    fontSize: 28, fontFace: FONT_TITLE, color: TEXT_DARK, bold: true,
});

const priSlice = priority_stats.sort((a, b) => {
    const order = ['P0', 'P1', 'P2', 'P3', 'P4', '(未设)'];
    return order.indexOf(a.name) - order.indexOf(b.name);
});
const priLabels = priSlice.map(s => `${s.name} (${s.count})`);
const priValues = priSlice.map(s => s.count);
const priColors = ['E53E3E', 'DD6B20', '2B6CB0', '38A169', '6B7280', 'A0AEC0'];

slide4.addChart(pptx.ChartType.bar, priValues, priLabels, {
    x: 0.3, y: 1.2, w: 7.5, h: 5.8,
    showLegend: false,
    showPercent: true,
    barDirection: 'bar',
    barGrouping: 'clustered',
    dataLabelFontSize: 11,
    dataLabelColor: TEXT_DARK,
    chartColors: priColors.slice(0, priLabels.length),
    catAxisLabelFontSize: 11,
    valAxisLabelFontSize: 10,
    valGridLine: { color: 'E2E8F0', style: 'solid' },
});

const priTableData = [['优先级', '任务数', '占比'].map(h => ({ text: h, options: { bold: true, color: TEXT_WHITE, fill: { color: BG_BLUE }, fontSize: 10, align: 'center' } }))];
priSlice.forEach(s => {
    priTableData.push([
        { text: s.name, options: { fontSize: 10, align: 'center' } },
        { text: s.count.toString(), options: { fontSize: 10, align: 'center' } },
        { text: s.pct, options: { fontSize: 10, align: 'center' } },
    ]);
});
priTableData.push([
    { text: '合计', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: total_tasks.toString(), options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 10, align: 'center' } },
]);

slide4.addTable(priTableData, {
    x: 8.3, y: 1.2, w: 4.5,
    fontSize: 10,
    border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
    colW: [1.5, 1.2, 1.2],
    margin: 4,
    rowH: [0.35],
});

// ===== Slide 5: 周期分析KPI =====
const slide5 = pptx.addSlide();
slide5.background = { fill: BG_LIGHT };
slide5.addText('周期分析 KPI', {
    x: 0.8, y: 0.3, w: 11.73, h: 0.7,
    fontSize: 28, fontFace: FONT_TITLE, color: TEXT_DARK, bold: true,
});

const kpiCards = [
    { label: '当月新增', value: data.month_new.count, color: ACCENT_BLUE },
    { label: '当月完结', value: data.month_done.count, color: ACCENT_GREEN },
    { label: '本周新增', value: data.week_new.count, color: ACCENT_ORANGE },
    { label: '本周完结', value: data.week_done.count, color: ACCENT_PURPLE },
];

const cardWidth = 2.6;
const cardGap = 0.4;
const startX = 0.8;

kpiCards.forEach((card, idx) => {
    const cx = startX + idx * (cardWidth + cardGap);
    slide5.addShape(pptx.ShapeType.roundRect, {
        x: cx, y: 1.5, w: cardWidth, h: 2.2,
        fill: { color: card.color },
        rectRadius: 0.15,
    });
    slide5.addText(card.value.toString(), {
        x: cx, y: 1.7, w: cardWidth, h: 1.0,
        fontSize: 48, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true, align: 'center',
    });
    slide5.addText(card.label, {
        x: cx, y: 2.8, w: cardWidth, h: 0.6,
        fontSize: 16, fontFace: FONT_BODY, color: TEXT_WHITE, align: 'center',
    });
});

slide5.addText(`周期范围: ${data.month_range}  |  ${data.week_range}`, {
    x: 0.8, y: 4.3, w: 11.73, h: 0.5,
    fontSize: 14, fontFace: FONT_BODY, color: '718096', align: 'center',
});

// 添加摘要表格
slide5.addText('任务系统分布', {
    x: 0.8, y: 5.0, w: 11.73, h: 0.5,
    fontSize: 16, fontFace: FONT_TITLE, color: TEXT_DARK, bold: true,
});

const sumTableData = [['系统', '任务数', '状态', '任务数'].map(h => ({ text: h, options: { bold: true, color: TEXT_WHITE, fill: { color: BG_BLUE }, fontSize: 9, align: 'center' } }))];
const maxLen = Math.min(sysSlice.length, statusSlice.length);
for (let i = 0; i < maxLen; i++) {
    const s1 = sysSlice[i] || { name: '', count: '' };
    const s2 = statusSlice[i] || { name: '', count: '' };
    sumTableData.push([
        { text: s1.name, options: { fontSize: 9, align: 'center' } },
        { text: s1.count.toString(), options: { fontSize: 9, align: 'center' } },
        { text: s2.name, options: { fontSize: 9, align: 'center' } },
        { text: s2.count.toString(), options: { fontSize: 9, align: 'center' } },
    ]);
}

slide5.addTable(sumTableData, {
    x: 0.8, y: 5.5, w: 11.73,
    fontSize: 9,
    border: { type: 'solid', color: 'E2E8F0', pt: 0.5 },
    colW: [3.0, 1.5, 4.5, 1.5],
    margin: 3,
    rowH: [0.3],
});

// ===== 保存PPT =====
const outDir = scriptDir;
const pptxPath = path.join(outDir, `SDC数字化需求任务统计报告_${today}${ver_tag}.pptx`);

pptx.writeFile({ fileName: pptxPath }).then(() => {
    console.log(`PPT已生成: ${pptxPath}`);
}).catch(err => {
    console.error('生成PPT失败:', err);
    process.exit(1);
});