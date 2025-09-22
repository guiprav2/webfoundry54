import lf from 'https://esm.sh/localforage';
import rprojects from './rprojects.js';
import { lookup as mimeLookup } from 'https://cdn.skypack.dev/mrmime';

class FilesRepository {
  async list(name) {
    let uuid = state.projects.names[name];
    let storage = rprojects.storage(name);
    switch (storage) {
      case 'local': {
        let ks = await lf.keys();
        let prefix = `webfoundry:projects:files:${uuid}:`;
        return ks.filter(x => x.startsWith(prefix)).map(x => x.slice(prefix.length));
      }
      case 'cfs': return await post('companion.rpc', 'files:list', name);
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
  }

  async save(name, path, blob) {
    let uuid = state.projects.names[name];
    let storage = rprojects.storage(name);
    switch (storage) {
      case 'local': return await lf.setItem(`webfoundry:projects:files:${uuid}:${path}`, blob);
      case 'cfs': return await post('companion.rpc', 'files:save', name, b64(blob));
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
  }

  async load(name, path) {
    let uuid = state.projects.names[name];
    let storage = rprojects.storage(name);
    switch (storage) {
      case 'local': return await lf.getItem(`webfoundry:projects:files:${uuid}:${path}`);
      case 'cfs': return unb64(await post('companion.rpc', 'files:load', name, path), mimeLookup(path));
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
  }

  async mv(name, path, newPath) {
    let uuid = state.projects.names[name];
    let storage = rprojects.storage(name);
    switch (storage) {
      case 'local': {
        let blob = await lf.getItem(`webfoundry:projects:files:${uuid}:${path}`);
        await lf.setItem(`webfoundry:projects:files:${uuid}:${newPath}`, blob);
        await lf.removeItem(`webfoundry:projects:files:${uuid}:${path}`);
        break;
      }
      case 'cfs': return await post('companion.rpc', 'files:mv', path, newPath);
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
  }

  async rm(name, path) {
    let uuid = state.projects.names[name];
    let storage = rprojects.storage(name);
    switch (storage) {
      case 'local': return lf.removeItem(`webfoundry:projects:files:${uuid}:${path}`);
      case 'cfs': return await post('companion.rpc', 'files:rm', path);
      default: throw new Error(`Unknown project storage: ${storage}`);
    }
  }
}

function b64(blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function unb64(base64, type = '') {
  let chars = atob(base64);
  let nums = new Array(chars.length);
  for (let i = 0; i < chars.length; i++) nums[i] = chars.charCodeAt(i);
  return new Blob([new Uint8Array(nums)], { type });
}

export default new FilesRepository();
