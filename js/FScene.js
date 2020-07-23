var LQ;
(function (LQ) {
    /**
     * FScene是fairygui的GComponent自定义封装
     *
     * @class FScene
     */
    class FScene extends fgui.GComponent {
        constructor() {
            super(...arguments);
            this.beforeOpenResources = [];
            this.afterOpenResources = [];
            // sceneType: SceneType = SceneType.FairyGUIScene
            /**
             *
             * 场景类型 Laya场景为1 fgui场景为2
             * @memberof FScene
             */
            this.sceneType = 2;
            /**
             *
             *
             * @type {boolean}
             * @memberof FScene
             */
            this._autoDestroyAtClosed = true;
            /**
             * 是否复用，reuse和autoDestroyAtClosed互斥，如果 autoDestroyAtClosed 为true ，那么 复用没意义
             *
             * @type {boolean}
             * @memberof FScene
             */
            this.reuse = false;
            /**
             *
             * 场景组件的所有子节点映射
             * @type
             * @memberof FScene
             */
            this.children = {};
            /**
             * 控制器集合
             *
             * @type {{ [key: string]: fairygui.Controller }}
             * @memberof FScene
             */
            this.cc = {};
        }
        static get root() {
            if (!FScene._root) {
                throw "请初始化FScene,设置场景根容器，设置方法为：FScene.init(根容器)";
            }
            return FScene._root;
        }
        static set root(value) {
            FScene._root = value;
        }
        static init(root) {
            FScene.root = root;
        }
        afterConstructorCall(params) {
            this.reuse = params.reuse || false;
            if (this.reuse) {
                this._autoDestroyAtClosed = false;
                this.reuseName = params.reuseName;
            }
            this.setSize(Laya.stage.width, Laya.stage.height);
            this.bulidChildMap();
            this.buidControllerMap();
            this.onInit();
        }
        set autoDestroyAtClosed(value) {
            if (this.reuse && value)
                throw "当前场景以及设置为可复用的，不能设置autoDestroyAtClosed=true";
            this._autoDestroyAtClosed = value;
        }
        get autoDestroyAtClosed() {
            return this._autoDestroyAtClosed;
        }
        adjustUI() {
            this.setSize(this.width, this.height);
        }
        onInit() {
            //场景内某个组件命名为close，点击则自动关闭场景
            if (this.getChild("Btn_Close")) {
                this.closeBtn = this.getChild("Btn_Close").asButton;
                this.closeBtn.onClick(this, () => {
                    this.__close(Laya.Dialog.CLOSE);
                });
            }
        }
        onClickChild(childName, thisObj, func, args) {
            this.children[childName].onClick(thisObj, func, args);
            return this;
        }
        __onOpened(param) {
            this.onOpened(param);
            this.afterOpenNeedLoad();
        }
        /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
        onOpened(param) {
            //add fairygui component
            Debug.logDebug(`场景onOpened name：${this.layerName}}`);
        }
        __close(type) {
            this.close(type);
            if (this.reuse) {
                this.removeFromParent();
                //放入对象池回收
                console.assert(this.reuseName != null, "wtf FScene重用标识符为空！");
                Laya.Pool.recover(this.reuseName, this);
                Debug.logDebug("回收场景_" + this.reuseName);
                this.__onClosed(type);
                //reuse 和 autoDestroyAtClosed 互斥 ，如果reuse，那么不应该autoDestroyAtClosed 
                //所以这里直接return
                return;
            }
            if (this.autoDestroyAtClosed) {
                this.dispose();
            }
            else {
                this.removeFromParent();
            }
            this.__onClosed(type);
        }
        close(type) { }
        __onClosed(type) {
            // this.removeFromParent()
            this.onClosed(type);
        }
        onClosed(type) { }
        beforeOpenNeedLoad() {
            if (this.beforeOpenResources && this.beforeOpenResources.length > 0) {
                return new Promise((resovle) => {
                    Laya.loader.load(this.beforeOpenResources, Laya.Handler.create(this, (success) => {
                        return resovle();
                    }));
                });
            }
            else {
                return Promise.resolve();
            }
        }
        afterOpenNeedLoad() { }
        /**
         *
         *
         * @static
         * @param {ISceneCfg} sceneCfg 场景配置
         * @param {boolean} reuse 是否重用
         * @param {string} [reuseName] 重用标识符
         * @param {*} [param] 传递给场景的参数
         * @param {Laya.Handler} [complete] 完成后回调
         * @param {Laya.Handler} [progress] 加载进度
         * @returns {Promise<FScene>}
         * @memberof FScene
         */
        static open(sceneCfg, reuse = false, reuseName, param, complete, progress) {
            if (!sceneCfg.pkgPath || sceneCfg.pkgPath.length == 0 || !sceneCfg.componentName || sceneCfg.componentName.length == 0) {
                throw Error(`err pkgPath=${sceneCfg.pkgPath}, sceneName=${sceneCfg.componentName}`);
            }
            return new Promise((resolve, reject) => {
                let handler = Laya.Handler.create(this, (scene) => {
                    if (scene) {
                        complete.runWith(scene);
                        return resolve(scene);
                    }
                    return reject("fscene加载失败");
                });
                FScene.loadPackage(sceneCfg, Laya.Handler.create(this, this.onLoaded, [sceneCfg, reuse, reuseName, param, handler, progress], true));
            });
        }
        static onLoaded(sceneCfg, reuse, reuseName, param, complete) {
            let scene = null;
            //复用场景
            if (reuse) {
                if (!reuseName)
                    throw "复用标识名不能为空";
                //先从对象池获取
                scene = Laya.Pool.getItem(reuseName);
                if (scene)
                    Debug.logDebug("复用场景_" + reuseName);
            }
            if (!scene) {
                //对象池中找不到该对象 或不复用 则创建一个新的
                scene = fairygui.UIPackage.createObject(sceneCfg.pkgName, sceneCfg.componentName, sceneCfg.classRef);
                if (!scene) {
                    throw "找不到指定组件";
                }
                scene.afterConstructorCall({
                    reuse: reuse,
                    reuseName: reuseName,
                });
            }
            const showScene = () => {
                FScene.root.addChild(scene.displayObject);
                scene.__onOpened(param);
                complete && complete.runWith(scene);
            };
            scene.beforeOpenNeedLoad().then(() => {
                showScene();
            }).catch((err) => {
                showScene();
            });
        }
        static loadPackage(sceneCfg, complete, progress) {
            fgui.UIPackage.loadPackage(sceneCfg.pkgPath, Laya.Handler.create(this, (success) => {
                if (success) {
                    fairygui.UIPackage.addPackage(sceneCfg.pkgPath);
                    if (complete)
                        complete.run();
                }
            }), Laya.Handler.create(this, (pro) => {
                if (progress)
                    progress.runWith(pro);
            }, null, false));
        }
        static close(url, name) {
            Debug.logDebug("close");
            return true;
        }
        static closeAll() { }
        static destroy(url, name) {
            return false;
        }
        bulidChildMap() {
            this._children.forEach((child, index) => {
                this.children[child.name] = child;
            });
        }
        buidControllerMap() {
            this.controllers.forEach((cc) => {
                this.cc[cc.name] = cc;
            });
        }
    }
    LQ.FScene = FScene;
    let LogLevel;
    (function (LogLevel) {
        /** Log level for low severity diagnostic messages. */
        LogLevel[LogLevel["Debug"] = 1] = "Debug";
        /** Log level for informational diagnostic messages. */
        LogLevel[LogLevel["Information"] = 2] = "Information";
        /** Log level for diagnostic messages that indicate a non-fatal problem. */
        LogLevel[LogLevel["Warning"] = 3] = "Warning";
        /** Log level for diagnostic messages that indicate a failure in the current operation. */
        LogLevel[LogLevel["Error"] = 4] = "Error";
    })(LogLevel = LQ.LogLevel || (LQ.LogLevel = {}));
    let Debug;
    (function (Debug) {
        Debug.logLevel = LogLevel.Debug;
        function setLogLevel(lv) {
            Debug.logLevel = lv;
        }
        Debug.setLogLevel = setLogLevel;
        function isDebug() {
            return window.location.href.indexOf("debug") > 0;
        }
        Debug.isDebug = isDebug;
        function isLocalHost() {
            return window.location.href.indexOf("192.168") > 0;
        }
        Debug.isLocalHost = isLocalHost;
        function logInfo(...args) {
            if (Debug.logLevel <= LogLevel.Information) {
                console.log("[info]", ...args);
            }
        }
        Debug.logInfo = logInfo;
        function logDebug(...args) {
            if (Debug.logLevel <= LogLevel.Debug) {
                console.log("[debug]", ...args);
            }
        }
        Debug.logDebug = logDebug;
        function logDebugTime(label) {
            if (Debug.logLevel <= LogLevel.Debug) {
                console.time("[debug] " + label);
            }
        }
        Debug.logDebugTime = logDebugTime;
        function logDebugTimeEnd(label) {
            if (Debug.logLevel <= LogLevel.Debug) {
                console.timeEnd("[debug] " + label);
            }
        }
        Debug.logDebugTimeEnd = logDebugTimeEnd;
    })(Debug = LQ.Debug || (LQ.Debug = {}));
})(LQ || (LQ = {}));
(function (LQ) {
    /**
     * fgui弹窗
     */
    class FWindow extends fairygui.Window {
        constructor(windowName) {
            super();
            this.beforeOpenResources = [];
            this.afterOpenResources = [];
            /**
             *
             * window组件的所有子节点映射
             * @type
             * @memberof FWindow
             */
            this.children = {};
            /**
             * 控制器集合
             *
             * @type {{ [key: string]: fairygui.Controller }}
             * @memberof FWindow
             */
            this.cc = {};
            /**
             *
             * 点击窗体外部是否触发关闭窗体 默认为 true
             * @type {boolean}
             * @memberof FWindow
             */
            this.closeOnClickOutSide = true;
            this.layerName = windowName;
            this.onInit();
        }
        static Init() {
            fairygui.UIConfig.modalLayerColor = "rgba(33,33,33,0.5)";
            // Laya.stage.on(Laya.Event.RESIZE, this , this.onStageResize)
            FWindow.root = new fgui.GRoot();
            FWindow.root.displayObject.zOrder = 999;
            FWindow.root.setSize(Laya.stage.width, Laya.stage.height);
            FWindow.root.displayObject.name = "FWindow弹窗层";
            Laya.stage.addChild(FWindow.root.displayObject);
        }
        onInit() {
            this.className = FWindow.name;
            this.setPivot(0.5, 0.5);
            this.modal = true;
            this._displayObject.name = "FWindow";
        }
        /**
         * data参数会传递给onOpen方法
         *
         * @param {*} [data] 传递给弹窗的参数
         * @memberof FWindow
         */
        popup(data) {
            FWindow.popup(this, data);
            return this;
        }
        __onOpened(param) {
            this.bulidChildMap();
            this.buidControllerMap();
            this.onOpened(param);
            this.afterOpenNeedLoad();
        }
        onOpened(data) { }
        beforeOpenNeedLoad() {
            return Promise.resolve();
        }
        afterOpenNeedLoad() {
        }
        onShown() { }
        onHide() {
            LQ.Debug.logDebug("onHide");
        }
        close(type) {
            this.hide();
            this.onClosed(type);
        }
        onClosed(type) {
        }
        doShowAnimation() {
            Laya.Tween.from(this, {
                scaleX: 0,
                scaleY: 0
            }, 300, Laya.Ease.backOut, Laya.Handler.create(this, this.onShown, [this]), 0, false, false);
        }
        doHideAnimation() {
            Laya.Tween.to(this, {
                scaleX: 0,
                scaleY: 0
            }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, this.hideImmediately, [this]), 0, false, false);
        }
        onClickChild(childName, thisObj, func, args) {
            this.children[childName].onClick(thisObj, func, args);
            return this;
        }
        bulidChildMap() {
            if (this._children[0]) {
                this._children[0].asCom._children.forEach((child) => {
                    this.children[child.name] = child;
                });
            }
        }
        buidControllerMap() {
            this.controllers.forEach((cc) => {
                this.cc[cc.name] = cc;
            });
            this.contentPane.controllers.forEach((cc) => {
                this.cc[cc.name] = cc;
            });
        }
        static popup(win, param, complete) {
            if (win.winDefine) {
                if (win.winDefine.pkgPath && win.winDefine.componentName) {
                    fairygui.UIPackage.loadPackage(win.winDefine.pkgPath, Laya.Handler.create(this, this.onLoaded, [win, param], false));
                }
                else {
                    throw Error("要popup的弹窗的pkgPath和componentName不能为空");
                }
            }
            else {
                throw Error("要popup的弹窗的pkgInfo不能为空");
            }
        }
        static async onLoaded(win, param) {
            win.contentPane = fairygui.UIPackage.createObject(win.winDefine.pkgName, win.winDefine.componentName).asCom;
            const showWin = () => {
                if (win.closeOnClickOutSide)
                    FWindow.root.showPopup(win);
                else
                    FWindow.root.showWindow(win);
                win.center();
                win.addRelation(FWindow.root, fairygui.RelationType.Center_Center);
                win.addRelation(FWindow.root, fairygui.RelationType.Middle_Middle);
                win.__onOpened(param);
            };
            win.beforeOpenNeedLoad().then(() => {
                showWin();
            }).catch(err => {
                showWin();
            });
        }
    }
    LQ.FWindow = FWindow;
})(LQ || (LQ = {}));
//# sourceMappingURL=FScene.js.map