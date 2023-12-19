(() => {
    if (window.ssurade === undefined) window.ssurade = {};
    if (window.ssurade.flutter === undefined) window.ssurade.flutter = {};
    if (window.ssurade.flutter.init === true) return;
    window.ssurade.flutter.init = true;

    // default handler
    window.ssurade.flutter.sendMessage = function () {
        console.log(...arguments);
    };

    window.addEventListener("message", function (event) {
        if (event.data === "ssurade") {
            let port = event.ports[0];
            port.onmessage = async (ev) => {
                let p = await eval(ev.data);
                port.postMessage(JSON.stringify({data: p}));
            }
        }
    });

    let promises = [];
    promises.push(new Promise(r => {
        if (window.flutter_inappwebview?._platformReady) r();
        else window.addEventListener("flutterInAppWebViewPlatformReady", r);
    }));

    promises.push(new Promise(r => {
        if (ssurade?.init) r();
        else window.addEventListener("ssurade_lightspeed", r)
    }));

    const init = () => {
        if (window.flutter_inappwebview?.callHandler !== null) {
            window.ssurade.flutter.sendMessage = window.flutter_inappwebview.callHandler;
        }

        ssurade.flutter.sendMessage("load");
    };

    Promise.all(promises).then(init);
})();
