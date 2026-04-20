export const Services = Object.freeze({
    gestorGrafo: {
        url: 'http://26.138.194.69:8083',
    },
    moduloAlumno: {
        cuestionarioUrl: 'http://26.138.194.69:8092/preguntas',
        insertCuestionarioIrl: 'http://26.138.194.69:8092/cuestionarios/respuestas?reemplazar=true',
        cuestionarioNivel: 'http://26.138.194.69:8092/api/placement',
        grafoEstudiante: 'http://26.138.194.69:8092/api/usuario-topic',
        evaluacion: 'http://26.138.194.69:8092/api/recommendation-evaluation'
    },
    auth: {
        login: 'http://26.138.194.69:1000/auth',
    }
})