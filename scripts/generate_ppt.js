const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const dataPath = path.join(cwd, '.ppt_data.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

const { today, ver_tag, file_prefix, total_tasks, sys_stats, status_stats, priority_stats, priority_tasks,
        all_tasks, month_range, week_range, month_new, month_done, week_new, week_done } = data;

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'SDC数字化团队';

// ===== 颜色常量 =====
const CLR_PRIMARY = '4472C4';
const CLR_HEADER_BG = '4472C4';
const CLR_HEADER_TEXT = 'FFFFFF';
const CLR_DARK = '333333';
const CLR_LIGHT = 'F2F2F2';
const CLR_ACCENT = 'ED7D31';

const STATUS_COLORS = {
    '已发布': '10B981',
    '已关闭': '64748B',
    '待开发': '8B5CF6',
    '开发中': '2563EB',
    '审核中': 'D97706',
    '补充需求': 'EF4444',
    '暂停跟进': '94A3B8',
};

const PRIORITY_COLORS = {
    'P0': 'DC2626',
    'P1': 'EA580C',
    'P2': '2563EB',
    'P3': '16A34A',
    'P4': '6B7280',
    '(未设)': '9CA3AF',
};

const PIE_COLORS = ['4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47', '264478', '9B59B6'];

// ===== 第1页：封面 =====
let slide1 = pptx.addSlide();
slide1.background = { color: CLR_PRIMARY };
slide1.addText('SDC数字化需求任务统计报告', {
    x: 0.5, y: 1.5, w: 12.3, h: 1.2,
    fontSize: 32, fontFace: 'Microsoft YaHei', color: 'FFFFFF', bold: true, align: 'center',
});
slide1.addText(`数据日期：${today}`, {
    x: 0.5, y: 2.8, w: 12.3, h: 0.6,
    fontSize: 18, fontFace: 'Microsoft YaHei', color: 'FFFFFF', align: 'center',
});
slide1.addText(`共 ${total_tasks} 项未发布任务`, {
    x: 0.5, y: 3.5, w: 12.3, h: 0.6,
    fontSize: 16, fontFace: 'Microsoft YaHei', color: 'FFFFFF', align: 'center',
});
slide1.addText('SDC Digital Needs Task Report', {
    x: 0.5, y: 5.0, w: 12.3, h: 0.5,
    fontSize: 12, fontFace: 'Microsoft YaHei', color: 'D0D0D0', align: 'center', italic: true,
});

// ===== 第2页：按系统分布（饼图） =====
let slide2 = pptx.addSlide();
slide2.addText('按系统分布', {
    x: 0.3, y: 0.2, w: 12.7, h: 0.7,
    fontSize: 24, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
});

let sysPieChartData = [{
    name: '按系统',
    labels: sys_stats.map(s => s.name),
    values: sys_stats.map(s => s.count),
}];
slide2.addChart(pptx.ChartType.pie, sysPieChartData, {
    x: 0.5, y: 1.0, w: 6.5, h: 5.0,
    showTitle: false,
    showLegend: true,
    legendPos: 'b',
    legendFontSize: 10,
    showPercent: true,
    showValue: false,
    dataLabelFontSize: 9,
    chartColors: PIE_COLORS.slice(0, sys_stats.length),
});

let sysTableRows = [
    [
        { text: '系统', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
        { text: '任务数', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
        { text: '占比', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
    ],
];
for (let s of sys_stats) {
    sysTableRows.push([
        { text: s.name, options: { fontSize: 10, align: 'center' } },
        { text: String(s.count), options: { fontSize: 10, align: 'center' } },
        { text: s.pct, options: { fontSize: 10, align: 'center' } },
    ]);
}
sysTableRows.push([
    { text: '合计', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: String(total_tasks), options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 10, align: 'center' } },
]);
slide2.addTable(sysTableRows, {
    x: 7.5, y: 1.2, w: 5.0, colW: [2.0, 1.5, 1.5],
    border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
    rowH: 0.4,
});

// ===== 第3页：按状态分布（饼图） =====
let slide3 = pptx.addSlide();
slide3.addText('按状态分布', {
    x: 0.3, y: 0.2, w: 12.7, h: 0.7,
    fontSize: 24, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
});

let statusPieChartData = [{
    name: '按状态',
    labels: status_stats.map(s => s.name),
    values: status_stats.map(s => s.count),
}];
slide3.addChart(pptx.ChartType.pie, statusPieChartData, {
    x: 0.5, y: 1.0, w: 6.5, h: 5.0,
    showTitle: false,
    showLegend: true,
    legendPos: 'b',
    legendFontSize: 10,
    showPercent: true,
    showValue: false,
    dataLabelFontSize: 9,
    chartColors: PIE_COLORS.slice(0, status_stats.length),
});

let statusTableRows = [
    [
        { text: '状态', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
        { text: '任务数', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
        { text: '占比', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 11 } },
    ],
];
for (let s of status_stats) {
    let clr = STATUS_COLORS[s.name] || CLR_DARK;
    statusTableRows.push([
        { text: s.name, options: { fontSize: 10, color: clr, bold: true, align: 'center' } },
        { text: String(s.count), options: { fontSize: 10, align: 'center' } },
        { text: s.pct, options: { fontSize: 10, align: 'center' } },
    ]);
}
statusTableRows.push([
    { text: '合计', options: { bold: true, fontSize: 10, align: 'center' } },
    { text: String(total_tasks), options: { bold: true, fontSize: 10, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 10, align: 'center' } },
]);
slide3.addTable(statusTableRows, {
    x: 7.5, y: 1.2, w: 5.0, colW: [2.0, 1.5, 1.5],
    border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
    rowH: 0.4,
});

// ===== 第4页：优先级分析 =====
const PRIORITY_BAR_COLORS = priority_stats.map(s => PRIORITY_COLORS[s.name] || '4472C4');

let slide4 = pptx.addSlide();
slide4.addText('优先级分布分析', {
    x: 0.3, y: 0.2, w: 12.7, h: 0.7,
    fontSize: 24, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
});

let priBarData = [{
    name: '任务数',
    labels: priority_stats.map(s => s.name),
    values: priority_stats.map(s => s.count),
}];
slide4.addChart(pptx.ChartType.bar, priBarData, {
    x: 0.3, y: 1.0, w: 6.0, h: 5.5,
    barDir: 'bar',
    showTitle: false,
    showLegend: false,
    showValue: true,
    dataLabelFontSize: 11,
    dataLabelColor: '333333',
    chartColors: PRIORITY_BAR_COLORS,
    catAxisLabelFontSize: 12,
    catAxisLabelColor: '333333',
    valAxisHidden: true,
    catGridLine: { style: 'none' },
    valGridLine: { style: 'none' },
});

let priTableRows = [
    [
        { text: '优先级', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: '4F46E5' }, align: 'center', fontSize: 11 } },
        { text: '任务数', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: '4F46E5' }, align: 'center', fontSize: 11 } },
        { text: '占比', options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: '4F46E5' }, align: 'center', fontSize: 11 } },
    ],
];
for (let s of priority_stats) {
    let clr = PRIORITY_COLORS[s.name] || CLR_DARK;
    priTableRows.push([
        { text: s.name, options: { fontSize: 11, color: clr, bold: true, align: 'center' } },
        { text: String(s.count), options: { fontSize: 11, align: 'center' } },
        { text: s.pct, options: { fontSize: 11, align: 'center' } },
    ]);
}
priTableRows.push([
    { text: '合计', options: { bold: true, fontSize: 11, align: 'center' } },
    { text: String(total_tasks), options: { bold: true, fontSize: 11, align: 'center' } },
    { text: '100%', options: { bold: true, fontSize: 11, align: 'center' } },
]);
slide4.addTable(priTableRows, {
    x: 7.0, y: 1.0, w: 5.7, colW: [1.8, 1.8, 1.8],
    border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
    rowH: 0.38,
});

slide4.addText('优先级说明：P0=最高紧急 → P4=最低紧急 | (未设)=未指定优先级', {
    x: 0.3, y: 6.8, w: 12.7, h: 0.3,
    fontSize: 9, fontFace: 'Microsoft YaHei', color: '888888', align: 'left',
});

// ===== 第5页：周期分析总览 =====
let slide5 = pptx.addSlide();
slide5.addText('周期分析总览', {
    x: 0.3, y: 0.2, w: 12.7, h: 0.7,
    fontSize: 24, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
});
slide5.addText(`当月：${month_range}  |  本周：${week_range}`, {
    x: 0.3, y: 0.75, w: 12.7, h: 0.35,
    fontSize: 11, fontFace: 'Microsoft YaHei', color: '888888', align: 'left',
});

const kpiData = [
    { label: '当月新增', count: month_new.count, color: '2563EB', bg: 'EFF6FF' },
    { label: '当月完结', count: month_done.count, color: '16A34A', bg: 'F0FDF4' },
    { label: '本周新增', count: week_new.count, color: 'D97706', bg: 'FFFBEB' },
    { label: '本周完结', count: week_done.count, color: '9333EA', bg: 'FAF5FF' },
];

const cardW = 5.5, cardH = 2.3;
const cardPositions = [
    { x: 0.5, y: 1.3 },
    { x: 7.0, y: 1.3 },
    { x: 0.5, y: 4.0 },
    { x: 7.0, y: 4.0 },
];

for (let i = 0; i < kpiData.length; i++) {
    const k = kpiData[i];
    const pos = cardPositions[i];
    slide5.addShape(pptx.ShapeType.rect, {
        x: pos.x, y: pos.y, w: cardW, h: cardH,
        fill: { color: k.bg },
        line: { color: k.color, pt: 1.5 },
        rectRadius: 0.1,
    });
    slide5.addText(String(k.count), {
        x: pos.x, y: pos.y + 0.3, w: cardW, h: 1.3,
        fontSize: 56, fontFace: 'Microsoft YaHei', bold: true,
        color: k.color, align: 'center', valign: 'middle',
    });
    slide5.addText(k.label, {
        x: pos.x, y: pos.y + 1.7, w: cardW, h: 0.4,
        fontSize: 16, fontFace: 'Microsoft YaHei',
        color: k.color, align: 'center', valign: 'top',
    });
}

// ===== 周期任务清单 =====
const PAGE_SIZE = 15;
const colWidths = [0.55, 1.15, 5.3, 1.2, 1.4, 0.9, 1.3];
const headerTexts = ['序号', '系统', '概要', '创建日期', '交付日', '报告人', '状态'];

function makeHeaderRow() {
    return headerTexts.map(h => ({
        text: h,
        options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: CLR_HEADER_BG }, align: 'center', fontSize: 8 },
    }));
}

function makeDataRow(idx, row) {
    let statusColor = STATUS_COLORS[row[5]] || CLR_DARK;
    return [
        { text: String(idx), options: { fontSize: 7, align: 'center' } },
        { text: row[0], options: { fontSize: 7, align: 'center' } },
        { text: row[1], options: { fontSize: 7, align: 'left' } },
        { text: row[2], options: { fontSize: 7, align: 'center' } },
        { text: row[3], options: { fontSize: 7, align: 'center' } },
        { text: row[4], options: { fontSize: 7, align: 'center' } },
        { text: row[5], options: { fontSize: 7, color: statusColor, bold: true, align: 'center' } },
    ];
}

function addTaskListSlides(sectionTitle, taskList) {
    if (!taskList || taskList.length === 0) return;
    const totalPages = Math.ceil(taskList.length / PAGE_SIZE);
    for (let page = 0; page < totalPages; page++) {
        let slide = pptx.addSlide();
        let startIdx = page * PAGE_SIZE;
        let endIdx = Math.min(startIdx + PAGE_SIZE, taskList.length);
        let pageItems = taskList.slice(startIdx, endIdx);

        slide.addText(`${sectionTitle}（第 ${page + 1}/${totalPages} 页）`, {
            x: 0.3, y: 0.1, w: 12.7, h: 0.5,
            fontSize: 16, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
        });

        let tableRows = [makeHeaderRow()];
        for (let i = 0; i < pageItems.length; i++) {
            tableRows.push(makeDataRow(startIdx + i + 1, pageItems[i]));
        }

        slide.addTable(tableRows, {
            x: 0.3, y: 0.65, w: 12.7,
            colW: colWidths,
            border: { type: 'solid', pt: 0.5, color: 'BBBBBB' },
            rowH: 0.33,
            autoPage: false,
        });

        slide.addText(`${today} | ${sectionTitle} | V${ver_tag.replace('.V', '')}`, {
            x: 0.3, y: 7.1, w: 12.7, h: 0.3,
            fontSize: 8, fontFace: 'Microsoft YaHei', color: '999999', align: 'right',
        });
    }
}

addTaskListSlides('当月新增任务', month_new.tasks);
addTaskListSlides('当月完结任务', month_done.tasks);
addTaskListSlides('本周新增任务', week_new.tasks);
addTaskListSlides('本周完结任务', week_done.tasks);

// ===== 优先级任务清单（7列）=====
const PAGE_SIZE_P = 15;
const priColWidths = [0.7, 0.8, 5.0, 1.2, 1.3, 1.0, 1.2];
const priHeaderTexts = ['优先级', '序号', '概要', '创建日期', '交付日', '报告人', '状态'];

function makePriHeaderRow() {
    return priHeaderTexts.map(h => ({
        text: h,
        options: { bold: true, color: CLR_HEADER_TEXT, fill: { color: '4F46E5' }, align: 'center', fontSize: 8 },
    }));
}

function makePriDataRow(idx, row) {
    let priColor = PRIORITY_COLORS[row[0]] || CLR_DARK;
    let statusColor = STATUS_COLORS[row[6]] || CLR_DARK;
    return [
        { text: row[0], options: { fontSize: 7, color: priColor, bold: true, align: 'center' } },
        { text: String(idx), options: { fontSize: 7, align: 'center' } },
        { text: row[2], options: { fontSize: 7, align: 'left' } },
        { text: row[3], options: { fontSize: 7, align: 'center' } },
        { text: row[4], options: { fontSize: 7, align: 'center' } },
        { text: row[5], options: { fontSize: 7, align: 'center' } },
        { text: row[6], options: { fontSize: 7, color: statusColor, bold: true, align: 'center' } },
    ];
}

if (priority_tasks && priority_tasks.length > 0) {
    const totalPriPages = Math.ceil(priority_tasks.length / PAGE_SIZE_P);
    for (let page = 0; page < totalPriPages; page++) {
        let slide = pptx.addSlide();
        let startIdx = page * PAGE_SIZE_P;
        let endIdx = Math.min(startIdx + PAGE_SIZE_P, priority_tasks.length);
        let pageItems = priority_tasks.slice(startIdx, endIdx);

        slide.addText(`按优先级任务清单（第 ${page + 1}/${totalPriPages} 页）`, {
            x: 0.3, y: 0.1, w: 12.7, h: 0.5,
            fontSize: 16, fontFace: 'Microsoft YaHei', color: CLR_DARK, bold: true,
        });

        let tableRows = [makePriHeaderRow()];
        for (let i = 0; i < pageItems.length; i++) {
            tableRows.push(makePriDataRow(startIdx + i + 1, pageItems[i]));
        }

        slide.addTable(tableRows, {
            x: 0.3, y: 0.65, w: 12.7,
            colW: priColWidths,
            border: { type: 'solid', pt: 0.5, color: 'BBBBBB' },
            rowH: 0.33,
            autoPage: false,
        });

        slide.addText(`${today} | 按优先级任务清单 | V${ver_tag.replace('.V', '')}`, {
            x: 0.3, y: 7.1, w: 12.7, h: 0.3,
            fontSize: 8, fontFace: 'Microsoft YaHei', color: '999999', align: 'right',
        });
    }
}

// ===== 全部任务清单 =====
addTaskListSlides('全部任务清单', all_tasks);

// ===== 保存 =====
const outputPath = path.join(cwd, `${file_prefix}${ver_tag}.pptx`);
pptx.writeFile({ fileName: outputPath }).then(() => {
    console.log(`PPT已生成: ${outputPath}`);
}).catch(err => {
    console.error('生成PPT失败:', err);
    process.exit(1);
});
