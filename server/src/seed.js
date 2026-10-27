require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});

const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Listing = require('./models/Listing');

const SELLER_EMAIL = 'demo.seller@campusmart.local';
const BUYER_EMAIL = 'demo.buyer@campusmart.local';

async function seed() {
  await connectDB();

  try {
    console.log('Seeding CampusMart demo data...');

    const oldUsers = await User.find({
      email: { $in: [SELLER_EMAIL, BUYER_EMAIL] },
    }).select('_id');

    const oldUserIds = oldUsers.map((user) => user._id);

    if (oldUserIds.length) {
      await Listing.deleteMany({ seller: { $in: oldUserIds } });
      await User.deleteMany({ _id: { $in: oldUserIds } });
    }

    const passwordHash = await User.hashPassword('Test@12345');

    const seller = await User.create({
      name: 'Demo Seller',
      email: SELLER_EMAIL,
      passwordHash,
      college: 'CampusMart Demo Campus',
      role: 'user',
    });

    await User.create({
      name: 'Demo Buyer',
      email: BUYER_EMAIL,
      passwordHash,
      college: 'CampusMart Demo Campus',
      role: 'user',
    });

    await Listing.insertMany([
      {
        seller: seller._id,
        title: 'Engineering Mathematics Textbook',
        description: 'Clean engineering mathematics textbook suitable for campus students.',
        category: 'Books',
        condition: 'Good',
        price: 450,
        images: [],
        status: 'active',
      },
      {
        seller: seller._id,
        title: 'Wireless Headphones',
        description: 'Working wireless headphones in good condition.',
        category: 'Electronics',
        condition: 'Like New',
        price: 1200,
        images: [],
        status: 'active',
      },
      {
        seller: seller._id,
        title: 'Campus Bicycle',
        description: 'Reliable bicycle suitable for commuting around campus.',
        category: 'Bicycles',
        condition: 'Good',
        price: 3500,
        images: [],
        status: 'active',
      },
    ]);

    console.log('');
    console.log('Seed complete.');
    console.log(`Demo seller: ${SELLER_EMAIL} / Test@12345`);
    console.log(`Demo buyer:  ${BUYER_EMAIL} / Test@12345`);
  } finally {
    await disconnectDB();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
