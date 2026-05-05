# YAN

Shared local skills and image-generation workflows for agent use.

## Included Skill

### `chat-history-image-openrouter`

Path:

`skills/chat-history-image-openrouter`

This skill turns prior conversation context or a structured requirement summary into a final image prompt, then generates or edits an image through OpenRouter.

It is designed to be reusable across different local agents:

- Codex
- Claude
- Hermes

The workflow is local-command based rather than agent-specific, so any agent that can run Node.js commands in a terminal can reuse it.

## Why This Skill Was Built

This skill was derived from a repeated real workflow:

1. Start from fragmented natural-language conversation instead of a polished image prompt.
2. Extract visual requirements such as subject, scene, composition, style, lighting, material, text, and hard constraints.
3. Convert those requirements into a final Chinese-first prompt suitable for image generation.
4. Send the final prompt to OpenRouter using an image-capable model.
5. Fall back to a region-available model when some providers or models are blocked by regional availability.

The implementation evolved through practical iteration:

1. A prompt-only image wrapper was created first.
2. A summary-to-prompt helper script was added so users did not need to manually rewrite scattered requirements.
3. A one-command summary-to-image script was added to reduce operator friction.
4. OpenRouter compatibility was improved for image-only models such as `black-forest-labs/flux.2-flex`.
5. The workflow was rewritten to be agent-agnostic so it can be called by Codex, Claude, or Hermes.

## Core Files

- `skills/chat-history-image-openrouter/SKILL.md`
- `skills/chat-history-image-openrouter/scripts/build_prompt_from_summary.js`
- `skills/chat-history-image-openrouter/scripts/summary_to_image.js`
- `skills/chat-history-image-openrouter/scripts/generate_from_chat_history.js`
- `skills/chat-history-image-openrouter/references/prompt-template.md`

## Local Usage

### 1. Prompt directly to image

```powershell
node "skills/chat-history-image-openrouter/scripts/generate_from_chat_history.js" `
  --model "black-forest-labs/flux.2-flex" `
  -p "山地现代主义公共建筑，粗犷木结构与玻璃幕墙结合的礼拜堂/社区中心，专业建筑摄影，8K超高清，虚幻引擎5渲染质感，电影级夜景构图，荒野中的精神性建筑美学。建筑体量克制而庄重，山地地形自然起伏，室内暖光透过玻璃幕墙向外溢出，木结构节点清晰，材料真实，氛围具有宗教性与公共性，前景与背景干净，整体达到专业建筑可视化竞赛级效果图水准。" `
  -f "C:\Users\yz_ya\Pictures\image-gen\mountain-modernist-chapel.png" `
  -s "1536x1024" `
  -q "high"
```

### 2. Summary to prompt

```powershell
node "skills/chat-history-image-openrouter/scripts/build_prompt_from_summary.js" `
  --summary-file "C:\Users\yz_ya\Documents\image-summary.txt" `
  --size "1536x1024"
```

### 3. Summary directly to image

```powershell
node "skills/chat-history-image-openrouter/scripts/summary_to_image.js" `
  --summary-file "C:\Users\yz_ya\Documents\image-summary.txt" `
  -f "C:\Users\yz_ya\Pictures\image-gen\result.png" `
  -s "1536x1024" `
  -q "high"
```

## Environment Variables

Use these in PowerShell:

```powershell
$env:OPENROUTER_API_KEY="your-openrouter-key"
$env:IMAGE_API_BASE_URL="https://openrouter.ai/api/v1"
$env:IMAGE_API_PROVIDER="openrouter"
$env:IMAGE_MODEL="black-forest-labs/flux.2-flex"
$env:OPENROUTER_SITE_URL="https://localhost"
$env:OPENROUTER_APP_NAME="Shared local image skill"
```

## Generated Image Example

Example output:

`examples/mountain-modernist-chapel.png`

This example was generated from the following architectural prompt direction:

- Mountain modernist public architecture
- A chapel / community center combining rugged timber structure and glass curtain walls
- Professional architectural photography
- Ultra-high-detail rendering feel
- Unreal Engine 5 style material realism
- Cinematic night composition
- Spiritual wilderness architecture

## Visual Result Notes

The generated image demonstrates these target qualities:

- A restrained and monumental architectural massing
- A believable mountain-site relationship
- Warm interior light glowing through large glass surfaces
- Clear timber structural expression
- Clean foreground and background separation
- A competition-grade architectural visualization mood

## Repository Contents

- `skills/`: reusable local skills
- `examples/`: generated image examples from the workflows
