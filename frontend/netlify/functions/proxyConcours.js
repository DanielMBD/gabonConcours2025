import fetch from 'node-fetch';

export async function handler(event, context) {
    const route = event.queryStringParameters?.route;
    const method = event.httpMethod;
    const body = event.body;

    const backendUrl = `https://backend-production-121a.up.railway.app/api/${route}`;

    try {
        const response = await fetch(backendUrl, {
            method,
            headers: {
                'Content-Type': event.headers['content-type'] || 'application/json',
            },
            body: method !== 'GET' ? body : undefined,
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*', // CORS
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erreur proxy', error: error.message }),
        };
    }
}
