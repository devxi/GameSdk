import * as JSZip from "JSZip";

namespace GameHallSdk {
    export const jszip = null;


    //静态工具类
    export class Tool {

        /**
         * 判断是否是比赛场 通过判断查询字符串里面是否有seasonId
         *
         * @static
         * @memberof Tool
         */
        static isMatchGame() {
            console.log("hahahah 😄")
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
        static appendSearchParam(key: string, value: string) {
            let url = new URL(window.location.href);
        }


        /**
         * 从当前url删除一个☝️查询字符串
         *
         * @static
         * @param {string} key 要删除的查询字符串名称
         * @memberof Tool
         */
        static deleteSearchParam(key: string) {

        }


        /**
         *
         *  加载一个js文件 会在html里面生产script标签 并 src =url
         * @static
         * @param {*} url js的url
         * @memberof Tool
         */
        static loadJs(url: string): void {

        }

        /**
         *
         * 下载zip包，得到zip包里面的js文件
         * @static
         * @param {string} url
         * @memberof Tool
         */
        static loadZipJs(url: string, exec = false) {
            let xhr = new XMLHttpRequest();
            // JSZip.loadAsync(url);
        }
    }

    interface ICodeZip {
        url: string;
        js?: { [key: string]: string };
        execAfterLoaded?: boolean;
        progress?: number;
    }

    interface ICodeZipRes {
        downloadProgress: {
            cur: number,
            total: number,
            totalProgrss: number,
        };
        unZipProgress: {
            completed: number,
            total: number,
        },
        codeZips: Array<ICodeZip>,
    }

    export class ZipCodeLoader {
        res: ICodeZipRes;
        constructor(codeZips: Array<ICodeZip>) {
            this.res = {
                downloadProgress: {
                    cur: 0,
                    total: 0,
                    totalProgrss: 0
                },
                unZipProgress: {
                    completed: 0,
                    total: 0,
                },
                codeZips: codeZips
            }
            this.res.downloadProgress.total = this.res.codeZips.length;
            let jsFileNum = 0;
            this.res.codeZips.map(codeZip => {
                if (codeZip.js == null) codeZip.js = {};
                jsFileNum += Object.keys(codeZip.js).length
                if (codeZip.execAfterLoaded == null) codeZip.execAfterLoaded = true;
            });
            this.res.unZipProgress.total = jsFileNum;
        }

        startDownload(downloadProgress: Function, unzipProgress: Function, onloadedCompleted: Function) {
            let downloadArr = [];
            this.res.codeZips.map(codeZip => {
                downloadArr.push(this.download(codeZip, downloadProgress, unzipProgress));
            });
            Promise.all(downloadArr).then(res => {
               if (onloadedCompleted) onloadedCompleted();
            });
        }

        executeCode(url: string, code: string) {
            console.log("exec:", url);
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = code;
            script.async = false;
            document.body.appendChild(script);
            //用完就删
            // document.body.removeChild(script);
        }

        download(codeZip: ICodeZip, downloadProgress: Function, unzipProgress: Function) {
            return new Promise((resovle, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', codeZip.url, true);
                xhr.responseType = 'arraybuffer';
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {

                            let zipBuffer = xhr.response;
                            let promiseArr = [];
                            JSZip.loadAsync(zipBuffer).then(zipFile => {
                                for (const url in codeZip.js) {
                                    if (codeZip.js.hasOwnProperty(url)) {
                                        const file = zipFile.files[url];
                                        if (!file) {
                                            throw "zip包中不包含指定文件:" + url;
                                        }
                                        let promise = file.async("text").then(code => {
                                            codeZip.js[url] = code;
                                            this.res.unZipProgress.completed++;
                                            if (unzipProgress) unzipProgress(this.res.unZipProgress);
                                            return Promise.resolve();
                                        }, err => {
                                            console.error("从zip解析code失败 code url", url, "err", err);
                                            return Promise.reject(err);
                                        });
                                        promiseArr.push(promise);
                                    }
                                }
                                Promise.all(promiseArr).then(() => {
                                    // debugger
                                    if (codeZip.execAfterLoaded) {
                                        for (const url in codeZip.js) {
                                            if (codeZip.js.hasOwnProperty(url)) {
                                                const code = codeZip.js[url];
                                                this.executeCode(url, code);
                                            }
                                        }
                                    }
                                    return resovle(codeZip.js)
                                }, err => {
                                    console.log(err);
                                    return reject(err)
                                });

                            }, err => {
                                console.error("加载代码zip包出错", err);
                                return reject(err)
                            });
                        }
                    }
                };
                xhr.onprogress = (e) => {
                    let pro = e.loaded / e.total;
                    codeZip.progress = pro;
                    this.res.downloadProgress.cur = 0;
                    this.res.codeZips.map(codeZip => {
                        this.res.downloadProgress.cur += codeZip.progress;
                    });
                    this.res.downloadProgress.totalProgrss = this.res.downloadProgress.cur / this.res.downloadProgress.total;
                    // console.log("zip总加载进度：", this.res.downloadProgress.totalProgrss);
                    if (downloadProgress) downloadProgress(this.res.downloadProgress.totalProgrss);
                };
                xhr.send();
            });
        }
    }
}
(window as any).GameHallSdk = GameHallSdk;

