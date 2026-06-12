const express = require('express')
const { protect } = require('../middleware/auth')
const { estimatePrice, getSafetyTips, getRouteSuggestions } = require('../services/groqAI')

const router = express.Router()

router.post('/price-estimate', protect, async (req, res) => {
  try {
    const { distance } = req.body
    const result = await estimatePrice(distance || 10)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/safety-tips', async (req, res) => {
  try {
    const result = await getSafetyTips()
    res.json(result)
  } catch {
    res.json({
      tips: [
        'Share your ride details with a trusted contact',
        'Verify driver identity before boarding',
        'Keep your phone charged during the ride',
        'Trust your instincts — exit if uncomfortable',
        'Use in-app chat instead of personal phone numbers',
        'Rate your ride after every trip',
      ],
    })
  }
})

router.post('/route-suggestions', protect, async (req, res) => {
  try {
    const { origin, destination } = req.body
    const result = await getRouteSuggestions(origin, destination)
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
