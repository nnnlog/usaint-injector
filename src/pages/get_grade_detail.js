if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMB3W0017?sap-language=ko
 *
 * 과목별 세부 성적을 반환합니다.
 *
 * @param year
 * @param semesterKey
 * @param subjectCode
 * @returns {Promise<Object>}
 */
window.ssurade.crawl.getGradeDetail = async (year, semesterKey, subjectCode) => {
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

    let table = lightspeed.findElement(s => s.sTitleText === "학기별 세부 성적");
    let schema = lightspeed.parseTableSchema(table, {
        detail: "상세성적",
        subject_code: "과목코드",
    });

    for (let i = 1; i <= table.iRowCount; i++) {
        if (table.getCell(i, schema.subject_code).oDomRef.innerText === subjectCode) {
            await lightspeed.closePopup();

            let btn = table.getCell(i, schema.detail).getContent();
            if (btn === null) return null;
            btn.firePress(btn.sId);
            await lightspeed.waitForUnlock();

            let detailTable = lightspeed.findTableInPanel(s => s.sTitle === "상세성적");
            let uploadData = {};
            for (let j = 0; j < detailTable.iColCount; j++) {
                uploadData[detailTable.getCell(0, j).oDomRef.innerText] = detailTable.getCell(1, j).oDomRef.innerText;
            }

            return uploadData;
        }
    }

    return null;
};
