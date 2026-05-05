#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const promptBuilder = require('./build_prompt_from_summary.js');

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function help(exitCode = 0) {
  process.stdout.write(`usage: summary_to_image.js (--summary-text TEXT | --summary-file FILE) [image options]

Build a final prompt from a chat summary and generate an image in one command.

Required:
  --summary-text TEXT   Inline summary text
  --summary-file FILE   Path to a summary text file

Image options:
  -f, --filename FILE            Output file path
  -s, --size SIZE                Size, e.g. 1024x1024, 1536x1024, 2048x1152
  -q, --quality VALUE            auto, low, medium, high
  -o, --output-format FORMAT     png, jpeg, webp
  -i, --input-image FILE...      Input image(s) for edit mode
      --model MODEL              Override IMAGE_MODEL
      --base-url URL             Override IMAGE_API_BASE_URL
      --provider NAME            openrouter or openai-compatible
      --timeout-ms N             Request timeout in milliseconds
      --print-only               Print the built prompt without generating
  -h, --help                     Show help
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    summaryText: null,
    summaryFile: null,
    passthrough: [],
    printOnly: false,
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
    else if (a === '--print-only') args.printOnly = true;
    else if (a === '-i' || a === '--input-image') {
      args.passthrough.push(a);
      while (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        args.passthrough.push(argv[++i]);
      }
      if (args.passthrough[args.passthrough.length - 1] === a) {
        fail(`Missing value for ${a}`);
      }
    } else {
      args.passthrough.push(a);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        args.passthrough.push(argv[++i]);
      }
    }
  }

  if (!args.summaryText && !args.summaryFile) {
    fail('Provide --summary-text or --summary-file');
  }
  return args;
}

function resolveSummaryArgs(args) {
  if (args.summaryText) return ['--summary-text', args.summaryText];
  const abs = path.resolve(args.summaryFile);
  if (!fs.existsSync(abs)) fail(`Summary file not found: ${abs}`);
  return ['--summary-file', abs];
}

function scriptDir() {
  return __dirname;
}

function buildPrompt(args) {
  const sizeIndexLong = args.passthrough.indexOf('--size');
  const sizeIndexShort = args.passthrough.indexOf('-s');
  const sizeIndex = sizeIndexLong >= 0 ? sizeIndexLong : sizeIndexShort;
  const size = sizeIndex >= 0 && args.passthrough[sizeIndex + 1] ? args.passthrough[sizeIndex + 1] : null;
  return promptBuilder.buildPromptFromArgs({
    summaryText: args.summaryText,
    summaryFile: args.summaryFile,
    size,
  });
}

function generateImage(prompt, args) {
  const generator = path.join(scriptDir(), 'generate_from_chat_history.js');
  process.argv = ['node', generator, '-p', prompt, ...args.passthrough];
  require(generator);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const prompt = buildPrompt(args);

  process.stdout.write('Final prompt:\n');
  process.stdout.write(`${prompt}\n\n`);

  if (args.printOnly) return;
  generateImage(prompt, args);
}

main();
