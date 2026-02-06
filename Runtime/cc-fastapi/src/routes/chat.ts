/**
 * 聊天路由模块
 *
 * 本模块处理流式聊天 API 请求
 *
 * 路由处理流程：
 *
 * handleStreamChat(request, reply)
 *   ├─> 验证请求参数
 *   ├─> 确定目标目录
 *   │   └─> 检查 session 参数
 *   ├─> 启动 Claude CLI 子进程
 *   ├─> 设置 SSE 响应头
 *   ├─> 注册清理处理（连接关闭时终止子进程）
 *   ├─> 流式输出 Claude 响应
 *   └─> 结束响应
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { ClaudePrompt, PermissionMode } from '../types/index.js';
import { getTargetDirectory } from '../utils/git.util.js';
import { getWorkingDir, buildEnvironmentVars } from '../utils/env.util.js';
import { spawnClaudeProcess, killClaudeProcess } from '../services/claude.service.js';
import { streamClaudeOutput, setSSEResponseHeaders } from '../services/stream.service.js';
import { globalLimiter } from '../services/concurrent.service.js';
import { buildPermissionConfig, buildPermissionArgs, applyVisionRestriction } from '../services/permission.service.js';

/**
 * 聊天请求体验证 Schema（扩展版）
 */
const chatRequestSchema = z.object({
    prompt: z.string().min(1, 'prompt 不能为空'),
    sessionId: z.string().optional(),
    workspace: z.string().optional(),
    externaldirs: z.string().optional(),
    allowedmode: z.enum(['pure', 'simple', 'readonly', 'projectwrite']).optional(),
    vision: z.string().optional(),
});

/**
 * 流式聊天处理函数
 *
 * POST /chat/stream
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleStreamChat(
    request: FastifyRequest<{
        Body: ClaudePrompt;
    }>,
    reply: FastifyReply
): Promise<void> {
    // 从请求体获取参数
    const session = request.body.sessionId && request.body.sessionId.trim() !== ''
        ? request.body.sessionId
        : null;
    const workspace = request.body.workspace?.trim();
    const externaldirs = request.body.externaldirs?.trim();
    const allowedmode = request.body.allowedmode?.trim() as PermissionMode | undefined;
    const vision = request.body.vision?.trim();

    // 使用并发限制器
    await globalLimiter.run(async () => {
        try {
            // 验证请求体
            const validationResult = chatRequestSchema.safeParse(request.body);
            if (!validationResult.success) {
                if (!reply.raw.headersSent) {
                    reply.code(400).send({
                        error: '请求参数验证失败',
                        details: validationResult.error.errors,
                    });
                }
                return;
            }

            let { prompt } = validationResult.data;

            // 应用禁止幻觉提示词
            prompt = applyVisionRestriction(prompt, vision);

            // 确定目标目录
            const workingDir = workspace || getWorkingDir();
            const targetDir = getTargetDirectory(session, undefined, workingDir);

            // 构建权限配置
            const permissionConfig = buildPermissionConfig(allowedmode, workspace, externaldirs);
            const permissionArgs = buildPermissionArgs(permissionConfig);

            // 构建环境变量
            const env = buildEnvironmentVars();

            // 启动 Claude CLI 子进程
            const child = spawnClaudeProcess(targetDir, env, prompt, session, permissionArgs);

            // 设置 SSE 响应头
            setSSEResponseHeaders(reply.raw);

            try {
                // 流式输出 Claude 响应
                for await (const event of streamClaudeOutput(child, session || 'new')) {
                    // 检查响应是否已关闭
                    if (reply.raw.writableEnded) {
                        break;
                    }
                    reply.raw.write(event);
                }

                // 正常结束响应
                if (!reply.raw.writableEnded) {
                    reply.raw.end();
                }
            } finally {
                // 确保子进程被清理
                killClaudeProcess(child);
            }
        } catch (err) {
            const error = err as Error;
            request.log.error(error);

            // 如果响应尚未发送，发送错误响应
            if (!reply.raw.headersSent) {
                reply.code(500).send({
                    error: '服务器内部错误',
                    message: error.message,
                });
            } else {
                // 如果已经开始流式输出，发送错误事件
                reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                reply.raw.end();
            }
        }
    });
}

/**
 * 健康检查端点
 *
 * GET /health
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleHealthCheck(
    _request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}

/**
 * 注册聊天相关路由
 *
 * @param fastify - Fastify 实例
 */
export function registerChatRoutes(fastify: FastifyInstance): void {
    // 流式聊天端点（统一接口，支持新会话和恢复会话）
    fastify.post('/chat/stream', {
        schema: {
            description: '流式聊天接口（支持权限控制）',
            tags: ['chat'],
            summary: '创建新会话或恢复已有会话',
            body: {
                type: 'object',
                required: ['prompt'],
                properties: {
                    prompt: {
                        type: 'string',
                        description: '用户输入的提示词',
                    },
                    sessionId: {
                        type: 'string',
                        description: '会话ID（可选），不传则创建新会话',
                    },
                    workspace: {
                        type: 'string',
                        description: '工作目录路径（可选），默认当前工作目录',
                    },
                    externaldirs: {
                        type: 'string',
                        description: '外部文件夹列表（可选），逗号分隔，如: "D:\\\\ExternalResources,C:\\\\Logs"',
                    },
                    allowedmode: {
                        type: 'string',
                        enum: ['pure', 'simple', 'readonly', 'projectwrite'],
                        description: '权限模式：pure=纯粹模式, simple=允许联网, readonly=只读模式, projectwrite=工程可写',
                    },
                    vision: {
                        type: 'string',
                        description: '禁止幻觉参数（非空时生效）',
                    },
                },
            },
            response: {
                200: {
                    description: 'SSE 流式响应',
                    type: 'string',
                },
            },
        },
    }, handleStreamChat);

    // 健康检查端点
    fastify.get('/health', {
        schema: {
            description: '健康检查接口',
            tags: ['health'],
            summary: '检查服务器健康状态',
            response: {
                200: {
                    description: '服务器正常运行',
                    type: 'object',
                    properties: {
                        status: { type: 'string', description: '状态' },
                        timestamp: { type: 'string', description: '时间戳' },
                        uptime: { type: 'number', description: '运行时长(秒)' },
                    },
                },
            },
        },
    }, handleHealthCheck);

    // 并发状态端点
    fastify.get('/status/concurrency', {
        schema: {
            description: '获取并发状态',
            tags: ['health'],
            summary: '查看当前并发请求数和队列状态',
            response: {
                200: {
                    description: '并发状态',
                    type: 'object',
                    properties: {
                        active: { type: 'number', description: '当前活跃请求数' },
                        max: { type: 'number', description: '最大并发数' },
                        available: { type: 'number', description: '可用槽位数' },
                        queued: { type: 'number', description: '等待队列中的任务数' },
                    },
                },
            },
        },
    }, async (_request, reply) => {
        const status = globalLimiter.getStatus();
        reply.send(status);
    });

    // 队列详情端点
    fastify.get('/status/queue', {
        schema: {
            description: '获取等待队列详情',
            tags: ['health'],
            summary: '查看等待队列中的任务',
            response: {
                200: {
                    description: '队列详情',
                    type: 'object',
                    properties: {
                        count: { type: 'number', description: '队列中的任务数' },
                        tasks: {
                            type: 'array',
                            description: '等待中的任务',
                            items: {
                                type: 'object',
                                properties: {
                                    timestamp: { type: 'number', description: '入队时间戳' },
                                    waitingMs: { type: 'number', description: '已等待时长(毫秒)' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, async (_request, reply) => {
        const tasks = globalLimiter.getQueueInfo();
        reply.send({
            count: tasks.length,
            tasks,
        });
    });
}
