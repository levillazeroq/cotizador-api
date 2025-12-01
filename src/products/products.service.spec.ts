import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductRelationRepository } from './repositories/product-relation.repository';
import { DatabaseService } from '../database/database.service';
import {
  mockProduct,
  mockProductWithPricesAndMedia,
  mockDbProducts,
  mockRelatedProduct,
  mockRelation,
  mockProductMedia,
} from './__mocks__/product.mocks';
import {
  createProductRepositoryMock,
  createProductMediaRepositoryMock,
  createProductRelationRepositoryMock,
} from './__mocks__/product-repository.mocks';
import { createMockDatabaseService } from './__mocks__/database.mocks';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<ProductRepository>;
  let productMediaRepository: jest.Mocked<ProductMediaRepository>;
  let productRelationRepository: jest.Mocked<ProductRelationRepository>;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: createProductRepositoryMock(),
        },
        {
          provide: ProductMediaRepository,
          useValue: createProductMediaRepositoryMock(),
        },
        {
          provide: ProductRelationRepository,
          useValue: createProductRelationRepositoryMock(),
        },
        {
          provide: DatabaseService,
          useValue: createMockDatabaseService(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(ProductRepository);
    productMediaRepository = module.get(ProductMediaRepository);
    productRelationRepository = module.get(ProductRelationRepository);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      productRepository.findById.mockResolvedValue(mockProductWithPricesAndMedia);

      const result = await service.getProductById(1, '1');

      expect(result).toEqual(mockProductWithPricesAndMedia);
      expect(productRepository.findById).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.getProductById(1, '1')).rejects.toThrow(NotFoundException);
      expect(productRepository.findById).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getRelatedProducts', () => {

    beforeEach(() => {
      productRepository.findById.mockResolvedValue(mockProductWithPricesAndMedia);
      productRelationRepository.findRelatedProducts.mockResolvedValue([mockRelation]);
      productMediaRepository.findByProductIds.mockResolvedValue([]);

      // Mock database queries - need to handle multiple calls to select()
      let selectCallCount = 0;
      (databaseService.db.select as jest.Mock) = jest.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First call: prices query - returns array directly
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          };
        } else {
          // Second call: inventory query with select object
          return {
            from: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          };
        }
      });
    });

    it('should return related products with prices and inventory', async () => {
      const result = await service.getRelatedProducts(1, '1', 'related', 10);

      expect(result).toBeInstanceOf(Array);
      expect(productRepository.findById).toHaveBeenCalledWith(1, 1);
      expect(productRelationRepository.findRelatedProducts).toHaveBeenCalledWith(
        1,
        1,
        'related',
        10,
      );
    });

    it('should throw NotFoundException when base product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.getRelatedProducts(1, '1')).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when no relations found', async () => {
      productRepository.findById.mockResolvedValue(mockProductWithPricesAndMedia);
      productRelationRepository.findRelatedProducts.mockResolvedValue([]);

      const result = await service.getRelatedProducts(1, '1');

      expect(result).toEqual([]);
    });

    it('should handle undefined relationType', async () => {
      productRepository.findById.mockResolvedValue(mockProductWithPricesAndMedia);
      productRelationRepository.findRelatedProducts.mockResolvedValue([mockRelation]);
      productMediaRepository.findByProductIds.mockResolvedValue([]);

      // Mock database queries - need to handle multiple calls to select()
      let selectCallCount = 0;
      (databaseService.db.select as jest.Mock) = jest.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First call: prices query - returns array directly
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          };
        } else {
          // Second call: inventory query with select object
          return {
            from: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          };
        }
      });

      await service.getRelatedProducts(1, '1', undefined, 10);

      expect(productRelationRepository.findRelatedProducts).toHaveBeenCalledWith(
        1,
        1,
        undefined,
        10,
      );
    });
  });

  describe('getProducts', () => {

    beforeEach(() => {
      productRepository.count.mockResolvedValue(2);
      productRepository.findMany.mockResolvedValue(mockDbProducts);
      productMediaRepository.findByProductIds.mockResolvedValue([]);
    });

    it('should return paginated products', async () => {
      const result = await service.getProducts('1', { page: '1', limit: '20' });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(productRepository.count).toHaveBeenCalled();
      expect(productRepository.findMany).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      await service.getProducts('1', {
        status: 'active',
        productType: 'simple',
        search: 'test',
        brand: 'Test Brand',
      });

      expect(productRepository.count).toHaveBeenCalled();
      expect(productRepository.findMany).toHaveBeenCalled();
    });

    it('should include media when requested', async () => {
      productMediaRepository.findByProductIds.mockResolvedValue([mockProductMedia]);

      const result = await service.getProducts('1', { include: 'media' });

      expect(productMediaRepository.findByProductIds).toHaveBeenCalled();
      expect(result.data[0].media).toBeDefined();
    });

    it('should handle ids filter as array', async () => {
      await service.getProducts('1', { ids: ['1', '2'] });

      expect(productRepository.count).toHaveBeenCalled();
    });

    it('should handle ids filter as comma-separated string', async () => {
      await service.getProducts('1', { ids: '1,2' });

      expect(productRepository.count).toHaveBeenCalled();
    });

    it('should use default pagination when not provided', async () => {
      await service.getProducts('1');

      expect(productRepository.findMany).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          limit: 20,
          offset: 0,
        }),
      );
    });

    it('should limit max page size to 100', async () => {
      await service.getProducts('1', { limit: '200' });

      expect(productRepository.findMany).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          limit: 100,
        }),
      );
    });
  });

  describe('getProductsByIds', () => {

    beforeEach(() => {
      productRepository.findByIds.mockResolvedValue(mockDbProducts);
      productMediaRepository.findByProductIds.mockResolvedValue([]);
    });

    it('should return products by ids', async () => {
      const result = await service.getProductsByIds([1, 2], '1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(productRepository.findByIds).toHaveBeenCalledWith([1, 2], 1);
    });

    it('should include media for products', async () => {
      productMediaRepository.findByProductIds.mockResolvedValue([mockProductMedia]);

      const result = await service.getProductsByIds([1], '1');

      expect(result[0].media).toBeDefined();
      expect(productMediaRepository.findByProductIds).toHaveBeenCalledWith([1], 1);
    });
  });

  describe('getRandomProducts', () => {

    beforeEach(() => {
      productMediaRepository.findByProductIds.mockResolvedValue([]);

      // Make select return different results based on call order
      let callCount = 0;
      (databaseService.db.select as jest.Mock) = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: products
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockDbProducts),
                }),
              }),
            }),
          };
        } else if (callCount === 2) {
          // Second call: prices
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          };
        } else {
          // Third call: inventory
          return {
            from: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          };
        }
      });
    });

    it('should return random products with prices and inventory', async () => {
      const result = await service.getRandomProducts('1', 10);

      expect(result).toBeInstanceOf(Array);
      expect(databaseService.db.select).toHaveBeenCalled();
    });

    it('should return empty array when no products found', async () => {
      (databaseService.db.select as jest.Mock) = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await service.getRandomProducts('1', 10);

      expect(result).toEqual([]);
    });

    it('should use default limit of 10', async () => {
      await service.getRandomProducts('1');

      expect(databaseService.db.select).toHaveBeenCalled();
    });
  });

  describe('post', () => {
    const createDto = {
      sku: 'SKU-003',
      name: 'New Product',
      description: 'New Description',
      productType: 'simple',
      status: 'active',
    };

    const createdProduct = {
      id: 3,
      organizationId: 1,
      ...createDto,
      externalSku: null,
      externalName: null,
      unitOfMeasure: null,
      brand: null,
      model: null,
      taxClassId: null,
      weight: null,
      height: null,
      width: null,
      length: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a product', async () => {
      productRepository.create.mockResolvedValue(createdProduct);

      const result = await service.post('/products', createDto, '1');

      expect(result).toBeDefined();
      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 1,
          sku: createDto.sku,
          name: createDto.name,
        }),
      );
    });

    it('should throw error for unsupported URL', async () => {
      await expect(service.post('/invalid', createDto, '1')).rejects.toThrow(
        'Unsupported POST URL: /invalid',
      );
    });
  });

  describe('put', () => {
    const updateDto = {
      name: 'Updated Product',
      description: 'Updated Description',
    };

    const updatedProduct = {
      id: 1,
      organizationId: 1,
      sku: 'SKU-001',
      externalSku: 'EXT-001',
      externalName: 'External Product',
      ...updateDto,
      productType: 'simple',
      status: 'active',
      unitOfMeasure: 'unit',
      brand: 'Test Brand',
      model: 'Model-001',
      taxClassId: 1,
      weight: '1.5',
      height: '10',
      width: '20',
      length: '30',
      metadata: { size: 'M', color: 'blue' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a product', async () => {
      productRepository.update.mockResolvedValue(updatedProduct);

      const result = await service.put('/products/1', updateDto, '1');

      expect(result).toBeDefined();
      expect(productRepository.update).toHaveBeenCalledWith(1, 1, updateDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.update.mockResolvedValue(null);

      await expect(service.put('/products/1', updateDto, '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for unsupported URL', async () => {
      await expect(service.put('/invalid', updateDto, '1')).rejects.toThrow(
        'Unsupported PUT URL: /invalid',
      );
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      productRepository.delete.mockResolvedValue(true);

      const result = await service.delete('/products/1', '1');

      expect(result).toEqual({});
      expect(productRepository.delete).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.delete.mockResolvedValue(false);

      await expect(service.delete('/products/1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw error for unsupported URL', async () => {
      await expect(service.delete('/invalid', '1')).rejects.toThrow(
        'Unsupported DELETE URL: /invalid',
      );
    });
  });

  describe('get', () => {
    const mockDbProductForGet = {
      id: 1,
      organizationId: 1,
      sku: 'SKU-001',
      externalSku: 'EXT-001',
      externalName: 'External Product',
      name: 'Test Product',
      description: 'Test Description',
      productType: 'simple',
      status: 'active',
      unitOfMeasure: 'unit',
      brand: 'Test Brand',
      model: 'Model-001',
      taxClassId: 1,
      weight: '1.5',
      height: '10',
      width: '20',
      length: '30',
      metadata: { size: 'M', color: 'blue' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      productRepository.findById.mockResolvedValue(mockProductWithPricesAndMedia);
      productRepository.findMany.mockResolvedValue([mockDbProductForGet]);
      productRepository.count.mockResolvedValue(1);
      productMediaRepository.findByProductIds.mockResolvedValue([]);
    });

    it('should get products list', async () => {
      const result = await service.get('/products', {}, '1');

      expect(result).toBeDefined();
      expect(productRepository.findMany).toHaveBeenCalled();
    });

    it('should get product by id', async () => {
      const result = await service.get('/products/1', {}, '1');

      expect(result).toEqual(mockProductWithPricesAndMedia);
      expect(productRepository.findById).toHaveBeenCalledWith(1, 1);
    });

    it('should throw error for unsupported URL', async () => {
      await expect(service.get('/invalid', {}, '1')).rejects.toThrow(
        'Unsupported URL: /invalid',
      );
    });
  });

  describe('upload', () => {
    it('should throw error as not implemented', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      await expect(service.upload('/products/upload', formData, '1')).rejects.toThrow(
        'File upload not implemented yet',
      );
    });
  });
});

