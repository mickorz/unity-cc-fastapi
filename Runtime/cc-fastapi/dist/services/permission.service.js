/**
 * 权限服务模块
 *
 * 权限构建流程：
 *
 * buildPermissionConfig(mode, workspace, externaldirs)
 *   ├─> 解析 allowedmode
 *   ├─> 构建 --allowedTools 参数
 *   ├─> 解析 externaldirs
 *   ├─> 构建 --add-dir 参数列表
 *   └─> 返回权限配置
 */
/**
 * 构建 --allowedTools 参数
 *
 * @param mode - 权限模式
 * @param workspace - 工作目录
 * @returns --allowedTools 参数值
 */
function buildAllowedToolsArg(mode, workspace) {
    switch (mode) {
        case 'pure':
            // 纯粹模式：完全禁止所有工具
            return '""';
        case 'simple':
            // 简单模式：禁止读取本地文件，但允许联网查资料
            return 'WebSearch,WebFetch';
        case 'readonly':
            // 只读模式
            return 'Read,LS,Glob,Grep';
        case 'projectwrite':
            // 可写工程模式
            if (workspace) {
                // 限制只能编辑 workspace 下的文件
                return `"Edit(${workspace}/**)","Read"`;
            }
            // 如果没有指定 workspace，默认允许编辑当前目录
            return 'Read,Write,Edit,LS,Glob,Grep';
        default:
            return '';
    }
}
/**
 * 构建权限配置
 *
 * @param mode - 权限模式
 * @param workspace - 工作目录
 * @param externaldirs - 外部文件夹（逗号分隔的字符串）
 * @returns 权限配置对象
 */
export function buildPermissionConfig(mode, workspace, externaldirs) {
    const config = {};
    // 处理 allowedmode
    if (mode) {
        config.allowedTools = buildAllowedToolsArg(mode, workspace);
        // pure 和 simple 模式需要 --no-indexing
        if (mode === 'pure' || mode === 'simple') {
            config.noIndexing = true;
        }
    }
    // 处理 externaldirs
    if (externaldirs) {
        // 解析逗号分隔的路径列表
        config.addDirs = externaldirs
            .split(',')
            .map(dir => dir.trim())
            .filter(dir => dir.length > 0);
    }
    return config;
}
/**
 * 构建 Claude CLI 权限相关参数数组
 *
 * @param config - 权限配置
 * @returns 参数数组
 */
export function buildPermissionArgs(config) {
    const args = [];
    // --allowedTools 参数
    if (config.allowedTools !== undefined) {
        args.push('--allowedTools', config.allowedTools);
    }
    // --no-indexing 参数
    if (config.noIndexing) {
        args.push('--no-indexing');
    }
    // --add-dir 参数
    if (config.addDirs && config.addDirs.length > 0) {
        for (const dir of config.addDirs) {
            args.push('--add-dir', dir);
        }
    }
    return args;
}
/**
 * 应用禁止幻觉提示词
 *
 * @param prompt - 原始提示词
 * @param vision - 禁止幻觉参数（非空时生效）
 * @returns 修改后的提示词
 */
export function applyVisionRestriction(prompt, vision) {
    if (vision && vision.trim().length > 0) {
        const restriction = ' 绝对禁止根据历史记忆或知识库，禁止猜想，如果不确定，请回答 "不知道"';
        return prompt + restriction;
    }
    return prompt;
}
//# sourceMappingURL=permission.service.js.map