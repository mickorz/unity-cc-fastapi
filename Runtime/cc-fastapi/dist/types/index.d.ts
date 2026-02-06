/**
 * 类型定义模块
 *
 * 本模块定义了整个项目中使用的核心类型接口
 */
/**
 * 权限模式枚举
 */
export type PermissionMode = 'pure' | 'simple' | 'readonly' | 'projectwrite';
/**
 * 聊天请求体
 */
export interface ClaudePrompt {
    /** 用户输入的提示词 */
    prompt: string;
    /** 会话ID（可选），不传则创建新会话 */
    sessionId?: string;
    /** 工作目录路径（可选） */
    workspace?: string;
    /** 外部文件夹列表（可选，逗号分隔） */
    externaldirs?: string;
    /** 读写模式（可选） */
    allowedmode?: PermissionMode;
    /** 禁止幻觉参数（可选） */
    vision?: string;
}
/**
 * 流式请求参数
 */
export interface StreamParams {
    /** 会话ID，用于恢复会话 */
    session?: string;
}
/**
 * Claude stream-json 输出的数据结构
 */
export interface ClaudeStreamData {
    /** 数据类型 */
    type: 'text' | 'tool_use' | 'tool_result' | 'progress' | 'error' | string;
    /** 文本内容 */
    text?: string;
    /** 增量内容 */
    delta?: {
        text?: string;
        type?: string;
    };
    /** 工具使用信息 */
    tool_use?: {
        name: string;
        input: Record<string, unknown>;
    };
    /** 工具执行结果 */
    tool_result?: {
        tool_use_id: string;
        content: string;
        is_error?: boolean;
    };
    /** 进度信息 */
    progress?: {
        current: number;
        total: number;
    };
    /** 错误信息 */
    error?: {
        message: string;
        code?: string;
    };
    /** 其他扩展字段 */
    [key: string]: unknown;
}
/**
 * SSE 事件类型
 */
export type SSEEventType = 'start' | 'data' | 'end' | 'error';
/**
 * SSE 事件数据结构
 */
export interface SSEEvent {
    /** 事件类型 */
    type: SSEEventType;
    /** 会话ID */
    sessionId?: string;
    /** 内容数据 */
    content?: ClaudeStreamData | string;
    /** 错误信息 */
    error?: string;
}
/**
 * 环境变量配置
 */
export interface EnvConfig {
    /** Anthropic API 密钥 */
    ANTHROPIC_API_KEY?: string;
    /** Anthropic API 基础 URL */
    ANTHROPIC_BASE_URL?: string;
    /** GitHub 个人访问令牌 */
    GITHUB_PAT?: string;
    /** Context7 API 密钥 */
    CONTEXT7_API_KEY?: string;
    /** 工作目录 */
    WORKING_DIR?: string;
    /** 服务器端口 */
    PORT?: string;
    /** 服务器主机 */
    HOST?: string;
    /** CORS 允许的源 */
    CORS_ORIGIN?: string;
}
/**
 * 权限配置
 */
export interface PermissionConfig {
    /** --allowedTools 参数值 */
    allowedTools?: string;
    /** --no-indexing 标志 */
    noIndexing?: boolean;
    /** --add-dir 参数列表 */
    addDirs?: string[];
}
/**
 * Claude CLI 启动配置
 */
export interface ClaudeSpawnConfig {
    /** 命令行参数 */
    args: string[];
    /** 工作目录 */
    cwd: string;
    /** 环境变量 */
    env: NodeJS.ProcessEnv;
    /** 是否使用 shell */
    shell: boolean;
}
/**
 * Claude CLI 输出配置
 */
export interface ClaudeOutputFormat {
    /** 输出格式 */
    format: 'json' | 'stream-json' | 'text';
    /** 是否包含部分消息 */
    includePartial?: boolean;
    /** 是否自动批准 */
    autoApprove?: boolean;
}
/**
 * 应用错误类型
 */
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
/**
 * Claude CLI 错误
 */
export declare class ClaudeCliError extends AppError {
    exitCode?: number | undefined;
    constructor(message: string, exitCode?: number | undefined);
}
/**
 * Git 操作错误
 */
export declare class GitError extends AppError {
    gitOutput?: string | undefined;
    constructor(message: string, gitOutput?: string | undefined);
}
/**
 * 验证错误
 */
export declare class ValidationError extends AppError {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
//# sourceMappingURL=index.d.ts.map