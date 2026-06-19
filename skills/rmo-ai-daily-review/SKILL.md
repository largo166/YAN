---
name: rmo-ai-daily-review
description: Daily Rmo-Ai workspace review and safe GitHub archive workflow. Use when asked to review local Rmo-Ai progress, summarize chats/files/meeting notes, extract reusable workflows, propose skill candidates, identify local follow-up items, or prepare a privacy-safe daily archive for GitHub.
---

# Rmo-Ai Daily Review

## Workflow

1. Scope the workspace before summarizing.
   - Prefer `C:\Rmomo-Ai` as the root when present.
   - Identify Git repositories with `.git` directories.
   - Treat `C:\Rmomo-Ai\publish\YAN` as the default GitHub archive repository when it exists.
   - Do not assume every project folder has its own remote.

2. Collect only safe, relevant signals.
   - Check recently modified files, README files, docs, source directories, generated reports, meeting summaries, and existing skill folders.
   - Prefer summaries, metadata, and user-approved exports over raw private chat logs.
   - Do not archive credentials, `.env`, databases, raw chat databases, private attachments, dependency folders, build caches, or large generated artifacts unless the user explicitly requests them.

3. Produce a daily report.
   - Project成果: list visible Rmo-Ai, proposal-report assistant, invoice assistant, image assistant, and related skill/workflow progress.
   - 可复用 workflow: describe repeatable procedures in concise steps.
   - 结论归纳: separate confirmed conclusions from assumptions.
   - Skill候选: list candidates, why they are reusable, and whether a draft skill was created.
   - 本地待处理事项: list setup, GitHub, privacy, data access, and product tasks.
   - Rmo-Ai并入候选: call out items suitable for productization and questions requiring user confirmation.

4. Extract skills conservatively.
   - Create or update a skill only when the workflow is repeatable and useful beyond one day.
   - Keep `SKILL.md` lean and procedural.
   - Avoid embedding private examples or sensitive paths unless needed for the local workflow.

5. Archive and upload.
   - Write daily reports under the archive repository, for example `daily-reviews/YYYY-MM-DD.md`.
   - Put reusable skills under `skills/<skill-name>/`.
   - Run `git status` before committing.
   - Commit only relevant archive/skill changes.
   - Push only when a GitHub remote exists and credentials/network allow it.
   - If push fails, leave the commit local and report the exact blocker.

## Output Style

- Keep the final user-facing summary short and action-oriented.
- Clearly mark:
  - 已完成
  - 需要确认
  - 被权限或数据访问阻塞
  - 建议并入 Rmo-Ai 的内容

## Privacy Rules

- Do not upload raw chat logs, raw meeting transcripts, or raw WeChat databases by default.
- Summarize private sources at the level of decisions, workflows, and action items.
- When in doubt, ask for confirmation before archiving source material.
