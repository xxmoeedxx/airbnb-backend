const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    guests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    rating: { type: Number, required: true },
  },
  { collection: 'Listings' } // Explicitly specify the collection name
);

module.exports = mongoose.model('Listing', ListingSchema);

