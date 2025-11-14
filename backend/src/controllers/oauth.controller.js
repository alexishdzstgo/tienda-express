import jwt from 'jsonwebtoken';

// Intercambia un `code` OAuth por tokens (Google) y devuelve un payload usable por el frontend.
export const exchangeCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Falta el parámetro code' });

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      return res.status(501).json({ message: 'OAuth no está configurado en el servidor' });
    }

    const params = new URLSearchParams();
    params.append('client_id', GOOGLE_CLIENT_ID);
    params.append('client_secret', GOOGLE_CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', GOOGLE_REDIRECT_URI);

    // Asegurarnos que `fetch` esté disponible (Node <18 puede no tenerlo)
    if (typeof fetch === 'undefined') {
      const nodeFetch = await import('node-fetch');
      // eslint-disable-next-line no-global-assign
      global.fetch = nodeFetch.default;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return res.status(502).json({ message: 'Falló el intercambio de código', detail: text });
    }

    const tokenJson = await tokenRes.json();
    const { access_token, id_token, refresh_token, expires_in } = tokenJson;

    // Decodificar id_token para obtener información del usuario (sin verificar aquí)
    let user = null;
    if (id_token) {
      try {
        const decoded = jwt.decode(id_token);
        user = {
          email: decoded?.email,
          name: decoded?.name,
          picture: decoded?.picture,
        };
      } catch (e) {
        // ignore
      }
    }

    const payload = {
      token: id_token || access_token,
      access_token,
      refresh_token,
      expires_in,
      user,
      role: 'client',
    };

    return res.json(payload);
  } catch (err) {
    console.error('Error en exchangeCode:', err);
    return res.status(500).json({ message: 'Error interno en intercambio OAuth', error: err.message });
  }
};
