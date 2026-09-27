const openers = {};

export function setDrawerOpener(page, open) {
  openers[page] = open;
  return () => {
    if (openers[page] === open) {
      openers[page] = null;
    }
  };
}

export function openPageDrawer(page) {
  openers[page]?.();
}
