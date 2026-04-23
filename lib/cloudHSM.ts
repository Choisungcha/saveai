import { KMSClient, EncryptCommand, DecryptCommand, CreateKeyCommand } from '@aws-sdk/client-kms';
import { KeyClient, CryptographyClient, KeyVaultKey, EncryptResult, DecryptResult } from '@azure/keyvault-keys';
import { KeyManagementServiceClient } from '@google-cloud/kms';

// 클라우드 HSM 제공업체 타입
export type HSMProvider = 'aws' | 'azure' | 'gcp';

// HSM 설정 인터페이스
export interface HSMConfig {
  provider: HSMProvider;
  region?: string;
  keyVaultUrl?: string;
  projectId?: string;
  keyRingId?: string;
  keyId?: string;
}

// 클라우드 HSM 통합 클래스
export class CloudHSM {
  private static instances: Map<string, CloudHSM> = new Map();

  private constructor(
    private config: HSMConfig,
    private awsClient?: KMSClient,
    private azureClient?: KeyClient,
    private gcpClient?: KeyManagementServiceClient
  ) {}

  /**
   * HSM 인스턴스 생성/가져오기 (싱글톤 패턴)
   */
  static async getInstance(config: HSMConfig, instanceId: string = 'default'): Promise<CloudHSM> {
    if (this.instances.has(instanceId)) {
      return this.instances.get(instanceId)!;
    }

    const instance = new CloudHSM(config);
    await instance.initialize();
    this.instances.set(instanceId, instance);
    return instance;
  }

  /**
   * HSM 클라이언트 초기화
   */
  private async initialize(): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        this.awsClient = new KMSClient({
          region: this.config.region || 'ap-northeast-2'
        });
        break;

      case 'azure':
        if (!this.config.keyVaultUrl) {
          throw new Error('Azure Key Vault URL is required');
        }
        // Azure 인증은 별도 설정 필요 (실제 환경에서는 TokenCredential 필요)
        this.azureClient = new KeyClient(this.config.keyVaultUrl, {
          getToken: async () => ({ token: 'mock-token', expiresOnTimestamp: Date.now() + 3600000 })
        } as any);
        break;

      case 'gcp':
        this.gcpClient = new KeyManagementServiceClient();
        break;

      default:
        throw new Error(`Unsupported HSM provider: ${this.config.provider}`);
    }
  }

  /**
   * 데이터 암호화 (클라우드 HSM 사용)
   */
  async encrypt(data: string, keyId?: string): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'aws':
          return await this.encryptAWS(data, keyId);

        case 'azure':
          return await this.encryptAzure(data, keyId);

        case 'gcp':
          return await this.encryptGCP(data, keyId);

        default:
          throw new Error(`Encryption not supported for provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('HSM encryption failed:', error);
      throw new Error('클라우드 HSM 암호화에 실패했습니다');
    }
  }

  /**
   * 데이터 복호화 (클라우드 HSM 사용)
   */
  async decrypt(encryptedData: string, keyId?: string): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'aws':
          return await this.decryptAWS(encryptedData, keyId);

        case 'azure':
          return await this.decryptAzure(encryptedData, keyId);

        case 'gcp':
          return await this.decryptGCP(encryptedData, keyId);

        default:
          throw new Error(`Decryption not supported for provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('HSM decryption failed:', error);
      throw new Error('클라우드 HSM 복호화에 실패했습니다');
    }
  }

  // AWS KMS 암호화
  private async encryptAWS(data: string, keyId?: string): Promise<string> {
    if (!this.awsClient) throw new Error('AWS KMS client not initialized');

    const keyIdToUse = keyId || process.env.AWS_KMS_KEY_ID;
    if (!keyIdToUse) throw new Error('AWS KMS Key ID is required');

    const command = new EncryptCommand({
      KeyId: keyIdToUse,
      Plaintext: Buffer.from(data, 'utf-8')
    });

    const response = await this.awsClient.send(command);
    return Buffer.from(response.CiphertextBlob || new Uint8Array()).toString('base64');
  }

  // AWS KMS 복호화
  private async decryptAWS(encryptedData: string, keyId?: string): Promise<string> {
    if (!this.awsClient) throw new Error('AWS KMS client not initialized');

    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedData, 'base64')
    });

    const response = await this.awsClient.send(command);
    return Buffer.from(response.Plaintext || new Uint8Array()).toString('utf-8');
  }

  // Azure Key Vault 암호화
  private async encryptAzure(data: string, keyId?: string): Promise<string> {
    if (!this.azureClient) throw new Error('Azure Key Client not initialized');

    const keyName = keyId || 'default-key';
    const key = await this.azureClient.getKey(keyName);
    const cryptoClient = new CryptographyClient(key.key!);

    const encryptResult = await cryptoClient.encrypt('RSA-OAEP', Buffer.from(data));
    return Buffer.from(encryptResult.result).toString('base64');
  }

  // Azure Key Vault 복호화
  private async decryptAzure(encryptedData: string, keyId?: string): Promise<string> {
    if (!this.azureClient) throw new Error('Azure Key Client not initialized');

    const keyName = keyId || 'default-key';
    const key = await this.azureClient.getKey(keyName);
    const cryptoClient = new CryptographyClient(key.key!);

    const decryptResult = await cryptoClient.decrypt('RSA-OAEP', Buffer.from(encryptedData, 'base64'));
    return Buffer.from(decryptResult.result).toString('utf-8');
  }

  // Google Cloud KMS 암호화
  private async encryptGCP(data: string, keyId?: string): Promise<string> {
    if (!this.gcpClient) throw new Error('GCP KMS client not initialized');

    const projectId = this.config.projectId || process.env.GCP_PROJECT_ID;
    const keyRingId = this.config.keyRingId || 'default-key-ring';
    const keyIdToUse = keyId || this.config.keyId || 'default-key';

    const [encryptResponse] = await this.gcpClient.encrypt({
      name: `projects/${projectId}/locations/global/keyRings/${keyRingId}/cryptoKeys/${keyIdToUse}`,
      plaintext: Buffer.from(data).toString('base64')
    });

    return Buffer.from(encryptResponse.ciphertext || new Uint8Array()).toString('base64');
  }

  // Google Cloud KMS 복호화
  private async decryptGCP(encryptedData: string, keyId?: string): Promise<string> {
    if (!this.gcpClient) throw new Error('GCP KMS client not initialized');

    const projectId = this.config.projectId || process.env.GCP_PROJECT_ID;
    const keyRingId = this.config.keyRingId || 'default-key-ring';
    const keyIdToUse = keyId || this.config.keyId || 'default-key';

    const [decryptResponse] = await this.gcpClient.decrypt({
      name: `projects/${projectId}/locations/global/keyRings/${keyRingId}/cryptoKeys/${keyIdToUse}`,
      ciphertext: encryptedData
    });

    return Buffer.from(decryptResponse.plaintext || new Uint8Array()).toString('utf-8');
  }

  /**
   * 새로운 키 생성
   */
  async createKey(keyId: string, description?: string): Promise<void> {
    switch (this.config.provider) {
      case 'aws':
        if (this.awsClient) {
          await this.awsClient.send(new CreateKeyCommand({
            Description: description || `SaveAI encryption key: ${keyId}`
          }));
        }
        break;

      case 'azure':
        if (this.azureClient) {
          await this.azureClient.createKey(keyId, 'RSA');
        }
        break;

      case 'gcp':
        if (this.gcpClient) {
          const projectId = this.config.projectId || process.env.GCP_PROJECT_ID;
          const keyRingId = this.config.keyRingId || 'default-key-ring';

          await this.gcpClient.createCryptoKey({
            parent: `projects/${projectId}/locations/global/keyRings/${keyRingId}`,
            cryptoKeyId: keyId,
            cryptoKey: {
              purpose: 'ENCRYPT_DECRYPT',
              algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION'
            } as any
          });
        }
        break;
    }
  }
}

// 보안 인증서 관리 클래스
export class CertificateManager {
  private static certificates: Map<string, any> = new Map();

  /**
   * 인증서 저장 (암호화된 상태로)
   */
  static async storeCertificate(certId: string, certificate: any, hsm: CloudHSM): Promise<void> {
    const encryptedCert = await hsm.encrypt(JSON.stringify(certificate));
    this.certificates.set(certId, {
      data: encryptedCert,
      createdAt: new Date(),
      expiresAt: certificate.expiresAt
    });
  }

  /**
   * 인증서 조회
   */
  static async getCertificate(certId: string, hsm: CloudHSM): Promise<any> {
    const stored = this.certificates.get(certId);
    if (!stored) throw new Error('Certificate not found');

    // 만료 확인
    if (stored.expiresAt && new Date() > new Date(stored.expiresAt)) {
      throw new Error('Certificate expired');
    }

    const decrypted = await hsm.decrypt(stored.data);
    return JSON.parse(decrypted);
  }

  /**
   * 인증서 갱신
   */
  static async renewCertificate(certId: string, newCertificate: any, hsm: CloudHSM): Promise<void> {
    await this.storeCertificate(certId, newCertificate, hsm);
  }

  /**
   * 만료된 인증서 정리
   */
  static cleanupExpiredCertificates(): void {
    const now = new Date();
    for (const [certId, cert] of this.certificates) {
      if (cert.expiresAt && now > new Date(cert.expiresAt)) {
        this.certificates.delete(certId);
        console.log(`🗑️ 만료된 인증서 삭제: ${certId}`);
      }
    }
  }
}
