/**
 * 斐波那契数列计算示例
 *
 * 本文件展示如何使用 fibonacci.util.ts 中的各种函数
 */
import { fibonacci, fibonacciIterative, fibonacciRecursive, fibonacciMemoized, fibonacciMatrix, fibonacciSequence, clearMemoCache, } from './fibonacci.util.js';
/**
 * 示例1: 基本使用
 */
function example1_basic() {
    console.log('=== 示例1: 基本使用 ===');
    // 使用默认方法（迭代法）
    console.log(`F(10) = ${fibonacci(10)}`); // 55
    console.log(`F(20) = ${fibonacci(20)}`); // 6765
    console.log(`F(50) = ${fibonacci(50)}`); // 12586269025
    console.log('');
}
/**
 * 示例2: 不同计算方法
 */
function example2_methods() {
    console.log('=== 示例2: 不同计算方法 ===');
    const n = 10;
    console.log(`计算 F(${n}):`);
    console.log(`  迭代法: ${fibonacciIterative(n)}`);
    console.log(`  递归法: ${fibonacciRecursive(n)}`);
    console.log(`  记忆化: ${fibonacciMemoized(n)}`);
    console.log(`  矩阵法: ${fibonacciMatrix(n)}`);
    console.log('');
}
/**
 * 示例3: 生成斐波那契数列
 */
function example3_sequence() {
    console.log('=== 示例3: 生成斐波那契数列 ===');
    // 生成前 15 个斐波那契数
    const sequence = fibonacciSequence(14);
    console.log(`前15个斐波那契数: [${sequence.join(', ')}]`);
    console.log('');
    // 前20个斐波那契数
    const sequence20 = fibonacciSequence(19);
    console.log(`前20个斐波那契数:`);
    sequence20.forEach((value, index) => {
        console.log(`  F(${index}) = ${value}`);
    });
    console.log('');
}
/**
 * 示例4: 性能比较
 */
function example4_performance() {
    console.log('=== 示例4: 性能比较 ===');
    const testValue = 35;
    // 迭代法
    console.time('迭代法');
    fibonacciIterative(testValue);
    console.timeEnd('迭代法');
    // 递归法（注意：大数会很慢）
    if (testValue <= 35) {
        console.time('递归法');
        fibonacciRecursive(testValue);
        console.timeEnd('递归法');
    }
    // 记忆化
    clearMemoCache();
    console.time('记忆化（首次）');
    fibonacciMemoized(testValue);
    console.timeEnd('记忆化（首次）');
    console.time('记忆化（缓存）');
    fibonacciMemoized(testValue);
    console.timeEnd('记忆化（缓存）');
    // 矩阵法
    console.time('矩阵法');
    fibonacciMatrix(testValue);
    console.timeEnd('矩阵法');
    console.log('');
}
/**
 * 示例5: 大数计算
 */
function example5_largeNumbers() {
    console.log('=== 示例5: 大数计算 ===');
    const largeNumbers = [100, 200, 500, 1000];
    for (const n of largeNumbers) {
        console.time(`F(${n})`);
        const result = fibonacci(n, 'matrix');
        console.timeEnd(`F(${n})`);
        console.log(`结果长度: ${result.toString().length} 位数字`);
    }
    console.log('');
}
/**
 * 示例6: 错误处理
 */
function example6_errorHandling() {
    console.log('=== 示例6: 错误处理 ===');
    try {
        fibonacci(-1);
    }
    catch (error) {
        console.log(`捕获错误: ${error.message}`);
    }
    try {
        fibonacciSequence(-5);
    }
    catch (error) {
        console.log(`捕获错误: ${error.message}`);
    }
    console.log('');
}
/**
 * 运行所有示例
 */
export function runAllExamples() {
    console.log('斐波那契数列计算示例\n');
    console.log('斐波那契数列定义: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)\n');
    example1_basic();
    example2_methods();
    example3_sequence();
    example4_performance();
    example5_largeNumbers();
    example6_errorHandling();
}
// 如果直接运行此文件，执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
//# sourceMappingURL=fibonacci.util.example.js.map