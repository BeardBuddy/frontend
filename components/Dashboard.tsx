"use client";

import React, { useState } from "react";
import { useMemory } from "@/lib/store/store";
import { User } from "@/business-objects/User";
import { Appointment } from "@/business-objects/Appointment";
import { Modal } from "@/common/components/Modal";
import { StarRatingInput } from "@/common/components/StarRating";
import { UserRole } from "@/common/types/UserRole";
import { AppointmentStatus } from "@/common/types/AppointmentStatus";
import { submitReviewUseCase } from "@/use-cases/submit-review";
import { cancelAppointmentUseCase } from "@/use-cases/cancel-appointment";
import { completeAppointmentUseCase } from "@/use-cases/complete-appointment";
import { viewAppointmentsUseCase } from "@/use-cases/view-appointments";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { CompletedList } from "@/components/dashboard/CompletedList";
import { CancelledList } from "@/components/dashboard/CancelledList";
import { StatusBadge } from "@/common/components/StatusBadge";
import { StarRatingDisplay } from "@/common/components/StarRating";
import {
  Calendar as CalendarIcon, Clock, User as UserIcon,
  Scissors, DollarSign, PlusCircle, Sparkles, Check, Heart,
} from "lucide-react";

interface DashboardProps {
  onStartBooking: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartBooking }) => {
  const { revalidate } = useMemory();

  const customer = User.getExtent().find(u => u.role === UserRole.CUSTOMER);

  const [ui, setUi] = useState<{
    selectedAppt: Appointment | null;
    isDetailOpen: boolean;
    isReviewOpen: boolean;
    rating: number;
    comment: string;
  }>({ selectedAppt: null, isDetailOpen: false, isReviewOpen: false, rating: 5, comment: "" });

  const { selectedAppt, isDetailOpen, isReviewOpen, rating, comment } = ui;

  if (!customer) return null;

  const { upcoming, past } = viewAppointmentsUseCase(customer);
  const cancelledAppts = customer.getAppointments().filter(
    a => a.status === AppointmentStatus.CANCELLED,
  );
  const completedAppts = past.filter(a => a.status === AppointmentStatus.COMPLETED);

  const openDetails = (appt: Appointment) => setUi(prev => ({ ...prev, selectedAppt: appt, isDetailOpen: true }));
  const closeDetails = () => setUi(prev => ({ ...prev, selectedAppt: null, isDetailOpen: false }));

  const openReviewForm = (appt: Appointment) =>
    setUi(prev => ({ ...prev, selectedAppt: appt, rating: 5, comment: "", isDetailOpen: false, isReviewOpen: true }));
  const closeReviewForm = () => setUi(prev => ({ ...prev, isReviewOpen: false, selectedAppt: null }));

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    await submitReviewUseCase({ currentUser: customer, appointment: selectedAppt, rating, comment });
    await revalidate();
    closeReviewForm();
  };

  const handleCancelClick = async (appt: Appointment) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    await cancelAppointmentUseCase({ customer, appointment: appt });
    await revalidate();
    closeDetails();
  };

  const handleFinishClick = async (appt: Appointment) => {
    await completeAppointmentUseCase({ customer, appointment: appt });
    await revalidate();
  };

  const detailBarber  = selectedAppt?.getBarber();
  const detailService = selectedAppt?.getService();
  const detailReview  = selectedAppt?.getReview();
  const detailExtras  = selectedAppt?.getExtraServices() ?? [];

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
        <div>
          <span className="text-amber-500 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Member Profile
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
            Welcome back, {customer.firstName} {customer.lastName}
          </h2>
          <p className="text-zinc-400 mt-1 max-w-lg">
            Manage your style records, review your finished grooming bookings, or schedule your next session.
          </p>
        </div>
        <div className="flex items-center gap-6 divide-x divide-zinc-800">
          <div className="text-center pr-6 md:pr-8">
            <span className="text-zinc-500 uppercase font-semibold text-xs tracking-wider">Loyalty Points</span>
            <div className="text-3xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5 justify-center">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              {customer.loyaltyPoints}
            </div>
          </div>
          <div className="text-center pl-6 md:pl-8">
            <span className="text-zinc-500 uppercase font-semibold text-xs tracking-wider">Visits Completed</span>
            <div className="text-3xl font-extrabold text-zinc-100 mt-1">{completedAppts.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">

          <div>
            <h3 className="text-xl font-extrabold text-zinc-100 mb-4 tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-amber-500" /> Upcoming Visits
            </h3>
            <UpcomingList appointments={upcoming} onSelect={openDetails} />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-zinc-100 mb-4 tracking-tight flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" /> Past Appointments
            </h3>
            <CompletedList appointments={completedAppts} onSelect={openDetails} onWriteReview={openReviewForm} />
          </div>

          <CancelledList appointments={cancelledAppts} onSelect={openDetails} />
        </div>


        <div className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 backdrop-blur-md">
          <h3 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-amber-500" /> Need a Grooming?
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Schedule a high-end service with our specialized barbers. Our availability algorithms will search real-time schedules.
          </p>
          <button
            onClick={onStartBooking}
            className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold tracking-wide rounded-2xl py-3 px-4 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all text-sm uppercase"
          >
            Book Appointment
          </button>
        </div>
      </div>


      {isDetailOpen && selectedAppt && (
        <Modal onClose={closeDetails} title="Appointment Records">
          <div className="flex flex-col gap-5 text-zinc-300">
            <div className="flex justify-between items-center bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 font-semibold block">APPOINTMENT ID</span>
                <span className="text-sm font-bold text-zinc-300">{selectedAppt.id}</span>
              </div>
              <StatusBadge status={selectedAppt.status} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mb-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" /> DATE
                </span>
                <span className="text-sm font-bold text-zinc-200">{selectedAppt.date}</span>
              </div>
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" /> TIME SLOT
                </span>
                <span className="text-sm font-bold text-zinc-200">{selectedAppt.startTime} — {selectedAppt.endTime}</span>
              </div>
            </div>
            {detailBarber && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-start gap-4">
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl h-10 w-10 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {detailBarber.firstName[0]}{detailBarber.lastName[0]}
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-semibold block">ASSIGNED BARBER</span>
                  <span className="text-md font-bold text-zinc-200">{detailBarber.firstName} {detailBarber.lastName}</span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    {detailBarber.seniorityLevel} Barber • {detailBarber.experienceYears} yrs exp
                  </span>
                </div>
              </div>
            )}
            {detailService && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mb-2">
                  <Scissors className="h-3.5 w-3.5 text-zinc-400" /> SERVICE DETAILS
                </span>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-md font-bold text-zinc-200 block">{detailService.name}</span>
                    <span className="text-xs text-zinc-400 block mt-1">{detailService.description}</span>
                  </div>
                  <span className="text-md font-bold text-amber-500 shrink-0">${detailService.getPrice()}</span>
                </div>
              </div>
            )}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" /> EXTRA SERVICES
              </span>
              {detailExtras.length === 0 ? (
                <span className="text-xs text-zinc-500">No extras added.</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {detailExtras.map(e => (
                    <div key={e.id} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300 flex items-center gap-1.5 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {e.name}
                      </span>
                      <span className="text-zinc-400 font-semibold">${e.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
              <div>
                <span className="text-xs text-zinc-500 block font-semibold">PAYMENT METHOD</span>
                <span className="text-xs text-zinc-400 mt-0.5 block">
                  {selectedAppt.paymentMethod} ({selectedAppt.paymentStatus})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block font-semibold">TOTAL PRICE</span>
                <span className="text-2xl font-extrabold text-amber-500">${selectedAppt.getTotalPrice()}</span>
              </div>
            </div>
            {detailReview && (
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                <span className="text-xs text-amber-500 font-bold block mb-1.5">SUBMITTED FEEDBACK</span>
                <div className="flex items-center gap-2 mb-2">
                  <StarRatingDisplay rating={detailReview.rating} size="md" />
                  <span className="text-xs text-zinc-500 ml-1">{detailReview.date}</span>
                </div>
                {detailReview.comment && <p className="text-sm italic text-zinc-400">"{detailReview.comment}"</p>}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-800">
              {(selectedAppt.status === AppointmentStatus.CONFIRMED || selectedAppt.status === AppointmentStatus.NEW) && (
                <>
                  <button type="button" onClick={() => handleCancelClick(selectedAppt)} className="bg-red-950/60 border border-red-900 hover:bg-red-900 hover:text-white text-red-400 font-bold px-4 py-2 rounded-xl text-sm transition-all">
                    Cancel Booking
                  </button>
                  <button type="button" onClick={() => handleFinishClick(selectedAppt)} className="bg-emerald-950/60 border border-emerald-800 hover:bg-emerald-900 hover:text-white text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm transition-all">
                    Finish Appointment
                  </button>
                </>
              )}
              {selectedAppt.status === AppointmentStatus.COMPLETED && !detailReview && (
                <button type="button" onClick={() => openReviewForm(selectedAppt)} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm transition-all">
                  Add Review
                </button>
              )}
              <button type="button" onClick={closeDetails} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-zinc-800">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isReviewOpen && selectedAppt && (
        <Modal onClose={closeReviewForm} title="Leave Feedback">
          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 text-zinc-300">
            <p className="text-sm text-zinc-400">Your feedback helps our barbers refine their craft and serves as a record for future customers.</p>
            {selectedAppt.getBarber() && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-start gap-4 my-1">
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl h-10 w-10 flex items-center justify-center font-extrabold text-sm shrink-0">
                  {selectedAppt.getBarber()!.firstName[0]}{selectedAppt.getBarber()!.lastName[0]}
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-semibold block">BARBER</span>
                  <span className="text-md font-bold text-zinc-200">{selectedAppt.getBarber()!.firstName} {selectedAppt.getBarber()!.lastName}</span>
                  <span className="text-xs text-zinc-400 block mt-0.5">{selectedAppt.getService()?.name} • Completed on {selectedAppt.date}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Rating</label>
              <StarRatingInput value={rating} onChange={v => setUi(prev => ({ ...prev, rating: v }))} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="comment" className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Comments (Optional)</label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={e => setUi(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share details of your experience..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4 mt-2">
              <button type="button" onClick={closeReviewForm} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold px-4 py-2 rounded-xl text-sm transition-all">Cancel</button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm transition-all">Submit Feedback</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
