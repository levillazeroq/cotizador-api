import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                AWS_REGION: 'us-east-1',
                AWS_S3_BUCKET_NAME: 'test-bucket',
                AWS_ACCESS_KEY_ID: 'test-access-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret-key',
                AWS_S3_IMAGES_FOLDER: 'images',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractKeyFromUrl', () => {
    it('should extract key from S3 URL', () => {
      const url =
        'https://test-bucket.s3.us-east-1.amazonaws.com/products/123/image.jpg';
      const key = service.extractKeyFromUrl(url);
      expect(key).toBe('products/123/image.jpg');
    });

    it('should return null for invalid URL', () => {
      const key = service.extractKeyFromUrl('invalid-url');
      expect(key).toBeNull();
    });
  });

  describe('getPublicUrl', () => {
    it('should generate public URL for a key', () => {
      const key = 'products/123/image.jpg';
      const url = service.getPublicUrl(key);
      expect(url).toBe(
        'https://test-bucket.s3.us-east-1.amazonaws.com/products/123/image.jpg',
      );
    });
  });
});
