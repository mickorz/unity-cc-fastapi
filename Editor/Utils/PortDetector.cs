#if UNITY_EDITOR

using System;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace Kiff.CcFastApi.Editor.Utils
{
    /// <summary>
    /// 端口检测工具类
    ///
    /// 功能：
    /// - 检测端口是否被占用
    /// - 判断占用端口的进程是否为 cc-fastapi 服务器
    /// </summary>
    public static class PortDetector
    {
        /// <summary>
        /// 检测端口是否被占用
        ///
        /// 检测流程：
        /// IsPortInUse()
        ///   ├─> 尝试绑定端口
        ///   ├─> 绑定成功 -> 端口未被占用
        ///   └─> 绑定失败 -> 端口已被占用
        /// </summary>
        /// <param name="port">端口号</param>
        /// <returns>端口是否被占用</returns>
        public static bool IsPortInUse(int port)
        {
            try
            {
                var listener = new TcpListener(IPAddress.Loopback, port);
                listener.Start();
                listener.Stop();
                return false;
            }
            catch
            {
                return true;
            }
        }

        /// <summary>
        /// 检测指定端口是否为 cc-fastapi 服务器
        ///
        /// 检测流程：
        /// IsCcFastApiServer()
        ///   ├─> 检查端口是否被占用
        ///   ├─> 未被占用 -> 返回 false
        ///   ├─> 被占用 -> 尝试访问健康检查端点
        ///   └─> 健康检查成功 -> 返回 true
        /// </summary>
        /// <param name="host">主机地址</param>
        /// <param name="port">端口号</param>
        /// <param name="timeoutMs">超时时间（毫秒）</param>
        /// <returns>是否为 cc-fastapi 服务器</returns>
        public static async Task<bool> IsCcFastApiServerAsync(string host, int port, int timeoutMs = 2000)
        {
            try
            {
                using (var client = new WebClient())
                {
                    client.Headers.Add("User-Agent", "Unity-CcFastApi-Checker");
                    var url = $"http://{host}:{port}/health";

                    var task = Task.Run(() => client.DownloadString(url));
                    if (await Task.WhenAny(task, Task.Delay(timeoutMs)) == task)
                    {
                        var response = await task;
                        return response.Contains("\"status\":\"ok\"") || response.Contains("\"status\": \"ok\"");
                    }
                    return false;
                }
            }
            catch (WebException ex) when (ex.Response == null)
            {
                // 连接被拒绝，端口未被占用或服务器未响应
                return false;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// 检测端口状态
        ///
        /// 返回值：
        /// - PortStatus.Available: 端口可用，未被占用
        /// - PortStatus.InUseByOther: 端口被其他程序占用
        /// - PortStatus.InUseByCcFastApi: 端口被 cc-fastapi 服务器占用
        /// </summary>
        /// <param name="host">主机地址</param>
        /// <param name="port">端口号</param>
        /// <returns>端口状态</returns>
        public static async Task<PortStatus> GetPortStatusAsync(string host, int port)
        {
            if (!IsPortInUse(port))
            {
                return PortStatus.Available;
            }

            var isCcFastApi = await IsCcFastApiServerAsync(host, port);
            return isCcFastApi ? PortStatus.InUseByCcFastApi : PortStatus.InUseByOther;
        }

        /// <summary>
        /// 获取占用端口的进程信息
        /// </summary>
        /// <param name="port">端口号</param>
        /// <returns>进程信息，如果获取失败返回 null</returns>
        public static string GetPortProcessInfo(int port)
        {
            try
            {
                var startInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "netstat",
                    Arguments = $"-ano | findstr :{port}",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };

                using (var process = System.Diagnostics.Process.Start(startInfo))
                {
                    var output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit();

                    if (!string.IsNullOrEmpty(output))
                    {
                        var lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var line in lines)
                        {
                            if (line.Contains($":{port}") && line.Contains("LISTENING"))
                            {
                                var parts = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                                if (parts.Length >= 5)
                                {
                                    var pid = parts[parts.Length - 1];
                                    return $"PID: {pid}";
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CcFastApi] 获取端口进程信息失败: {ex.Message}");
            }

            return null;
        }
    }

    /// <summary>
    /// 端口状态枚举
    /// </summary>
    public enum PortStatus
    {
        /// <summary>端口可用</summary>
        Available,
        /// <summary>端口被其他程序占用</summary>
        InUseByOther,
        /// <summary>端口被 cc-fastapi 服务器占用</summary>
        InUseByCcFastApi
    }
}

#endif
