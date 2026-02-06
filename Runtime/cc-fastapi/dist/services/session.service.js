/**
 * Session 管理服务模块
 *
 * 本模块负责管理 Claude CLI 的 session 缓存
 *
 * Session 存储结构：
 *
 * ~/.claude/projects/
 *   └── <项目路径规范化>/
 *       ├── sessions-index.json    # Session 索引文件
 *       └── <sessionId>.jsonl      # 各 session 的数据文件
 *
 * Session 索引格式：
 * {
 *   "version": 1,
 *   "entries": [
 *     {
 *       "sessionId": "uuid",
 *       "firstPrompt": "...",
 *       "summary": "...",
 *       "messageCount": 10,
 *       "created": "ISO日期",
 *       "modified": "ISO日期",
 *       ...
 *     }
 *   ]
 * }
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
/**
 * 获取项目对应的 session 目录路径
 *
 * @param projectPath - 项目路径
 * @returns Session 目录路径
 */
function getSessionDir(projectPath) {
    // 将路径解析为绝对路径
    const absolutePath = path.resolve(projectPath);
    // 将项目路径中的特殊字符替换为短横线，与 Claude CLI 的规则一致
    const normalizedPath = absolutePath
        .replace(/\\/g, '/') // Windows 路径转 Unix 风格
        .replace(/[/:]/g, '-') // 替换分隔符
        .replace(/[^\w-]/g, '-'); // 其他字符替换为短横线
    return path.join(os.homedir(), '.claude', 'projects', normalizedPath);
}
/**
 * 获取 session 索引文件路径
 *
 * @param projectPath - 项目路径
 * @returns 索引文件路径
 */
function getSessionIndexPath(projectPath) {
    return path.join(getSessionDir(projectPath), 'sessions-index.json');
}
/**
 * 读取 session 索引文件
 *
 * @param projectPath - 项目路径
 * @returns Session 索引对象
 * @throws 如果索引文件不存在或解析失败
 */
function readSessionIndex(projectPath) {
    const indexPath = getSessionIndexPath(projectPath);
    if (!fs.existsSync(indexPath)) {
        // 如果索引文件不存在，返回空索引
        return { version: 1, entries: [] };
    }
    const content = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(content);
}
/**
 * 列出当前项目的所有 session
 *
 * @param projectPath - 项目路径
 * @returns Session 列表响应
 */
export function listSessions(projectPath) {
    try {
        const index = readSessionIndex(projectPath);
        // 提取需要的 session 信息
        const sessions = index.entries.map((entry) => ({
            sessionId: entry.sessionId,
            summary: entry.summary,
            firstPrompt: entry.firstPrompt,
            messageCount: entry.messageCount,
            created: entry.created,
            modified: entry.modified,
            gitBranch: entry.gitBranch,
        }));
        // 按修改时间倒序排列
        sessions.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
        return {
            projectPath,
            totalSessions: sessions.length,
            sessions,
        };
    }
    catch (err) {
        const error = err;
        throw new Error(`无法读取 session 列表: ${error.message}`);
    }
}
/**
 * 检查指定的 session 是否存在
 *
 * @param projectPath - 项目路径
 * @param sessionId - 要检查的 session ID
 * @returns Session 检查响应
 */
export function checkSession(projectPath, sessionId) {
    try {
        const index = readSessionIndex(projectPath);
        const entry = index.entries.find((e) => e.sessionId === sessionId);
        if (!entry) {
            return { exists: false };
        }
        // 检查对应的 session 文件是否存在
        const sessionFilePath = path.join(getSessionDir(projectPath), `${sessionId}.jsonl`);
        const fileExists = fs.existsSync(sessionFilePath);
        if (!fileExists) {
            return { exists: false };
        }
        const sessionInfo = {
            sessionId: entry.sessionId,
            summary: entry.summary,
            firstPrompt: entry.firstPrompt,
            messageCount: entry.messageCount,
            created: entry.created,
            modified: entry.modified,
            gitBranch: entry.gitBranch,
        };
        return {
            exists: true,
            session: sessionInfo,
        };
    }
    catch (err) {
        const error = err;
        throw new Error(`无法检查 session: ${error.message}`);
    }
}
/**
 * 删除指定的 session
 *
 * @param projectPath - 项目路径
 * @param sessionId - 要删除的 session ID
 * @returns Session 删除响应
 */
export function deleteSession(projectPath, sessionId) {
    try {
        const index = readSessionIndex(projectPath);
        const entryIndex = index.entries.findIndex((e) => e.sessionId === sessionId);
        if (entryIndex === -1) {
            return {
                success: false,
                message: `Session ${sessionId} 不存在`,
            };
        }
        const sessionFilePath = path.join(getSessionDir(projectPath), `${sessionId}.jsonl`);
        const indexPath = getSessionIndexPath(projectPath);
        // 删除 session 文件
        if (fs.existsSync(sessionFilePath)) {
            fs.unlinkSync(sessionFilePath);
        }
        // 从索引中移除该 session
        index.entries.splice(entryIndex, 1);
        // 更新索引文件
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
        return {
            success: true,
            message: `Session ${sessionId} 已删除`,
            sessionId,
        };
    }
    catch (err) {
        const error = err;
        throw new Error(`无法删除 session: ${error.message}`);
    }
}
/**
 * 获取 session 文件路径
 *
 * @param projectPath - 项目路径
 * @param sessionId - Session ID
 * @returns Session 文件路径
 */
export function getSessionFilePath(projectPath, sessionId) {
    return path.join(getSessionDir(projectPath), `${sessionId}.jsonl`);
}
//# sourceMappingURL=session.service.js.map