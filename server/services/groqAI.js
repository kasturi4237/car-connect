const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function estimatePrice(distanceKm) {
  const baseFare = 20
  const perKm = 8
  const estimated = Math.round(baseFare + distanceKm * perKm)
  try {
    const chat = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: `For a ${distanceKm}km carpool ride in India, is ₹${estimated} a fair price per seat? Respond in JSON: {"fair": true/false, "suggestion": number, "reasoning": "one sentence"}`,
        },
      ],
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(chat.choices[0].message.content)
    return { estimatedPrice: parsed.suggestion || estimated, reasoning: parsed.reasoning }
  } catch {
    return { estimatedPrice: estimated, reasoning: 'Based on standard rates' }
  }
}

async function getSafetyTips() {
  const chat = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'user',
        content: 'Give 6 safety tips for carpooling in JSON: {"tips": ["tip1","tip2",...]}',
      },
    ],
    response_format: { type: 'json_object' },
  })
  return JSON.parse(chat.choices[0].message.content)
}

async function getRouteSuggestions(origin, destination) {
  const chat = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'user',
        content: `For a carpool from ${origin} to ${destination}, suggest 3 convenient intermediate pickup waypoints. JSON: {"suggestions": [{"name":"...", "reason":"..."}]}`,
      },
    ],
    response_format: { type: 'json_object' },
  })
  return JSON.parse(chat.choices[0].message.content)
}

module.exports = { estimatePrice, getSafetyTips, getRouteSuggestions }
