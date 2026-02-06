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
import type { ClaudePrompt } from '../types/index.js';
/**
 * 流式聊天处理函数
 *
 * POST /chat/stream
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleStreamChat(request: FastifyRequest<{
    Body: ClaudePrompt;
}>, reply: FastifyReply): Promise<void>;
/**
 * 健康检查端点
 *
 * GET /health
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleHealthCheck(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * 注册聊天相关路由
 *
 * @param fastify - Fastify 实例
 */
export declare function registerChatRoutes(fastify: FastifyInstance): void;
//# sourceMappingURL=chat.d.ts.map