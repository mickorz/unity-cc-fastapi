/**
 * 权限服务单元测试
 *
 * 测试 buildPermissionConfig、buildPermissionArgs、applyVisionRestriction 函数
 */

import { buildPermissionConfig, buildPermissionArgs, applyVisionRestriction } from './permission.service.js';
import type { PermissionConfig } from '../types/index.js';

/**
 * 测试构建权限配置 - 纯粹模式
 */
export function testBuildPermissionConfigPure(): void {
    console.log('=== 测试纯粹模式 ===');

    const config = buildPermissionConfig('pure', undefined, undefined);
    console.log('allowedTools:', config.allowedTools);
    console.log('noIndexing:', config.noIndexing);
    console.log('addDirs:', config.addDirs);

    // 验证结果
    if (config.allowedTools === '""' && config.noIndexing === true) {
        console.log('[成功] 纯粹模式配置正确');
    } else {
        console.error('[失败] 纯粹模式配置错误');
    }
    console.log('');
}

/**
 * 测试构建权限配置 - 简单模式
 */
export function testBuildPermissionConfigSimple(): void {
    console.log('=== 测试简单模式 ===');

    const config = buildPermissionConfig('simple', undefined, undefined);
    console.log('allowedTools:', config.allowedTools);
    console.log('noIndexing:', config.noIndexing);

    // 验证结果
    if (config.allowedTools === 'WebSearch,WebFetch' && config.noIndexing === true) {
        console.log('[成功] 简单模式配置正确');
    } else {
        console.error('[失败] 简单模式配置错误');
    }
    console.log('');
}

/**
 * 测试构建权限配置 - 只读模式
 */
export function testBuildPermissionConfigReadonly(): void {
    console.log('=== 测试只读模式 ===');

    const config = buildPermissionConfig('readonly', undefined, undefined);
    console.log('allowedTools:', config.allowedTools);
    console.log('noIndexing:', config.noIndexing);

    // 验证结果
    if (config.allowedTools === 'Read,LS,Glob,Grep' && config.noIndexing === undefined) {
        console.log('[成功] 只读模式配置正确');
    } else {
        console.error('[失败] 只读模式配置错误');
    }
    console.log('');
}

/**
 * 测试构建权限配置 - 可写工程模式
 */
export function testBuildPermissionConfigProjectwrite(): void {
    console.log('=== 测试可写工程模式 ===');

    const workspace = 'D:\\TestProject';
    const config = buildPermissionConfig('projectwrite', workspace, undefined);
    console.log('workspace:', workspace);
    console.log('allowedTools:', config.allowedTools);

    // 验证结果
    const expected = `"Edit(${workspace}/**)","Read"`;
    if (config.allowedTools === expected) {
        console.log('[成功] 可写工程模式配置正确');
    } else {
        console.error('[失败] 可写工程模式配置错误');
        console.error('期望:', expected);
        console.error('实际:', config.allowedTools);
    }
    console.log('');
}

/**
 * 测试构建权限配置 - 外部目录
 */
export function testBuildPermissionConfigExternalDirs(): void {
    console.log('=== 测试外部目录 ===');

    const externaldirs = 'D:\\ExternalResources,C:\\Logs';
    const config = buildPermissionConfig(undefined, undefined, externaldirs);
    console.log('externaldirs:', externaldirs);
    console.log('addDirs:', config.addDirs);

    // 验证结果
    const expected = ['D:\\ExternalResources', 'C:\\Logs'];
    if (JSON.stringify(config.addDirs) === JSON.stringify(expected)) {
        console.log('[成功] 外部目录配置正确');
    } else {
        console.error('[失败] 外部目录配置错误');
        console.error('期望:', expected);
        console.error('实际:', config.addDirs);
    }
    console.log('');
}

/**
 * 测试构建权限参数
 */
export function testBuildPermissionArgs(): void {
    console.log('=== 测试构建权限参数 ===');

    const config: PermissionConfig = {
        allowedTools: 'Read,LS,Glob,Grep',
        noIndexing: true,
        addDirs: ['D:\\External', 'C:\\Logs'],
    };

    const args = buildPermissionArgs(config);
    console.log('权限参数:', args);

    // 验证结果
    const hasAllowedTools = args.includes('--allowedTools') && args.includes('Read,LS,Glob,Grep');
    const hasNoIndexing = args.includes('--no-indexing');
    const hasAddDir1 = args.includes('--add-dir') && args.includes('D:\\External');
    const hasAddDir2 = args.includes('C:\\Logs');

    if (hasAllowedTools && hasNoIndexing && hasAddDir1 && hasAddDir2) {
        console.log('[成功] 权限参数构建正确');
    } else {
        console.error('[失败] 权限参数构建错误');
    }
    console.log('');
}

/**
 * 测试禁止幻觉提示词
 */
export function testApplyVisionRestriction(): void {
    console.log('=== 测试禁止幻觉提示词 ===');

    const prompt1 = '当前目录有哪些文件？';
    const result1 = applyVisionRestriction(prompt1, '');
    console.log('vision为空时:', result1);
    console.log('是否保持原样:', result1 === prompt1);

    const prompt2 = 'D盘有哪些目录？';
    const result2 = applyVisionRestriction(prompt2, 'enabled');
    console.log('vision为enabled时:', result2);
    console.log('是否添加限制:', result2.includes('绝对禁止根据历史记忆'));

    if (result1 === prompt1 && result2.includes('绝对禁止根据历史记忆')) {
        console.log('[成功] 禁止幻觉提示词正确');
    } else {
        console.error('[失败] 禁止幻觉提示词错误');
    }
    console.log('');
}

/**
 * 运行所有测试
 */
export function runAllTests(): void {
    console.log('');
    console.log('========================================');
    console.log('  权限服务单元测试');
    console.log('========================================');
    console.log('');

    testBuildPermissionConfigPure();
    testBuildPermissionConfigSimple();
    testBuildPermissionConfigReadonly();
    testBuildPermissionConfigProjectwrite();
    testBuildPermissionConfigExternalDirs();
    testBuildPermissionArgs();
    testApplyVisionRestriction();

    console.log('========================================');
    console.log('  测试完成');
    console.log('========================================');
    console.log('');
}

// 如果直接运行此文件，执行所有测试
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}
