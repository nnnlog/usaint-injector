if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW3681?sap-language=KO
 *
 * 채플 강의와 출결 정보를 반환합니다.
 *
 * @param year
 * @param semesterKey
 * @returns {Promise<{summary: {subject_time, subject_code, subject_place, grade_symbol, floor, seat_no, absent}, attendance: {lecture_date, lecture_type, lecturer, affiliation, lecture_name, lecture_etc}}>}
 */
window.ssurade.crawl.getChapelInformation = async (year, semesterKey) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    {
        await lightspeed.closePopup();

        let input = lightspeed.getInput("학년도");
        input.setValue(year);
        await lightspeed.waitForUnlock();
    }
    {
        await lightspeed.closePopup();

        let input = lightspeed.getInput("학기");
        input.setValue(semesterKey);
        await lightspeed.waitForUnlock();
    }

    let uploadData = {};
    uploadData.summary = (await lightspeed.parseTableInPanel(s => s.sTitle?.startsWith("좌석번호"), {
        subject_time: "시간표",
        subject_code: "분반",
        subject_place: "강의실",
        grade_symbol: "성적",
        floor: "층수",
        seat_no: "좌석번호",
        absent: "결석일수"
    }))[0];
    uploadData.attendance = await lightspeed.parseTableInPanel(s => s.sTitle === "출결현황", {
        lecture_date: "수업일자",
        lecture_type: "강의구분",
        lecturer: "강사",
        affiliation: "소속",
        lecture_name: "제목",
        lecture_etc: "비고",
        attendance: "출결상태",
    });

    return uploadData;
};
