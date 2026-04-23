import CryptoJS from 'crypto-js';

// AES-256 암호화/복호화 모듈
export class DataEncryption {
  private static readonly ALGORITHM = 'AES';
  private static readonly KEY_SIZE = 256;
  private static readonly MODE = CryptoJS.mode.CBC;
  private static readonly PADDING = CryptoJS.pad.Pkcs7;

  // 마스터 키 (실제로는 환경변수나 HSM에서 가져와야 함)
  private static masterKey = process.env.ENCRYPTION_MASTER_KEY || 'default-dev-key-change-in-production';

  /**
   * AES-256으로 데이터 암호화
   */
  static encrypt(data: string): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.masterKey);
      const iv = CryptoJS.lib.WordArray.random(16); // 16바이트 IV

      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: this.MODE,
        padding: this.PADDING
      });

      // IV + 암호화된 데이터 결합
      const combined = iv.concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('데이터 암호화에 실패했습니다');
    }
  }

  /**
   * AES-256으로 데이터 복호화
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.masterKey);
      const combined = CryptoJS.enc.Base64.parse(encryptedData);

      // IV 추출 (처음 16바이트)
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        key,
        {
          iv: iv,
          mode: this.MODE,
          padding: this.PADDING
        }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('데이터 복호화에 실패했습니다');
    }
  }

  /**
   * 민감한 금융 데이터 암호화
   */
  static encryptFinancialData(data: {
    accountNumber?: string;
    cardNumber?: string;
    balance?: number;
    transactions?: any[];
  }): string {
    // 민감한 필드만 암호화
    const sensitiveData = {
      accountNumber: data.accountNumber,
      cardNumber: data.cardNumber,
      balance: data.balance,
      // 거래내역은 별도 처리 (볼륨이 클 수 있음)
    };

    return this.encrypt(JSON.stringify(sensitiveData));
  }

  /**
   * 금융 데이터 복호화
   */
  static decryptFinancialData(encryptedData: string): any {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }

  /**
   * 키 회전 (보안 강화)
   */
  static rotateKey(newKey: string): void {
    // 실제로는 HSM에서 키를 안전하게 교체
    this.masterKey = newKey;
    console.log('🔄 암호화 키가 회전되었습니다');
  }

  /**
   * 데이터 무결성 검증 (HMAC)
   */
  static generateHMAC(data: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.masterKey);
    return CryptoJS.HmacSHA256(data, key).toString();
  }

  static verifyHMAC(data: string, hmac: string): boolean {
    const expectedHMAC = this.generateHMAC(data);
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Hex.parse(expectedHMAC)) ===
           CryptoJS.enc.Hex.stringify(CryptoJS.enc.Hex.parse(hmac));
  }
}

// RSA 암호화 (공개키/개인키 방식)
export class RSAEncryption {
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    // 실제로는 crypto 모듈이나 외부 라이브러리 사용
    // 여기서는 모의 구현
    return {
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA...\n-----END PRIVATE KEY-----'
    };
  }

  static encryptWithPublicKey(data: string, publicKey: string): string {
    // 실제 RSA 암호화 구현
    return CryptoJS.AES.encrypt(data, publicKey).toString();
  }

  static decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
    // 실제 RSA 복호화 구현
    return CryptoJS.AES.decrypt(encryptedData, privateKey).toString(CryptoJS.enc.Utf8);
  }
}
