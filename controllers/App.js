export default class App {
  actions = {
    init: async () => {
      await post('event.init');
    },
  };
};
