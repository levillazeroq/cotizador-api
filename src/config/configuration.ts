export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  products: {
    apiUrl: process.env.PRODUCTS_API_URL,
  },
  webpay: {
    commerceCode: process.env.WEBPAY_COMMERCE_CODE,
    apiKey: process.env.WEBPAY_API_KEY,
    // childCommerceCode ahora viene de organization_payment_methods en la BD
    environment: process.env.WEBPAY_ENVIRONMENT || 'integration',
    returnBaseUrl: process.env.WEBPAY_RETURN_BASE_URL,
  },
});