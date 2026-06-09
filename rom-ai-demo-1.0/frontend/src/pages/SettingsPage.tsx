import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getSettingsStatus, type SettingsStatus } from '../lib/projectsApi';

export function SettingsPage() {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettingsStatus().then(setStatus).catch((error) => setMessage(`读取设置失败：${String(error)}`));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Settings</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">系统设置</h1>
          <p className="text-sm leading-7 text-zinc-400">只显示 Key 是否配置，不显示完整 Key。</p>
        </div>
        {message && <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}
        {status && (
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck size={18} className="text-emerald-300" />后端状态</div>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="rounded-lg bg-[#171717] p-4">DeepSeek：{status.deepseek_configured ? '已配置' : '未配置'}</div>
              <div className="rounded-lg bg-[#171717] p-4">Mock 模式：{status.mock_mode ? '开启' : '关闭'}</div>
              <div className="rounded-lg bg-[#171717] p-4">当前模型：{status.deepseek_model}</div>
              <div className="rounded-lg bg-[#171717] p-4">Base URL：{status.deepseek_base_url}</div>
              <div className="rounded-lg bg-[#171717] p-4 md:col-span-2">默认 Vault：{status.default_vault_path}</div>
              <div className="rounded-lg bg-[#171717] p-4 md:col-span-2">上传路径：{status.upload_root}</div>
              <div className="rounded-lg bg-[#171717] p-4 md:col-span-2">数据库：{status.database_url}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
