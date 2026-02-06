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
import { z } from 'zod';

/**
 * 计数请求体验证 Schema
 */
const countRequestSchema = z.object({
    start: z.number().int().min(1).default(1),
    end: z.number().int().max(10).default(10),
});

/**
 * 计数处理函数
 *
 * GET /count?start=1&end=10
 *
 * @param request - Fastify 请求对象
 * @param reply - Fastify 响应对象
 */
export async function handleCount(
    request: FastifyRequest<{
        Querystring: { start?: string; end?: string };
    }>,
    reply: FastifyReply
): Promise<void> {
    try {
        // 解析查询参数
        const start = request.query.start ? parseInt(request.query.start, 10) : 1;
        const end = request.query.end ? parseInt(request.query.end, 10) : 10;

        // 验证参数
        const validated = countRequestSchema.parse({ start, end });

        // 生成计数数组
        const numbers: number[] = [];
        for (let i = validated.start; i <= validated.end; i++) {
            numbers.push(i);
        }

        // 返回结果
        reply.send({
            success: true,
            data: {
                numbers,
                count: numbers.length,
                range: {
                    start: validated.start,
                    end: validated.end,
                },
            },
        });
    } catch (error) {
        reply.code(400).send({
            success: false,
            error: '参数错误',
            message: error instanceof Error ? error.message : '未知错误',
        });
    }
}

/**
 * 注册计数路由
 *
 * @param fastify - Fastify 实例
 */
export function registerCountRoutes(fastify: FastifyInstance): void {
    fastify.get('/count', {
        schema: {
            tags: ['count'],
            summary: '从1数到10',
            description: '提供计数功能，可以指定起始和结束数字（默认1到10）',
            querystring: {
                type: 'object',
                properties: {
                    start: {
                        type: 'number',
                        minimum: 1,
                        description: '起始数字',
                        default: 1,
                    },
                    end: {
                        type: 'number',
                        maximum: 10,
                        description: '结束数字',
                        default: 10,
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                numbers: {
                                    type: 'array',
                                    items: { type: 'number' },
                                },
                                count: { type: 'number' },
                                range: {
                                    type: 'object',
                                    properties: {
                                        start: { type: 'number' },
                                        end: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, handleCount);
}
