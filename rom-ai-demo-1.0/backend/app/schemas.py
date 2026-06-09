from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    city: str = ""
    project_type: str = ""
    phase: str = ""
    description: str = ""
    status: str = "active"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    project_type: Optional[str] = None
    phase: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    city: str
    project_type: str
    phase: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime


class ProjectSummary(ProjectOut):
    file_count: int = 0
    report_count: int = 0
    task_count: int = 0


class ProjectFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    filename: str
    filepath: str
    filetype: str
    filesize: int
    parsed_text: str
    parse_status: str
    created_at: datetime


class ProjectReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    report_type: str
    content_json: str
    markdown: str
    model_name: str
    mode: str
    created_at: datetime


class ProjectTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    task_name: str
    task_type: str
    priority: str
    owner_role: str
    estimated_days: int
    dependencies: str
    risk_level: str
    status: str
    output_requirement: str
    created_at: datetime
    updated_at: datetime


class ProjectTimelineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    stage_name: str
    start_day: int
    end_day: int
    milestone: str
    dependencies: str
    risk_note: str


class TeamPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    recommended_roles: str
    staffing_summary: str
    created_at: datetime


class KnowledgeReferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    source_file: str
    source_path: str
    chunk_id: str
    quote: str
    relevance_score: float
    created_at: datetime


class AgentRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    agent_id: str
    input_context: str
    output_json: str
    status: str
    created_at: datetime


class AgentTriggerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    agent_id: str
    trigger_type: str
    context_json: str
    status: str
    created_at: datetime


class ProjectMeetingCreate(BaseModel):
    title: str = "项目启动会"
    meeting_type: str = "启动会"
    agenda: str = ""
    meeting_link: str = ""
    transcript: str = ""
    status: str = "planned"
    scheduled_at: str = ""


class ProjectMeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_type: Optional[str] = None
    agenda: Optional[str] = None
    meeting_link: Optional[str] = None
    transcript: Optional[str] = None
    status: Optional[str] = None
    scheduled_at: Optional[str] = None


class ProjectMeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    meeting_type: str
    agenda: str
    meeting_link: str
    transcript: str
    summary: str
    mindmap_json: str
    next_actions_json: str
    status: str
    scheduled_at: str
    created_at: datetime
    updated_at: datetime


class SkillCardCreate(BaseModel):
    card_type: str = "task_breakdown"
    title: str = ""
    input_json: dict = {}


class SkillCardRunRequest(BaseModel):
    card_type: str = "task_breakdown"
    prompt: str = ""


class SkillCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    card_type: str
    title: str
    status: str
    input_json: str
    output_json: str
    markdown: str
    source: str
    created_at: datetime
    updated_at: datetime


class TeamMemberCreate(BaseModel):
    name: str
    role: str = ""
    skills: list[str] = []
    status: str = "available"
    workload: int = 0


class TeamMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: str
    skills: str
    status: str
    workload: int
    created_at: datetime


class ProjectAssignmentCreate(BaseModel):
    task_id: str = ""
    assignee_type: str = "digital_employee"
    assignee_id: str = ""
    assignee_name: str = ""
    role: str = ""
    responsibility: str = ""
    status: str = "active"


class ProjectAssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    task_id: str
    assignee_type: str
    assignee_id: str
    assignee_name: str
    role: str
    responsibility: str
    status: str
    created_at: datetime


class ProjectDetail(ProjectOut):
    files: list[ProjectFileOut] = []
    reports: list[ProjectReportOut] = []
    tasks: list[ProjectTaskOut] = []
    timelines: list[ProjectTimelineOut] = []
    team_plans: list[TeamPlanOut] = []
    knowledge_references: list[KnowledgeReferenceOut] = []
    agent_runs: list[AgentRunOut] = []
    agent_triggers: list[AgentTriggerOut] = []
    meetings: list[ProjectMeetingOut] = []
    skill_cards: list[SkillCardOut] = []
    assignments: list[ProjectAssignmentOut] = []


class HealthOut(BaseModel):
    status: str
    service: str
    database: str


class SettingsStatusOut(BaseModel):
    deepseek_configured: bool
    deepseek_base_url: str
    deepseek_model: str
    default_vault_path: str
    upload_root: str
    cloud_upload_enabled: bool = False
    cloud_upload_root: str = ""
    mock_mode: bool
    database_url: str


class DeepSeekSettingsUpdate(BaseModel):
    api_key: str = ""
    base_url: str = "https://api.deepseek.com"
    model: str = "deepseek-chat"


class KnowledgeScanRequest(BaseModel):
    path: str
    clear_existing: bool = False


class KnowledgeAskRequest(BaseModel):
    question: str
    project_id: Optional[str] = None


class KnowledgeReferenceCreate(BaseModel):
    source_file: str
    source_path: str = ""
    chunk_id: str = ""
    quote: str = ""
    relevance_score: float = 0


class ProjectAnalyzeRequest(BaseModel):
    auto_fetch_knowledge: bool = False


class TeamRequirementRole(BaseModel):
    role: str
    count: int
    skills: list[str] = []
    intensity: str = ""


class TeamRequirementsOut(BaseModel):
    total_headcount: int = 0
    roles: list[TeamRequirementRole] = []


class ProjectAnalyzeOut(BaseModel):
    report: ProjectReportOut
    tasks: list[ProjectTaskOut]
    timeline: list[ProjectTimelineOut]
    team_requirements: TeamRequirementsOut
    knowledge_refs: list[KnowledgeReferenceOut]


class AgentRunRequest(BaseModel):
    project_id: str
    goal: str = "生成项目解析代理成果"


class AgentTriggerRequest(BaseModel):
    trigger_type: str = "manual"
    context_json: dict = {}


class DigitalEmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: str
    skills: str
    avatar: str
    status: str
    workload: int


# ──────────────────────────────────────────────
#  新增 schemas：会议 / 任务 / 技能卡片 / 团队分工 / 知识条目
# ──────────────────────────────────────────────


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    date: Optional[datetime] = None
    agenda: str = ""
    status: str = "scheduled"


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    agenda: Optional[str] = None
    minutes: Optional[str] = None
    todos: Optional[str] = None
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    mindmap_json: Optional[str] = None
    next_actions_json: Optional[str] = None
    status: Optional[str] = None


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    date: Optional[datetime] = None
    agenda: str
    minutes: str
    todos: str
    recording_url: str
    transcript: str = ""
    summary: str = ""
    mindmap_json: str = "{}"
    next_actions_json: str = "[]"
    status: str
    created_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    assignee_id: str = ""
    assignee_type: str = "human"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    source: str = "manual"
    source_id: str = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    source: Optional[str] = None
    source_id: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    description: str
    assignee_id: str
    assignee_type: str
    status: str
    priority: str
    due_date: Optional[datetime] = None
    source: str
    source_id: str
    created_at: datetime


class SkillCardCreate(BaseModel):
    card_type: str = Field(default="task_breakdown", min_length=1, max_length=50)
    title: str = ""
    input_json: dict = {}
    input_data: str = "{}"
    created_by: str = "user"


class SkillCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    card_type: str
    title: str
    input_data: Optional[str] = "{}"
    output_data: Optional[str] = ""
    input_json: str = "{}"
    output_json: str = "{}"
    markdown: str = ""
    source: str = ""
    status: str
    created_by: str
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TeamAssignmentCreate(BaseModel):
    member_id: str = ""
    member_type: str = "human"
    member_name: str = Field(min_length=1, max_length=100)
    role: str = ""
    responsibilities: str = ""


class TeamAssignmentUpdate(BaseModel):
    member_id: Optional[str] = None
    member_type: Optional[str] = None
    member_name: Optional[str] = None
    role: Optional[str] = None
    responsibilities: Optional[str] = None


class TeamAssignmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    member_id: str
    member_type: str
    member_name: str
    role: str
    responsibilities: str
    created_at: datetime


class KnowledgeItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_file: str
    content: str
    summary: str
    project_id: str
    item_type: str
    tags: str
    created_at: datetime


class KnowledgeChatRequest(BaseModel):
    question: str
    project_id: Optional[str] = None
    context: Optional[str] = None


class KnowledgeIndexRequest(BaseModel):
    path: str
    project_id: Optional[str] = None
    clear_existing: bool = False
    include_sync_notes: bool = False


class KnowledgeSearchRequest(BaseModel):
    question: str
    limit: int = 8


class StartupAnalysisRequest(BaseModel):
    refresh_knowledge: bool = False
    vault_path: str = ""


class ObsidianCandidateCreate(BaseModel):
    item_type: str = "obsidian_candidate"
    title: str = ""
    content: str = ""
    tags: list[str] = []
