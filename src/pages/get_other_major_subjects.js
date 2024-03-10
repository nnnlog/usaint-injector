if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * https://ecc.ssu.ac.kr/sap/bc/webdynpro/SAP/ZCMW2100?sap-language=KO
 *
 * 타전공 인정 강의 목록을 반환합니다.
 *
 * @returns {Promise<unknown>}
 */
window.ssurade.crawl.getOtherMajorSubjects = async (year, semesterKey) => {
    let lightspeed = window.ssurade.lightspeed;

    await lightspeed.waitForPageLoad();

    await ssurade.crawl.selectYear(year, semesterKey);

    let tab = lightspeed.findElement(s => s.sClassName === "UCF_TabStrip_standards");
    for (let i = 0; i < tab.aItems.length; i++) {
        let curr = tab.aItems[i];
        if (curr.sCaption === "타전공인정과목") {
            tab.fireTabSelect(tab.sId, curr.sId, i, 0);
            await lightspeed.waitForUnlock();
            break;
        }
    }

    let unit = lightspeed.getInput("줄수 / 페이지");
    unit.fireSelect(unit.sId, "500", false);
    await lightspeed.waitForUnlock();

    let getDropdownInput = (i) => {
        lightspeed.update();
        return Object.values(application.lightspeed.oControlFactory.mControls).filter(a => a.sClassName === "UCF_ComboBox" && a.sLabelledBy === "")[i];
    };

    let ret = [];

    for (let univ of ssurade.crawl.getInputValues(getDropdownInput(0))) {
        getDropdownInput(0).setValue(univ);
        await lightspeed.waitForUnlock();

        for (let department of ssurade.crawl.getInputValues(getDropdownInput(1))) {
            getDropdownInput(1).setValue(department);
            await lightspeed.waitForUnlock();

            for (let detailDepartment of ssurade.crawl.getInputValues(getDropdownInput(2))) {
                getDropdownInput(2).setValue(detailDepartment);
                await lightspeed.waitForUnlock();

                let btn = lightspeed.findElement(s => s.sText === "검색");
                btn.firePress(btn.sId);
                await lightspeed.waitForUnlock();

                let [x, y, z] = [0, 1, 2].map(i => getDropdownInput(i));

                ret.push(...(await lightspeed.parseTable(lightspeed.findElement(a => a.sClassName === "UCF_SapTable" && a.iColCount > 10), {
                    isu_main_type: "이수구분(주전공)",
                    isu_multi_type: "이수구분(다전공)",
                    code: "과목번호",
                })).map(a => Object.assign(a, {
                    univ: x.getDisplayValue(),
                    department: y.getDisplayValue(),
                    detail_department: z.getDisplayValue(),
                })));
            }
        }
    }

    return ret;
};
