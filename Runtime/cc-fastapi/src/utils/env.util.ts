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

import type { EnvConfig } from '../types/index.js';

/**
 * 需要传递给 Claude CLI 的环境变量键名列表
 */
const TARGET_ENV_KEYS = [
    'ANTHROPIC_API_KEY',
    'ANTHROPIC_BASE_URL',
    'GITHUB_PAT',
    'CONTEXT7_API_KEY',
] as const;

/**
 * 获取服务器配置环境变量
 *
 * @returns 服务器配置对象
 */
export function getServerConfig(): { port: number; host: string } {
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
    };
}

/**
 * 获取 CORS 允许的源
 *
 * @returns CORS origin 配置
 */
export function getCorsOrigin(): string | boolean {
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin === '*') {
        return true;
    }
    return corsOrigin || '*';
}

/**
 * 获取工作目录
 *
 * @returns 工作目录路径
 */
export function getWorkingDir(): string {
    return process.env.WORKING_DIR || process.cwd();
}

/**
 * 构建传递给 Claude CLI 的环境变量
 *
 * 此函数会：
 * 1. 复制当前进程的所有环境变量
 * 2. 筛选出需要传递给 Claude CLI 的特定变量
 *
 * @returns 环境变量对象
 */
export function buildEnvironmentVars(): NodeJS.ProcessEnv {
    // 复制当前进程的所有环境变量
    const env: NodeJS.ProcessEnv = { ...process.env };

    // 确保目标变量的值被正确传递
    for (const key of TARGET_ENV_KEYS) {
        if (process.env[key]) {
            env[key] = process.env[key];
        }
    }

    return env;
}

/**
 * 验证必需的环境变量
 *
 * @throws {Error} 如果缺少必需的环境变量
 * @returns 验证通过返回 true
 */
export function validateRequiredEnv(): boolean {
    const requiredKeys: (keyof EnvConfig)[] = [
        // 可以添加必需的键，例如：'ANTHROPIC_API_KEY'
    ];

    const missingKeys: string[] = [];

    for (const key of requiredKeys) {
        if (!process.env[key]) {
            missingKeys.push(key);
        }
    }

    if (missingKeys.length > 0) {
        throw new Error(`缺少必需的环境变量: ${missingKeys.join(', ')}`);
    }

    return true;
}

/**
 * 获取环境变量配置摘要（用于日志输出）
 *
 * 注意：此函数会隐藏敏感信息的值
 *
 * @returns 环境变量配置摘要
 */
export function getEnvSummary(): Record<string, string> {
    return {
        PORT: process.env.PORT || '3000',
        HOST: process.env.HOST || '0.0.0.0',
        WORKING_DIR: getWorkingDir(),
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '***已设置***' : '未设置',
        ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || '默认',
        GITHUB_PAT: process.env.GITHUB_PAT ? '***已设置***' : '未设置',
        CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY ? '***已设置***' : '未设置',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    };
}
