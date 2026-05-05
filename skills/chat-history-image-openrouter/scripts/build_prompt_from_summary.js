#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function help(exitCode = 0) {
  process.stdout.write(`usage: build_prompt_from_summary.js (--summary-text TEXT | --summary-file FILE) [--size SIZE]

Build a final Chinese-first image prompt from a chat summary.

Options:
  --summary-text TEXT   Inline summary text
  --summary-file FILE   Path to a summary text file
  --size SIZE           Optional target size such as 1024x1024 or 1536x1024
  -h, --help            Show help
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    summaryText: null,
    summaryFile: null,
    size: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) fail(`Missing value for ${a}`);
      return argv[++i];
    };

    if (a === '-h' || a === '--help') help(0);
    else if (a === '--summary-text') args.summaryText = next();
    else if (a === '--summary-file') args.summaryFile = next();
    else if (a === '--size') args.size = next();
    else fail(`Unknown argument: ${a}`);
  }

  if (!args.summaryText && !args.summaryFile) fail('Provide --summary-text or --summary-file');
  return args;
}

function readSummary(args) {
  if (args.summaryText) return args.summaryText.trim();
  const abs = path.resolve(args.summaryFile);
  if (!fs.existsSync(abs)) fail(`Summary file not found: ${abs}`);
  return fs.readFileSync(abs, 'utf8').trim();
}

function clean(value) {
  return String(value || '')
    .replace(/\r/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[：:;；,\-，\s]+/, '')
    .replace(/[：:;；,，\s]+$/, '')
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FIELD_GROUPS = [
  ['goal', ['目标', '用途']],
  ['subject', ['主体', '角色', '人物', '产品']],
  ['action', ['动作', '姿态']],
  ['scene', ['场景', '环境', '背景']],
  ['composition', ['构图', '景别', '视角']],
  ['style', ['风格', '质感']],
  ['lighting', ['光线', '灯光']],
  ['color', ['色彩', '配色']],
  ['material', ['材质']],
  ['camera', ['镜头', '相机']],
  ['size', ['画幅', '尺寸', '比例']],
  ['textInImage', ['文字', '文案', '标题']],
  ['constraints', ['约束', '限制', '要求']],
  ['avoid', ['避免', '不要']],
];

function extractField(text, labels) {
  const allLabels = FIELD_GROUPS.flatMap(([, group]) => group);
  const stopPattern = allLabels.map(escapeRegExp).join('|');

  for (const label of labels) {
    const pattern = new RegExp(`${escapeRegExp(label)}\\s*[：:]\\s*([\\s\\S]*?)(?=(?:${stopPattern})\\s*[：:]|$)`, 'i');
    const match = text.match(pattern);
    if (match && clean(match[1])) return clean(match[1]);
  }
  return '';
}

function extractParts(text) {
  return {
    goal: extractField(text, ['目标', '用途']),
    subject: extractField(text, ['主体', '角色', '人物', '产品']),
    action: extractField(text, ['动作', '姿态']),
    scene: extractField(text, ['场景', '环境', '背景']),
    composition: extractField(text, ['构图', '景别', '视角']),
    style: extractField(text, ['风格', '质感']),
    lighting: extractField(text, ['光线', '灯光']),
    color: extractField(text, ['色彩', '配色']),
    material: extractField(text, ['材质']),
    camera: extractField(text, ['镜头', '相机']),
    size: extractField(text, ['画幅', '尺寸', '比例']),
    textInImage: extractField(text, ['文字', '文案', '标题']),
    constraints: extractField(text, ['约束', '限制', '要求']),
    avoid: extractField(text, ['避免', '不要']),
  };
}

function buildPrompt(parts, overrideSize) {
  const clauses = [];

  if (parts.goal) clauses.push(`目标是${parts.goal}`);
  if (parts.subject) clauses.push(`主体为${parts.subject}`);
  if (parts.action) clauses.push(parts.action);
  if (parts.scene) clauses.push(`场景为${parts.scene}`);
  if (parts.composition) clauses.push(`构图与景别为${parts.composition}`);
  if (parts.style) clauses.push(`整体风格为${parts.style}`);
  if (parts.lighting) clauses.push(`光线表现为${parts.lighting}`);
  if (parts.color) clauses.push(`色彩与配色为${parts.color}`);
  if (parts.material) clauses.push(`材质细节为${parts.material}`);
  if (parts.camera) clauses.push(`镜头或视角为${parts.camera}`);
  if (overrideSize) clauses.push(`画幅尺寸倾向为${overrideSize}`);
  else if (parts.size) clauses.push(`画幅尺寸倾向为${parts.size}`);
  if (parts.textInImage) clauses.push(`画面内文字为${parts.textInImage}`);
  if (parts.constraints) clauses.push(`必须满足${parts.constraints}`);
  if (parts.avoid) clauses.push(`避免${parts.avoid}`);
  clauses.push('画面完整、细节准确、主体清晰、不要无关元素');

  return clauses.join('，');
}

function buildPromptFromArgs(args) {
  const text = readSummary(args);
  const parts = extractParts(text);
  return buildPrompt(parts, args.size);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  process.stdout.write(`${buildPromptFromArgs(args)}\n`);
}

module.exports = {
  parseArgs,
  readSummary,
  extractParts,
  buildPrompt,
  buildPromptFromArgs,
};
