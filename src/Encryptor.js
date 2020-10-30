const nacl = require('libsodium-wrappers')

module.exports = async(key) => {
    await nacl.ready;

    if (key === undefined) throw 'no key'
    
    else {
        return Object.freeze({
            key: key,
            encrypt: (c, n) => { return nacl.crypto_secretbox_easy(c, n, key)}
        })
    }
}