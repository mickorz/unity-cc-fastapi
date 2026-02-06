# com.kiff.cc-fastapi

> Claude Code CLI 中转 API 服务器 - Unity 集成包

**中文版** | [English](README.md)

在 Unity 编辑器中一键启动 Claude Code API 服务，支持流式聊天、会话管理等功能。

---

## 功能特性

- **一键启动/停止** - 在 Unity 编辑器内直接控制服务器
- **流式聊天 API** - 基于 SSE 协议的实时响应
- **会话管理** - 支持会话创建、恢复、查询、删除
- **权限控制** - 支持多种权限模式（pure/simple/readonly/projectwrite）
- **并发限制** - 内置请求队列和并发控制
- **自动部署** - 首次使用自动安装依赖

---

## 快速开始

### 安装

在 Unity 项目的 `Packages/manifest.json` 中添加：

```json
{
  "dependencies": {
    "com.kiff.cc-fastapi": "https://github.com/mickorz/unity-cc-fastapi.git"
  }
}
```

或直接克隆到 `Packages` 目录：

```bash
git clone https://github.com/mickorz/unity-cc-fastapi.git Packages/com.kiff.cc-fastapi
```

### 前置要求

1. **Node.js** - 下载安装 [Node.js](https://nodejs.org/)（v16 或更高版本）
2. **Claude CLI** - 确保系统已安装 Claude Code CLI

### 使用步骤

1. 打开 Unity 编辑器
2. 菜单栏选择 `Tools > cc-fastapi > 管理器`
3. 点击"启动服务器"按钮
4. 等待首次依赖安装（仅第一次需要）
5. 服务器启动成功后访问 `http://localhost:3000/docs`

---

## 管理器窗口

### 打开方式

```
菜单: Tools > cc-fastapi > 管理器
快捷键: (可自定义)
```

### 窗口功能

| 功能 | 说明 |
|------|------|
| 状态卡片 | 显示服务器运行状态、地址、路径 |
| 启动按钮 | 启动 cc-fastapi 服务器 |
| 停止按钮 | 停止正在运行的服务器 |
| API 文档 | 在浏览器中打开 Swagger 文档 |
| 调试页面 | 在浏览器中打开测试调试页面 |

---

## API 接口简介

### 基础信息

- **默认地址**: `http://localhost:3000`
- **API 文档**: `http://localhost:3000/docs`
- **调试页面**: `http://localhost:3000/public/test-debug.html`

### 聊天接口

#### POST /chat/stream

流式聊天接口，支持新会话或恢复已有会话。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 用户输入的提示词 |
| sessionId | string | 否 | 会话 ID，不传则创建新会话 |
| workspace | string | 否 | 工作目录路径 |
| externaldirs | string | 否 | 外部文件夹列表，逗号分隔 |
| allowedmode | string | 否 | 权限模式：pure/simple/readonly/projectwrite |
| vision | string | 否 | 禁止幻觉参数 |

**请求示例：**

```json
{
    "prompt": "帮我创建一个 TypeScript 接口",
    "workspace": "D:/MyProject",
    "allowedmode": "projectwrite"
}
```

**响应格式 (SSE)：**

```
data: {"type":"start","sessionId":"new"}

data: {"type":"data","content":{...}}

data: {"type":"end","sessionId":"new"}
```

### 会话管理接口

#### GET /session/list

获取当前项目的所有会话列表。

**响应示例：**

```json
{
    "projectPath": "D:/MyProject",
    "totalSessions": 3,
    "sessions": [
        {
            "sessionId": "cli-xxxxxxxx",
            "summary": "创建 TypeScript 接口",
            "firstPrompt": "帮我创建一个 TypeScript 接口",
            "messageCount": 5,
            "created": "2024-01-01 10:00:00",
            "modified": "2024-01-01 10:30:00",
            "gitBranch": "main"
        }
    ]
}
```

#### GET /session/check/:sessionid

检查指定会话是否存在。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionid | string | 会话 ID |

**响应示例：**

```json
{
    "exists": true,
    "session": {
        "sessionId": "cli-xxxxxxxx",
        "summary": "创建 TypeScript 接口",
        "messageCount": 5
    }
}
```

#### DELETE /session/delete/:sessionid

删除指定会话及其缓存。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionid | string | 会话 ID |

**响应示例：**

```json
{
    "success": true,
    "message": "Session 已删除",
    "sessionId": "cli-xxxxxxxx"
}
```

### 状态监控接口

#### GET /health

健康检查接口。

**响应示例：**

```json
{
    "status": "ok",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "uptime": 123.456
}
```

#### GET /status/concurrency

获取当前并发状态。

**响应示例：**

```json
{
    "active": 1,
    "max": 3,
    "available": 2,
    "queued": 0
}
```

#### GET /status/queue

获取等待队列详情。

**响应示例：**

```json
{
    "count": 2,
    "tasks": [
        {
            "timestamp": 1704100800000,
            "waitingMs": 500
        }
    ]
}
```

### 其他接口

#### GET /count

计数功能接口（测试用）。

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| start | number | 1 | 起始数字（最小 1） |
| end | number | 10 | 结束数字（最大 10） |

**响应示例：**

```json
{
    "success": true,
    "data": {
        "numbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "count": 10,
        "range": {
            "start": 1,
            "end": 10
        }
    }
}
```

---

## 权限模式说明

| 模式 | 说明 |
|------|------|
| pure | 纯粹模式，无特殊权限 |
| simple | 允许联网 |
| readonly | 只读模式，不能修改文件 |
| projectwrite | 工程可写模式 |

---

## 配置说明

### 环境变量配置 (.env)

服务器使用 `.env` 文件配置环境变量。首次启动前，需要创建配置文件。

#### 配置步骤

1. **定位到包目录**

   在 Unity 中安装包后，找到以下路径：
   ```
   Packages/com.kiff.cc-fastapi/Runtime/cc-fastapi/
   ```

2. **创建 .env 文件**

   复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   # Windows
   copy .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

3. **编辑配置**

   用文本编辑器打开 `.env` 文件，根据需要修改配置。

#### 环境变量说明

```env
# ============================================
# 工作目录配置
# ============================================
# Claude CLI 执行的工作目录
# 默认为当前工作目录，可设置为绝对路径
WORKING_DIR=./workspace

# ============================================
# Anthropic API 配置
# ============================================
# Anthropic API 密钥（必填）
# 获取地址：https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_api_key_here

# Anthropic API 基础 URL（可选）
# 如需使用代理或自定义端点，取消注释并设置
# ANTHROPIC_BASE_URL=https://api.anthropic.com

# ============================================
# 国产大模型配置（GLM Coding Plan）
# ============================================
# GLM Coding Plan 是智谱 AI 提供的工具，让 Claude Code 可以使用 GLM-4.7 等模型
# 配置方式：修改 Claude Code 配置文件 ~/.claude/settings.json
#
# 步骤 1：获取智谱 API Key
#   访问：https://open.bigmodel.cn/usercenter/apikeys
#
# 步骤 2：修改 ~/.claude/settings.json 配置文件
#   在 Windows 上通常位于：C:\Users\你的用户名\.claude\settings.json
#   在 macOS/Linux 上位于：~/.claude/settings.json
#
#   配置内容：
#   {
#     "env": {
#       "ANTHROPIC_API_KEY": "你的智谱API_Key",
#       "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
#       "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
#       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
#       "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
#     }
#   }
#
# 支持的 GLM 模型：
# - glm-4.7：最新旗舰模型，能力最强（推荐）
# - glm-4.5-air：轻量级模型，响应快速
# - glm-4-flash：超快速模型
# - glm-4-plus：增强版模型
#
# 详细文档：https://docs.bigmodel.cn/cn/coding-plan/tool/claude
# 注意：配置完成后需要重启 Claude Code（关闭所有窗口后重新启动）

# ============================================
# 第三方服务配置（可选）
# ============================================
# GitHub 个人访问令牌（可选）
# 用于 Claude CLI 执行 Git 操作时验证身份
# 获取地址：https://github.com/settings/tokens
# GITHUB_PAT=your_github_pat_here

# Context7 API 密钥（可选）
# 如果使用 Context7 服务，请设置此密钥
# CONTEXT7_API_KEY=your_context7_key_here

# ============================================
# 服务器配置
# ============================================
# 服务器监听端口（默认 3000）
PORT=3000

# 服务器监听地址（默认 0.0.0.0，允许所有来源访问）
HOST=0.0.0.0

# ============================================
# CORS 跨域配置
# ============================================
# 允许的跨域来源（* 表示允许所有来源）
# 生产环境建议设置具体域名，如：http://localhost:3000
CORS_ORIGIN=*
```

#### 配置项详解

| 配置项 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `WORKING_DIR` | 否 | `./workspace` | Claude CLI 工作目录，相对路径基于包根目录 |
| `ANTHROPIC_API_KEY` | 是 | 无 | API 密钥（支持 Anthropic 或智谱 AI） |
| `ANTHROPIC_BASE_URL` | 否 | 官方地址 | API 请求地址，支持代理/自定义端点/国产模型 |
| `GITHUB_PAT` | 否 | 无 | GitHub 令牌，用于 Git 操作验证 |
| `CONTEXT7_API_KEY` | 否 | 无 | Context7 服务密钥 |
| `PORT` | 否 | `3000` | 服务器监听端口 |
| `HOST` | 否 | `0.0.0.0` | 服务器监听地址 |
| `CORS_ORIGIN` | 否 | `*` | 允许的跨域来源 |

#### 安全提示

- **不要提交 .env 文件到版本控制系统**
- `.env` 文件包含敏感信息（API 密钥），已自动加入 `.gitignore`
- 团队协作时，各自配置本地的 `.env` 文件
- 生产环境使用环境变量或密钥管理服务

#### 示例配置

**开发环境配置（Anthropic Claude）：**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=3000
HOST=localhost
CORS_ORIGIN=http://localhost:3000
```

**生产环境配置（Anthropic Claude）：**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
```

**国产大模型配置（智谱 AI GLM-4-Air）：**
```env
# 智谱 AI API Key（从 https://open.bigmodel.cn/usercenter/apikeys 获取）
ANTHROPIC_API_KEY=your_zhipu_api_key_here

# 智谱 API 端点
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/paas/v4/

# 其他配置保持不变
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=*
```

**国产大模型配置（智谱 AI GLM-4-Flash，超快速）：**
```env
# 智谱 AI API Key
ANTHROPIC_API_KEY=your_zhipu_api_key_here

# 智谱 API 端点
ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/paas/v4/

# 服务器配置
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=*
```

#### 国产大模型配置说明（GLM Coding Plan）

cc-fastapi 支持通过 GLM Coding Plan 使用智谱 AI 的 GLM-4.7 等国产大模型。

##### 什么是 GLM Coding Plan

GLM Coding Plan 是智谱 AI 提供的兼容方案，让 Claude Code 可以无缝切换到 GLM 系列模型，无需修改代码，只需配置即可。

##### 支持的模型

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| `glm-4.7` | 最新旗舰模型，能力最强 | 复杂任务、生产环境（推荐） |
| `glm-4.5-air` | 轻量级模型，响应快速 | 日常对话、简单任务 |
| `glm-4-flash` | 超高速响应 | 实时交互、快速问答 |
| `glm-4-plus` | 增强版模型 | 高级推理、深度分析 |

##### 配置步骤

**步骤 1：注册智谱 AI 账号**

- 访问：https://open.bigmodel.cn/
- 完成注册和实名认证

**步骤 2：获取 API Key**

- 进入：https://open.bigmodel.cn/usercenter/apikeys
- 创建新的 API Key
- 复制保存 Key（只显示一次）

**步骤 3：修改 Claude Code 配置文件**

配置文件位置：
- **Windows**: `C:\Users\你的用户名\.claude\settings.json`
- **macOS/Linux**: `~/.claude/settings.json`

配置内容：
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "你的智谱API_Key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

**步骤 4：重启 Claude Code**

1. 关闭所有 Claude Code 窗口
2. 打开新的命令行窗口
3. 运行 `claude` 启动
4. 在 Claude Code 中输入 `/status` 确认模型状态

##### 快速配置脚本（可选）

如果不想手动编辑配置文件，可以通过环境变量方式配置（临时）：

**Windows PowerShell:**
```powershell
$env:ANTHROPIC_API_KEY="你的智谱API_Key"
$env:ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
claude
```

**macOS/Linux:**
```bash
export ANTHROPIC_API_KEY="你的智谱API_Key"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
claude
```

##### 费用说明

智谱 AI 提供新用户免费额度，具体定价请参考：
- https://open.bigmodel.cn/pricing

##### 与 Claude 的差异

| 特性 | Anthropic Claude | 智谱 GLM-4.7 |
|------|------------------|--------------|
| 配置方式 | 原生支持 | 修改 settings.json |
| 响应速度 | 快 | 极快 |
| 中文理解 | 优秀 | 更优秀 |
| 代码能力 | 强 | 强 |
| 价格 | 较高 | 较低 |
| 免费额度 | 无 | 有 |

##### 常见问题

**Q: 配置后不生效？**

A: 请确保：
1. 完全关闭所有 Claude Code 窗口
2. 检查 JSON 格式是否正确（可用在线工具验证）
3. 重新打开命令行窗口启动

**Q: 如何确认模型切换成功？**

A: 在 Claude Code 中输入 `/status` 命令，查看当前使用的模型。

**Q: 支持哪些 Claude Code 版本？**

A: 建议使用 2.0.14 或更高版本：
```bash
# 检查当前版本
claude --version

# 升级到最新版本
claude update
```

##### 更多信息

- 官方文档：https://docs.bigmodel.cn/cn/coding-plan/tool/claude
- 智谱开放平台：https://open.bigmodel.cn/

### Unity 配置

通过 `EditorPrefs` 保存配置：

| 键 | 说明 |
|-----|------|
| KiffCcFastApi_Port | 服务器端口 |
| KiffCcFastApi_Host | 服务器地址 |
| KiffCcFastApi_AutoStart | 是否自动启动 |

---

## Unity API 使用

### C# 调用示例

```csharp
using Ember.UnityMcp.Editor.UI.Components.Connect.Tabs;

// 启动服务器
await CcFastApiController.StartServerAsync();

// 获取状态
var status = CcFastApiController.GetStatus();
if (status.IsRunning)
{
    Debug.Log($"服务器运行在: {status.Host}:{status.Port}");
}

// 停止服务器
await CcFastApiController.StopServerAsync();
```

### HTTP 调用示例

```csharp
using UnityWebRequest;

// 发送聊天请求
string json = "{\"prompt\":\"帮我创建一个 C# 脚本\"}";

using (var request = new UnityWebRequest("http://localhost:3000/chat/stream", "POST"))
{
    request.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(json));
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");

    yield return request.SendWebRequest();

    if (request.result == UnityWebRequest.Result.Success)
    {
        Debug.Log(request.downloadHandler.text);
    }
}
```

---

## 目录结构

```
Packages/com.kiff.cc-fastapi/
├── package.json                    # Unity Package 清单
├── README.md                       # 本文档
├── CHANGELOG.md                    # 版本更新日志
│
├── Runtime/                        # Node.js 运行时文件
│   └── cc-fastapi/                 # 完整的 Node.js 项目
│       ├── src/                    # TypeScript 源码
│       ├── dist/                   # 编译后的 JS
│       ├── node_modules/           # 依赖包（首次运行时安装）
│       ├── package.json            # Node.js 项目配置
│       └── .env.example            # 环境变量模板
│
├── Editor/                         # Unity 编辑器代码
│   ├── Controllers/
│   │   └── CcFastApiController.cs  # 主控制器
│   ├── UI/
│   │   └── CcFastApiWindow.cs      # 管理窗口
│   ├── Utils/
│   │   ├── NodeDetector.cs         # Node.js 环境检测
│   │   ├── ProcessManager.cs       # 进程管理工具
│   │   └── PathResolver.cs         # 路径解析工具
│   └── Installer/
│       └── PackageInstaller.cs     # 自动安装脚本
│
├── Samples/                        # 示例配置
│   └── Configuration/
│       └── cc-fastapi.config.json  # 默认配置
│
└── Documentation~/                 # 文档（Unity 可访问）
    └── cc-fastapi.md               # 使用文档
```

---

## 更新计划

### v1.1.0 (计划中)

- [ ] 添加远程服务器模式支持
- [ ] 支持通过 UI 更新服务器代码
- [ ] 添加日志查看面板
- [ ] 支持多实例管理

### v1.2.0 (规划中)

- [ ] 添加单元测试覆盖
- [ ] 支持 Docker 部署模式
- [ ] 添加性能监控面板
- [ ] 支持 WebSocket 连接

### v2.0.0 (未来)

- [ ] 完全重写 UI（UI Toolkit）
- [ ] 支持自定义中间件
- [ ] 添加插件系统
- [ ] 支持多语言配置

---

## 常见问题

### Q: 提示"未检测到 Node.js"

**A:** 请从 [Node.js 官网](https://nodejs.org/) 下载安装，安装后重启 Unity 编辑器。

### Q: 首次启动很慢

**A:** 首次启动需要安装 Node.js 依赖包，请耐心等待。后续启动会快很多。

### Q: 端口 3000 被占用

**A:** 可以通过环境变量 `PORT` 修改端口，或在配置中更改。

### Q: 如何查看服务器日志

**A:** 日志会输出到 Unity Console，窗口前缀为 `[cc-fastapi]`。

### Q: 服务器启动失败

**A:** 请检查：
1. Node.js 是否正确安装
2. 端口是否被占用
3. Claude CLI 是否可用

### Q: 如何使用国产大模型 GLM-4.7？

**A:** 使用 GLM Coding Plan 配置：
1. 访问 https://open.bigmodel.cn/ 注册账号并获取 API Key
2. 修改 Claude Code 配置文件 `~/.claude/settings.json`：
   ```json
   {
     "env": {
       "ANTHROPIC_API_KEY": "你的智谱API_Key",
       "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
     }
   }
   ```
3. 关闭所有 Claude Code 窗口并重新启动

### Q: GLM-4.7 和 Claude 有什么区别？

**A:** 主要差异：
- **配置方式**：GLM 需修改 settings.json，Claude 原生支持
- **响应速度**：GLM-4.7 更快，中文理解更好
- **价格**：GLM-4.7 价格更低，且有免费额度
- **兼容性**：GLM Coding Plan 完全兼容 Claude Code

### Q: GLM Coding Plan 配置后不生效？

**A:** 请检查：
1. 是否完全关闭所有 Claude Code 窗口
2. settings.json 的 JSON 格式是否正确
3. 配置文件路径是否正确（Windows: `C:\Users\你的用户名\.claude\settings.json`）
4. 在 Claude Code 中输入 `/status` 确认模型状态

### Q: 如何确认已切换到 GLM 模型？

**A:** 在 Claude Code 中执行 `/status` 命令，会显示当前使用的模型名称（如 glm-4.7）。

---

## 技术支持

- **问题反馈**: [GitHub Issues](https://github.com/mickorz/unity-cc-fastapi/issues)
- **仓库地址**: [GitHub](https://github.com/mickorz/unity-cc-fastapi)

---

## 许可证

MIT License

---

## 相关链接

- [Claude Code 官网](https://claude.ai/code)
- [GLM Coding Plan 文档](https://docs.bigmodel.cn/cn/coding-plan/tool/claude)
- [智谱 AI 开放平台](https://open.bigmodel.cn/)
- [智谱 AI API 文档](https://open.bigmodel.cn/dev/api)
- [Fastify 文档](https://www.fastify.io/docs/latest/)
- [Unity Package Manager](https://docs.unity3d.com/Manual/Packages.html)
