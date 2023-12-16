if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

{
    let _open = window.open, res = null;
    window.open = function () {
        if (res !== null) {
            res(...arguments);
        }
    };

    window.ssurade.crawl.getPrintGradeURL = async () => {
        if (location.hostname !== "office.ssu.ac.kr") return null;

        {
            let exportBtn = await ssurade.domUtils.waitForElement(() => document.querySelector("input[tabindex='4']") !== null);
            if (!exportBtn) return null;
            document.querySelector("input[tabindex='4']").click();
        }

        {
            let exportOption = await ssurade.domUtils.waitForElement(() => document.querySelectorAll("select").length >= 3);
            if (!exportOption) return null;

            document.querySelectorAll("select")[1].selectedIndex = 6;
            document.querySelectorAll("select")[1].dispatchEvent(new Event('change'));
            document.querySelectorAll("select")[1].closest("tr").querySelector("input").value = '|||||';

            document.querySelectorAll("select")[2].selectedIndex = 1;
            document.querySelectorAll("select")[2].dispatchEvent(new Event('change'));
        }

        let p = ssurade.domUtils.waitForDownload();
        document.querySelector("button[classname='confirmButtonClass']").click();
        return p;
    };
}
