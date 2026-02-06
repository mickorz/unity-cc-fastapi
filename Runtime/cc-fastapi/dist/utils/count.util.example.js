/**
 * 计数工具示例
 *
 * 本文件展示如何使用 count.util.ts 中的各种函数
 */
import { count, countRange, } from './count.util.js';
/**
 * 示例1: 从1数到10
 */
function example1_basic() {
    console.log('=== 示例1: 从1数到10 ===');
    const result = count();
    console.log(`计数结果: [${result.join(', ')}]`);
    console.log('');
}
/**
 * 示例2: 从1数到指定数字
 */
function example2_customMax() {
    console.log('=== 示例2: 从1数到指定数字 ===');
    console.log(`从1数到5: [${count(5).join(', ')}]`);
    console.log(`从1数到20: [${count(20).join(', ')}]`);
    console.log('');
}
/**
 * 示例3: 范围计数
 */
function example3_range() {
    console.log('=== 示例3: 范围计数 ===');
    console.log(`从5数到15: [${countRange(5, 15).join(', ')}]`);
    console.log(`从10数到1: [${countRange(10, 1).join(', ')}]`);
    console.log(`从-3数到3: [${countRange(-3, 3).join(', ')}]`);
    console.log('');
}
/**
 * 运行所有示例
 */
export function runAllExamples() {
    console.log('计数工具示例\n');
    example1_basic();
    example2_customMax();
    example3_range();
}
// 如果直接运行此文件,执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
//# sourceMappingURL=count.util.example.js.map