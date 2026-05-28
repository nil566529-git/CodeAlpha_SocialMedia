const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/unread', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;