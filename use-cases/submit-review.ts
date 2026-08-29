import { User } from '../business-objects/User';
import { Appointment } from '../business-objects/Appointment';
import { Review } from '../business-objects/Review';
import { apiUrl } from '../lib/apiBase';

export interface SubmitReviewInput {
  currentUser: User;
  appointment: Appointment;
  rating: number;
  comment?: string;
}

export interface SubmitReviewResult {
  review: Review;
}

export async function submitReviewUseCase(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const { currentUser, appointment, rating, comment } = input;

  const review = currentUser.submitReview(appointment, rating, comment);

  await fetch(apiUrl('/api/reviews'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id:            review.id,
      appointmentId: review.appointmentId,
      customerId:    review.customerId,
      rating:        review.rating,
      comment:       review.comment ?? null,
      date:          review.date,
    }),
  });

  return { review };
}
