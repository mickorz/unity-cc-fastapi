/**
 * 数学工具函数测试示例
 *
 * 运行方式:
 * ts-node src/utils/math.util.example.ts
 */
import { countTo, fibonacci, fibonacciBig, fibonacciSequence } from './math.util.js';
console.log('=== 数学工具函数测试 ===\n');
// 测试 countTo 函数（从1数到n）
console.log('--- 测试 countTo() 函数 ---');
console.log(`countTo(100) = [${countTo(100).join(', ')}]`);
// 测试 fibonacci 函数
console.log('\n--- 测试 fibonacci() 函数 ---');
const testCases = [0, 1, 2, 5, 10, 20, 50];
for (const n of testCases) {
    console.log(`fibonacci(${n}) = ${fibonacci(n)}`);
}
// 测试 fibonacciBig 函数（大数版本）
console.log('\n--- 测试 fibonacciBig() 函数 ---');
const bigTestCases = [0, 10, 50, 100, 200];
for (const n of bigTestCases) {
    console.log(`fibonacciBig(${n}) = ${fibonacciBig(n)}`);
}
// 测试 fibonacciSequence 函数
console.log('\n--- 测试 fibonacciSequence() 函数 ---');
const seqTestCases = [0, 1, 5, 10];
for (const n of seqTestCases) {
    console.log(`fibonacciSequence(${n}) = [${fibonacciSequence(n).join(', ')}]`);
}
// 测试错误处理
console.log('\n--- 测试错误处理 ---');
try {
    countTo(0);
}
catch (e) {
    console.log(`countTo(0) 抛出错误: ${e.message}`);
}
try {
    fibonacci(-1);
}
catch (e) {
    console.log(`fibonacci(-1) 抛出错误: ${e.message}`);
}
try {
    fibonacci(1.5);
}
catch (e) {
    console.log(`fibonacci(1.5) 抛出错误: ${e.message}`);
}
// 性能测试
console.log('\n--- 性能测试 ---');
const startCount = performance.now();
countTo(100000);
const endCount = performance.now();
console.log(`计算 countTo(100000) 耗时: ${(endCount - startCount).toFixed(4)} ms`);
const start = performance.now();
fibonacci(1000);
const end = performance.now();
console.log(`计算 fibonacci(1000) 耗时: ${(end - start).toFixed(4)} ms`);
const startBig = performance.now();
fibonacciBig(1000);
const endBig = performance.now();
console.log(`计算 fibonacciBig(1000) 耗时: ${(endBig - startBig).toFixed(4)} ms`);
console.log('\n=== 测试完成 ===');
//# sourceMappingURL=math.util.example.js.map