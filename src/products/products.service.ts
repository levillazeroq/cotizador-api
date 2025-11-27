import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { Product, ProductMedia as ProductMediaType } from './products.types';
import { products as productsSchema } from '../database/schemas';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMediaRepository: ProductMediaRepository,
  ) {}

  /**
   * Convierte media de la BD al formato ProductMedia esperado
   */
  private mapToProductMediaType(
    dbMedia: Array<{
      id: number;
      type: string;
      url: string;
      position: number;
      altText: string | null;
      title: string | null;
      description: string | null;
      fileSize: number | null;
      mimeType: string | null;
      isPrimary: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>,
  ): ProductMediaType[] {
    return dbMedia.map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
      position: m.position,
      alt_text: m.altText || null,
      title: m.title || null,
      description: m.description || null,
      file_size: m.fileSize || null,
      mime_type: m.mimeType || null,
      is_primary: m.isPrimary,
      created_at: m.createdAt.toISOString(),
      updated_at: m.updatedAt.toISOString(),
    }));
  }

  /**
   * Convierte un producto de la BD al formato Product esperado
   */
  private mapToProductType(
    dbProduct: typeof productsSchema.$inferSelect,
    includeMedia: boolean = false,
    media?: ProductMediaType[],
  ): Product {
    return {
      id: dbProduct.id,
      organizationId: dbProduct.organizationId,
      sku: dbProduct.sku,
      externalSku: dbProduct.externalSku || null,
      externalName: dbProduct.externalName || null,
      name: dbProduct.name,
      description: dbProduct.description || null,
      productType: dbProduct.productType,
      status: dbProduct.status,
      unitOfMeasure: dbProduct.unitOfMeasure || null,
      brand: dbProduct.brand || null,
      model: dbProduct.model || null,
      taxClassId: dbProduct.taxClassId || null,
      weight: dbProduct.weight || null,
      height: dbProduct.height || null,
      width: dbProduct.width || null,
      length: dbProduct.length || null,
      metadata: dbProduct.metadata || null,
      prices: [], // Se poblará si se necesita
      media: includeMedia && media ? media : [],
      inventory: [], // No hay tabla de inventory aún
    };
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(
    id: number,
    organizationId: string,
    params?: any,
  ): Promise<Product> {
    const orgId = parseInt(organizationId, 10);
    const product = await this.productRepository.findById(id, orgId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Verificar si se solicitan media
    const includeMedia = params?.include?.includes('media');
    let media: ProductMediaType[] = [];

    if (includeMedia) {
      const dbMedia = await this.productMediaRepository.findByProductId(
        id,
        orgId,
      );
      media = this.mapToProductMediaType(dbMedia);
    }

    const mappedProduct = this.mapToProductType(product, includeMedia, media);

    // Si se solicitan precios, obtenerlos
    if (params?.include?.includes('prices')) {
      // Obtener todos los precios del producto
      // Esto requeriría un método en ProductPriceRepository para obtener por productId
      // Por ahora retornamos el producto sin precios
    }

    return mappedProduct;
  }

  /**
   * Obtiene productos con filtros
   */
  async getProducts(organizationId: string, params?: any): Promise<Product[]> {
    const orgId = parseInt(organizationId, 10);
    
    const filters: any = {};
    
    if (params?.ids) {
      const ids = Array.isArray(params.ids) 
        ? params.ids.map((id: string) => parseInt(id, 10))
        : params.ids.split(',').map((id: string) => parseInt(id.trim(), 10));
      filters.ids = ids;
    }

    if (params?.status) {
      filters.status = params.status;
    }

    if (params?.productType) {
      filters.productType = params.productType;
    }

    if (params?.search) {
      filters.search = params.search;
    }

    if (params?.brand) {
      filters.brand = params.brand;
    }

    if (params?.limit) {
      filters.limit = parseInt(params.limit, 10);
    }

    if (params?.offset) {
      filters.offset = parseInt(params.offset, 10);
    }

    const dbProducts = await this.productRepository.findMany(orgId, filters);
    
    // Verificar si se solicitan media
    const includeMedia = params?.include?.includes('media');
    let mediaMap: Map<number, ProductMediaType[]> = new Map();

    if (includeMedia && dbProducts.length > 0) {
      const productIds = dbProducts.map((p) => p.id);
      const allMedia = await this.productMediaRepository.findByProductIds(
        productIds,
        orgId,
      );
      
      // Agrupar media por productId
      allMedia.forEach((m) => {
        const mediaArray = mediaMap.get(m.productId) || [];
        mediaArray.push({
          id: m.id,
          type: m.type,
          url: m.url,
          position: m.position,
          alt_text: m.altText || null,
          title: m.title || null,
          description: m.description || null,
          file_size: m.fileSize || null,
          mime_type: m.mimeType || null,
          is_primary: m.isPrimary,
          created_at: m.createdAt.toISOString(),
          updated_at: m.updatedAt.toISOString(),
        });
        mediaMap.set(m.productId, mediaArray);
      });
    }

    return dbProducts.map((p) => {
      const media = mediaMap.get(p.id) || [];
      return this.mapToProductType(p, includeMedia, media);
    });
  }

  /**
   * Obtiene productos por IDs
   */
  async getProductsByIds(
    ids: number[],
    organizationId: string,
  ): Promise<Product[]> {
    const orgId = parseInt(organizationId, 10);
    const dbProducts = await this.productRepository.findByIds(ids, orgId);
    
    // Obtener media para todos los productos
    let mediaMap: Map<number, ProductMediaType[]> = new Map();
    if (dbProducts.length > 0) {
      const allMedia = await this.productMediaRepository.findByProductIds(
        ids,
        orgId,
      );
      
      // Agrupar media por productId
      allMedia.forEach((m) => {
        const mediaArray = mediaMap.get(m.productId) || [];
        mediaArray.push({
          id: m.id,
          type: m.type,
          url: m.url,
          position: m.position,
          alt_text: m.altText || null,
          title: m.title || null,
          description: m.description || null,
          file_size: m.fileSize || null,
          mime_type: m.mimeType || null,
          is_primary: m.isPrimary,
          created_at: m.createdAt.toISOString(),
          updated_at: m.updatedAt.toISOString(),
        });
        mediaMap.set(m.productId, mediaArray);
      });
    }

    return dbProducts.map((p) => {
      const media = mediaMap.get(p.id) || [];
      return this.mapToProductType(p, true, media);
    });
  }

  /**
   * GET request - Mantenido por compatibilidad con código existente
   * @deprecated Usar métodos específicos en su lugar
   */
  async get<T = any>(
    url: string,
    params?: any,
    organizationId?: string,
  ): Promise<T> {
    // Si es /products, usar getProducts
    if (url === '/products' || url === 'products') {
      return (await this.getProducts(organizationId || '', params)) as T;
    }
    
    // Si es /products/:id, extraer el ID y usar getProductById
    const match = url.match(/\/products\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      return (await this.getProductById(id, organizationId || '', params)) as T;
    }

    throw new Error(`Unsupported URL: ${url}`);
  }

  /**
   * POST request - Crear producto
   */
  async post<T = any>(
    url: string,
    data?: any,
    organizationId?: string,
  ): Promise<T> {
    if (url === '/products' || url === 'products') {
      const orgId = parseInt(organizationId || '0', 10);
      const newProduct = await this.productRepository.create({
        organizationId: orgId,
        sku: data.sku,
        externalSku: data.externalSku || null,
        externalName: data.externalName || null,
        name: data.name,
        description: data.description || null,
        productType: data.productType || 'simple',
        status: data.status || 'active',
        unitOfMeasure: data.unitOfMeasure || null,
        brand: data.brand || null,
        model: data.model || null,
        taxClassId: data.taxClassId || null,
        weight: data.weight || null,
        height: data.height || null,
        width: data.width || null,
        length: data.length || null,
        metadata: data.metadata || null,
      });
      return this.mapToProductType(newProduct) as T;
    }

    throw new Error(`Unsupported POST URL: ${url}`);
  }

  /**
   * PUT request - Actualizar producto
   */
  async put<T = any>(
    url: string,
    data?: any,
    organizationId?: string,
  ): Promise<T> {
    const match = url.match(/\/products\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      const orgId = parseInt(organizationId || '0', 10);
      
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.productType !== undefined) updateData.productType = data.productType;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;

      const updated = await this.productRepository.update(id, orgId, updateData);
      if (!updated) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return this.mapToProductType(updated) as T;
    }

    throw new Error(`Unsupported PUT URL: ${url}`);
  }

  /**
   * DELETE request - Eliminar producto
   */
  async delete<T = any>(url: string, organizationId?: string): Promise<T> {
    const match = url.match(/\/products\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      const orgId = parseInt(organizationId || '0', 10);
      
      const deleted = await this.productRepository.delete(id, orgId);
      if (!deleted) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return {} as T;
    }

    throw new Error(`Unsupported DELETE URL: ${url}`);
  }

  /**
   * Upload file - No implementado aún
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    organizationId?: string,
  ): Promise<T> {
    throw new Error('File upload not implemented yet');
  }
}
