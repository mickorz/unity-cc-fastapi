#if UNITY_EDITOR

using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;
using UnityEditor;
using Debug = UnityEngine.Debug;
using UnityEditor; // 处理编辑器扩展
using UnityEditor.Compilation; // 处理编译管线相关类（如 CompilerMessage）

namespace Kiff.CcFastApi.Editor.Controllers
{
    /// <summary>
    /// cc-fastapi 服务器控制器
    ///
    /// 控制器职责流程：
    /// CcFastApiController
    ///     ├─> Initialize()               初始化控制器
    ///     ├─> StartServerAsync()         启动服务器
    ///     ├─> StopServerAsync()          停止服务器
    ///     ├─> RestartServerAsync()       重启服务器
    ///     ├─> GetStatus()                获取服务器状态
    ///     └─> OnEditorQuitting()         Unity 退出时的处理
    ///
    /// 启动流程：
    /// StartServerAsync()
    ///     ├─> 检查是否已在运行
    ///     ├─> 检查 Node.js 环境
    ///     ├─> 检查/安装依赖
    ///     ├─> 验证服务器入口文件
    ///     ├─> 启动 Node.js 进程
    ///     └─> 等待并确认启动成功
    ///
    /// 停止流程：
    /// StopServerAsync()
    ///     ├─> 检查进程是否存在
    ///     ├─> 优雅关闭进程
    ///     ├─> 等待进程退出
    ///     └─> 强制终止（如超时）
    /// </summary>
    [InitializeOnLoad]
    public static class CcFastApiController
    {
        
        private static Process _serverProcess;
        private static readonly SemaphoreSlim _startupSemaphore = new SemaphoreSlim(1, 1);
        private static CcFastApiConfig _config;
        private static DateTime _serverStartTime;
        private static bool _isInitialized = false;
        private static bool _isConnectedToExternalServer = false;
        private static DateTime _lastCompilationCheckTime = DateTime.MinValue;

        /// <summary>
        /// 静态构造函数 - Unity 初始化时自动调用
        /// </summary>
        static CcFastApiController()
        {
            Initialize();
        }

        /// <summary>
        /// 初始化控制器
        ///
        /// 初始化流程：
        /// Initialize()
        ///     ├─> 加载配置
        ///     ├─> 注册 Unity 事件
        ///     ├─> 恢复会话
        ///     └─> 自动启动（如配置）
        /// </summary>
        public static void Initialize()
        {
            if (_isInitialized)
            {
                return;
            }

            try
            {
                // 加载配置
                LoadConfig();

                // 注册 Unity 事件
                RegisterEditorEvents();

                // 恢复会话（检查是否有残留进程）
                CleanupOrphanedProcess();

                // 自动启动（如果配置启用）
                if (_config.AutoStart)
                {
                    // 延迟启动，避免影响 Unity 启动速度
                    EditorApplication.delayCall += () =>
                    {
                        if (EditorApplication.isPlayingOrWillChangePlaymode)
                        {
                            return;
                        }
                        _ = StartServerAsync();
                    };
                }

                _isInitialized = true;

                Debug.Log("[CcFastApi] 控制器已初始化");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CcFastApi] 控制器初始化失败: {ex.Message}");
            }
        }

        
        /// <summary>
        /// 启动服务器
        /// </summary>
        public static async Task<bool> StartServerAsync()
        {
            await _startupSemaphore.WaitAsync();
            try
            {
                // 检查是否已运行
                if (_serverProcess != null && !_serverProcess.HasExited)
                {
                    Debug.LogWarning("[CcFastApi] 服务器已在运行中");
                    return true;
                }

                Debug.Log("[CcFastApi] 正在启动服务器...");

                // 0. 检查端口是否被占用（多 Unity 实例支持）
                var portStatus = await Utils.PortDetector.GetPortStatusAsync(_config.Host, _config.Port);
                if (portStatus == Utils.PortStatus.InUseByCcFastApi)
                {
                    Debug.Log("[CcFastApi] 检测到 cc-fastapi 服务器已在其他 Unity 实例中运行");
                    Debug.Log($"[CcFastApi] 连接到现有服务器 - {_config.GetServerUrl()}");

                    // 标记为连接到外部服务器
                    _isConnectedToExternalServer = true;
                    _serverStartTime = DateTime.Now;

                    // 标记为运行状态
                    SaveSession();

                    return true;
                }
                else if (portStatus == Utils.PortStatus.InUseByOther)
                {
                    Debug.LogError($"[CcFastApi] 端口 {_config.Port} 被其他程序占用");

                    var processInfo = Utils.PortDetector.GetPortProcessInfo(_config.Port);
                    var processDesc = string.IsNullOrEmpty(processInfo) ? "未知进程" : processInfo;

                    EditorUtility.DisplayDialog("端口被占用",
                        $"端口 {_config.Port} 已被其他程序使用。\n\n占用信息: {processDesc}\n\n请关闭占用端口的程序或修改配置使用其他端口。",
                        "确定");

                    return false;
                }

                // 1. 检查 Node.js 环境
                var hasNode = await Utils.NodeDetector.IsNodeInstalledAsync();
                if (!hasNode)
                {
                    Debug.LogError("[CcFastApi] 未检测到 Node.js，请先安装");

                    if (EditorUtility.DisplayDialog("缺少 Node.js",
                        "未检测到 Node.js 环境。\n\n请从 https://nodejs.org/ 下载安装（v16 或更高版本）。",
                        "打开下载页面", "取消"))
                    {
                        Application.OpenURL("https://nodejs.org/");
                    }

                    return false;
                }

                // 2. 检查依赖是否已安装
                if (!Installer.DependencyInstaller.AreDependenciesInstalled())
                {
                    Debug.Log("[CcFastApi] 首次运行，需要安装依赖...");

                    if (EditorUtility.DisplayDialog("安装依赖",
                        "cc-fastapi 需要安装 Node.js 依赖包。\n\n这可能需要几分钟时间，是否继续？",
                        "安装", "取消"))
                    {
                        var result = await Installer.DependencyInstaller.InstallDependenciesAsync();
                        if (!result.Success)
                        {
                            Debug.LogError($"[CcFastApi] 依赖安装失败: {result.ErrorMessage}");

                            EditorUtility.DisplayDialog("安装失败",
                                $"依赖安装失败：\n{result.ErrorMessage}\n\n请检查网络连接或手动安装。",
                                "确定");

                            return false;
                        }
                    }
                    else
                    {
                        return false;
                    }
                }

                // 3. 验证服务器入口文件
                var serverEntry = Utils.PackagePathResolver.GetServerEntryPath();
                if (string.IsNullOrEmpty(serverEntry) || !System.IO.File.Exists(serverEntry))
                {
                    Debug.LogError($"[CcFastApi] 未找到服务器入口文件: {serverEntry}");

                    EditorUtility.DisplayDialog("文件缺失",
                        "未找到编译后的服务器文件。\n\n请确保已运行 npm run build 编译项目。",
                        "确定");

                    return false;
                }

                // 4. 准备启动参数
                var projectPath = Utils.PackagePathResolver.GetNodeProjectPath();
                var environmentVariables = _config.GetEnvironmentVariables();

                // 5. 创建进程启动信息
                var startInfo = new ProcessStartInfo
                {
                    FileName = "node",
                    Arguments = "dist/server.js",
                    WorkingDirectory = projectPath,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                // 设置环境变量
                foreach (var kvp in environmentVariables)
                {
                    startInfo.Environment[kvp.Key] = kvp.Value;
                }

                // 6. 启动进程
                _serverProcess = new Process { StartInfo = startInfo };

                // 附加输出事件
                _serverProcess.OutputDataReceived += OnOutputDataReceived;
                _serverProcess.ErrorDataReceived += OnErrorDataReceived;
                _serverProcess.Exited += OnProcessExited;

                _serverProcess.Start();
                _serverProcess.BeginOutputReadLine();
                _serverProcess.BeginErrorReadLine();

                _serverStartTime = DateTime.Now;

                // 7. 等待启动确认
                await Task.Delay(2000);

                if (_serverProcess.HasExited)
                {
                    Debug.LogError("[CcFastApi] 服务器启动失败，进程已退出");

                    EditorUtility.DisplayDialog("启动失败",
                        "服务器启动失败，进程意外退出。\n\n请检查 Console 日志查看详细信息。",
                        "确定");

                    _serverProcess = null;
                    return false;
                }

                // 8. 保存会话
                SaveSession();

                // 标记为本地服务器
                _isConnectedToExternalServer = false;

                Debug.Log($"[CcFastApi] 服务器启动成功 - {_config.GetServerUrl()}");
                Debug.Log($"[CcFastApi] API 文档: {_config.GetDocsUrl()}");

                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CcFastApi] 启动服务器时出错: {ex.Message}");
                return false;
            }
            finally
            {
                _startupSemaphore.Release();
            }
        }

        /// <summary>
        /// 停止服务器
        /// </summary>
        public static async Task<bool> StopServerAsync()
        {
            await _startupSemaphore.WaitAsync();
            try
            {
                // 如果连接到外部服务器，只需断开连接
                if (_isConnectedToExternalServer)
                {
                    Debug.Log("[CcFastApi] 断开与外部服务器的连接");
                    _isConnectedToExternalServer = false;
                    _serverStartTime = DateTime.MinValue;
                    ClearSession();
                    return true;
                }

                if (_serverProcess == null || _serverProcess.HasExited)
                {
                    Debug.Log("[CcFastApi] 服务器未运行");
                    return true;
                }

                Debug.Log("[CcFastApi] 正在停止服务器...");

                // 1. 尝试优雅关闭
                _serverProcess.CloseMainWindow();

                // 2. 等待进程退出
                var exited = await Task.Run(() => _serverProcess.WaitForExit(5000));

                if (!exited)
                {
                    // 3. 强制终止
                    Debug.LogWarning("[CcFastApi] 优雅关闭超时，强制终止进程");

                    try
                    {
                        _serverProcess.Kill();
                        await Task.Run(() => _serverProcess.WaitForExit(3000));
                    }
                    catch (Exception ex)
                    {
                        Debug.LogWarning($"[CcFastApi] 终止进程失败: {ex.Message}");
                    }
                }

                _serverProcess = null;
                ClearSession();

                Debug.Log("[CcFastApi] 服务器已停止");

                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[CcFastApi] 停止服务器时出错: {ex.Message}");
                return false;
            }
            finally
            {
                _startupSemaphore.Release();
            }
        }

        /// <summary>
        /// 重启服务器
        /// </summary>
        public static async Task<bool> RestartServerAsync()
        {
            Debug.Log("[CcFastApi] 正在重启服务器...");

            await StopServerAsync();
            await Task.Delay(1000);

            return await StartServerAsync();
        }

        /// <summary>
        /// 获取服务器状态
        /// </summary>
        public static ServerStatus GetStatus()
        {
            // 检查是否连接到外部服务器或本地服务器正在运行
            var isRunning = _isConnectedToExternalServer || (_serverProcess != null && !_serverProcess.HasExited);

            var status = new ServerStatus
            {
                IsRunning = isRunning,
                Host = _config.Host,
                Port = _config.Port,
                IsExternalServer = _isConnectedToExternalServer
            };

            if (status.IsRunning)
            {
                status.StartTime = _serverStartTime;
                if (_serverProcess != null)
                {
                    status.ProcessId = _serverProcess.Id.ToString();
                }
                else if (_isConnectedToExternalServer)
                {
                    status.ProcessId = "外部服务器";
                }
                status.ActiveConnections = 1; // TODO: 从 API 获取实际连接数
            }

            return status;
        }

        /// <summary>
        /// 获取当前配置
        /// </summary>
        public static CcFastApiConfig GetConfig()
        {
            return _config;
        }

        /// <summary>
        /// 更新配置
        /// </summary>
        public static void UpdateConfig(CcFastApiConfig config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            SaveConfig();
        }

        /// <summary>
        /// 加载配置
        /// </summary>
        private static void LoadConfig()
        {
            _config = CcFastApiConfig.LoadConfig();

            if (!_config.ValidateConfig())
            {
                Debug.LogWarning("[CcFastApi] 配置验证失败，使用默认配置");
                _config.ResetToDefault();
            }
        }

        /// <summary>
        /// 保存配置
        /// </summary>
        private static void SaveConfig()
        {
            _config?.SaveConfig();
        }

        /// <summary>
        /// 注册 Unity 编辑器事件
        /// </summary>
        private static void RegisterEditorEvents()
        {
            EditorApplication.quitting += OnEditorQuitting;
            CompilationPipeline.assemblyCompilationFinished += OnAssemblyCompilationFinished;
        }

        /// <summary>
        /// 程序集编译完成事件处理 - 自动恢复服务器状态
        /// </summary>
        private static void OnAssemblyCompilationFinished(string assemblyPath, CompilerMessage[] messages)
        {
            // 如果未启用自动恢复，直接返回
            if (!_config.AutoRestoreOnRecompile)
            {
                return;
            }

            // 防抖：如果在 2 秒内已经检查过，跳过
            var now = DateTime.Now;
            if ((now - _lastCompilationCheckTime).TotalSeconds < 2)
            {
                return;
            }
            _lastCompilationCheckTime = now;

            // 延迟执行，确保所有程序集编译完成
            EditorApplication.delayCall += async () =>
            {
                try
                {
                    // 等待一段时间，确保编译完全完成
                    await Task.Delay(1000);

                    // 检查服务器是否已经在运行（本地或外部）
                    var status = GetStatus();
                    if (status.IsRunning)
                    {
                        // 已经在运行，只需要刷新状态
                        Debug.Log("[CcFastApi] 编译完成，服务器已在运行");
                        return;
                    }

                    // 检查端口是否被 cc-fastapi 占用
                    var portStatus = await Utils.PortDetector.GetPortStatusAsync(_config.Host, _config.Port);
                    if (portStatus == Utils.PortStatus.InUseByCcFastApi)
                    {
                        // 外部 cc-fastapi 服务器在运行，连接到它
                        Debug.Log("[CcFastApi] 编译完成，检测到外部 cc-fastapi 服务器");
                        _isConnectedToExternalServer = true;
                        _serverStartTime = DateTime.Now;
                        SaveSession();
                    }
                    else if (portStatus == Utils.PortStatus.Available)
                    {
                        // 端口可用，检查是否需要自动启动
                        if (EditorPrefs.GetBool("KiffCcFastApi_Running", false))
                        {
                            Debug.Log("[CcFastApi] 编译完成，自动恢复服务器");
                            await StartServerAsync();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[CcFastApi] 编译后恢复服务器失败: {ex.Message}");
                }
            };
        }

        /// <summary>
        /// Unity 编辑器退出事件处理
        /// </summary>
        private static void OnEditorQuitting()
        {
            Debug.Log("[CcFastApi] Unity 编辑器退出，停止服务器");

            // 同步停止服务器
            if (_serverProcess != null && !_serverProcess.HasExited)
            {
                try
                {
                    _serverProcess.Kill();
                    _serverProcess.WaitForExit(1000);
                }
                catch
                {
                    // 忽略
                }
            }

            ClearSession();
        }

        
        /// <summary>
        /// 清理孤儿进程
        /// </summary>
        private static void CleanupOrphanedProcess()
        {
            // 检查是否有上次的残留进程
            var wasRunning = EditorPrefs.GetBool("KiffCcFastApi_Running", false);
            if (wasRunning)
            {
                Debug.Log("[CcFastApi] 检测到上次会议重启");
                // ClearSession();
                _ = StartServerAsync();
            }
        }

        /// <summary>
        /// 保存会话信息
        /// </summary>
        private static void SaveSession()
        {
            try
            {
                EditorPrefs.SetBool("KiffCcFastApi_Running", true);
                EditorPrefs.SetInt("KiffCcFastApi_Port", _config.Port);
                EditorPrefs.SetString("KiffCcFastApi_Host", _config.Host);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 保存会话失败: {ex.Message}");
            }
        }
        
        /// <summary>
        /// 清除会话信息
        /// </summary>
        private static void ClearSession()
        {
            try
            {
                EditorPrefs.DeleteKey("KiffCcFastApi_Running");
                EditorPrefs.DeleteKey("KiffCcFastApi_Port");
                EditorPrefs.DeleteKey("KiffCcFastApi_Host");
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 清除会话失败: {ex.Message}");
            }
        }

        /// <summary>
        /// 进程输出数据接收事件
        /// </summary>
        private static void OnOutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (!string.IsNullOrEmpty(e.Data))
            {
                if (_config.EnableLogging && _config.LogLevel == 0)
                {
                    Debug.Log($"[CcFastApi] {e.Data}");
                }
            }
        }

        /// <summary>
        /// 进程错误数据接收事件
        /// </summary>
        private static void OnErrorDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (!string.IsNullOrEmpty(e.Data))
            {
                if (_config.EnableLogging && _config.LogLevel <= 1)
                {
                    Debug.LogWarning($"[CcFastApi] {e.Data}");
                }
            }
        }

        /// <summary>
        /// 进程退出事件
        /// </summary>
        private static void OnProcessExited(object sender, EventArgs e)
        {
            Debug.Log("[CcFastApi] 进程已退出");

            if (_serverProcess != null)
            {
                _serverProcess.OutputDataReceived -= OnOutputDataReceived;
                _serverProcess.ErrorDataReceived -= OnErrorDataReceived;
                _serverProcess.Exited -= OnProcessExited;
            }

            _serverProcess = null;
            ClearSession();
        }

        /// <summary>
        /// 打开 API 文档
        /// </summary>
        public static void OpenApiDocs()
        {
            var status = GetStatus();
            if (status.IsRunning)
            {
                Application.OpenURL(_config.GetDocsUrl());
            }
            else
            {
                Debug.LogWarning("[CcFastApi] 服务器未运行，无法打开文档");
            }
        }

        /// <summary>
        /// 打开测试页面
        /// </summary>
        public static void OpenTestPage()
        {
            var status = GetStatus();
            if (status.IsRunning)
            {
                Application.OpenURL($"{_config.GetServerUrl()}/public/test-debug.html");
            }
            else
            {
                Debug.LogWarning("[CcFastApi] 服务器未运行，无法打开测试页面");
            }
        }
    }
}

#endif
