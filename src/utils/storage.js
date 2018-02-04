// Promise-based wrappers for chrome storage API

export default {

  get: function get(property, doSync = true) {
    return new Promise(resolve => {
      const handleGet = value => resolve(value[property]);
      if (doSync) {
        chrome.storage.sync.get(property, handleGet);
      } else {
        chrome.storage.local.set(property, handleGet);
      }
    });
  },

  set: function set(property, doSync = true) {
    if (doSync) {
      chrome.storage.sync.set(property);
    } else {
      chrome.storage.local.set(property);
    }
  },

};