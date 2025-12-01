import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PriceListConditionsService } from './price-list-conditions.service';
import axios from 'axios';
import {
  mockPriceListConditionType,
  mockPriceListConditionsResponse,
  mockEmptyPriceListConditionsResponse,
} from './__mocks__';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PriceListConditionsService', () => {
  let service: PriceListConditionsService;
  let configService: jest.Mocked<ConfigService>;
  let mockApiClient: any;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://api.example.com'),
  };

  // Mock console.error to prevent errors in tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Create a mock apiClient with working interceptors
    const responseInterceptors: Array<{ onFulfilled?: any; onRejected?: any }> = [];
    
    const baseGet = jest.fn();
    const basePost = jest.fn();
    const basePut = jest.fn();
    const baseDelete = jest.fn();
    
    mockApiClient = {
      get: jest.fn().mockImplementation(async (...args) => {
        try {
          const result = await baseGet(...args);
          // Execute response interceptors on success
          let response = result;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onFulfilled) {
              response = await interceptor.onFulfilled(response);
            }
          }
          return response;
        } catch (error: any) {
          // Execute response interceptors on error
          let processedError = error;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onRejected) {
              try {
                processedError = await interceptor.onRejected(processedError);
                // If interceptor returns a value, it's a success
                return processedError;
              } catch (e) {
                processedError = e;
              }
            }
          }
          throw processedError;
        }
      }),
      post: jest.fn().mockImplementation(async (...args) => {
        try {
          const result = await basePost(...args);
          let response = result;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onFulfilled) {
              response = await interceptor.onFulfilled(response);
            }
          }
          return response;
        } catch (error: any) {
          let processedError = error;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onRejected) {
              try {
                processedError = await interceptor.onRejected(processedError);
                return processedError;
              } catch (e) {
                processedError = e;
              }
            }
          }
          throw processedError;
        }
      }),
      put: jest.fn().mockImplementation(async (...args) => {
        try {
          const result = await basePut(...args);
          let response = result;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onFulfilled) {
              response = await interceptor.onFulfilled(response);
            }
          }
          return response;
        } catch (error: any) {
          let processedError = error;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onRejected) {
              try {
                processedError = await interceptor.onRejected(processedError);
                return processedError;
              } catch (e) {
                processedError = e;
              }
            }
          }
          throw processedError;
        }
      }),
      delete: jest.fn().mockImplementation(async (...args) => {
        try {
          const result = await baseDelete(...args);
          let response = result;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onFulfilled) {
              response = await interceptor.onFulfilled(response);
            }
          }
          return response;
        } catch (error: any) {
          let processedError = error;
          for (const interceptor of responseInterceptors) {
            if (interceptor.onRejected) {
              try {
                processedError = await interceptor.onRejected(processedError);
                return processedError;
              } catch (e) {
                processedError = e;
              }
            }
          }
          throw processedError;
        }
      }),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn((onFulfilled, onRejected) => {
            responseInterceptors.push({ onFulfilled, onRejected });
          }),
        },
      },
      _baseGet: baseGet,
      _basePost: basePost,
      _basePut: basePut,
      _baseDelete: baseDelete,
    };

    mockedAxios.create.mockReturnValue(mockApiClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceListConditionsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PriceListConditionsService>(PriceListConditionsService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConditions', () => {
    it('should return conditions for a price list', async () => {
      mockApiClient._baseGet.mockResolvedValue({
        data: mockPriceListConditionsResponse,
      });

      const result = await service.getConditions('1', '1');

      expect(result).toEqual(mockPriceListConditionsResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        {
          params: undefined,
          headers: { 'X-Organization-ID': '1' },
        },
      );
    });

    it('should pass query parameters when provided', async () => {
      mockApiClient._baseGet.mockResolvedValue({
        data: mockPriceListConditionsResponse,
      });

      const params = { page: 2, limit: 20 };
      await service.getConditions('1', '1', params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        {
          params,
          headers: { 'X-Organization-ID': '1' },
        },
      );
    });
  });

  describe('getConditionById', () => {
    it('should return a condition by id', async () => {
      mockApiClient._baseGet.mockResolvedValue({
        data: mockPriceListConditionType,
      });

      const result = await service.getConditionById('1', '1', '1');

      expect(result).toEqual(mockPriceListConditionType);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions/1',
        {
          headers: { 'X-Organization-ID': '1' },
        },
      );
    });
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      mockApiClient._baseGet.mockResolvedValue({
        data: mockPriceListConditionType,
      });

      const result = await service.get('/test', { param: 'value' }, '1');

      expect(result).toEqual(mockPriceListConditionType);
      expect(mockApiClient.get).toHaveBeenCalledWith('/test', {
        params: { param: 'value' },
        headers: { 'X-Organization-ID': '1' },
      });
    });

    it('should make a GET request without organizationId', async () => {
      mockApiClient._baseGet.mockResolvedValue({
        data: mockPriceListConditionType,
      });

      await service.get('/test');

      expect(mockApiClient.get).toHaveBeenCalledWith('/test', {
        params: undefined,
        headers: {},
      });
    });
  });

  describe('post', () => {
    it('should make a POST request', async () => {
      mockApiClient._basePost.mockResolvedValue({
        data: mockPriceListConditionType,
      });

      const data = { conditionType: 'amount' };
      const result = await service.post('/test', data, '1');

      expect(result).toEqual(mockPriceListConditionType);
      expect(mockApiClient.post).toHaveBeenCalledWith('/test', data, {
        headers: { 'X-Organization-ID': '1' },
      });
    });
  });

  describe('put', () => {
    it('should make a PUT request with If-Match header', async () => {
      mockApiClient._basePut.mockResolvedValue({
        data: mockPriceListConditionType,
      });

      const data = { operator: 'equals' };
      const result = await service.put('/test', data, '1');

      expect(result).toEqual(mockPriceListConditionType);
      expect(mockApiClient.put).toHaveBeenCalledWith('/test', data, {
        headers: {
          'If-Match': expect.any(String),
          'X-Organization-ID': '1',
        },
      });
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockApiClient._baseDelete.mockResolvedValue({
        data: {},
      });

      const result = await service.delete('/test', '1');

      expect(result).toEqual({});
      expect(mockApiClient.delete).toHaveBeenCalledWith('/test', {
        headers: { 'X-Organization-ID': '1' },
      });
    });
  });

  describe('error handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      const error = Object.assign(new Error('Bad Request'), {
        response: {
          status: 400,
          data: { error: 'Invalid request' },
        },
      });
      
      mockApiClient._baseGet.mockRejectedValue(error);

      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        'Invalid request',
      );
    });

    it('should handle 404 Not Found errors', async () => {
      const error = Object.assign(new Error('Not Found'), {
        response: {
          status: 404,
          data: {},
        },
      });
      
      mockApiClient._baseGet.mockRejectedValue(error);

      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        'Recurso no encontrado',
      );
    });

    it('should handle 500 Internal Server Error', async () => {
      const error = Object.assign(new Error('Internal Server Error'), {
        response: {
          status: 500,
          data: {},
        },
      });
      
      mockApiClient._baseGet.mockRejectedValue(error);

      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        'Error interno del servidor',
      );
    });

    it('should handle network errors', async () => {
      const error = Object.assign(new Error('Network Error'), {
        request: {},
      });
      
      mockApiClient._baseGet.mockRejectedValue(error);

      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        'Sin respuesta del servidor',
      );
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      
      mockApiClient._baseGet.mockRejectedValue(error);

      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        HttpException,
      );
      await expect(service.get('/test', undefined, '1')).rejects.toThrow(
        'Connection failed',
      );
    });
  });
});

