{
    {
        let id;
        await new Promise(r => id = setInterval(() => {
            if (application && application.lightspeed) {
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

        // reload all lightspeed object force.
        Array(...document.querySelectorAll("*[id^='WD']")).forEach(e => application.lightspeed.oControlFactory.oGetControlById(e.id));

        return ret;
    };


    class LightspeedWrapper {

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
            return Object.values(application.lightspeed.oControlFactory.mControls).find(func);
        };

        findElementById = id => application.lightspeed.oControlFactory.oGetControlById(id);

        getInput = labelName => this.findElementById(this.findElement(a => a.oDomRef.tagName.toLowerCase() === "label" && a.sText === labelName)?.oDomRef?.htmlFor);;

        clickButton = async (buttonText) => {
            let element = this.findElement(s => s.sText === buttonText && s.sVisibility === "VISIBLE");
            if (element === undefined) return;
            element.firePress(element.sId);
            return this.waitForUnlock();
        };

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
                    curr[k] = infos[schema[k]].oDomRefCell.innerText;
                }
                data.push(curr);
            }

            return data;
        };

        closePopup = () => this.clickButton("닫기");
    }

    if (window.ssurade === undefined) window.ssurade = {};
    window.ssurade.lightspeed = new LightspeedWrapper();
}
