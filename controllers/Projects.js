export default class Projects {
  state = {
    names: {},
  };

  actions = {
    init: async () => await post('projects.sync'),

    sync: async () => {
      this.state.names = {};
      for (let [k, v] of Object.entries(localStorage)) {
        if (!k.startsWith('wf:project:name:')) continue;
        this.state.names[k.slice('wf:project:name:'.length)] = v;
      }
    },
  };
};
