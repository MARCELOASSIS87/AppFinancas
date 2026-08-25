const { Router } = require('express');
const auth = require('../middlewares/auth');
const { create, list, weekSummary, update, remove } = require('../controllers/rideController');

const router = Router();

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/week-summary', weekSummary);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
