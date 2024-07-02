if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW3683?sap-language=KO
 *
 * 유고 결석 정보를 반환합니다.
 *
 * @param year
 * @param semesterKey
 * @returns {Promise<{subject_time, subject_code, subject_place, grade_symbol, floor, seat_no, absent}[]>}>}
 */
window.ssurade.crawl.getAbsentApplicationInformation = async (year, semesterKey) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    if (year && semesterKey) {
        await ssurade.crawl.selectYear(year, semesterKey);
    }

    return await lightspeed.parseTableInPanel(s => s.sTitle === "결석신청정보", {
        absent_type: "결석구분상세",
        start_date: "결석시작일",
        end_date: "결석종료일",
        absent_cause: "결석사유KR",
        application_date: "신청일",
        proceed_date: "처리일자",
        reject_cause: "거부사유",
        status: "학생서비스팀 승인 여부",
    });
};
