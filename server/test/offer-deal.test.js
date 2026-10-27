const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Offer = require('../src/models/Offer');
const Deal = require('../src/models/Deal');
const { generateToken } = require('../src/controllers/authController');
const { connectDB, disconnectDB } = require('../src/config/db');

const makeUser = async (suffix) => {
  const user = await User.create({
    name: `Test ${suffix}`,
    email: `test-${suffix}-${Date.now()}@campus.edu`,
    passwordHash: await User.hashPassword('password123'),
    college: 'Test Campus',
  });
  return { user, token: generateToken(user) };
};

const makeListing = async (seller) => Listing.create({
  seller: seller._id,
  title: 'Test Calculator',
  description: 'A calculator for offer and deal tests.',
  category: 'Electronics',
  condition: 'Good',
  price: 1000,
  images: [{ url: 'https://example.com/calculator.jpg', publicId: 'test-calculator' }],
});

describe('Offers and Deals API', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Offer.deleteMany({}),
      Deal.deleteMany({}),
    ]);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}/api`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  });

  it('rejects a second pending offer from the same buyer on one listing', async () => {
    const seller = await makeUser('seller-duplicate');
    const buyer = await makeUser('buyer-duplicate');
    const listing = await makeListing(seller.user);

    const first = await fetch(`${baseUrl}/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.token}` },
      body: JSON.stringify({ amount: 900, message: 'First offer' }),
    });
    assert.equal(first.status, 201);

    const second = await fetch(`${baseUrl}/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.token}` },
      body: JSON.stringify({ amount: 850, message: 'Duplicate pending offer' }),
    });
    assert.equal(second.status, 409);
  });

  it('allows only the seller to accept an offer and creates a deal', async () => {
    const seller = await makeUser('seller-accept');
    const buyer = await makeUser('buyer-accept');
    const other = await makeUser('other-accept');
    const listing = await makeListing(seller.user);

    const create = await fetch(`${baseUrl}/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.token}` },
      body: JSON.stringify({ amount: 900 }),
    });
    const created = await create.json();

    const forbidden = await fetch(`${baseUrl}/offers/${created.offer.id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${other.token}` },
    });
    assert.equal(forbidden.status, 403);

    const accepted = await fetch(`${baseUrl}/offers/${created.offer.id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller.token}` },
    });
    const acceptedData = await accepted.json();
    assert.equal(accepted.status, 200);
    assert.equal(acceptedData.offer.status, 'accepted');
    assert.equal(acceptedData.deal.status, 'awaiting_handover');

    const savedListing = await Listing.findById(listing.id);
    assert.equal(savedListing.status, 'reserved');
    assert.equal(savedListing.acceptedOffer.toString(), created.offer.id);
  });

  it('permits exactly one winner when two requests accept offers concurrently', async () => {
    const seller = await makeUser('seller-race');
    const buyer1 = await makeUser('buyer-race-1');
    const buyer2 = await makeUser('buyer-race-2');
    const listing = await makeListing(seller.user);

    const createOffer = (token, amount) => fetch(`${baseUrl}/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount }),
    }).then((res) => res.json());

    const offer1 = await createOffer(buyer1.token, 900);
    const offer2 = await createOffer(buyer2.token, 850);

    const [a, b] = await Promise.all([
      fetch(`${baseUrl}/offers/${offer1.offer.id}/accept`, { method: 'PATCH', headers: { Authorization: `Bearer ${seller.token}` } }),
      fetch(`${baseUrl}/offers/${offer2.offer.id}/accept`, { method: 'PATCH', headers: { Authorization: `Bearer ${seller.token}` } }),
    ]);

    const statuses = [a.status, b.status].sort((x, y) => x - y);
    assert.deepEqual(statuses, [200, 409]);

    const savedListing = await Listing.findById(listing.id);
    assert.equal(savedListing.status, 'reserved');
    assert.ok(savedListing.acceptedOffer);
    assert.equal(await Deal.countDocuments({ listing: listing.id }), 1);
    assert.equal(await Offer.countDocuments({ listing: listing.id, status: 'accepted' }), 1);
    assert.equal(await Offer.countDocuments({ listing: listing.id, status: 'rejected' }), 1);
  });

  it('requires both participants to confirm and prevents confirmation after cancellation', async () => {
    const seller = await makeUser('seller-deal');
    const buyer = await makeUser('buyer-deal');
    const listing = await makeListing(seller.user);

    const create = await fetch(`${baseUrl}/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyer.token}` },
      body: JSON.stringify({ amount: 950 }),
    });
    const created = await create.json();

    const accepted = await fetch(`${baseUrl}/offers/${created.offer.id}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller.token}` },
    });
    const acceptedData = await accepted.json();

    const firstConfirm = await fetch(`${baseUrl}/deals/${acceptedData.deal.id}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${buyer.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverNote: 'Meet at the library.' }),
    });
    const firstData = await firstConfirm.json();
    assert.equal(firstConfirm.status, 200);
    assert.equal(firstData.deal.status, 'awaiting_handover');

    const cancel = await fetch(`${baseUrl}/deals/${acceptedData.deal.id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller.token}` },
    });
    assert.equal(cancel.status, 200);

    const savedListing = await Listing.findById(listing.id);
    assert.equal(savedListing.status, 'active');

    const afterCancel = await fetch(`${baseUrl}/deals/${acceptedData.deal.id}/confirm`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${seller.token}` },
    });
    assert.equal(afterCancel.status, 409);
  });
});
