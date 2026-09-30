const express = require('express');
const router = express.Router();
const { getHealth, ping } = require('../controllers/healthController');

router.get('/', getHealth);
router.get('/ping', ping);

module.exports = router;
