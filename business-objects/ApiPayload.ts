export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  role: string;
  seniorityLevel?: string;
  specializationType?: string;
  experienceYears?: number;
  hireDate?: string;
  description?: string;
  loyaltyPoints?: number;
  managementAccess?: boolean;
  canMentor?: boolean;
  certifications?: string[];
  maxClientsPerDay?: number;
  scissorsMastery?: boolean;
  supportsLongHair?: boolean;
  trimMastery?: boolean;
  supportsHotTowel?: boolean;
  beardCareKnowledge?: string[];
  email?: string;
}

export interface ApiService {
  id: string;
  name: string;
  price: number;
  type: string;
  duration: number;
  description: string;
  isAvailable?: boolean;
  requiresStyling?: boolean;
  complexityLevel?: string;
  subServiceIds?: string[];
}

export interface ApiBarberService {
  id: string;
  barberId: string;
  serviceId: string;
  seniority: string;
  specializationType: string;
}

export interface ApiSchedule {
  id: string;
  barberId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  validFrom: string;
  validTo: string;
  isActive?: boolean;
}

export interface ApiAppointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalPrice?: number;
  notes?: string;
  cancellationReason?: string;
}

export interface ApiExtraService {
  id: string;
  type: string;
  name: string;
  price: number;
  description: string;
}

export interface ApiReview {
  id: string;
  appointmentId: string;
  customerId: string;
  rating: number;
  comment?: string;
  date?: string;
}

export interface ApiPayload {
  users: ApiUser[];
  services: ApiService[];
  barberServices: ApiBarberService[];
  schedules: ApiSchedule[];
  appointments: ApiAppointment[];
  extraServices: ApiExtraService[];
  reviews: ApiReview[];
  appointmentExtras: Record<string, string[]>;
}
