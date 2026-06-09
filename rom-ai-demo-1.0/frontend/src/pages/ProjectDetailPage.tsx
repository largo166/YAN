import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  LayoutDashboard,
  FileText,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  getProject,
  runStartupAnalysis,
  uploadProjectFiles,
  type ProjectDetail,
} from '../lib/projectsApi';
import { OverviewTab } from '../components/project/OverviewTab';
import { FilesTab } from '../components/project/FilesTab';
import { MeetingsTab } from '../components/project/MeetingsTab';
import { TasksTab } from '../components/project/TasksTab';
import { AiResultsTab } from '../components/project/AiResultsTab';
import { TeamTab } from '../components/project/TeamTab';

const tabs = [
  { key: 'overview', label: '概览', icon: LayoutDashboard },
  { key: 'files', label: '资料', icon: FileText },
  { key: 'meetings', label: '会议', icon: CalendarDays },
  { key: 'tasks', label: '任务', icon: ClipboardList },
  { key: 'ai-results', label: 'AI成果', icon: Sparkles },
  { key: 'team', label: '团队', icon: Users },
] as const;

type TabKey = (typeof tabs)[number]['key'];

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() ?? '';
  if (s.includes('active') || s.includes('进行中'))
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  if (s.includes('risk') || s.includes('风险') || s.includes('blocked'))
    return 'border-red-500/20 bg-red-500/10 text-red-300';
  if (s.includes('done') || s.includes('完成') || s.includes('completed'))
    return 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400';
  if (s.includes('paused') || s.includes('暂停'))
    return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300';
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    if (!id) return;
    setLoading(true);
    setMessage('');
    try {
      setProject(await getProject(id));
    } catch (error) {
      setMessage(`读取项目失败：${String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function runStartup() {
    if (!id) return;
    setBusy(true);
    setMessage('');
    try {
      await runStartupAnalysis(id);
      await load();
      setMessage('项目启动分析已生成，技术重点、任务拆解、会议议程已写入。');
      setActiveTab('overview');
    } catch (error) {
      setMessage(`启动分析失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        {/* 面包屑 */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link to="/projects" className="hover:text-white transition-colors">
            项目中心
          </Link>
          <ChevronRight size={14} />
          <span className="text-zinc-300">{project?.name ?? '加载中...'}</span>
        </nav>

        {/* 全局消息 */}
        {message && (
          <div className="mb-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
            {message}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <Loader2 size={32} className="mx-auto mb-4 animate-spin text-amber-400" />
            <p className="text-sm text-zinc-400">正在读取项目...</p>
          </div>
        )}

        {project && (
          <>
            {/* 项目头部 */}
            <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="max-w-3xl text-sm leading-6 text-zinc-400">{project.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={busy}
                    onClick={runStartup}
                    className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
                  >
                    {busy ? '运行中...' : '运行启动分析'}
                  </button>
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs ${getStatusBadge(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Tab 切换栏 - 底部线条高亮 */}
            <section className="rounded-t-xl border-b border-white/10 bg-white/5">
              <div className="flex gap-0 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? 'text-amber-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                      {/* 底部高亮线 */}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tab 内容区 */}
            <section className="rounded-b-xl border border-t-0 border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:p-7">
              {activeTab === 'overview' && (
                <OverviewTab projectId={id!} project={project} onRefresh={load} />
              )}
              {activeTab === 'files' && (
                <FilesTab projectId={id!} project={project} onRefresh={load} />
              )}
              {activeTab === 'meetings' && (
                <MeetingsTab projectId={id!} meetings={project.meetings} onRefresh={load} />
              )}
              {activeTab === 'tasks' && (
                <TasksTab projectId={id!} tasks={project.tasks} onRefresh={load} />
              )}
              {activeTab === 'ai-results' && (
                <AiResultsTab projectId={id!} project={project} onRefresh={load} />
              )}
              {activeTab === 'team' && (
                <TeamTab projectId={id!} project={project} onRefresh={load} />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}