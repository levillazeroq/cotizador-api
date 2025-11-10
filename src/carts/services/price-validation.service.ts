import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '../cart.repository';
import { ProductsService } from '../../products/products.service';
import { QUOTE_CONFIG, CartStatus } from '../config/quote.config';
import {
  PriceChange,
  PriceValidationResult,
  PriceChangedException,
  QuoteExpiredException,
  ProductNotFoundException,
  InvalidQuoteStatusException,
} from '../exceptions/quote-exceptions';
import { Cart, CartItemRecord } from '../../database/schemas';

@Injectable()
export class PriceValidationService {
  private readonly logger = new Logger(PriceValidationService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Validates if a quote is still valid (not expired)
   */
  async validateQuoteExpiration(cart: Cart): Promise<void> {
    // If cart doesn't have a validUntil date, it's considered valid
    if (!cart.validUntil) {
      return;
    }

    const now = new Date();
    const validUntil = new Date(cart.validUntil);

    if (now > validUntil) {
      // Update status to expired
      await this.cartRepository.update(cart.id, {
        status: CartStatus.EXPIRED,
      });

      if (!QUOTE_CONFIG.allowExpiredQuotes) {
        throw new QuoteExpiredException(cart.id, validUntil);
      }
    }
  }

  /**
   * Validates if cart status allows payment
   */
  validateQuoteStatus(cart: Cart): void {
    const allowedStatuses = [CartStatus.ACTIVE, CartStatus.DRAFT];
    
    if (!allowedStatuses.includes(cart.status as CartStatus)) {
      throw new InvalidQuoteStatusException(
        cart.id,
        cart.status,
        'active or draft',
      );
    }
  }

  /**
   * Validates cart prices against current product prices
   */
  async validateCartPrices(cartId: string): Promise<PriceValidationResult> {
    this.logger.log(`Validating prices for cart ${cartId}`);

    const cart = await this.cartRepository.findByIdWithItems(cartId);
    
    if (!cart) {
      throw new ProductNotFoundException(cartId);
    }

    const changes: PriceChange[] = [];
    let totalNewPrice = 0;

    // Check each item's price
    for (const item of cart.items) {
      try {
        // Fetch current product price
        const currentProduct = await this.productsService.get(
          `/products/${item.productId}`,
        );

        const currentPrice = parseFloat(currentProduct.price.amount);
        const snapshotPrice = parseFloat(item.price as string);

        // Calculate new total for this item
        totalNewPrice += currentPrice * item.quantity;

        // Check if price changed
        if (currentPrice !== snapshotPrice) {
          const difference = currentPrice - snapshotPrice;
          const percentageChange = ((currentPrice - snapshotPrice) / snapshotPrice) * 100;

          changes.push({
            itemId: item.id,
            productId: item.productId,
            name: item.name,
            oldPrice: snapshotPrice,
            newPrice: currentPrice,
            difference: Number(difference.toFixed(2)),
            percentageChange: Number(percentageChange.toFixed(2)),
          });

          this.logger.log(
            `Price change detected for ${item.name}: ${snapshotPrice} -> ${currentPrice} (${percentageChange.toFixed(2)}%)`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error fetching product ${item.productId}: ${error.message}`,
        );
        // If product not found, consider it a major change
        throw new ProductNotFoundException(item.productId);
      }
    }

    const totalOldPrice = parseFloat(cart.totalPrice as string);
    const totalDifference = totalNewPrice - totalOldPrice;
    const totalPercentageChange = (totalDifference / totalOldPrice) * 100;

    const result: PriceValidationResult = {
      isValid: changes.length === 0,
      changes,
      totalOldPrice,
      totalNewPrice: Number(totalNewPrice.toFixed(2)),
      totalDifference: Number(totalDifference.toFixed(2)),
      totalPercentageChange: Number(totalPercentageChange.toFixed(2)),
    };

    this.logger.log(
      `Price validation result: ${result.isValid ? 'Valid' : `${changes.length} changes detected`}`,
    );

    return result;
  }

  /**
   * Determines if price changes require customer approval
   */
  requiresApproval(validation: PriceValidationResult): boolean {
    // No changes = no approval needed
    if (validation.isValid) {
      return false;
    }

    const absPercentageChange = Math.abs(validation.totalPercentageChange);

    // If change is below threshold, no approval needed
    if (absPercentageChange < QUOTE_CONFIG.priceChangeThreshold) {
      return false;
    }

    // If price decreased and auto-apply is enabled, no approval needed
    if (
      validation.totalPercentageChange < 0 &&
      QUOTE_CONFIG.applyLowerPriceAutomatically
    ) {
      return false;
    }

    // If price increased beyond threshold, approval required
    if (
      validation.totalPercentageChange > QUOTE_CONFIG.priceChangeThreshold &&
      QUOTE_CONFIG.requiresApprovalOnIncrease
    ) {
      return true;
    }

    return false;
  }

  /**
   * Updates cart item prices to current product prices
   */
  async updateCartPrices(
    cartId: string,
    changes: PriceChange[],
  ): Promise<Cart> {
    this.logger.log(`Updating prices for cart ${cartId}`);

    // Update each item with new price
    for (const change of changes) {
      await this.cartRepository.updateCartItem(change.itemId, {
        price: change.newPrice.toString(),
      });
    }

    // Recalculate cart totals
    const totals = await this.cartRepository.calculateCartTotals(cartId);

    // Update cart with new totals and mark as validated
    const updatedCart = await this.cartRepository.update(cartId, {
      totalPrice: totals.totalPrice,
      priceValidatedAt: new Date(),
      priceChangeApproved: true,
      priceChangeApprovedAt: new Date(),
    });

    this.logger.log(`Cart ${cartId} prices updated successfully`);

    return updatedCart!;
  }

  /**
   * Complete pre-payment validation
   * Validates expiration, status, and prices
   */
  async validateBeforePayment(
    cartId: string,
  ): Promise<{
    cart: Cart & { items: CartItemRecord[] };
    validation: PriceValidationResult;
    requiresApproval: boolean;
  }> {
    this.logger.log(`Running pre-payment validation for cart ${cartId}`);

    const cart = await this.cartRepository.findByIdWithItems(cartId);

    if (!cart) {
      throw new ProductNotFoundException(cartId);
    }

    // 1. Check expiration
    await this.validateQuoteExpiration(cart);

    // 2. Check status
    this.validateQuoteStatus(cart);

    // 3. Validate prices
    const validation = await this.validateCartPrices(cartId);

    // 4. Determine if approval is needed
    const requiresApproval = this.requiresApproval(validation);

    // 5. If changes are minor and don't require approval, auto-update
    if (!validation.isValid && !requiresApproval) {
      this.logger.log(`Auto-updating prices for cart ${cartId} (below threshold)`);
      await this.updateCartPrices(cartId, validation.changes);
      
      // Re-fetch cart with updated prices
      const updatedCart = await this.cartRepository.findByIdWithItems(cartId);
      
      return {
        cart: updatedCart!,
        validation: { ...validation, isValid: true },
        requiresApproval: false,
      };
    }

    // 6. If approval required, throw exception
    if (requiresApproval) {
      throw new PriceChangedException(validation, true);
    }

    return {
      cart,
      validation,
      requiresApproval: false,
    };
  }

  /**
   * Sets quote as active with expiration date
   */
  async activateQuote(cartId: string): Promise<Cart> {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + QUOTE_CONFIG.validityDays);

    const cart = await this.cartRepository.findById(cartId);
    
    if (!cart) {
      throw new ProductNotFoundException(cartId);
    }

    // Store original total price if not already set
    const originalTotalPrice = cart.originalTotalPrice || cart.totalPrice;

    const updatedCart = await this.cartRepository.update(cartId, {
      status: CartStatus.ACTIVE,
      validUntil,
      originalTotalPrice,
    });

    this.logger.log(
      `Quote ${cartId} activated, valid until ${validUntil.toISOString()}`,
    );

    return updatedCart!;
  }
}

