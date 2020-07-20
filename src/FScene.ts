namespace LQ {
    export interface ISceneResourcesLoad {


        /**
         *场景打开前需要预加载的资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        beforeOpenResources?: Array<any>
    
    
        /**
         * 场景打开后可能需要加载的其他资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        afterOpenResources?: Array<any>
        /**
         *
         * 在场景（弹窗）显示出来之前需要预加载一些资源 在此接口中加载 
         * @memberof ISceneResourcesLoad
         */
        beforeOpenNeedLoad?(): Promise<any>
    
    
        /**
         *
         * 在场景(弹窗)成功显示出来之后需要额外预加载的一些资源 通常是其他场景（弹窗）的的资源，提升其他场景（弹窗）打开速度
         * @memberof ISceneResourcesLoad
         */
        afterOpenNeedLoad?(): void
    }
    
    export interface IComponent {
        closeBtn      : fairygui.GComponent
        pkgPath?      : string
        componentName?: string
        name?         : string
        classRef?     : Function
        onOpened(data?: any, component?: fairygui.GComponent)
        close(type?: string)
        onClosed(type?: string)
    }
    
    export interface IDialog extends IComponent {
        winDefine          : IWinDefine,
        closeOnClickOutSide: boolean
    }
    
    
    export interface IFScene extends IComponent {
        fComponent: fgui.GComponent
    }
    export interface ISceneResourcesLoad {
    
    
        /**
         *场景打开前需要预加载的资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        beforeOpenResources?: Array<any>
    
    
        /**
         * 场景打开后可能需要加载的其他资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        afterOpenResources?: Array<any>
        /**
         *
         * 在场景（弹窗）显示出来之前需要预加载一些资源 在此接口中加载 
         * @memberof ISceneResourcesLoad
         */
        beforeOpenNeedLoad?(): Promise<any>
    
    
        /**
         *
         * 在场景(弹窗)成功显示出来之后需要额外预加载的一些资源 通常是其他场景（弹窗）的的资源，提升其他场景（弹窗）打开速度
         * @memberof ISceneResourcesLoad
         */
        afterOpenNeedLoad?(): void
    }
    
    export interface IComponent {
        closeBtn      : fairygui.GComponent
        pkgPath?      : string
        componentName?: string
        name?         : string
        classRef?     : Function
        onOpened(data?: any, component?: fairygui.GComponent)
        close(type?: string)
        onClosed(type?: string)
    }
    
    export interface IDialog extends IComponent {
        winDefine          : IWinDefine,
        closeOnClickOutSide: boolean
    }
    
    
    export interface IFScene extends IComponent {
        fComponent: fgui.GComponent
    }
    
    
    /**
     * FScene是fairygui的GComponent自定义封装
     *
     * @class FScene
     */
    export class FScene extends Laya.Sprite implements IFScene, ISceneResourcesLoad {
    
    
        /**
         * 场景根容器
         *
         * @static
         * @type {Laya.Sprite}
         * @memberof FScene
         */
        static root: Laya.Sprite;
    
        beforeOpenResources: any[]  = []
        afterOpenResources  : any[] = []
        // sceneType: SceneType = SceneType.FairyGUIScene
    
        /**
         *
         * 场景类型 Laya场景为1 fgui场景为2
         * @memberof FScene
         */
        sceneType = 2;
        layerName: string
    
        //fairygui的场景容器
        fComponent: fairygui.GComponent
    
        closeBtn: fairygui.GComponent
    
        pkgPath: string
    
        componentName: string
    
        /**
         * 
         *
         * @type {boolean}
         * @memberof FScene
         */
        private _autoDestroyAtClosed: boolean = true
    
    
        /**
         * 是否复用，reuse和autoDestroyAtClosed互斥，如果 autoDestroyAtClosed 为true ，那么 复用没意义
         *
         * @type {boolean}
         * @memberof FScene
         */
        reuse: boolean = false
    
        /**
         * 复用标识
         *
         * @type {string}
         * @memberof FScene
         */
        reuseName: string
    
        /**
         *
         * 场景组件的所有子节点映射
         * @type
         * @memberof FScene
         */
        children: { [key: string]: fairygui.GComponent } = {}
    
        /**
         * 控制器集合
         *
         * @type {{ [key: string]: fairygui.Controller }}
         * @memberof FScene
         */
        cc       : { [key: string]: fairygui.Controller } = {}
        name     : string
        classRef?: Function
    
        static init(root: Laya.Sprite) {
            FScene.root = root;
        }
    
    
        constructor(component: fgui.GComponent, reuse: boolean, reuseName: string) {
            super()
               this.reuse                             = reuse
            if (this.reuse) this._autoDestroyAtClosed = false
               this.fComponent                        = component
            this.addChild(component.displayObject)
            this.reuseName = reuseName
            component.setSize(Laya.stage.width, Laya.stage.height)
            this.bulidChildMap()
            this.buidControllerMap()
            this.onInit()
        }
    
        public set autoDestroyAtClosed(value: boolean) {
            if (this.reuse && value) throw "当前场景以及设置为可复用的，不能设置autoDestroyAtClosed=true"
            this._autoDestroyAtClosed = value
        }
    
        public get autoDestroyAtClosed(): boolean {
            return this._autoDestroyAtClosed
        }
    
    
        public adjustUI() {
            this.fComponent.setSize(this.width, this.height)
        }
    
    
        public onInit() {
            //场景内某个组件命名为close，点击则自动关闭场景
            if (this.fComponent.getChild("Btn_Close")) {
                this.closeBtn = this.fComponent.getChild("Btn_Close").asButton
                this.closeBtn.onClick(this, () => {
                    this.__close(Laya.Dialog.CLOSE)
                })
            }
        }
    
    
        public onClickChild(childName: string, thisObj: any, func: Function, args?: any[]): FScene {
            this.children[childName].onClick(thisObj, func, args)
            return this
        }
    
        protected __onOpened(param: any) {
            this.onOpened(param)
            this.afterOpenNeedLoad()
        }
    
        /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
        public onOpened(param: any): void {
            //add fairygui component
            Debug.logDebug(`场景onOpened name：${this.layerName}}`)
        }
    
        protected __close(type?: string) {
            this.close(type)
            if (this.reuse) {
                this.removeSelf()
                //放入对象池回收
                console.assert(this.reuseName != null, "wtf FScene重用标识符为空！")
                Laya.Pool.recover(this.reuseName, this)
                Debug.logDebug("回收场景_" + this.reuseName)
                this.__onClosed(type)
                //reuse 和 autoDestroyAtClosed 互斥 ，如果reuse，那么不应该autoDestroyAtClosed 
                //所以这里直接return
                return
            }
            if (this.autoDestroyAtClosed) {
                this.destroy()
            } else {
                this.removeSelf()
            }
            this.__onClosed(type)
        }
    
        close(type?: string) { }
    
        private __onClosed(type: string): void {
            // this.fComponent.removeFromParent()
            this.onClosed(type);
        }
    
        onClosed(type: string) { }
    
        beforeOpenNeedLoad(): Promise<any> {
            if (this.beforeOpenResources && this.beforeOpenResources.length > 0) {
                return new Promise((resovle) => {
                    Laya.loader.load(this.beforeOpenResources, Laya.Handler.create(this, (success) => {
                        return resovle();
                    }));
                })
            } else {
                return Promise.resolve()
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
        static open(sceneCfg: ISceneCfg, reuse = false, reuseName?: string, param?: any, complete?: Laya.Handler, progress?: Laya.Handler): Promise<FScene> {
            if (!sceneCfg.pkgPath || sceneCfg.pkgPath.length == 0 || !sceneCfg.componentName || sceneCfg.componentName.length == 0) {
                throw Error(`err pkgPath=${sceneCfg.pkgPath}, sceneName=${sceneCfg.componentName}`)
            }
            return new Promise((resolve, reject) => {
                let handler = Laya.Handler.create(this, (scene: FScene) => {
                    if (scene) {
                        complete.runWith(scene);
                        return resolve(scene);
                    }
                    return reject("fscene加载失败");
                });
                FScene.loadPackage(sceneCfg, Laya.Handler.create(this, this.onLoaded, [sceneCfg, reuse, reuseName, param, handler, progress], true))
            });
        }
    
    
        static onLoaded(sceneCfg: ISceneCfg, reuse: boolean, reuseName?: string, param?: any, complete?: Laya.Handler) {
            let scene: FScene = null
            //复用场景
            if (reuse) {
                if (!reuseName) throw "复用标识名不能为空"
                //先从对象池获取
                scene = Laya.Pool.getItem(reuseName) as FScene
                if (scene) Debug.logDebug("复用场景_" + reuseName)
            }
    
            if (!scene) {
                //对象池中找不到该对象 或不复用 则创建一个新的
                let view: fairygui.GObject = fairygui.UIPackage.createObject(sceneCfg.pkgName, sceneCfg.componentName)
                if (view) {
                    let com: fgui.GComponent = view.asCom
                        scene                = new sceneCfg.classRef(view, com, reuse, reuseName) as FScene
                } else {
                    throw "找不到指定组件";
                }
            }
            const showScene = () => {
                FScene.root.addChild(scene)
                scene.__onOpened(param)
                complete && complete.runWith(scene)
            }
    
            scene.beforeOpenNeedLoad().then(() => {
                showScene()
            }).catch(err =>
                showScene()
            )
        }
    
        static loadPackage(sceneCfg: ISceneCfg, complete?: Laya.Handler, progress?: Laya.Handler) {
            fgui.UIPackage.loadPackage(sceneCfg.pkgPath, Laya.Handler.create(this, (success) => {
                if (success) {
                    fairygui.UIPackage.addPackage(sceneCfg.pkgPath)
                    if (complete) complete.run()
                }
            }), Laya.Handler.create(this, (pro: number) => {
                if (progress) progress.runWith(pro)
            }, null, false))
        }
    
    
        static close(url: string, name?: string): boolean {
            Debug.logDebug("close")
            return true
        }
    
        static closeAll(): void { }
    
        static destroy(url: string, name?: string): boolean {
            return false
        }
    
    
        private bulidChildMap(): void {
            this.fComponent._children.forEach((child: fairygui.GComponent, index) => {
                this.children[child.name] = child
            })
        }
    
        private buidControllerMap(): void {
            this.fComponent.controllers.forEach((cc: fairygui.Controller) => {
                this.cc[cc.name] = cc;
            })
        }
    }

    export enum LogLevel {
        /** Log level for low severity diagnostic messages. */
        Debug = 1,
        /** Log level for informational diagnostic messages. */
        Information = 2,
        /** Log level for diagnostic messages that indicate a non-fatal problem. */
        Warning = 3,
        /** Log level for diagnostic messages that indicate a failure in the current operation. */
        Error = 4,
    }

    export namespace Debug {
    

        export let logLevel = LogLevel.Debug;

        export function setLogLevel(lv:LogLevel) {
            logLevel = lv;
        }

        export function isDebug() {
            return window.location.href.indexOf("debug") > 0
        }
    
        export function isLocalHost() {
            return window.location.href.indexOf("192.168") > 0
        }
    
        export function logInfo(...args) {
            if (logLevel <= LogLevel.Information) {
                console.log("[info]", ...args)
            }
        }
    
        export function logDebug(...args) {
            if (logLevel<= LogLevel.Debug) {
                console.log("[debug]", ...args)
            }
        }
    
        export function logDebugTime(label?) {
            if (logLevel<= LogLevel.Debug) {
                console.time("[debug] " + label)
            }
        }
    
        export function logDebugTimeEnd(label?) {
            if (logLevel<= LogLevel.Debug) {
                console.timeEnd("[debug] " + label)
            }
        }

    }
}



