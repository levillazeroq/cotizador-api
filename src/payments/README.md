# Payments Module

This module handles all payment operations for cart purchases, supporting three payment methods:

1. **Webpay** - Payment gateway integration
2. **Check** - Bank check with proof upload
3. **Transfer** - Bank transfer with proof upload

## Payment Flow

### 1. Webpay Payment Flow

```
User → Initiate Payment → Webpay Gateway → User Pays → Callback → Payment Completed
```

**API Endpoints:**

```bash
# Initiate Webpay payment
POST /payments/webpay/initiate
{
  "cartId": "uuid",
  "amount": 100.00,
  "returnUrl": "https://yoursite.com/payment-success",
  "metadata": {
    "paymentMethodId": "uuid"
  }
}

# Response:
{
  "payment": { ... },
  "webpayUrl": "https://webpay.transbank.cl/...",
  "webpayToken": "TOKEN_..."
}

# Handle Webpay callback (automatically called by Webpay)
POST /payments/webpay/callback
{
  "token": "TOKEN_...",
  "transactionId": "TXN_...",
  "status": "AUTHORIZED",
  "amount": 100.00,
  "authorizationCode": "ABC123"
}
```

### 2. Check Payment Flow

```
User → Upload Check Image → Admin Reviews → Validates → Payment Completed
```

**API Endpoints:**

```bash
# Create proof-based payment (check)
POST /payments/proof
{
  "cartId": "uuid",
  "paymentMethodId": "uuid", // ID of check payment method
  "amount": 100.00,
  "proofUrl": "https://s3.../check-image.jpg",
  "notes": "Check number: 123456",
  "externalReference": "123456"
}

# Admin validates the proof
PATCH /payments/:id/validate-proof
{
  "isValid": true,
  "transactionId": "123456",
  "notes": "Check verified and approved"
}
```

### 3. Transfer Payment Flow

```
User → Upload Transfer Proof → Admin Reviews → Validates → Payment Completed
```

**API Endpoints:**

```bash
# Create proof-based payment (transfer)
POST /payments/proof
{
  "cartId": "uuid",
  "paymentMethodId": "uuid", // ID of transfer payment method
  "amount": 100.00,
  "proofUrl": "https://s3.../transfer-screenshot.jpg",
  "notes": "Transfer reference: REF123",
  "externalReference": "REF123"
}

# Admin validates the proof
PATCH /payments/:id/validate-proof
{
  "isValid": true,
  "transactionId": "REF123",
  "notes": "Transfer verified in bank account"
}
```

## Payment Status Flow

```
pending → processing → completed
   ↓          ↓           ↓
cancelled  failed    refunded
```

### Status Descriptions:

- **pending**: Payment created, waiting for action
- **processing**: Payment proof uploaded, under review
- **completed**: Payment confirmed and successful
- **failed**: Payment failed or rejected
- **cancelled**: Payment cancelled by user or system
- **refunded**: Completed payment that was refunded

## Common Operations

### Get Cart Payments

```bash
GET /payments/cart/:cartId
```

### Get Payment Statistics

```bash
GET /payments/cart/:cartId/stats

# Response:
{
  "totalPaid": 100.00,
  "totalPending": 50.00,
  "totalFailed": 0,
  "count": 2
}
```

### Update Payment Status

```bash
PATCH /payments/:id/status
{
  "status": "processing"
}
```

### Upload Payment Proof (for existing payment)

```bash
PATCH /payments/:id/upload-proof
{
  "proofUrl": "https://s3.../proof.jpg",
  "notes": "Additional information"
}
```

### Confirm Payment Manually

```bash
POST /payments/:id/confirm
{
  "transactionId": "TXN_123",
  "externalReference": "REF_456",
  "notes": "Payment confirmed"
}
```

### Cancel Payment

```bash
POST /payments/:id/cancel
{
  "reason": "User requested cancellation"
}
```

### Refund Payment

```bash
POST /payments/:id/refund
{
  "reason": "Product not available"
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Webpay Configuration
WEBPAY_API_URL=https://webpay.transbank.cl/api
WEBPAY_API_KEY=your-webpay-api-key
WEBPAY_RETURN_URL=http://localhost:3000/payments/webpay/callback

# S3 Configuration (for proof uploads)
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_IMAGES_FOLDER=images
```

## Database Schema

The `payments` table includes:

- `id`: UUID primary key
- `cartId`: Reference to cart
- `paymentMethodId`: Reference to payment method
- `amount`: Payment amount (decimal)
- `status`: Payment status (enum)
- `proofUrl`: URL to payment proof (for check/transfer)
- `transactionId`: Transaction ID from payment gateway/bank
- `externalReference`: External reference number
- `paymentDate`: Date payment was made
- `confirmedAt`: Date payment was confirmed
- `metadata`: Additional JSON data
- `notes`: Payment notes
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

## Integration Example

### Frontend Integration (React/Next.js)

```typescript
// 1. Webpay Payment
async function initiateWebpayPayment(cartId: string, amount: number) {
  const response = await fetch('/api/payments/webpay/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId, amount })
  });
  
  const { webpayUrl, webpayToken } = await response.json();
  
  // Redirect user to Webpay
  window.location.href = webpayUrl;
}

// 2. Check/Transfer Payment
async function uploadProofPayment(
  cartId: string,
  paymentMethodId: string,
  amount: number,
  proofFile: File
) {
  // First, upload proof to S3
  const formData = new FormData();
  formData.append('file', proofFile);
  
  const uploadResponse = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url: proofUrl } = await uploadResponse.json();
  
  // Then create payment with proof
  const response = await fetch('/api/payments/proof', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cartId,
      paymentMethodId,
      amount,
      proofUrl
    })
  });
  
  return response.json();
}
```

## Admin Panel Integration

### Validate Payment Proof

```typescript
async function validatePaymentProof(
  paymentId: string,
  isValid: boolean,
  notes?: string
) {
  const response = await fetch(`/api/payments/${paymentId}/validate-proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isValid, notes })
  });
  
  return response.json();
}
```

## Testing

Run tests:

```bash
pnpm test payment.service.spec.ts
```

## Migration

Run the migration to create the payments table:

```bash
pnpm db:generate
pnpm db:migrate
```

## Notes

- The Webpay integration is currently a placeholder. You'll need to implement the actual Webpay API calls in `webpay.service.ts`
- Proof-based payments (check/transfer) automatically move to `processing` status when created
- Admin validation is required to move proof-based payments to `completed` status
- Failed proof validations move payments to `failed` status
- Only completed payments can be refunded
- Payment proofs are stored in S3 and automatically deleted when the payment is deleted

