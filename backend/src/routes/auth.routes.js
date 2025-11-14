import express from 'express';
import { exchangeCode } from '../controllers/oauth.controller.js';

const router = express.Router();

// Endpoint que redirige al consentimiento de Google
router.get('/google', (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return res.status(501).send('OAuth no configurado en el servidor');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(url);
});

// Endpoint que intercambia el authorization code por tokens (usado por frontend)
router.post('/exchange', exchangeCode);

export default router;
