import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { uploadProjectFiles, parseProjectFiles, type ProjectDetail } from '../../lib/projectsApi';

type Props = {
  projectId: string;
  project: ProjectDetail;
  onRefresh: () => void;
};

export function FilesTab({ projectId, project, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    try {
      await uploadProjectFiles(projectId, Array.from(files));
      await onRefresh();
      setMessage('文件已上传。下一步可以点击"解析文件"。');
    } catch (error) {
      setMessage(`上传失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function onParse() {
    setBusy(true);
    setMessage('');
    try {
      await parseProjectFiles(projectId);
      await onRefresh();
      setMessage('文件解析完成。');
    } catch (error) {
      setMessage(`解析失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
          <Upload size={15} />
          上传资料
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt,.md,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />
        </label>
        <button
          disabled={busy}
          onClick={onParse}
          className="rounded-lg border border-[#333333] px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600"
        >
          解析文件
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-[#333333] bg-[#171717] p-3 text-sm text-zinc-300">
          {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
          {message}
        </div>
      )}

      {/* File list */}
      <div className="space-y-3">
        {project.files.map((file) => (
          <div key={file.id} className="rounded-lg border border-[#333333] bg-[#171717] p-4 text-sm text-zinc-300">
            <div className="mb-1 flex items-center gap-2">
              <FileText size={14} className="text-amber-300" />
              <span className="font-medium text-white">{file.filename}</span>
            </div>
            <div className="text-xs text-zinc-500">
              {file.filetype} · {(file.filesize / 1024).toFixed(1)}KB · {file.parse_status}
            </div>
          </div>
        ))}
        {project.files.length === 0 && (
          <p className="text-sm text-zinc-500">暂无文件。点击"上传资料"开始。</p>
        )}
      </div>
    </div>
  );
}
