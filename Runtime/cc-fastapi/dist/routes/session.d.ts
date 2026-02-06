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
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
/**
 * Session 列表处理函数
 *
 * GET /session/list
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleListSessions(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Session 检查处理函数
 *
 * GET /session/check/:sessionid
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleCheckSession(request: FastifyRequest<{
    Params: {
        sessionid: string;
    };
}>, reply: FastifyReply): Promise<void>;
/**
 * Session 删除处理函数
 *
 * DELETE /session/delete/:sessionid
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleDeleteSession(request: FastifyRequest<{
    Params: {
        sessionid: string;
    };
}>, reply: FastifyReply): Promise<void>;
/**
 * 注册 session 相关路由
 *
 * @param fastify - Fastify 实例
 */
export declare function registerSessionRoutes(fastify: FastifyInstance): void;
//# sourceMappingURL=session.d.ts.map