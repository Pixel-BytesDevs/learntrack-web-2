export const Services = Object.freeze({
    gestorGrafo: {
        url: 'http://3.145.22.173:8083',
    },
    moduloAlumno: {
        cuestionarioUrl: 'http://3.145.22.173:8092/preguntas',
        insertCuestionarioIrl: 'http://3.145.22.173:8092/cuestionarios/respuestas?reemplazar=true',
        cuestionarioNivel: 'http://3.145.22.173:8092/api/placement',
        grafoEstudiante: 'http://3.145.22.173:8092/api/usuario-topic',
        evaluacion: 'http://3.145.22.173:8092/api/recommendation-evaluation',
        alumno: 'http://3.145.22.173:8092/alumno',
        recomendation: 'http://3.145.22.173:5000/api/v1/recommendations',
    },
    auth: {
        login: 'http://3.145.22.173:1000/auth',
    }
})