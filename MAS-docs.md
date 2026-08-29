MAS Final Project
Documentation
Description
BeardBuddy is a management system for a modern barbershop. The system is designed to handle
the full lifecycle of a client visit — from booking an appointment to payment and review
submission. The application operates under the assumption of a single local user.

Clients can register, browse available barbers, select a service (haircut or beard trimming), and
optionally add premium extra services to their appointment such as alcohol, cigars, or card. The
system does not include an administrative panel — barbers, services, and their associations are pre-
loaded into the system by executing a startup SQL script.

The application is implemented as a web-based GUI using Next.js and TypeScript, with Prisma
ORM handling all data persistence against a SQLite database.

Technology stack
The application is built using a modern web technology stack.

Next.js (React) serves as the primary framework, handling both the frontend user interface and the
backend API layer via built-in API routes. The GUI is implemented as a responsive web
application.

Prisma ORM is used as the object-relational mapping layer. Prisma provides a type-safe database
client, schema-driven migrations, and clean model definitions.

SQLite serves as the relational database engine, storing all persistent data in a local file.

TypeScript is used throughout the entire codebase, providing strong typing that closely mirrors the
object-oriented class model defined in the UML diagrams.

User stories
1.1. As a customer, I want to be able to browse barbers and filter them for choosing the preferred
one for appointment.

1.2. As a customer, I want to view a barber's profile including their speciality, experience with
seniority, and average rating so that I can make an informed choice.

1.3. As a customer, I want to view available services and their prices

1.4. As a customer, I want to book an appointment by selecting a barber, service, and time slot so
that I can visit the barbershop at a convenient time.

1.5. As a customer, I want to add extra services (such as a drink or card game) to my appointment so
that I can enhance my visit experience.

1.6. As a customer, I want to view my upcoming and past appointments so that I can keep track of
my visits.

1.7. As a customer, I want to cancel an upcoming appointment so that I can free the time slot if my
plans change.

1.8. As a customer, I want to submit a review and rating for a completed appointment so that I can
share my experience.

Functional requirements and use case diagrams
FR-01. The system shall allow customers to browse barbers and their associated services.

FR-02. The system shall allow customers to create an appointment by selecting a barber, a service,
date with time ad optionally extra service.

FR-03. The system shall prevent double-booking of a barber at the same time slot.

FR-04. The system shall allow customers to cancel their appointments.

FR-05. The system shall allow customers to submit a review for a completed appointment.

FR-06. The system shall display a customer's appointment history and appointment details for a
chosen one.

Non-functional requirements
NFR-01. The application should start initial data seeding and contain all necessary data on startup.

NFR-02. All data shall be persisted in a relational database using Prisma ORM with SQLite.

NFR-03. The GUI shall be user-friendly and understandable.

NFR-04. Page load and data fetch time shall not exceed two seconds under normal conditions.

NFR-05. The system shall validate data flow on backend side and return correct errors, which will
be correctly shown on frontend.

Analytical class diagram (next page)
Design class diagram (above)
Non-Trivial Use case diagram

Use case scenario for Book appointment
Actor: Customer
Purpose and context: A customer wants to book an appointment. The
customer selects a time, service, and barber based on availability.
Assumptions:
Customer will be able to pay for the appointment in cash at the barbershop.
Customer is familiar with the available services and barbers.
Pre-conditions:
Barbers and their schedules are pre-loaded in the system via startup script.
At least one barber has an active schedule with available time slots.
Basic flow of events:
Customer clicks on "Book Appointment" option.
System shows a date and time picker.
Customer selects a desired date and time slot.
System displays all available services matching the selected time.
Customer selects a service.
System displays a list of barbers available at the selected time who offer
the selected service.
Customer selects a barber.
System displays booking summary with date, time, service, barber, and
total price.
Customer confirms the booking.
System creates the appointment and displays a confirmation screen with all
details.
Alternative flow 3A:
3A1. Customer selects a time when no barbers are available.
3A2. System informs customer: "No barbers available at the selected
time."
3A3. Customer selects a different time and flow returns to step 3.
Alternative flow 5A:
5A1. Customer selects a service for which no barbers are available at the
selected time.
5A2. System informs customer: "No barbers available for this service at
the selected time."
5A3. Customer may select a different service or return to step 3 to pick a
different time.
Alternative flow 8A:
8A1. Customer decides to add extra services before confirming.
8A2. Customer selects one or more extra services (ALCOHOL, CIGAR,
CARD_GAME).
8A3. System updates the total price to include selected extras.
8A4. Flow returns to step 9.
Alternative flow 9A:
9A1. Customer cancels the booking before confirming.
9A2. System discards all selections and returns customer to the home
screen.
Alternative flow 10A:
10A1. Customer navigates to their appointment history and clicks "Cancel
Appointment."
10A2. Customer provides a cancellation reason.
10A3. System updates appointment status to CANCELLED, stores
cancellation reason, and displays confirmation.
Activity diagram “Book Appointment” Use case

State diagram for Book appointment Use case - Appointment class
Book appointment — A non-trivial Use case description

The customer opens the booking screen and selects a desired date and time. The customer then
selects a service. Based on the selected service, the system filters barbers by seniority level and
specialization — a junior barber holds only one specialization, either haircut or beard, while a
senior barber can perform both service types simultaneously. Senior barbers also have access to
higher complexity services, while junior barbers are limited to services within their skill range. The
customer selects a barber from the filtered options.

The customer then reviews the booking summary showing date, time, barber, service, and total
price. Optional extra services are presented at this step (dropdown)— alcohol, cigar, or card game.
The customer may select one or more extras, which updates the total price, or just skip them.

The customer presses the confirm button. At this point the system performs a real-time availability
check — it validates that the selected barber's schedule covers the selected date and time and that no
conflicting appointment exists.

If the slot is no longer available the system informs the customer by showing message and returns
them to the selection screen.

If the slot is available the system creates the appointment with status NEW, linking it to the
customer, barber, service, and any selected extras, and displays a confirmation screen.

Once the appointment reaches COMPLETED status, customer has an option to leave review on
appointment. The customer can navigate to their appointment history, select the completed
appointment, and provide feedback with rating and comments.

Dynamic analysis
I chose to to dynamic analysis on Book appointment use case and related class to it Appointment. It
seems to have potential in terms of extending functionality and making optimisation steps.

Finding — cancellationReason attribute was missing.

When modelling the transition from any active state to CANCELLED, the question arose: why was
the appointment cancelled? This revealed that a cancellationReason attribute was missing from the
Appointment class in the analytical diagram. It is optional because it only holds a value when the
appointment has actually been cancelled. This attribute was added to the design class diagram as a
direct result of the state diagram analysis.

Finding 2 — User class should be split into Customer and Barber

During dynamic analysis of the booking flow it became clear that the single User class handles

two fundamentally different roles with different attributes, methods, and business logic. A customer

books appointments and submits reviews, while a barber performs appointments and has a schedule,
seniority level, and specialization. Keeping them in one class creates unnecessary complexity and
pollutes the model with optional fields that only apply to one role. Although I did it according to
lecture.

The recommended design improvement is to split User into three classes — a base User class

holding shared identity fields (first last name, email, MAYBE password etc), and two subclasses

Customer and Barber each containing only role-specific attributes and methods (for example:

loyalty points for customer and barbershop-related definitions on instruments, expertise etc). This
aligns more closely with the analytical class diagram and provides a clean technical foundation for
future development — most notably for implementing authentication and role-based access control,
where Customer and Barber would naturally require different permissions and different entry points
into the application.

Finding 3 — Senior barbers should be able to manage junior barber schedules

During dynamic analysis of the booking flow, specifically the schedule validation step, it became
apparent that schedules are currently only created via the startup script and cannot be modified at
runtime. Introducing the ability for senior barbers to manage junior barber schedules would
significantly increase the flexibility of the system.

This would mean adding a manageSchedule(barber: Barber, schedule: Schedule): void

method to the SeniorBarber class,. In practice this would allow senior barbers to organise specific
service days, reassign time slots, or block off periods for junior barbers — making the system
more suitable for real barbershop operations.

GUI

Here is the list of design decisions:

All primary buttons have gold fade color
Selected items (barber, time and date, service) are highlighted in gold
Calendar disables past dates and Continue button on each step is disabled until all options are
chosen
Appointment booking is a wizard form and enables navigation to previous steps
Main page with appointments and with already existing one + 1 which already has review + 1
cancelled with special Cancelled chip

Appointment details:

Appointment review: Starts cannot be null, so 1-5 rate is the only option. Its possible to just close
this modal.

Appointments booking: step 1 - pick date and time. Back button included. If date AND time are not
BOTH chosen - button Continue is disabled and has different UI.

Appointment booking: step 2 - pick service. Button Continue depends on whether service was
picked

Appointment booking: step 3 - pick barber. Button Continue depends if barber was chosen.

Appointment booking: step 4 - summary with chosen extra services, Of course, as extra service is
optional - button Confirm & Schedule is green and customer can finish booking

Appointment booking: confirmation modal. Clicking on Go To Dashboard will navigate to main
page.

Extra points which, I think, must be discussed here:

1. In the analytical diagram Person is abstract with Customer and Barber as

subclasses. In the design diagram this entire hierarchy collapses into one User class

In analytical diagram Barber has two independent inheritance axes. In design diagram
User { seniorityLevel, specializationType }. two fields together replace four classes:
SeniorBarber, JuniorBarber, BeardSpecialist, HaircutSpecialist. The business rule

is: JUNIOR can only have one specialization while SENIOR can have both.

3. In analytical diagram Experience sits on the association line between Barber and

Service. BarberService replaces the Experience association class

4. In the analytical diagram there is a qualified association between Barber and

Appointment qualified by date. In the design diagram this maps to: User has

Appointment on date (qualifier: date)