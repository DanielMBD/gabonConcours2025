import fetch from "node-fetch";

export async function handler(event: any, context: any) {
    try {
        // Récupère la route envoyée par le frontend
        const route = event.queryStringParameters?.route || '';
        const backendUrl = `https://backend-production-121a.up.railway.app/api/${route}`;

        const options: any = {
            method: event.httpMethod,
            headers: { "Content-Type": event.headers["content-type"] || "application/json" },
        };

        // Si POST/PUT, on passe le body
        if (event.body && ['POST','PUT','PATCH'].includes(event.httpMethod)) {
            options.body = event.body;
        }

        const response = await fetch(backendUrl, options);
        const data = await response.json();

        return {
            statusCode: response.status,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(data),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
}
