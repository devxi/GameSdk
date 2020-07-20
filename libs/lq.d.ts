interface Window {
      GameHall: IGameHall;
      /**
       *  原生App js 接口
       */
      NativeInterface: NativeInterface,

      /**
       *
       *  微信授权回调结果
       * @param {string} jsonStr
       * @memberof Window
       */
      app_sy_callback(jsonStr: string): void;

      appConfig: IAppConfig;


      /**
       *
       * 
       * @param {string} locationStr
       * @memberof Window
       */
      onGetLocation(locationStr: string): void


      /**
       * 移出html的loading界面
       *
       * @memberof Window
       */
      removeHtmlLoading(): void

      updateTipTxt(text: string): void


      /**
       *
       * 微信jssdk 初始化完成后 调用
       * @memberof Window
       */
      onWeChatReady(): void


      /**
       *
       * 通过微信jssdk获取定位
       * @returns {Promise<any>}
       * @memberof Window
       */
      getWeChatLocation(): Promise<any>;


      /**
       *
       * 设置jssdk的微信分享
       * @memberof Window
       */
      WeChat(url: string, title: string, img: string, desc: string, onSuccess: Function): void;
      LQ: any;
}

namespace GlobalFunc {
      function logDebug(...args);
}

interface IGameHall {
      appConfig?: IAppConfig;
      loadLibSync: Function;
      gameParam: ISubGameParam;
}

interface ISubGameParam {
      roomId?: string,
      clubId?: string,
      seasonId?: number,
      matchMultipleType?: number,
}

interface ISceneCfg {
      name: string,
      pkgPath: string,
      pkgName: string,
      componentName: string,
      classRef: any,
}

interface IWinDefine {
      name: string,
      componentName: string,
      pkgPath: string
      pkgName: string,
}


interface IAppConfig {
      /**
       * 拱猪地址
       * 
       * @type {string}
       * @memberof AppConfig
       */
      pzgzUrl: string;
      remoteServiceBaseUrl: string;
      loginUrl: string;
      global_origin: string;
      logLevel: Number;
      gongZhuBasePath: string;
}


/**
 * 原生App js 接口
 *
 * @interface NativeInterface
 */
interface NativeInterface {

      /**
       *  请求微信授权登陆
       *
       * @memberof NativeInterface
       */
      js_sy_Wxauthorize(): void;

      /**
       * 分享链接到微信
       *
       * @param {string} title      标题
       * @param {string} content    内容
       * @param {string} link       链接
       * @param {string} iconUrl    图标地址
       * @param {number} wxScene    微信场景： 0-好友 1-朋友圈 2-收藏
       * @memberof NativeInterface
       */
      weixinShareLink(title: string, content: string, link: string, iconUrl: string, wxScene: number): void;


      /**
       * 分享截图到微信
       *
       * @param {string} base64Str 图片的base64
       * @param {number} wxScene   微信场景： 0-好友 1-朋友圈 2-收藏
       * @memberof NativeInterface
       */
      weixinShareScreen(base64Str: string, wxScene: number): void;


      /**
       *
       * 通过key从原生App读取值
       * @param {string} key
       * @memberof NativeInterface
       */
      getValue(key: string): string;


      /**
       *
       * 存 东西 到App
       * @param {string} key
       * @param {string} value
       * @memberof NativeInterface
       */
      putValue(key: string, value: string): void;


      /**
       * 从Native环境获取定位
       *
       * @memberof NativeInterface
       */
      getLocation(): void;
}