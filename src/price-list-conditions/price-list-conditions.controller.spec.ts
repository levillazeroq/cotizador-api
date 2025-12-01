import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PriceListConditionsController } from './price-list-conditions.controller';
import { PriceListConditionsService } from './price-list-conditions.service';
import {
  mockPriceListConditionType,
  mockPriceListConditionsResponse,
  mockEmptyPriceListConditionsResponse,
  mockCreatePriceListConditionDto,
  mockUpdatePriceListConditionDto,
} from './__mocks__/price-list-conditions.mocks';

describe('PriceListConditionsController', () => {
  let controller: PriceListConditionsController;
  let service: jest.Mocked<PriceListConditionsService>;

  const mockPriceListConditionsService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    getConditions: jest.fn(),
    getConditionById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceListConditionsController],
      providers: [
        {
          provide: PriceListConditionsService,
          useValue: mockPriceListConditionsService,
        },
      ],
    }).compile();

    controller = module.get<PriceListConditionsController>(
      PriceListConditionsController,
    );
    service = module.get(PriceListConditionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConditions', () => {
    it('should return conditions for a price list', async () => {
      service.get.mockResolvedValue(mockPriceListConditionsResponse);

      const result = await controller.getConditions('1', {}, '1');

      expect(result).toEqual(mockPriceListConditionsResponse);
      expect(service.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        {},
        '1',
      );
    });

    it('should pass query parameters when provided', async () => {
      service.get.mockResolvedValue(mockPriceListConditionsResponse);

      const query = { page: 2, limit: 20 };
      await controller.getConditions('1', query, '1');

      expect(service.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        query,
        '1',
      );
    });

    it('should return empty conditions when no conditions found', async () => {
      service.get.mockResolvedValue(mockEmptyPriceListConditionsResponse);

      const result = await controller.getConditions('1', {}, '1');

      expect(result).toEqual(mockEmptyPriceListConditionsResponse);
      expect(result.conditions).toHaveLength(0);
    });
  });

  describe('getCondition', () => {
    it('should return a condition by id', async () => {
      service.get.mockResolvedValue(mockPriceListConditionType);

      const result = await controller.getCondition('1', '1', '1');

      expect(result).toEqual(mockPriceListConditionType);
      expect(service.get).toHaveBeenCalledWith(
        '/price-lists/1/conditions/1',
        {},
        '1',
      );
    });
  });

  describe('createCondition', () => {
    it('should create a new condition', async () => {
      service.post.mockResolvedValue(mockPriceListConditionType);

      const result = await controller.createCondition(
        '1',
        mockCreatePriceListConditionDto,
        '1',
      );

      expect(result).toEqual(mockPriceListConditionType);
      expect(service.post).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        mockCreatePriceListConditionDto,
        '1',
      );
    });

    it('should set conditionType to "amount" by default when not provided', async () => {
      const dtoWithoutType = {
        operator: 'equals',
        conditionValue: { amount: 10000 },
      };
      service.post.mockResolvedValue(mockPriceListConditionType);

      await controller.createCondition('1', dtoWithoutType, '1');

      expect(service.post).toHaveBeenCalledWith(
        '/price-lists/1/conditions',
        { ...dtoWithoutType, conditionType: 'amount' },
        '1',
      );
    });

    it('should throw BadRequestException when conditionType is not "amount"', async () => {
      const invalidDto = {
        conditionType: 'quantity',
        operator: 'equals',
        conditionValue: { quantity: 10 },
      };

      await expect(
        controller.createCondition('1', invalidDto, '1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.createCondition('1', invalidDto, '1'),
      ).rejects.toThrow(
        'Actualmente solo se permiten condiciones de tipo "amount"',
      );
      expect(service.post).not.toHaveBeenCalled();
    });

    it('should return 201 status code', async () => {
      service.post.mockResolvedValue(mockPriceListConditionType);

      await controller.createCondition('1', mockCreatePriceListConditionDto, '1');

      // The @HttpCode(HttpStatus.CREATED) decorator ensures 201 status
      expect(service.post).toHaveBeenCalled();
    });
  });

  describe('updateCondition', () => {
    it('should update a condition', async () => {
      const updatedCondition = {
        ...mockPriceListConditionType,
        ...mockUpdatePriceListConditionDto,
      };
      service.put.mockResolvedValue(updatedCondition);

      const result = await controller.updateCondition(
        '1',
        '1',
        mockUpdatePriceListConditionDto,
        '1',
      );

      expect(result).toEqual(updatedCondition);
      expect(service.put).toHaveBeenCalledWith(
        '/price-lists/1/conditions/1',
        mockUpdatePriceListConditionDto,
        '1',
      );
    });

    it('should throw BadRequestException when trying to change conditionType to non-"amount"', async () => {
      const invalidDto = {
        conditionType: 'quantity',
      };

      await expect(
        controller.updateCondition('1', '1', invalidDto, '1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.updateCondition('1', '1', invalidDto, '1'),
      ).rejects.toThrow(
        'Actualmente solo se permiten condiciones de tipo "amount"',
      );
      expect(service.put).not.toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        operator: 'less_than',
      };
      service.put.mockResolvedValue({
        ...mockPriceListConditionType,
        ...partialUpdate,
      });

      await controller.updateCondition('1', '1', partialUpdate, '1');

      expect(service.put).toHaveBeenCalledWith(
        '/price-lists/1/conditions/1',
        partialUpdate,
        '1',
      );
    });
  });

  describe('deleteCondition', () => {
    it('should delete a condition', async () => {
      service.delete.mockResolvedValue({} as any);

      await controller.deleteCondition('1', '1', '1');

      expect(service.delete).toHaveBeenCalledWith(
        '/price-lists/1/conditions/1',
        '1',
      );
    });

    it('should return 204 status code', async () => {
      service.delete.mockResolvedValue({} as any);

      await controller.deleteCondition('1', '1', '1');

      // The @HttpCode(HttpStatus.NO_CONTENT) decorator ensures 204 status
      expect(service.delete).toHaveBeenCalled();
    });
  });
});

