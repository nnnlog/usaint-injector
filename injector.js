// ==UserScript==
// @name         Lightspeed Injector
// @namespace    http://tampermonkey.net/
// @version      2023-12-12
// @description  try to take over the world!
// @author       You
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.kr
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const config = { attributes: true, childList: true, subtree: true };

    const observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            for (let node of mutation.addedNodes) {
                if (node.tagName === "SCRIPT" && node.src.includes("lightspeed")) {
                    observer.disconnect();

                    let url = node.src;
                    node.removeAttribute("src");

                    let realUrl = `${location.origin}/sap/public/bc/ur/nw7/js/dbg/lightspeed.js`;

                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", realUrl, false);
                    xhr.send();


                    let temp = document.createElement("script");
                    temp.setAttribute('type', 'text/javascript');
                    temp.innerHTML = "1";
                    document.head.appendChild(temp);
                    temp.src = url; // 링크만 전달해줌, 로딩은 하지 않음

                    let script = xhr.response;
                    script = script.replace("oObject && aMethods", "false");

                    eval(script);
                }
            }
        }
    });
    observer.observe(document.head, config);
})();
