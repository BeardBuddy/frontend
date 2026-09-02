export type BarberDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  seniorityLevel: string | null;
  specializationType: string | null;
  description: string | null;
  experienceYears: number | null;
  averageRating: number;
  expert: boolean;
  specializations: string[];
};

export type ServiceDto = {
  id: string;
  name: string;
  price: number;
  type: string;
  duration: number;
  description: string;
  available: boolean;
  complexityLevel: string | null;
  subServiceIds: string[];
  barbers: BarberDto[];
};

export type ExtraServiceDto = {
  id: string;
  type: string;
  name: string;
  price: number;
  description: string;
};

export type ReviewDto = {
  id: string;
  appointmentId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  date: string;
};

export type AppointmentDto = {
  id: string;
  customerId: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  notes: string[];
  cancellationReason: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  extraServices: ExtraServiceDto[];
  canBeReviewed: boolean;
  canBeCancelled: boolean;
  review: ReviewDto | null;
};

export type AppointmentListDto = {
  upcoming: AppointmentDto[];
  completed: AppointmentDto[];
  cancelled: AppointmentDto[];
};

export type CustomerDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string | null;
  loyaltyPoints: number;
};

export type AvailableSlotsDto = {
  barberId: string;
  serviceId: string;
  date: string;
  durationMinutes: number;
  slots: string[];
};

export type PromoCodeResultDto = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  newTotal: number;
};

export type BookAppointmentRequest = {
  customerId: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  extraServiceIds: string[];
  promoCode: string | null;
  notes: string | null;
};
