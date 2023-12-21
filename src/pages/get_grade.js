if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

window.ssurade.crawl.getSingleGrade = async (year, semesterKey, semesterValue) => {
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
    uploadData.rank = (await lightspeed.parseTable(s => s.sTitleText === "학기별 성적", {
        year: "학년도",
        semester: "학기",
        semester_rank: "학기별석차",
        total_rank: "전체석차"
    })).find(a => a.year === year && a.semester === semesterValue);

    return uploadData;
};
