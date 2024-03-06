if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 *
 * 학년도/학기를 선택합니다.
 *
 * @returns {Promise<void>}
 */
window.ssurade.crawl.selectYear = async (year, semesterKey) => {
    let lightspeed = window.ssurade.lightspeed;

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
};
