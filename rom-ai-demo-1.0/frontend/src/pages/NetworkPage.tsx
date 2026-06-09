import { useState, useEffect } from 'react';
import { Users, Bot, Tag, Briefcase, ListTodo, UserPlus } from 'lucide-react';
import { listDigitalEmployees } from '../lib/projectsApi';

/* ---------- Types ---------- */
type MemberGroup = 'human' | 'ai';

type Member = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  group: MemberGroup;
  skills: string[];
  projects: Array<{ name: string; role: string }>;
  currentTasks: Array<{ name: string; status: string }>;
  description?: string;
  status: string;
  workload: number;
};

/* ---------- Preset human members ---------- */
const HUMAN_MEMBERS: Member[] = [
  {
    id: 'human-zhang',
    name: '张工',
    role: '方案主创',
    avatar: '👨‍💼',
    group: 'human',
    skills: ['总图', '高层', '住宅'],
    projects: [
      { name: '哈尔滨群力西三地块', role: '总图' },
      { name: '太原项目', role: '方案审核' },
    ],
    currentTasks: [
      { name: '总图方案深化', status: '进行中' },
      { name: '立面风格确定', status: '待办' },
    ],
    status: 'active',
    workload: 75,
  },
  {
    id: 'human-li',
    name: '李工',
    role: '结构顾问',
    avatar: '👨‍🔬',
    group: 'human',
    skills: ['结构', '抗震', '基础'],
    projects: [
      { name: '哈尔滨群力西三地块', role: '结构审核' },
    ],
    currentTasks: [
      { name: '基础方案比选', status: '进行中' },
    ],
    status: 'active',
    workload: 50,
  },
  {
    id: 'human-wang',
    name: '王工',
    role: '景观设计',
    avatar: '👩‍🎨',
    group: 'human',
    skills: ['景观', '示范区', '植物'],
    projects: [
      { name: '哈尔滨群力西三地块', role: '示范区景观' },
    ],
    currentTasks: [
      { name: '示范区景观方案', status: '待办' },
    ],
    status: 'active',
    workload: 30,
  },
];

/* ---------- AI employee descriptions ---------- */
const AI_DESCRIPTIONS: Record<string, string> = {
  '资料分析师': '负责项目资料的自动解析和技术要点提取',
  '会议秘书': '会议纪要生成、待办提取、下次会议议程',
  'PPT架构师': '汇报文件结构设计、页面内容建议',
  '方案评审员': '方案自检、规范合规性检查',
  '规范检索员': '建筑规范条文检索、适用条件判断',
};

/* ---------- Component ---------- */
export function NetworkPage() {
  const [aiMembers, setAiMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDigitalEmployees()
      .then((employees) => {
        const mapped: Member[] = employees.map((emp) => {
          let skills: string[] = [];
          try { skills = JSON.parse(emp.skills || '[]'); } catch { skills = []; }
          return {
            id: emp.id,
            name: emp.name,
            role: emp.role,
            avatar: emp.avatar || '🤖',
            group: 'ai' as MemberGroup,
            skills,
            projects: [],
            currentTasks: [],
            description: AI_DESCRIPTIONS[emp.name] || '',
            status: emp.status,
            workload: emp.workload,
          };
        });
        setAiMembers(mapped);
        setLoading(false);
      })
      .catch(() => {
        setAiMembers([]);
        setLoading(false);
      });
  }, []);

  const allMembers = [...HUMAN_MEMBERS, ...aiMembers];
  const selected = allMembers.find((m) => m.id === selectedId);

  return (
    <main className="min-h-screen bg-gray-900 px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1360px]">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Digital Network
            </span>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">数字网络平台</h1>
            <p className="max-w-3xl text-sm leading-7 text-zinc-400">
              项目成员与AI数字员工的协作网络。左侧浏览成员，点击查看详情。
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/10">
            <UserPlus size={16} className="text-amber-400" />
            添加成员
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          {/* Left — member list */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            {/* Human */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">真实成员</h2>
              </div>
              <div className="space-y-1.5">
                {HUMAN_MEMBERS.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedId(member.id)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      selectedId === member.id
                        ? 'bg-amber-400/10 border-l-2 border-amber-400'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg">
                      {member.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{member.name}</div>
                      <div className="text-xs text-zinc-500">{member.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Bot size={16} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">AI数字员工</h2>
              </div>
              {loading ? (
                <p className="py-4 text-center text-sm text-zinc-500">加载中...</p>
              ) : (
                <div className="space-y-1.5">
                  {aiMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedId(member.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                        selectedId === member.id
                          ? 'bg-amber-400/10 border-l-2 border-amber-400'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg">
                        {member.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{member.name}</div>
                        <div className="text-xs text-zinc-500">{member.role}</div>
                      </div>
                    </button>
                  ))}
                  {aiMembers.length === 0 && <p className="py-4 text-center text-sm text-zinc-500">暂无AI员工</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right — member detail */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            {selected ? (
              <>
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-3xl">
                    {selected.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selected.name}</h2>
                    <p className="text-sm text-zinc-400">{selected.role}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          selected.status === 'active' || selected.status === 'available'
                            ? 'bg-emerald-400/10 text-emerald-300'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {selected.status}
                      </span>
                      {selected.group === 'ai' && (
                        <span className="rounded-full bg-blue-400/10 px-2 py-0.5 text-xs text-blue-300">AI</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description (AI only) */}
                {selected.description && (
                  <div className="mb-6 rounded-xl border border-white/10 bg-gray-800 p-4 text-sm leading-7 text-zinc-300">
                    {selected.description}
                  </div>
                )}

                {/* Skills */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">能力标签</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.length > 0 ? (
                      selected.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-300">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">暂无标签</p>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">参与项目</h3>
                  </div>
                  {selected.projects.length > 0 ? (
                    <div className="space-y-2">
                      {selected.projects.map((project, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-800 p-3 text-sm">
                          <span className="text-zinc-200">{project.name}</span>
                          <span className="text-xs text-zinc-500">{project.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">暂无关联项目</p>
                  )}
                </div>

                {/* Current tasks */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <ListTodo size={16} className="text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">当前任务</h3>
                  </div>
                  {selected.currentTasks.length > 0 ? (
                    <div className="space-y-2">
                      {selected.currentTasks.map((task, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-800 p-3 text-sm">
                          <span className="text-zinc-200">{task.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              task.status === '进行中'
                                ? 'bg-amber-400/10 text-amber-300'
                                : 'bg-white/5 text-zinc-500'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">暂无进行中的任务</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center text-center">
                <div>
                  <Users size={40} className="mx-auto mb-4 text-zinc-600" />
                  <p className="text-sm text-zinc-500">选择左侧成员查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}