const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true, index: "text" },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    category: {
      type: String,
      enum: ["nutrition", "sleep", "height-tips", "reports", "fashion", "motivation", "general"],
      default: "general",
      index: true
    },
    excerpt: String,
    body: { type: String, required: true },
    imageUrl: String,
    authorName: { type: String, default: "Height Increase Team" },
    readMinutes: { type: Number, default: 2 },
    tags: [{ type: String, trim: true }],
    doctor_verified: { type: Boolean, default: false, index: true },
    setup: { type: Boolean, default: false, index: true },
    likesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
