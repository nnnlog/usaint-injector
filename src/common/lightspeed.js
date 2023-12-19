(async () => {
    if (window.ssurade === undefined) window.ssurade = {};

    await new Promise(r => {
        if (document.readyState === "complete") r();
        else document.addEventListener("DOMContentLoaded", r);
    });

    if (window.UCF_LS === undefined) {
        window.ssurade.init = true;
        window.dispatchEvent(new Event("ssurade_lightspeed"));
        return;
    }

    {
        let id;
        await new Promise(r => id = setInterval(() => {
            if (window.application !== null && window.application.lightspeed) {
                r();
                clearInterval(id);
            }
        }, 1));
    }

    let locked = false;
    let _lock = application.lightspeed.lock;
    application.lightspeed.lock = function () {
        let ret = _lock.call(this, ...arguments);
        locked = true;
        return ret;
    };

    let _unlock = application.lightspeed.unlock;
    let _unlock_promise = [];
    application.lightspeed.unlock = function () {
        let ret = _unlock.call(this, ...arguments);

        setTimeout(() => {
            for (let p of _unlock_promise) p();
            _unlock_promise = [];
            locked = false;
        }, 0);

        ssurade.lightspeed.update();
        return ret;
    };


    class LightspeedWrapper {
        update = () => {
            Array(...document.querySelectorAll("*[id^='WD']")).forEach(e => application.lightspeed.oControlFactory.oGetControlById(e.id));
        }

        waitForUnlock = () => {
            let p, r;
            p = new Promise(a => r = a);
            if (locked) {
                _unlock_promise.push(r);
            } else {
                r();
            }

            return p;
        };

        waitForPageLoad = async () => {
            return new Promise(r => {
                let id = setInterval(() => {
                    if (UCF_LS._.lock >= 1) {
                        clearInterval(id);
                        this.waitForUnlock().then(r);
                    }
                })
            });
        };

        findElement = func => {
            ssurade.lightspeed.update();
            return Object.values(application.lightspeed.oControlFactory.mControls).find(func);
        };

        findElementById = id => application.lightspeed.oControlFactory.oGetControlById(id);

        getInput = labelName => this.findElementById(this.findElement(a => a.oDomRef.tagName.toLowerCase() === "label" && a.sText === labelName)?.oDomRef?.htmlFor);

        clickButton = async (buttonText) => {
            let element = this.findElement(s => s.sText === buttonText && s.sVisibility === "VISIBLE");
            if (element === undefined) return;
            element.firePress(element.sId);
            return this.waitForUnlock();
        };

        parseTableInPanel = (elementFindFunction, fieldSchema) => {
            let tmp = this.findElement(elementFindFunction);
            let dom = tmp.oDomRef?.querySelectorAll("table")[1];
            return this.parseTable(s => s.sId === dom.id, fieldSchema);
        }

        parseTable = (elementFindFunction, fieldSchema) => {
            let schema = {};
            /**
             *
             * @type {UCF_Control}
             */
            let table = this.findElement(elementFindFunction);

            {
                let headers = table.aGetCellInfosOfRow(0);
                for (let i = 0; i < headers.length; i++) {
                    let name = headers[i].oDomRefCell.innerText;
                    for (let k in fieldSchema) {
                        if (fieldSchema[k] === name) {
                            schema[k] = i;
                        }
                    }
                }
            }

            let data = [];
            for (let i = 1; i <= table.iRowCount; i++) {
                let infos = table.aGetCellInfosOfRow(i);
                let curr = {};
                for (let k in schema) {
                    let dom = infos[schema[k]].oDomRefCell;
                    curr[k] = dom.innerText.trim();
                    if (curr[k] === "") {
                        curr[k] = dom.querySelector("input")?.value ?? "";
                    }
                }
                data.push(curr);
            }

            return data;
        };

        closePopup = () => this.clickButton("닫기");
    }

    window.ssurade.lightspeed = new LightspeedWrapper();

    window.ssurade.init = true;
    window.dispatchEvent(new Event("ssurade_lightspeed"));
})();
