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
/**
 * 将数据转换为 SSE 格式的字符串
 *
 * @param event - SSE 事件对象
 * @returns SSE 格式的字符串
 */
export function toSSEFormat(event) {
    return `data: ${JSON.stringify(event)}\n\n`;
}
/**
 * 从 Claude CLI 输出中提取文本内容
 *
 * @param data - 解析后的 JSON 数据
 * @returns 解析结果
 */
function extractTextContent(data) {
    // 处理 stream_event 类型
    if (data.type === 'stream_event' && data.event) {
        const event = data.event;
        // 处理 content_block_delta 事件（逐字符增量）
        if (event.type === 'content_block_delta' && event.delta) {
            const delta = event.delta;
            if (delta.type === 'text_delta' && typeof delta.text === 'string') {
                return { type: 'text', value: delta.text };
            }
        }
        // 其他 stream_event 返回原始数据
        return { type: 'data', value: data };
    }
    // 处理 assistant 类型（完整消息）
    if (data.type === 'assistant' && data.message) {
        const message = data.message;
        if (Array.isArray(message.content)) {
            // 检查是否包含 tool_use
            const hasToolUse = message.content.some(item => item.type === 'tool_use');
            // 检查是否包含文本内容
            const hasText = message.content.some(item => item.type === 'text' && item.text);
            // 如果只包含文本内容（不含 tool_use），跳过（因为内容已在流式输出中）
            if (!hasToolUse && hasText) {
                return null;
            }
        }
        // 包含 tool_use 或其他类型，保留原始数据
        return { type: 'data', value: data };
    }
    // 处理 result 类型（保留元数据，删除重复的 result 文本字段）
    if (data.type === 'result') {
        // 创建 result 对象的副本
        const resultCopy = { ...data };
        // 删除 result 字段中的文本内容，避免重复
        if ('result' in resultCopy) {
            delete resultCopy.result;
        }
        return { type: 'data', value: resultCopy };
    }
    // 其他类型返回原始数据
    return { type: 'data', value: data };
}
/**
 * 解析 Claude CLI 输出的单行数据
 *
 * @param line - 原始行数据
 * @returns 解析后的数据对象或文本
 */
function parseLine(line) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
        return null; // 空行
    }
    try {
        const data = JSON.parse(trimmedLine);
        const result = extractTextContent(data);
        if (!result) {
            return null; // 跳过
        }
        if (result.type === 'text') {
            return result.value;
        }
        else {
            return result.value;
        }
    }
    catch {
        // 非 JSON 格式，作为纯文本返回
        return trimmedLine;
    }
}
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
export async function* streamClaudeOutput(child, sessionId) {
    // 发送初始 SSE 事件
    yield toSSEFormat({
        type: 'start',
        sessionId,
    });
    // 设置 stdout 编码为 UTF-8
    child.stdout.setEncoding('utf8');
    try {
        // 使用异步迭代器处理流
        for await (const chunk of child.stdout) {
            const lines = chunk.split('\n');
            for (const line of lines) {
                const data = parseLine(line);
                // 跳过空行
                if (data === null) {
                    continue;
                }
                if (typeof data === 'string') {
                    // 纯文本输出
                    yield toSSEFormat({
                        type: 'data',
                        content: data,
                    });
                }
                else {
                    // JSON 格式输出
                    yield toSSEFormat({
                        type: 'data',
                        content: data,
                    });
                }
            }
        }
    }
    catch (err) {
        // 流处理错误
        const error = err;
        yield toSSEFormat({
            type: 'error',
            error: error.message,
        });
    }
    finally {
        // 发送结束事件
        yield toSSEFormat({
            type: 'end',
            sessionId,
        });
    }
}
/**
 * 创建 SSE 写入器
 *
 * @param write - 底层写入函数
 * @returns SSE 写入器
 */
export function createSSEWriter(write) {
    return (event) => {
        write(toSSEFormat(event));
    };
}
/**
 * 设置 HTTP 响应为 SSE 模式
 *
 * @param res - HTTP 响应对象
 */
export function setSSEResponseHeaders(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
}
//# sourceMappingURL=stream.service.js.map