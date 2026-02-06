/**
 * 并发限制服务（带等待队列和超时）
 *
 * 功能：
 * - 限制最大并发请求数
 * - 超过限制的请求进入等待队列
 * - 120秒超时机制
 * - 任务完成后自动从队列取出下一个
 */
/**
 * 并发限制器类
 */
export class ConcurrencyLimiter {
    active = 0;
    maxConcurrent;
    queue = [];
    defaultTimeout;
    constructor(maxConcurrent = 5, defaultTimeout = 120000) {
        this.maxConcurrent = maxConcurrent;
        this.defaultTimeout = defaultTimeout;
    }
    /**
     * 执行带并发限制的异步操作
     *
     * @param execute - 要执行的异步函数
     * @param timeout - 超时时间（毫秒），默认 120000ms (120秒)
     * @returns 执行结果
     */
    async run(execute, timeout) {
        // 如果有空闲槽位，立即执行
        if (this.active < this.maxConcurrent) {
            return this.executeDirect(execute);
        }
        // 否则进入等待队列
        return this.enqueue(execute, timeout ?? this.defaultTimeout);
    }
    /**
     * 直接执行任务（有空闲槽位时）
     */
    async executeDirect(execute) {
        this.active++;
        try {
            return await execute();
        }
        finally {
            this.active--;
            this.processNext();
        }
    }
    /**
     * 将任务加入等待队列
     */
    async enqueue(execute, timeout) {
        return new Promise((resolve, reject) => {
            const taskTimeout = setTimeout(() => {
                // 从队列中移除
                const index = this.queue.findIndex(t => t.resolve === resolve);
                if (index !== -1) {
                    this.queue.splice(index, 1);
                }
                reject(new Error(`请求超时 (${timeout / 1000}秒)，请稍后重试`));
            }, timeout);
            const queuedTask = {
                execute,
                resolve,
                reject,
                timeout: taskTimeout,
                timestamp: Date.now(),
            };
            this.queue.push(queuedTask);
        });
    }
    /**
     * 处理队列中的下一个任务
     */
    processNext() {
        // 如果有等待的任务且有空闲槽位
        while (this.queue.length > 0 && this.active < this.maxConcurrent) {
            const task = this.queue.shift();
            if (!task)
                break;
            // 清除超时定时器
            clearTimeout(task.timeout);
            // 执行任务
            this.active++;
            Promise.resolve().then(async () => {
                try {
                    const result = await task.execute();
                    task.resolve(result);
                }
                catch (error) {
                    task.reject(error);
                }
                finally {
                    this.active--;
                    // 继续处理下一个任务
                    this.processNext();
                }
            });
        }
    }
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            active: this.active,
            max: this.maxConcurrent,
            available: Math.max(0, this.maxConcurrent - this.active),
            queued: this.queue.length,
        };
    }
    /**
     * 获取队列中的等待任务信息
     */
    getQueueInfo() {
        const now = Date.now();
        return this.queue.map(task => ({
            timestamp: task.timestamp,
            waitingMs: now - task.timestamp,
        }));
    }
    /**
     * 设置最大并发数
     */
    setMaxConcurrent(max) {
        this.maxConcurrent = max;
        // 如果增加了并发数，尝试处理等待队列
        this.processNext();
    }
    /**
     * 设置默认超时时间
     */
    setDefaultTimeout(timeout) {
        this.defaultTimeout = timeout;
    }
    /**
     * 清空队列（用于关闭服务器时）
     */
    clear() {
        // 拒绝所有等待中的任务
        for (const task of this.queue) {
            clearTimeout(task.timeout);
            task.reject(new Error('服务器正在关闭'));
        }
        this.queue = [];
    }
}
// 全局并发限制器实例
// GLM-4.7 API 支持，最大并发数为 5，超时时间为 120 秒
export const globalLimiter = new ConcurrencyLimiter(5, 120000);
//# sourceMappingURL=concurrent.service.js.map