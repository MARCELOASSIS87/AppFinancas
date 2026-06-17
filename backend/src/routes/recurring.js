const { Router } = require('express');
const auth = require('../middlewares/auth');
const { create, list, remove } = require('../controllers/recurringController');

const router = Router();

router.use(auth);

router.post('/', create);
router.get('/', list);
router.delete('/:id', remove);

module.exports = router;
