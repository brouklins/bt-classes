interface ContractModelDTO {
    student_id: string;
    instructor_id: string;
    start_date: Date;
    days_of_week: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELED';
}

export default ContractModelDTO;