import rprojects from '../repos/rprojects.js';

export default class Projects {
  state = {
    names: {},
  };

  actions = {
    init: async () => {
      let { bus } = state.event;
      bus.on('projects:create:ready', async () => await post('projects.sync'));
      bus.on('projects:mv:ready', async () => await post('projects.sync'));
      bus.on('projects:rm:ready', async () => await post('projects.sync'));
      bus.on('companion:connected', async () => await post('projects.sync'));
      await post('projects.sync');
    },

    sync: async () => {
      this.state.names = {};
      for (let x of rprojects.list()) {
        let [name, uuid] = x.split(':');
        this.state.names[name] = uuid;
      }
    },

    create: async (opt = {}) => {
      let { bus } = state.event;
      bus.emit('projects:create:prompt');
      let [btn, name] = await showModal('PromptDialog', { title: 'Create project', placeholder: 'Project name', allowEmpty: false });
      if (btn !== 'ok') return bus.emit('projects:create:cancel');
      await loadman.run('projects.create', async () => {
        bus.emit('projects:create:request', { name });
        let uuid = rprojects.create(name);
        opt.nerdfonts ??= true;
        opt.tailwind ??= true;
        opt.betterscroll ??= true;
        state.projects.names[name] = uuid; // needed by rprojects.config
        await rprojects.config(name, opt);
        bus.emit('projects:create:ready', { name, uuid });
      });
    },

    mv: async name => {
      let { bus } = state.event;
      bus.emit('projects:mv:prompt');
      let [btn, newName] = await showModal('PromptDialog', { title: 'Rename project', placeholder: 'Project name', allowEmpty: false });
      if (btn !== 'ok') return bus.emit('projects:mv:cancel');
      await loadman.run('projects.mv', async () => {
        bus.emit('projects:mv:request', { name, newName });
        await rprojects.mv(name, newName);
        bus.emit('projects:mv:ready', { name, newName });
      });
    },

    rm: async name => {
      let { bus } = state.event;
      bus.emit('projects:rm:confirm', { name });
      let [btn] = await showModal('ConfirmationDialog', { title: 'Delete project?' });
      if (btn !== 'yes') return bus.emit('projects:rm:cancel', { name });
      await loadman.run('projects.rm', async () => {
        bus.emit('projects:rm:request', { name });
        await rprojects.rm(name);
        bus.emit('projects:rm:ready', { name });
      });
    },
  };
};
