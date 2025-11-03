import { Injectable } from '@nestjs/common'
import { eq, desc, and } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { cartChangelog, NewCartChangelog, CartChangelog } from '../database/schemas'

@Injectable()
export class CartChangelogRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Crea un nuevo registro de changelog
   */
  async create(data: NewCartChangelog): Promise<CartChangelog> {
    const [changelog] = await this.db.db.insert(cartChangelog).values(data).returning()
    return changelog
  }

  /**
   * Obtiene todos los registros de changelog de un carrito específico
   */
  async findByCartId(cartId: string): Promise<CartChangelog[]> {
    return await this.db.db
      .select()
      .from(cartChangelog)
      .where(eq(cartChangelog.cartId, cartId))
      .orderBy(desc(cartChangelog.createdAt))
  }

  /**
   * Obtiene los últimos N registros de changelog de un carrito
   */
  async findLatestByCartId(cartId: string, limit: number = 10): Promise<CartChangelog[]> {
    return await this.db.db
      .select()
      .from(cartChangelog)
      .where(eq(cartChangelog.cartId, cartId))
      .orderBy(desc(cartChangelog.createdAt))
      .limit(limit)
  }

  /**
   * Obtiene el changelog filtrado por operación (add/remove)
   */
  async findByCartIdAndOperation(
    cartId: string,
    operation: 'add' | 'remove'
  ): Promise<CartChangelog[]> {
    return await this.db.db
      .select()
      .from(cartChangelog)
      .where(
        and(
          eq(cartChangelog.cartId, cartId),
          eq(cartChangelog.operation, operation)
        )
      )
      .orderBy(desc(cartChangelog.createdAt))
  }

  /**
   * Obtiene el changelog de un producto específico en un carrito
   */
  async findByCartIdAndProductId(
    cartId: string,
    productId: string
  ): Promise<CartChangelog[]> {
    return await this.db.db
      .select()
      .from(cartChangelog)
      .where(
        and(
          eq(cartChangelog.cartId, cartId),
          eq(cartChangelog.productId, productId)
        )
      )
      .orderBy(desc(cartChangelog.createdAt))
  }
}

