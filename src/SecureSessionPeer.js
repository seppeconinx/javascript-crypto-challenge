const nacl = require('libsodium-wrappers');
const Encryptor = require('./Encryptor');
const Decryptor = require('./Decryptor');

const SecureSessionPeer = async(peer = null) => {
    await nacl.ready;

    let keys = nacl.crypto_box_keypair();

    let secureSessionPeer = {
        peer: null,
        msg: "",
        encryptor: null,
        decryptor: null,
        publicKey: keys.publicKey,
        connector: async function(other, sessionKeys) {
            this.peer = other;
            let sharedKeys = sessionKeys(this.publicKey, keys.privateKey, other.publicKey);
            this.encryptor = await Encryptor(sharedKeys.sharedTx);
            this.decryptor = await Decryptor(sharedKeys.sharedRx);
        },
        encrypt: function(msg) {
            let nonce = nacl.randombytes_buf(nacl.crypto_secretbox_NONCEBYTES);
            return {
                nonce,
                ciphertext: this.encryptor.encrypt(msg, nonce)
            };
        },
        decrypt: function(msg, nonce) {
            return this.decryptor.decrypt(msg, nonce);
        },
        send: function(msg) {
            this.peer.handleMessage(this.encrypt(msg));
        },
        handleMessage: function(msg) {
            this.msg = this.decrypt(msg.ciphertext, msg.nonce);
        },
        receive: function() {
            return this.msg;
        }
    }

    if (peer) {
        await secureSessionPeer.connector(peer, nacl.crypto_kx_client_session_keys);
        await peer.connector(secureSessionPeer,  nacl.crypto_kx_server_session_keys);
    }

    return Object.defineProperties(secureSessionPeer, {
        publicKey: { writable: false },
        privateKey: { writable: false }
    });
}

module.exports = SecureSessionPeer;