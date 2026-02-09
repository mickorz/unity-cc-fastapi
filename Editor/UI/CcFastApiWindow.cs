#if UNITY_EDITOR

using System;
using UnityEngine;
using UnityEditor;
using UnityEngine.UIElements;

namespace Kiff.CcFastApi.Editor.UI
{
    /// <summary>
    /// cc-fastapi 管理窗口
    ///
    /// 窗口功能流程：
    /// CcFastApiWindow
    ///     ├─> ShowWindow()              打开窗口
    ///     ├─> CreateGUI()               创建 UI
    ///     ├─> OnEnable()                窗口启用
    ///     ├─> OnDisable()               窗口禁用
    ///     └─> Update()                  定期刷新
    ///
    /// UI 结构：
    /// Root
    ///     ├─> Header                    标题栏
    ///     ├─> StatusCard               状态卡片
    ///     ├─> ControlButtons           控制按钮
    ///     ├─> QuickLinks               快捷链接
    ///     └─> ConfigSection            配置区域
    /// </summary>
    public class CcFastApiWindow : EditorWindow
    {
        // UI 元素
        private VisualElement _statusIndicator;
        private Label _statusLabel;
        private Label _portLabel;
        private Label _uptimeLabel;
        private Label _urlLabel;
        private Button _startButton;
        private Button _stopButton;
        private Button _restartButton;
        private Button _docsButton;
        private Button _testButton;
        private Foldout _configFoldout;
        private TextField _hostField;
        private IntegerField _portField;
        private Toggle _autoStartToggle;
        private Toggle _autoRestoreOnRecompileToggle;

        // 状态
        private DateTime _lastUpdateTime = DateTime.MinValue;
        private const double UpdateInterval = 1.0; // 每秒更新一次

        [MenuItem("Tools/cc-fastapi/管理器")]
        public static void ShowWindow()
        {
            var window = GetWindow<CcFastApiWindow>("cc-fastapi 管理器");
            window.minSize = new Vector2(450, 500);
            window.Show();
        }

        private void OnEnable()
        {
            // 每秒刷新一次
            EditorApplication.update += OnEditorUpdate;
        }

        private void OnDisable()
        {
            EditorApplication.update -= OnEditorUpdate;
        }

        private void OnEditorUpdate()
        {
            // 定期刷新 UI
            if ((DateTime.Now - _lastUpdateTime).TotalSeconds >= UpdateInterval)
            {
                RefreshStatus();
                _lastUpdateTime = DateTime.Now;
            }
        }

        public void CreateGUI()
        {
            var root = rootVisualElement;

            // 加载 UXML（如果有的话）
            // var visualTree = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Packages/com.kiff.cc-fastapi/Editor/UI/CcFastApiWindow.uxml");
            // visualTree.CloneTree(root);

            // 手动创建 UI
            CreateUI(root);
        }

        private void CreateUI(VisualElement root)
        {
            // 添加样式
            var styleSheet = AssetDatabase.LoadAssetAtPath<StyleSheet>("Packages/com.kiff.cc-fastapi/Editor/UI/CcFastApiWindow.uss");
            if (styleSheet != null)
            {
                root.styleSheets.Add(styleSheet);
            }

            // 主容器
            var container = new VisualElement
            {
                style =
                {
                    flexGrow = 1,
                    paddingTop = 10,
                    paddingBottom = 10,
                    paddingLeft = 10,
                    paddingRight = 10
                }
            };
            root.Add(container);

            // ========== 标题 ==========
            var header = CreateHeader();
            container.Add(header);

            // 状态卡片
            var statusCard = CreateStatusCard();
            container.Add(statusCard);

            // 控制按钮
            var controlButtons = CreateControlButtons();
            container.Add(controlButtons);

            // 快捷链接
            var quickLinks = CreateQuickLinks();
            container.Add(quickLinks);

            // 配置区域
            var configSection = CreateConfigSection();
            container.Add(configSection);
        }

        /// <summary>
        /// 创建标题
        /// </summary>
        private VisualElement CreateHeader()
        {
            var container = new VisualElement
            {
                style =
                {
                    flexDirection = FlexDirection.Row,
                    justifyContent = Justify.Center,
                    alignItems = Align.Center,
                    marginBottom = 15
                }
            };

            var title = new Label("CC FastAPI 服务器管理器")
            {
                style =
                {
                    fontSize = 18,
                    unityFontStyleAndWeight = FontStyle.Bold
                }
            };

            container.Add(title);
            return container;
        }

        /// <summary>
        /// 创建状态卡片
        /// </summary>
        private VisualElement CreateStatusCard()
        {
            var card = new VisualElement
            {
                name = "StatusCard",
                style =
                {
                    flexDirection = FlexDirection.Column,
                    marginBottom = 15,
                    paddingTop = 12,
                    paddingBottom = 12,
                    paddingLeft = 12,
                    paddingRight = 12,
                    backgroundColor = new Color(0.15f, 0.15f, 0.15f),
                    borderTopLeftRadius = 8,
                    borderTopRightRadius = 8,
                    borderBottomLeftRadius = 8,
                    borderBottomRightRadius = 8
                }
            };

            // 状态标题行
            var headerRow = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, alignItems = Align.Center, marginBottom = 10 }
            };

            _statusIndicator = new VisualElement
            {
                style =
                {
                    width = 12,
                    height = 12,
                    borderTopLeftRadius = 6,
                    borderTopRightRadius = 6,
                    borderBottomLeftRadius = 6,
                    borderBottomRightRadius = 6,
                    marginRight = 8
                }
            };

            var statusTitle = new Label("服务器状态")
            {
                style = { fontSize = 13, unityFontStyleAndWeight = FontStyle.Bold }
            };

            headerRow.Add(_statusIndicator);
            headerRow.Add(statusTitle);
            card.Add(headerRow);

            // 状态标签
            _statusLabel = new Label("未运行")
            {
                style = { fontSize = 12, marginBottom = 8 }
            };
            card.Add(_statusLabel);

            // 信息字段
            card.Add(CreateInfoField("地址:", "--"));
            _urlLabel = card.Q<Label>("value-label");

            card.Add(CreateInfoField("端口:", "--"));
            _portLabel = card.Q<Label>("value-label");

            card.Add(CreateInfoField("运行时间:", "未运行"));
            _uptimeLabel = card.Q<Label>("value-label");

            return card;
        }

        /// <summary>
        /// 创建信息字段
        /// </summary>
        private VisualElement CreateInfoField(string label, string defaultValue)
        {
            var row = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 6 }
            };

            var labelElement = new Label(label)
            {
                style = { width = 80, fontSize = 12, color = new Color(0.7f, 0.7f, 0.7f) }
            };

            var valueElement = new Label(defaultValue)
            {
                name = "value-label",
                style = { fontSize = 12, color = new Color(0.9f, 0.9f, 0.9f) }
            };

            row.Add(labelElement);
            row.Add(valueElement);

            return row;
        }

        /// <summary>
        /// 创建控制按钮
        /// </summary>
        private VisualElement CreateControlButtons()
        {
            var container = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 15 }
            };

            _startButton = new Button(OnStartClicked)
            {
                text = "启动服务器",
                style =
                {
                    flexGrow = 1,
                    height = 32,
                    marginRight = 5,
                    fontSize = 13,
                    backgroundColor = new Color(0.2f, 0.7f, 0.3f),
                    unityFontStyleAndWeight = FontStyle.Bold,
                    borderTopLeftRadius = 4,
                    borderTopRightRadius = 4,
                    borderBottomLeftRadius = 4,
                    borderBottomRightRadius = 4
                }
            };

            _stopButton = new Button(OnStopClicked)
            {
                text = "停止服务器",
                style =
                {
                    flexGrow = 1,
                    height = 32,
                    marginLeft = 5,
                    fontSize = 13,
                    backgroundColor = new Color(0.7f, 0.3f, 0.3f),
                    unityFontStyleAndWeight = FontStyle.Bold,
                    borderTopLeftRadius = 4,
                    borderTopRightRadius = 4,
                    borderBottomLeftRadius = 4,
                    borderBottomRightRadius = 4
                }
            };

            _restartButton = new Button(OnRestartClicked)
            {
                text = "重启",
                style =
                {
                    flexGrow = 0.5f,
                    height = 32,
                    marginLeft = 5,
                    fontSize = 13,
                    backgroundColor = new Color(0.3f, 0.5f, 0.7f),
                    unityFontStyleAndWeight = FontStyle.Bold,
                    borderTopLeftRadius = 4,
                    borderTopRightRadius = 4,
                    borderBottomLeftRadius = 4,
                    borderBottomRightRadius = 4
                }
            };

            container.Add(_startButton);
            container.Add(_stopButton);
            container.Add(_restartButton);

            return container;
        }

        /// <summary>
        /// 创建快捷链接
        /// </summary>
        private VisualElement CreateQuickLinks()
        {
            var container = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 15 }
            };

            _docsButton = new Button(Controllers.CcFastApiController.OpenApiDocs)
            {
                text = "API 文档",
                style =
                {
                    flexGrow = 1,
                    height = 28,
                    marginRight = 5,
                    fontSize = 12
                }
            };

            _testButton = new Button(Controllers.CcFastApiController.OpenTestPage)
            {
                text = "测试页面",
                style =
                {
                    flexGrow = 1,
                    height = 28,
                    marginLeft = 5,
                    fontSize = 12
                }
            };

            container.Add(_docsButton);
            container.Add(_testButton);

            return container;
        }

        /// <summary>
        /// 创建配置区域
        /// </summary>
        private VisualElement CreateConfigSection()
        {
            _configFoldout = new Foldout
            {
                text = "服务器配置",
                value = false
            };

            var content = new VisualElement
            {
                style =
                {
                    paddingTop = 10,
                    paddingBottom = 10,
                    paddingLeft = 10,
                    paddingRight = 10,
                    backgroundColor = new Color(0.1f, 0.1f, 0.1f),
                    borderTopLeftRadius = 4,
                    borderTopRightRadius = 4,
                    borderBottomLeftRadius = 4,
                    borderBottomRightRadius = 4
                }
            };

            // Host 配置
            var hostRow = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 10, alignItems = Align.Center }
            };

            var hostLabel = new Label("监听地址:")
            {
                style = { width = 80, fontSize = 12 }
            };

            _hostField = new TextField
            {
                value = Controllers.CcFastApiController.GetConfig().Host,
                style = { flexGrow = 1 }
            };

            hostRow.Add(hostLabel);
            hostRow.Add(_hostField);
            content.Add(hostRow);

            // Port 配置
            var portRow = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 10, alignItems = Align.Center }
            };

            var portLabel = new Label("监听端口:")
            {
                style = { width = 80, fontSize = 12 }
            };

            _portField = new IntegerField
            {
                value = Controllers.CcFastApiController.GetConfig().Port,
                style = { flexGrow = 1 }
            };

            portRow.Add(portLabel);
            portRow.Add(_portField);
            content.Add(portRow);

            // 自动启动配置
            var autoStartRow = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 10, alignItems = Align.Center }
            };

            var autoStartLabel = new Label("启动时自动:")
            {
                style = { width = 80, fontSize = 12 }
            };

            _autoStartToggle = new Toggle
            {
                value = Controllers.CcFastApiController.GetConfig().AutoStart
            };

            autoStartRow.Add(autoStartLabel);
            autoStartRow.Add(_autoStartToggle);
            content.Add(autoStartRow);

            // 编译后自动恢复配置
            var autoRestoreRow = new VisualElement
            {
                style = { flexDirection = FlexDirection.Row, marginBottom = 10, alignItems = Align.Center }
            };

            var autoRestoreLabel = new Label("编译后自动恢复:")
            {
                style = { width = 80, fontSize = 12 }
            };

            _autoRestoreOnRecompileToggle = new Toggle
            {
                value = Controllers.CcFastApiController.GetConfig().AutoRestoreOnRecompile,
                tooltip = "Unity 重新编译后，自动恢复服务器状态\n\n勾选后，当 Unity 编译完成时：\n- 如果服务器之前在运行，会自动启动\n- 如果检测到其他 Unity 实例的服务器，会自动连接"
            };

            autoRestoreRow.Add(autoRestoreLabel);
            autoRestoreRow.Add(_autoRestoreOnRecompileToggle);
            content.Add(autoRestoreRow);

            // 保存按钮
            var saveButton = new Button(OnSaveConfig)
            {
                text = "保存配置",
                style =
                {
                    height = 28,
                    marginTop = 10,
                    fontSize = 12
                }
            };

            content.Add(saveButton);
            _configFoldout.Add(content);

            return _configFoldout;
        }

        /// <summary>
        /// 刷新状态
        /// </summary>
        private void RefreshStatus()
        {
            var status = Controllers.CcFastApiController.GetStatus();
            var isRunning = status.IsRunning;

            // 更新状态指示器
            if (_statusIndicator != null)
            {
                _statusIndicator.style.backgroundColor = isRunning ? new Color(0.2f, 0.8f, 0.3f) : new Color(0.7f, 0.2f, 0.2f);
            }

            // 更新状态标签
            if (_statusLabel != null)
            {
                _statusLabel.text = isRunning ? "运行中" : "未运行";
            }

            // 更新地址
            if (_urlLabel != null)
            {
                _urlLabel.text = isRunning ? status.Host : "--";
            }

            // 更新端口
            if (_portLabel != null)
            {
                _portLabel.text = isRunning ? status.Port.ToString() : "--";
            }

            // 更新运行时间
            if (_uptimeLabel != null)
            {
                _uptimeLabel.text = isRunning ? status.GetUptime() : "未运行";
            }

            // 更新按钮状态
            if (_startButton != null)
            {
                _startButton.SetEnabled(!isRunning);
            }

            if (_stopButton != null)
            {
                _stopButton.SetEnabled(isRunning);
            }

            if (_restartButton != null)
            {
                _restartButton.SetEnabled(isRunning);
            }

            // 更新快捷链接按钮
            if (_docsButton != null)
            {
                _docsButton.SetEnabled(isRunning);
            }

            if (_testButton != null)
            {
                _testButton.SetEnabled(isRunning);
            }
        }

        /// <summary>
        /// 启动按钮点击
        /// </summary>
        private async void OnStartClicked()
        {
            _startButton.SetEnabled(false);

            Debug.Log("[CcFastApi] 正在启动服务器...");
            var success = await Controllers.CcFastApiController.StartServerAsync();

            if (success)
            {
                Debug.Log("[CcFastApi] 服务器启动成功");
            }
            else
            {
                Debug.LogWarning("[CcFastApi] 服务器启动失败");
            }

            RefreshStatus();
        }

        /// <summary>
        /// 停止按钮点击
        /// </summary>
        private async void OnStopClicked()
        {
            _stopButton.SetEnabled(false);

            Debug.Log("[CcFastApi] 正在停止服务器...");
            var success = await Controllers.CcFastApiController.StopServerAsync();

            if (success)
            {
                Debug.Log("[CcFastApi] 服务器停止成功");
            }
            else
            {
                Debug.LogWarning("[CcFastApi] 服务器停止失败");
            }

            RefreshStatus();
        }

        /// <summary>
        /// 重启按钮点击
        /// </summary>
        private async void OnRestartClicked()
        {
            _restartButton.SetEnabled(false);

            Debug.Log("[CcFastApi] 正在重启服务器...");
            var success = await Controllers.CcFastApiController.RestartServerAsync();

            if (success)
            {
                Debug.Log("[CcFastApi] 服务器重启成功");
            }
            else
            {
                Debug.LogWarning("[CcFastApi] 服务器重启失败");
            }

            RefreshStatus();
        }

        /// <summary>
        /// 保存配置
        /// </summary>
        private void OnSaveConfig()
        {
            var config = Controllers.CcFastApiController.GetConfig();

            config.Host = _hostField.value;
            config.Port = (int)_portField.value;
            config.AutoStart = _autoStartToggle.value;
            config.AutoRestoreOnRecompile = _autoRestoreOnRecompileToggle.value;

            Controllers.CcFastApiController.UpdateConfig(config);

            Debug.Log("[CcFastApi] 配置已保存");

            // 如果服务器正在运行，提示需要重启
            if (Controllers.CcFastApiController.GetStatus().IsRunning)
            {
                EditorUtility.DisplayDialog("配置已保存",
                    "配置已保存，需要重启服务器才能生效。",
                    "确定");
            }
        }
    }
}

#endif
