if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMB3W0017?sap-language=ko
 *
 * 학기별 세부 성적을 반환합니다. (과목별 세부 성적은 반환되지 않습니다.)
 *
 * @param year
 * @param semesterKey
 * @param semesterValue
 * @param rank
 * @returns {Promise<{subjects: {subject_name, subject_code, credit, grade_score, grade_symbol, professor}[], rank: {year, semester, semester_rank, total_rank}}>}
 */
window.ssurade.crawl.getGradeBySemester = async (year, semesterKey, semesterValue, rank = true) => {
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
    uploadData.subjects = await lightspeed.parseTable(s => s.sTitleText === "학기별 세부 성적", {
        subject_name: "과목명",
        subject_code: "과목코드",
        credit: "과목학점",
        grade_score: "성적",
        grade_symbol: "등급",
        professor: "교수명"
    });
    if (rank) {
        uploadData.rank = (await lightspeed.parseTable(s => s.sTitleText === "학기별 성적", {
            year: "학년도",
            semester: "학기",
            semester_rank: "학기별석차",
            total_rank: "전체석차"
        })).find(a => a.year === year && a.semester === semesterValue);
    }

    return uploadData;
};
