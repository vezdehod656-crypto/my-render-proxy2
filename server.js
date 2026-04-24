const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const auth = (req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login === 'user' && password === 'password') {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Proxy"');
  res.status(401).send('Authentication required.');
};

app.use(auth);

app.use('/', createProxyMiddleware({
  target: 'https://example.com',
  changeOrigin: true,
  secure: false
}));

app.get('/ping', (req, res) => {
  res.send('pong');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
