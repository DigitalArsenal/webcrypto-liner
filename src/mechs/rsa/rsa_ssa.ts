import * as asmCrypto from "asmcrypto.js";
import * as core from "webcrypto-core";
import { ShaCrypto } from "../sha/crypto";
import { RsaCrypto } from "./crypto";
import { RsaCryptoKey } from "./key";

export class RsaSsaProvider extends core.RsaSsaProvider {

  public async onGenerateKey(algorithm: RsaHashedKeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<core.CryptoKeyPair> {
    return RsaCrypto.generateKey(algorithm, extractable, keyUsages);
  }

  public async onExportKey(format: KeyFormat, key: RsaCryptoKey): Promise<JsonWebKey | ArrayBuffer> {
    return RsaCrypto.exportKey(format, key);
  }

  public async onImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: RsaHashedImportParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    return RsaCrypto.importKey(format, keyData, algorithm, extractable, keyUsages);
  }

  public async onSign(algorithm: Algorithm, key: RsaCryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
    const rsa = new asmCrypto.RSA_PKCS1_v1_5(key.data, ShaCrypto.getDigest(key.algorithm.hash.name));
    const result = rsa.sign(core.BufferSourceConverter.toUint8Array(data));
    return core.BufferSourceConverter.toArrayBuffer(result);
  }

  public async onVerify(algorithm: Algorithm, key: RsaCryptoKey, signature: ArrayBuffer, data: ArrayBuffer): Promise<boolean> {
    const rsa = new asmCrypto.RSA_PKCS1_v1_5(key.data, ShaCrypto.getDigest(key.algorithm.hash.name));
    try {
      rsa.verify(core.BufferSourceConverter.toUint8Array(signature), core.BufferSourceConverter.toUint8Array(data));
    } catch {
      return false;
    }
    return true;
  }

  public checkCryptoKey(key: CryptoKey, keyUsage: KeyUsage): asserts key is RsaCryptoKey {
    super.checkCryptoKey(key, keyUsage);
    RsaCrypto.checkCryptoKey(key);
  }

}
