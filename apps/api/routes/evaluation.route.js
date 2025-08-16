// routes/speaking.route.js
const {Router} = require ('express');
const evaluationController = require ('../controllers/evaluation.controller');
// We can add middleware here later to protect the route if needed
// const { requireAuth } = require('../middleware/authMiddleware');

const router = Router ();

// Defines a GET endpoint to fetch a Part 1 question.
// For now, it's a public route. You could add 'requireAuth' middleware
// to make it accessible only to logged-in users.
router.post ('/speaking', evaluationController.evaluateSpeaking);

module.exports = router;
