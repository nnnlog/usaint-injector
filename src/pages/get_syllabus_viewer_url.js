if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW2100?sap-language=KO
 *
 * 강의 계획서의 OZ Viewer 링크들을 반환합니다.
 *
 * @returns {Promise<unknown>}
 */
window.ssurade.crawl.getSyllabusViewerURLs = async (year, semesterKey, codes) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    await ssurade.crawl.selectYear(year, semesterKey);

    let S = new Set();
    for (let v of codes) S.add(v);

    let keywords = {};
    for (let i = 0; i < 9; i++) {
        let curr = [];
        let nxt = [];
        for (let code of codes) {
            if (code.includes(i.toString())) curr.push(code);
            else nxt.push(code);
        }
        if (curr.length > 0) keywords[i.toString()] = curr;
        codes = nxt;
    }

    let res = {};
    for (let k in keywords) {
        await ssurade.crawl.searchSubject(year, semesterKey, k);

        await lightspeed.parseTable(lightspeed.findElement(a => a.sClassName === "UCF_SapTable" && a.iColCount > 10), {
            syllabus: "계획",
            code: "과목번호",
        }, {
            syllabus: async (dom, data) => {
                if (!S.has(data.code)) return;

                let link = ssurade.domUtils.waitForOpen();
                let btn = application.lightspeed.oGetControlByDomRef(dom.querySelector("div"));
                if (btn.firePress === undefined) {
                    res[data.code] = null;
                    return;
                }
                btn.firePress(btn.sId);
                let p = ssurade.lightspeed.waitForUnlock();
                await link.then(url => res[data.code] = url);
                await p;
            },
        });
    }

    return res;
};
