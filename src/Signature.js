const nacl = require('libsodium-wrappers')

module.exports = async() => {
    await nacl.ready
    let keys = nacl.crypto_sign_keypair()
    return Object.freeze({
        verifyingKey: keys.publicKey,
        sign: (msg) => { return nacl.crypto_sign(msg, keys.privateKey)}
    })
}