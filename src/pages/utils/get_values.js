if (window.ssurade === undefined) window.ssurade = {};
if (window.ssurade.crawl === undefined) window.ssurade.crawl = {};

/**
 * 주어진 Input의 입력 후보값들을 반환합니다.
 *
 * @returns {String[]}
 */
window.ssurade.crawl.getInputValues = (input) => {
    let lightspeed = window.ssurade.lightspeed;

    lightspeed.update();

    let b = input.getListBox();
    let c = b.oGetItemsManager();

    return Object.values(c.oGetItems()).map(a => a.dataset.itemkey);
};