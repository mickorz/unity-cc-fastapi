/**
 * 流处理服务模块
 *
 * 本模块负责处理 Claude CLI 的流式输出
 *
 * 流处理流程：
 *
 * streamClaudeOutput(child, sessionId)
 *   ├─> 发送 start 事件
 *   ├─> 设置 stdout 编码为 UTF-8
 *   ├─> 异步迭代 stdout 数据块
 *   │   ├─> 按行分割
 *   │   ├─> 尝试解析 JSON
 *   │   │   ├─> 成功: 发送 data 事件（带解析后的内容）
 *   │   │   └─> 失败: 发送 data 事件（纯文本）
 *   │   └─> 继续下一行
 *   └─> 发送 end 事件
 */
import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { SSEEvent } from '../types/index.js';
/**
 * 将数据转换为 SSE 格式的字符串
 *
 * @param event - SSE 事件对象
 * @returns SSE 格式的字符串
 */
export declare function toSSEFormat(event: SSEEvent): string;
/**
 * 流式输出 Claude CLI 的结果
 *
 * 这是一个异步生成器函数，它会：
 * 1. 发送开始事件
 * 2. 逐行解析 stdout 输出
 * 3. 将每行封装为 SSE 事件
 * 4. 发送结束事件
 *
 * @param child - Claude CLI 子进程
 * @param sessionId - 会话 ID
 * @yields SSE 格式的字符串
 */
export declare function streamClaudeOutput(child: ChildProcessWithoutNullStreams, sessionId: string): AsyncGenerator<string, void, unknown>;
/**
 * 创建可写入的 SSE 流
 *
 * 此函数用于将 SSE 事件写入 HTTP 响应
 *
 * @param res - HTTP 响应对象（Node.js ServerResponse）
 * @returns 写入函数
 */
export type SSEWriter = (event: SSEEvent) => void;
/**
 * 创建 SSE 写入器
 *
 * @param write - 底层写入函数
 * @returns SSE 写入器
 */
export declare function createSSEWriter(write: (data: string) => void): SSEWriter;
/**
 * 设置 HTTP 响应为 SSE 模式
 *
 * @param res - HTTP 响应对象
 */
export declare function setSSEResponseHeaders(res: {
    setHeader: (name: string, value: string) => void;
}): void;
//# sourceMappingURL=stream.service.d.ts.map