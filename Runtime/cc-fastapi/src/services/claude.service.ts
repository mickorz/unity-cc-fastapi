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

import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { ClaudeSpawnConfig } from '../types/index.js';

/**
 * 获取 Claude CLI 命令名称
 *
 * @returns Claude CLI 命令
 */
export function getClaudeCommand(): string {
    return 'claude';
}

/**
 * 获取 Claude CLI 参数
 *
 * @param args - 原始参数
 * @returns 参数
 */
export function getClaudeArgs(args: string[]): string[] {
    return args;
}

/**
 * 获取 MCP 配置文件路径
 *
 * @returns MCP 配置文件路径，如果不存在则返回 undefined
 */
export function getMcpConfigPath(): string | undefined {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const mcpPath = path.join(__dirname, '..', '..', '.mcp.json');

    if (fs.existsSync(mcpPath)) {
        return mcpPath;
    }
    return undefined;
}

/**
 * 构建 Claude CLI 命令行参数
 *
 * @param session - 会话 ID（可选，用于恢复会话）
 * @param isStream - 是否启用流式输出
 * @param mcpConfigPath - MCP 配置文件路径（可选）
 * @param permissionArgs - 权限相关参数（可选）
 * @returns 命令行参数数组
 */
export function buildClaudeArgs(
    session: string | null,
    isStream: boolean,
    mcpConfigPath?: string,
    permissionArgs?: string[]
): string[] {
    // 基础参数
    const args: string[] = [
        '-p',                                      // 从 stdin 读取 prompt
        '--dangerously-skip-permissions',          // 跳过权限检查
        '--permission-mode', 'bypassPermissions', // 绕过权限检查模式
        '--output-format', 'stream-json',         // 流式 JSON 输出
        '--verbose',                               // stream-json 需要 verbose
    ];

    // 流式输出额外参数
    if (isStream) {
        args.push('--include-partial-messages');  // 包含部分消息
    }

    // MCP 配置
    if (mcpConfigPath) {
        args.push('--mcp-config', mcpConfigPath);
    }

    // 权限相关参数
    if (permissionArgs && permissionArgs.length > 0) {
        args.push(...permissionArgs);
    }

    // 会话恢复
    if (session) {
        args.push('--resume', session);
    }

    return args;
}

/**
 * 构建 Claude CLI 启动配置
 *
 * @param cwd - 工作目录
 * @param env - 环境变量
 * @returns 启动配置对象
 */
export function buildSpawnConfig(
    cwd: string,
    env: NodeJS.ProcessEnv
): Omit<ClaudeSpawnConfig, 'args'> {
    return {
        cwd,
        env,
        shell: true, // 使用 shell 来执行 claude 命令（Windows 需要）
    };
}

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
export function spawnClaudeProcess(
    cwd: string,
    env: NodeJS.ProcessEnv,
    prompt: string,
    session: string | null = null,
    permissionArgs?: string[]
): ChildProcessWithoutNullStreams {
    // 获取配置
    const command = getClaudeCommand();
    const mcpConfigPath = getMcpConfigPath();
    const rawArgs = buildClaudeArgs(session, true, mcpConfigPath, permissionArgs);
    const args = getClaudeArgs(rawArgs); // 应用平台特定的参数转换
    const spawnConfig = buildSpawnConfig(cwd, env);

    console.log(`启动 Claude CLI: ${command} ${args.join(' ')}`);
    console.log(`工作目录: ${cwd}`);

    // 启动子进程
    const child = spawn(command, args, spawnConfig) as ChildProcessWithoutNullStreams;

    // 监听错误
    child.on('error', (err: Error) => {
        console.error('Claude CLI 子进程错误:', err);
    });

    // 监听退出
    child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        if (code !== null && code !== 0) {
            console.error(`Claude CLI 退出码: ${code}`);
        }
        if (signal) {
            console.error(`Claude CLI 退出信号: ${signal}`);
        }
    });

    // 写入 prompt 到 stdin
    try {
        child.stdin.write(`${prompt}\n`);
        child.stdin.end();
    } catch (err) {
        const error = err as Error;
        console.error('写入 stdin 失败:', error);
        child.kill();
        throw new Error(`无法写入 Claude CLI stdin: ${error.message}`);
    }

    return child;
}

/**
 * 终止 Claude CLI 子进程
 *
 * @param child - Claude CLI 子进程
 */
export function killClaudeProcess(child: ChildProcessWithoutNullStreams): void {
    if (!child.killed) {
        console.log('终止 Claude CLI 子进程');
        child.kill('SIGTERM');
    }
}
