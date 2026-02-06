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
 * 缓存记忆化存储
 */
const memoCache = new Map();
/**
 * 迭代法计算斐波那契数
 *
 * 时间复杂度: O(n)
 * 空间复杂度: O(1)
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export function fibonacciIterative(n) {
    if (n < 0) {
        throw new Error('输入必须是非负整数');
    }
    if (n === 0)
        return 0n;
    if (n === 1)
        return 1n;
    let prev = 0n;
    let curr = 1n;
    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}
/**
 * 递归法计算斐波那契数
 *
 * 时间复杂度: O(2^n) - 指数级，不推荐用于大数
 * 空间复杂度: O(n) - 递归调用栈
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export function fibonacciRecursive(n) {
    if (n < 0) {
        throw new Error('输入必须是非负整数');
    }
    if (n === 0)
        return 0n;
    if (n === 1)
        return 1n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}
/**
 * 记忆化递归计算斐波那契数
 *
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 *
 * @param n - 要计算的斐波那契数列索引
 * @returns 第 n 个斐波那契数
 */
export function fibonacciMemoized(n) {
    if (n < 0) {
        throw new Error('输入必须是非负整数');
    }
    if (n === 0)
        return 0n;
    if (n === 1)
        return 1n;
    if (memoCache.has(n)) {
        return memoCache.get(n);
    }
    const result = fibonacciMemoized(n - 1) + fibonacciMemoized(n - 2);
    memoCache.set(n, result);
    return result;
}
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
export function fibonacciMatrix(n) {
    if (n < 0) {
        throw new Error('输入必须是非负整数');
    }
    if (n === 0)
        return 0n;
    const matrixPower = (mat, power) => {
        if (power === 1)
            return mat;
        if (power % 2 === 0) {
            const half = matrixPower(mat, power / 2);
            return multiplyMatrix(half, half);
        }
        else {
            return multiplyMatrix(mat, matrixPower(mat, power - 1));
        }
    };
    const multiplyMatrix = (a, b) => {
        return [
            a[0] * b[0] + a[1] * b[2],
            a[0] * b[1] + a[1] * b[3],
            a[2] * b[0] + a[3] * b[2],
            a[2] * b[1] + a[3] * b[3],
        ];
    };
    const baseMatrix = [1n, 1n, 1n, 0n];
    const result = matrixPower(baseMatrix, n);
    return result[1];
}
/**
 * 生成斐波那契数列（从第0项到第n项）
 *
 * @param n - 要生成的最大索引
 * @param method - 计算方法，默认为 'iterative'
 * @returns 斐波那契数列数组
 */
export function fibonacciSequence(n, method = 'iterative') {
    if (n < 0) {
        throw new Error('输入必须是非负整数');
    }
    const sequence = [];
    const calculator = {
        iterative: fibonacciIterative,
        recursive: fibonacciRecursive,
        memoized: fibonacciMemoized,
        matrix: fibonacciMatrix,
    }[method];
    for (let i = 0; i <= n; i++) {
        sequence.push(calculator(i));
    }
    return sequence;
}
/**
 * 主函数：计算斐波那契数
 *
 * 默认使用迭代法（最佳性能）
 *
 * @param n - 要计算的斐波那契数列索引
 * @param method - 可选的计算方法
 * @returns 第 n 个斐波那契数
 */
export function fibonacci(n, method) {
    const selectedMethod = method || 'iterative';
    const calculators = {
        iterative: fibonacciIterative,
        recursive: fibonacciRecursive,
        memoized: fibonacciMemoized,
        matrix: fibonacciMatrix,
    };
    return calculators[selectedMethod](n);
}
/**
 * 清空记忆化缓存
 */
export function clearMemoCache() {
    memoCache.clear();
}
//# sourceMappingURL=fibonacci.util.js.map