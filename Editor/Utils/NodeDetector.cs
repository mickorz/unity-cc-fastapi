#if UNITY_EDITOR

using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace Kiff.CcFastApi.Editor.Utils
{
    /// <summary>
    /// Node.js 环境检测器
    ///
    /// 环境检测流程：
    /// NodeDetector
    ///     ├─> IsNodeInstalledAsync()     检测 Node.js 是否安装
    ///     ├─> IsNpmInstalledAsync()      检测 npm 是否安装
    ///     ├─> GetNodeVersionAsync()      获取 Node.js 版本
    ///     ├─> GetNpmVersionAsync()       获取 npm 版本
    ///     └─> FindNodeExecutable()       查找 Node.js 可执行文件
    /// </summary>
    public static class NodeDetector
    {
        private static string _cachedNodePath;
        private static string _cachedNpmPath;
        private static string _cachedNodeVersion;
        private static string _cachedNpmVersion;

        /// <summary>
        /// 检测 Node.js 是否已安装
        /// </summary>
        public static async Task<bool> IsNodeInstalledAsync()
        {
            try
            {
                var result = await RunCommandAsync("node", "--version", timeoutMs: 5000);
                var isInstalled = result.ExitCode == 0 && !string.IsNullOrEmpty(result.Output);

                if (isInstalled)
                {
                    _cachedNodeVersion = result.Output.Trim();
                }

                return isInstalled;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// 检测 npm 是否已安装
        /// </summary>
        public static async Task<bool> IsNpmInstalledAsync()
        {
            try
            {
                var result = await RunCommandAsync("npm", "--version", timeoutMs: 5000);
                var isInstalled = result.ExitCode == 0 && !string.IsNullOrEmpty(result.Output);

                if (isInstalled)
                {
                    _cachedNpmVersion = result.Output.Trim();
                }

                return isInstalled;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// 获取 Node.js 版本号
        /// </summary>
        public static async Task<string> GetNodeVersionAsync()
        {
            if (!string.IsNullOrEmpty(_cachedNodeVersion))
            {
                return _cachedNodeVersion;
            }

            try
            {
                var result = await RunCommandAsync("node", "--version", timeoutMs: 5000);
                if (result.ExitCode == 0)
                {
                    _cachedNodeVersion = result.Output.Trim();
                    return _cachedNodeVersion;
                }
            }
            catch
            {
                // 忽略错误
            }

            return null;
        }

        /// <summary>
        /// 获取 npm 版本号
        /// </summary>
        public static async Task<string> GetNpmVersionAsync()
        {
            if (!string.IsNullOrEmpty(_cachedNpmVersion))
            {
                return _cachedNpmVersion;
            }

            try
            {
                var result = await RunCommandAsync("npm", "--version", timeoutMs: 5000);
                if (result.ExitCode == 0)
                {
                    _cachedNpmVersion = result.Output.Trim();
                    return _cachedNpmVersion;
                }
            }
            catch
            {
                // 忽略错误
            }

            return null;
        }

        /// <summary>
        /// 查找 Node.js 可执行文件路径
        /// </summary>
        public static string FindNodeExecutable()
        {
            if (!string.IsNullOrEmpty(_cachedNodePath))
            {
                return _cachedNodePath;
            }

            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = GetPlatformCommand(),
                    Arguments = GetPlatformArgument("which node"),
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = startInfo };
                process.Start();
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode == 0 && !string.IsNullOrEmpty(output))
                {
                    _cachedNodePath = output.Trim();
                    return _cachedNodePath;
                }
            }
            catch
            {
                // 忽略错误
            }

            return null;
        }

        /// <summary>
        /// 查找 npm 可执行文件路径
        /// </summary>
        public static string FindNpmExecutable()
        {
            if (!string.IsNullOrEmpty(_cachedNpmPath))
            {
                return _cachedNpmPath;
            }

            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = GetPlatformCommand(),
                    Arguments = GetPlatformArgument("which npm"),
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = startInfo };
                process.Start();
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                if (process.ExitCode == 0 && !string.IsNullOrEmpty(output))
                {
                    _cachedNpmPath = output.Trim();
                    return _cachedNpmPath;
                }
            }
            catch
            {
                // 忽略错误
            }

            return null;
        }

        /// <summary>
        /// 获取完整的 Node.js 环境信息
        /// </summary>
        public static async Task<NodeEnvironmentInfo> GetEnvironmentInfoAsync()
        {
            var info = new NodeEnvironmentInfo();

            // 并行检测 Node.js 和 npm
            var nodeTask = IsNodeInstalledAsync();
            var npmTask = IsNpmInstalledAsync();

            await Task.WhenAll(nodeTask, npmTask);

            info.HasNode = await nodeTask;
            info.HasNpm = await npmTask;
            info.NodeVersion = await GetNodeVersionAsync();
            info.NpmVersion = await GetNpmVersionAsync();
            info.NodePath = FindNodeExecutable();
            info.NpmPath = FindNpmExecutable();

            return info;
        }

        /// <summary>
        /// 验证 Node.js 版本是否满足最低要求
        /// </summary>
        public static bool IsNodeVersionValid(string version)
        {
            if (string.IsNullOrEmpty(version))
            {
                return false;
            }

            // 版本格式: v16.14.0
            var versionString = version.TrimStart('v');
            if (!Version.TryParse(versionString, out var parsedVersion))
            {
                // 尝试简单解析
                var parts = versionString.Split('.');
                if (parts.Length >= 2 && int.TryParse(parts[0], out var major))
                {
                    return major >= 16;
                }
                return false;
            }

            return parsedVersion.Major >= 16;
        }

        /// <summary>
        /// 运行命令并返回结果
        /// </summary>
        private static async Task<CommandResult> RunCommandAsync(string fileName, string arguments, int timeoutMs = 30000)
        {
            var result = new CommandResult();

            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = fileName,
                    Arguments = arguments,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };

                using var process = new Process { StartInfo = startInfo };

                process.Start();

                // 异步读取输出
                var outputTask = process.StandardOutput.ReadToEndAsync();
                var errorTask = process.StandardError.ReadToEndAsync();

                // 等待进程完成或超时
                var waitForExitTask = Task.Run(() => process.WaitForExit());
                var delayTask = Task.Delay(timeoutMs);

                var completed = await Task.WhenAny(waitForExitTask, delayTask);

                if (completed == delayTask)
                {
                    // 超时，强制终止进程
                    try
                    {
                        process.Kill();
                    }
                    catch
                    {
                        // 忽略
                    }

                    result.ExitCode = -1;
                    result.Error = "命令执行超时";
                    return result;
                }

                result.ExitCode = process.ExitCode;
                result.Output = await outputTask;
                result.Error = await errorTask;
            }
            catch (Exception ex)
            {
                result.ExitCode = -1;
                result.Error = ex.Message;
            }

            return result;
        }

        /// <summary>
        /// 获取平台特定的命令
        /// </summary>
        private static string GetPlatformCommand()
        {
#if UNITY_EDITOR_WIN
            return "cmd.exe";
#elif UNITY_EDITOR_OSX || UNITY_EDITOR_LINUX
            return "/bin/bash";
#else
            return "sh";
#endif
        }

        /// <summary>
        /// 获取平台特定的参数
        /// </summary>
        private static string GetPlatformArgument(string command)
        {
#if UNITY_EDITOR_WIN
            return $"/c \"{command}\"";
#else
            return $"-c \"{command}\"";
#endif
        }

        /// <summary>
        /// 清除缓存
        /// </summary>
        public static void ClearCache()
        {
            _cachedNodePath = null;
            _cachedNpmPath = null;
            _cachedNodeVersion = null;
            _cachedNpmVersion = null;
        }
    }

    /// <summary>
    /// 命令执行结果
    /// </summary>
    public class CommandResult
    {
        public int ExitCode { get; set; }
        public string Output { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public bool Success => ExitCode == 0;
    }

    /// <summary>
    /// Node.js 环境信息
    /// </summary>
    public class NodeEnvironmentInfo
    {
        public bool HasNode { get; set; }
        public bool HasNpm { get; set; }
        public string NodeVersion { get; set; }
        public string NpmVersion { get; set; }
        public string NodePath { get; set; }
        public string NpmPath { get; set; }

        /// <summary>
        /// 是否环境完整
        /// </summary>
        public bool IsComplete => HasNode && HasNpm;

        /// <summary>
        /// 获取问题描述
        /// </summary>
        public string GetIssueDescription()
        {
            if (IsComplete)
            {
                return null;
            }

            var issues = new System.Collections.Generic.List<string>();

            if (!HasNode)
            {
                issues.Add("未检测到 Node.js");
            }

            if (!HasNpm)
            {
                issues.Add("未检测到 npm");
            }

            if (!string.IsNullOrEmpty(NodeVersion) && !NodeDetector.IsNodeVersionValid(NodeVersion))
            {
                issues.Add($"Node.js 版本过低: {NodeVersion}，需要 v16 或更高版本");
            }

            return string.Join("; ", issues);
        }
    }
}

#endif
