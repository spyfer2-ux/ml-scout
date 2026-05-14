exports.handler = async function(event, context) {
  const path = event.path.replace('/.netlify/functions/ml-proxy', '');
  const queryString = event.rawQuery ? '?' + event.rawQuery : '';
  const url = 'https://api.mercadolibre.com' + path + queryString;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ML-Scout/1.0 (compatible; Node.js)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Origin': 'https://www.mercadolivre.com.br',
        'Referer': 'https://www.mercadolivre.com.br/'
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
