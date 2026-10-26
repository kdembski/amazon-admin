export default {
  '/api': {
    target: 'http://localhost:5001',
    pathRewrite: { '^/api': '' },
    headers: { Authorization: `Bearer ${process.env.API_TOKEN ?? ''}` },
    changeOrigin: true,
  },
};
