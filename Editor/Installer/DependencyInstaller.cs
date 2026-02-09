#if UNITY_EDITOR

using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using UnityEngine;
using UnityEditor;
using Debug = UnityEngine.Debug;

namespace Kiff.CcFastApi.Editor.Installer
{
    /// <summary>
    /// 依赖安装器
    ///
    /// 依赖安装流程：
    /// DependencyInstaller
    ///     ├─> AreDependenciesInstalled()  检查依赖是否已安装
    ///     ├─> InstallDependenciesAsync()   安装依赖
    ///     ├─> CleanDependenciesAsync()     清理依赖
    ///     └─> ReinstallDependenciesAsync() 重新安装依赖
    /// </summary>
    public static class DependencyInstaller
    {
        private const string DependenciesInstalledFlag = "KiffCcFastApi_DepsInstalled";

        /// <summary>
        /// 检查依赖是否已安装
        /// </summary>
        public static bool AreDependenciesInstalled()
        {
            var nodeModulesPath = Path.Combine(
                Utils.PackagePathResolver.GetNodeProjectPath(),
                "node_modules"
            );

            return Directory.Exists(nodeModulesPath);
        }

        /// <summary>
        /// 检查依赖是否完整（验证关键包）
        /// </summary>
        public static async Task<bool> AreDependenciesValidAsync()
        {
            var nodeModulesPath = Path.Combine(
                Utils.PackagePathResolver.GetNodeProjectPath(),
                "node_modules"
            );

            if (!Directory.Exists(nodeModulesPath))
            {
                return false;
            }

            // 检查关键依赖包是否存在
            var keyPackages = new[]
            {
                "fastify",
                "@fastify/cors",
                "@fastify/static",
                "@fastify/swagger",
                "@fastify/swagger-ui",
                "dotenv",
                "zod"
            };

            foreach (var package in keyPackages)
            {
                var packagePath = Path.Combine(nodeModulesPath, package);
                if (!Directory.Exists(packagePath))
                {
                    Debug.Log($"[CcFastApi] 缺少关键依赖: {package}");
                    return false;
                }
            }

            // 检查 package-lock.json 是否存在
            var projectPath = Utils.PackagePathResolver.GetNodeProjectPath();
            var packageLockPath = Path.Combine(projectPath, "package-lock.json");
            if (!File.Exists(packageLockPath))
            {
                Debug.Log("[CcFastApi] 缺少 package-lock.json");
                return false;
            }

            return true;
        }

        /// <summary>
        /// 安装依赖
        /// </summary>
        public static async Task<InstallResult> InstallDependenciesAsync(Action<string> onOutput = null)
        {
            var result = new InstallResult();

            var projectPath = Utils.PackagePathResolver.GetNodeProjectPath();
            if (string.IsNullOrEmpty(projectPath))
            {
                result.Success = false;
                result.ErrorMessage = "未找到 Node.js 项目路径";
                return result;
            }

            // 检查 package.json 是否存在
            var packageJson = Path.Combine(projectPath, "package.json");
            if (!File.Exists(packageJson))
            {
                result.Success = false;
                result.ErrorMessage = "未找到 package.json";
                return result;
            }

            Debug.Log("[CcFastApi] 开始安装 Node.js 依赖...");

            try
            {
                // 构建命令
                string command, arguments;
#if UNITY_EDITOR_WIN
                command = "cmd.exe";
                arguments = $"/c npm install --progress=false";
#else
                command = "npm";
                arguments = "install --progress=false";
#endif

                // 执行 npm install
                var startInfo = new ProcessStartInfo
                {
                    FileName = command,
                    Arguments = arguments,
                    WorkingDirectory = projectPath,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    Environment = { ["NODE_ENV"] = "production" }
                };

                using var process = new Process { StartInfo = startInfo };

                process.OutputDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        onOutput?.Invoke($"[npm] {e.Data}");
                        Debug.Log($"[CcFastApi] {e.Data}");
                    }
                };

                process.ErrorDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        onOutput?.Invoke($"[npm] {e.Data}");
                        // npm 的某些信息会输出到 stderr
                        if (!e.Data.Contains("npm WARN") && !e.Data.Contains("deprecated"))
                        {
                            Debug.LogWarning($"[CcFastApi] {e.Data}");
                        }
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                // 等待完成（设置较长的超时时间）
                var completed = await Task.Run(() => process.WaitForExit(300000)); // 5分钟

                if (!completed)
                {
                    // 超时，强制终止
                    try
                    {
                        process.Kill();
                    }
                    catch
                    {
                        // 忽略
                    }

                    result.Success = false;
                    result.ErrorMessage = "npm install 执行超时（5分钟）";
                    return result;
                }

                result.Success = process.ExitCode == 0;

                if (result.Success)
                {
                    Debug.Log("[CcFastApi] 依赖安装成功");
                    EditorPrefs.SetBool(DependenciesInstalledFlag, true);
                }
                else
                {
                    result.ErrorMessage = $"npm install 退出码: {process.ExitCode}";
                }

                result.ExitCode = process.ExitCode;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                Debug.LogError($"[CcFastApi] 依赖安装失败: {ex.Message}");
            }

            return result;
        }

        /// <summary>
        /// 清理依赖
        /// </summary>
        public static async Task<bool> CleanDependenciesAsync()
        {
            var nodeModulesPath = Path.Combine(
                Utils.PackagePathResolver.GetNodeProjectPath(),
                "node_modules"
            );

            if (!Directory.Exists(nodeModulesPath))
            {
                Debug.Log("[CcFastApi] node_modules 不存在，无需清理");
                return true;
            }

            try
            {
                Debug.Log("[CcFastApi] 正在清理 node_modules...");

                // 在 Windows 上，直接删除可能很慢，使用 rmdir 命令
#if UNITY_EDITOR_WIN
                var startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c rmdir /s /q \"{nodeModulesPath}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = startInfo };
                process.Start();
                await Task.Run(() => process.WaitForExit(60000)); // 1分钟超时
#else
                await Task.Run(() => Directory.Delete(nodeModulesPath, true));
#endif

                Debug.Log("[CcFastApi] node_modules 已清理");
                EditorPrefs.SetBool(DependenciesInstalledFlag, false);
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CcFastApi] 清理失败: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// 重新安装依赖
        /// </summary>
        public static async Task<InstallResult> ReinstallDependenciesAsync(Action<string> onOutput = null)
        {
            Debug.Log("[CcFastApi] 开始重新安装依赖...");

            // 先清理
            await CleanDependenciesAsync();

            // 等待文件系统释放
            await Task.Delay(1000);

            // 再安装
            return await InstallDependenciesAsync(onOutput);
        }

        /// <summary>
        /// 获取已安装的依赖列表
        /// </summary>
        public static async Task<System.Collections.Generic.List<PackageInfo>> GetInstalledPackagesAsync()
        {
            var packages = new System.Collections.Generic.List<PackageInfo>();

            var nodeModulesPath = Path.Combine(
                Utils.PackagePathResolver.GetNodeProjectPath(),
                "node_modules"
            );

            if (!Directory.Exists(nodeModulesPath))
            {
                return packages;
            }

            try
            {
                // 读取 package-lock.json 获取精确的依赖版本
                var projectPath = Utils.PackagePathResolver.GetNodeProjectPath();
                var packageLockPath = Path.Combine(projectPath, "package-lock.json");

                if (File.Exists(packageLockPath))
                {
                    var content = await File.ReadAllTextAsync(packageLockPath);
                    // 简单的解析（实际应该使用 JSON 解析器）
                    // 这里只做基本实现

                    var directories = Directory.GetDirectories(nodeModulesPath);
                    foreach (var dir in directories)
                    {
                        var packageName = Path.GetFileName(dir);
                        var packageJson = Path.Combine(dir, "package.json");

                        if (File.Exists(packageJson))
                        {
                            try
                            {
                                var pkgContent = File.ReadAllText(packageJson);
                                var info = new PackageInfo
                                {
                                    Name = packageName
                                };

                                // 提取版本号
                                var match = System.Text.RegularExpressions.Regex.Match(pkgContent, "\"version\"\\s*:\\s*\"([^\"]+)\"");
                                if (match.Success)
                                {
                                    info.Version = match.Groups[1].Value;
                                }

                                packages.Add(info);
                            }
                            catch
                            {
                                // 忽略无法解析的包
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 获取已安装包列表失败: {ex.Message}");
            }

            return packages;
        }

        /// <summary>
        /// 获取依赖安装状态
        /// </summary>
        public static DependencyStatus GetDependencyStatus()
        {
            var status = new DependencyStatus();
            var nodeModulesPath = Path.Combine(
                Utils.PackagePathResolver.GetNodeProjectPath(),
                "node_modules"
            );

            status.IsInstalled = Directory.Exists(nodeModulesPath);

            if (status.IsInstalled)
            {
                try
                {
                    status.InstalledSize = CalculateDirectorySize(nodeModulesPath);
                    status.PackageCount = Directory.GetDirectories(nodeModulesPath).Length;

                    // 检查 package-lock.json 修改时间
                    var projectPath = Utils.PackagePathResolver.GetNodeProjectPath();
                    var packageLockPath = Path.Combine(projectPath, "package-lock.json");
                    if (File.Exists(packageLockPath))
                    {
                        status.LastInstallTime = File.GetLastWriteTime(packageLockPath);
                    }
                }
                catch
                {
                    // 忽略错误
                }
            }

            return status;
        }

        /// <summary>
        /// 计算目录大小
        /// </summary>
        private static long CalculateDirectorySize(string path)
        {
            try
            {
                var size = 0L;

                var files = Directory.GetFiles(path, "*.*", SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    try
                    {
                        size += new FileInfo(file).Length;
                    }
                    catch
                    {
                        // 忽略无法访问的文件
                    }
                }

                return size;
            }
            catch
            {
                return 0;
            }
        }
    }

    /// <summary>
    /// 安装结果
    /// </summary>
    public class InstallResult
    {
        public bool Success { get; set; }
        public int ExitCode { get; set; }
        public string ErrorMessage { get; set; }
    }

    /// <summary>
    /// 包信息
    /// </summary>
    public class PackageInfo
    {
        public string Name { get; set; }
        public string Version { get; set; }
    }

    /// <summary>
    /// 依赖状态
    /// </summary>
    public class DependencyStatus
    {
        public bool IsInstalled { get; set; }
        public long InstalledSize { get; set; }
        public int PackageCount { get; set; }
        public DateTime LastInstallTime { get; set; }

        /// <summary>
        /// 获取格式化的文件大小
        /// </summary>
        public string GetFormattedSize()
        {
            if (InstalledSize < 1024)
                return $"{InstalledSize} B";
            if (InstalledSize < 1024 * 1024)
                return $"{InstalledSize / 1024.0:F2} KB";
            if (InstalledSize < 1024 * 1024 * 1024)
                return $"{InstalledSize / (1024.0 * 1024.0):F2} MB";
            return $"{InstalledSize / (1024.0 * 1024.0 * 1024.0):F2} GB";
        }
    }
}

#endif
