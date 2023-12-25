{
    if (window.ssurade === undefined) window.ssurade = {};

    let opens = [];
    window.open = function (url) {
        for (let p of opens) {
            p(url);
        }
        opens = [];
    };

    let downloads = [];
    window.URL.createObjectURL = function (obj) {
        if (obj instanceof Blob) {
            obj.arrayBuffer().then(a => {
                let str = new TextDecoder("utf-16le", {
                    ignoreBOM: true,
                    fatal: false,
                }).decode(a);
                for (let p of downloads) p(str);
                downloads = [];
            });
            throw new Error(); // prevent download
        } else {
            throw new Error(); // unknown
        }
    };

    class DOMUtils {
        /**
         * 주어진 함수에 대한 반환값이 true이면 함수를 종료하고 true를 반환합니다.
         * 그렇지 않으면 {interval}ms를 최대 {maxTry}번 반복합니다. 이때, 실패할 때 작동하는 {failFunc}을 호출합니다.
         *
         * @param {Function} findFunc
         * @param {interval: number, maxTry: number, failFunc: Function} opt
         * @returns {Promise<boolean>}
         */
        waitFor = async (findFunc, opt = {
            interval: 10, maxTry: 500, failFunc: () => {
            }
        }) => { // wait for 5 seconds default
            opt = Object.assign({
                interval: 10, maxTry: 500, failFunc: () => {
                }
            }, opt);
            let {interval, maxTry, failFunc} = opt;

            for (let i = 0; i < maxTry; i++) {
                if (findFunc()) break;
                if (i + 1 === maxTry) return false;
                await new Promise(r => setTimeout(r, interval));
                failFunc();
            }
            return true;
        }

        /**
         * {window.open}이 호출되면, 해당 이벤트의 url을 반환합니다.
         *
         * @returns {Promise<String>}
         */
        waitForOpen = () => new Promise(r => {
            opens.push(r);
        });

        /**
         * {Blob}을 사용하는 다운로드가 요청될 때, 해당 이벤트의 파일 데이터를 반환합니다.
         *
         * @returns {Promise<String>}
         */
        waitForDownload = () => new Promise(r => {
            downloads.push(r);
        });
    }

    ssurade.domUtils = new DOMUtils();
}