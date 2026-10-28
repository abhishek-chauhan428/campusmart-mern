# CampusMart

CampusMart is a MERN-based campus marketplace built for students to buy and sell items within their own college community.

## 🚀 Demo & Deployment

- 🎥 **Demo Video:** [Watch the CampusMart Demo](https://drive.google.com/file/d/16KgVZB2KXvX2SSPKoHZWQQZ-bOuk40Qs/view?usp=sharing)
- 🌐 **Live Demo:** [CampusMart – Deployed Application](https://campusmart-mern.vercel.app/)

The application is designed around a simple but complete marketplace workflow:

```text
College Student
      ↓
Register with College Email
      ↓
Browse Same-College Listings
      ↓
View Listing
      ↓
Make an Offer
      ↓
Seller Accepts One Offer
      ↓
Deal Is Created
      ↓
Buyer + Seller Complete Handover
      ↓
Both Confirm Handover
      ↓
Deal Becomes Completed
```

The important part of CampusMart is not only listing CRUD. The application implements a complete marketplace transaction workflow with authentication, college-domain isolation, image uploads, structured offers, atomic reservation, deal state management, and two-party handover confirmation.

---

## 1. Problem Statement

Students often want to buy or sell used items such as:

- Books
- Electronics
- Furniture
- Accessories
- Study material
- Hostel items
- Other useful student-to-student products

A general marketplace can be too broad for a campus environment. Students usually want to interact with people from their own college community.

CampusMart solves this by providing a marketplace where a student:

1. Creates an account using an approved college email domain.
2. Can see listings from students belonging to the same college email domain.
3. Can create listings and upload item images.
4. Can search and filter available listings.
5. Can negotiate through structured offers.
6. Can accept an offer and reserve the listing.
7. Can complete the physical handover.
8. Requires both buyer and seller to confirm the handover before the deal is marked completed.

---

## 2. Target Users

CampusMart is intended for college students who want to buy and sell items within their college community.

The system uses the student's verified email domain as the source of truth for college membership.

For example, if the allowed domain is:

```text
sst.scaler.com
```

then:

```text
student1@sst.scaler.com
student2@sst.scaler.com
```

belong to the same marketplace community.

A student using:

```text
student@othercollege.edu
```

cannot participate in that marketplace community.

---

# 3. Core Product Workflow

## Workflow 1: Student Registration

A new user starts by creating an account.

### Registration flow

```text
Registration Form
      ↓
Enter name
      ↓
Enter college email
      ↓
Enter password
      ↓
Validate input
      ↓
Extract email domain
      ↓
Check against allowed college domains
      ↓
Create account
      ↓
Return authenticated user
```

### College-domain validation

The allowed domains are configured on the backend using:

```env
COLLEGE_EMAIL_DOMAINS=sst.scaler.com
```

Multiple domains can be configured using commas:

```env
COLLEGE_EMAIL_DOMAINS=sst.scaler.com,anothercollege.edu
```

The backend:

1. Normalizes the email to lowercase.
2. Extracts everything after `@`.
3. Compares the domain against `COLLEGE_EMAIL_DOMAINS`.
4. Rejects registration if the domain is not allowed.

The college/domain is therefore not something the user can freely choose to bypass marketplace isolation.

### Example

Allowed:

```text
rahul@sst.scaler.com
```

Rejected:

```text
rahul@gmail.com
rahul@othercollege.edu
```

The restriction is enforced by the backend, not only by the frontend.

---

# 4. Authentication

CampusMart uses JWT-based authentication.

After successful registration/login:

```text
User
 ↓
Email + Password
 ↓
Backend validates credentials
 ↓
Password checked using bcrypt
 ↓
JWT generated
 ↓
Frontend stores authentication state
 ↓
JWT sent with protected API requests
```

Protected resources require a valid authentication token.

Authentication is used because listings, offers, deals, and ownership actions belong to individual users.

---

# 5. College Marketplace Isolation

This is one of the important application rules in CampusMart.

## Rule

A student can only interact with listings belonging to sellers from the same approved college email domain.

The backend derives the college identity from:

```text
user.email → email domain
```

It does not rely on a manually entered college value as the security boundary.

### Example

Buyer:

```text
abhi@sst.scaler.com
```

Seller:

```text
seller@sst.scaler.com
```

Result:

```text
Allowed
```

Buyer:

```text
abhi@sst.scaler.com
```

Seller:

```text
seller@othercollege.edu
```

Result:

```text
Blocked
```

## Where the rule is enforced

The restriction is enforced server-side in the important marketplace operations.

### Listing browse

The marketplace listing feed is restricted to listings belonging to users from the current user's college email domain.

### Listing detail

Even if a user tries to open a listing directly using its ID, the backend checks the seller's email domain.

A listing from another college is not exposed through the protected listing detail route.

### Offers

Before creating an offer, the backend checks:

```text
buyer email domain
        ==
seller email domain
```

If they do not match, the offer is rejected.

This prevents bypassing the marketplace restriction by calling the API directly.

### Why this matters

Frontend filtering alone is not enough.

A user could otherwise:

```text
Hide listing in UI
      ↓
Call API manually
      ↓
Access listing
      ↓
Submit offer
```

CampusMart therefore performs the important domain checks on the backend.

---

# 6. Creating a Listing

A logged-in student can create a listing.

Typical listing information includes:

- Title
- Description
- Price
- Category
- Condition
- Images
- Other listing information supported by the application

### Listing creation flow

```text
Create Listing
      ↓
Enter item details
      ↓
Select images
      ↓
Validate form
      ↓
Send multipart request
      ↓
Backend validates authentication
      ↓
Validate listing fields
      ↓
Upload images
      ↓
Store Cloudinary image URLs
      ↓
Create MongoDB listing
      ↓
Listing appears in marketplace
```

Images are uploaded using Cloudinary.

The backend uses multipart upload handling and validates supported image types and upload limits.

The frontend sends listing images using `FormData`.

---

# 7. Listing Ownership

Every listing belongs to the user who created it.

The seller identity is stored with the listing.

Ownership is checked before protected listing operations.

This prevents another authenticated student from modifying or deleting someone else's listing.

Typical lifecycle:

```text
Seller creates listing
       ↓
Listing is active
       ↓
Students can browse it
       ↓
Seller can manage their listing
       ↓
Offer accepted
       ↓
Listing becomes reserved/sold according to deal state
```

---

# 8. Marketplace Search and Filtering

Students can discover listings through the marketplace.

The frontend supports marketplace discovery using:

- Search
- Category filtering
- Condition filtering
- Price filtering

The backend processes listing queries so that filtering happens against persisted marketplace data.

Search/filtering does not bypass college isolation.

The final result is still restricted to listings that the authenticated student is allowed to see.

Conceptually:

```text
Authenticated User
       ↓
Determine College Domain
       ↓
Query Marketplace
       ↓
Apply Search
       ↓
Apply Category
       ↓
Apply Condition
       ↓
Apply Price
       ↓
Return Allowed Listings
```

---

# 9. Making an Offer

A buyer can make a structured offer on an active listing.

An offer contains information such as:

- Listing
- Buyer
- Seller
- Offered amount
- Optional message
- Offer status
- Timestamps

### Offer flow

```text
Buyer opens listing
       ↓
Clicks Make Offer
       ↓
Enters amount
       ↓
Optionally enters message
       ↓
Backend checks authentication
       ↓
Backend checks listing exists
       ↓
Backend checks listing is active
       ↓
Backend prevents seller from offering on own listing
       ↓
Backend checks college-domain match
       ↓
Backend checks duplicate pending offer
       ↓
Offer is created
```

---

# 10. Duplicate Pending Offer Protection

A buyer should not create multiple pending offers for the same listing.

CampusMart protects this at the database/application level.

The Offer model uses a unique partial index for:

```text
listing + buyer
```

while the offer status is:

```text
pending
```

Therefore, two pending offers from the same buyer for the same listing are not allowed.

Example:

```text
Buyer → Listing A → Offer ₹900 → pending
Buyer → Listing A → Offer ₹950 → blocked
```

The buyer can still interact with the listing according to the application's offer lifecycle after an existing pending offer is no longer pending.

---

# 11. Offer States

Offers use explicit states rather than a simple boolean.

The supported offer statuses are:

```text
pending
accepted
rejected
withdrawn
```

### Pending

The offer has been submitted and is waiting for the seller.

### Accepted

The seller has accepted the offer.

Acceptance creates the corresponding deal.

### Rejected

The seller has rejected the offer.

### Withdrawn

The buyer has withdrawn the offer.

Withdrawn offers are not treated as active marketplace negotiations.

---

# 12. Seller Accepting an Offer

The seller can review received offers.

The seller can accept an offer only when the offer and listing are still eligible.

The important part is that accepting an offer is an atomic operation.

The system does not simply:

```text
Read listing
 ↓
Check active
 ↓
Later update listing
```

because two buyers could potentially be accepted at the same time.

Instead, the backend uses an atomic database update to reserve the listing.

Conceptually:

```text
Offer A ─────┐
             ├──→ Atomic listing reservation
Offer B ─────┘
                    ↓
             Only one can win
```

If another offer attempts to win after the listing has already been reserved, the request is rejected.

This protects the marketplace from race conditions where two buyers could otherwise both become winners.

---

# 13. Deal Creation

When the seller successfully accepts an eligible offer:

```text
Offer
  ↓
Accepted
  ↓
Listing atomically reserved
  ↓
Deal created
```

The deal stores the important transaction participants:

- Listing
- Offer
- Buyer
- Seller
- Agreed amount
- Deal status
- Buyer confirmation state
- Seller confirmation state
- Optional handover note

The accepted offer therefore becomes the basis for the transaction.

---

# 14. Deal States

Deals have explicit states.

The main states are:

```text
awaiting_handover
completed
cancelled
```

## awaiting_handover

The seller has accepted the offer and the transaction is waiting for the physical exchange/handover.

At this point the buyer and seller still need to meet and complete the handover.

## completed

The physical handover has been confirmed by both participants.

## cancelled

The deal has been cancelled and can no longer proceed through normal confirmation.

---

# 15. Handover Confirmation

This is an important part of the CampusMart workflow.

A deal should not become completed merely because the seller accepted the offer.

The real-world transaction still has to happen.

The system therefore requires confirmation from **both the buyer and the seller**.

### Confirmation flow

```text
Deal created
     ↓
awaiting_handover
     ↓
Physical item handover
     ↓
Buyer confirms
     ↓
Seller confirms
     ↓
Both confirmations = true
     ↓
Deal becomes completed
```

The order of confirmation does not matter.

### Example 1

```text
Buyer confirms
Seller confirms
```

Result:

```text
completed
```

### Example 2

```text
Seller confirms
Buyer confirms
```

Result:

```text
completed
```

### Example 3

```text
Buyer confirms
Seller does not confirm
```

Result:

```text
Still awaiting_handover
```

### Example 4

```text
Seller confirms
Buyer does not confirm
```

Result:

```text
Still awaiting_handover
```

This means a single user cannot falsely mark a deal as fully completed.

---

# 16. Why Two Confirmations Are Required

The marketplace represents a physical transaction.

The backend cannot automatically know whether:

- The buyer actually received the item.
- The seller actually handed over the item.
- The agreed transaction happened in person.

Therefore, both participants confirm the handover.

This provides a simple two-party acknowledgement:

```text
Buyer says: "I received it."
Seller says: "I handed it over."
                 ↓
          Deal completed
```

This is an application workflow rather than simple CRUD.

---

# 17. Handover Notes

The deal supports a handover note.

This can be used to record a short useful note about the exchange, subject to the application's validation limits.

For example:

```text
Handed over at campus library.
```

or:

```text
Met near hostel reception.
```

The note is associated with the deal rather than being stored as an unrelated listing field.

---

# 18. Deal Cancellation

A participant can cancel a deal when the deal is in an appropriate state.

The backend verifies that:

- The user is actually a participant in the deal.
- The deal is not already cancelled/completed.
- The requested state transition is valid.

Once a deal is cancelled, further confirmation is blocked.

For example:

```text
Deal
 ↓
cancelled
 ↓
Buyer tries to confirm
 ↓
Rejected
```

This prevents an invalid state transition.

---

# 19. Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to perform this action?

CampusMart uses authorization for operations such as:

### Listing ownership

Only the listing owner should manage their listing.

### Offer acceptance

Only the seller associated with the listing can accept an offer.

### Offer actions

Offer operations are restricted to the appropriate buyer/seller participants.

### Deal actions

Only the buyer or seller participating in the deal can confirm/cancel it.

### College isolation

Only users belonging to the same college email domain can participate in the marketplace relationship.

---

# 20. Error and Invalid-State Handling

The application handles important failure scenarios instead of assuming every request succeeds.

Examples include:

### Invalid registration

```text
Invalid input
       ↓
400 response
```

### Disallowed college email

```text
Other college domain
       ↓
Registration rejected
```

### Unauthorized request

```text
No/invalid JWT
       ↓
401 response
```

### Banned user

```text
Authenticated but banned
       ↓
403 response
```

### Duplicate pending offer

```text
Existing pending offer
       ↓
409 response
```

### Different-college offer

```text
Buyer domain != seller domain
       ↓
403 response
```

### Inactive listing

```text
Listing no longer active
       ↓
Offer rejected
```

### Concurrent offer acceptance

```text
Two sellers/requests attempt reservation
       ↓
Atomic database condition
       ↓
Only one succeeds
```

### Invalid deal transition

```text
Cancelled deal
       ↓
Confirmation attempt
       ↓
409 response
```

---

# 21. Frontend Structure

The frontend is a React + Vite application.

Important areas include:

```text
client/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   ├── pages/
│   │   ├── Browse.jsx
│   │   ├── CreateListing.jsx
│   │   ├── Deals.jsx
│   │   ├── ListingDetail.jsx
│   │   ├── Offers.jsx
│   │   └── Profile.jsx
│   └── App.jsx
└── ...
```

The frontend communicates with the Express backend through Axios.

Protected requests include the user's JWT.

---

# 22. Offers Page

The Offers area allows the user to understand their offer activity.

There are two important perspectives:

### Sent offers

Offers created by the current user as a buyer.

### Received offers

Offers made by other students on the current user's listings.

The UI exposes the offer state so users can understand whether an offer is:

```text
Pending
Accepted
Rejected
Withdrawn
```

Withdrawn offers are not treated as active offers in the dashboard.

---

# 23. Deals Page

The Deals area represents transactions that have moved beyond the offer stage.

A deal shows information about the transaction and its current state.

Typical progression:

```text
Offer accepted
      ↓
Awaiting handover
      ↓
Buyer confirmation
      ↓
Seller confirmation
      ↓
Completed
```

or:

```text
Awaiting handover
      ↓
Cancelled
```

The UI should make it clear whether the user still needs to confirm the handover.

---

# 24. Backend Architecture

The backend is an Express application connected to MongoDB through Mongoose.

High-level architecture:

```text
React Client
     │
     │ HTTP / JSON / multipart
     ↓
Express API
     │
     ├── Authentication middleware
     ├── Validation
     ├── Controllers
     ├── Business rules
     └── Authorization
     │
     ↓
Mongoose Models
     │
     ↓
MongoDB
```

Cloudinary is used for listing image storage.

---

# 25. Backend Project Structure

The backend follows a controller/route/model structure.

```text
server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dealController.js
│   │   ├── listingController.js
│   │   └── offerController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── validation.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── Offer.js
│   │   └── Deal.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── offerRoutes.js
│   │   └── dealRoutes.js
│   │
│   ├── utils/
│   │   └── college.js
│   │
│   ├── app.js
│   └── server.js
│
├── test/
├── .env.example
├── package.json
└── seed.js
```

---

# 26. Important Data Models

## User

A user represents a student account.

Important information includes:

```text
name
email
passwordHash
college
```

The email domain is used for marketplace college isolation.

Passwords are stored as hashes rather than plain text.

---

## Listing

A listing represents an item being sold.

It is associated with a seller/user.

The listing also contains the marketplace item information and its current lifecycle/status.

---

## Offer

An offer connects:

```text
Buyer
  ↓
Listing
  ↓
Seller
```

and stores the proposed amount and offer status.

---

## Deal

A deal represents the transaction created after an offer is accepted.

It connects:

```text
Listing
Offer
Buyer
Seller
Agreed Amount
Deal Status
Buyer Confirmation
Seller Confirmation
Handover Note
```

This separates negotiation from the actual transaction lifecycle.

---

# 27. API Workflow

The application exposes REST-style endpoints.

Representative route groups include:

```text
/api/auth
/api/listings
/api/offers
/api/deals
```

Examples of important operations:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/listings
POST   /api/listings
GET    /api/listings/:id
PUT    /api/listings/:id
DELETE /api/listings/:id

POST   /api/listings/:id/offers

GET    /api/offers/sent
GET    /api/offers/received
PATCH  /api/offers/:id/accept
PATCH  /api/offers/:id/reject
PATCH  /api/offers/:id/withdraw

GET    /api/deals
PATCH  /api/deals/:id/confirm
PATCH  /api/deals/:id/cancel
```

The exact request/response validation is implemented by the backend routes and controllers.

---

# 28. Technology Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Lucide React

## Backend

- Node.js
- Express
- Mongoose
- MongoDB
- JWT
- bcryptjs

## Image Storage

- Cloudinary

## Testing

- Node.js built-in test runner
- In-memory MongoDB for local test execution

---

# 29. Environment Variables

Create:

```text
server/.env
```

from:

```text
server/.env.example
```

Example configuration:

```env
PORT=5555
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

COLLEGE_EMAIL_DOMAINS=sst.scaler.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

The actual `.env` file must never be committed.

Do not place real passwords, API keys, JWT secrets, Cloudinary secrets, or database credentials inside:

```text
.env.example
README.md
GitHub source code
```

---

# 30. Client Environment

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5555/api
```

For deployment, this value should point to the deployed backend API.

---

# 31. Local Setup

## Prerequisites

Install:

- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- Git

Cloudinary credentials are required if listing image uploads are being tested.

---

## Clone the repository

```bash
git clone https://github.com/abhishek-chauhan428/campusmart-mern.git
cd campusmart-mern
```

---

## Install backend dependencies

```bash
cd server
npm install
```

---

## Configure backend environment

Create:

```text
server/.env
```

and add the required environment variables.

For the local college marketplace:

```env
COLLEGE_EMAIL_DOMAINS=sst.scaler.com
```

---

## Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

Create:

```text
client/.env
```

with:

```env
VITE_API_URL=http://localhost:5555/api
```

---

# 32. Run the Backend

From:

```text
server/
```

run:

```bash
npx nodemon src/server.js
```

The development API runs on:

```text
http://localhost:5555
```

Health check:

```bash
curl http://localhost:5555/api/health
```

---

# 33. Run the Frontend

From:

```text
client/
```

run:

```bash
npm run dev
```

Vite will provide the local frontend URL, normally:

```text
http://localhost:5173
```

---

# 34. Running Tests

From the `server` directory:

```bash
npm test
```

The test suite covers authentication and marketplace transaction logic.

The important cases include:

- Successful student registration
- Rejection of an unapproved college domain
- Duplicate email rejection
- Invalid input rejection
- Successful login
- Invalid password rejection
- Missing authentication rejection
- Banned user rejection
- Duplicate pending offer protection
- Cross-college offer rejection
- Seller-only offer acceptance
- Deal creation
- Atomic concurrent offer acceptance
- Buyer/seller deal confirmation
- Cancellation and invalid post-cancellation confirmation

The tests use an in-memory MongoDB environment when no `MONGO_URI` is provided.

---

# 35. Recommended End-to-End Demo

For a complete demonstration, use two test accounts from the same college domain.

Example:

```text
seller@sst.scaler.com
buyer@sst.scaler.com
```

## Step 1 — Register seller

Register:

```text
seller@sst.scaler.com
```

Log in.

---

## Step 2 — Create a listing

Create an item such as:

```text
Engineering Mathematics Book
```

Add:

- Title
- Description
- Price
- Category
- Condition
- Image

Submit the listing.

---

## Step 3 — Register buyer

Create:

```text
buyer@sst.scaler.com
```

Log in as the buyer.

---

## Step 4 — Browse marketplace

The buyer should see listings belonging to the same college domain.

Search and filtering can be demonstrated here.

---

## Step 5 — Open listing

Open the seller's listing.

Review:

- Item information
- Price
- Condition
- Images
- Seller information

---

## Step 6 — Make an offer

For example:

```text
Listed price: ₹1000
Offer: ₹850
Message: Can collect from campus.
```

Submit the offer.

---

## Step 7 — Seller reviews offer

Log back in as:

```text
seller@sst.scaler.com
```

Open the Offers area.

The incoming offer should appear as:

```text
pending
```

---

## Step 8 — Seller accepts

Accept the offer.

The backend:

```text
Validates seller
      ↓
Checks offer
      ↓
Atomically reserves listing
      ↓
Accepts offer
      ↓
Creates deal
```

The buyer/seller can now see the deal.

---

## Step 9 — Handover

The two students physically exchange the item.

The deal remains:

```text
awaiting_handover
```

until the participants confirm.

---

## Step 10 — Buyer confirms

The buyer clicks the handover confirmation action.

The deal is still not necessarily completed.

It now has:

```text
buyerConfirmed = true
sellerConfirmed = false
```

---

## Step 11 — Seller confirms

The seller confirms the handover.

Now:

```text
buyerConfirmed = true
sellerConfirmed = true
```

The backend transitions the deal to:

```text
completed
```

This demonstrates the complete marketplace transaction lifecycle.

---

# 36. Important Security Demonstration

A useful security demonstration is to show the college-domain restriction.

Suppose:

```text
Seller:
seller@sst.scaler.com

Buyer:
buyer@othercollege.edu
```

The buyer must not be able to transact with the seller.

The backend prevents this even if the buyer attempts to call the offer API directly.

Expected result:

```text
HTTP 403
```

This demonstrates that the restriction is an actual backend authorization rule rather than only a frontend visibility filter.

---

# 37. Why the Project Has More Than Basic CRUD

CampusMart is not only:

```text
Create Listing
Read Listing
Update Listing
Delete Listing
```

The major workflow is:

```text
Authentication
      ↓
College-domain isolation
      ↓
Marketplace discovery
      ↓
Listing creation
      ↓
Structured offer
      ↓
Duplicate-offer protection
      ↓
Atomic reservation
      ↓
Deal creation
      ↓
Handover
      ↓
Buyer confirmation
      ↓
Seller confirmation
      ↓
Completed transaction
```

This provides meaningful application state and business rules beyond basic CRUD.

The project therefore focuses on depth and reliability of the main marketplace workflow.

---

# 38. Architecture and Engineering Decisions

## JWT Authentication

JWT is used to identify authenticated users across API requests.

## bcrypt Password Hashing

Passwords are never stored as plain text.

## MongoDB + Mongoose

MongoDB provides persistent application data and Mongoose provides structured models and validation.

## Cloudinary

Cloudinary provides external image storage instead of storing large image files directly in MongoDB.

## Server-Side College Isolation

College-domain validation is implemented on the backend so users cannot bypass it by calling the API directly.

## Atomic Offer Acceptance

Listing reservation uses an atomic database update so concurrent offer acceptance cannot produce multiple winners.

## Explicit State Machines

Offers and deals use explicit statuses instead of relying on loosely defined boolean flags.

## Two-Party Confirmation

A deal becomes completed only after both participants confirm the handover.

---

# 39. Git and Version Control

The project is maintained using Git.

The repository should contain meaningful development history rather than only one final upload.

Important development areas include:

```text
Authentication
Marketplace listings
Offers and deals API
Offers and deals UI
Documentation and seed setup
College-domain marketplace isolation
```

Do not commit:

```text
.env
node_modules/
credentials
private keys
API secrets
database passwords
```

---

# 40. Seed Data

The backend includes a seed script for creating development/test data.

From:

```text
server/
```

run:

```bash
npm run seed
```

The seed data is intended for local development and demonstration.

Do not use development seed credentials as production credentials.

---

# 41. Production / Deployment Checklist

Before final submission:

```text
[ ] Backend deployed and accessible
[ ] Frontend deployed and accessible
[ ] Production environment variables configured
[ ] MongoDB production connection configured
[ ] Cloudinary configured
[ ] College email domain configured
[ ] CORS/client URL configured
[ ] No secrets committed
[ ] GitHub repository accessible
[ ] README complete
[ ] Demo video ready
```

The deployed frontend must point to the deployed backend API rather than:

```text
http://localhost:5555
```

---

# 42. Project Documentation and End-Term Requirements

The project is designed around the end-term requirement that the submission should be a complete working software application rather than a static website or disconnected scripts.

The project demonstrates:

- A clearly defined target user
- A concrete marketplace problem
- Persistent application data
- Authentication
- Authorization
- User-generated listings
- Image/file handling
- Search and filtering
- Structured offers
- Transaction state management
- Atomic database logic
- Error handling
- Security controls
- Testing
- Documentation
- Git-based development

The project follows the principle:

```text
Problem
   ↓
Product
   ↓
Architecture
   ↓
Implementation
   ↓
Testing
   ↓
Deployment
```

The end-term guidelines specifically emphasize meaningful application logic, complete workflows, authentication/authorization where appropriate, persistent data, error handling, security, Git history, documentation, and a working deployment.

---

# 43. Final Evaluation Workflow

The most important workflows to demonstrate are:

### Workflow A — Student onboarding

```text
Register
 ↓
College email validation
 ↓
Login
```

### Workflow B — Marketplace

```text
Browse
 ↓
Search/filter
 ↓
Open listing
 ↓
View item details
```

### Workflow C — Selling

```text
Create listing
 ↓
Upload images
 ↓
Receive offer
 ↓
Accept offer
```

### Workflow D — Buying

```text
Browse
 ↓
Make offer
 ↓
Wait for seller
 ↓
Deal created after acceptance
```

### Workflow E — Transaction completion

```text
Deal awaiting handover
 ↓
Buyer confirms
 ↓
Seller confirms
 ↓
Deal completed
```

These workflows represent the core product rather than a collection of unrelated features.

---

# 44. Final Submission Checklist

Before submitting CampusMart:

- [ ] Application works locally
- [ ] Production deployment works
- [ ] Student can register
- [ ] Unapproved email domains are rejected
- [ ] Same-college marketplace isolation works
- [ ] Listings can be created
- [ ] Images upload correctly
- [ ] Search works
- [ ] Filters work
- [ ] Listing ownership is enforced
- [ ] Offers can be created
- [ ] Duplicate pending offers are prevented
- [ ] Cross-college offers are blocked
- [ ] Seller can accept an offer
- [ ] Offer acceptance is atomic
- [ ] Deal is created after acceptance
- [ ] Buyer can confirm handover
- [ ] Seller can confirm handover
- [ ] Deal only becomes completed after both confirmations
- [ ] Cancelled deals cannot be confirmed
- [ ] Important error states are handled
- [ ] Backend tests pass
- [ ] Frontend build passes
- [ ] No secrets are committed
- [ ] README is complete
- [ ] GitHub repository is accessible
- [ ] Demo video is ready
- [ ] Deployment link works
- [ ] Submission form is completed

---

# 45. Demo Story in One Sentence

CampusMart lets verified college students safely discover items within their own college community, negotiate through structured offers, atomically reserve a listing when an offer is accepted, and complete the transaction only after both buyer and seller confirm the physical handover.

---

## License

This project was developed as an end-term software project.
