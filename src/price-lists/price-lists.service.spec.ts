import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PriceListsService } from './price-lists.service';
import { PriceListRepository } from './repositories/price-list.repository';
import { PriceListConditionRepository } from './repositories/price-list-condition.repository';
import { TaxClassRepository } from './repositories/tax-class.repository';
import { ProductPriceRepository } from './repositories/product-price.repository';
import { ProductsService } from '../products/products.service';
import {
  mockPriceList,
  mockPriceList2,
  mockPriceListInactive,
  mockPriceLists,
  mockPriceListWithConditions,
  mockPriceListsWithConditions,
  mockCreatePriceListDto,
  mockUpdatePriceListDto,
  mockProductWithPrice,
  mockProductPricesResponse,
  mockEmptyProductPricesResponse,
  mockProductPrice,
  createPriceListRepositoryMock,
  createPriceListConditionRepositoryMock,
  createTaxClassRepositoryMock,
  createProductPriceRepositoryMock,
} from './__mocks__';
import { mockProductWithPricesAndMedia } from '../products/__mocks__';

describe('PriceListsService', () => {
  let service: PriceListsService;
  let priceListRepository: jest.Mocked<PriceListRepository>;
  let priceListConditionRepository: jest.Mocked<PriceListConditionRepository>;
  let taxClassRepository: jest.Mocked<TaxClassRepository>;
  let productPriceRepository: jest.Mocked<ProductPriceRepository>;
  let productsService: jest.Mocked<ProductsService>;

  const mockProductsService = {
    getProductsByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceListsService,
        {
          provide: PriceListRepository,
          useValue: createPriceListRepositoryMock(),
        },
        {
          provide: PriceListConditionRepository,
          useValue: createPriceListConditionRepositoryMock(),
        },
        {
          provide: TaxClassRepository,
          useValue: createTaxClassRepositoryMock(),
        },
        {
          provide: ProductPriceRepository,
          useValue: createProductPriceRepositoryMock(),
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<PriceListsService>(PriceListsService);
    priceListRepository = module.get(PriceListRepository);
    priceListConditionRepository = module.get(PriceListConditionRepository);
    taxClassRepository = module.get(TaxClassRepository);
    productPriceRepository = module.get(ProductPriceRepository);
    productsService = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPriceLists', () => {
    it('should return all price lists for an organization', async () => {
      priceListRepository.findAllWithConditions.mockResolvedValue(
        mockPriceListsWithConditions,
      );

      const result = await service.getPriceLists('1');

      expect(result).toEqual({
        priceLists: mockPriceListsWithConditions.map((pl) => ({
          ...pl,
          isActive: pl.status === 'active',
          hasTaxMode: !!pl.pricingTaxMode,
        })),
      });
      expect(priceListRepository.findAllWithConditions).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('should filter by status when provided', async () => {
      priceListRepository.findAllWithConditions.mockResolvedValue([
        mockPriceListWithConditions,
      ]);

      const result = await service.getPriceLists('1', { status: 'active' });

      expect(result.priceLists).toHaveLength(1);
      expect(priceListRepository.findAllWithConditions).toHaveBeenCalledWith(
        1,
        { status: 'active' },
      );
    });

    it('should transform price lists with isActive and hasTaxMode', async () => {
      priceListRepository.findAllWithConditions.mockResolvedValue([
        mockPriceListWithConditions,
        {
          ...mockPriceList2,
          conditions: [],
        },
      ]);

      const result = await service.getPriceLists('1');

      expect((result.priceLists[0] as any).isActive).toBe(true);
      expect((result.priceLists[0] as any).hasTaxMode).toBe(true);
      expect((result.priceLists[1] as any).isActive).toBe(true);
      expect((result.priceLists[1] as any).hasTaxMode).toBe(true);
    });
  });

  describe('getPriceListById', () => {
    it('should return a price list by id', async () => {
      priceListRepository.findByIdWithConditions.mockResolvedValue(
        mockPriceListWithConditions,
      );

      const result = await service.getPriceListById('1', '1');

      expect(result).toEqual(
        expect.objectContaining({
          ...mockPriceListWithConditions,
          isActive: true,
          hasTaxMode: true,
        }),
      );
      expect(priceListRepository.findByIdWithConditions).toHaveBeenCalledWith(
        1,
        1,
      );
    });

    it('should throw NotFoundException when price list not found', async () => {
      priceListRepository.findByIdWithConditions.mockResolvedValue(null);

      await expect(service.getPriceListById('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPriceListById('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });
  });

  describe('createPriceList', () => {
    it('should create a new price list', async () => {
      const newPriceList = {
        ...mockPriceList,
        id: 4,
        name: mockCreatePriceListDto.name,
      };
      priceListRepository.create.mockResolvedValue(newPriceList);

      const result = await service.createPriceList(
        mockCreatePriceListDto,
        '1',
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...newPriceList,
          conditions: [],
          isActive: true,
          hasTaxMode: true,
        }),
      );
      expect(priceListRepository.create).toHaveBeenCalledWith({
        organizationId: 1,
        name: mockCreatePriceListDto.name,
        currency: mockCreatePriceListDto.currency,
        isDefault: mockCreatePriceListDto.isDefault,
        status: mockCreatePriceListDto.status,
        pricingTaxMode: mockCreatePriceListDto.pricingTaxMode,
      });
    });

    it('should use default values when optional fields are not provided', async () => {
      const dtoWithoutOptional = {
        name: 'Test List',
        currency: 'CLP',
      };
      const newPriceList = {
        ...mockPriceList,
        id: 4,
        name: dtoWithoutOptional.name,
        currency: 'CLP',
        isDefault: false,
        status: 'active',
        pricingTaxMode: 'tax_included',
      };
      priceListRepository.create.mockResolvedValue(newPriceList);

      await service.createPriceList(dtoWithoutOptional as any, '1');

      expect(priceListRepository.create).toHaveBeenCalledWith({
        organizationId: 1,
        name: dtoWithoutOptional.name,
        currency: 'CLP',
        isDefault: false,
        status: 'active',
        pricingTaxMode: 'tax_included',
      });
    });
  });

  describe('updatePriceList', () => {
    it('should update a price list', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      priceListRepository.update.mockResolvedValue({
        ...mockPriceList,
        ...mockUpdatePriceListDto,
      });
      priceListRepository.findByIdWithConditions.mockResolvedValue({
        ...mockPriceList,
        ...mockUpdatePriceListDto,
        conditions: [],
      });

      const result = await service.updatePriceList('1', mockUpdatePriceListDto, '1');

      expect(priceListRepository.findById).toHaveBeenCalledWith(1, 1);
      expect(priceListRepository.update).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          name: mockUpdatePriceListDto.name,
          currency: mockUpdatePriceListDto.currency,
          isDefault: mockUpdatePriceListDto.isDefault,
          status: mockUpdatePriceListDto.status,
          pricingTaxMode: mockUpdatePriceListDto.pricingTaxMode,
        }),
      );
    });

    it('should throw NotFoundException when price list not found', async () => {
      priceListRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePriceList('999', mockUpdatePriceListDto, '1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updatePriceList('999', mockUpdatePriceListDto, '1'),
      ).rejects.toThrow('Price list with ID 999 not found');
    });

    it('should prevent removing default status if it is the only default list', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      priceListRepository.findAll.mockResolvedValue([mockPriceList]);

      await expect(
        service.updatePriceList('1', { isDefault: false }, '1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updatePriceList('1', { isDefault: false }, '1'),
      ).rejects.toThrow(
        'No se puede quitar el estado por defecto. Debe existir al menos una lista de precios por defecto.',
      );
    });

    it('should allow removing default status if there are other default lists', async () => {
      const defaultList1 = { ...mockPriceList, id: 1 };
      const defaultList2 = { ...mockPriceList2, id: 2, isDefault: true };
      priceListRepository.findById.mockResolvedValue(defaultList1);
      priceListRepository.findAll.mockResolvedValue([
        defaultList1,
        defaultList2,
      ]);
      priceListRepository.update.mockResolvedValue({
        ...defaultList1,
        isDefault: false,
      });
      priceListRepository.findByIdWithConditions.mockResolvedValue({
        ...defaultList1,
        isDefault: false,
        conditions: [],
      });

      await service.updatePriceList('1', { isDefault: false }, '1');

      expect(priceListRepository.update).toHaveBeenCalled();
    });

    it('should set another list as default when setting isDefault to true', async () => {
      const currentDefault = { ...mockPriceList, id: 1 };
      const newDefault = { ...mockPriceList2, id: 2, isDefault: false };
      priceListRepository.findById.mockResolvedValue(newDefault);
      priceListRepository.findDefault.mockResolvedValue(currentDefault);
      priceListRepository.update.mockResolvedValue({
        ...newDefault,
        isDefault: true,
      });
      priceListRepository.findByIdWithConditions.mockResolvedValue({
        ...newDefault,
        isDefault: true,
        conditions: [],
      });

      await service.updatePriceList('2', { isDefault: true }, '1');

      expect(priceListRepository.findDefault).toHaveBeenCalledWith(1);
      expect(priceListRepository.update).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({ isDefault: false }),
      );
      expect(priceListRepository.update).toHaveBeenCalledWith(
        2,
        1,
        expect.objectContaining({ isDefault: true }),
      );
    });

    it('should only update provided fields', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      priceListRepository.update.mockResolvedValue({
        ...mockPriceList,
        name: 'Updated Name',
      });
      priceListRepository.findByIdWithConditions.mockResolvedValue({
        ...mockPriceList,
        name: 'Updated Name',
        conditions: [],
      });

      await service.updatePriceList('1', { name: 'Updated Name' }, '1');

      expect(priceListRepository.update).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          name: 'Updated Name',
        }),
      );
    });
  });

  describe('deletePriceList', () => {
    it('should delete a price list', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList2);
      priceListRepository.delete.mockResolvedValue(true);

      await service.deletePriceList('2', '1');

      expect(priceListRepository.findById).toHaveBeenCalledWith(2, 1);
      expect(priceListRepository.delete).toHaveBeenCalledWith(2, 1);
    });

    it('should throw NotFoundException when price list not found', async () => {
      priceListRepository.findById.mockResolvedValue(null);

      await expect(service.deletePriceList('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deletePriceList('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });

    it('should throw BadRequestException when trying to delete default price list', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);

      await expect(service.deletePriceList('1', '1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deletePriceList('1', '1')).rejects.toThrow(
        'No se puede eliminar la lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
      );
    });

    it('should throw NotFoundException when delete fails', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList2);
      priceListRepository.delete.mockResolvedValue(false);

      await expect(service.deletePriceList('2', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deletePriceList('2', '1')).rejects.toThrow(
        'Price list with ID 2 not found',
      );
    });
  });

  describe('getPriceListProducts', () => {
    // Reuse existing product mock and adapt it for this test
    const mockProduct = {
      ...mockProductWithPricesAndMedia,
      name: 'Producto Test',
      sku: 'PROD-001',
      description: 'Descripción del producto',
    };

    it('should return products with prices for a price list', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [mockProductPrice],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      productsService.getProductsByIds.mockResolvedValue([mockProduct]);

      const result = await service.getPriceListProducts('1', '1');

      expect(result).toEqual({
        products: [
          {
            id: mockProduct.id,
            name: mockProduct.name,
            sku: mockProduct.sku,
            description: mockProduct.description,
            imageUrl: mockProduct.media[0].url,
            price: {
              id: mockProductPrice.id,
              amount: mockProductPrice.amount,
              currency: mockProductPrice.currency,
              taxIncluded: mockProductPrice.taxIncluded,
              validFrom: mockProductPrice.validFrom,
              validTo: mockProductPrice.validTo,
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(priceListRepository.findById).toHaveBeenCalledWith(1, 1);
      expect(productPriceRepository.findByPriceListIdPaginated).toHaveBeenCalledWith(
        1,
        1,
        1,
        20,
        undefined,
      );
      expect(productsService.getProductsByIds).toHaveBeenCalledWith([1], '1');
    });

    it('should return empty products array when no prices found', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const result = await service.getPriceListProducts('1', '1');

      expect(result).toEqual(mockEmptyProductPricesResponse);
      expect(productsService.getProductsByIds).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when price list not found', async () => {
      priceListRepository.findById.mockResolvedValue(null);

      await expect(service.getPriceListProducts('999', '1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPriceListProducts('999', '1')).rejects.toThrow(
        'Price list with ID 999 not found',
      );
    });

    it('should handle pagination parameters', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });

      await service.getPriceListProducts('1', '1', 2, 10);

      expect(productPriceRepository.findByPriceListIdPaginated).toHaveBeenCalledWith(
        1,
        1,
        2,
        10,
        undefined,
      );
    });

    it('should handle search parameter', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getPriceListProducts('1', '1', 1, 20, 'laptop');

      expect(productPriceRepository.findByPriceListIdPaginated).toHaveBeenCalledWith(
        1,
        1,
        1,
        20,
        'laptop',
      );
    });

    it('should validate and clamp pagination parameters', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0,
      });

      await service.getPriceListProducts('1', '1', 0, 200);

      expect(productPriceRepository.findByPriceListIdPaginated).toHaveBeenCalledWith(
        1,
        1,
        1, // page clamped to 1
        100, // limit clamped to 100
        undefined,
      );
    });

    it('should use primary image or first image for product', async () => {
      const productWithMultipleImages = {
        ...mockProduct,
        media: [
          {
            id: 2,
            type: 'image',
            url: 'https://example.com/secondary.jpg',
            position: 1,
            alt_text: null,
            title: null,
            description: null,
            file_size: null,
            mime_type: 'image/jpeg',
            is_primary: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 1,
            type: 'image',
            url: 'https://example.com/primary.jpg',
            position: 0,
            alt_text: null,
            title: null,
            description: null,
            file_size: null,
            mime_type: 'image/jpeg',
            is_primary: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [mockProductPrice],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      productsService.getProductsByIds.mockResolvedValue([
        productWithMultipleImages,
      ]);

      const result = await service.getPriceListProducts('1', '1');

      expect(result.products[0].imageUrl).toBe(
        'https://example.com/primary.jpg',
      );
    });

    it('should handle products without images', async () => {
      const productWithoutImages = {
        ...mockProduct,
        media: [],
      };

      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [mockProductPrice],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      productsService.getProductsByIds.mockResolvedValue([
        productWithoutImages,
      ]);

      const result = await service.getPriceListProducts('1', '1');

      expect(result.products[0].imageUrl).toBeNull();
    });

    it('should handle products without prices', async () => {
      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [mockProductPrice],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      productsService.getProductsByIds.mockResolvedValue([mockProduct]);

      const result = await service.getPriceListProducts('1', '1');

      // Product should have price from priceMap
      expect(result.products[0].price).not.toBeNull();
    });

    it('should handle multiple products with unique product IDs', async () => {
      const productPrice1 = { ...mockProductPrice, id: 1, productId: 1 };
      const productPrice2 = { ...mockProductPrice, id: 2, productId: 2 };
      const product1 = { ...mockProduct, id: 1 };
      const product2 = { ...mockProduct, id: 2, name: 'Product 2' };

      priceListRepository.findById.mockResolvedValue(mockPriceList);
      productPriceRepository.findByPriceListIdPaginated.mockResolvedValue({
        data: [productPrice1, productPrice2],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      productsService.getProductsByIds.mockResolvedValue([
        product1,
        product2,
      ]);

      const result = await service.getPriceListProducts('1', '1');

      expect(result.products).toHaveLength(2);
      expect(productsService.getProductsByIds).toHaveBeenCalledWith([1, 2], '1');
    });
  });
});

