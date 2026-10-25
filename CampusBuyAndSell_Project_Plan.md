# CampusSwap: Project Description and Complete Build Plan

> A student marketplace for buying, selling and swapping items, with offer negotiation, real-time chat and a verified deal flow.
> **Stack:** MERN (MongoDB, Express, React, Node) + Socket.io + Cloudinary
> **Deadline:** 27 October 2026, 11:59 PM IST
> **Submission form:** https://forms.gle/sBy4sfqyiRG2Zpom9

---

## 1. Project Overview

### Problem Statement
Students sell and swap books, cycles, electronics and hostel items through scattered WhatsApp groups. There is no structured price negotiation, no record of deals, no way to search, and no trust signals. Listings get buried, people ghost each other, and the same item gets promised to several buyers.

### Target Users
- **Students** (buyers and sellers) within a college or campus community
- **Admin** (moderator) who removes inappropriate listings and users

### Solution
CampusSwap gives students one place to list items, negotiate through structured offers and counter-offers, chat with the other party, and complete the deal with mutual confirmation and ratings. The backend enforces the rules (for example, an item can only be reserved for one buyer), so deals stay consistent.

### The 4 Core Workflows (the guidelines ask for 3-5 done properly)
1. **Listing:** create a listing with images (sell, swap or both); browse, search and filter.
2. **Negotiation:** make an offer (cash, swap item, or cash + swap); the seller accepts, rejects or counters.
3. **Chat:** a real-time conversation between buyer and seller, per listing.
4. **Deal completion:** the listing is reserved, both sides confirm the handover, the listing is marked sold/swapped, and each party can rate the other.

### Why this is not "basic CRUD"
- Three linked **state machines** (Listing, Offer, Deal) enforced on the server
- **Concurrency control** so two offers cannot both be accepted
- **Counter-offer chains** (each counter links to its parent offer)
- **Real-time chat** with authenticated sockets and room-level authorization
- **Role-based access** (user, owner-only actions, admin)
- **Reputation system** built from verified deals only

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite), React Router, Axios | Fast dev server, simple routing |
| Styling | Tailwind CSS (or plain CSS) | Quick, consistent UI |
| Backend | Node.js + Express | Standard for MERN |
| Database | MongoDB Atlas + Mongoose | Flexible documents, free hosted tier |
| Auth | JWT + bcrypt | Stateless, simple |
| Validation | Zod or express-validator | Reject bad input early |
| Images | Multer + Cloudinary | Never store images in the database |
| Real-time | Socket.io | Rooms and auth middleware built in |
| Hosting | Vercel/Netlify (frontend), Render (backend), Atlas (DB) | All have free tiers; Render supports WebSockets |

---

## 3. Architecture

```text
React SPA (Vite)
   |  REST (Axios + JWT)        |  WebSocket (Socket.io + JWT)
   v                            v
Express API  ------------------ Socket.io server (same HTTP server)
   |  middleware: auth, validate, error handler
   |  controllers -> services (state machine rules)
   v
MongoDB Atlas (Mongoose)            Cloudinary (images)
```

**Principles**
- Controllers stay thin; business rules (state transitions) live in service functions.
- The user identity always comes from the JWT (`req.user.id`), never from the request body.
- One global error handler returns consistent JSON errors.

### Suggested Folder Structure

```text
campusswap/
  client/
    src/
      api/            axios instance, API helpers
      components/     ListingCard, OfferCard, ChatBox, Navbar, Loader, EmptyState
      context/        AuthContext
      pages/          Home, Login, Register, ListingDetail, CreateListing,
                      MyListings, MyOffers, Inbox, Chat, Deals, Profile, Admin
      routes/         ProtectedRoute, AdminRoute
      App.jsx
  server/
    src/
      config/         db.js, cloudinary.js
      models/         User, Listing, Offer, Conversation, Message, Deal, Review
      controllers/
      services/       offerService, dealService
      routes/
      middleware/     auth.js, role.js, upload.js, validate.js, errorHandler.js
      sockets/        chatSocket.js
      app.js
      server.js
    .env.example
  README.md
  .gitignore
```

---

## 4. Data Models (Mongoose)

**User:** `name, email (unique), passwordHash, role (user|admin), college, avatar, ratingAvg, ratingCount, isBanned`

**Listing:** `seller, title, description, category, condition, price, type (sell|swap|both), images[], status (active|reserved|sold|swapped|removed), acceptedOffer`
- Text index on `title` and `description`; index on `status`, `category`, `price`

**Offer:** `listing, buyer, seller, type (cash|swap|cash+swap), amount, offeredListing, message, status (pending|accepted|rejected|countered|withdrawn), parentOffer, lastActionBy`

**Conversation:** `listing, buyer, seller, lastMessage, lastMessageAt`
- Unique index on `{ listing, buyer }`

**Message:** `conversation, sender, text (max 1000), type (user|system)`
- Index on `{ conversation, createdAt }`

**Deal:** `listing, offer, buyer, seller, buyerConfirmed, sellerConfirmed, status (awaiting_handover|completed|cancelled)`

**Review:** `deal, reviewer, reviewee, rating (1-5), comment`
- Unique index on `{ deal, reviewer }` so each party reviews once

---

## 5. State Machines (your main talking point)

```text
Listing:  active --accept offer--> reserved --both confirm--> sold / swapped
                                      |
                                      +--deal cancelled--> active

Offer:    pending --> accepted | rejected | countered | withdrawn
          (a counter creates a NEW pending offer linked by parentOffer;
           the old one becomes "countered")

Deal:     awaiting_handover --> completed | cancelled
```

### Rules enforced on the backend
- Cannot offer on your own listing
- Cannot offer on a listing that is not `active`
- Only one pending offer per buyer per listing
- Only the **seller** can accept, reject or counter a buyer's offer; only the **buyer** can accept or reject a seller's counter
- Only the offer creator can withdraw it
- Accepting an offer reserves the listing and auto-rejects all other pending offers
- Cash amount must be positive; swap offers must reference an item the buyer owns that is `active`

### Concurrency-safe accept

```js
const listing = await Listing.findOneAndUpdate(
  { _id: listingId, status: 'active', seller: req.user.id },
  { status: 'reserved', acceptedOffer: offerId },
  { new: true }
);
if (!listing) return res.status(409).json({ message: 'Listing no longer available' });

await Offer.updateMany(
  { listing: listingId, _id: { $ne: offerId }, status: 'pending' },
  { status: 'rejected' }
);
```

---

## 6. API Routes

```text
AUTH
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

LISTINGS
GET    /api/listings                  (search, category, minPrice, maxPrice, condition, type, page)
POST   /api/listings                  (auth, multipart images)
GET    /api/listings/:id
PUT    /api/listings/:id              (owner only)
DELETE /api/listings/:id              (owner or admin)
GET    /api/listings/mine

OFFERS
POST   /api/listings/:id/offers
GET    /api/offers/mine               (sent and received)
PATCH  /api/offers/:id/accept
PATCH  /api/offers/:id/reject
PATCH  /api/offers/:id/counter
PATCH  /api/offers/:id/withdraw

CHAT
POST   /api/listings/:id/conversation (get or create)
GET    /api/conversations
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

DEALS AND REVIEWS
GET    /api/deals/mine
PATCH  /api/deals/:id/confirm
PATCH  /api/deals/:id/cancel
POST   /api/deals/:id/review
GET    /api/users/:id                 (public profile + ratings)

ADMIN
GET    /api/admin/listings
DELETE /api/admin/listings/:id
PATCH  /api/admin/users/:id/ban
```

---

## 7. Step-by-Step Build Plan

Today is **25 Oct**. You have about 2 days. Commit after every step with a clear message (the guidelines check your Git history). Each step lists a suggested commit message.

### PHASE 0: Setup (about 1 hour)

**Step 0.1: Repo and tooling**
- Create a GitHub repo, clone it, add `.gitignore` (node_modules, `.env`, build folders)
- Create `client/` (`npm create vite@latest client -- --template react`) and `server/` (`npm init -y`)
- Install server deps: `express mongoose cors dotenv jsonwebtoken bcryptjs multer cloudinary zod socket.io helmet morgan express-rate-limit`
- Install client deps: `react-router-dom axios socket.io-client`
- Commit: `chore: initialize client and server projects`

**Step 0.2: Accounts and secrets**
- Create a MongoDB Atlas free cluster and get the connection string
- Create a Cloudinary account (cloud name, API key, secret)
- Create `server/.env` and `server/.env.example`:

```text
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- Commit: `chore: add env example and db connection`

**Step 0.3: Server skeleton**
- `app.js` with `cors({ origin: CLIENT_URL })`, `helmet`, `express.json()`, a `/api/health` route, and the global error handler
- Connect to MongoDB in `server.js`
- Commit: `feat: express app with health check and error handler`

---

### PHASE 1: Authentication (about 2 hours)

**Step 1.1: User model and auth routes**
- Hash passwords with bcrypt (cost 10+); never return `passwordHash`
- `register`: validate input, reject duplicate email (409)
- `login`: generic "invalid credentials" message for wrong email or password
- JWT with expiry (e.g. 7d)
- Commit: `feat: user model with register and login`

**Step 1.2: Auth middleware**
- `protect` middleware verifies the JWT and attaches `req.user`; `requireAdmin` checks the role
- Reject banned users
- Commit: `feat: jwt auth and role middleware`

**Step 1.3: React auth**
- `AuthContext` stores the user and token; Axios interceptor adds `Authorization`; logout on 401
- Pages: Login, Register; `ProtectedRoute`; Navbar that reflects login state
- Show form errors (invalid input, email already used, network failure)
- Commit: `feat: client auth pages and protected routes`

---

### PHASE 2: Listings (about 4 hours)

**Step 2.1: Listing model and image upload**
- Multer with memory storage, limit to 5 images, 5 MB each, allow only jpeg/png/webp
- Upload buffers to Cloudinary; save the returned URLs
- Commit: `feat: listing model and cloudinary image upload`

**Step 2.2: Listing CRUD with ownership**
- Create, read, update, delete; only the owner (or admin) can edit or delete
- Block edits when the listing is `reserved` or `sold`
- Commit: `feat: listing crud with ownership checks`

**Step 2.3: Search, filters, pagination**
- Text search via `$text`, plus filters for category, price range, condition and type
- Pagination (`page`, `limit`) and sort (newest, price low-high)
- Only show `active` listings on the browse page
- Commit: `feat: listing search, filter and pagination`

**Step 2.4: Listing UI**
- Pages: Home (grid + filters + search bar), ListingDetail (image gallery, seller info), CreateListing (image preview), MyListings
- Loading skeletons, empty state ("No listings match your filters"), error states
- Commit: `feat: listing pages with filters`

---

### PHASE 3: Offers and Negotiation (about 5 hours, the heart of the project)

**Step 3.1: Create offer**
- Validate all rules from section 5
- For swap offers, verify the `offeredListing` belongs to the buyer and is `active`
- Commit: `feat: create offer with validation`

**Step 3.2: Accept / reject / withdraw**
- Implement in `offerService.js`; accept uses the atomic `findOneAndUpdate` and auto-rejects other offers
- Accepting creates a `Deal` with `awaiting_handover`
- Commit: `feat: offer accept, reject, withdraw with atomic reservation`

**Step 3.3: Counter-offer**
- Mark the original as `countered`; create a new pending offer with `parentOffer` set, swapping who must respond (`lastActionBy`)
- Show the negotiation history as a timeline on the UI
- Commit: `feat: counter-offer chain`

**Step 3.4: Offers UI**
- ListingDetail: "Make Offer" modal (cash / swap / cash + swap)
- MyOffers page with two tabs: **Sent** and **Received**, with action buttons shown only when valid for the current state and user
- Toasts for success and failure
- Commit: `feat: offers ui with sent/received tabs`

---

### PHASE 4: Chat (about 3 hours)

**Step 4.1: Models and REST chat**
- `Conversation` (unique per listing + buyer) and `Message`
- `startConversation` (upsert), `getInbox`, `getMessages`, `sendMessage`, with the participant-only authorization check on every route
- Commit: `feat: conversation and message api`

**Step 4.2: Chat UI with polling (working version first)**
- `ChatBox` polls every 3 seconds with `clearInterval` cleanup; auto-scroll; empty state "Say hi!"
- "Chat with seller" button on ListingDetail; Inbox page sorted by `lastMessageAt`
- Commit: `feat: chat ui with polling`

**Step 4.3: Upgrade to Socket.io**
- Use `http.createServer(app)`; authenticate sockets with the JWT in `handshake.auth`
- `conversation:join` only succeeds for the buyer or seller
- REST `sendMessage` emits `message:new` to the room; client de-duplicates by `_id`; remove polling
- Commit: `feat: real-time chat with socket.io`

**Step 4.4: System messages**
- When an offer is made, countered, accepted or rejected, insert a `type: 'system'` message in the conversation (for example, "Offer of Rs 500 made")
- Commit: `feat: system messages for offer events`

---

### PHASE 5: Deals and Reviews (about 3 hours)

**Step 5.1: Handover confirmation**
- `confirm` sets `buyerConfirmed` or `sellerConfirmed` depending on the caller; when both are true, set Deal `completed` and Listing `sold` (or `swapped`)
- For swap deals, also mark the offered item as `swapped`
- `cancel` sets the Deal `cancelled`, the Listing back to `active`, and the accepted offer to `withdrawn`
- Commit: `feat: deal confirmation and cancellation`

**Step 5.2: Reviews**
- Allowed only on `completed` deals, once per party; update the reviewee's `ratingAvg` and `ratingCount`
- Public profile page with rating and past listings
- Commit: `feat: reviews and seller ratings`

**Step 5.3: Deals UI**
- Deals page with status badges and "Confirm handover" / "Cancel" buttons; review form after completion
- Commit: `feat: deals page and review form`

---

### PHASE 6: Admin, Hardening, Polish (about 3 hours)

**Step 6.1: Admin**
- Admin page to list and remove listings and to ban users
- Commit: `feat: admin moderation`

**Step 6.2: Security and robustness**
- `helmet`, `express-rate-limit` (stricter on `/api/auth`), request size limits
- Validate all request bodies and `ObjectId` params; return 400 for malformed IDs
- Confirm no secrets are in the repo (`git log -p | grep -i secret` as a quick sanity check)
- Commit: `chore: security hardening and validation`

**Step 6.3: UX pass**
- Every page has loading, empty, success and error states
- Disable buttons while requests are in flight (prevents duplicate offers)
- Mobile-friendly layout; a clear landing section explaining what CampusSwap does
- Commit: `style: ux polish and responsive layout`

**Step 6.4: Seed data**
- Seed script that creates 2 demo users and about 10 listings, so evaluators see content immediately
- Commit: `chore: add seed script`

---

### PHASE 7: Deployment (about 2 hours)

**Step 7.1: Backend on Render**
- Web service from the `server/` folder; build command `npm install`, start command `node src/server.js`
- Add all env vars (Mongo URI, JWT secret, Cloudinary keys, `CLIENT_URL` = your frontend URL)
- Atlas: allow access from anywhere (`0.0.0.0/0`) for the demo
- Note: the free tier sleeps when idle, so open the URL once before the demo and before submitting

**Step 7.2: Frontend on Vercel or Netlify**
- Root directory `client/`; set `VITE_API_URL` to the Render URL
- Add an SPA rewrite so React Router routes work on refresh (`vercel.json` rewrite to `/index.html`)

**Step 7.3: Verify in production**
- Register, create a listing with images, make an offer, chat, and complete a deal using the deployed URLs
- Confirm CORS and WebSocket connections work
- Commit: `chore: deployment configuration`

---

### PHASE 8: Documentation, Demo, Submission (about 3 hours)

**Step 8.1: README** (must include every section the guidelines list)
- Project Name, Problem Statement, Target Users, Solution, Key Features, Tech Stack, Architecture (include the diagram above), Local Setup, Environment Variables, Deployment links
- Add: state machine diagrams, API route list, demo credentials, limitations and future work
- Commit: `docs: complete readme`

**Step 8.2: Demo video (3-5 minutes)**
Use two browser windows (buyer and seller):
1. (20s) The problem: WhatsApp chaos; who it is for
2. (40s) Seller creates a listing with images
3. (50s) Buyer searches, makes a swap offer
4. (50s) Seller counters; buyer accepts; show the other pending offers being auto-rejected
5. (40s) Real-time chat between both windows
6. (40s) Both confirm handover; listing becomes sold; leave a review
7. (20s) Show the architecture slide and mention the concurrency handling

Do not read code for most of it; show the product working.

**Step 8.3: Final checks and submission**
- Open the GitHub repo, deployed app and video link in an **incognito window**
- Make sure the repo is public (or accessible to evaluators) and the video link is viewable
- Complete the submission form before **27 Oct, 11:59 PM IST**; aim to submit several hours early

---

## 8. Suggested Time Allocation

| Block | Work | Hours |
|---|---|---|
| Day 1 morning | Phase 0 + Phase 1 | 3 |
| Day 1 afternoon | Phase 2 | 4 |
| Day 1 evening | Phase 3 (backend) | 3 |
| Day 2 morning | Phase 3 (UI) + Phase 4 | 5 |
| Day 2 afternoon | Phase 5 + Phase 6 | 5 |
| Day 2 night / 27 Oct morning | Phase 7 + Phase 8 | 5 |

If you fall behind, cut in this order (and keep the core intact):
1. Admin moderation
2. Reviews and ratings
3. Socket.io (keep polling)
4. System messages in chat
5. Swap offers (keep cash offers and counters)

**Never cut:** auth, listings, offers with accept/counter, the deal flow, deployment, README and the demo video.

---

## 9. Testing Checklist (manual is fine)

- [ ] Register with a duplicate email fails with a clear message
- [ ] Cannot access protected pages or APIs without logging in
- [ ] Non-owner cannot edit or delete a listing (403)
- [ ] Cannot offer on your own listing
- [ ] Cannot send a second pending offer on the same listing
- [ ] Two offers: accepting one auto-rejects the other
- [ ] Two quick accept clicks do not break the state (second returns 409)
- [ ] Counter-offer creates a linked offer and updates statuses
- [ ] Non-participant cannot read a chat or join its socket room
- [ ] Messages appear in real time in both windows, without duplicates
- [ ] Both confirmations are required to complete a deal
- [ ] Cancelling a deal returns the listing to `active`
- [ ] Image upload rejects wrong file types and oversized files
- [ ] Refreshing a deep link works on the deployed frontend

---

## 10. Final Submission Checklist (from the guidelines)

- [ ] The project is a functional software application
- [ ] Problem and target user are clearly defined
- [ ] Core workflows actually work (in the deployed version)
- [ ] Meaningful engineering logic (state machines, concurrency, real-time)
- [ ] Important failures are handled (validation, 4xx errors, upload failures)
- [ ] No secrets or credentials in the repo
- [ ] Git history shows incremental development
- [ ] README complete, with architecture documented
- [ ] Application deployed and reachable
- [ ] Demo video accessible
- [ ] All links verified in an incognito window
- [ ] Submission form completed before **27 Oct 2026, 11:59 PM IST**

**Submission details to paste into the form:**

```text
Project Name: CampusSwap
Student Name:
Problem Statement: Students trade items through unstructured chat groups with no
  negotiation, tracking or trust. CampusSwap provides listings, structured offers
  and counter-offers, real-time chat and a verified deal flow.
GitHub Repository:
Deployed Application / Build:
Demo Video:
Tech Stack: React, Node.js, Express, MongoDB, Socket.io, Cloudinary, JWT
Major Features: Listings with image upload and search; offer / counter-offer
  state machine with concurrency-safe acceptance; real-time buyer-seller chat;
  deal confirmation and ratings
```

---

## 11. Talking Points for Evaluation

- **Product understanding:** why structured offers beat unstructured chat groups
- **Core implementation:** four complete workflows rather than many half-built ones
- **Engineering depth:** server-enforced state machines, atomic reservation, authenticated sockets
- **Architecture:** thin controllers, service-layer rules, images offloaded to Cloudinary
- **Reliability:** validation, ownership checks, consistent error responses, loading/empty/error states
- **Honesty about limits:** payments are out of scope (cash is exchanged in person), and the free-tier backend may sleep when idle
