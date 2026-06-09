import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Brain, FolderOpen, Loader2, Search, Send, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import {
  askKnowledge,
  clearKnowledge,
  getKnowledgeStats,
  indexVaultKnowledge,
  uploadKnowledgeFiles,
  type KnowledgeStats,
  type KnowledgeUploadFile,
} from '../lib/projectsApi';

const DEFAULT_VAULT = 'C:\\Users\\yz_ya\\Documents\\Obsidian Vault';
const MAX_BROWSER_FILES = 360;
const MAX_BROWSER_TOTAL_BYTES = 120 * 1024 * 1024;
const MAX_BROWSER_FILE_BYTES = 25 * 1024 * 1024;
const SUPPORTED_EXTS = new Set(['.md', '.txt', '.pdf', '.docx', '.xlsx', '.csv', '.pptx']);
const SKIP_DIRS = new Set(['.obsidian', '.git', 'node_modules', 'dist', 'build', '.trash', '.playwright-mcp']);

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: Array<{ file_name: string; file_path: string; quote: string }>;
};

type UploadCandidate = {
  file: File;
  relativePath: string;
};

type SelectionState = {
  files: UploadCandidate[];
  skipped: number;
  totalBytes: number;
  capped: boolean;
};

type DirectoryPicker = () => Promise<FileSystemDirectoryHandle>;
type DirectoryHandleWithEntries = FileSystemDirectoryHandle & {
  entries: () => AsyncIterable<[string, FileSystemHandle]>;
};

function extname(filename: string) {
  const index = filename.lastIndexOf('.');
  return index >= 0 ? filename.slice(index).toLowerCase() : '';
}

function pathHasSkippedDir(relativePath: string) {
  return relativePath.replaceAll('\\', '/').split('/').some((part) => SKIP_DIRS.has(part));
}

function canAcceptFile(file: File, relativePath: string, state: SelectionState) {
  if (pathHasSkippedDir(relativePath)) return false;
  if (!SUPPORTED_EXTS.has(extname(file.name))) return false;
  if (file.size > MAX_BROWSER_FILE_BYTES) return false;
  if (state.files.length >= MAX_BROWSER_FILES || state.totalBytes + file.size > MAX_BROWSER_TOTAL_BYTES) {
    state.capped = true;
    return false;
  }
  return true;
}

async function walkDirectory(handle: FileSystemDirectoryHandle, prefix: string, state: SelectionState) {
  for await (const [name, child] of (handle as DirectoryHandleWithEntries).entries()) {
    if (state.capped) break;
    const relativePath = prefix ? `${prefix}/${name}` : name;
    if (child.kind === 'directory') {
      if (!SKIP_DIRS.has(name)) await walkDirectory(child as FileSystemDirectoryHandle, relativePath, state);
      continue;
    }
    const file = await (child as FileSystemFileHandle).getFile();
    if (canAcceptFile(file, relativePath, state)) {
      state.files.push({ file, relativePath });
      state.totalBytes += file.size;
    } else {
      state.skipped += 1;
    }
  }
}

export function KnowledgePage() {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [vaultPath, setVaultPath] = useState(DEFAULT_VAULT);
  const [includeSyncNotes, setIncludeSyncNotes] = useState(false);
  const [replaceOnUpload, setReplaceOnUpload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function refresh() {
    try {
      setStats(await getKnowledgeStats());
    } catch (error) {
      setNotice(`读取知识库状态失败：${String(error)}`);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function runIndex(clearExisting: boolean) {
    setBusy(true);
    setNotice('');
    try {
      const result = await indexVaultKnowledge(vaultPath, clearExisting, includeSyncNotes);
      setStats(result.stats);
      setNotice(`本地路径索引完成：新增 ${result.indexed_files} 个文件，跳过 ${result.skipped_files.length} 个。`);
    } catch (error) {
      setNotice(`本地路径索引失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function runClear() {
    setBusy(true);
    setNotice('');
    try {
      await clearKnowledge();
      await refresh();
      setNotice('知识库已清空。');
    } catch (error) {
      setNotice(`清空失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCandidates(files: UploadCandidate[], skippedBeforeUpload: number, capped: boolean) {
    if (!files.length) {
      setNotice('没有找到可安全上传的文件。已跳过系统目录、超大文件和暂不支持的格式。');
      return;
    }
    setBusy(true);
    setNotice(`准备上传 ${files.length} 个文件，正在建立索引...`);
    try {
      const payload: KnowledgeUploadFile[] = files.map((item) => ({ file: item.file, relativePath: item.relativePath }));
      const result = await uploadKnowledgeFiles(payload, replaceOnUpload, 'browser-folder-safe');
      setStats(result.stats);
      const cappedText = capped ? '已达到浏览器安全上限，大型 Vault 请改用“索引本地路径”。' : '';
      setNotice(`文件夹安全索引完成：新增 ${result.indexed_files} 个文件，前置跳过 ${skippedBeforeUpload} 个，后端跳过 ${result.skipped_files.length} 个。${cappedText}`);
    } catch (error) {
      setNotice(`文件夹上传索引失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function chooseFolderSafely() {
    const picker = (window as unknown as { showDirectoryPicker?: DirectoryPicker }).showDirectoryPicker;
    if (!picker) {
      folderInputRef.current?.click();
      return;
    }
    try {
      const directory = await picker();
      const state: SelectionState = { files: [], skipped: 0, totalBytes: 0, capped: false };
      await walkDirectory(directory, directory.name, state);
      await uploadCandidates(state.files, state.skipped, state.capped);
    } catch (error) {
      if (!String(error).includes('AbortError')) setNotice(`读取文件夹失败：${String(error)}`);
    }
  }

  async function onFolderUpload(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    event.target.value = '';
    if (!fileList?.length) return;

    const state: SelectionState = { files: [], skipped: 0, totalBytes: 0, capped: false };
    for (let index = 0; index < fileList.length; index += 1) {
      if (state.capped) break;
      const file = fileList.item(index);
      if (!file) continue;
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      if (canAcceptFile(file, relativePath, state)) {
        state.files.push({ file, relativePath });
        state.totalBytes += file.size;
      } else {
        state.skipped += 1;
      }
    }
    await uploadCandidates(state.files, state.skipped, state.capped);
  }

  async function ask() {
    const text = question.trim();
    if (!text || busy) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((items) => [...items, userMessage]);
    setQuestion('');
    setBusy(true);
    try {
      const result = await askKnowledge(text);
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: 'assistant', content: result.answer, references: result.references },
      ]);
    } catch (error) {
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: 'assistant', content: `问答失败：${String(error)}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Architecture Brain</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">设计知识库</h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400">读取本地 Obsidian、案例和项目资料，提供带来源引用的对话式问答，并为项目技术复用卡提供依据。</p>
        </div>

        {notice && (
          <div className="mb-5 rounded-lg border border-[#333333] bg-[#111111] p-4 text-sm text-zinc-300">
            {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
            {notice}
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ['总文件', stats?.total_files ?? 0],
            ['Markdown', stats?.markdown_files ?? 0],
            ['PDF/Word/Excel', stats?.pdf_docx_xlsx_files ?? 0],
            ['图片', stats?.image_files ?? 0],
            ['双链', stats?.link_count ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#333333] bg-[#111111] p-4">
              <div className="text-2xl font-semibold text-white">{value}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-lg border border-[#333333] bg-[#111111] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FolderOpen size={17} className="text-emerald-300" />
            知识库管理
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <label className="mb-2 block text-xs text-zinc-500">本地路径扫描，推荐用于大型 Obsidian Vault</label>
              <input value={vaultPath} onChange={(event) => setVaultPath(event.target.value)} className="mb-3 w-full rounded-lg border border-[#333333] bg-[#0E0E0E] px-3 py-3 text-sm text-zinc-200 outline-none" />
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => runIndex(false)} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">
                  索引本地路径
                </button>
                <button disabled={busy} onClick={() => runIndex(true)} className="rounded-lg border border-[#333333] px-4 py-2 text-sm text-zinc-300">
                  重建索引
                </button>
                <button disabled={busy} onClick={runClear} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300">
                  <Trash2 size={15} />
                  清空
                </button>
              </div>
            </div>
            <div>
              <label className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={replaceOnUpload} onChange={(event) => setReplaceOnUpload(event.target.checked)} className="h-4 w-4 accent-emerald-400" />
                浏览器上传前替换当前知识库索引
              </label>
              <label className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={includeSyncNotes} onChange={(event) => setIncludeSyncNotes(event.target.checked)} className="h-4 w-4 accent-emerald-400" />
                本地路径扫描包含“笔记同步助手”
              </label>
              <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-6 text-emerald-100/80">
                <ShieldCheck size={15} className="mr-2 inline text-emerald-300" />
                点选文件夹会限制数量、体积并跳过系统目录，避免浏览器因一次性读取整个 Vault 而崩溃。
              </div>
              <input ref={folderInputRef} type="file" multiple className="hidden" onChange={onFolderUpload} {...({ webkitdirectory: '', directory: '' } as Record<string, string>)} />
              <button disabled={busy} onClick={chooseFolderSafely} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black">
                <UploadCloud size={16} />
                安全点选文件夹
              </button>
              <p className="mt-3 text-xs leading-6 text-zinc-500">当前安全上限：最多 {MAX_BROWSER_FILES} 个文件、总量 120MB、单文件 25MB。大型 Vault 请优先使用左侧路径扫描。</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.34fr_1fr]">
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Brain size={16} className="text-emerald-300" />
              对话历史
            </div>
            <div className="space-y-2">
              {messages.filter((item) => item.role === 'user').map((item, index) => (
                <button key={item.id} className="block w-full truncate rounded-lg bg-[#171717] p-3 text-left text-sm text-zinc-300">
                  对话 {index + 1}：{item.content}
                </button>
              ))}
              {!messages.length && <p className="text-sm text-zinc-500">暂无对话。</p>}
            </div>
          </div>

          <div className="flex min-h-[620px] flex-col rounded-lg border border-[#333333] bg-[#111111]">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {!messages.length && (
                <div className="flex h-full min-h-[320px] items-center justify-center text-center">
                  <div>
                    <Search size={36} className="mx-auto mb-4 text-zinc-600" />
                    <p className="text-sm text-zinc-500">输入问题开始知识库问答</p>
                    <p className="mt-2 text-xs text-zinc-600">回答会附带本地资料来源，便于项目经理回查。</p>
                  </div>
                </div>
              )}
              {messages.map((item) => (
                <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[86%] rounded-lg p-4 ${item.role === 'user' ? 'bg-amber-400 text-black' : 'border border-[#333333] bg-[#171717] text-zinc-300'}`}>
                    <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
                    {item.references?.length ? (
                      <div className="mt-3 space-y-2 border-t border-[#333333] pt-3">
                        {item.references.map((ref) => (
                          <div key={`${ref.file_path}-${ref.quote}`} className="rounded-lg bg-[#0E0E0E] p-3 text-xs text-zinc-500">
                            <div className="mb-1 text-zinc-300">{ref.file_name}</div>
                            <p className="leading-5">{ref.quote}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#333333] p-4">
              <div className="flex gap-3">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && ask()}
                  placeholder="输入问题，如：这个项目启动阶段有哪些技术风险？"
                  className="flex-1 rounded-lg border border-[#333333] bg-[#0E0E0E] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-amber-400/60"
                />
                <button disabled={busy || !question.trim()} onClick={ask} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
