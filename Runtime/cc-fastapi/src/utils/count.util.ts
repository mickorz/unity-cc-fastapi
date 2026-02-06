/**
 * 计数工具
 *
 * 本文件提供简单的计数功能
 */

/**
 * 从1数到指定数字
 * @param max 最大数字,默认为10
 * @returns 包含1到max的数字数组
 */
export function count(max: number = 10): number[] {
    const result: number[] = [];

    for (let i = 1; i <= max; i++) {
        result.push(i);
    }

    return result;
}

/**
 * 从start数到end
 * @param start 起始数字
 * @param end 结束数字
 * @returns 包含start到end的数字数组
 */
export function countRange(start: number, end: number): number[] {
    const result: number[] = [];

    if (start <= end) {
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
    } else {
        for (let i = start; i >= end; i--) {
            result.push(i);
        }
    }

    return result;
}
