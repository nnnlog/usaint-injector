if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW2100?sap-language=KO
 *
 * 강의 목록을 반환합니다.
 *
 * @returns {Promise<unknown>}
 */
window.ssurade.crawl.getSubjectLists = async (keyword) => {
    let lightspeed = window.ssurade.lightspeed;

    await ssurade.crawl.searchSubject(keyword);

    return await lightspeed.parseTable(lightspeed.findElement(a => a.sClassName === "UCF_SapTable" && a.iColCount > 10), {
        isu_main_type: "이수구분(주전공)",
        isu_multi_type: "이수구분(다전공)",
        abeek: "공학인증",
        type: "교과영역",
        code: "과목번호",
        name: "과목명",
        bunban: "분반",
        professor: "교수명",
        open_department: "개설학과",
        credit: "시간/학점(설계)",
        listen_count: "수강인원",
        remain_count: "여석",
        lecture_time_place: "강의시간(강의실)",
        process: "과정",
        target: "수강대상",
    });
};
