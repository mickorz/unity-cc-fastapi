#if UNITY_EDITOR

using System;
using System.IO;
using System.Reflection;
using UnityEngine;

namespace Kiff.CcFastApi.Editor.Utils
{
    /// <summary>
    /// Package 路径解析器
    ///
    /// 路径解析流程：
    /// PackagePathResolver
    ///     ├─> GetPackageRoot()           获取 Package 根目录
    ///     ├─> GetNodeProjectPath()      获取 Node.js 项目路径
    ///     ├─> GetServerEntryPath()      获取服务器入口文件
    ///     └─> FindPackageByName()       通过包名查找
    /// </summary>
    public static class PackagePathResolver
    {
        private static string _cachedPackagePath;
        private const string PackageName = "com.kiff.cc-fastapi";

        /// <summary>
        /// 获取 cc-fastapi Package 的根路径
        /// </summary>
        public static string GetPackageRoot()
        {
            if (!string.IsNullOrEmpty(_cachedPackagePath))
            {
                // 验证缓存路径是否仍然有效
                if (Directory.Exists(_cachedPackagePath))
                {
                    return _cachedPackagePath;
                }
                _cachedPackagePath = null;
            }

            // 方法1：通过 PackageName 查找
            var packagePath = FindPackageByName(PackageName);

            if (string.IsNullOrEmpty(packagePath))
            {
                // 方法2：通过当前代码位置推算
                packagePath = GetCurrentPackagePath();
            }

            if (string.IsNullOrEmpty(packagePath))
            {
                Debug.LogError($"[CcFastApi] 未找到 Package: {PackageName}");
                return null;
            }

            _cachedPackagePath = packagePath;
            return _cachedPackagePath;
        }

        /// <summary>
        /// 获取 Node.js 项目的绝对路径
        /// </summary>
        public static string GetNodeProjectPath()
        {
            var packageRoot = GetPackageRoot();
            if (string.IsNullOrEmpty(packageRoot))
            {
                return null;
            }

            var nodeProjectPath = Path.Combine(packageRoot, "Runtime", "cc-fastapi");

            // 添加调试日志
            Debug.Log($"[CcFastApi] PackageRoot: {packageRoot}");
            Debug.Log($"[CcFastApi] NodeProjectPath: {nodeProjectPath}");
            Debug.Log($"[CcFastApi] Directory.Exists: {Directory.Exists(nodeProjectPath)}");

            if (Directory.Exists(nodeProjectPath))
            {
                var packageJson = Path.Combine(nodeProjectPath, "package.json");
                Debug.Log($"[CcFastApi] package.json path: {packageJson}");
                Debug.Log($"[CcFastApi] package.json exists: {File.Exists(packageJson)}");
            }

            return nodeProjectPath;
        }

        /// <summary>
        /// 获取服务器入口文件路径
        /// </summary>
        public static string GetServerEntryPath()
        {
            var projectPath = GetNodeProjectPath();
            if (string.IsNullOrEmpty(projectPath))
            {
                return null;
            }

            return Path.Combine(projectPath, "dist", "server.js");
        }

        /// <summary>
        /// 获取 package.json 路径
        /// </summary>
        public static string GetNodePackageJsonPath()
        {
            var projectPath = GetNodeProjectPath();
            if (string.IsNullOrEmpty(projectPath))
            {
                return null;
            }

            return Path.Combine(projectPath, "package.json");
        }

        /// <summary>
        /// 获取 node_modules 路径
        /// </summary>
        public static string GetNodeModulesPath()
        {
            var projectPath = GetNodeProjectPath();
            if (string.IsNullOrEmpty(projectPath))
            {
                return null;
            }

            return Path.Combine(projectPath, "node_modules");
        }

        /// <summary>
        /// 通过遍历 Unity Package 目录查找指定包
        /// </summary>
        private static string FindPackageByName(string packageName)
        {
            // Packages 可以在以下位置：
            // 1. Assets/ 下的本地 Package (嵌入)
            // 2. Unity 安装目录下的 Packages/
            // 3. 用户目录下的 .unity/Packages/

            var projectPath = Directory.GetCurrentDirectory();
            var possiblePaths = new[]
            {
                // 项目本地 Packages
                Path.Combine(projectPath, "Packages"),
                // Unity 缓存目录
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Unity",
                    "Editor-5.x",
                    "Packages"
                ),
                // 全局 Packages (某些配置)
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "Unity",
                    "Packages"
                )
            };

            foreach (var basePath in possiblePaths)
            {
                if (!Directory.Exists(basePath))
                {
                    continue;
                }

                var packagePath = Path.Combine(basePath, packageName);
                if (Directory.Exists(packagePath))
                {
                    // 验证是否有 package.json
                    var packageJson = Path.Combine(packagePath, "package.json");
                    if (File.Exists(packageJson))
                    {
                        return Path.GetFullPath(packagePath);
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// 通过当前脚本所在位置推算 Package 路径
        /// </summary>
        private static string GetCurrentPackagePath()
        {
            try
            {
                // 获取当前脚本所在的程序集位置
                var assembly = Assembly.GetExecutingAssembly();
                var location = assembly.Location;

                if (string.IsNullOrEmpty(location))
                {
                    // 如果在编辑器中运行，Location 可能为空，尝试使用 CodeBase
                    var codeBase = assembly.CodeBase;
                    if (!string.IsNullOrEmpty(codeBase))
                    {
                        location = new Uri(codeBase).LocalPath;
                    }
                }

                if (string.IsNullOrEmpty(location))
                {
                    return null;
                }

                // 获取脚本所在目录
                var scriptDirectory = new DirectoryInfo(Path.GetDirectoryName(location));

                // 向上查找 package.json
                var current = scriptDirectory;
                var maxIterations = 10; // 防止无限循环

                while (current != null && maxIterations-- > 0)
                {
                    var packageJson = Path.Combine(current.FullName, "package.json");
                    if (File.Exists(packageJson))
                    {
                        // 验证是否是正确的 Package
                        var content = File.ReadAllText(packageJson);
                        if (content.Contains(PackageName))
                        {
                            return current.FullName;
                        }
                    }

                    current = current.Parent;
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 推算 Package 路径失败: {ex.Message}");
            }

            return null;
        }

        /// <summary>
        /// 清除路径缓存
        /// </summary>
        public static void ClearCache()
        {
            _cachedPackagePath = null;
        }

        /// <summary>
        /// 验证 Package 结构是否完整
        /// </summary>
        public static bool ValidatePackageStructure()
        {
            var packageRoot = GetPackageRoot();
            if (string.IsNullOrEmpty(packageRoot))
            {
                Debug.LogError("[CcFastApi] Package 根目录未找到");
                return false;
            }

            var requiredPaths = new[]
            {
                Path.Combine(packageRoot, "package.json"),
                Path.Combine(packageRoot, "Runtime", "cc-fastapi"),
                Path.Combine(packageRoot, "Editor")
            };

            foreach (var requiredPath in requiredPaths)
            {
                if (!Directory.Exists(requiredPath) && !File.Exists(requiredPath))
                {
                    Debug.LogError($"[CcFastApi] Package 结构不完整，缺少: {requiredPath}");
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// 获取 Package 信息
        /// </summary>
        public static PackageInfo GetPackageInfo()
        {
            var packageRoot = GetPackageRoot();
            if (string.IsNullOrEmpty(packageRoot))
            {
                return null;
            }

            var packageJson = Path.Combine(packageRoot, "package.json");
            if (!File.Exists(packageJson))
            {
                return null;
            }

            try
            {
                var content = File.ReadAllText(packageJson);
                // 简单的 JSON 解析（可以使用 JsonUtility 或第三方库）
                var info = new PackageInfo
                {
                    RootPath = packageRoot,
                    Name = PackageName
                };

                // 提取版本号
                var versionMatch = System.Text.RegularExpressions.Regex.Match(content, "\"version\"\\s*:\\s*\"([^\"]+)\"");
                if (versionMatch.Success)
                {
                    info.Version = versionMatch.Groups[1].Value;
                }

                return info;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 读取 Package 信息失败: {ex.Message}");
                return null;
            }
        }
    }

    /// <summary>
    /// Package 信息
    /// </summary>
    public class PackageInfo
    {
        public string Name { get; set; }
        public string Version { get; set; }
        public string RootPath { get; set; }
    }
}

#endif
