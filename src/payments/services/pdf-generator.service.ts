import { Injectable } from '@nestjs/common';
import { Payment } from '../../database/schemas';

// Importar PDFKit como CommonJS
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfGeneratorService {
  /**
   * Genera un PDF del comprobante de pago
   */
  generatePaymentReceipt(payment: Payment): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];

        // Capturar los chunks del PDF
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ==========================================
        // ENCABEZADO
        // ==========================================
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('COMPROBANTE DE PAGO', { align: 'center' });

        doc.moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`ID de Pago: ${payment.id}`, { align: 'center' });

        doc.moveDown(2);

        // ==========================================
        // INFORMACIÓN DEL PAGO
        // ==========================================
        const startY = doc.y;

        doc.fontSize(12).font('Helvetica-Bold').text('Información del Pago');
        doc.moveDown(0.5);

        // Estado
        const statusLabels = {
          pending: 'Pendiente',
          processing: 'En Proceso',
          completed: 'Completado',
          failed: 'Fallido',
          cancelled: 'Cancelado',
          refunded: 'Reembolsado',
        };

        const statusColors = {
          pending: '#FFA500',
          processing: '#3B82F6',
          completed: '#10B981',
          failed: '#EF4444',
          cancelled: '#6B7280',
          refunded: '#8B5CF6',
        };

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#374151')
          .text('Estado:', { continued: true })
          .font('Helvetica-Bold')
          .fillColor(statusColors[payment.status] || '#000000')
          .text(` ${statusLabels[payment.status]}`, { continued: false });

        doc.fillColor('#374151'); // Reset color

        // Tipo de pago
        const paymentTypeLabels = {
          webpay: 'WebPay (Transbank)',
          bank_transfer: 'Transferencia Bancaria',
          check: 'Cheque',
        };

        doc
          .font('Helvetica')
          .text('Tipo de Pago:', { continued: true })
          .font('Helvetica-Bold')
          .text(` ${paymentTypeLabels[payment.paymentType]}`);

        // Monto
        const amount = parseFloat(payment.amount);
        doc
          .font('Helvetica')
          .text('Monto:', { continued: true })
          .font('Helvetica-Bold')
          .fontSize(14)
          .text(` $${amount.toLocaleString('es-CL')} CLP`);

        doc.fontSize(10);

        // Fecha de creación
        doc
          .font('Helvetica')
          .text('Fecha de Creación:', { continued: true })
          .font('Helvetica-Bold')
          .text(` ${new Date(payment.createdAt).toLocaleString('es-CL')}`);

        // Fecha de confirmación
        if (payment.confirmedAt) {
          doc
            .font('Helvetica')
            .text('Fecha de Confirmación:', { continued: true })
            .font('Helvetica-Bold')
            .text(` ${new Date(payment.confirmedAt).toLocaleString('es-CL')}`);
        }

        doc.moveDown(1.5);

        // ==========================================
        // DETALLES ESPECÍFICOS POR TIPO DE PAGO
        // ==========================================
        if (payment.paymentType === 'webpay') {
          this.addWebPayDetails(doc, payment);
        } else if (payment.paymentType === 'bank_transfer' || payment.paymentType === 'check') {
          this.addProofPaymentDetails(doc, payment);
        }

        // ==========================================
        // NOTAS
        // ==========================================
        if (payment.notes) {
          doc.moveDown(1.5);
          doc.fontSize(12).font('Helvetica-Bold').text('Notas');
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').text(payment.notes);
        }

        // ==========================================
        // PIE DE PÁGINA
        // ==========================================
        const bottomY = doc.page.height - 100;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#6B7280')
          .text(
            'Este documento es un comprobante de pago generado automáticamente.',
            50,
            bottomY,
            { align: 'center' }
          );

        doc.text(
          `Generado el ${new Date().toLocaleString('es-CL')}`,
          50,
          bottomY + 15,
          { align: 'center' }
        );

        // Finalizar el documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Agrega detalles específicos de pagos WebPay
   */
  private addWebPayDetails(doc: PDFKit.PDFDocument, payment: Payment): void {
    doc.fontSize(12).font('Helvetica-Bold').text('Detalles de WebPay');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    // Número de orden
    if (payment.transactionId) {
      doc
        .text('Número de Orden:', { continued: true })
        .font('Helvetica-Bold')
        .text(` ${payment.transactionId}`);
    }

    // Código de autorización
    if (payment.authorizationCode) {
      doc
        .font('Helvetica')
        .text('Código de Autorización:', { continued: true })
        .font('Helvetica-Bold')
        .text(` ${payment.authorizationCode}`);
    }

    // Últimos 4 dígitos de la tarjeta
    if (payment.cardLastFourDigits) {
      doc
        .font('Helvetica')
        .text('Tarjeta terminada en:', { continued: true })
        .font('Helvetica-Bold')
        .text(` **** ${payment.cardLastFourDigits}`);
    }

    // Información adicional del metadata
    if (payment.metadata) {
      const metadata = payment.metadata as any;

      if (metadata.vci) {
        doc
          .font('Helvetica')
          .text('VCI:', { continued: true })
          .font('Helvetica-Bold')
          .text(` ${metadata.vci}`);
      }

      if (metadata.payment_type_code) {
        const paymentTypeCodes: Record<string, string> = {
          VD: 'Venta Débito',
          VN: 'Venta Normal',
          VC: 'Venta en Cuotas',
          SI: '3 Cuotas sin interés',
          S2: '2 Cuotas sin interés',
          NC: 'N Cuotas sin interés',
        };

        doc
          .font('Helvetica')
          .text('Tipo de Pago:', { continued: true })
          .font('Helvetica-Bold')
          .text(
            ` ${paymentTypeCodes[metadata.payment_type_code] || metadata.payment_type_code}`
          );
      }

      if (metadata.installments_number) {
        doc
          .font('Helvetica')
          .text('Número de Cuotas:', { continued: true })
          .font('Helvetica-Bold')
          .text(` ${metadata.installments_number}`);
      }

      if (metadata.accounting_date) {
        doc
          .font('Helvetica')
          .text('Fecha Contable:', { continued: true })
          .font('Helvetica-Bold')
          .text(` ${metadata.accounting_date}`);
      }
    }
  }

  /**
   * Agrega detalles de pagos con comprobante (transferencia/cheque)
   */
  private addProofPaymentDetails(doc: PDFKit.PDFDocument, payment: Payment): void {
    doc.fontSize(12).font('Helvetica-Bold').text('Detalles del Comprobante');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    // Referencia externa
    if (payment.externalReference) {
      doc
        .text('Referencia Externa:', { continued: true })
        .font('Helvetica-Bold')
        .text(` ${payment.externalReference}`);
    }

    // Fecha de pago
    if (payment.paymentDate) {
      doc
        .font('Helvetica')
        .text('Fecha de Pago:', { continued: true })
        .font('Helvetica-Bold')
        .text(` ${new Date(payment.paymentDate).toLocaleString('es-CL')}`);
    }

    // URL del comprobante
    if (payment.proofUrl) {
      doc
        .font('Helvetica')
        .text('Comprobante disponible en:', { continued: false });
      doc
        .font('Helvetica')
        .fillColor('#3B82F6')
        .text(payment.proofUrl, { link: payment.proofUrl });
      doc.fillColor('#374151');
    }
  }
}

