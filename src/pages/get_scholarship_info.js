if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW7530n?sap-language=KO
 *
 * 장학금 정보를 반환합니다.
 *
 * @returns {Promise<{year: String, semester: String, name: String, process: String, price: String}[]>}
 */
window.ssurade.crawl.getScholarshipInformation = async () => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    return await lightspeed.parseTableInPanel(s => s.sTitle === "장학금 수혜내역", {year: "학년", semester: "학기", name: "장학금명", process: "처리상태", price: "선발금액"});
};
