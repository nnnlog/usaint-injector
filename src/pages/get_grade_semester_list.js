if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMB3W0017?sap-language=KO
 *
 * 성적이 확정된 학기의 목록과 성적 정보를 반환합니다.
 *
 * @returns {Promise<[{year: String, semester: String, semester_rank: String|undefined, total_rank: String|undefined}]>}
 */
window.ssurade.crawl.getGradeSemesterList = async () => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();
    await lightspeed.closePopup();

    let ret = await lightspeed.parseTable(s => s.sTitleText === "학기별 성적", {
        year: "학년도",
        semester: "학기",
        semester_rank: "학기별석차",
        total_rank: "전체석차"
    });

    // let year = new Date().getFullYear().toString(), month = new Date().getMonth() + 1;
    // if (month <= 2) year--;
    // ["1 학기", "여름학기", "2 학기", "겨울학기"].filter(semester => ret.find(prev => prev.year === year && prev.semester === semester) === undefined).forEach(semester => ret.push({
    //     year,
    //     semester,
    // }));

    return ret;
};
