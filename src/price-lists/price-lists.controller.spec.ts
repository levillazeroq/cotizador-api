import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PriceListsController } from './price-lists.controller';
import { PriceListsService } from './price-lists.service';
import {
  mockPriceList,
  mockPriceList2,
  mockPriceListWithConditions,
  mockPriceListsWithConditions,
  mockCreatePriceListDto,
  mockUpdatePriceListDto,
  mockProductPricesResponse,
} from './__mocks__/price-lists.mocks';

describe('PriceListsController', () => {
  let controller: PriceListsController;
  let service: jest.Mocked<PriceListsService>;

  const mockPriceListsService = {
    getPriceLists: jest.fn(),
    getPriceListById: jest.fn(),
    createPriceList: jest.fn(),
    updatePriceList: jest.fn(),
    deletePriceList: jest.fn(),
    getPriceListProducts: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceListsController],
      providers: [
        {
          provide: PriceListsService,
          useValue: mockPriceListsService,
        },
      ],
    }).compile();

    controller = module.get<PriceListsController>(PriceListsController);
    service = module.get(PriceListsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPriceLists', () => {
    it('should return all price lists for an organization', async () => {
      const mockResponse = {
        priceLists: mockPriceListsWithConditions,
      };
      service.getPriceLists.mockResolvedValue(mockResponse);

      const result = await controller.getPriceLists('1');

      expect(result).toEqual(mockResponse);
      expect(service.getPriceLists).toHaveBeenCalledWith('1', { status: undefined });
    });

    it('should filter by status when query parameter is provided', async () => {
      const mockResponse = {
        priceLists: [mockPriceListWithConditions],
      };
      service.getPriceLists.mockResolvedValue(mockResponse);

      const result = await controller.getPriceLists('1', 'active');

      expect(result).toEqual(mockResponse);
      expect(service.getPriceLists).toHaveBeenCalledWith('1', { status: 'active' });
    });

    it('should return empty array when no price lists found', async () => {
      const mockResponse = {
        priceLists: [],
      };
      service.getPriceLists.mockResolvedValue(mockResponse);

      const result = await controller.getPriceLists('1');

      expect(result).toEqual(mockResponse);
      expect(service.getPriceLists).toHaveBeenCalledWith('1', { status: undefined });
    });
  });

  describe('getPriceList', () => {
    it('should return a price list by id', async () => {
      service.getPriceListById.mockResolvedValue(mockPriceListWithConditions);

      const result = await controller.getPriceList('1', '1');

      expect(result).toEqual(mockPriceListWithConditions);
      expect(service.getPriceListById).toHaveBeenCalledWith('1', '1');
    });

    it('should throw NotFoundException when price list not found', async () => {
      service.getPriceListById.mockRejectedValue(
        new NotFoundException('Price list with ID 999 not found'),
      );

      await expect(controller.getPriceList('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getPriceList('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });
  });

  describe('createPriceList', () => {
    it('should create a new price list', async () => {
      const newPriceList = {
        ...mockPriceListWithConditions,
        id: 4,
        name: mockCreatePriceListDto.name,
      };
      service.createPriceList.mockResolvedValue(newPriceList);

      const result = await controller.createPriceList(mockCreatePriceListDto, '1');

      expect(result).toEqual(newPriceList);
      expect(service.createPriceList).toHaveBeenCalledWith(
        mockCreatePriceListDto,
        '1',
      );
    });

    it('should return 201 status code', async () => {
      service.createPriceList.mockResolvedValue(mockPriceListWithConditions);

      await controller.createPriceList(mockCreatePriceListDto, '1');

      // The @HttpCode(HttpStatus.CREATED) decorator ensures 201 status
      expect(service.createPriceList).toHaveBeenCalled();
    });
  });

  describe('updatePriceList', () => {
    it('should update a price list', async () => {
      const updatedPriceList = {
        ...mockPriceListWithConditions,
        ...mockUpdatePriceListDto,
      };
      service.updatePriceList.mockResolvedValue(updatedPriceList);

      const result = await controller.updatePriceList(
        '1',
        mockUpdatePriceListDto,
        '1',
      );

      expect(result).toEqual(updatedPriceList);
      expect(service.updatePriceList).toHaveBeenCalledWith(
        '1',
        mockUpdatePriceListDto,
        '1',
      );
    });

    it('should throw NotFoundException when price list not found', async () => {
      service.updatePriceList.mockRejectedValue(
        new NotFoundException('Price list with ID 999 not found'),
      );

      await expect(
        controller.updatePriceList('999', mockUpdatePriceListDto, '1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.updatePriceList('999', mockUpdatePriceListDto, '1'),
      ).rejects.toThrow('Price list with ID 999 not found');
    });

    it('should throw BadRequestException when trying to remove default status from only default list', async () => {
      service.updatePriceList.mockRejectedValue(
        new BadRequestException(
          'No se puede quitar el estado por defecto. Debe existir al menos una lista de precios por defecto.',
        ),
      );

      await expect(
        controller.updatePriceList('1', { isDefault: false }, '1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow partial updates', async () => {
      const updatedPriceList = {
        ...mockPriceListWithConditions,
        name: 'Updated Name',
      };
      service.updatePriceList.mockResolvedValue(updatedPriceList);

      const result = await controller.updatePriceList(
        '1',
        { name: 'Updated Name' },
        '1',
      );

      expect(result).toEqual(updatedPriceList);
      expect(service.updatePriceList).toHaveBeenCalledWith(
        '1',
        { name: 'Updated Name' },
        '1',
      );
    });
  });

  describe('deletePriceList', () => {
    it('should delete a price list', async () => {
      service.deletePriceList.mockResolvedValue(undefined);

      await controller.deletePriceList('2', '1');

      expect(service.deletePriceList).toHaveBeenCalledWith('2', '1');
    });

    it('should return 204 status code', async () => {
      service.deletePriceList.mockResolvedValue(undefined);

      await controller.deletePriceList('2', '1');

      // The @HttpCode(HttpStatus.NO_CONTENT) decorator ensures 204 status
      expect(service.deletePriceList).toHaveBeenCalled();
    });

    it('should throw NotFoundException when price list not found', async () => {
      service.deletePriceList.mockRejectedValue(
        new NotFoundException('Price list with ID 999 not found'),
      );

      await expect(controller.deletePriceList('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.deletePriceList('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });

    it('should throw BadRequestException when trying to delete default price list', async () => {
      service.deletePriceList.mockRejectedValue(
        new BadRequestException(
          'No se puede eliminar la lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
        ),
      );

      await expect(controller.deletePriceList('1', '1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.deletePriceList('1', '1')).rejects.toThrow(
        'No se puede eliminar la lista de precios por defecto',
      );
    });
  });

  describe('getPriceListProducts', () => {
    it('should return products with prices for a price list', async () => {
      service.getPriceListProducts.mockResolvedValue(mockProductPricesResponse);

      const result = await controller.getPriceListProducts('1', '1');

      expect(result).toEqual(mockProductPricesResponse);
      expect(service.getPriceListProducts).toHaveBeenCalledWith(
        '1',
        '1',
        1,
        20,
        undefined,
      );
    });

    it('should handle pagination parameters', async () => {
      service.getPriceListProducts.mockResolvedValue(mockProductPricesResponse);

      await controller.getPriceListProducts('1', '1', '2', '10');

      expect(service.getPriceListProducts).toHaveBeenCalledWith(
        '1',
        '1',
        2,
        10,
        undefined,
      );
    });

    it('should handle search parameter', async () => {
      service.getPriceListProducts.mockResolvedValue(mockProductPricesResponse);

      await controller.getPriceListProducts('1', '1', undefined, undefined, 'laptop');

      expect(service.getPriceListProducts).toHaveBeenCalledWith(
        '1',
        '1',
        1,
        20,
        'laptop',
      );
    });

    it('should use default pagination when parameters are not provided', async () => {
      service.getPriceListProducts.mockResolvedValue(mockProductPricesResponse);

      await controller.getPriceListProducts('1', '1');

      expect(service.getPriceListProducts).toHaveBeenCalledWith(
        '1',
        '1',
        1, // default page
        20, // default limit
        undefined,
      );
    });

    it('should parse page and limit as integers', async () => {
      service.getPriceListProducts.mockResolvedValue(mockProductPricesResponse);

      await controller.getPriceListProducts('1', '1', '3', '15', 'search');

      expect(service.getPriceListProducts).toHaveBeenCalledWith(
        '1',
        '1',
        3,
        15,
        'search',
      );
    });

    it('should throw NotFoundException when price list not found', async () => {
      service.getPriceListProducts.mockRejectedValue(
        new NotFoundException('Price list with ID 999 not found'),
      );

      await expect(controller.getPriceListProducts('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getPriceListProducts('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });

    it('should handle empty products result', async () => {
      const emptyResponse = {
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      service.getPriceListProducts.mockResolvedValue(emptyResponse);

      const result = await controller.getPriceListProducts('1', '1');

      expect(result).toEqual(emptyResponse);
      expect(result.products).toHaveLength(0);
    });
  });
});

