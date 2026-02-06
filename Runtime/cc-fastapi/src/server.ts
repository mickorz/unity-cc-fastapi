/**
 * Fastify 服务器主入口
 *
 * 本模块是应用程序的入口点，负责：
 * 1. 加载环境变量
 * 2. 创建 Fastify 实例
 * 3. 注册中间件和路由
 * 4. 启动服务器
 *
 * 服务器启动流程：
 *
 * main()
 *   ├─> 加载环境变量
 *   ├─> 验证配置
 *   ├─> 创建 Fastify 实例
 *   ├─> 注册 CORS 中间件
 *   ├─> 注册路由
 *   ├─> 注册 Swagger
 *   ├─> 注册错误处理
 *   └─> 启动监听
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { registerChatRoutes } from './routes/chat.js';
import { registerSessionRoutes } from './routes/session.js';
import { registerCountRoutes } from './routes/count.js';
import { getServerConfig, getCorsOrigin, getEnvSummary, validateRequiredEnv } from './utils/env.util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 创建并配置 Fastify 实例
 *
 * @returns 配置好的 Fastify 实例
 */
async function createServer() {
    const fastify = Fastify({
        logger: false,
    });

    // 注册 CORS 中间件
    fastify.register(cors, {
        origin: getCorsOrigin(),
    });

    // 注册静态文件服务
    fastify.register(staticFiles, {
        root: path.join(__dirname, '..', 'public'),
        prefix: '/public/',
    });

    // 注册 Swagger（必须在路由注册之前！）
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Claude API 服务器',
                description: '基于 Fastify 和 Claude CLI 的流式聊天 API',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: '开发服务器',
                },
            ],
            tags: [
                { name: 'chat', description: '聊天相关接口' },
                { name: 'session', description: 'Session 管理接口' },
                { name: 'count', description: '计数接口' },
                { name: 'health', description: '健康检查接口' },
            ],
        },
        transform: (schema) => {
            // 转换schema
            return schema;
        },
    });

    await fastify.register(swaggerUI, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
    });

    // 注册路由（必须在 Swagger 注册之后）
    registerChatRoutes(fastify);
    registerSessionRoutes(fastify);
    registerCountRoutes(fastify);

    // 全局错误处理
    fastify.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
        request.log.error(error);

        reply.code(error.statusCode || 500).send({
            error: '服务器内部错误',
            message: error.message,
            statusCode: error.statusCode || 500,
        });
    });

    // 404 处理
    fastify.setNotFoundHandler((request, reply) => {
        reply.code(404).send({
            error: '未找到',
            message: `路径 ${request.method} ${request.url} 不存在`,
        });
    });

    return fastify;
}

/**
 * 打印启动信息
 *
 * @param fastify - Fastify 实例
 * @param host - 监听主机
 * @param port - 监听端口
 */
function printStartupInfo(fastify: Awaited<ReturnType<typeof createServer>>, host: string, port: number): void {
    fastify.log.info('');
    fastify.log.info('=================================');
    fastify.log.info('  Claude API TypeScript 服务器');
    fastify.log.info('=================================');
    fastify.log.info(`  监听地址: http://${host}:${port}`);
    fastify.log.info(`  API 文档: http://${host}:${port}/docs`);
    fastify.log.info(`  健康检查: http://${host}:${port}/health`);
    fastify.log.info(`  并发状态: http://${host}:${port}/status/concurrency`);
    fastify.log.info(`  调试页面: http://${host}:${port}/public/test-debug.html`);
    fastify.log.info('=================================');
    fastify.log.info('');
    fastify.log.info('环境变量配置:');
    const envSummary = getEnvSummary();
    for (const [key, value] of Object.entries(envSummary)) {
        fastify.log.info(`  ${key}: ${value}`);
    }
    fastify.log.info('=================================');
    fastify.log.info('');
    fastify.log.info('可用端点:');
    fastify.log.info('  POST   /chat/stream            - 流式聊天（新会话）');
    fastify.log.info('  POST   /chat/stream/:session    - 流式聊天（恢复会话）');
    fastify.log.info('  GET    /session/list           - 列出所有 session');
    fastify.log.info('  GET    /session/check/:sessionid - 检查 session 是否存在');
    fastify.log.info('  DELETE /session/delete/:sessionid - 删除 session');
    fastify.log.info('  GET    /count                  - 从1数到10');
    fastify.log.info('  GET    /health                 - 健康检查');
    fastify.log.info('  GET    /status/concurrency     - 并发状态');
    fastify.log.info('  GET    /status/queue           - 等待队列详情');
    fastify.log.info('=================================');
    fastify.log.info('');
}

/**
 * 主函数
 */
async function main() {
    try {
        // 验证环境变量
        validateRequiredEnv();

        // 获取服务器配置
        const { port, host } = getServerConfig();

        // 创建服务器
        const fastify = await createServer();

        // 等待所有插件加载完成
        await fastify.ready();

        // 启动监听
        await fastify.listen({ port, host });

        // 打印启动信息
        printStartupInfo(fastify, host, port);

        // 优雅退出处理
        const shutdown = async (signal: string) => {
            fastify.log.info(`收到 ${signal} 信号，正在关闭服务器...`);
            await fastify.close();
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (err) {
        const error = err as Error;
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 启动服务器
main();
