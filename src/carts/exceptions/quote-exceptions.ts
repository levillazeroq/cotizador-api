import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Price Change Details Interface
 */
export interface PriceChange {
  itemId: string;
  productId: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  difference: number;
  percentageChange: number;
}

/**
 * Price Validation Result Interface
 */
export interface PriceValidationResult {
  isValid: boolean;
  changes: PriceChange[];
  totalOldPrice: number;
  totalNewPrice: number;
  totalDifference: number;
  totalPercentageChange: number;
}

/**
 * Exception thrown when quote prices have changed significantly
 */
export class PriceChangedException extends HttpException {
  constructor(
    public readonly validation: PriceValidationResult,
    public readonly requiresCustomerApproval: boolean = true,
  ) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'PriceChanged',
        message: 'Los precios han cambiado desde la cotización original',
        validation,
        requiresCustomerApproval,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Exception thrown when quote has expired
 */
export class QuoteExpiredException extends HttpException {
  constructor(
    public readonly cartId: string,
    public readonly validUntil: Date,
  ) {
    super(
      {
        statusCode: HttpStatus.GONE,
        error: 'QuoteExpired',
        message: 'Esta cotización ha expirado. Por favor, solicite una nueva cotización.',
        cartId,
        validUntil,
      },
      HttpStatus.GONE,
    );
  }
}

/**
 * Exception thrown when product is not found during validation
 */
export class ProductNotFoundException extends HttpException {
  constructor(public readonly productId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'ProductNotFound',
        message: `El producto con ID ${productId} no fue encontrado`,
        productId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Exception thrown when trying to pay for a quote that's not active
 */
export class InvalidQuoteStatusException extends HttpException {
  constructor(
    public readonly cartId: string,
    public readonly currentStatus: string,
    public readonly expectedStatus: string,
  ) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'InvalidQuoteStatus',
        message: `La cotización está en estado '${currentStatus}', se esperaba '${expectedStatus}'`,
        cartId,
        currentStatus,
        expectedStatus,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

