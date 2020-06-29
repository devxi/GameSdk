declare namespace GameHallSdk {
    export const jszip: any;
    export class Tool {
        /**
         * 判断是否是比赛场 通过判断查询字符串里面是否有seasonId
         *
         * @static
         * @memberof Tool
         */
        static isMatchGame(): void;
        /**
         * 获取冲榜赛倍率
         *
         * @static
         * @memberof Tool
         */
        static getMatchGameMutitype(): void;
        /**
         * 给当前url增加一个查询字符串
         *
         * @static
         * @param {string} key 查询字符串名称
         * @param {string} value 查询字符串的值
         * @memberof Tool
         */
        static appendSearchParam(key: string, value: string): void;
        /**
         * 从当前url删除一个☝️查询字符串
         *
         * @static
         * @param {string} key 要删除的查询字符串名称
         * @memberof Tool
         */
        static deleteSearchParam(key: string): void;
        /**
         *
         *  加载一个js文件 会在html里面生产script标签 并 src =url
         * @static
         * @param {*} url js的url
         * @memberof Tool
         */
        static loadJs(url: string): void;
        /**
         *
         * 下载zip包，得到zip包里面的js文件
         * @static
         * @param {string} url
         * @memberof Tool
         */
        static loadZipJs(url: string, exec?: boolean): void;
    }
    interface ICodeZip {
        url: string;
        js?: {
            [key: string]: string;
        };
        execAfterLoaded?: boolean;
        progress?: number;
    }
    interface ICodeZipRes {
        downloadProgress: {
            cur: number;
            total: number;
            totalProgrss: number;
        };
        unZipProgress: {
            completed: number;
            total: number;
        };
        codeZips: Array<ICodeZip>;
    }
    export class ZipCodeLoader {
        res: ICodeZipRes;
        constructor(codeZips: Array<ICodeZip>);
        startDownload(downloadProgress: Function, unzipProgress: Function): void;
        executeCode(url: string, code: string): void;
        download(codeZip: ICodeZip, downloadProgress: Function, unzipProgress: Function): Promise<unknown>;
    }
    export {};
}
declare let res: {
    url: string;
    js: {
        "libs/laya-6bb4eed969.core.js": string;
        "libs/laya-ee83f7080f.ani.js": string;
        "libs/laya-eb46760c69.html.js": string;
        "libs/laya-2ee36440bf.ui.js": string;
        "libs/third/fairygui-dac55db5d9.js": string;
        "libs/third/puremvc-typescript-standard-1-8f0acf0b1b.0.js": string;
    };
}[];
declare let test: GameHallSdk.ZipCodeLoader;
