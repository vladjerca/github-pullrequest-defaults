const storeResolver = (resolve, reject) => {
    return (res) => {
        let err = chrome.runtime.lastError;
        if (err) {
            reject(err);
        } else {
            resolve(res);
        }
    };
}
module.exports = (() => ({
    get: (keys) => new Promise((resolve, reject) =>
        chrome.storage.local.get(keys, storeResolver(resolve, reject))
    ),
    set: (items) => new Promise((resolve, reject) =>
        chrome.storage.local.set(items, storeResolver(resolve, reject))
    ),
    getBytesInUse: (keys) => new Promise((resolve, reject) =>
        chrome.storage.local.getBytesInUse(keys, storeResolver(resolve, reject))
    )
    ,
    remove: (keys) => new Promise((resolve, reject) =>
        chrome.storage.local.remove(keys, storeResolver(resolve, reject))
    ),
    clear: () => new Promise((resolve, reject) =>
        chrome.storage.local.clear(storeResolver(resolve, reject))
    ),
    onChange: (cb) => {
        chrome.storage.onChanged.addListener(cb);
    }
}))();