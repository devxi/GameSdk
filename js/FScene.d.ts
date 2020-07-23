declare namespace LQ {
    interface ISceneResourcesLoad {
        /**
         *场景打开前需要预加载的资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        beforeOpenResources?: Array<any>;
        /**
         * 场景打开后可能需要加载的其他资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        afterOpenResources?: Array<any>;
        /**
         *
         * 在场景（弹窗）显示出来之前需要预加载一些资源 在此接口中加载
         * @memberof ISceneResourcesLoad
         */
        beforeOpenNeedLoad?(): Promise<any>;
        /**
         *
         * 在场景(弹窗)成功显示出来之后需要额外预加载的一些资源 通常是其他场景（弹窗）的的资源，提升其他场景（弹窗）打开速度
         * @memberof ISceneResourcesLoad
         */
        afterOpenNeedLoad?(): void;
    }
    interface IComponent {
        closeBtn: fairygui.GComponent;
        pkgPath?: string;
        componentName?: string;
        name?: string;
        classRef?: Function;
        onOpened(data?: any, component?: fairygui.GComponent): any;
        close(type?: string): any;
        onClosed(type?: string): any;
    }
    interface IDialog extends IComponent {
        winDefine: IWinDefine;
        closeOnClickOutSide: boolean;
    }
    interface ISceneResourcesLoad {
        /**
         *场景打开前需要预加载的资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        beforeOpenResources?: Array<any>;
        /**
         * 场景打开后可能需要加载的其他资源列表
         *
         * @type {Array<any>}
         * @memberof ISceneResourcesLoad
         */
        afterOpenResources?: Array<any>;
        /**
         *
         * 在场景（弹窗）显示出来之前需要预加载一些资源 在此接口中加载
         * @memberof ISceneResourcesLoad
         */
        beforeOpenNeedLoad?(): Promise<any>;
        /**
         *
         * 在场景(弹窗)成功显示出来之后需要额外预加载的一些资源 通常是其他场景（弹窗）的的资源，提升其他场景（弹窗）打开速度
         * @memberof ISceneResourcesLoad
         */
        afterOpenNeedLoad?(): void;
    }
    interface IComponent {
        closeBtn: fairygui.GComponent;
        pkgPath?: string;
        componentName?: string;
        name?: string;
        classRef?: Function;
        onOpened(data?: any, component?: fairygui.GComponent): any;
        close(type?: string): any;
        onClosed(type?: string): any;
    }
    interface IDialog extends IComponent {
        winDefine: IWinDefine;
        closeOnClickOutSide: boolean;
    }
    interface IFScene extends IComponent {
        fComponent: fgui.GComponent;
    }
    /**
     * FScene是fairygui的GComponent自定义封装
     *
     * @class FScene
     */
    class FScene extends fgui.GComponent implements ISceneResourcesLoad {
        /**
         * 场景根容器
         *
         * @static
         * @type {Laya.Sprite}
         * @memberof FScene
         */
        private static _root;
        beforeOpenResources: any[];
        afterOpenResources: any[];
        /**
         *
         * 场景类型 Laya场景为1 fgui场景为2
         * @memberof FScene
         */
        sceneType: number;
        layerName: string;
        closeBtn: fairygui.GComponent;
        pkgPath: string;
        componentName: string;
        /**
         *
         *
         * @type {boolean}
         * @memberof FScene
         */
        private _autoDestroyAtClosed;
        /**
         * 是否复用，reuse和autoDestroyAtClosed互斥，如果 autoDestroyAtClosed 为true ，那么 复用没意义
         *
         * @type {boolean}
         * @memberof FScene
         */
        reuse: boolean;
        /**
         * 复用标识
         *
         * @type {string}
         * @memberof FScene
         */
        reuseName: string;
        /**
         *
         * 场景组件的所有子节点映射
         * @type
         * @memberof FScene
         */
        children: {
            [key: string]: fairygui.GComponent;
        };
        /**
         * 控制器集合
         *
         * @type {{ [key: string]: fairygui.Controller }}
         * @memberof FScene
         */
        cc: {
            [key: string]: fairygui.Controller;
        };
        name: string;
        classRef?: Function;
        static get root(): Laya.Sprite;
        static set root(value: Laya.Sprite);
        /**
         *
         * 初始化FScene，使用前务必初始化
         * @static
         * @param {Laya.Sprite} root 场景根容器
         * @memberof FScene
         */
        static init(root: Laya.Sprite): void;
        afterConstructorCall(params?: any): void;
        set autoDestroyAtClosed(value: boolean);
        get autoDestroyAtClosed(): boolean;
        adjustUI(): void;
        onInit(): void;
        onClickChild(childName: string, thisObj: any, func: Function, args?: any[]): FScene;
        protected __onOpened(param: any): void;
        /**场景打开完成后，调用此方法（如果有弹出动画，则在动画完成后执行）*/
        onOpened(param: any): void;
        protected __close(type?: string): void;
        close(type?: string): void;
        private __onClosed;
        onClosed(type: string): void;
        beforeOpenNeedLoad(): Promise<any>;
        afterOpenNeedLoad(): void;
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
        static open(sceneCfg: ISceneCfg, reuse?: boolean, reuseName?: string, param?: any, complete?: Laya.Handler, progress?: Laya.Handler): Promise<FScene>;
        static onLoaded(sceneCfg: ISceneCfg, reuse: boolean, reuseName?: string, param?: any, complete?: Laya.Handler): void;
        static loadPackage(sceneCfg: ISceneCfg, complete?: Laya.Handler, progress?: Laya.Handler): void;
        static close(url: string, name?: string): boolean;
        static closeAll(): void;
        static destroy(url: string, name?: string): boolean;
        private bulidChildMap;
        private buidControllerMap;
    }
    enum LogLevel {
        /** Log level for low severity diagnostic messages. */
        Debug = 1,
        /** Log level for informational diagnostic messages. */
        Information = 2,
        /** Log level for diagnostic messages that indicate a non-fatal problem. */
        Warning = 3,
        /** Log level for diagnostic messages that indicate a failure in the current operation. */
        Error = 4
    }
    namespace Debug {
        let logLevel: LogLevel;
        function setLogLevel(lv: LogLevel): void;
        function isDebug(): boolean;
        function isLocalHost(): boolean;
        function logInfo(...args: any[]): void;
        function logDebug(...args: any[]): void;
        function logDebugTime(label?: any): void;
        function logDebugTimeEnd(label?: any): void;
    }
}
declare namespace LQ {
    /**
     * fgui弹窗
     */
    class FWindow extends fairygui.Window {
        static root: fairygui.GRoot;
        beforeOpenResources: any[];
        afterOpenResources: any[];
        className: String;
        layerName: string;
        closeBtn: fairygui.GComponent;
        winDefine: IWinDefine;
        /**
         *
         * window组件的所有子节点映射
         * @type
         * @memberof FWindow
         */
        children: {
            [key: string]: fairygui.GComponent;
        };
        classRef?: Function;
        /**
         * 控制器集合
         *
         * @type {{ [key: string]: fairygui.Controller }}
         * @memberof FWindow
         */
        cc: {
            [key: string]: fairygui.Controller;
        };
        static Init(): void;
        constructor(windowName?: string);
        /**
         *
         * 点击窗体外部是否触发关闭窗体 默认为 true
         * @type {boolean}
         * @memberof FWindow
         */
        closeOnClickOutSide: boolean;
        pkgPath?: string;
        componentName?: string;
        onInit(): void;
        /**
         * data参数会传递给onOpen方法
         *
         * @param {*} [data] 传递给弹窗的参数
         * @memberof FWindow
         */
        popup(data?: any): FWindow;
        private __onOpened;
        onOpened(data?: any): void;
        beforeOpenNeedLoad(): Promise<any>;
        afterOpenNeedLoad(): void;
        protected onShown(): void;
        protected onHide(): void;
        close(type?: string): void;
        onClosed(type?: string): void;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        protected onClickChild(childName: string, thisObj: any, func: Function, args?: any[]): FWindow;
        private bulidChildMap;
        private buidControllerMap;
        protected static popup(win: FWindow, param?: any, complete?: Laya.Handler): void;
        protected static onLoaded(win: FWindow, param?: any): Promise<void>;
    }
}
