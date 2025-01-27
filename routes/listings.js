// src/routes/listings.js
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing'); // Listing schema

// Utility function to check if dates overlap
const isDateOverlap = (checkIn, checkOut, listingCheckIn, listingCheckOut) => {
  const requestedCheckIn = new Date(checkIn);
  const requestedCheckOut = new Date(checkOut);
  const listingAvailableFrom = new Date(listingCheckIn);
  const listingAvailableTo = new Date(listingCheckOut);

  return (
    requestedCheckIn <= listingAvailableTo && requestedCheckOut >= listingAvailableFrom
  );
};

// GET /api/listings - Retrieves listings based on optional search filters
router.get('/search', async (req, res) => {
  const { title, guests, checkInDate, checkOutDate } = req.query;

  let filteredListings = await Listing.find();
  // Filter by location
  if (title) {
    // console.log("Location: ",title);
    filteredListings = filteredListings.filter((listing) =>
      listing.title.toLowerCase().includes(title.toLowerCase())    
    );
    // console.log(filteredListings);
  }

  // Filter by guests
  if (guests) {
    filteredListings = filteredListings.filter((listing) => listing.guests >= parseInt(guests));
  }

  // Filter by date range
  if (checkInDate && checkOutDate) {
    filteredListings = filteredListings.filter((listing) =>
      isDateOverlap(checkInDate, checkOutDate, listing.checkInDate, listing.checkOutDate)
    );
  }

  // Send the filtered listings as the response
  res.json(filteredListings);
});

router.get('/category', async (req, res) => {
  const { type } = req.query;
  let filteredListings = await Listing.find();
  // Filter by category
  if (type) {
    filteredListings = filteredListings.filter((listing) =>
      listing.type.toLowerCase().includes(type.toLowerCase())
    );
  }
  // Send the filtered listings as the response
  res.json(filteredListings);
});

module.exports = router;
