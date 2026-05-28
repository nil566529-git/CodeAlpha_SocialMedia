const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;