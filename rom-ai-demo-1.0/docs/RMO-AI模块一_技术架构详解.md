---
type: guide
title: RMO-AI 模块一：Phase 1 技术架构详解
summary: 任务拆解系统、设计师管理后台、AI工具链配置的完整搭建指南
updated: 2026-06-01
tags: [RMO-AI, 技术架构, 系统设计]
---

# RMO-AI 深度执行手册
## 模块一：Phase 1 技术架构详解

---

## 1.1 任务拆解系统：从零搭建指南

### 1.1.1 系统架构设计

```
┌─────────────────────────────────────────────────────────────┐
│  输入层                                                      │
│  ├── 客户需求文档（PDF/Word/图片）                             │
│  ├── 参考案例（图片/PDF）                                     │
│  └── 初步沟通记录（文字/语音转录）                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  解析层：文档理解模块                                          │
│  ├── OCR/文本提取（PDF解析）                                  │
│  ├── 图片理解（GPT-4V/Claude Vision）                        │
│  ├── 关键信息提取（用地指标、风格偏好、预算等）                  │
│  └── 缺失信息识别（生成追问清单）                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  拆解层：任务生成引擎（核心）                                   │
│  ├── 任务识别器（基于你的方法论）                              │
│  ├── 难度评估器（基于历史数据）                                │
│  ├── 工作量估算器（基于项目规模）                              │
│  └── 依赖关系分析器（任务先后顺序）                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  输出层：任务包                                                │
│  ├── 任务清单（可接单的最小单元）                              │
│  ├── 能力标签需求（需要什么样的设计师）                         │
│  ├── 时间估算（每个任务的预计工期）                            │
│  ├── 报价建议（基于成本模型）                                  │
│  └── 风险标记（潜在问题预警）                                  │
└─────────────────────────────────────────────────────────────┘
```

### 1.1.2 Prompt模板库设计

基于你的方法论，我设计了以下Prompt模板：

**模板1：项目需求解析Prompt**

```markdown
你是一名资深的建筑设计项目分析师，擅长将客户需求转化为结构化的设计任务。

请分析以下项目需求，提取关键信息：

【项目需求原文】
{client_input}

请按以下JSON格式输出分析结果：

{
  "项目基本信息": {
    "项目类型": "住宅/商业/办公/混合",
    "用地面积": "数值+单位",
    "容积率": "数值",
    "建筑限高": "数值+单位",
    "地理位置": "城市+区域",
    "气候分区": "严寒/寒冷/夏热冬冷/夏热冬暖/温和"
  },
  "客户需求": {
    "产品定位": "刚需/改善/豪宅/顶级豪宅",
    "风格偏好": ["现代", "新中式", "宋式", ...],
    "关键诉求": ["高溢价", "快周转", "差异化", ...],
    "参考项目": ["项目名称1", "项目名称2"]
  },
  "关键约束": {
    "规划条件": ["限高", "退界", "配套要求"],
    "技术难点": ["极寒地区", "高容积率", "异形地块"],
    "时间要求": "交付日期"
  },
  "缺失信息": [
    "需要向客户确认的问题1",
    "需要向客户确认的问题2"
  ]
}

注意：
1. 如果信息缺失，在对应字段标注"待确认"
2. 基于你的专业经验，识别客户未明说但隐含的需求
3. 标注任何可能影响设计的特殊情况
```

**模板2：任务拆解Prompt**

```markdown
你是一名建筑设计项目管理专家，基于以下方法论，将项目拆解为可执行的任务包。

【项目信息】
{project_info_json}

【你的方法论库】
{methodology_library}

请输出任务拆解结果：

## 任务清单

| 任务ID | 任务名称 | 任务类型 | 难度等级 | 预估工时 | 前置任务 | 能力标签 |
|--------|---------|---------|---------|---------|---------|---------|
| T001 | 强排方案 | 总图 | P0 | 40h | - | 总图专家,强排经验 |
| T002 | 户配策略 | 户型 | P1 | 24h | T001 | 户型专家,住宅经验 |
| ... | ... | ... | ... | ... | ... | ... |

## 任务详细说明

### T001: 强排方案
- **交付物**: 3个比选方案 + 指标对比表
- **质量标准**: 
  - 满足规划条件100%合规
  - 容积率损失<3%
  - 主力户型朝向合规
- **审核要点**: 基于[[方法_高容积率四代宅推进]]检查
- **风险提示**: 异形地块可能导致标准户型无法落地

### T002: 户配策略
...

## 项目路线图

```
Week 1: [T001] → [T002]
Week 2: [T003] → [T004]
...
```

## 资源需求

- **核心设计师**: 总图专家1名，户型专家1名
- **AI工具**: 强排生成工具，户型优化工具
- **你的介入点**: T001方案评审，T004立面定稿
```

**模板3：设计师匹配Prompt**

```markdown
基于以下任务需求和设计师库，推荐最合适的设计师。

【任务需求】
{task_requirement}

【设计师库】
{designer_database}

匹配规则（按优先级排序）：
1. 能力标签匹配度（必须100%匹配硬性要求）
2. 历史项目相似度（做过同类项目+1分）
3. 当前负载（负载低+1分）
4. 质量评分（历史评分高+1分）
5. 价格匹配（报价在预算范围内+1分）

输出推荐列表：

| 排名 | 设计师 | 匹配分数 | 推荐理由 | 风险提醒 |
|------|--------|---------|---------|---------|
| 1 | 张三 | 92 | 3个同类项目，评分4.8 | 当前负载70% |
| 2 | 李四 | 85 | ... | ... |
```

### 1.1.3 技术实现方案（MVP版）

**方案A：纯Prompt方案（最快，1周内可上线）**

工具：Claude/GPT-4 + Google Sheets/飞书多维表格

```
步骤1：创建标准输入表单（飞书多维表格）
├── 字段1：项目名称
├── 字段2：客户需求（文本框）
├── 字段3：附件（PDF/图片）
├── 字段4：预算范围
├── 字段5：时间要求
└── 字段6：联系方式

步骤2：创建自动化流程
├── 触发器：新表单提交
├── 动作1：将需求发送到Claude API
├── 动作2：Claude返回结构化分析
├── 动作3：自动填充到"项目分析表"
└── 动作4：发送通知到你的微信/飞书

步骤3：人工审核
├── 你审核AI分析结果
├── 补充缺失信息
├── 确认任务拆解
└── 发布任务到设计师看板
```

**具体配置代码：**

```python
# task_parser.py - 任务解析脚本
import json
import anthropic
from datetime import datetime

class RMOAITaskParser:
    def __init__(self, api_key):
        self.client = anthropic.Anthropic(api_key=api_key)
        
        # 加载你的方法论库
        with open('methodology_library.json', 'r', encoding='utf-8') as f:
            self.methodology = json.load(f)
    
    def parse_project(self, client_input, attachments=None):
        """解析客户需求"""
        
        system_prompt = """你是一名资深的建筑设计项目分析师...
        [这里放入上面的Prompt模板1]
        """
        
        message = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"客户需求：{client_input}"
            }]
        )
        
        return json.loads(message.content[0].text)
    
    def decompose_tasks(self, project_info):
        """拆解任务"""
        
        system_prompt = f"""基于以下方法论进行任务拆解：
        {json.dumps(self.methodology, ensure_ascii=False)}
        
        [这里放入上面的Prompt模板2]
        """
        
        message = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=8000,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"项目信息：{json.dumps(project_info, ensure_ascii=False)}"
            }]
        )
        
        return message.content[0].text
    
    def match_designers(self, task, designer_db):
        """匹配设计师"""
        # 类似上面的逻辑
        pass

# 使用示例
parser = RMOAITaskParser(api_key="your-api-key")
project_info = parser.parse_project("客户输入的需求文本...")
tasks = parser.decompose_tasks(project_info)
```

### 1.1.4 飞书自动化配置（无代码方案）

如果你暂时不想写代码，可以用飞书多维表格的自动化功能：

**Step 1: 创建项目录入表**

```
表名：RMOAI_项目录入
字段：
- 项目名称（文本）
- 客户需求（多行文本）
- 附件（附件）
- 提交时间（创建时间）
- 解析状态（单选：待解析/解析中/已完成）
- 解析结果（多行文本）
- 任务清单（关联表：RMOAI_任务清单）
```

**Step 2: 配置自动化流程**

```
触发条件：当"解析状态"变为"待解析"

执行动作：
1. 发送HTTP请求到Make/Zapier
   - URL: your-webhook-url
   - Body: {项目数据}
   
2. Make/Zapier调用Claude API进行解析

3. 将解析结果写回飞书
   - 更新"解析结果"字段
   - 在RMOAI_任务清单创建多条记录
   - 更新"解析状态"为"已完成"
   
4. 发送通知
   - 发送飞书消息给你
   - 内容：新项目待审核 + 链接
```

**Step 3: 创建任务看板**

```
表名：RMOAI_任务清单
字段：
- 任务ID（自动编号）
- 所属项目（关联：RMOAI_项目录入）
- 任务名称（文本）
- 任务类型（单选：总图/户型/立面/示范区...）
- 难度等级（单选：P0/P1/P2）
- 预估工时（数字）
- 状态（单选：待分配/已分配/进行中/待审核/已完成）
- 指派人（人员）
- 截止日期（日期）
- 实际工时（数字）
- 质量评分（评分）
```

---

## 1.2 设计师管理后台：详细搭建指南

### 1.2.1 设计师档案系统

**设计师信息表结构：**

```
表名：RMOAI_设计师档案

基本信息：
- 设计师ID（唯一标识）
- 姓名
- 联系方式（电话/微信/邮箱）
- 所在城市
- 工作年限
- 当前公司/自由职业

能力画像：
- 专业领域（多选：总图/户型/立面/景观/室内...）
- 项目经验（多选：住宅/商业/办公/酒店...）
- 产品级别（多选：刚需/改善/豪宅/顶豪...）
- 软件技能（多选：CAD/SketchUp/Rhino/Revit...）
- AI工具熟练度（评分1-5）

信用体系：
- 等级（一星/二星/三星/核心）
- 历史接单数
- 完成率（%）
- 平均评分（1-5分）
- 准时交付率（%）
- 客户投诉次数

财务信息：
- 银行卡号
- 结算周期偏好（月结/项目结）
- 历史总收入
- 待结算金额

状态：
- 当前负载（空闲/半饱和/饱和/暂停接单）
- 最近活跃时间
- 账户状态（正常/冻结/注销）
```

**设计师入驻流程：**

```
Step 1: 提交申请
├── 填写基本信息
├── 上传作品集（5-10个项目）
├── 填写能力自评
└── 同意平台协议

Step 2: 资质审核（你或运营人员）
├── 审核作品集质量
├── 电话/视频面试
├── 试单测试（小任务测试）
└── 评级定级（一星/二星/三星）

Step 3: 正式入驻
├── 签署合作协议
├── 开通平台账号
├── 加入设计师社群
└── 参与平台培训（你的方法论）

Step 4: 持续评估
├── 每3个月复评等级
├── 根据接单表现调整评级
└── 优秀者晋升，违规者降级/清退
```

### 1.2.2 任务分配与调度系统

**分配策略：**

```
策略1：智能推荐（默认）
算法：
1. 筛选：能力标签匹配 + 当前负载<80% + 账户状态正常
2. 排序：匹配分数 = 能力匹配度*0.3 + 历史评分*0.25 + 准时率*0.2 + 价格竞争力*0.15 + 合作默契度*0.1
3. 推送：向Top 3设计师推送任务邀请
4. 先到先得：先确认的设计师获得任务

策略2：指定分配（特殊项目）
适用场景：
- P0高难度任务
- 客户指定设计师
- 新设计师试单
流程：
1. 你直接指定设计师
2. 系统发送专属邀请
3. 设计师2小时内确认，否则重新分配

策略3：公开抢单（简单任务）
适用场景：
- P2简单任务
- 时间紧急的任务
流程：
1. 任务发布到公开池
2. 所有符合资格的设计师可见
3. 设计师提交报价和工期
4. 客户/你选择最合适的设计师
```

**任务生命周期管理：**

```
状态机：

[待分配] → [已邀请] → [已确认] → [进行中] → [待审核] → [待修改] → [已完成]
              ↓           ↓           ↓           ↓
           [已拒绝]    [超时放弃]   [申请延期]   [审核驳回]

每个状态的自动处理：
- 待分配 → 已邀请：系统自动发送邀请（飞书/微信/邮件）
- 已邀请 → 已确认/已拒绝/超时放弃：2小时自动处理
- 进行中 → 待审核：设计师提交成果
- 待审核 → 待修改/已完成：你或AI质检后流转
- 待修改 → 已完成：修改完成并通过审核
```

### 1.2.3 结算与分润系统

**结算模型：**

```
平台收入 = 客户支付的设计费

成本构成：
- 设计师分成：60-70%（根据等级不同）
- 平台运营成本：10-15%（你的人工、工具费用等）
- 平台利润：15-30%

设计师等级与分成比例：
- 一星（试单期）：60%
- 二星（活跃期）：65%
- 三星（核心）：70%
- 核心合伙人：75% + 期权

结算周期：
- 客户付款后：平台先收款
- 项目验收后：设计师可申请结算
- 结算审核：3个工作日内完成
- 打款：每月10日和25日统一打款

质保金机制：
- 每笔结算扣留10%作为质保金
- 质保期：项目交付后3个月
- 无客户投诉：质保金释放
- 有质量问题：从质保金扣除
```

**财务流程：**

```
客户付款 → 平台账户
    ↓
任务验收通过
    ↓
生成结算单：设计师分成金额
    ↓
你审核结算单
    ↓
财务复核（如有人工财务）
    ↓
打款到设计师银行卡
    ↓
生成财务报表
```

---

## 1.3 AI工具链配置手册

### 1.3.1 工具选型矩阵

| 任务类型 | 推荐工具 | 成本 | 学习难度 | 输出质量 |
|---------|---------|------|---------|---------|
| 总图强排 | 自研Python + CAD API | 低 | 高 | 高 |
| 户型生成 | ComfyUI + ControlNet | 中 | 中 | 中-高 |
| 立面生成 | Midjourney/SD + PS | 中 | 低 | 高 |
| 效果图渲染 | D5/Enscape + AI后期 | 中 | 低 | 高 |
| 文本分析 | Claude/GPT-4 | 中 | 低 | 高 |
| 规范检查 | 自研规则引擎 | 低 | 高 | 高 |

### 1.3.2 ComfyUI工作流配置

**工作流1：立面概念生成**

```json
{
  "workflow_name": "立面概念生成_V1",
  "description": "基于参考图和文字描述生成建筑立面概念",
  "nodes": [
    {
      "id": "1",
      "type": "LoadImage",
      "name": "参考图输入",
      "inputs": [],
      "outputs": ["图像"]
    },
    {
      "id": "2",
      "type": "CLIPTextEncode",
      "name": "风格描述",
      "inputs": ["文本输入"],
      "outputs": ["条件"]
    },
    {
      "id": "3",
      "type": "ControlNetLoader",
      "name": "ControlNet模型",
      "model": "control_v11f1p_sd15_depth.pth"
    },
    {
      "id": "4",
      "type": "KSampler",
      "name": "采样器",
      "settings": {
        "steps": 30,
        "cfg": 7.5,
        "sampler_name": "DPM++ 2M Karras"
      }
    },
    {
      "id": "5",
      "type": "SaveImage",
      "name": "输出保存"
    }
  ]
}
```

**Prompt模板（立面生成）：**

```markdown
正向Prompt结构：
[建筑风格], [材质描述], [构图描述], [氛围描述], [技术参数]

示例：
Modern luxury residential facade, floor-to-ceiling glass windows, 
light beige stone cladding, clean geometric lines, 
elegant entrance canopy, warm evening lighting, 
architectural photography, high detail, 8k, photorealistic

负向Prompt：
blurry, low quality, distorted perspective, oversaturated, 
cartoon, anime, watermark, text, people, cars
```

**你需要的配置步骤：**

```
Step 1: 安装ComfyUI
- 下载地址：github.com/comfyanonymous/ComfyUI
- 推荐用整合包（秋叶整合包等）
- 确保显卡支持CUDA（推荐RTX 3060以上）

Step 2: 安装必要插件
- ComfyUI-Manager（插件管理器）
- ComfyUI-ControlNet-Aux（ControlNet预处理）
- WAS Node Suite（实用工具节点）

Step 3: 下载模型
- 基础模型：RealVisXL V4.0 / Juggernaut XL
- LoRA模型：建筑专用LoRA（ civitai.com搜索"architecture"）
- ControlNet：depth/canny/lineart模型

Step 4: 导入你的工作流
- 打开ComfyUI
- 导入上面提供的JSON工作流
- 测试运行

Step 5: 微调优化
- 用你的HRB/YC项目图作为参考
- 调整Prompt获得最佳效果
- 保存为预设模板
```

### 1.3.3 知识库RAG系统搭建

**系统架构：**

```
┌─────────────────────────────────────────────────────────────┐
│  文档加载                                                     │
│  ├── 读取wiki/目录下的Markdown文件                            │
│  ├── 解析PDF/PPT（未来扩展）                                  │
│  └── 提取文本和元数据（frontmatter）                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  文本分割                                                     │
│  ├── 按章节分割（Markdown标题）                               │
│  ├── 按语义分割（LLM辅助）                                    │
│  └── 保持上下文窗口（前后文关联）                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Embedding                                                    │
│  ├── 模型：text-embedding-3-large                           │
│  └── 输出：1536维向量                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  向量存储                                                     │
│  ├── 数据库：Chroma（本地）或 Pinecone（云端）                │
│  └── 索引：项目名+文档类型+章节                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  检索与生成                                                   │
│  ├── 用户问题 → Embedding                                     │
│  ├── 相似度搜索（Top 5相关段落）                              │
│  └── LLM生成回答（基于检索内容）                              │
└─────────────────────────────────────────────────────────────┘
```

**代码实现：**

```python
# rmoai_knowledge_base.py
import os
import json
from pathlib import Path
from typing import List, Dict
import chromadb
from chromadb.config import Settings
from openai import OpenAI

class RMOAIKnowledgeBase:
    def __init__(self, wiki_path: str, db_path: str = "./chroma_db"):
        self.wiki_path = Path(wiki_path)
        self.client = OpenAI()  # 需要OPENAI_API_KEY环境变量
        
        # 初始化ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # 获取或创建collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="rmoai_wiki",
            metadata={"hnsw:space": "cosine"}
        )
    
    def load_markdown_files(self) -> List[Dict]:
        """加载wiki目录下的所有markdown文件"""
        documents = []
        
        for md_file in self.wiki_path.rglob("*.md"):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 解析frontmatter
            frontmatter = self._parse_frontmatter(content)
            
            # 提取正文
            body = self._extract_body(content)
            
            documents.append({
                "path": str(md_file.relative_to(self.wiki_path)),
                "frontmatter": frontmatter,
                "content": body
            })
        
        return documents
    
    def _parse_frontmatter(self, content: str) -> Dict:
        """解析Markdown frontmatter"""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                import yaml
                return yaml.safe_load(parts[1]) or {}
        return {}
    
    def _extract_body(self, content: str) -> str:
        """提取Markdown正文"""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                return parts[2].strip()
        return content
    
    def chunk_documents(self, documents: List[Dict], chunk_size: int = 1000) -> List[Dict]:
        """将文档分割成chunk"""
        chunks = []
        
        for doc in documents:
            content = doc['content']
            
            # 按标题分割
            sections = self._split_by_headers(content)
            
            for i, section in enumerate(sections):
                # 如果section太长，进一步分割
                if len(section) > chunk_size:
                    sub_chunks = self._split_long_section(section, chunk_size)
                    for j, sub in enumerate(sub_chunks):
                        chunks.append({
                            "path": doc['path'],
                            "section_index": f"{i}-{j}",
                            "content": sub,
                            "metadata": {
                                "source": doc['path'],
                                "type": doc['frontmatter'].get('type', 'unknown'),
                                "tags": doc['frontmatter'].get('tags', [])
                            }
                        })
                else:
                    chunks.append({
                        "path": doc['path'],
                        "section_index": str(i),
                        "content": section,
                        "metadata": {
                            "source": doc['path'],
                            "type": doc['frontmatter'].get('type', 'unknown'),
                            "tags": doc['frontmatter'].get('tags', [])
                        }
                    })
        
        return chunks
    
    def _split_by_headers(self, content: str) -> List[str]:
        """按Markdown标题分割"""
        import re
        # 匹配 ## 或 ### 开头的行
        headers = re.split(r'\n(?=##+ )', content)
        return [h.strip() for h in headers if h.strip()]
    
    def _split_long_section(self, section: str, chunk_size: int) -> List[str]:
        """将长段落分割成更小的chunk"""
        chunks = []
        current_chunk = ""
        
        for paragraph in section.split('\n\n'):
            if len(current_chunk) + len(paragraph) < chunk_size:
                current_chunk += paragraph + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = paragraph + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def embed_and_store(self, chunks: List[Dict]):
        """生成embedding并存储到向量数据库"""
        
        for i, chunk in enumerate(chunks):
            # 生成embedding
            response = self.client.embeddings.create(
                model="text-embedding-3-large",
                input=chunk['content']
            )
            embedding = response.data[0].embedding
            
            # 存储到ChromaDB
            self.collection.add(
                ids=[f"{chunk['path']}_{chunk['section_index']}"],
                embeddings=[embedding],
                documents=[chunk['content']],
                metadatas=[chunk['metadata']]
            )
            
            if (i + 1) % 10 == 0:
                print(f"已处理 {i + 1}/{len(chunks)} chunks")
        
        print(f"完成！共存储 {len(chunks)} chunks")
    
    def query(self, question: str, n_results: int = 5) -> List[Dict]:
        """查询知识库"""
        
        # 生成问题embedding
        response = self.client.embeddings.create(
            model="text-embedding-3-large",
            input=question
        )
        query_embedding = response.data[0].embedding
        
        # 检索相似文档
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # 格式化结果
        formatted_results = []
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i]
            })
        
        return formatted_results
    
    def generate_answer(self, question: str, context: List[Dict]) -> str:
        """基于检索结果生成回答"""
        
        # 构建上下文
        context_text = "\n\n".join([
            f"[来源: {c['metadata']['source']}]\n{c['content']}"
            for c in context
        ])
        
        # 调用LLM生成回答
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """你是一名建筑设计专家，基于提供的知识库内容回答问题。
                    回答要求：
                    1. 只基于提供的上下文，不要添加外部知识
                    2. 如果上下文不足以回答问题，明确说明
                    3. 引用具体的来源文档
                    4. 结构化输出，使用 bullet points"""
                },
                {
                    "role": "user",
                    "content": f"""基于以下知识库内容回答问题：

知识库内容：
{context_text}

问题：{question}"""
                }
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content

# 使用示例
if __name__ == "__main__":
    # 初始化知识库
    kb = RMOAIKnowledgeBase(wiki_path="./wiki")
    
    # 加载文档
    print("加载文档...")
    docs = kb.load_markdown_files()
    print(f"加载了 {len(docs)} 个文档")
    
    # 分块
    print("分割文档...")
    chunks = kb.chunk_documents(docs)
    print(f"生成了 {len(chunks)} 个chunks")
    
    # 存储
    print("生成embedding并存储...")
    kb.embed_and_store(chunks)
    
    # 查询测试
    question = "极寒地区豪宅立面应该怎么做？"
    print(f"\n查询: {question}")
    results = kb.query(question, n_results=5)
    
    print("\n检索结果：")
    for r in results:
        print(f"- {r['metadata']['source']} (相似度: {1-r['distance']:.2f})")
    
    # 生成回答
    answer = kb.generate_answer(question, results)
    print(f"\n回答：\n{answer}")
```

**部署步骤：**

```bash
# 1. 创建项目目录
mkdir rmoai-platform
cd rmoai-platform

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装依赖
pip install openai chromadb pyyaml

# 4. 设置环境变量
export OPENAI_API_KEY="your-api-key"

# 5. 运行知识库构建
python rmoai_knowledge_base.py

# 6. 测试查询
python -c "
from rmoai_knowledge_base import RMOAIKnowledgeBase
kb = RMOAIKnowledgeBase('./wiki')
results = kb.query('极寒地区豪宅立面')
print(results)
"
```

---

> 本模块是 RMO-AI 平台的技术架构基础，涵盖了任务拆解、设计师管理和AI工具链三大核心系统。
