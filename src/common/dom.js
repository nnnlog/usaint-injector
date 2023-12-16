{
    if (window.ssurade === undefined) window.ssurade = {};

    let opens = [];
    window.open = function () {
        for (let p of opens) p(...arguments);
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
        waitForElement = async (func, interval = 10, maxTry = 500) => { // wait for 5 seconds default
            for (let i = 0; i < maxTry; i++) {
                if (func()) break;
                if (i + 1 === maxTry) return false;
                await new Promise(r => setTimeout(r, interval));
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