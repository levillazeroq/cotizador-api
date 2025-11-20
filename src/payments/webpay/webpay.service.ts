import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateWebpayTransactionDto } from './dto/create-webpay-transaction.dto';
import { CommitWebpayTransactionDto } from './dto/commit-webpay-transaction.dto';
import {
  WebpayTransactionResponseDto,
  WebpayCommitResponseDto,
} from './dto/webpay-transaction-response.dto';
import { PaymentService } from '../payment.service';
import { OrganizationPaymentMethodRepository } from '../../organization/organization-payment-method.repository';

// Importar SDK de Transbank
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebpayPlus, TransactionDetail } = require('transbank-sdk');

@Injectable()
export class WebpayService {
  private readonly logger = new Logger(WebpayService.name);
  private readonly commerceCode: string;
  private readonly apiKey: string;
  private readonly childCommerceCode: string;
  private readonly environment: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly organizationPaymentMethodRepository: OrganizationPaymentMethodRepository,
  ) {
    // Cargar configuración desde variables de entorno
    this.commerceCode = this.configService.get<string>('WEBPAY_COMMERCE_CODE');
    this.apiKey = this.configService.get<string>('WEBPAY_API_KEY');
    // childCommerceCode ahora viene de la BD por organización
    this.childCommerceCode = null;
    this.environment =
      this.configService.get<string>('WEBPAY_ENVIRONMENT') || 'integration';
    this.baseUrl =
      this.configService.get<string>('WEBPAY_RETURN_BASE_URL')

    // Validar configuración básica al iniciar
    if (!this.commerceCode || !this.apiKey || !this.baseUrl || !this.environment) {
      this.logger.error('Configuración de Webpay incompleta');
      throw new Error('Configuración de Webpay incompleta');
    }

    this.logger.log(
      `WebpayService inicializado - Ambiente: ${this.environment}`,
    );
  }

  /**
   * Crea una instancia de MallTransaction según el ambiente configurado
   */
  private getMallTransaction() {
    if (this.environment === 'production') {
      return new WebpayPlus.MallTransaction(this.commerceCode, this.apiKey);
    } else {
      return WebpayPlus.MallTransaction.buildForIntegration(
        this.commerceCode,
        this.apiKey,
      );
    }
  }

  /**
   * Genera identificadores únicos para la transacción
   * Formato: prefix-cartIdSuffix (máximo 26 caracteres para Transbank)
   */
  private generateTransactionIdentifiers(
    cartId: string,
    prefix = 'zeroq',
  ): {
    buyOrder: string;
    sessionId: string;
    childBuyOrder: string;
  } {
    // Remover guiones del UUID
    const cartIdClean = cartId.replace(/-/g, '');

    // Calcular cuántos caracteres del UUID podemos usar
    // Total: prefix + guion (1) + suffix = 26 caracteres máximo
    const maxUuidChars = 26 - prefix.length - 1;

    if (maxUuidChars < 1) {
      throw new BadRequestException(
        `El prefix "${prefix}" es muy largo. Máximo 9 caracteres.`,
      );
    }

    const cartIdSuffix = cartIdClean.slice(-maxUuidChars);
    const identifier = `${prefix}-${cartIdSuffix}`;

    // Validar longitud
    if (identifier.length > 26) {
      throw new BadRequestException(
        `Identificador muy largo (${identifier.length} caracteres). Máximo 26.`,
      );
    }

    return {
      buyOrder: identifier,
      sessionId: identifier,
      childBuyOrder: identifier,
    };
  }

  /**
   * Crea una transacción en Webpay Plus Mall
   */
  async createTransaction(
    dto: CreateWebpayTransactionDto,
  ): Promise<WebpayTransactionResponseDto> {
    const { cartId, amount, organizationId } = dto;

    this.logger.log(
      `Creando transacción WebPay para cart ${cartId}, org ${organizationId}`,
    );

    try {
      // PASO 1: Obtener configuración de WebPay desde la BD
      const orgPaymentMethod =
        await this.organizationPaymentMethodRepository.findByOrganizationId(
          organizationId,
        );

      if (!orgPaymentMethod) {
        throw new NotFoundException(
          `No se encontró configuración de pagos para la organización ${organizationId}`,
        );
      }

      // Validar que WebPay esté activo
      if (!orgPaymentMethod.isWebPayActive) {
        throw new BadRequestException(
          `WebPay no está activo para la organización ${organizationId}`,
        );
      }

      // Validar que tenga configurado el child commerce code
      if (!orgPaymentMethod.webPayChildCommerceCode) {
        throw new BadRequestException(
          `La organización ${organizationId} no tiene configurado el código de comercio de WebPay`,
        );
      }

      const webPayPrefix = orgPaymentMethod.webPayPrefix || 'zeroq';
      const childCommerceCode = orgPaymentMethod.webPayChildCommerceCode;

      this.logger.debug(
        `WebPay config - Prefix: ${webPayPrefix}, Child Commerce: ${childCommerceCode}`,
      );

      // PASO 2: Generar identificadores únicos
      const { buyOrder, sessionId, childBuyOrder } =
        this.generateTransactionIdentifiers(cartId, webPayPrefix);

      this.logger.debug(`Buy Order: ${buyOrder}`);

      // PASO 3: Crear registro del pago en estado "pending" ANTES de ir a WebPay
      this.logger.log('Creando registro de pago en BD (status: pending)...');

      const payment = await this.paymentService.create({
        cartId,
        amount,
        paymentType: 'webpay',
        status: 'pending',
        transactionId: buyOrder,
        notes: `Pago WebPay iniciado - ${buyOrder}`,
        metadata: {
          webpay_init: {
            buyOrder,
            sessionId,
            organizationId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`Pago creado en BD: ${payment.id}`);

      // PASO 4: Crear instancia de MallTransaction
      const mallTransaction = this.getMallTransaction();

      // URL de retorno (incluir cartId y paymentId para actualizar después)
      const returnUrl = `${this.baseUrl}/webpay/retorno?cartId=${cartId}&paymentId=${payment.id}`;

      // Crear los detalles de la transacción con el child commerce code de la org
      const details = [
        new TransactionDetail(amount, childCommerceCode, childBuyOrder),
      ];

      this.logger.debug(`Return URL: ${returnUrl}`);

      // PASO 5: Crear la transacción en Webpay
      const response = await mallTransaction.create(
        buyOrder,
        sessionId,
        returnUrl,
        details,
      );

      this.logger.log('Transacción WebPay creada exitosamente');
      this.logger.debug(`Token: ${response.token}`);

      return {
        token: response.token,
        url: response.url,
        buyOrder,
        sessionId,
        paymentId: payment.id,
        message: 'Transacción creada exitosamente',
      };
    } catch (error) {
      this.logger.error('Error al crear transacción WebPay:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al crear la transacción',
        error instanceof Error ? error.message : 'Error desconocido',
      );
    }
  }

  /**
   * Confirma una transacción en Webpay Plus Mall y actualiza el pago en la BD
   */
  async commitTransaction(
    dto: CommitWebpayTransactionDto,
  ): Promise<WebpayCommitResponseDto> {
    const { token } = dto;

    this.logger.log(`Confirmando transacción WebPay con token: ${token}`);

    try {
      const mallTransaction = this.getMallTransaction();

      // PASO 1: Confirmar la transacción con Transbank
      const response = await mallTransaction.commit(token);

      this.logger.log('Transacción confirmada exitosamente con Transbank');

      // En Mall Transaction, los datos están en details[0]
      const mainDetail =
        response.details && response.details[0] ? response.details[0] : {};

      // PASO 2: Buscar el pago asociado usando el buy_order (transactionId)
      const buyOrder = response.buy_order;
      this.logger.log(`Buscando pago con buy_order: ${buyOrder}`);

      const payment = await this.paymentService.findByTransactionId(buyOrder);

      if (!payment) {
        this.logger.warn(
          `No se encontró pago con buy_order: ${buyOrder}. La transacción fue exitosa pero no se actualizará el pago.`,
        );
      } else {
        // PASO 3: Actualizar el pago con los datos de Transbank
        const isAuthorized = mainDetail.status === 'AUTHORIZED';
        const newStatus = isAuthorized ? 'completed' : 'failed';

        this.logger.log(
          `Actualizando pago ${payment.id} a status: ${newStatus}`,
        );

        const existingMetadata =
          typeof payment.metadata === 'object' && payment.metadata !== null
            ? payment.metadata
            : {};

        await this.paymentService.update(payment.id, {
          status: newStatus,
          authorizationCode: mainDetail.authorization_code,
          cardLastFourDigits: response.card_detail?.card_number?.slice(-4),
          metadata: {
            ...existingMetadata,
            webpay_commit: {
              vci: response.vci,
              amount: mainDetail.amount,
              status: mainDetail.status,
              payment_type_code: mainDetail.payment_type_code,
              response_code: mainDetail.response_code,
              installments_number: mainDetail.installments_number,
              accounting_date: response.accounting_date,
              transaction_date: response.transaction_date,
              committed_at: new Date().toISOString(),
            },
          },
        });

        this.logger.log(`Pago ${payment.id} actualizado exitosamente`);
      }

      // PASO 4: Retornar respuesta
      return {
        success: true,
        transaction: {
          vci: response.vci,
          amount: mainDetail.amount,
          status: mainDetail.status,
          authorization_code: mainDetail.authorization_code,
          payment_type_code: mainDetail.payment_type_code,
          response_code: mainDetail.response_code,
          installments_number: mainDetail.installments_number,
          buy_order: response.buy_order,
          session_id: response.session_id,
          card_detail: {
            card_number: response.card_detail?.card_number,
          },
          accounting_date: response.accounting_date,
          transaction_date: response.transaction_date,
          details: response.details,
        },
      };
    } catch (error) {
      this.logger.error('Error al confirmar transacción:', error);

      throw new InternalServerErrorException(
        'Error al confirmar la transacción',
        error instanceof Error ? error.message : 'Error desconocido',
      );
    }
  }
}

