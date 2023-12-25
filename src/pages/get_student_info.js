if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW1001n?sap-language=ko
 *
 * 입학연도와 졸업연도를 반환합니다.
 *
 * @returns {Promise<string[]>}
 */
window.ssurade.crawl.getStudentInfo = async () => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    let entranceYear = ssurade.lightspeed.getInput("입학 년도").getValue();
    let graduateYear = ssurade.lightspeed.getInput("졸업년도").getValue();

    return [entranceYear, graduateYear];
};
