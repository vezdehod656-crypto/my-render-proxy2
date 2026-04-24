const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// авторизация (оставляем)
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

// универсальный прокси
app.use('/', (req, res, next) => {
  const target = req.query.url;

  if (!target) {
    return res.send('Добавь ?url=https://site.com');
  }

  return createProxyMiddleware({
    target: target,
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/': '' }
  })(req, res, next);
});

// пинг
app.get('/ping', (req, res) => res.send('pong'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
