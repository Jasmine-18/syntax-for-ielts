// routes/speaking.route.js
const {Router} = require ('express');
const speakingController = require ('../controllers/speaking.controller');
// We can add middleware here later to protect the route if needed
// const { requireAuth } = require('../middleware/authMiddleware');

const router = Router ();

// Defines a GET endpoint to fetch a Part 1 question.
// For now, it's a public route. You could add 'requireAuth' middleware
// to make it accessible only to logged-in users.
router.get ('/part1', speakingController.getPart1Question);
router.get ('/part2', speakingController.getPart2TaskCard);
router.post ('/part3', speakingController.getPart3Questions);

module.exports = router;
