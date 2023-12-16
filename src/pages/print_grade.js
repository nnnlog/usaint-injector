if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

{
    window.ssurade.crawl.getPrintGradeURL = async () => {
        let lightspeed = window.ssurade.lightspeed;

        await lightspeed.waitForPageLoad();

        let p = ssurade.domUtils.waitForOpen();
        await lightspeed.clickButton("이수구분별 성적현황 출력");

        await lightspeed.waitForUnlock();

        return p;
    };
}
