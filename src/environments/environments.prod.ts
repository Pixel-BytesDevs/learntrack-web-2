export const Services = Object.freeze({
    gestorGrafo: {
        url: 'https://3.145.22.173:8083', // O la IP pública de DigitalOcean
    },
    moduloAlumno: {
        cuestionarioUrl: 'https://3.145.22.173:8092/preguntas',
        insertCuestionarioIrl: 'http://3.145.22.173:8092/cuestionarios/respuestas?reemplazar=true',
        cuestionarioNivel: 'http://3.145.22.173:8092/api/placement',
        grafoEstudiante: 'http://3.145.22.173:8092/api/usuario-topic',
        evaluacion: 'http://3.145.22.173:8092/api/recommendation-evaluation',
        alumno: 'http://3.145.22.173:8092/alumno',
        recomendation: 'http://3.145.22.173:5000/api/v1/recommendations',
    },
    auth: {
        login: 'https://3.145.22.173:/auth',
    }
});

export const environment = {
    production: true, // ¡CRÍTICO!
    auth_url: "https://3.145.22.173:9003",
    client_secret: 'secret',
    client_id: "client",
    // Aquí pones la URL que te de DigitalOcean al crear la App
    redirect_uri: "https://tu-app-en-digital-ocean.ondigitalocean.app/authorized", 
    scope: "openid profile",
    token_url: "https://3.145.22.173:9003/oauth2/token",
};