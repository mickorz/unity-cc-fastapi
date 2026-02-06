/**
 * 并发限制服务（带等待队列和超时）
 *
 * 功能：
 * - 限制最大并发请求数
 * - 超过限制的请求进入等待队列
 * - 120秒超时机制
 * - 任务完成后自动从队列取出下一个
 */
export interface QueuedTask<T> {
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
    timestamp: number;
}
export interface ConcurrencyStatus {
    active: number;
    max: number;
    available: number;
    queued: number;
}
/**
 * 并发限制器类
 */
export declare class ConcurrencyLimiter {
    private active;
    private maxConcurrent;
    private queue;
    private defaultTimeout;
    constructor(maxConcurrent?: number, defaultTimeout?: number);
    /**
     * 执行带并发限制的异步操作
     *
     * @param execute - 要执行的异步函数
     * @param timeout - 超时时间（毫秒），默认 120000ms (120秒)
     * @returns 执行结果
     */
    run<T>(execute: () => Promise<T>, timeout?: number): Promise<T>;
    /**
     * 直接执行任务（有空闲槽位时）
     */
    private executeDirect;
    /**
     * 将任务加入等待队列
     */
    private enqueue;
    /**
     * 处理队列中的下一个任务
     */
    private processNext;
    /**
     * 获取当前状态
     */
    getStatus(): ConcurrencyStatus;
    /**
     * 获取队列中的等待任务信息
     */
    getQueueInfo(): Array<{
        timestamp: number;
        waitingMs: number;
    }>;
    /**
     * 设置最大并发数
     */
    setMaxConcurrent(max: number): void;
    /**
     * 设置默认超时时间
     */
    setDefaultTimeout(timeout: number): void;
    /**
     * 清空队列（用于关闭服务器时）
     */
    clear(): void;
}
export declare const globalLimiter: ConcurrencyLimiter;
//# sourceMappingURL=concurrent.service.d.ts.map