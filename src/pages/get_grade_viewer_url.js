if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW8030n?sap-language=KO
 *
 * 이수구분별 성적표의 OZ Viewer 링크를 반환합니다.
 *
 * @returns {Promise<unknown>}
 */
window.ssurade.crawl.getGradeViewerURL = async () => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    let p = ssurade.domUtils.waitForOpen();
    await lightspeed.clickButton("이수구분별 성적현황 출력");

    await lightspeed.waitForUnlock();

    return p;
};
