if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW2100?sap-language=KO
 *
 * 강의를 검색합니다.
 *
 * @returns {Promise<void>}
 */
window.ssurade.crawl.searchSubject = async (keyword) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    let tab = lightspeed.findElement(s => s.sClassName === "UCF_TabStrip_standards");
    for (let i = 0; i < tab.aItems.length; i++) {
        let curr = tab.aItems[i];
        if (curr.sCaption === "과목검색") {
            tab.fireTabSelect(tab.sId, curr.sId, i, 0);
            await lightspeed.waitForUnlock();
            break;
        }
    }

    let input = lightspeed.getInput("검색어");
    input.updateValue(input.sId, keyword, true);
    input.fireChange(input.sId, keyword);
    await lightspeed.waitForUnlock();

    let unit = lightspeed.getInput("줄수 / 페이지");
    unit.fireSelect(unit.sId, "500", false);
    await lightspeed.waitForUnlock();


    let btn = lightspeed.findElement(s => s.sText === "검색");
    btn.firePress(btn.sId);
    await lightspeed.waitForUnlock();
};
