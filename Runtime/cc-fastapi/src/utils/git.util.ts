/**
 * Git 操作工具模块
 *
 * 本模块负责处理 Git 仓库相关的操作
 *
 * Git 仓库处理流程：
 *
 * getTargetDirectory(session, repo)
 *   ├─> session 存在?
 *   │   └─> 是: 使用现有工作目录
 *   └─> session 不存在?
 *        ├─> repo 存在?
 *        │   ├─> 是: 克隆仓库
 *        │   │   ├─> 仓库已存在? 跳过克隆
 *        │   │   └─> 仓库不存在? 执行 git clone
 *        │   └─> 否: 使用默认工作目录
 *        └─> 返回目标目录
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GitError } from '../types/index.js';

/**
 * 从 Git 仓库 URL 中提取仓库名称
 *
 * @param repo - Git 仓库 URL
 * @returns 仓库名称
 *
 * @example
 * extractRepoName('https://github.com/user/repo.git') // 'repo'
 * extractRepoName('git@github.com:user/repo.git') // 'repo'
 */
export function extractRepoName(repo: string): string {
    // 移除 .git 后缀
    const withoutGit = repo.replace(/\.git$/, '');

    // 提取最后一部分作为仓库名
    const parts = withoutGit.split('/');
    const name = parts[parts.length - 1];

    return name || 'cloned_repo';
}

/**
 * 克隆 Git 仓库
 *
 * @param repo - Git 仓库 URL
 * @param targetDir - 目标目录
 * @throws {GitError} 克隆失败时抛出错误
 */
export function cloneRepo(repo: string, targetDir: string): void {
    console.log(`正在克隆仓库: ${repo}...`);

    const clone = spawnSync('git', ['clone', repo], {
        cwd: targetDir,
        shell: os.platform() === 'win32',
        env: process.env,
    });

    if (clone.status !== 0) {
        const stderr = clone.stderr?.toString() || '';
        throw new GitError(
            `克隆仓库失败: ${repo}`,
            stderr
        );
    }

    console.log(`仓库克隆成功: ${repo}`);
}

/**
 * 获取目标工作目录
 *
 * 此函数根据 session 和 repo 参数确定 Claude CLI 应该在哪个目录中运行：
 *
 * 1. 如果 session 存在，说明是恢复会话，直接使用当前工作目录
 * 2. 如果 session 不存在但 repo 存在：
 *    - 检查仓库是否已克隆到工作目录
 *    - 如果不存在则克隆
 *    - 返回仓库目录
 * 3. 如果都不存在，返回默认工作目录
 *
 * @param session - 会话 ID（可选）
 * @param repo - Git 仓库 URL（可选）
 * @param workingDir - 基础工作目录
 * @returns 目标目录路径
 * @throws {GitError} 克隆仓库失败时抛出错误
 */
export function getTargetDirectory(
    session: string | null,
    repo: string | undefined,
    workingDir: string
): string {
    // 如果是恢复会话，使用现有工作目录
    if (session) {
        return workingDir;
    }

    // 如果没有指定仓库，使用默认工作目录
    if (!repo) {
        return workingDir;
    }

    // 提取仓库名称并构建目标路径
    const repoName = extractRepoName(repo);
    const repoPath = path.join(workingDir, repoName);

    // 检查仓库是否已存在
    if (!fs.existsSync(repoPath)) {
        cloneRepo(repo, workingDir);
    } else {
        console.log(`仓库已存在，跳过克隆: ${repoPath}`);
    }

    return repoPath;
}

/**
 * 验证目录是否是 Git 仓库
 *
 * @param dir - 目录路径
 * @returns 是否是 Git 仓库
 */
export function isGitRepo(dir: string): boolean {
    const gitDir = path.join(dir, '.git');
    return fs.existsSync(gitDir);
}

/**
 * 获取 Git 仓库的远程 URL
 *
 * @param dir - Git 仓库目录
 * @returns 远程 URL，如果不是 Git 仓库则返回 null
 */
export function getRepoUrl(dir: string): string | null {
    if (!isGitRepo(dir)) {
        return null;
    }

    const result = spawnSync('git', ['config', '--get', 'remote.origin.url'], {
        cwd: dir,
        shell: os.platform() === 'win32',
        encoding: 'utf-8',
    });

    if (result.status !== 0 || !result.stdout) {
        return null;
    }

    return result.stdout.trim();
}
