const n = deal.north;
if (n.points < 16) {
  return false;
}

if (n.balanced()) {
  if (n.range(16, 18) || n.range(22, 23)) {
    return false;
  }
}

return true;
