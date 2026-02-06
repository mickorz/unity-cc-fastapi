/**
 * 计数路由模块
 *
 * 本模块提供计数功能 API
 *
 * 路由处理流程：
 *
 * handleCount(request, reply)
 *   ├─> 获取计数参数
 *   ├─> 验证范围
 *   ├─> 生成计数数组
 *   └─> 返回结果
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
/**
 * 计数处理函数
 *
 * GET /count?start=1&end=10
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export declare function handleCount(request: FastifyRequest<{
    Querystring: {
        start?: string;
        end?: string;
    };
}>, reply: FastifyReply): Promise<void>;
/**
 * 注册计数路由
 *
 * @param fastify - Fastify 实例
 */
export declare function registerCountRoutes(fastify: FastifyInstance): void;
//# sourceMappingURL=count.d.ts.map