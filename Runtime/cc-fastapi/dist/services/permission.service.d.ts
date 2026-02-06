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
import type { PermissionConfig, PermissionMode } from '../types/index.js';
/**
 * 构建权限配置
 *
 * @param mode - 权限模式
 * @param workspace - 工作目录
 * @param externaldirs - 外部文件夹（逗号分隔的字符串）
 * @returns 权限配置对象
 */
export declare function buildPermissionConfig(mode: PermissionMode | undefined, workspace?: string, externaldirs?: string): PermissionConfig;
/**
 * 构建 Claude CLI 权限相关参数数组
 *
 * @param config - 权限配置
 * @returns 参数数组
 */
export declare function buildPermissionArgs(config: PermissionConfig): string[];
/**
 * 应用禁止幻觉提示词
 *
 * @param prompt - 原始提示词
 * @param vision - 禁止幻觉参数（非空时生效）
 * @returns 修改后的提示词
 */
export declare function applyVisionRestriction(prompt: string, vision?: string): string;
//# sourceMappingURL=permission.service.d.ts.map