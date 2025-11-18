export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  products: {
    apiUrl: process.env.PRODUCTS_API_URL,
  }
});
