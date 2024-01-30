(async () => {
    if (window.ssurade === undefined) window.ssurade = {};
    if (ssurade.init !== undefined) return;

    ssurade.init = false;
    await new Promise(r => {
        if (document.readyState !== "loading") r();
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

    let locked = application.lightspeed.bIsLocked;
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

    let _log = UCF_Tracer.trace;
    UCF_Tracer.trace = function (e) {
        if (e === 0) {
            console.error(...arguments);
            // _log(...arguments);
        }
    }

    class LightspeedWrapper {
        /**
         * @internal
         */
        update = () => {
            Array(...document.querySelectorAll("*[id^='WD']")).forEach(e => application.lightspeed.oControlFactory.oGetControlById(e.id));
        }

        /**
         * Lightspeed의 unlock이 풀릴 때까지 기다립니다. 현재 lock되어 있지 않으면 기다리지 않습니다.
         *
         * @returns {Promise<void>}
         */
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

        /**
         * Lightspeed에 의해 페이지가 완전히 불러와질 때까지 기다립니다. 이미 페이지가 불러와져 있다면 기다리지 않습니다.
         *
         * @returns {Promise<void>}
         */
        waitForPageLoad = async () => {
            if (UCF_LS._.lock > 1) return;
            return new Promise(r => {
                let id = setInterval(() => {
                    if (UCF_LS._.lock >= 1) {
                        clearInterval(id);
                        this.waitForUnlock().then(r);
                    }
                }, 1);
            });
        };

        /**
         * Lightspeed에 의해 제어되는 요소를 주어진 함수에 맞는 것을 찾아 반환합니다.
         *
         * @param func
         * @returns {UCF_Control}
         */
        findElement = func => {
            ssurade.lightspeed.update();
            return Object.values(application.lightspeed.oControlFactory.mControls).find(func);
        };

        /**
         * Lightspeed에 의해 제어되는 요소를 주어진 id에 맞는 것을 찾아 반환합니다.
         *
         * @param id
         * @returns {UCF_Control}
         */
        findElementById = id => application.lightspeed.oControlFactory.oGetControlById(id);

        findTableInPanel = (elementFindFunction) => {
            let tmp = this.findElement(elementFindFunction);
            for (let dom of tmp.oDomRef?.querySelectorAll("table")) {
                let element = this.findElement(s => s.sId === dom.id);
                if (typeof element.aCellInfoMatrix !== "undefined") return element;
            }
            return null;
        }

        /**
         * Lightspeed에 의해 제어되는 Input을 주어진 라벨명에 맞는 것을 찾아 반환합니다.
         *
         * @param labelName
         * @returns {UCF_Control}
         */
        getInput = labelName => this.findElementById(this.findElement(a => a.oDomRef.tagName.toLowerCase() === "label" && a.sText === labelName)?.oDomRef?.htmlFor);

        /**
         * Lightspeed에 의해 제어되는 버튼을 주어진 버튼 텍스트 명에 맞는 것을 찾아 반환합니다.
         *
         * @param buttonText
         * @returns {Promise<void>}
         */
        clickButton = async (buttonText) => {
            let element = this.findElement(s => s.sText === buttonText && s.sVisibility === "VISIBLE");
            if (element === undefined) return;
            element.firePress(element.sId);
            return this.waitForUnlock();
        };


        /**
         * Lightspeed에 의해 제어되는 Panel 요소 내의 표를 파싱하여 반환합니다.
         *
         * @param elementFindFunction
         * @param fieldSchema
         * @returns {Promise<*[]>}
         */
        parseTableInPanel = (elementFindFunction, fieldSchema) => this.parseTable(this.findTableInPanel(elementFindFunction), fieldSchema);

        /**
         * Lightspeed에 의해 제어되는 표의 구성을 파싱하여 반환합니다.
         *
         * @param table
         * @param fieldSchema
         * @returns {{}}
         */
        parseTableSchema = (table, fieldSchema) => {
            let schema = {};
            let headers = table.aGetCellInfosOfRow(0);
            for (let i = 0; i < headers.length; i++) {
                let name = headers[i].oDomRefCell.innerText.trim();
                for (let k in fieldSchema) {
                    if (fieldSchema[k] === name) {
                        schema[k] = i;
                    }
                }
            }

            return schema;
        };

        /**
         * Lightspeed에 의해 제어되는 표를 파싱하여 반환합니다.
         *
         * @param table
         * @param fieldSchema
         * @returns {Promise<*[]>}t
         */
        parseTable = async (table, fieldSchema) => {
            let schema = this.parseTableSchema(table, fieldSchema);

            let data = [];
            let {iVisibleRowCount, iVisibleFirstRow} = table;
            for (let i = 1; i <= table.iRowCount; i++) {
                if (iVisibleFirstRow > i || i > iVisibleFirstRow + iVisibleRowCount - 1) {
                    iVisibleFirstRow = i;
                    table.fireVerticalScroll(table.sId, i, "NONE", "", "SCROLLBAR", false, false, false, false);
                    await ssurade.lightspeed.waitForUnlock();
                    table = this.findElementById(table.sId);
                }
                let infos = table.aGetCellInfosOfRow(i - iVisibleFirstRow + 1);
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
