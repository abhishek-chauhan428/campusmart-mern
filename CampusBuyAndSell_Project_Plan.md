# CampusMart: Project Description and Complete Build Plan

> A campus marketplace where students buy and sell used items: private chat per listing, a formal offer that commits a buyer to a price, atomic reservation, and a deal flow confirmed by both sides.
> **Stack:** MERN (MongoDB, Express, React, Node) + Socket.io + Cloudinary
> **Deadline:** 27 October 2026, 11:59 PM IST
> **Submission form:** https://forms.gle/sBy4sfqyiRG2Zpom9

---

## 1. Project Overview

### Problem Statement
Students buy and sell used items (books, cycles, electronics, hostel essentials) through WhatsApp and Telegram groups. These groups have no search, so listings are buried within hours. Nothing stops a seller from promising the same item to several people, there is no record of who agreed to what, and there is no way to tell whether a stranger is reliable. **CampusMart** gives a campus a structured marketplace: searchable listings, private chat per item, a formal offer that commits a buyer to a price, reservation so an item is promised to only one buyer, handover confirmed by both sides, and ratings built only from completed deals.

### Target Users
- **Students** within a college or campus community. Every user can both sell and buy. "Buyer" and "seller" are not roles; they are just a user's relationship to a particular listing.

### Solution
Buyers browse and search listings, then chat privately with the seller to ask questions and negotiate the price. When a buyer is sure, they submit a formal **offer** at the agreed price. The seller sees all pending offers on an item and accepts the best one. Acceptance atomically reserves the item (so it can only be promised to one buyer), rejects the other pending offers, and creates a **deal**. Both sides then arrange the handover in the same chat and confirm it. The item is marked sold and each party can rate the other. Either side can cancel a deal, which returns the item to the marketplace.

### The 4 Core Workflows (the guidelines ask for 3-5 done properly)
1. **Listing:** create a listing with images; browse, search and filter.
2. **Chat and negotiation:** any buyer can open a private chat with the seller of a listing to ask questions and agree on a price.
3. **Offer and reservation:** a buyer submits an offer; the seller accepts one, which reserves the item and creates a deal.
4. **Deal completion:** both sides confirm the handover, the listing is marked sold, and each party can rate the other. Either side can cancel before completion.

### How the problems map to features

| Problem | Feature |
|---|---|
| Listings get buried in groups | Searchable, filterable listings |
| Same item promised to many people | Accepting an offer atomically reserves the item |
| People back out or ghost | Offer commits a price; both sides confirm handover; either side can cancel, and cancellations are visible on profiles |
| No record of who agreed to what | Deals page, offer history and chat history |
| Can't tell if a stranger is reliable | Ratings that come only from completed deals |
| Haggling and meetup logistics | Private chat per listing |

### Why this is not "basic CRUD"
- Three linked **state machines** (Listing, Offer, Deal) enforced on the server
- **Concurrency control** so two offers cannot both be accepted
- **Real-time chat** with authenticated sockets and room-level authorization
- **Ownership-based authorization** (only the seller can accept offers, only participants can read a chat, only the owner can edit a listing)
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
- Authorization is based on ownership and participation, not on user roles.
- One global error handler returns consistent JSON errors.

### Suggested Folder Structure

```text
campusmart/
  client/
    src/
      api/            axios instance, API helpers
      components/     ListingCard, OfferCard, ChatBox, Navbar, Loader, EmptyState
      context/        AuthContext
      pages/          Home, Login, Register, ListingDetail, CreateListing,
                      MyListings, MyOffers, Inbox, Chat, Deals, Profile
      routes/         ProtectedRoute
      App.jsx
  server/
    src/
      config/         db.js, cloudinary.js
      models/         User, Listing, Offer, Conversation, Message, Deal, Review
      controllers/
      services/       offerService, dealService
      routes/
      middleware/     auth.js, upload.js, validate.js, errorHandler.js
      sockets/        chatSocket.js
      app.js
      server.js
    .env.example
  README.md
  .gitignore
```

---

## 4. Data Models (Mongoose)

**User:** `name, email (unique), passwordHash, college, ratingAvg, ratingCount, cancelledDeals`

**Listing:** `seller, title, description, category, condition, price, images[], status (active|reserved|sold), acceptedOffer`
- Text index on `title` and `description`; index on `status`, `category`, `price`

**Offer:** `listing, buyer, seller, amount, message, status (pending|accepted|rejected|withdrawn)`
- Unique partial index on `{ listing, buyer }` where `status = pending`, so a buyer can have only one pending offer per listing

**Conversation:** `listing, buyer, seller, lastMessage, lastMessageAt`
- Unique index on `{ listing, buyer }`

**Message:** `conversation, sender, text (max 1000), type (user|system)`
- Index on `{ conversation, createdAt }`

**Deal:** `listing, offer, buyer, seller, buyerConfirmed, sellerConfirmed, status (awaiting_handover|completed|cancelled), cancelledBy`

**Review:** `deal, reviewer, reviewee, rating (1-5), comment`
- Unique index on `{ deal, reviewer }` so each party reviews once

---

## 5. State Machines (your main talking point)

```text
Listing:  active --seller accepts offer--> reserved --both confirm--> sold
                                              |
                                              +--deal cancelled--> active

Offer:    pending --> accepted | rejected | withdrawn

Deal:     awaiting_handover --> completed | cancelled
```

### Rules enforced on the backend

**Offers**
- Cannot offer on your own listing
- Cannot offer on a listing that is not `active`
- Only one pending offer per buyer per listing
- Offer amount must be a positive number
- Only the **seller** can accept or reject an offer
- Only the **buyer** who made an offer can withdraw it
- Actions are only allowed on offers that are `pending`
- Accepting an offer reserves the listing, auto-rejects all other pending offers, and creates a Deal

**Chat**
- Any logged-in user except the seller can start a conversation on a listing
- Only the buyer and seller of a conversation can read or send messages
- While the listing is `active`, both can send messages
- Once the listing is `reserved`, only the chat with the accepted buyer stays writable; all other chats on that listing become read-only with a note ("This item has been reserved")
- Once the listing is `sold`, all chats on it are read-only

**Deals**
- Each party can confirm only their own side of the handover
- Both confirmations are required to complete a deal
- Either party can cancel a deal while it is `awaiting_handover`; this returns the listing to `active`, marks the accepted offer `withdrawn`, records `cancelledBy`, and increments that user's `cancelledDeals`

**Reviews**
- Only on `completed` deals, once per party

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
GET    /api/listings                  (search, category, minPrice, maxPrice, condition, page)
POST   /api/listings                  (auth, multipart images)
GET    /api/listings/mine
GET    /api/listings/:id
PUT    /api/listings/:id              (owner only)
DELETE /api/listings/:id              (owner only)

OFFERS
POST   /api/listings/:id/offers       (buyer makes an offer)
GET    /api/listings/:id/offers       (seller only: all offers on this listing)
GET    /api/offers/mine               (offers I have sent)
PATCH  /api/offers/:id/accept         (seller only)
PATCH  /api/offers/:id/reject         (seller only)
PATCH  /api/offers/:id/withdraw       (buyer only)

CHAT
POST   /api/listings/:id/conversation (get or create; not allowed for the seller)
GET    /api/conversations             (my inbox)
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

DEALS AND REVIEWS
GET    /api/deals/mine
PATCH  /api/deals/:id/confirm
PATCH  /api/deals/:id/cancel
POST   /api/deals/:id/review
GET    /api/users/:id                 (public profile: rating, cancelled deals, listings)
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
- `protect` middleware verifies the JWT and attaches `req.user`
- Return 401 for missing, invalid or expired tokens
- Commit: `feat: jwt auth middleware`

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
- Create, read, update, delete; only the owner can edit or delete
- Block edits and deletion when the listing is `reserved` or `sold`
- Commit: `feat: listing crud with ownership checks`

**Step 2.3: Search, filters, pagination**
- Text search via `$text`, plus filters for category, price range and condition
- Pagination (`page`, `limit`) and sort (newest, price low-high)
- Only show `active` listings on the browse page
- Commit: `feat: listing search, filter and pagination`

**Step 2.4: Listing UI**
- Pages: Home (grid + filters + search bar), ListingDetail (image gallery, seller info and rating), CreateListing (image preview), MyListings
- Loading skeletons, empty state ("No listings match your filters"), error states
- Commit: `feat: listing pages with filters`

---

### PHASE 3: Chat (about 3 hours)

Chat comes first now, because negotiation happens here.

**Step 3.1: Models and REST chat**
- `Conversation` (unique per listing + buyer) and `Message`
- `startConversation` (upsert; reject if the caller is the seller), `getInbox`, `getMessages`, `sendMessage`
- Participant-only authorization check on every route
- `sendMessage` enforces the writable rules from section 5 (listing status and accepted buyer)
- Trim messages, reject empty ones, cap length at 1000 characters
- Commit: `feat: conversation and message api`

**Step 3.2: Chat UI with polling (working version first)**
- "Chat with seller" button on ListingDetail (hidden for the seller)
- `ChatBox` polls every 3 seconds with `clearInterval` cleanup; auto-scroll; empty state "Say hi!"
- Read-only banner when the listing is reserved for someone else or sold
- Inbox page sorted by `lastMessageAt`; the seller sees one conversation per interested buyer
- Commit: `feat: chat ui with polling`

**Step 3.3: Upgrade to Socket.io (do this only after the core flow works)**
- Use `http.createServer(app)`; authenticate sockets with the JWT in `handshake.auth`
- `conversation:join` only succeeds for the buyer or seller
- REST `sendMessage` emits `message:new` to the room; client de-duplicates by `_id`; remove polling
- Commit: `feat: real-time chat with socket.io`

---

### PHASE 4: Offers and Reservation (about 3 hours, the heart of the project)

**Step 4.1: Create offer**
- Validate the rules from section 5 (not your own listing, listing is `active`, one pending offer per buyer, positive amount)
- Rely on the unique partial index as a backstop against duplicate pending offers from rapid double-clicks
- Commit: `feat: create offer with validation`

**Step 4.2: Accept / reject / withdraw**
- Implement in `offerService.js`
- Accept uses the atomic `findOneAndUpdate`, then auto-rejects other pending offers and creates a `Deal` with `awaiting_handover`
- Reject (seller only) and withdraw (buyer only) only work on `pending` offers
- Commit: `feat: offer accept, reject, withdraw with atomic reservation`

**Step 4.3: Offers UI**
- ListingDetail (buyer view): "Make Offer" form with amount and optional message; shows your offer's status and a withdraw button
- ListingDetail or MyListings (seller view): list of all offers with amount, message, buyer name and rating, an "Open chat" link, and Accept / Reject buttons only for pending offers
- MyOffers page: offers I have sent, with status badges
- Disable buttons while requests are in flight; toasts for success and failure
- Commit: `feat: offers ui for buyers and sellers`

**Step 4.4 (optional): System messages**
- When an offer is made, accepted, rejected or withdrawn, insert a `type: 'system'` message into the buyer's conversation (for example, "Arjun offered Rs 2600")
- Commit: `feat: system messages for offer events`

---

### PHASE 5: Deals and Reviews (about 3 hours)

**Step 5.1: Handover confirmation and cancellation**
- `confirm` sets `buyerConfirmed` or `sellerConfirmed` depending on the caller; when both are true, set Deal `completed` and Listing `sold`
- `cancel` (either party, only while `awaiting_handover`) sets the Deal `cancelled` with `cancelledBy`, returns the Listing to `active`, marks the accepted offer `withdrawn`, and increments the canceller's `cancelledDeals`
- Commit: `feat: deal confirmation and cancellation`

**Step 5.2: Reviews**
- Allowed only on `completed` deals, once per party; update the reviewee's `ratingAvg` and `ratingCount`
- Public profile page showing rating, number of completed deals, cancelled deals and active listings
- Commit: `feat: reviews and seller ratings`

**Step 5.3: Deals UI**
- Deals page with status badges, a link to the deal's chat, "Confirm handover" / "Cancel deal" buttons, and a review form after completion
- Commit: `feat: deals page and review form`

---

### PHASE 6: Hardening and Polish (about 2 hours)

**Step 6.1: Security and robustness**
- `helmet`, `express-rate-limit` (stricter on `/api/auth` and on sending messages), request size limits
- Validate all request bodies and `ObjectId` params; return 400 for malformed IDs
- Confirm no secrets are in the repo (`git log -p | grep -i secret` as a quick sanity check)
- Commit: `chore: security hardening and validation`

**Step 6.2: UX pass**
- Every page has loading, empty, success and error states
- Disable buttons while requests are in flight (prevents duplicate offers and messages)
- Mobile-friendly layout; a clear landing section explaining what CampusMart does
- Commit: `style: ux polish and responsive layout`

**Step 6.3: Seed data**
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
- Register, create a listing with images, chat, make an offer, accept it, and complete a deal using the deployed URLs
- Confirm CORS and WebSocket connections work
- Commit: `chore: deployment configuration`

---

### PHASE 8: Documentation, Demo, Submission (about 3 hours)

**Step 8.1: README** (must include every section the guidelines list)
- Project Name, Problem Statement, Target Users, Solution, Key Features, Tech Stack, Architecture (include the diagram above), Local Setup, Environment Variables, Deployment links
- Add: state machine diagrams, API route list, demo credentials, limitations and future work
- Commit: `docs: complete readme`
