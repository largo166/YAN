---
name: chat-history-image-openrouter
description: 根据之前的对话或需求摘要，自动整理最终生图提示词，并通过 OpenRouter 生成或编辑图片。适用于 Codex、Claude、Hermes 等代理在本地命令行环境中复用同一套中文优先的图片工作流：从聊天上下文提炼主体、场景、构图、风格、光线、文字要求与限制条件，再调用 OpenRouter 图片模型出图。
---

# Chat History Image OpenRouter

这个 skill 设计成“代理无关”的本地工作流。

- 对 Codex：放在 `C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter` 后可以被自动发现。
- 对 Claude、Hermes：它们不需要理解 skill 元数据，只需要直接调用这里的脚本即可。
- 对任何代理：只要能在本机终端运行 `node`，并且环境变量里已有 OpenRouter key，就能复用同一套命令。

## 适用场景

在这些情况下使用这个 skill：

1. 用户不想手写完整 prompt，而是希望根据之前对话自动整理视觉需求。
2. 需要中文优先的提示词工作流。
3. 需要把“摘要转 prompt”和“prompt 直接出图”统一成一套稳定的本地命令。
4. 需要多个代理共享同一套 OpenRouter 图片生成流程。

## 环境变量

在 PowerShell 里先设置：

```powershell
$env:OPENROUTER_API_KEY="your-openrouter-key"
$env:IMAGE_API_BASE_URL="https://openrouter.ai/api/v1"
$env:IMAGE_API_PROVIDER="openrouter"
$env:IMAGE_MODEL="black-forest-labs/flux.2-flex"
$env:OPENROUTER_SITE_URL="https://localhost"
$env:OPENROUTER_APP_NAME="Shared local image skill"
```

说明：

- 默认模型建议使用 `black-forest-labs/flux.2-flex`，因为它已经在当前环境里验证可用。
- 如果代理要临时切换模型，可以在命令里加 `--model ...` 覆盖。
- 不要打印 API key 本身；如果只想确认是否存在，只输出长度。

```powershell
$env:OPENROUTER_API_KEY.Length
```

## 工作流一：摘要转最终 Prompt

如果你手里已经有一段需求摘要，先用这个脚本整理出最终中文 prompt：

```powershell
node "C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter\scripts\build_prompt_from_summary.js" `
  --summary-text "目标：做一张年轻女性创始人的杂志封面人像；主体：30岁左右亚洲女性；场景：奶油色摄影棚背景；构图：半身正面，直视镜头；风格：高级时尚杂志封面，轻微胶片颗粒；光线：柔和日光棚拍；色彩：奶油色、浅棕色、暖白；文字：无；约束：不要夸张妆容，不要过度磨皮；避免：水印、畸形手指、背景杂物" `
  --size "1536x1024"
```

也可以从文本文件读取摘要：

```powershell
node "C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter\scripts\build_prompt_from_summary.js" `
  --summary-file "C:\Users\yz_ya\Documents\image-summary.txt" `
  --size "1536x1024"
```

## 工作流二：直接用 Prompt 出图

如果你已经有完整 prompt，直接调用：

```powershell
node "C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter\scripts\generate_from_chat_history.js" `
  --model "black-forest-labs/flux.2-flex" `
  -p "山地现代主义公共建筑，粗犷木结构与玻璃幕墙结合的礼拜堂/社区中心，专业建筑摄影，8K超高清，虚幻引擎5渲染质感，电影级夜景构图，荒野中的精神性建筑美学。" `
  -f "C:\Users\yz_ya\Pictures\image-gen\mountain-modernist-chapel.png" `
  -s "1536x1024" `
  -q "high"
```

## 工作流三：摘要转 Prompt 并直接出图

如果想一步完成：

```powershell
node "C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter\scripts\summary_to_image.js" `
  --summary-text "目标：生成专业建筑效果图；主体：山地现代主义公共建筑，礼拜堂/社区中心；场景：荒野山地环境；构图：电影级夜景构图，建筑主体清晰；风格：粗犷木结构与玻璃幕墙结合，虚幻引擎5渲染质感，专业建筑摄影；光线：夜景氛围光，室内暖光透出；色彩：深色山体、木材暖色、玻璃冷反射；约束：建筑比例合理，结构清晰，材质真实；避免：低清晰度、结构错误、杂乱前景" `
  -f "C:\Users\yz_ya\Pictures\image-gen\mountain-modernist-chapel.png" `
  -s "1536x1024" `
  -q "high"
```

如果只想看最终 prompt，不立刻出图：

```powershell
node "C:\Users\yz_ya\.codex\skills\chat-history-image-openrouter\scripts\summary_to_image.js" `
  --summary-file "C:\Users\yz_ya\Documents\image-summary.txt" `
  --size "1536x1024" `
  --print-only
```

## 给代理的执行规则

任何代理在使用这个 skill 时，都遵守这些规则：

1. 先判断用户给的是“完整 prompt”还是“需求摘要”。
2. 如果是摘要，优先走 `build_prompt_from_summary.js` 或 `summary_to_image.js`。
3. 如果是完整 prompt，直接走 `generate_from_chat_history.js`。
4. 默认优先使用当前已验证可用的 `black-forest-labs/flux.2-flex`。
5. 如果模型报区域不可用，切换到另一个 OpenRouter 图片模型，不要卡在原模型上。
6. 输出路径尽量使用绝对路径。

## 资源

- [`scripts/build_prompt_from_summary.js`](scripts/build_prompt_from_summary.js)：把需求摘要整理成最终中文 prompt。
- [`scripts/summary_to_image.js`](scripts/summary_to_image.js)：摘要转 prompt 并直接出图。
- [`scripts/generate_from_chat_history.js`](scripts/generate_from_chat_history.js)：给定最终 prompt 后直接出图。
- [`references/prompt-template.md`](references/prompt-template.md)：摘要字段模板。
