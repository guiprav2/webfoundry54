export default class App {
  actions = {
    init: async () => {
      await post('event.init');
      await post('settings.init');
      await post('projects.init');
      await post('companion.init');
    },
  };
};
