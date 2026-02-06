/**
 * 斐波那契数列计算工具模块
 *
 * 本模块提供多种方式计算斐波那契数列
 *
 * 斐波那契数列定义：
 * F(0) = 0, F(1) = 1
 * F(n) = F(n-1) + F(n-2) (n >= 2)
 *
 * 函数选择流程：
 *
 * fibonacci()
 *   ├─> 输入验证
 *   ├─> 选择实现方式
 *   │     ├─> fibonacciIterative()      迭代法 (推荐，性能最佳)
 *   │     ├─> fibonacciRecursive()      递归法 (简单但性能差)
 *   │     ├─> fibonacciMemoized()       记忆化递归
 *   │     └─> fibonacciMatrix()         矩阵快速幂 (O(log n))
 *   └─> 返回结果
 */
/**
 * 迭代法计算斐波那契数
 *
 * 时间复杂度: O(n)
 * 空间复杂度: O(1)
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export declare function fibonacciIterative(n: number): bigint;
/**
 * 递归法计算斐波那契数
 *
 * 时间复杂度: O(2^n) - 指数级，不推荐用于大数
 * 空间复杂度: O(n) - 递归调用栈
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export declare function fibonacciRecursive(n: number): bigint;
/**
 * 记忆化递归计算斐波那契数
 *
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export declare function fibonacciMemoized(n: number): bigint;
/**
 * 矩阵快速幂法计算斐波那契数
 *
 * 利用矩阵乘法性质:
 * |F(n+1) F(n)  |   |1 1|^n
 * |F(n)   F(n-1)| = |1 0|
 *
 * 时间复杂度: O(log n)
 * 空间复杂度: O(log n) - 递归深度
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export declare function fibonacciMatrix(n: number): bigint;
/**
 * 生成斐波那契数列（从第0项到第n项）
 *
 * @param n - 要生成的最大索引
 * @param method - 计算方法，默认为 'iterative'
 * @returns 斐波那契数列数组
 */
export declare function fibonacciSequence(n: number, method?: 'iterative' | 'recursive' | 'memoized' | 'matrix'): bigint[];
/**
 * 主函数：计算斐波那契数
 *
 * 默认使用迭代法（最佳性能）
 *
 * @param n - 要计算的斐波那契数列索引
 * @param method - 可选的计算方法
 * @returns 第 n 个斐波那契数
 */
export declare function fibonacci(n: number, method?: 'iterative' | 'recursive' | 'memoized' | 'matrix'): bigint;
/**
 * 清空记忆化缓存
 */
export declare function clearMemoCache(): void;
//# sourceMappingURL=fibonacci.util.d.ts.map