import { FitAddon } from 'https://esm.sh/xterm-addon-fit';
import { Terminal } from 'https://esm.sh/xterm';

export default class Shell {
  state = { open: false };

  actions = {
    init: async () => {
      document.head.append(d.el('link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/xterm/css/xterm.css' }));
      document.body.classList.add('w-screen', 'overflow-hidden');
    },

    toggle: async x => {
      this.state.open = x ?? !this.state.open;
      state.event.bus.emit('shell:toggle', { open: this.state.open });
    },
  };
}
