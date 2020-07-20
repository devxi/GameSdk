var LQ;
(function (LQ) {
    /**
     * FScene是fairygui的GComponent自定义封装
     *
     * @class FScene
     */
    class FScene extends Laya.Sprite {
        constructor(component, reuse, reuseName) {
            super();
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
            this.reuse = reuse;
            if (this.reuse)
                this._autoDestroyAtClosed = false;
            this.fComponent = component;
            this.addChild(component.displayObject);
            this.reuseName = reuseName;
            component.setSize(Laya.stage.width, Laya.stage.height);
            this.bulidChildMap();
            this.buidControllerMap();
            this.onInit();
        }
        static init(root) {
            FScene.root = root;
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
            this.fComponent.setSize(this.width, this.height);
        }
        onInit() {
            //场景内某个组件命名为close，点击则自动关闭场景
            if (this.fComponent.getChild("Btn_Close")) {
                this.closeBtn = this.fComponent.getChild("Btn_Close").asButton;
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
                this.removeSelf();
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
                this.destroy();
            }
            else {
                this.removeSelf();
            }
            this.__onClosed(type);
        }
        close(type) { }
        __onClosed(type) {
            // this.fComponent.removeFromParent()
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
                let view = fairygui.UIPackage.createObject(sceneCfg.pkgName, sceneCfg.componentName);
                if (view) {
                    let com = view.asCom;
                    scene = new sceneCfg.classRef(view, com, reuse, reuseName);
                }
                else {
                    throw "找不到指定组件";
                }
            }
            const showScene = () => {
                FScene.root.addChild(scene);
                scene.__onOpened(param);
                complete && complete.runWith(scene);
            };
            scene.beforeOpenNeedLoad().then(() => {
                showScene();
            }).catch(err => showScene());
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
            this.fComponent._children.forEach((child, index) => {
                this.children[child.name] = child;
            });
        }
        buidControllerMap() {
            this.fComponent.controllers.forEach((cc) => {
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
//# sourceMappingURL=FScene.js.map