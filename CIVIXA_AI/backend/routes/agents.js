const router = require('express').Router();
const ctrl = require('../controllers/agentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/understanding', optionalAuth, ctrl.understand);
router.post('/duplicate', optionalAuth, ctrl.duplicate);
router.post('/routing', optionalAuth, ctrl.route);
router.post('/priority', optionalAuth, ctrl.priority);
router.post('/assignment', optionalAuth, ctrl.assign);
router.post('/verification', optionalAuth, ctrl.verify);
router.get('/history', ctrl.history);
router.delete('/history/:id', ctrl.deleteHistory);
router.get('/stats', ctrl.stats);
router.get('/health', ctrl.agentHealth);

module.exports = router;
