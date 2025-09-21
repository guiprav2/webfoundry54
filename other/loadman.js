class LoadingManager {
  ops = {};

  busy(k) {
    let { ops } = this;
    if (k) return ops[k]?.length || 0;
    return Object.values(ops).flat().length;
  }

  async run(k, fn, multi = false) {
    let { ops } = this;
    ops[k] ??= [];
    if (!multi && ops[k].length)
      throw new Error(`Operation already running: "${k}"`);
    ops[k].push(fn);
    d.update();
    try {
      await fn();
    } finally {
      ops[k].splice(ops[k].indexOf(fn), 1);
      if (!ops[k].length) delete ops[k];
      d.update();
    }
  }
}

window.loadman = new LoadingManager();
export default loadman;
