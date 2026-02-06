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
import 'dotenv/config';
//# sourceMappingURL=server.d.ts.map