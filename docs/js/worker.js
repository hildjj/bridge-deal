import { Deal, findDeal, prec2d } from './card.js';
addEventListener('message', (e) => {
    let d = undefined;
    let tries = 0;
    if (e.data) {
        d = new Deal(e.data);
    }
    else {
        [d, tries] = findDeal(prec2d);
    }
    postMessage({ lin: d.lin(), num: d.num, tries });
});
