import { useState, useEffect } from 'react';
import {
  Users,
  Bot,
  Plus,
  Loader2,
  X,
  UserCircle,
  Cpu,
} from 'lucide-react';
import {
  type ProjectDetail,
  type ProjectAssignment,
} from '../../lib/projectsApi';
import {
  listTeamMembers as fetchTeamMembers,
  addTeamMember,
  type TeamMember as TeamMemberType,
} from '../../lib/teamApi';
import { listDigitalEmployees, type DigitalEmployee } from '../../lib/projectsApi';

type Props = {
  projectId: string;
  project: ProjectDetail;
  onRefresh: () => void;
};

export function TeamTab({ projectId, project, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([]);
  const [digitalEmployees, setDigitalEmployees] = useState<DigitalEmployee[]>([]);

  // 新成员表单
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newGroup, setNewGroup] = useState<'human' | 'ai'>('human');

  // 加载团队成员
  useEffect(() => {
    if (projectId) {
      fetchTeamMembers(projectId)
        .then(setTeamMembers)
        .catch(() => setTeamMembers([]));
      listDigitalEmployees()
        .then(setDigitalEmployees)
        .catch(() => setDigitalEmployees([]));
    }
  }, [projectId, project.assignments]);

  const humanMembers = teamMembers.filter((m) => m.group !== 'ai');
  const aiMembers = teamMembers.filter((m) => m.group === 'ai');

  // 也使用 assignments 数据作为补充
  const assignments = project.assignments ?? [];

  async function handleAddMember() {
    if (!newName.trim() || !newRole.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await addTeamMember(projectId, {
        name: newName,
        role: newRole,
        group: newGroup,
      });
      setShowAddModal(false);
      setNewName('');
      setNewRole('');
      setNewGroup('human');
      // 重新加载
      const members = await fetchTeamMembers(projectId);
      setTeamMembers(members);
      setMessage('成员已添加。');
    } catch (error) {
      setMessage(`添加失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
          {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">项目团队</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-300"
        >
          <Plus size={14} />
          添加成员
        </button>
      </div>

      {/* 添加成员 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#171717] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">添加成员</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-xs text-zinc-500">
                姓名
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-400/60"
                  placeholder="成员姓名"
                />
              </label>
              <label className="block text-xs text-zinc-500">
                角色
                <input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-400/60"
                  placeholder="例如：项目负责人、方案建筑师"
                />
              </label>
              <label className="block text-xs text-zinc-500">
                类型
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value as 'human' | 'ai')}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-400/60"
                >
                  <option value="human">真实成员</option>
                  <option value="ai">AI数字员工</option>
                </select>
              </label>
              <button
                onClick={handleAddMember}
                disabled={busy || !newName.trim() || !newRole.trim()}
                className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="mx-auto animate-spin" /> : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        {/* 真实成员 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users size={16} className="text-amber-300" />
            <h3 className="text-sm font-semibold text-white">项目成员</h3>
            <span className="text-xs text-zinc-500">({humanMembers.length})</span>
          </div>

          {humanMembers.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-[#0E0E0E] p-6 text-center">
              <UserCircle size={28} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-sm text-zinc-500">暂无项目成员</p>
              <p className="mt-1 text-xs text-zinc-600">添加真实团队成员并分配角色</p>
            </div>
          ) : (
            <div className="space-y-2">
              {humanMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0E0E0E] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-300">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-[11px] text-zinc-500">{member.role}</div>
                    </div>
                  </div>
                  {member.skills && (
                    <div className="flex flex-wrap gap-1">
                      {member.skills.split(',').slice(0, 2).map((skill) => (
                        <span key={skill} className="rounded-full bg-[#171717] px-2 py-0.5 text-[10px] text-zinc-400">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI数字员工 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bot size={16} className="text-blue-300" />
            <h3 className="text-sm font-semibold text-white">AI数字员工</h3>
            <span className="text-xs text-zinc-500">({aiMembers.length + digitalEmployees.length})</span>
          </div>

          {aiMembers.length === 0 && digitalEmployees.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-[#0E0E0E] p-6 text-center">
              <Cpu size={28} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-sm text-zinc-500">暂无AI分工</p>
              <p className="mt-1 text-xs text-zinc-600">运行项目分析后，系统会推荐AI代理分工</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aiMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0E0E0E] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/10 text-xs font-bold text-blue-300">
                      AI
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-[11px] text-zinc-500">{member.role}</div>
                    </div>
                  </div>
                  {member.skills && (
                    <div className="flex flex-wrap gap-1">
                      {member.skills.split(',').slice(0, 2).map((skill) => (
                        <span key={skill} className="rounded-full bg-[#171717] px-2 py-0.5 text-[10px] text-zinc-400">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 也展示数字员工数据 */}
              {digitalEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0E0E0E] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-400/10 text-xs font-bold text-violet-300">
                      AI
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{emp.name}</div>
                      <div className="text-[11px] text-zinc-500">{emp.role}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 任务分配一览 */}
      {assignments.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-white">任务分配一览</h3>
          <div className="space-y-2">
            {assignments.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0E0E0E] p-3 text-sm">
                <div className="text-zinc-300">
                  <span className="font-medium text-white">{a.assignee_name}</span>
                  <span className="mx-2 text-zinc-600">·</span>
                  <span>{a.role}</span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${a.assignee_type === 'digital_employee' ? 'border-violet-400/30 bg-violet-400/10 text-violet-300' : 'border-amber-400/30 bg-amber-400/10 text-amber-300'}`}>
                  {a.assignee_type === 'digital_employee' ? 'AI' : '人工'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}