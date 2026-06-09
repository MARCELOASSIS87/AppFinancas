const { Router } = require('express');
const auth = require('../middlewares/auth');
const { list, create } = require('../controllers/categoryController');

const router = Router();

router.use(auth);

router.get('/', list);
router.post('/', create);

module.exports = router;
