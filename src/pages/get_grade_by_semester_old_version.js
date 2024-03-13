if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW5002?sap-language=ko
 *
 * 구버전 페이지의 학기별 세부 성적을 반환합니다. (과목별 세부 성적은 반환되지 않습니다. 과목학점은 소수점이 지원되지 않습니다.)
 *
 * @param year
 * @param semesterKey
 * @returns {Promise<{subjects: {subject_name, subject_code,professor}[]}>}
 */
window.ssurade.crawl.getGradeBySemesterOldVersion = async (year, semesterKey) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    await ssurade.crawl.selectYear(year, semesterKey);

    let uploadData = {};
    uploadData.subjects = await lightspeed.parseTable(lightspeed.findElement(s => s.sTitleText === "학기별 세부 성적"), {
        subject_name: "과목명",
        subject_code: "과목코드",
        professor: "교수명"
    });

    return uploadData;
};
