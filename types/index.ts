export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';

export interface Application {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    status: ApplicationStatus;
    position_index: number;
    date_applied: string;
    job_posting_url?: string;
    salary_notes?: string;
    private_notes?: string;
    reminder_date?: string;
    contact_name?: string;
    contact_email?: string;
    updated_at: string;
}
