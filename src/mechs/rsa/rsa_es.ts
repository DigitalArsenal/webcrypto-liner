import { Convert } from "pvtsutils";
import * as core from "webcrypto-core";
import { RsaCrypto } from "./crypto";
import { RsaCryptoKey } from "./key";

export type RsaPkcs1Params = Algorithm;
export type RsaPkcs1SignParams = core.HashedAlgorithm;

export class RsaEsProvider extends core.ProviderCrypto {

  public name = "RSAES-PKCS1-v1_5";
  public usages = {
    publicKey: ["encrypt", "wrapKey"] as core.KeyUsages,
    privateKey: ["decrypt", "unwrapKey"] as core.KeyUsages,
  };
  public hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  public async onGenerateKey(algorithm: RsaKeyGenParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKeyPair> {
    const key = await RsaCrypto.generateKey(
      {
        ...algorithm,
        name: this.name,
      },
      extractable,
      keyUsages);

    return key;
  }

  public checkGenerateKeyParams(algorithm: RsaKeyGenParams) {
    // public exponent
    this.checkRequiredProperty(algorithm, "publicExponent");
    if (!(algorithm.publicExponent && algorithm.publicExponent instanceof Uint8Array)) {
      throw new TypeError("publicExponent: Missing or not a Uint8Array");
    }
    const publicExponent = Convert.ToBase64(algorithm.publicExponent);
    if (!(publicExponent === "Aw==" || publicExponent === "AQAB")) {
      throw new TypeError("publicExponent: Must be [3] or [1,0,1]");
    }

    // modulus length
    this.checkRequiredProperty(algorithm, "modulusLength");
    switch (algorithm.modulusLength) {
      case 1024:
      case 2048:
      case 4096:
        break;
      default:
        throw new TypeError("modulusLength: Must be 1024, 2048, or 4096");
    }
  }

  public async onDecrypt(algorithm: RsaPkcs1Params, key: RsaCryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
    // const options = this.toCryptoOptions(key);
    const dec = key.data;
    throw new Error("Method not implemented");
  }

  public async onExportKey(format: KeyFormat, key: RsaCryptoKey): Promise<JsonWebKey | ArrayBuffer> {
    return RsaCrypto.exportKey(format, key);
  }

  public async onImportKey(format: KeyFormat, keyData: JsonWebKey | ArrayBuffer, algorithm: RsaHashedImportParams, extractable: boolean, keyUsages: KeyUsage[]): Promise<CryptoKey> {
    const key = await RsaCrypto.importKey(format, keyData, { ...algorithm, name: this.name }, extractable, keyUsages);
    return key;
  }

  // public checkCryptoKey(key: CryptoKey, keyUsage?: KeyUsage) {
  //   super.checkCryptoKey(key, keyUsage);
  //   if (!(key instanceof RsaPrivateKey || key instanceof RsaPublicKey)) {
  //     throw new TypeError("key: Is not RSA CryptoKey");
  //   }
  // }

  // private toCryptoOptions(key: RsaPrivateKey): crypto.RsaPrivateKey;
  // private toCryptoOptions(key: RsaPublicKey): crypto.RsaPublicKey;
  // private toCryptoOptions(key: RsaPrivateKey | RsaPublicKey) {
  //   const type = key.type.toUpperCase();
  //   return {
  //     key: `-----BEGIN ${type} KEY-----\n${key.data.toString("base64")}\n-----END ${type} KEY-----`,
  //     // @ts-ignore
  //     padding: crypto.constants.RSA_PKCS1_PADDING,
  //   };
  // }

  // private prepareSignData(algorithm: RsaPkcs1SignParams, data: ArrayBuffer) {
  //   return crypto
  //     .createHash((algorithm.hash as Algorithm).name.replace("-", ""))
  //     .update(Buffer.from(data))
  //     .digest();
  // }
}
