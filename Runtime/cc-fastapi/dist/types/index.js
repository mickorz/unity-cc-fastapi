/**
 * 类型定义模块
 *
 * 本模块定义了整个项目中使用的核心类型接口
 */
// ==================== 错误相关类型 ====================
/**
 * 应用错误类型
 */
export class AppError extends Error {
    message;
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
/**
 * Claude CLI 错误
 */
export class ClaudeCliError extends AppError {
    exitCode;
    constructor(message, exitCode) {
        super(message, 500, 'CLAUDE_CLI_ERROR');
        this.exitCode = exitCode;
        this.name = 'ClaudeCliError';
    }
}
/**
 * Git 操作错误
 */
export class GitError extends AppError {
    gitOutput;
    constructor(message, gitOutput) {
        super(message, 500, 'GIT_ERROR');
        this.gitOutput = gitOutput;
        this.name = 'GitError';
    }
}
/**
 * 验证错误
 */
export class ValidationError extends AppError {
    field;
    constructor(message, field) {
        super(message, 400, 'VALIDATION_ERROR');
        this.field = field;
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=index.js.map