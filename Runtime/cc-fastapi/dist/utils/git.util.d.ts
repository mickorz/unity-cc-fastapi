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
export declare function extractRepoName(repo: string): string;
/**
 * 克隆 Git 仓库
 *
 * @param repo - Git 仓库 URL
 * @param targetDir - 目标目录
 * @throws {GitError} 克隆失败时抛出错误
 */
export declare function cloneRepo(repo: string, targetDir: string): void;
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
export declare function getTargetDirectory(session: string | null, repo: string | undefined, workingDir: string): string;
/**
 * 验证目录是否是 Git 仓库
 *
 * @param dir - 目录路径
 * @returns 是否是 Git 仓库
 */
export declare function isGitRepo(dir: string): boolean;
/**
 * 获取 Git 仓库的远程 URL
 *
 * @param dir - Git 仓库目录
 * @returns 远程 URL，如果不是 Git 仓库则返回 null
 */
export declare function getRepoUrl(dir: string): string | null;
//# sourceMappingURL=git.util.d.ts.map