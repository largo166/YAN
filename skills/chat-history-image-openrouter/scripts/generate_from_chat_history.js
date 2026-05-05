#!/usr/bin/env node

process.env.IMAGE_API_PROVIDER = process.env.IMAGE_API_PROVIDER || 'openrouter';
process.env.IMAGE_API_BASE_URL = process.env.IMAGE_API_BASE_URL || 'https://openrouter.ai/api/v1';
process.env.IMAGE_MODEL = process.env.IMAGE_MODEL || 'openai/gpt-5.4-image-2';
process.env.OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://localhost';
process.env.OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'Codex chat-history image skill';

require('C:/Users/yz_ya/.codex/skills/openai-compatible-image-gen/scripts/generate_image.js');
