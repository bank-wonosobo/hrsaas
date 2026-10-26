export interface EmployeeTrainingPayload {
  training_name: string;
  organizer: string;
  start_date: string;
  end_date?: string;
  certificate_url?: string;
}

export interface EmployeeTrainingCertificate {
  uri: string;
  mimeType: string;
}
