exports.handler = async function(event, context) {
  const path = event.path.replace('/.netlify/functions/ml-proxy', '');
  const queryString = event.rawQuery ? '?' + event.rawQuery : '';
  const url = 'https://api.mercadolibre.com' + path + queryString;
  
  // Get access token from environment
  let accessToken = process.env.ML_ACCESS_TOKEN;
  
  // Auto-fetch app token via client_credentials if credentials are available
  if (!accessToken && process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET) {
    try {
      const tokenResp = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.ML_CLIENT_ID,
          client_secret: process.env.ML_CLIENT_SECRET
        })
      });
      const tokenData = await tokenResp.json();
      accessToken = tokenData.access_token;
    } catch(e) {}
  }
  
  if (!accessToken) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'config_required',
        message: 'Configure ML_CLIENT_ID e ML_CLIENT_SECRET nas variáveis de ambiente do Netlify'
      })
    };
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
