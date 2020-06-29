"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameHallSdk;
(function (GameHallSdk) {
    // export const jszip = JSZip;
    //静态工具类
    class Tool {
        /**
         * 判断是否是比赛场 通过判断查询字符串里面是否有seasonId
         *
         * @static
         * @memberof Tool
         */
        static isMatchGame() {
            console.log("hahahah 😄");
        }
        /**
         * 获取冲榜赛倍率
         *
         * @static
         * @memberof Tool
         */
        static getMatchGameMutitype() {
        }
        /**
         * 给当前url增加一个查询字符串
         *
         * @static
         * @param {string} key 查询字符串名称
         * @param {string} value 查询字符串的值
         * @memberof Tool
         */
        static appendSearchParam(key, value) {
            let url = new URL(window.location.href);
        }
        /**
         * 从当前url删除一个☝️查询字符串
         *
         * @static
         * @param {string} key 要删除的查询字符串名称
         * @memberof Tool
         */
        static deleteSearchParam(key) {
        }
        /**
         *
         *  加载一个js文件 会在html里面生产script标签 并 src =url
         * @static
         * @param {*} url js的url
         * @memberof Tool
         */
        static loadJs(url) {
        }
        /**
         *
         * 下载zip包，得到zip包里面的js文件
         * @static
         * @param {string} url
         * @memberof Tool
         */
        static loadZipJs(url, exec = false) {
            let xhr = new XMLHttpRequest();
            // JSZip.loadAsync(url);
        }
    }
    GameHallSdk.Tool = Tool;
})(GameHallSdk || (GameHallSdk = {}));
window.GameHallSdk = GameHallSdk;
GameHallSdk.Tool.isMatchGame();
//# sourceMappingURL=GameHallSdk.js.map