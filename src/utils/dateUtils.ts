"use client"

export function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);

        // Verifica si la fecha es válida
        if (isNaN(date.getTime())) {
            return "FECHA INVÁLIDA";
        }

        // Define días y meses en español
        const days = [
            "DOMINGO", "LUNES", "MARTES", "MIÉRCOLES",
            "JUEVES", "VIERNES", "SÁBADO"
        ];

        const months = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ];

        // Construye la cadena de fecha
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} DE ${month} DE ${year}`;
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return "FECHA INVÁLIDA";
    }
}