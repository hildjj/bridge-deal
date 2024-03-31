const SUIT_POINTS = [4, 3, 2, 1];
const np = deal.north.points;
if (np < 11 || np > 15) {
    return false;
}
const sp = deal.south.points;
if (sp < 11) {
    return false;
}
const ns = deal.north.shape;
if (ns.spades < 3 || ns.spades > 4 ||
    ns.hearts < 3 || ns.hearts > 4 ||
    ns.diamonds > 1 ||
    ns.clubs > 5) {
    return false;
}
if (ns.spades === 3 && ns.hearts === 3) {
    return false;
}
if ((ns.clubs === 5) && Deal.weight(deal.north.clubs, SUIT_POINTS) > 3) {
    return false;
}
deal.north.name = '2D';
deal.south.name = '2N';
deal.randVuln();
deal.bid('2D!: 11-15, ~4414')
deal.bid('P')
deal.bid('2N!: Forcing, asks clarification')

return true;
