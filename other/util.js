import './loadman.js';

window.tap = x => (console.log(x), x);

export let resolve = x => (typeof x === 'function' ? x() : x);

export function arrayify(x, opt = null) {
  if (Array.isArray(x)) return x;
  if (x === undefined || (opt === 'nonull' && x === null)) return [];
  return [x];
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function joinPath(path, name) {
  return [...(path?.split?.('/') || []), name].filter(Boolean).join('/');
}

window.joinPath = joinPath;

export async function selectFile(accept) {
  let { promise: p, resolve: res } = Promise.withResolvers();
  let input = d.el('input', { type: 'file', /*accept,*/ class: 'hidden' });
  input.addEventListener('change', ev => res(input.files[0]));
  top.document.body.append(input);
  input.click();
  input.remove();
  return p;
}

// FIXME: Expand comprehensively
export function isMedia(path) {
  return /.(jpg|jpeg|png|gif|bmp|webp|svg|mp4|mov|avi|mkv|wmv|flv|mp3|wav|ogg|m4a|flac|aac)$/.test(
    path,
  );
}

window.isMedia = isMedia;
