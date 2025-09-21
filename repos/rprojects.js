import rfiles from './rfiles.js';

class ProjectsRepository {
  list() {
    let ret = [];
    for (let [k, v] of Object.entries(localStorage)) {
      if (!k.startsWith('webfoundry:projects:name:')) continue;
      ret.push(`${k.slice('webfoundry:projects:name:'.length)}:${v}`);
    }
    return ret.sort((a, b) => a.split(':')[0].localeCompare(b.split(':')[0]));
  }

  create(name) {
    if (state.projects.names[name]) throw new Error(`Project alreaady exists: ${name}`);
    let uuid = crypto.randomUUID();
    localStorage.setItem(`webfoundry:projects:name:${name}`, uuid);
    localStorage.setItem(`webfoundry:projects:storage:${uuid}`, 'local');
    //localStorage.setItem(`webfoundry:projects:storage:${uuid}`, state.companion.client?.status !== 'connected' ? 'local' : 'cfs');
    return uuid;
  }

  storage(name, value) {
    let uuid = state.projects.names[name];
    if (!uuid) throw new Error(`Unknown project: ${name}`);
    if (value === undefined) return localStorage.getItem(`webfoundry:projects:storage:${uuid}`);
    localStorage.setItem(`webfoundry:projects:storage:${uuid}`, value);
  }

  async config(name, opt) {
    if (!opt) return await rfiles.load(name, 'wf.uiconfig.json');
    await rfiles.save(name, 'wf.uiconfig.json', new Blob([JSON.stringify(opt, null, 2)], { type: 'application/json' }));
  }

  async mv(name, newName) {
    let uuid = state.projects.names[name];
    if (this.storage(name) === 'cfs') await post('companion.rpc', 'cfs:projects:mv', name, newName);
    localStorage.setItem(`webfoundry:projects:name:${newName}`, uuid);
    localStorage.removeItem(`webfoundry:projects:name:${name}`);
  }

  async rm(name) {
    let uuid = state.projects.names[name];
    let storage = this.storage(name);
    switch (storage) {
      case 'local': {
        if (Object.values(state.projects.names).filter(x => x === uuid).length <= 1) await Promise.all((await rfiles.list(name)).map(async x => await rfiles.rm(name, x)));
        break;
      }
      case 'cfs': await post('companion.rpc', 'cfs:projects:rm', name); break;
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
    localStorage.removeItem(`webfoundry:projects:name:${name}`);
    localStorage.removeItem(`webfoundry:projects:storage:${name}`);
  }
}

export default new ProjectsRepository();
