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
    window.URL.createObjectURL = function(obj) {
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
        waitForElement = async (func, opt = {interval: 10, maxTry: 500, failFunc: () => {}}) => { // wait for 5 seconds default
            opt = Object.assign({interval: 10, maxTry: 500, failFunc: () => {}}, opt);
            let {interval, maxTry, failFunc} = opt;

            for (let i = 0; i < maxTry; i++) {
                if (func()) break;
                if (i + 1 === maxTry) return false;
                await new Promise(r => setTimeout(r, interval));
                failFunc();
            }
            return true;
        }

        waitForOpen = () => new Promise(r => {
            opens.push(r);
        });

        waitForDownload = () => new Promise(r => {
            downloads.push(r);
        });
    }

    ssurade.domUtils = new DOMUtils();
}