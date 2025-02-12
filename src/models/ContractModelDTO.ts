interface Schedule {
    [day: string]: string[]; // Mapeia o dia da semana para um array de horários, ex: ['08:00-09:00', '10:00-11:00']
}

interface ContractModelDTO {
    student_id: string;
    instructor_id: string;
    start_date: Date;
    days_of_week: string[];
    schedule: Schedule; // Novo campo opcional para os horários das aulas
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELED';
}

export default ContractModelDTO;