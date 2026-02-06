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
/**
 * Session 条目类型
 */
export interface SessionEntry {
    sessionId: string;
    fullPath: string;
    fileMtime: number;
    firstPrompt: string;
    summary: string;
    messageCount: number;
    created: string;
    modified: string;
    gitBranch: string;
    projectPath: string;
    isSidechain: boolean;
}
/**
 * Session 列表响应类型
 */
export interface SessionListResponse {
    projectPath: string;
    totalSessions: number;
    sessions: SessionInfo[];
}
/**
 * Session 信息类型
 */
export interface SessionInfo {
    sessionId: string;
    summary: string;
    firstPrompt: string;
    messageCount: number;
    created: string;
    modified: string;
    gitBranch: string;
}
/**
 * Session 检查响应类型
 */
export interface SessionCheckResponse {
    exists: boolean;
    session?: SessionInfo;
}
/**
 * Session 删除响应类型
 */
export interface SessionDeleteResponse {
    success: boolean;
    message: string;
    sessionId?: string;
}
/**
 * 列出当前项目的所有 session
 *
 * @param projectPath - 项目路径
 * @returns Session 列表响应
 */
export declare function listSessions(projectPath: string): SessionListResponse;
/**
 * 检查指定的 session 是否存在
 *
 * @param projectPath - 项目路径
 * @param sessionId - 要检查的 session ID
 * @returns Session 检查响应
 */
export declare function checkSession(projectPath: string, sessionId: string): SessionCheckResponse;
/**
 * 删除指定的 session
 *
 * @param projectPath - 项目路径
 * @param sessionId - 要删除的 session ID
 * @returns Session 删除响应
 */
export declare function deleteSession(projectPath: string, sessionId: string): SessionDeleteResponse;
/**
 * 获取 session 文件路径
 *
 * @param projectPath - 项目路径
 * @param sessionId - Session ID
 * @returns Session 文件路径
 */
export declare function getSessionFilePath(projectPath: string, sessionId: string): string;
//# sourceMappingURL=session.service.d.ts.map