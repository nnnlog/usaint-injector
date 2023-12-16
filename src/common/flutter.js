if (window.flutter_inappwebview === undefined) {
    window.ssurade.flutter__sendMessage = function () {
        console.log(...arguments);
    };
} else {
    window.ssurade.flutter__sendMessage = function () {
        return new Promise(r => {
            let id = setInterval(() => {
                if (window.flutter_inappwebview.callHandler !== undefined) {
                    clearInterval(id);

                    window.flutter_inappwebview.callHandler(...arguments);
                    r();
                }
            }, 1);
        });
    };
}
