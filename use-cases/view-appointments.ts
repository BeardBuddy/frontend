import { User } from '../business-objects/User';
import { Appointment } from '../business-objects/Appointment';
import { UserRole } from '../common/types/UserRole';

export interface ViewAppointmentsResult {
  upcoming: Appointment[];
  past: Appointment[];
  all: Appointment[];
}

export function viewAppointmentsUseCase(customer: User): ViewAppointmentsResult {
  if (customer.role !== UserRole.CUSTOMER) {
    throw new Error('Only customers can view their appointment list');
  }

  return {
    upcoming: customer.getUpcomingAppointments(),
    past:     customer.getPastAppointments(),
    all:      customer.getAppointments(),
  };
}
