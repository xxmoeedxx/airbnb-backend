const express = require('express');
const cors = require('cors');
require('dotenv').config();
const listings = require('./data/mockListings');
const mongoose = require('mongoose');
const bookings = require('./data/bookings.json'); // Import your mock bookings data
const listingsRouter = require('./routes/listings');
const loginRoutes = require('./routes/routes');
const connectDB = require('./db');
const Listing = require('./models/Listing'); // Listing schema
const Booking = require('./models/Booking'); // Booking schema
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());
// Routes
app.use('/api/listings', listingsRouter);
app.use('/api/auth', loginRoutes);
// app.use('/images', express.static('../airbnb-backend/data/images'));

// Connect to the database
connectDB();
// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../airbnb-backend/data/images/'); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file names
  },
});

const upload = multer({ storage });

// Static folder to serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload route
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    const filePaths = req.files.map((file) => `../airbnb-backend/data/images/${file.filename}`);
    res.status(200).json({ filePaths }); // Return file paths
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// app.get('/api/bookings', (req, res) => {
//   res.json(bookings); // Send the bookings data as a response
// });


// app.get('/api/listings', (req, res) => {
//   res.json(listings);
//   // console.log("Listings: ",listings);
// });

// app.get('/api/listings/:id', (req, res) => {
//   const listing = listings.find(l => l.id === parseInt(req.params.id));
//   listing ? res.json(listing) : res.status(404).json({ error: 'Listing not found' });
// });



// app.post('/api/bookings', (req, res) => {
//   res.json({ message: 'Booking successful', bookingData: req.body });

//   // Add the new booking to the bookings data
//   bookings.push(req.body);
//   // Save the updated bookings data to the file
//   const fs = require('fs');
//   fs.writeFileSync('./data/bookings.json', JSON.stringify(bookings, null, 2));

// });
app.get('/test-db', async (req, res) => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  res.json(collections);
});
// 1. Get all listings
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
    // console.log("Listings: ",listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
    // console.log("Error: ",err.message);
  }
});

// 2. Get a single listing by ID
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create a booking
app.post('/api/bookings', async (req, res) => {
  // const { user, listingId, checkInDate, checkOutDate, guests, totalPrice } = req.body;
  const { listingId, listingTitle, checkInDate, checkOutDate, guests, totalPrice, userId } = req.body;
  try {
    const booking = await Booking.create({
      listingId,
      checkInDate,
      checkOutDate,
      listingTitle,
      guests,
      totalPrice,
      userId
    });
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('listingId'); // Populate to get listing details
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 7. Get all bookings for a certain user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('listingId');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin route to create a new listing
app.post('/api/admin/listings', async (req, res) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin route to delete a listing
app.delete('/api/admin/listings/:id', async (req, res) => {
  try {
    const temp = await Listing.findById(req.params.id);
    console.log("Temp: ",temp);
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
