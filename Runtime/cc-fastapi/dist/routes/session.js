/**
 * Session 路由模块
 *
 * 本模块处理 session 管理相关的 API 请求
 *
 * 路由处理流程：
 *
 * handleListSessions(request, reply)
 *   ├─> 获取工作目录
 *   ├─> 读取 session 列表
 *   └─> 返回 session 列表
 *
 * handleCheckSession(request, reply)
 *   ├─> 从路径参数获取 sessionId
 *   ├─> 获取工作目录
 *   ├─> 检查 session 是否存在
 *   └─> 返回检查结果
 *
 * handleDeleteSession(request, reply)
 *   ├─> 从路径参数获取 sessionId
 *   ├─> 获取工作目录
 *   ├─> 删除 session 文件
 *   ├─> 更新索引文件
 *   └─> 返回删除结果
 */
import { z } from 'zod';
import { listSessions, checkSession, deleteSession } from '../services/session.service.js';
import { getWorkingDir } from '../utils/env.util.js';
/**
 * Session ID 参数验证 Schema
 */
const sessionIdParamSchema = z.object({
    sessionid: z.string().min(1, 'sessionid 不能为空'),
});
/**
 * Session 列表处理函数
 *
 * GET /session/list
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleListSessions(_request, reply) {
    try {
        const workingDir = getWorkingDir();
        const result = listSessions(workingDir);
        reply.send(result);
    }
    catch (err) {
        const error = err;
        reply.code(500).send({
            error: '无法获取 session 列表',
            message: error.message,
        });
    }
}
/**
 * Session 检查处理函数
 *
 * GET /session/check/:sessionid
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleCheckSession(request, reply) {
    try {
        // 验证路径参数
        const validationResult = sessionIdParamSchema.safeParse(request.params);
        if (!validationResult.success) {
            reply.code(400).send({
                error: '请求参数验证失败',
                details: validationResult.error.errors,
            });
            return;
        }
        const { sessionid } = validationResult.data;
        const workingDir = getWorkingDir();
        const result = checkSession(workingDir, sessionid);
        reply.send(result);
    }
    catch (err) {
        const error = err;
        reply.code(500).send({
            error: '无法检查 session',
            message: error.message,
        });
    }
}
/**
 * Session 删除处理函数
 *
 * DELETE /session/delete/:sessionid
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleDeleteSession(request, reply) {
    try {
        // 验证路径参数
        const validationResult = sessionIdParamSchema.safeParse(request.params);
        if (!validationResult.success) {
            reply.code(400).send({
                error: '请求参数验证失败',
                details: validationResult.error.errors,
            });
            return;
        }
        const { sessionid } = validationResult.data;
        const workingDir = getWorkingDir();
        const result = deleteSession(workingDir, sessionid);
        reply.send(result);
    }
    catch (err) {
        const error = err;
        reply.code(500).send({
            error: '无法删除 session',
            message: error.message,
        });
    }
}
/**
 * 注册 session 相关路由
 *
 * @param fastify - Fastify 实例
 */
export function registerSessionRoutes(fastify) {
    // 列出所有 session
    fastify.get('/session/list', {
        schema: {
            description: '获取当前项目的所有 session',
            tags: ['session'],
            summary: '列出所有 session',
            response: {
                200: {
                    description: '成功获取 session 列表',
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: '项目路径'
                        },
                        totalSessions: {
                            type: 'number',
                            description: 'Session 总数'
                        },
                        sessions: {
                            type: 'array',
                            description: 'Session 列表',
                            items: {
                                type: 'object',
                                properties: {
                                    sessionId: { type: 'string', description: 'Session ID' },
                                    summary: { type: 'string', description: 'Session 摘要' },
                                    firstPrompt: { type: 'string', description: '首次提示词' },
                                    messageCount: { type: 'number', description: '消息数量' },
                                    created: { type: 'string', description: '创建时间' },
                                    modified: { type: 'string', description: '修改时间' },
                                    gitBranch: { type: 'string', description: 'Git 分支' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, handleListSessions);
    // 检查 session 是否存在
    fastify.get('/session/check/:sessionid', {
        schema: {
            description: '检查指定的 session 是否存在',
            tags: ['session'],
            summary: '检查 session 是否存在',
            params: {
                type: 'object',
                required: ['sessionid'],
                properties: {
                    sessionid: {
                        type: 'string',
                        description: 'Session ID',
                    },
                },
            },
            response: {
                200: {
                    description: '检查结果',
                    type: 'object',
                    properties: {
                        exists: {
                            type: 'boolean',
                            description: 'Session 是否存在'
                        },
                        session: {
                            type: 'object',
                            description: 'Session 信息（仅当存在时）',
                            properties: {
                                sessionId: { type: 'string', description: 'Session ID' },
                                summary: { type: 'string', description: 'Session 摘要' },
                                firstPrompt: { type: 'string', description: '首次提示词' },
                                messageCount: { type: 'number', description: '消息数量' },
                                created: { type: 'string', description: '创建时间' },
                                modified: { type: 'string', description: '修改时间' },
                                gitBranch: { type: 'string', description: 'Git 分支' },
                            },
                        },
                    },
                },
            },
        },
    }, handleCheckSession);
    // 删除 session
    fastify.delete('/session/delete/:sessionid', {
        schema: {
            description: '删除指定的 session 及其缓存',
            tags: ['session'],
            summary: '删除 session',
            params: {
                type: 'object',
                required: ['sessionid'],
                properties: {
                    sessionid: {
                        type: 'string',
                        description: 'Session ID',
                    },
                },
            },
            response: {
                200: {
                    description: '删除结果',
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: '是否成功删除'
                        },
                        message: {
                            type: 'string',
                            description: '操作消息'
                        },
                        sessionId: {
                            type: 'string',
                            description: '被删除的 Session ID（仅成功时）'
                        },
                    },
                },
            },
        },
    }, handleDeleteSession);
}
//# sourceMappingURL=session.js.map