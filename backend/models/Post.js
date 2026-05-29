const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  name: String,
  avatar: String,
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  name: String,
  avatar: String,
  content: {
    type: String,
    maxlength: [2000, 'Post cannot exceed 2000 characters']
  },
  image: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  hashtags: [String],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add pagination plugin
postSchema.plugin(mongoosePaginate);

// Extract hashtags before saving
postSchema.pre('save', async function() {
  if (this.content) {
    const hashtags = this.content.match(/#[a-zA-Z0-9_]+/g);
    this.hashtags = hashtags ? hashtags.map(h => h.toLowerCase()) : [];
  }
});

module.exports = mongoose.model('Post', postSchema);