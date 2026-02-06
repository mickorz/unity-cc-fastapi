/**
 * 环境变量工具模块
 *
 * 本模块负责处理环境变量的读取和构建
 *
 * 环境变量处理流程：
 *
 * buildEnvironmentVars()
 *   ├─> 复制当前进程环境变量
 *   └─> 筛选并添加特定目标变量
 *        ├─> ANTHROPIC_API_KEY
 *        ├─> ANTHROPIC_BASE_URL
 *        ├─> GITHUB_PAT
 *        └─> CONTEXT7_API_KEY
 */
/**
 * 获取服务器配置环境变量
 *
 * @returns 服务器配置对象
 */
export declare function getServerConfig(): {
    port: number;
    host: string;
};
/**
 * 获取 CORS 允许的源
 *
 * @returns CORS origin 配置
 */
export declare function getCorsOrigin(): string | boolean;
/**
 * 获取工作目录
 *
 * @returns 工作目录路径
 */
export declare function getWorkingDir(): string;
/**
 * 构建传递给 Claude CLI 的环境变量
 *
 * 此函数会：
 * 1. 复制当前进程的所有环境变量
 * 2. 筛选出需要传递给 Claude CLI 的特定变量
 *
 * @returns 环境变量对象
 */
export declare function buildEnvironmentVars(): NodeJS.ProcessEnv;
/**
 * 验证必需的环境变量
 *
 * @throws {Error} 如果缺少必需的环境变量
 * @returns 验证通过返回 true
 */
export declare function validateRequiredEnv(): boolean;
/**
 * 获取环境变量配置摘要（用于日志输出）
 *
 * 注意：此函数会隐藏敏感信息的值
 *
 * @returns 环境变量配置摘要
 */
export declare function getEnvSummary(): Record<string, string>;
//# sourceMappingURL=env.util.d.ts.map