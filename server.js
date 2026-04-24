const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// авторизация
const auth = (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login === 'user' && password === 'password') {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Proxy"');
  res.status(401).send('Auth required');
};

app.use(auth);

// ПРОКСИ
app.use('/', createProxyMiddleware({
  changeOrigin: true,
  secure: false,

  router: (req) => {
    const target = req.query.url;
    if (!target) return 'https://example.com';
    return target;
  },

  pathRewrite: (path, req) => {
    return '/';
  }
}));

app.get('/ping', (req, res) => res.send('pong'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
