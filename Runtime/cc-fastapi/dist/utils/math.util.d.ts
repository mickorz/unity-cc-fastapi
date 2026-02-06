/**
 * 数学工具模块
 *
 * 本模块提供常用的数学计算函数
 *
 * 功能概览：
 *
 * countTo()
 *   ├─> 生成从 1 到 n 的数字数组
 *   ├─> 输入验证（n 必须为正整数）
 *   └─> 返回数字序列数组
 *
 * fibonacci()
 *   ├─> 迭代法实现（时间复杂度 O(n)，空间复杂度 O(1)）
 *   ├─> 输入验证（n 必须为非负整数）
 *   └─> 支持大数计算（使用 BigInt）
 */
/**
 * 计数函数
 *
 * 从 1 数到 n，生成一个连续数字数组
 *
 * 数列示例: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ..., n
 */
/**
 * 从 1 数到 n
 *
 * 生成一个包含从 1 到 n 的所有整数的数组
 * 时间复杂度 O(n)，空间复杂度 O(n)
 *
 * @param n - 要数到的数字（必须为正整数）
 * @returns 包含从 1 到 n 的数字数组
 * @throws {RangeError} 如果 n 不是正整数
 *
 * @example
 * ```ts
 * countTo(1)    // [1]
 * countTo(5)    // [1, 2, 3, 4, 5]
 * countTo(10)   // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * countTo(100)  // [1, 2, 3, ..., 100]
 * ```
 */
export declare function countTo(n: number): number[];
/**
 * 斐波那契数列定义
 *
 * F(0) = 0
 * F(1) = 1
 * F(n) = F(n-1) + F(n-2) (n >= 2)
 *
 * 数列示例: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
 */
/**
 * 计算斐波那契数列的第 n 项（迭代法）
 *
 * 使用迭代法实现，时间复杂度 O(n)，空间复杂度 O(1)
 * 适用于计算较大的 n 值，不会出现递归栈溢出问题
 *
 * @param n - 要计算的斐波那契数列索引（必须为非负整数）
 * @returns 斐波那契数列的第 n 项
 * @throws {RangeError} 如果 n 不是非负整数
 *
 * @example
 * ```ts
 * fibonacci(0)  // 0
 * fibonacci(1)  // 1
 * fibonacci(5)  // 5
 * fibonacci(10) // 55
 * fibonacci(50) // 12586269025
 * ```
 */
export declare function fibonacci(n: number): number;
/**
 * 计算斐波那契数列的第 n 项（BigInt 版本）
 *
 * 用于计算超大数值，返回 BigInt 类型
 * 可以准确计算超过 Number.MAX_SAFE_INTEGER 的结果
 *
 * @param n - 要计算的斐波那契数列索引（必须为非负整数）
 * @returns 斐波那契数列的第 n 项（BigInt 类型）
 * @throws {RangeError} 如果 n 不是非负整数
 *
 * @example
 * ```ts
 * fibonacciBig(0)   // 0n
 * fibonacciBig(10)  // 55n
 * fibonacciBig(100) // 354224848179261915075n
 * fibonacciBig(200) // 280571172992510140037611932413038677189525n
 * ```
 */
export declare function fibonacciBig(n: number): bigint;
/**
 * 生成斐波那契数列的前 n 项
 *
 * @param n - 要生成的项数（必须为非负整数）
 * @returns 包含前 n 项斐波那契数的数组
 * @throws {RangeError} 如果 n 不是非负整数
 *
 * @example
 * ```ts
 * fibonacciSequence(0)  // []
 * fibonacciSequence(1)  // [0]
 * fibonacciSequence(5)  // [0, 1, 1, 2, 3]
 * fibonacciSequence(10) // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
 * ```
 */
export declare function fibonacciSequence(n: number): number[];
//# sourceMappingURL=math.util.d.ts.map