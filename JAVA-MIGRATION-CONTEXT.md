> **Amended.** §10 below supersedes parts of §3, §7 and §9 for the Barber↔Service
> relationship and adds new endpoints and a booking-UI change. Read §10 before starting
> implementation — it changes how association data must be fetched (no query languages,
> anywhere) and changes the seed data so a service can only ever belong to one barber.

# BeardBuddy — TS Backend → Java/Spring Boot/Hibernate Migration Context

This file is the complete brief for migrating BeardBuddy's backend from Next.js/TypeScript
to **Java + Spring Boot + Hibernate**. It was produced by reading the actual source code
(not just the docs), so it reflects what the code *does*, not what the design docs imply.
That distinction matters a lot here — see "Critical scope note" below before writing any code.

Reference material used: `MAS-docs.md` (project documentation), `MAS-requirements.md`
(§4.2 Implementation only, per instructions), and the full source tree: `app/api/**`,
`business-objects/**`, `use-cases/**`, `infrastructure/db/**`, `common/**`, `lib/store/**`.

---

## 1. What this application is

BeardBuddy is a single-tenant barbershop booking system. A customer browses barbers and
services, books an appointment (optionally with extras like alcohol/cigar/card game),
can cancel it, and can leave a review once it's completed. There is no admin panel —
barbers, services, schedules and associations are seeded once via a startup SQL script.
There is no authentication; the app assumes one local user session.

## 2. Critical scope note — read this first

**The real "backend" in this codebase is intentionally thin.** All of the interesting
business logic described in `MAS-docs.md` — double-booking prevention, filtering barbers
by seniority/specialization, price calculation with extras, review eligibility, cancellation
rules, promo codes — is implemented in **TypeScript classes that run in the browser**
(`business-objects/*.ts`, `use-cases/*.ts`), operating on an in-memory object graph
(`lib/store/*`) that's rebuilt on every page load from a single `GET /api/data` call.

The actual Next.js API routes under `app/api/**` do **no validation and no business logic
at all**. They are plain parameterized INSERT/UPDATE/SELECT statements against SQLite.
For example, `POST /api/appointments` will happily insert a double-booked, backwards-in-time
appointment if asked — nothing stops it server-side today. The double-booking check, schedule
check, and price computation all already happened in the browser (in `User.bookAppointment`)
*before* the fetch call was made.

**Per the user's instruction ("no logic to be changed, migration is the only thing I am
chasing"), the Java backend must replicate this thin-CRUD behavior exactly** — same endpoint
paths, same HTTP methods, same request/response JSON shapes, same (lack of) server-side
validation, same SQL-level behavior (including the transaction wrapping in the appointment
insert). Do not "improve" it by adding the business rules from `business-objects`/`use-cases`
into the Java layer — those stay client-side, unchanged, in TypeScript, in the untouched
Next.js frontend. The frontend will simply point its `fetch()` calls at the new Java backend
instead of Next.js API routes; from its perspective nothing changes.

The domain-object write-up in §7 below is included **only as background** so whoever
implements this understands *why* the data looks the way it does (e.g. why `totalPrice` is
sent pre-computed by the client, why IDs are client-generated strings). It is not a spec to
re-implement server-side.

## 3. Current tech stack (source)

- Next.js 16.2.6 (App Router, API routes under `app/api`)
- React 19.2.4 / TypeScript 5
- `sqlite` + `sqlite3` npm packages — raw SQL via a shared `Database` handle, **no ORM**
  (despite `MAS-docs.md` claiming Prisma is used — the actual code does not use Prisma
  anywhere; it hand-writes SQL against `sqlite3`). Trust the code over the doc here.
- Single SQLite file: `beardbuddy.db`, schema + seed data in `infrastructure/db/startup.sql`,
  executed in full (`CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE`) on every `getDb()` call
  the first time a DB handle is opened (lazy singleton in `infrastructure/db/client.ts`).

## 4. Target stack (what to build)

- Java (17+ recommended) + Spring Boot 3 
- Spring Data JPA / Hibernate for persistence
- Keep the database engine equivalent in behavior to the current SQLite file — either
  continue using SQLite (via a Hibernate SQLite dialect) or ask the user if a swap to
  another RDBMS is acceptable; do not assume — this affects schema/dialect only, not
  the business behavior described here.
- Expose the same 5 REST endpoints, same paths, same verbs, same JSON in/out.
- Run the equivalent of `startup.sql` as a startup/seed step (e.g. Hibernate
  `import.sql` / `data.sql` / a `CommandLineRunner`), reproducing table shapes and the
  same seed rows so the frontend sees identical data.

## 5. Endpoints to migrate (exact contracts)

All five live under `app/api/**`. There is no versioning, no auth headers, no pagination.

### 5.1 `GET /api/data`

Source: `app/api/data/route.ts`. This is the single "load everything" endpoint the frontend
calls once on mount (`lib/store/store.tsx` → `revalidate()`), and re-calls after any mutation
to refresh its in-memory graph.

Behavior: runs 8 `SELECT * FROM <table>` queries in parallel (`user`, `service`,
`barber_service`, `schedule`, `appointment`, `extra_service`, `review`,
`appointment_extra`), then **normalizes** the raw rows before returning JSON:

- `user` rows:
  - `certifications`: stored as a JSON-string column → parse to `string[]` (`[]` if null/empty)
  - `beardCareKnowledge`: same, JSON-string column → parse to `string[]` (`[]` if null/empty)
  - `managementAccess`: SQLite `INTEGER` (0/1) → JS `boolean`
  - `canMentor`: SQLite `INTEGER` (0/1) → JS `boolean`
  - `scissorsMastery`, `supportsLongHair`, `trimMastery`, `supportsHotTowel`: nullable
    SQLite `INTEGER` → `boolean | null` (null stays null, not coerced to false)
- `service` rows:
  - `subServiceIds`: JSON-string column → parse to `string[]` (`[]` if null/empty)
  - `isAvailable`: `INTEGER` (0/1) → `boolean`
  - `requiresStyling`: nullable `INTEGER` → `boolean | null`
- `barberServices`, `schedules`, `appointments`, `extraServices`, `reviews`: returned as-is,
  no transformation (raw column names, snake/camel as stored — table columns are already
  camelCase, see §6)
- `appointmentExtras`: the raw `appointment_extra` join rows (`{appointmentId, extraServiceId}`)
  are pivoted into a `Record<appointmentId, extraServiceId[]>` map, **not** returned as a raw
  array

Response JSON shape (top-level object, all keys always present):
```json
{
  "users": [ /* ApiUser[], see §6 */ ],
  "services": [ /* ApiService[] */ ],
  "barberServices": [ /* raw barber_service rows */ ],
  "schedules": [ /* raw schedule rows */ ],
  "appointments": [ /* raw appointment rows */ ],
  "extraServices": [ /* raw extra_service rows */ ],
  "reviews": [ /* raw review rows */ ],
  "appointmentExtras": { "<appointmentId>": ["<extraServiceId>", "..."] }
}
```

Errors: any thrown error → `500` with `{"error": "Failed to load data"}`, logged to console.
There is no `404`/`400` path — this endpoint takes no input.

### 5.2 `POST /api/appointments`

Source: `app/api/appointments/route.ts`. Creates a new appointment (and optionally links
extra services), inside a manual `BEGIN`/`COMMIT`/`ROLLBACK` transaction.

Request JSON body (all fields required except `notes` and `extraServiceIds`; **the client
computes and sends every value already** — nothing is derived server-side):
```json
{
  "id": "string",
  "customerId": "string",
  "barberId": "string",
  "serviceId": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "status": "NEW|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED",
  "paymentStatus": "UNPAID|PAID|PENDING",
  "paymentMethod": "CARD|CASH|MOBILE",
  "totalPrice": 0,
  "notes": "string | null (optional)",
  "extraServiceIds": ["string", "..."]
}
```

Behavior:
1. `BEGIN` transaction.
2. `INSERT INTO appointment (id, customerId, barberId, serviceId, date, startTime, endTime,
   status, paymentStatus, paymentMethod, totalPrice, notes) VALUES (...)` — `notes` defaults
   to `null` if not provided. No column-level validation beyond the SQL `CHECK` constraints
   in the schema (see §6).
3. If `extraServiceIds` is a non-empty array, loop and `INSERT INTO appointment_extra
   (appointmentId, extraServiceId) VALUES (?, ?)` for each id, one row per id.
4. `COMMIT`.
5. On any error: `ROLLBACK`, log, return `500` with `{"error": "Failed to create appointment"}`.
6. On success: `200` with `{"ok": true}` (no echo of the created resource).

Note: `id` is generated **client-side** as `` `appt-${Date.now()}` `` (see
`business-objects/User.bookAppointment`) — the backend never generates appointment IDs, it
just persists whatever `id` string it's given. Preserve this — do not switch to server-side
ID generation (e.g. `@GeneratedValue`) unless explicitly asked, since that would change the
request/response contract with the frontend (which relies on knowing the ID immediately
after booking, before this call even returns, to update its local object graph).

### 5.3 `PATCH /api/appointments/{id}/cancel`

Source: `app/api/appointments/[id]/cancel/route.ts`.

Path param: `id` (appointment id, string).

Request body:
```json
{ "cancellationReason": "string | null (optional)" }
```

Behavior: single statement, no existence check, no status-transition check (that check —
"can't cancel a COMPLETED/CANCELLED appointment" — lives client-side in
`User.cancelAppointment`, not here):
```sql
UPDATE appointment SET status = 'CANCELLED', cancellationReason = ? WHERE id = ?
```
`cancellationReason` defaults to `null` if not supplied.

Response: `200 {"ok": true}` on success (even if `id` matched zero rows — SQLite `UPDATE`
doesn't error on no-match, and neither does this route). `500 {"error": "Failed to cancel
appointment"}` on thrown error.

### 5.4 `PATCH /api/appointments/{id}/status`

Source: `app/api/appointments/[id]/status/route.ts`.

Path param: `id` (appointment id, string).

Request body:
```json
{ "status": "NEW|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED" }
```

Behavior: single statement, no validation of the transition (again, transition legality is
enforced client-side, e.g. `User.completeOwnAppointment` only allows
`NEW|CONFIRMED|IN_PROGRESS → COMPLETED`):
```sql
UPDATE appointment SET status = ? WHERE id = ?
```

Response: `200 {"ok": true}` / `500 {"error": "Failed to update status"}`.

### 5.5 `POST /api/reviews`

Source: `app/api/reviews/route.ts`.

Request body (all required except `comment`):
```json
{
  "id": "string",
  "appointmentId": "string",
  "customerId": "string",
  "rating": 1,
  "comment": "string | null (optional)",
  "date": "YYYY-MM-DD"
}
```

Behavior: single insert, no check that the appointment is COMPLETED, no check that a review
doesn't already exist for it (the DB schema enforces uniqueness — see §6 — so a duplicate
insert will throw and be caught as a 500; the "only one review per appointment" and "only
for COMPLETED appointments" rules are enforced client-side in
`business-objects/Appointment.addReview` / `User.submitReview`, not here):
```sql
INSERT INTO review (id, appointmentId, customerId, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?)
```
`comment` defaults to `null` if not supplied.

Response: `200 {"ok": true}` / `500 {"error": "Failed to save review"}`.

Note: the review `id` is also client-generated, as `` `rev-${appointmentId}` `` (see
`Appointment.addReview`) — not a UUID, not server-generated. Preserve as-is.

## 6. Database schema (source of truth: `infrastructure/db/startup.sql`)

Reproduce these tables (and their `CHECK` constraints) as closely as the target RDBMS
allows. Column names are already camelCase in the source schema — keep them exactly as-is
in both the DB and the JSON contracts above, since the frontend deserializes by these exact
key names.

```sql
user (
  id                  TEXT PRIMARY KEY,
  firstName           TEXT NOT NULL,
  lastName            TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  dateOfBirth         TEXT NOT NULL,
  role                TEXT NOT NULL CHECK(role IN ('CUSTOMER','BARBER')),
  seniorityLevel      TEXT CHECK(seniorityLevel IN ('SENIOR','JUNIOR')),
  specializationType  TEXT CHECK(specializationType IN ('HAIRCUT','BEARD')),
  experienceYears     INTEGER,
  hireDate            TEXT,
  description         TEXT,
  loyaltyPoints       INTEGER DEFAULT 0,
  managementAccess    INTEGER DEFAULT 0,   -- boolean 0/1
  canMentor           INTEGER DEFAULT 0,   -- boolean 0/1
  certifications      TEXT,                -- JSON-encoded string[]
  maxClientsPerDay    INTEGER,
  scissorsMastery     INTEGER,             -- nullable boolean 0/1
  supportsLongHair    INTEGER,             -- nullable boolean 0/1
  trimMastery         INTEGER,             -- nullable boolean 0/1
  supportsHotTowel    INTEGER,             -- nullable boolean 0/1
  beardCareKnowledge  TEXT                 -- JSON-encoded string[]
)

service (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  price            REAL NOT NULL,
  type             TEXT NOT NULL CHECK(type IN ('HAIRCUT','BEARD','HYBRID')),
  duration         INTEGER NOT NULL,        -- minutes
  description      TEXT NOT NULL,
  isAvailable      INTEGER DEFAULT 1,       -- boolean 0/1
  requiresStyling  INTEGER,                 -- nullable boolean 0/1
  complexityLevel  TEXT CHECK(complexityLevel IN ('BEGINNER','INTERMEDIATE','EXPERT')),
  subServiceIds    TEXT                     -- JSON-encoded string[] (only used by HYBRID)
)

barber_service (
  id                 TEXT PRIMARY KEY,
  barberId           TEXT NOT NULL REFERENCES user(id),
  serviceId          TEXT NOT NULL REFERENCES service(id),
  seniority          TEXT NOT NULL CHECK(seniority IN ('SENIOR','JUNIOR')),
  specializationType TEXT NOT NULL CHECK(specializationType IN ('HAIRCUT','BEARD'))
)

schedule (
  id        TEXT PRIMARY KEY,
  barberId  TEXT NOT NULL REFERENCES user(id),
  dayOfWeek TEXT NOT NULL CHECK(dayOfWeek IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
  startTime TEXT NOT NULL,     -- "HH:mm"
  endTime   TEXT NOT NULL,     -- "HH:mm"
  validFrom TEXT NOT NULL,     -- "YYYY-MM-DD"
  validTo   TEXT NOT NULL,     -- "YYYY-MM-DD"
  isActive  INTEGER DEFAULT 1  -- boolean 0/1
)

extra_service (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK(type IN ('ALCOHOL','CIGAR','CARD_GAME')),
  name        TEXT NOT NULL,
  price       REAL NOT NULL,
  description TEXT NOT NULL
)

appointment (
  id                  TEXT PRIMARY KEY,
  customerId          TEXT NOT NULL REFERENCES user(id),
  barberId            TEXT NOT NULL REFERENCES user(id),
  serviceId           TEXT NOT NULL REFERENCES service(id),
  date                TEXT NOT NULL,        -- "YYYY-MM-DD"
  startTime           TEXT NOT NULL,        -- "HH:mm"
  endTime             TEXT NOT NULL,        -- "HH:mm"
  status              TEXT NOT NULL DEFAULT 'NEW'
                       CHECK(status IN ('NEW','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')),
  paymentStatus       TEXT NOT NULL DEFAULT 'UNPAID'
                       CHECK(paymentStatus IN ('UNPAID','PAID','PENDING')),
  paymentMethod       TEXT NOT NULL DEFAULT 'CASH'
                       CHECK(paymentMethod IN ('CARD','CASH','MOBILE')),
  totalPrice          REAL NOT NULL DEFAULT 0,
  notes               TEXT,
  cancellationReason  TEXT
)

appointment_extra (
  appointmentId  TEXT NOT NULL REFERENCES appointment(id),
  extraServiceId TEXT NOT NULL REFERENCES extra_service(id),
  PRIMARY KEY (appointmentId, extraServiceId)
)

review (
  id             TEXT PRIMARY KEY,
  appointmentId  TEXT NOT NULL UNIQUE REFERENCES appointment(id),  -- enforces 1 review/appointment
  customerId     TEXT NOT NULL REFERENCES user(id),
  rating         INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment        TEXT,
  date           TEXT NOT NULL   -- "YYYY-MM-DD"
)
```

Foreign keys are enforced (`PRAGMA foreign_keys = ON`). All dates/times are stored as plain
`TEXT` in `YYYY-MM-DD` / `HH:mm` format, not native date/time types — the frontend does its
own date math in `common/utils/dateUtils.ts` / `timeUtils.ts`. Match this in Java: keep the
JSON wire format as plain strings in these formats (don't switch to ISO-8601 offsets or
epoch millis), whatever the internal JPA column type ends up being.

### Seed data

`startup.sql` also seeds: 1 customer, 4 barbers (2 SENIOR hybrid — Marcus Vance, Elena
Rostova — each qualified for HAIRCUT + BEARD; 2 JUNIOR single-specialization — Leo Sterling
HAIRCUT-only, Viktor Kael BEARD-only), 6 services (5 atomic + 1 HYBRID combo referencing two
sub-service ids), the full `barber_service` matrix for those 4 barbers, weekly schedules per
barber (varying days/hours), 3 extra services (alcohol/cigar/card game), 6 sample
appointments (mix of COMPLETED/CONFIRMED/CANCELLED), 2 appointment↔extra links, and 2
reviews. Reproduce this seed set verbatim (same ids, same values) so the frontend — which
still has hardcoded expectations baked into its use-cases/tests per the README's manual
QA notes — sees an identical dataset. Full literal values are in
`infrastructure/db/startup.sql`; copy them rather than re-deriving.

## 7. Domain model — background only, not to be re-implemented server-side

This section explains the shape of the data the endpoints move around, by describing the
TypeScript domain classes that consume it in the browser. Do **not** port these methods to
Java controllers/services — they're listed so the Java DTOs/entities make sense, and so
whoever picks this up later understands why, e.g., `totalPrice` arrives pre-computed.

- **`User`** (`business-objects/User.ts`) — single table for both customers and barbers,
  discriminated by `role: CUSTOMER|BARBER`. Barber-only fields (`seniorityLevel`,
  `specializationType`, `experienceYears`, schedule, barber-services, mastery flags,
  certifications) are `null`/`[]` for customers. Holds in-memory associations to its
  `Appointment[]`, `Schedule[]`, `BarberService[]` — these are populated at runtime by
  `lib/store/graphInit.ts` after `GET /api/data`, not stored as FKs beyond what's in §6.
  Methods enforce: only barbers have schedules/ratings/services; only customers can
  book/cancel/review; a booking requires the barber to actually offer the service, have a
  schedule that covers the slot, and have no conflicting non-cancelled appointment
  (`isAvailableAt`: `existing.startTime < newEndTime && existing.endTime > newStartTime`).
- **`BarberService`** — join entity (barber × service × seniority × specialization) used to
  decide who can perform what. `isExpert()`: true only for a SENIOR barber who has both a
  HAIRCUT and a BEARD `BarberService` row (i.e., a true hybrid senior).
- **`Schedule`** — one row per barber per weekday, with a validity date range and
  active/hours window. `isWithinSchedule(time, date)` checks weekday + date range + time
  window. `getRemainingSlots(occupied)` walks the window in 30-minute steps, excluding any
  overlapping occupied appointment, to produce open slots.
- **`Service`** — atomic (HAIRCUT/BEARD) or HYBRID (bundles two atomic services via
  `subServiceIds`); `estimateDuration()` sums sub-service durations for HYBRID.
- **`ExtraService`** — flat catalog (ALCOHOL/CIGAR/CARD_GAME), each with its own price.
- **`Appointment`** — the price sent to `POST /api/appointments` is
  `service.getPrice() + sum(extra.price)`, computed client-side in `User.bookAppointment`
  before the fetch. Cancelling only allowed from a non-terminal status; completing only from
  `NEW|CONFIRMED|IN_PROGRESS`; a review can only be attached once, only when `COMPLETED`.
- **`Review`** — 1:1 with an appointment (enforced by the `UNIQUE` constraint in §6); rating
  bounded 1–5 client-side (`Review` constructor throws outside that range) — note the
  backend, per §2, currently does **not** re-check this range; a `CHECK` constraint in the
  DB is the only server-side guard today (`rating BETWEEN 1 AND 5`), so keep that DB
  constraint in the Java schema even though there's no controller-level validation to match.
- **`PromoCode`** — not persisted at all; seeded purely in-memory in
  `lib/store/extentsInit.ts` (`AAAA` = 20% off, active; `BBBB` = limit-reached, unusable).
  There is no API route for promo codes — `applyPromoCodeUseCase` runs entirely client-side
  against this in-memory list. **Nothing to migrate here** — nothing hits the network.

## 8. Enums (mirror exactly, including string values used on the wire)

| Enum | Values |
|---|---|
| `UserRole` | `CUSTOMER`, `BARBER` |
| `SeniorityLevel` | `SENIOR`, `JUNIOR` |
| `SpecializationType` | `HAIRCUT`, `BEARD` |
| `ServiceType` | `HAIRCUT`, `BEARD`, `HYBRID` |
| `CertificationLevel` | `BEGINNER`, `INTERMEDIATE`, `EXPERT` |
| `DayOfWeek` (custom, not `java.time.DayOfWeek`) | `MON`,`TUE`,`WED`,`THU`,`FRI`,`SAT`,`SUN` |
| `ExtraType` | `ALCOHOL`, `CIGAR`, `CARD_GAME` |
| `AppointmentStatus` | `NEW`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `PaymentStatus` | `UNPAID`, `PAID`, `PENDING` |
| `PaymentMethod` | `CARD`, `CASH`, `MOBILE` |

All are serialized as their plain string name in JSON (no ordinal encoding) — configure
Jackson enum handling accordingly (`@JsonValue`/default string serialization works fine
since the string already matches the enum constant name).

## 9. Non-negotiable constraints for the Java implementation

1. Do not change any REST path, HTTP verb, request field name, or response field name.
2. Do not add server-side business validation that isn't already enforced by a SQL `CHECK`/
   `UNIQUE`/`FOREIGN KEY` constraint in §6 — the current backend has none beyond the schema,
   and changing that would change observable behavior (e.g. today you technically *can*
   double-book via a direct API call; that stays true unless the user asks otherwise later).
3. Do not touch anything under `app/`, `business-objects/`, `use-cases/`, `common/`,
   `components/`, or `lib/` — those are frontend/TypeScript and stay as-is, **except** the
   specific booking-wizard files and `Service`/graph-init files called out in §10.5 and
   §10.6, which the user has explicitly asked to change. Everything else under those
   directories is still off-limits. The Java project should live alongside them (e.g. a
   sibling `backend/` directory) and the frontend's `fetch()` base URL is the only other
   thing that changes to point at it.
4. Keep all date/time/JSON-array wire formats identical (plain `"YYYY-MM-DD"` /
   `"HH:mm"` strings; `certifications`/`beardCareKnowledge`/`subServiceIds` as JSON arrays
   of strings, not stringified JSON, in the `GET /api/data` response — the TS layer already
   parses those before sending).
5. IDs are client-generated strings, not server `@GeneratedValue` — the backend only ever
   persists whatever id string it's given, for both appointments and reviews.
6. Reproduce the `startup.sql` seed data verbatim on first run, and make it idempotent
   (`INSERT OR IGNORE` semantics — i.e., safe to run on every startup without duplicating
   rows), matching the current `getDb()` behavior of re-running the whole script on lazy
   init — **except** the `barber_service` seed rows, which must be updated per §10.4 to
   remove the current overlap (today several services are offered by two barbers at once).
7. See §10 for the one deliberate exception to "no server-side logic beyond the schema":
   the association-navigation rule is an *architectural* constraint (how data is fetched),
   not a business-validation rule, so it doesn't conflict with #2.

## 10. Addendum — association-driven endpoints, one-barber-per-service, booking UI merge

This section is a later, explicit set of amendments from the user, on top of everything
above. It exists because of MAS requirement **4.2.4**:

> The minimum GUI implementation must allow interaction between at least two classes
> connected by an association (target multiplicity: "many"). E.g.: a widget showing a list
> of companies; when a company is selected, another widget shows the list of its employees,
> **retrieved through the defined association** — this generally means no use of query
> languages, including SQL. [...] Solutions with only one widget, a single TextBox, a target
> multiplicity of "1," or **filtering data from the extent instead of using the predefined
> association**, are insufficient.

That rubric item is graded on the actual implementation, so it drives real design decisions
here, not just documentation. Two things in this codebase currently violate its spirit and
must be fixed as part of this migration:

1. Nothing in the current TS→Java plan (§1–§9) actually demonstrates a real ORM-mapped
   association being traversed for the GUI — `GET /api/data` is a flat dump of every table,
   and the frontend rebuilds its own object graph from that dump in JS. That's fine for the
   "keep behavior identical" goal of §1–§9, but it doesn't, on its own, satisfy 4.2.4 for the
   *Java* side, since there's no Java code anywhere that loads one entity and navigates a
   mapped relationship to get another.
2. The **current frontend already breaks the letter of 4.2.4**, independent of any Java work:
   `BookingWizardContext.tsx`'s `availableBarbers` computes barbers for a selected service by
   doing `User.getExtent().filter(u => u.getBarberServices().some(bs => bs.serviceId ===
   selectedService.id))` — i.e., filtering the full extent by a matching id, exactly the
   "filtering data from the extent instead of using the predefined association" pattern the
   requirement calls out as insufficient. `Service` currently has no association back to its
   barbers at all. §10.6 fixes this.

### 10.1 Hard rule: no query languages, anywhere, for association traversal

This applies to the whole Java backend, and supersedes nothing from §1–§9 (those endpoints
never needed to fetch related entities in the first place — they only insert/update by id
or `SELECT *` with no `WHERE`, which is not filtering and is fine to keep as-is, whether via
plain JDBC/SQL or `JpaRepository.findAll()`).

**Banned**, whenever the goal is "get the related object(s) of an object I already have":
- Handwritten SQL/JPQL/HQL with a `WHERE` clause (`SELECT s FROM Service s WHERE s.barber.id = ?1`)
- `@Query` annotations of any kind used for this purpose
- Spring Data derived query methods that filter by a foreign key
  (`findByBarberId(id)`, `findByServiceId(id)`, etc.) — these compile to a `WHERE` under the
  hood and are exactly what the requirement is warning against, even though it "looks like"
  plain Java
- Criteria API / Specifications used to build an equivalent filter

**Allowed**, always:
- `repository.findById(id)` — a primary-key lookup is not a filter/association query, it's
  how you get your hands on the starting object in the first place
- `repository.findAll()` — no predicate at all, equivalent to the `SELECT *` already used
  throughout §5
- Once you have a loaded entity, calling a real mapped-relationship getter on it
  (`barber.getServices()`, `service.getBarbers()`) and returning what Hibernate gives you
  (a `List<...>` backed by the FK relationship, whether lazily or eagerly fetched) — **this
  is the only acceptable way to get from one entity to its related entities**

### 10.2 Entity model additions

Per the earlier clarification, `User` stays a single entity/table with a `role` column
(`CUSTOMER`/`BARBER`) — it is **not** split into `Customer`/`Barber` subclasses. The
association that needs to be real (not extent-filtered) is `User` (role=BARBER) ↔ `Service`,
through the existing `BarberService` join entity. Add the missing mapped-collection sides:

```java
@Entity
@Table(name = "barber_service", uniqueConstraints = @UniqueConstraint(columnNames = "service_id"))
public class BarberService {
    @Id
    @Column(name = "id")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barber_id")
    private User barber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", unique = true)
    private Service service;

    @Enumerated(EnumType.STRING)
    private SeniorityLevel seniority;

    @Enumerated(EnumType.STRING)
    private SpecializationType specializationType;
}
```

```java
// on User (barber side)
@OneToMany(mappedBy = "barber", fetch = FetchType.LAZY)
private List<BarberService> barberServices = new ArrayList<>();

public List<Service> getServices() {
    return barberServices.stream().map(BarberService::getService).toList();
}
```

```java
// on Service (reverse side)
@OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
private List<BarberService> barberServices = new ArrayList<>();

public List<User> getBarbers() {
    return barberServices.stream().map(BarberService::getBarber).toList();
}
```

The `unique = true` / `@UniqueConstraint` on `service_id` in `barber_service` is what
enforces §10.4 ("no service offered by two barbers") at the schema level — it also means
`Service.getBarbers()` will, with the current dataset, always resolve to a list of at most
one element. That's fine and expected: the requirement's "target multiplicity: many" refers
to the **declared shape of the association** (a `List<User>` getter, backed by a real
one-to-many/many-to-many mapping, not a single-valued `getBarber()`), not to how many rows
happen to exist at any given moment. Do not "simplify" this into a `@ManyToOne` single
`Service.barber` field just because today's data never has more than one — keep the join
entity and the `List<...>` return types so the association stays genuinely collection-typed.

### 10.3 New endpoints

These are additive — the 5 endpoints in §5 are unchanged (still same paths/shapes/behavior),
and `GET /api/data` in particular stays exactly as specified in §5.1, flat arrays and all.

**`GET /api/barbers/{id}/services`** — new.
- Load: `userRepository.findById(id)` (404 if absent or not a BARBER).
- Fetch: `barber.getServices()` (§10.2) — no repository query beyond the id lookup.
- Response: `200` with a JSON array of service objects (same shape as an entry in
  `GET /api/data`'s `services` array — reuse the same DTO/mapping so the frontend doesn't
  need two different `Service` shapes).

**`GET /api/services`** — new.
- Fetch: `serviceRepository.findAll()` — no predicate.
- For each `Service`, call `service.getBarbers()` (§10.2) to populate a nested field.
- Response: `200` with a JSON array shaped like:
  ```json
  [
    {
      "id": "f1000000-0001-0000-0000-000000000001",
      "name": "Classic Scissor Cut",
      "price": 35,
      "type": "HAIRCUT",
      "duration": 30,
      "description": "...",
      "isAvailable": true,
      "requiresStyling": true,
      "complexityLevel": null,
      "subServiceIds": [],
      "barbers": [
        { "id": "b1b2c3d4-...", "firstName": "Marcus", "lastName": "Vance", "seniorityLevel": "SENIOR", "specializationType": "HAIRCUT" }
      ]
    }
  ]
  ```
  The `barbers` entries only need enough fields to render the right-hand list in §10.5 (id,
  name, seniority, specialization, rating if you want to show it) — reuse the `ApiUser`
  shape from §6/§7 rather than inventing a third user shape, trimmed or not, whichever is
  less code. This endpoint is what backs the merged Service+Barber picker in §10.5: one
  fetch gives the frontend both lists, and the right-hand list for any given service is
  just `services.find(s => s.id === selectedServiceId).barbers` — client-side, but on data
  that already came from a real server-side association traversal, not a client-side filter
  of the full user extent (the frontend still needs `GET /api/data` for everything else, per
  §5.1, unchanged; §10.6 covers the separate but related frontend-side extent-filter fix).

### 10.4 Migration/seed change — one barber per service

Update the `barber_service` seed rows so **no service id appears more than once** across all
four barbers (today `f1000000-0001`, `-0002`, `-0004`, `-0005`, `-0006` are each duplicated
between Marcus and Elena — that's the overlap to remove). A concrete reallocation that
preserves the existing narrative as closely as possible (both seniors keep at least one
HAIRCUT and one BEARD assignment, so `BarberService.isExpert()`-equivalent logic on the
Java side still recognizes them as hybrid-qualified; juniors keep exactly one
specialization):

| Service | Old barber(s) | New barber (unique) |
|---|---|---|
| Classic Scissor Cut (HAIRCUT) | Marcus, Elena | Marcus (`HAIRCUT`) |
| High-Skin Fade (HAIRCUT) | Marcus, Elena | Elena (`HAIRCUT`) |
| Buzz Cut & Styling (HAIRCUT) | Leo | Leo (`HAIRCUT`, unchanged) |
| Classic Beard Trim & Shape (BEARD) | Marcus, Elena, Viktor | Viktor (`BEARD`, unchanged) |
| Hot Towel Royal Shave (BEARD) | Marcus, Elena, Viktor | Marcus (`BEARD`) |
| Signature Cut & Beard Combo (HYBRID) | Marcus, Elena | Elena (tag the join row `specializationType = 'BEARD'`) |

That leaves: Marcus → Classic Scissor Cut + Hot Towel Royal Shave (one HAIRCUT + one BEARD
row ⇒ still hybrid-qualified); Elena → High-Skin Fade + Signature Combo tagged `BEARD` (one
HAIRCUT + one BEARD-tagged row ⇒ still hybrid-qualified); Leo → Buzz Cut only; Viktor →
Classic Beard Trim only. This is a suggestion, not the only valid split — adjust names/
tags if you prefer a different story — but the **unique-service-id constraint is mandatory**,
and whatever split is chosen must be reflected consistently in both the Java seed script and
the equivalent TS `startup.sql` is *not* touched (that file stays serving the old Next.js
app, if it's kept around at all — the Java backend gets its own seed step per §4).

Note this changes the concrete data behind the README's informal manual-QA scenarios (e.g.
"classic scissor 15:30 with Leo Sterling" no longer resolves the same way) — that's expected
and out of scope to reconcile; those notes describe manual testing against the old dataset,
not a contract.

### 10.5 Frontend: merge the Service and Barber wizard steps into one screen

This is a deliberate exception to "don't touch the frontend" (§9.3) — the user has asked for
it explicitly. Scope: `components/BookingWizard.tsx`, `components/booking/Step2Service.tsx`,
`components/booking/Step3Barber.tsx`, `components/booking/BookingWizardContext.tsx`. Do not
change anything else in `components/`, `use-cases/`, or `business-objects/` beyond what
§10.6 separately calls for.

Current flow (`components/BookingWizard.tsx`): 4 numbered header steps — Service (1),
Barber (2), Schedule (3), Summary (4) — each its own full screen, `STEPS` array of 4 titles
driving the header stepper.

**New flow**, 3 steps:

1. **"Service & Barber"** (merged) — one screen, two columns:
   - Left column: list of services (what `Step2Service.tsx` renders today — same
     `SpotlightCard` treatment, same gold/amber selected style
     `border-amber-500 bg-amber-500/[0.02]` + the small "Selected" badge).
   - Right column: initially empty (placeholder: "Select a service to see available
     barbers", styled like the existing `No barbers available for this service.` empty
     state in `Step3Barber.tsx`). Once a service is selected, this column populates with
     the barbers for that service (what `Step3Barber.tsx` renders today, same card style,
     same gold selected treatment) — sourced via the association fix in §10.6, not the
     current extent-filter.
   - Selecting a *different* service while a barber is already selected clears the barber
     selection (mirror today's `handleServiceSelect` behavior, which already resets
     `selectedBarber: null`) and repopulates the right column.
   - Both the selected service and the selected barber must be visibly highlighted at the
     same time once both are picked (gold border + "Selected" badge on each, same visual
     language already used — don't invent a new highlight style).
   - Continue/Next only enables once **both** a service and a barber are selected
     (`canAdvance[0] = !!selectedService && !!selectedBarber`).
2. **"Schedule"** — unchanged content of today's `Step1DateTime.tsx`, just renumbered to
   step 2 (previously step 3).
3. **"Summary"** — unchanged content of today's `Step4Summary.tsx`, renumbered to step 3
   (previously step 4).

Concretely in `BookingWizard.tsx`:
- Replace the two switch cases for `STEP_SERVICE`/`STEP_BARBER` with one case rendering a
  new merged component (e.g. `Step1ServiceBarber.tsx`, composing the existing `Step2Service`
  and `Step3Barber` presentational pieces side by side, or a new component that inlines
  both lists — either is fine as long as no widget collapses to a single item / single
  TextBox and the right list still comes from a real association, per §10.1/§10.6).
- Update `STEPS` to 3 entries: `{ title: "Service & Barber", desc: "Select Style & Specialist" }`,
  `{ title: "Schedule", desc: "Date & Time" }`, `{ title: "Summary", desc: "Review & Extras" }`.
  This is the "remove the separate Barber entry from the header" ask — the stepper header
  goes from 4 boxes to 3.
- Update the step constants (`STEP_SERVICE_BARBER = 1`, `STEP_DATETIME = 2`,
  `STEP_SUMMARY = 3`, `STEP_SUCCESS = 4`) and every place that currently hardcodes
  `step === STEP_DATETIME ? onCancelBooking : ...` / the `idx < 3` divider logic / etc.
  The user asked specifically for "back and next buttons on same place" — keep `renderNav`
  exactly as it is today (same position, same markup, same disabled-state styling), it
  already sits below the step content regardless of which step is rendered; just make sure
  the merged step also renders it via the same `renderNav()` call so its position doesn't
  shift relative to the other steps.
- In `BookingWizardContext.tsx`: `canAdvance` goes from 4 entries to 3
  (`[!!selectedService && !!selectedBarber, !!selectedDate && !!selectedTime, true]`).
  `handleServiceSelect`/`setSelectedBarber` behavior otherwise stays the same (still reset
  barber-on-service-change; still reset date/time-on-barber-change, matching today's code).

### 10.6 Frontend: fix the extent-filter violation in `availableBarbers`

Independent of the Java backend, fix the same rubric violation client-side, since it's the
piece that actually feeds the widget in §10.5. Today (`BookingWizardContext.tsx`):

```ts
const availableBarbers: User[] = selectedService
  ? User.getExtent().filter(u => {
      if (u.role !== UserRole.BARBER) return false;
      if (!u.getBarberServices().some(bs => bs.serviceId === selectedService.id)) return false;
      return u.getSchedules().length > 0;
    })
  : [];
```

This filters the entire `User` extent by a matching id — the exact pattern 4.2.4 calls
insufficient. Fix by giving `Service` a real association back to its barbers, wired the same
way `Schedule`/`BarberService` already wire their `_barber` back-reference in
`lib/store/graphInit.ts`:

1. In `business-objects/Service.ts`, add a private `_barbers: User[] = []` field with
   `addBarber(barber: User): void` and `getBarbers(): User[]` (returning a copy, same
   convention as every other getter in this file).
2. In `business-objects/BarberService.ts`, add a `_service: Service | null = null` field with
   `setServiceInternal(service: Service): void` / `getService(): Service | null`, mirroring
   the existing `_barber`/`setBarberInternal`/`getBarber` pattern exactly.
3. In `lib/store/graphInit.ts`, extend the existing `BarberService.getExtent().forEach(...)`
   loop (it currently only resolves `barberId`) to also resolve `serviceId` and wire both
   directions: `bs.setServiceInternal(service)` and `service.addBarber(barber)`.
4. In `BookingWizardContext.tsx`, replace `availableBarbers` with:
   ```ts
   const availableBarbers: User[] = selectedService
     ? selectedService.getBarbers().filter(b => b.getSchedules().length > 0)
     : [];
   ```
   — a real association traversal (`selectedService.getBarbers()`), filtered only by the
   *separate*, non-identity condition "has a schedule at all" (that's a legitimate business
   predicate on the already-resolved related objects, not a substitute for the association
   lookup itself — same distinction §10.1 draws for the Java side).

### 10.7 Compliance checklist against MAS §4.2.4

Before calling this done, confirm:
- [ ] At least one Java repository call chain goes `findById`/`findAll` → mapped getter
  (`barber.getServices()` or `service.getBarbers()`) with no `WHERE`-equivalent anywhere in
  between, for both new endpoints in §10.3.
- [ ] `barber_service.service_id` has a real uniqueness constraint (§10.2), and the seed data
  in §10.4 has zero duplicate service ids across barbers.
- [ ] The merged booking screen (§10.5) shows two list-typed widgets simultaneously (services,
  barbers), not one widget or a single text field, and the right-hand list is driven by
  `selectedService.getBarbers()` (§10.6) end to end — not a `.filter()` over the full user
  list, on either the Java or the TS side.
- [ ] Selected service and selected barber are both visibly highlighted at once on that
  screen.
- [ ] The stepper header shows 3 steps, not 4, and Back/Continue render via the same
  `renderNav()` in the same position on every step.
