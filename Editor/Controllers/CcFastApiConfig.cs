#if UNITY_EDITOR

using System;
using UnityEngine;
using UnityEditor;

namespace Kiff.CcFastApi.Editor.Controllers
{
    /// <summary>
    /// cc-fastapi 服务器配置
    ///
    /// 配置管理流程：
    /// CcFastApiConfig
    ///     ├─> LoadConfig()              从 EditorPrefs 加载配置
    ///     ├─> SaveConfig()              保存配置到 EditorPrefs
    ///     ├─> GetDefaultConfig()        获取默认配置
    ///     └─> ValidateConfig()          验证配置有效性
    /// </summary>
    [Serializable]
    public class CcFastApiConfig
    {
        // ========== 服务器配置 ==========
        [SerializeField] private string _host = "localhost";
        [SerializeField] private int _port = 3000;
        [SerializeField] private string _workingDirectory = "";

        // ========== 启动配置 ==========
        [SerializeField] private bool _autoStart = false;
        [SerializeField] private string _startMode = "production"; // "development" or "production"
        [SerializeField] private bool _enableHotReload = false;
        [SerializeField] private bool _autoRestoreOnRecompile = true; // 编译后自动恢复服务器状态

        // ========== 日志配置 ==========
        [SerializeField] private bool _enableLogging = true;
        [SerializeField] private int _logLevel = 0; // 0=All, 1=Warnings, 2=Errors

        // ========== 安全配置 ==========
        [SerializeField] private bool _enableCors = true;
        [SerializeField] private string _corsOrigin = "*";

        // ========== 性能配置 ==========
        [SerializeField] private int _maxConcurrentRequests = 3;
        [SerializeField] private int _requestTimeoutMs = 120000;

        // ========== API 配置 ==========
        [SerializeField] private string _anthropicApiKey = "";

        /// <summary>
        /// 服务器监听地址
        /// </summary>
        public string Host
        {
            get => _host;
            set => _host = value ?? "localhost";
        }

        /// <summary>
        /// 服务器监听端口
        /// </summary>
        public int Port
        {
            get => _port;
            set => _port = Math.Clamp(value, 1024, 65535);
        }

        /// <summary>
        /// 工作目录路径
        /// </summary>
        public string WorkingDirectory
        {
            get => _workingDirectory;
            set => _workingDirectory = value ?? "";
        }

        /// <summary>
        /// 是否自动启动
        /// </summary>
        public bool AutoStart
        {
            get => _autoStart;
            set => _autoStart = value;
        }

        /// <summary>
        /// 启动模式
        /// </summary>
        public string StartMode
        {
            get => _startMode;
            set => _startMode = (value == "development") ? "development" : "production";
        }

        /// <summary>
        /// 是否启用热重载
        /// </summary>
        public bool EnableHotReload
        {
            get => _enableHotReload;
            set => _enableHotReload = value;
        }

        /// <summary>
        /// 编译后自动恢复服务器状态
        /// </summary>
        public bool AutoRestoreOnRecompile
        {
            get => _autoRestoreOnRecompile;
            set => _autoRestoreOnRecompile = value;
        }

        /// <summary>
        /// 是否启用日志
        /// </summary>
        public bool EnableLogging
        {
            get => _enableLogging;
            set => _enableLogging = value;
        }

        /// <summary>
        /// 日志级别
        /// </summary>
        public int LogLevel
        {
            get => _logLevel;
            set => _logLevel = Math.Clamp(value, 0, 2);
        }

        /// <summary>
        /// 是否启用 CORS
        /// </summary>
        public bool EnableCors
        {
            get => _enableCors;
            set => _enableCors = value;
        }

        /// <summary>
        /// CORS 允许的来源
        /// </summary>
        public string CorsOrigin
        {
            get => _corsOrigin;
            set => _corsOrigin = value ?? "*";
        }

        /// <summary>
        /// 最大并发请求数
        /// </summary>
        public int MaxConcurrentRequests
        {
            get => _maxConcurrentRequests;
            set => _maxConcurrentRequests = Math.Clamp(value, 1, 10);
        }

        /// <summary>
        /// 请求超时时间（毫秒）
        /// </summary>
        public int RequestTimeoutMs
        {
            get => _requestTimeoutMs;
            set => _requestTimeoutMs = Math.Clamp(value, 30000, 600000);
        }

        /// <summary>
        /// Anthropic API 密钥
        /// </summary>
        public string AnthropicApiKey
        {
            get => _anthropicApiKey;
            set => _anthropicApiKey = value ?? "";
        }

        // ========== EditorPrefs 键名 ==========
        private const string PrefKey_Host = "KiffCcFastApi_Host";
        private const string PrefKey_Port = "KiffCcFastApi_Port";
        private const string PrefKey_WorkingDirectory = "KiffCcFastApi_WorkingDirectory";
        private const string PrefKey_AutoStart = "KiffCcFastApi_AutoStart";
        private const string PrefKey_StartMode = "KiffCcFastApi_StartMode";
        private const string PrefKey_EnableHotReload = "KiffCcFastApi_EnableHotReload";
        private const string PrefKey_AutoRestoreOnRecompile = "KiffCcFastApi_AutoRestoreOnRecompile";
        private const string PrefKey_EnableLogging = "KiffCcFastApi_EnableLogging";
        private const string PrefKey_LogLevel = "KiffCcFastApi_LogLevel";
        private const string PrefKey_EnableCors = "KiffCcFastApi_EnableCors";
        private const string PrefKey_CorsOrigin = "KiffCcFastApi_CorsOrigin";
        private const string PrefKey_MaxConcurrent = "KiffCcFastApi_MaxConcurrent";
        private const string PrefKey_RequestTimeout = "KiffCcFastApi_RequestTimeout";

        /// <summary>
        /// 加载配置
        /// </summary>
        public static CcFastApiConfig LoadConfig()
        {
            var config = new CcFastApiConfig();

            config._host = EditorPrefs.GetString(PrefKey_Host, config._host);
            config._port = EditorPrefs.GetInt(PrefKey_Port, config._port);
            config._workingDirectory = EditorPrefs.GetString(PrefKey_WorkingDirectory, config._workingDirectory);
            config._autoStart = EditorPrefs.GetBool(PrefKey_AutoStart, config._autoStart);
            config._startMode = EditorPrefs.GetString(PrefKey_StartMode, config._startMode);
            config._enableHotReload = EditorPrefs.GetBool(PrefKey_EnableHotReload, config._enableHotReload);
            config._autoRestoreOnRecompile = EditorPrefs.GetBool(PrefKey_AutoRestoreOnRecompile, config._autoRestoreOnRecompile);
            config._enableLogging = EditorPrefs.GetBool(PrefKey_EnableLogging, config._enableLogging);
            config._logLevel = EditorPrefs.GetInt(PrefKey_LogLevel, config._logLevel);
            config._enableCors = EditorPrefs.GetBool(PrefKey_EnableCors, config._enableCors);
            config._corsOrigin = EditorPrefs.GetString(PrefKey_CorsOrigin, config._corsOrigin);
            config._maxConcurrentRequests = EditorPrefs.GetInt(PrefKey_MaxConcurrent, config._maxConcurrentRequests);
            config._requestTimeoutMs = EditorPrefs.GetInt(PrefKey_RequestTimeout, config._requestTimeoutMs);

            return config;
        }

        /// <summary>
        /// 保存配置
        /// </summary>
        public void SaveConfig()
        {
            EditorPrefs.SetString(PrefKey_Host, _host);
            EditorPrefs.SetInt(PrefKey_Port, _port);
            EditorPrefs.SetString(PrefKey_WorkingDirectory, _workingDirectory);
            EditorPrefs.SetBool(PrefKey_AutoStart, _autoStart);
            EditorPrefs.SetString(PrefKey_StartMode, _startMode);
            EditorPrefs.SetBool(PrefKey_EnableHotReload, _enableHotReload);
            EditorPrefs.SetBool(PrefKey_AutoRestoreOnRecompile, _autoRestoreOnRecompile);
            EditorPrefs.SetBool(PrefKey_EnableLogging, _enableLogging);
            EditorPrefs.SetInt(PrefKey_LogLevel, _logLevel);
            EditorPrefs.SetBool(PrefKey_EnableCors, _enableCors);
            EditorPrefs.SetString(PrefKey_CorsOrigin, _corsOrigin);
            EditorPrefs.SetInt(PrefKey_MaxConcurrent, _maxConcurrentRequests);
            EditorPrefs.SetInt(PrefKey_RequestTimeout, _requestTimeoutMs);
        }

        /// <summary>
        /// 获取默认配置
        /// </summary>
        public static CcFastApiConfig GetDefaultConfig()
        {
            return new CcFastApiConfig
            {
                _host = "localhost",
                _port = 3000,
                _workingDirectory = "",
                _autoStart = false,
                _startMode = "production",
                _enableHotReload = false,
                _enableLogging = true,
                _logLevel = 0,
                _enableCors = true,
                _corsOrigin = "*",
                _maxConcurrentRequests = 3,
                _requestTimeoutMs = 120000
            };
        }

        /// <summary>
        /// 验证配置有效性
        /// </summary>
        public bool ValidateConfig()
        {
            var isValid = true;

            // 验证端口范围
            if (_port < 1024 || _port > 65535)
            {
                Debug.LogWarning($"[CcFastApi] 端口号超出范围: {_port}");
                isValid = false;
            }

            // 验证启动模式
            if (_startMode != "development" && _startMode != "production")
            {
                Debug.LogWarning($"[CcFastApi] 无效的启动模式: {_startMode}");
                isValid = false;
            }

            // 验证并发限制
            if (_maxConcurrentRequests < 1 || _maxConcurrentRequests > 10)
            {
                Debug.LogWarning($"[CcFastApi] 并发限制超出范围: {_maxConcurrentRequests}");
                isValid = false;
            }

            // 验证超时时间
            if (_requestTimeoutMs < 30000 || _requestTimeoutMs > 600000)
            {
                Debug.LogWarning($"[CcFastApi] 超时时间超出范围: {_requestTimeoutMs}ms");
                isValid = false;
            }

            return isValid;
        }

        /// <summary>
        /// 克隆配置
        /// </summary>
        public CcFastApiConfig Clone()
        {
            return new CcFastApiConfig
            {
                _host = this._host,
                _port = this._port,
                _workingDirectory = this._workingDirectory,
                _autoStart = this._autoStart,
                _startMode = this._startMode,
                _enableHotReload = this._enableHotReload,
                _enableLogging = this._enableLogging,
                _logLevel = this._logLevel,
                _enableCors = this._enableCors,
                _corsOrigin = this._corsOrigin,
                _maxConcurrentRequests = this._maxConcurrentRequests,
                _requestTimeoutMs = this._requestTimeoutMs,
                _anthropicApiKey = this._anthropicApiKey
            };
        }

        /// <summary>
        /// 重置为默认配置
        /// </summary>
        public void ResetToDefault()
        {
            var defaultConfig = GetDefaultConfig();
            _host = defaultConfig._host;
            _port = defaultConfig._port;
            _workingDirectory = defaultConfig._workingDirectory;
            _autoStart = defaultConfig._autoStart;
            _startMode = defaultConfig._startMode;
            _enableHotReload = defaultConfig._enableHotReload;
            _enableLogging = defaultConfig._enableLogging;
            _logLevel = defaultConfig._logLevel;
            _enableCors = defaultConfig._enableCors;
            _corsOrigin = defaultConfig._corsOrigin;
            _maxConcurrentRequests = defaultConfig._maxConcurrentRequests;
            _requestTimeoutMs = defaultConfig._requestTimeoutMs;
        }

        /// <summary>
        /// 获取环境变量字典
        /// </summary>
        public System.Collections.Generic.Dictionary<string, string> GetEnvironmentVariables()
        {
            var env = new System.Collections.Generic.Dictionary<string, string>
            {
                ["PORT"] = _port.ToString(),
                ["HOST"] = _host,
                ["NODE_ENV"] = _startMode
            };

            if (!string.IsNullOrEmpty(_workingDirectory))
            {
                env["WORKING_DIR"] = _workingDirectory;
            }

            if (_enableCors)
            {
                env["CORS_ORIGIN"] = _corsOrigin;
            }

            env["MAX_CONCURRENT"] = _maxConcurrentRequests.ToString();

            return env;
        }

        /// <summary>
        /// 获取服务器地址
        /// </summary>
        public string GetServerUrl()
        {
            return $"http://{_host}:{_port}";
        }

        /// <summary>
        /// 获取 API 文档地址
        /// </summary>
        public string GetDocsUrl()
        {
            return $"http://{_host}:{_port}/docs";
        }
    }

    /// <summary>
    /// 服务器状态
    /// </summary>
    [Serializable]
    public class ServerStatus
    {
        public bool IsRunning { get; set; }
        public string Host { get; set; } = "localhost";
        public int Port { get; set; }
        public int ActiveConnections { get; set; }
        public DateTime StartTime { get; set; }
        public string ProcessId { get; set; }
        public bool IsExternalServer { get; set; } = false;

        /// <summary>
        /// 获取运行时间
        /// </summary>
        public string GetUptime()
        {
            if (!IsRunning)
            {
                return "未运行";
            }

            var uptime = DateTime.Now - StartTime;
            if (uptime.TotalHours >= 1)
                return $"{(int)uptime.TotalHours}h {uptime.Minutes}m {uptime.Seconds}s";
            if (uptime.TotalMinutes >= 1)
                return $"{uptime.Minutes}m {uptime.Seconds}s";
            return $"{uptime.Seconds}s";
        }
    }
}

#endif
