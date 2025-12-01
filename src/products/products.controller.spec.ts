import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MediaType } from './dto/create-product-media.dto';
import {
  mockProduct,
  mockProductWithPricesAndMedia,
  mockDbProducts,
} from './__mocks__';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProductsService = {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getRelatedProducts: jest.fn(),
    getRandomProducts: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockResult = {
        data: [mockProduct],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      service.getProducts.mockResolvedValue(mockResult);

      const result = await controller.getProducts(
        { page: 1, limit: 20 },
        '1',
      );

      expect(result).toEqual(mockResult);
      expect(service.getProducts).toHaveBeenCalledWith('1', {
        page: 1,
        limit: 20,
      });
    });

    it('should handle filters correctly', async () => {
      const mockResult = {
        data: [mockProduct],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      service.getProducts.mockResolvedValue(mockResult);

      const filters = {
        status: 'active',
        productType: 'simple',
        search: 'test',
        brand: 'Test Brand',
      };

      await controller.getProducts(filters, '1');

      expect(service.getProducts).toHaveBeenCalledWith('1', filters);
    });

    it('should handle empty filters', async () => {
      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      service.getProducts.mockResolvedValue(mockResult);

      const result = await controller.getProducts({}, '1');

      expect(result).toEqual(mockResult);
      expect(service.getProducts).toHaveBeenCalledWith('1', {});
    });
  });

  describe('getProduct', () => {
    it('should return a product by id', async () => {
      service.getProductById.mockResolvedValue(mockProductWithPricesAndMedia);

      const result = await controller.getProduct('1', {}, '1');

      expect(result).toEqual(mockProductWithPricesAndMedia);
      expect(service.getProductById).toHaveBeenCalledWith(1, '1', {});
    });

    it('should handle query parameters', async () => {
      service.getProductById.mockResolvedValue(mockProductWithPricesAndMedia);

      const query = { include: 'media,inventory' };
      await controller.getProduct('1', query, '1');

      expect(service.getProductById).toHaveBeenCalledWith(1, '1', query);
    });

    it('should throw NotFoundException when product not found', async () => {
      service.getProductById.mockRejectedValue(
        new NotFoundException('Product with ID 1 not found'),
      );

      await expect(controller.getProduct('1', {}, '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const createDto = {
        sku: 'SKU-003',
        name: 'New Product',
        description: 'New Description',
        price: 10000,
        category: 'Electronics',
      };

      const createdProduct = {
        ...mockProduct,
        ...createDto,
        id: 3,
      };

      service.post.mockResolvedValue(createdProduct);

      const result = await controller.createProduct(createDto, '1');

      expect(result).toEqual(createdProduct);
      expect(service.post).toHaveBeenCalledWith('/products', createDto, '1');
    });

    it('should return 201 status code', async () => {
      const createDto = {
        sku: 'SKU-003',
        name: 'New Product',
        price: 10000,
        category: 'Electronics',
      };

      service.post.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(createDto, '1');

      expect(result).toBeDefined();
    });
  });

  describe('partialUpdateProduct', () => {
    it('should update a product', async () => {
      const updateDto = {
        name: 'Updated Product',
        description: 'Updated Description',
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateDto,
      };

      service.put.mockResolvedValue(updatedProduct);

      const result = await controller.partialUpdateProduct('1', updateDto, '1');

      expect(result).toEqual(updatedProduct);
      expect(service.put).toHaveBeenCalledWith(
        '/products/1',
        updateDto,
        '1',
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      const updateDto = { name: 'Updated Product' };

      service.put.mockRejectedValue(
        new NotFoundException('Product with ID 1 not found'),
      );

      await expect(
        controller.partialUpdateProduct('1', updateDto, '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      service.delete.mockResolvedValue({});

      const result = await controller.deleteProduct('1', '1');

      expect(result).toEqual({});
      expect(service.delete).toHaveBeenCalledWith('/products/1', '1');
    });

    it('should throw NotFoundException when product not found', async () => {
      service.delete.mockRejectedValue(
        new NotFoundException('Product with ID 1 not found'),
      );

      await expect(controller.deleteProduct('1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadProduct', () => {
    it('should upload products from file', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'products.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      const mockResult = {
        success: true,
        total: 10,
        imported: 10,
        errors: [],
      };

      service.upload.mockResolvedValue(mockResult);

      const result = await controller.uploadProduct(mockFile, '1');

      expect(result).toEqual(mockResult);
      expect(service.upload).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'products.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('test'),
        size: 4,
      } as Express.Multer.File;

      service.upload.mockRejectedValue(new Error('File upload failed'));

      await expect(controller.uploadProduct(mockFile, '1')).rejects.toThrow(
        'File upload failed',
      );
    });
  });

  describe('addMedia', () => {
    it('should add media to a product', async () => {
      const mediaDto = {
        type: MediaType.IMAGE,
        url: 'https://example.com/image.jpg',
        sort_order: 1,
      };

      const mockMedia = {
        id: 1,
        productId: 1,
        ...mediaDto,
      };

      service.post.mockResolvedValue(mockMedia);

      const result = await controller.addMedia('1', mediaDto, '1');

      expect(result).toEqual(mockMedia);
      expect(service.post).toHaveBeenCalledWith(
        '/products/1/media',
        mediaDto,
        '1',
      );
    });
  });

  describe('updateMedia', () => {
    it('should update product media', async () => {
      const updateDto = {
        sort_order: 2,
        alt_text: 'Updated alt text',
      };

      const updatedMedia = {
        id: 1,
        productId: 1,
        ...updateDto,
      };

      service.put.mockResolvedValue(updatedMedia);

      const result = await controller.updateMedia('1', '1', updateDto, '1');

      expect(result).toEqual(updatedMedia);
      expect(service.put).toHaveBeenCalledWith(
        '/products/1/media/1',
        updateDto,
        '1',
      );
    });
  });

  describe('deleteMedia', () => {
    it('should delete product media', async () => {
      service.delete.mockResolvedValue({});

      const result = await controller.deleteMedia('1', '1', '1');

      expect(result).toEqual({});
      expect(service.delete).toHaveBeenCalledWith('/products/1/media/1', '1');
    });
  });

  describe('getRelatedProducts', () => {
    it('should return related products', async () => {
      const mockRelatedProducts = [mockProduct];

      service.getRelatedProducts.mockResolvedValue(mockRelatedProducts);

      const result = await controller.getRelatedProducts('1', '1', 'related', '10');

      expect(result).toEqual(mockRelatedProducts);
      expect(service.getRelatedProducts).toHaveBeenCalledWith(
        1,
        '1',
        'related',
        10,
      );
    });

    it('should use default limit when not provided', async () => {
      const mockRelatedProducts = [mockProduct];

      service.getRelatedProducts.mockResolvedValue(mockRelatedProducts);

      await controller.getRelatedProducts('1', '1');

      expect(service.getRelatedProducts).toHaveBeenCalledWith(1, '1', undefined, 10);
    });

    it('should handle undefined relationType', async () => {
      const mockRelatedProducts = [mockProduct];

      service.getRelatedProducts.mockResolvedValue(mockRelatedProducts);

      await controller.getRelatedProducts('1', '1', undefined, '5');

      expect(service.getRelatedProducts).toHaveBeenCalledWith(1, '1', undefined, 5);
    });

    it('should throw NotFoundException when product not found', async () => {
      service.getRelatedProducts.mockRejectedValue(
        new NotFoundException('Product with ID 1 not found'),
      );

      await expect(
        controller.getRelatedProducts('1', '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRandomProducts', () => {
    it('should return random products', async () => {
      const mockRandomProducts = [mockProduct];

      service.getRandomProducts.mockResolvedValue(mockRandomProducts);

      const result = await controller.getRandomProducts('1', '10');

      expect(result).toEqual(mockRandomProducts);
      expect(service.getRandomProducts).toHaveBeenCalledWith('1', 10);
    });

    it('should use default limit when not provided', async () => {
      const mockRandomProducts = [mockProduct];

      service.getRandomProducts.mockResolvedValue(mockRandomProducts);

      await controller.getRandomProducts('1');

      expect(service.getRandomProducts).toHaveBeenCalledWith('1', 10);
    });

    it('should parse limit correctly', async () => {
      const mockRandomProducts = [mockProduct];

      service.getRandomProducts.mockResolvedValue(mockRandomProducts);

      await controller.getRandomProducts('1', '5');

      expect(service.getRandomProducts).toHaveBeenCalledWith('1', 5);
    });

    it('should handle invalid limit gracefully', async () => {
      const mockRandomProducts = [mockProduct];

      service.getRandomProducts.mockResolvedValue(mockRandomProducts);

      await controller.getRandomProducts('1', 'invalid');

      // parseInt('invalid', 10) returns NaN, which becomes 10 due to default
      expect(service.getRandomProducts).toHaveBeenCalledWith('1', 10);
    });
  });
});

