import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  PriceListRepository,
  type PriceListWithConditions,
} from './repositories/price-list.repository';
import { PriceListConditionRepository } from './repositories/price-list-condition.repository';
import { TaxClassRepository } from './repositories/tax-class.repository';
import { type NewPriceList } from '../database/schemas';

export interface PriceListsResponse {
  priceLists: PriceListWithConditions[];
}

@Injectable()
export class PriceListsService {
  constructor(
    private readonly priceListRepository: PriceListRepository,
    private readonly priceListConditionRepository: PriceListConditionRepository,
    private readonly taxClassRepository: TaxClassRepository,
  ) {}

  async getPriceLists(
    organizationId: string,
    options?: { status?: string },
  ): Promise<PriceListsResponse> {
    const orgId = parseInt(organizationId, 10);
    
    const priceLists = await this.priceListRepository.findAllWithConditions(
      orgId,
      options,
    );

    // Transformar al formato esperado (agregar campos calculados si es necesario)
    const transformedPriceLists = priceLists.map((priceList) => ({
      ...priceList,
      isActive: priceList.status === 'active',
      hasTaxMode: !!priceList.pricingTaxMode,
    }));

    return {
      priceLists: transformedPriceLists,
    };
  }

  async getPriceListById(
    id: string,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    const priceList = await this.priceListRepository.findByIdWithConditions(
      priceListId,
      orgId,
    );

    if (!priceList) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    return {
      ...priceList,
      isActive: priceList.status === 'active',
      hasTaxMode: !!priceList.pricingTaxMode,
    } as any;
  }

  async createPriceList(
    data: any,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);

    const newPriceList: NewPriceList = {
      organizationId: orgId,
      name: data.name,
      currency: data.currency || 'CLP',
      isDefault: data.isDefault || false,
      status: data.status || 'active',
      pricingTaxMode: data.pricingTaxMode || 'tax_included',
    };

    const created = await this.priceListRepository.create(newPriceList);

    // Retornar con condiciones (vacías inicialmente)
    return {
      ...created,
      conditions: [],
      isActive: created.status === 'active',
      hasTaxMode: !!created.pricingTaxMode,
    } as any;
  }

  async updatePriceList(
    id: string,
    data: any,
    organizationId: string,
  ): Promise<PriceListWithConditions> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    // Verificar que existe
    const existing = await this.priceListRepository.findById(
      priceListId,
      orgId,
    );
    if (!existing) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    // Validar que siempre haya una lista por defecto
    if (data.isDefault === false && existing.isDefault) {
      // Verificar si hay otra lista por defecto
      const allPriceLists = await this.priceListRepository.findAll(orgId);
      
      // Contar cuántas listas por defecto hay
      const defaultCount = allPriceLists.filter(pl => pl.isDefault).length;
      
      // Si solo hay una por defecto y es la actual, no se puede cambiar
      if (defaultCount === 1) {
        throw new BadRequestException(
          'No se puede quitar el estado por defecto. Debe existir al menos una lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
        );
      }
    }

    // Si se está estableciendo como por defecto, quitar el default de las demás
    if (data.isDefault === true && !existing.isDefault) {
      // Buscar la lista por defecto actual y quitarle el flag
      const currentDefault = await this.priceListRepository.findDefault(orgId);
      if (currentDefault && currentDefault.id !== priceListId) {
        await this.priceListRepository.update(currentDefault.id, orgId, {
          isDefault: false,
        });
      }
    }

    const updateData: Partial<NewPriceList> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pricingTaxMode !== undefined)
      updateData.pricingTaxMode = data.pricingTaxMode;

    const updated = await this.priceListRepository.update(
      priceListId,
      orgId,
      updateData,
    );

    // Retornar con condiciones actualizadas
    return this.getPriceListById(id, organizationId);
  }

  async deletePriceList(id: string, organizationId: string): Promise<void> {
    const orgId = parseInt(organizationId, 10);
    const priceListId = parseInt(id, 10);

    // Verificar que existe
    const existing = await this.priceListRepository.findById(
      priceListId,
      orgId,
    );
    if (!existing) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    // Verificar que no es la lista por defecto
    if (existing.isDefault) {
      throw new BadRequestException(
        'No se puede eliminar la lista de precios por defecto. Por favor, establece otra lista como predeterminada primero.',
      );
    }

    const deleted = await this.priceListRepository.delete(priceListId, orgId);

    if (!deleted) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }
  }
}
