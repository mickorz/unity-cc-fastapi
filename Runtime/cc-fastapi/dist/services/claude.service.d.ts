/**
 * Claude CLI 服务模块
 *
 * 本模块负责管理 Claude CLI 子进程的启动和交互
 *
 * Claude CLI 启动流程：
 *
 * spawnClaudeProcess(config, prompt)
 *   ├─> 构建命令行参数
 *   │   ├─> 基础参数: -p, --dangerously-skip-permissions
 *   │   ├─> 输出格式: --output-format stream-json
 *   │   ├─> 流式参数: --include-partial-messages, --auto-approve
 *   │   ├─> MCP 配置: --mcp-config (如果存在)
 *   │   └─> 会话恢复: --resume (如果指定)
 *   ├─> 启动子进程
 *   ├─> 写入 prompt 到 stdin
 *   └─> 关闭 stdin (开始执行)
 */
import { type ChildProcessWithoutNullStreams } from 'child_process';
import type { ClaudeSpawnConfig } from '../types/index.js';
/**
 * 获取 Claude CLI 命令名称
 *
 * @returns Claude CLI 命令
 */
export declare function getClaudeCommand(): string;
/**
 * 获取 Claude CLI 参数
 *
 * @param args - 原始参数
 * @returns 参数
 */
export declare function getClaudeArgs(args: string[]): string[];
/**
 * 获取 MCP 配置文件路径
 *
 * @returns MCP 配置文件路径，如果不存在则返回 undefined
 */
export declare function getMcpConfigPath(): string | undefined;
/**
 * 构建 Claude CLI 命令行参数
 *
 * @param session - 会话 ID（可选，用于恢复会话）
 * @param isStream - 是否启用流式输出
 * @param mcpConfigPath - MCP 配置文件路径（可选）
 * @param permissionArgs - 权限相关参数（可选）
 * @returns 命令行参数数组
 */
export declare function buildClaudeArgs(session: string | null, isStream: boolean, mcpConfigPath?: string, permissionArgs?: string[]): string[];
/**
 * 构建 Claude CLI 启动配置
 *
 * @param cwd - 工作目录
 * @param env - 环境变量
 * @returns 启动配置对象
 */
export declare function buildSpawnConfig(cwd: string, env: NodeJS.ProcessEnv): Omit<ClaudeSpawnConfig, 'args'>;
/**
 * 启动 Claude CLI 子进程
 *
 * 此函数：
 * 1. 构建命令行参数
 * 2. 启动子进程
 * 3. 写入 prompt 到 stdin
 * 4. 关闭 stdin（触发 Claude 开始执行）
 *
 * @param cwd - 工作目录
 * @param env - 环境变量
 * @param prompt - 用户输入的提示词
 * @param session - 会话 ID（可选）
 * @param permissionArgs - 权限相关参数（可选）
 * @returns Claude CLI 子进程
 */
export declare function spawnClaudeProcess(cwd: string, env: NodeJS.ProcessEnv, prompt: string, session?: string | null, permissionArgs?: string[]): ChildProcessWithoutNullStreams;
/**
 * 终止 Claude CLI 子进程
 *
 * @param child - Claude CLI 子进程
 */
export declare function killClaudeProcess(child: ChildProcessWithoutNullStreams): void;
//# sourceMappingURL=claude.service.d.ts.map