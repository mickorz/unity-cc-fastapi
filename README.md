# com.kiff.cc-fastapi

> Claude Code CLI Proxy API Server - Unity Integration Package

[中文版](README_Zh.md) | **English**

Start Claude Code API server with one click in Unity Editor, featuring streaming chat, session management, and more.

---

## Features

- **One-Click Start/Stop** - Control server directly within Unity Editor
- **Streaming Chat API** - Real-time responses via SSE protocol
- **Session Management** - Support for creating, resuming, querying, and deleting sessions
- **Permission Control** - Multiple permission modes (pure/simple/readonly/projectwrite)
- **Concurrency Control** - Built-in request queue and concurrency management
- **Auto Deployment** - Automatic dependency installation on first use

---

## Quick Start

### Installation

Add to your Unity project's `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.kiff.cc-fastapi": "https://github.com/mickorz/unity-cc-fastapi.git"
  }
}
```

Or clone directly to `Packages` directory:

```bash
git clone https://github.com/mickorz/unity-cc-fastapi.git Packages/com.kiff.cc-fastapi
```

### Prerequisites

1. **Node.js** - Download and install [Node.js](https://nodejs.org/) (v16 or higher)
2. **Claude CLI** - Ensure Claude Code CLI is installed on your system

### Usage Steps

1. Open Unity Editor
2. Navigate to `Tools > cc-fastapi > Manager`
3. Click "Start Server" button
4. Wait for initial dependency installation (only first time)
5. Visit `http://localhost:3000/docs` when server starts successfully

---

## Manager Window

### How to Open

```
Menu: Tools > cc-fastapi > Manager
Shortcut: (Customizable)
```

### Window Functions

| Function | Description |
|----------|-------------|
| Status Card | Display server status, address, and path |
| Start Button | Start cc-fastapi server |
| Stop Button | Stop running server |
| API Docs | Open Swagger documentation in browser |
| Debug Page | Open test debug page in browser |

---

## API Overview

### Basic Information

- **Default Address**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/docs`
- **Debug Page**: `http://localhost:3000/public/test-debug.html`

### Chat Endpoint

#### POST /chat/stream

Streaming chat endpoint, supports creating new sessions or resuming existing ones.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | User input prompt |
| sessionId | string | No | Session ID, creates new session if not provided |
| workspace | string | No | Workspace directory path |
| externaldirs | string | No | External directory list, comma-separated |
| allowedmode | string | No | Permission mode: pure/simple/readonly/projectwrite |
| vision | string | No | Hallucination prevention parameter |

**Request Example:**

```json
{
    "prompt": "Help me create a TypeScript interface",
    "workspace": "D:/MyProject",
    "allowedmode": "projectwrite"
}
```

**Response Format (SSE):**

```
data: {"type":"start","sessionId":"new"}

data: {"type":"data","content":{...}}

data: {"type":"end","sessionId":"new"}
```

### Session Management Endpoints

#### GET /session/list

Get all sessions for current project.

**Response Example:**

```json
{
    "projectPath": "D:/MyProject",
    "totalSessions": 3,
    "sessions": [
        {
            "sessionId": "cli-xxxxxxxx",
            "summary": "Create TypeScript interface",
            "firstPrompt": "Help me create a TypeScript interface",
            "messageCount": 5,
            "created": "2024-01-01 10:00:00",
            "modified": "2024-01-01 10:30:00",
            "gitBranch": "main"
        }
    ]
}
```

#### GET /session/check/:sessionid

Check if specified session exists.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sessionid | string | Session ID |

**Response Example:**

```json
{
    "exists": true,
    "session": {
        "sessionId": "cli-xxxxxxxx",
        "summary": "Create TypeScript interface",
        "messageCount": 5
    }
}
```

#### DELETE /session/delete/:sessionid

Delete specified session and its cache.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| sessionid | string | Session ID |

**Response Example:**

```json
{
    "success": true,
    "message": "Session deleted",
    "sessionId": "cli-xxxxxxxx"
}
```

### Status Monitoring Endpoints

#### GET /health

Health check endpoint.

**Response Example:**

```json
{
    "status": "ok",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "uptime": 123.456
}
```

#### GET /status/concurrency

Get current concurrency status.

**Response Example:**

```json
{
    "active": 1,
    "max": 3,
    "available": 2,
    "queued": 0
}
```

#### GET /status/queue

Get waiting queue details.

**Response Example:**

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

### Other Endpoints

#### GET /count

Count function endpoint (for testing).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| start | number | 1 | Start number (min 1) |
| end | number | 10 | End number (max 10) |

**Response Example:**

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

## Permission Modes

| Mode | Description |
|------|-------------|
| pure | Pure mode, no special permissions |
| simple | Allow network access |
| readonly | Read-only mode, cannot modify files |
| projectwrite | Project writable mode |

---

## Configuration

### Environment Variables (.env)

The server uses `.env` file for configuration. Create this file before first launch.

#### Configuration Steps

1. **Locate Package Directory**

   After installing in Unity, find the path:
   ```
   Packages/com.kiff.cc-fastapi/Runtime/cc-fastapi/
   ```

2. **Create .env File**

   Copy `.env.example` and rename to `.env`:
   ```bash
   # Windows
   copy .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

3. **Edit Configuration**

   Open `.env` in text editor and modify as needed.

#### Environment Variables

```env
# ============================================
# Working Directory Configuration
# ============================================
# Claude CLI working directory
# Default: current working directory, can be absolute path
WORKING_DIR=./workspace

# ============================================
# Anthropic API Configuration
# ============================================
# Anthropic API Key (required)
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_api_key_here

# Anthropic API Base URL (optional)
# Uncomment for proxy or custom endpoint
# ANTHROPIC_BASE_URL=https://api.anthropic.com

# ============================================
# LLM Model Configuration (GLM Coding Plan)
# ============================================
# GLM Coding Plan by Zhipu AI allows Claude Code to use GLM-4.7 models
# Configuration: Modify ~/.claude/settings.json
#
# Step 1: Get Zhipu API Key
#   Visit: https://open.bigmodel.cn/usercenter/apikeys
#
# Step 2: Modify ~/.claude/settings.json
#   Windows: C:\Users\YourUsername\.claude\settings.json
#   macOS/Linux: ~/.claude/settings.json
#
#   Configuration:
#   {
#     "env": {
#       "ANTHROPIC_API_KEY": "your_zhipu_api_key",
#       "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
#       "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
#       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
#       "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
#     }
#   }
#
# Supported GLM Models:
# - glm-4.7: Latest flagship model, most powerful (recommended)
# - glm-4.5-air: Lightweight model, fast response
# - glm-4-flash: Ultra-fast model
# - glm-4-plus: Enhanced model
#
# Documentation: https://docs.bigmodel.cn/cn/coding-plan/tool/claude
# Note: Restart Claude Code after configuration

# ============================================
# Third-Party Services (Optional)
# ============================================
# GitHub Personal Access Token (optional)
# For Git operations authentication
# Get from: https://github.com/settings/tokens
# GITHUB_PAT=your_github_pat_here

# Context7 API Key (optional)
# Set if using Context7 service
# CONTEXT7_API_KEY=your_context7_key_here

# ============================================
# Server Configuration
# ============================================
# Server listening port (default 3000)
PORT=3000

# Server listening address (default 0.0.0.0, allow all)
HOST=0.0.0.0

# ============================================
# CORS Configuration
# ============================================
# Allowed CORS origins (* means all origins)
# For production, set specific domain
CORS_ORIGIN=*
```

#### Configuration Details

| Config | Required | Default | Description |
|--------|----------|---------|-------------|
| `WORKING_DIR` | No | `./workspace` | Claude CLI working directory |
| `ANTHROPIC_API_KEY` | Yes | None | API Key (supports Anthropic or Zhipu AI) |
| `ANTHROPIC_BASE_URL` | No | Official | API request URL, supports proxy/custom/LLM models |
| `GITHUB_PAT` | No | None | GitHub token for Git operations |
| `CONTEXT7_API_KEY` | No | None | Context7 service key |
| `PORT` | No | `3000` | Server listening port |
| `HOST` | No | `0.0.0.0` | Server listening address |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |

#### Security Notes

- **Never commit .env file to version control**
- `.env` contains sensitive information (API keys), already in `.gitignore`
- For team collaboration, configure local `.env` files individually
- Use environment variables or key management services in production

#### Example Configurations

**Development Environment (Anthropic Claude):**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=3000
HOST=localhost
CORS_ORIGIN=http://localhost:3000
```

**Production Environment (Anthropic Claude):**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
```

**LLM Model Configuration (Zhipu AI GLM-4.7):**
See [GLM Coding Plan](#glm-coding-plan-configuration) section below.

---

### GLM Coding Plan Configuration

cc-fastapi supports using Zhipu AI's GLM-4.7 and other LLM models via GLM Coding Plan.

#### What is GLM Coding Plan

GLM Coding Plan is a compatibility solution provided by Zhipu AI, allowing Claude Code to seamlessly switch to GLM series models without code changes.

#### Supported Models

| Model | Features | Use Cases |
|-------|----------|-----------|
| `glm-4.7` | Latest flagship, most powerful | Complex tasks, production (recommended) |
| `glm-4.5-air` | Lightweight, fast response | Daily conversations, simple tasks |
| `glm-4-flash` | Ultra-fast response | Real-time interaction, quick Q&A |
| `glm-4-plus` | Enhanced model | Advanced reasoning, deep analysis |

#### Configuration Steps

**Step 1: Register Zhipu AI Account**

- Visit: https://open.bigmodel.cn/
- Complete registration and identity verification

**Step 2: Get API Key**

- Go to: https://open.bigmodel.cn/usercenter/apikeys
- Create new API Key
- Copy and save the Key (shown only once)

**Step 3: Modify Claude Code Configuration File**

Configuration file location:
- **Windows**: `C:\Users\YourUsername\.claude\settings.json`
- **macOS/Linux**: `~/.claude/settings.json`

Configuration content:
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

**Step 4: Restart Claude Code**

1. Close all Claude Code windows
2. Open new command line window
3. Run `claude` to start
4. Enter `/status` in Claude Code to confirm model status

#### Quick Configuration Script (Optional)

If you prefer not to manually edit the configuration file, use environment variables (temporary):

**Windows PowerShell:**
```powershell
$env:ANTHROPIC_API_KEY="your_zhipu_api_key"
$env:ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
claude
```

**macOS/Linux:**
```bash
export ANTHROPIC_API_KEY="your_zhipu_api_key"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
export ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7"
claude
```

#### Pricing

Zhipu AI offers free tier for new users. For detailed pricing:
- https://open.bigmodel.cn/pricing

#### Comparison with Claude

| Feature | Anthropic Claude | Zhipu GLM-4.7 |
|---------|------------------|---------------|
| Configuration | Native support | Modify settings.json |
| Response Speed | Fast | Ultra fast |
| Chinese Understanding | Excellent | Better |
| Code Ability | Strong | Strong |
| Price | Higher | Lower |
| Free Tier | No | Yes |

#### Common Issues

**Q: Configuration not taking effect?**

A: Ensure:
1. Completely close all Claude Code windows
2. Check JSON format is correct (use online validator)
3. Restart from new command line window

**Q: How to confirm model switch?**

A: Enter `/status` command in Claude Code to view current model.

**Q: Which Claude Code versions are supported?**

A: Recommended 2.0.14 or higher:
```bash
# Check current version
claude --version

# Update to latest
claude update
```

#### More Information

- Official Documentation: https://docs.bigmodel.cn/cn/coding-plan/tool/claude
- Zhipu Open Platform: https://open.bigmodel.cn/

---

### Unity Configuration

Save configuration via `EditorPrefs`:

| Key | Description |
|-----|-------------|
| KiffCcFastApi_Port | Server port |
| KiffCcFastApi_Host | Server address |
| KiffCcFastApi_AutoStart | Auto-start on boot |

---

## Unity API Usage

### C# Example

```csharp
using Ember.UnityMcp.Editor.UI.Components.Connect.Tabs;

// Start server
await CcFastApiController.StartServerAsync();

// Get status
var status = CcFastApiController.GetStatus();
if (status.IsRunning)
{
    Debug.Log($"Server running at: {status.Host}:{status.Port}");
}

// Stop server
await CcFastApiController.StopServerAsync();
```

### HTTP Example

```csharp
using UnityWebRequest;

// Send chat request
string json = "{\"prompt\":\"Help me create a C# script\"}";

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

## Directory Structure

```
Packages/com.kiff.cc-fastapi/
├── package.json                    # Unity Package manifest
├── README.md                       # This document
├── README_Zh.md                    # Chinese version
├── CHANGELOG.md                    # Version changelog
│
├── Runtime/                        # Node.js runtime files
│   └── cc-fastapi/                 # Complete Node.js project
│       ├── src/                    # TypeScript source
│       ├── dist/                   # Compiled JS
│       ├── node_modules/           # Dependencies (installed on first run)
│       ├── package.json            # Node.js project config
│       └── .env.example            # Environment variable template
│
├── Editor/                         # Unity Editor code
│   ├── Controllers/
│   │   └── CcFastApiController.cs  # Main controller
│   ├── UI/
│   │   └── CcFastApiWindow.cs      # Manager window
│   ├── Utils/
│   │   ├── NodeDetector.cs         # Node.js detection
│   │   ├── ProcessManager.cs       # Process management
│   │   └── PathResolver.cs         # Path resolution
│   └── Installer/
│       └── PackageInstaller.cs     # Auto-install script
│
├── Samples/                        # Sample configurations
│   └── Configuration/
│       └── cc-fastapi.config.json  # Default configuration
│
└── Documentation~/                 # Documentation (Unity accessible)
    └── cc-fastapi.md               # Usage documentation
```

---

## Roadmap

### v1.1.0 (Planned)

- [ ] Remote server mode support
- [ ] Update server code via UI
- [ ] Log viewer panel
- [ ] Multi-instance management

### v1.2.0 (In Planning)

- [ ] Unit test coverage
- [ ] Docker deployment mode
- [ ] Performance monitoring panel
- [ ] WebSocket connection support

### v2.0.0 (Future)

- [ ] Complete UI rewrite (UI Toolkit)
- [ ] Custom middleware support
- [ ] Plugin system
- [ ] Multi-language configuration

---

## FAQ

### Q: "Node.js not detected"

**A:** Download and install from [Node.js official site](https://nodejs.org/), then restart Unity Editor.

### Q: First startup is slow

**A:** First run requires installing Node.js dependencies. Please wait patiently. Subsequent starts will be much faster.

### Q: Port 3000 occupied

**A:** Change port via `PORT` environment variable in configuration.

### Q: How to view server logs

**A:** Logs output to Unity Console with `[cc-fastapi]` prefix.

### Q: Server startup failed

**A:** Please check:
1. Node.js is properly installed
2. Port is not occupied
3. Claude CLI is available

### Q: How to use GLM-4.7 model?

**A:** Configure via GLM Coding Plan:
1. Visit https://open.bigmodel.cn/ to register and get API Key
2. Modify Claude Code config file `~/.claude/settings.json`:
   ```json
   {
     "env": {
       "ANTHROPIC_API_KEY": "your_zhipu_api_key",
       "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/paas/v4/",
       "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
     }
   }
   ```
3. Close all Claude Code windows and restart

### Q: Difference between GLM-4.7 and Claude?

**A:** Main differences:
- **Configuration**: GLM requires settings.json modification, Claude is native
- **Response Speed**: GLM-4.7 is faster with better Chinese understanding
- **Price**: GLM-4.7 is lower priced with free tier
- **Compatibility**: GLM Coding Plan fully compatible with Claude Code

---

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/mickorz/unity-cc-fastapi/issues)
- **Repository**: [GitHub](https://github.com/mickorz/unity-cc-fastapi)

---

## License

MIT License

---

## Related Links

- [Claude Code Official](https://claude.ai/code)
- [GLM Coding Plan Documentation](https://docs.bigmodel.cn/cn/coding-plan/tool/claude)
- [Zhipu AI Open Platform](https://open.bigmodel.cn/)
- [Zhipu AI API Documentation](https://open.bigmodel.cn/dev/api)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Unity Package Manager](https://docs.unity3d.com/Manual/Packages.html)
