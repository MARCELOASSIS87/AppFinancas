const { Router } = require('express');
const auth = require('../middlewares/auth');
const { create, list, update, remove } = require('../controllers/transactionController');

const router = Router();

router.use(auth);

router.post('/', create);
router.get('/', list);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
