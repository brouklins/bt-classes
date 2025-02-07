interface ContractEntity {
    id: string;
    student_id: string;
    instructor_id: string;
    start_date: Date;
    end_date: Date;
    sessions_per_week: number;
    days_of_week: string[];
    completed_sessions: number;
    total_sessions: number;
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELED';
}

export default ContractEntity;