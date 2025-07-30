"use client"

import { useState, useEffect } from "react"

// Collection of random food facts about Indian cuisine
const foodFacts = [
  "India is the world's largest producer of spices, producing over 70% of the world's spices.",
  "The concept of 'zero' was invented in India, just like the delicious zero-calorie flavor of fresh mint chutneys!",
  "Idli, a popular South Indian breakfast, was mentioned in literature dating back to 920 CE.",
  "India has over 100 varieties of dosas, with the paper dosa sometimes reaching up to 3 feet in length.",
  "The world's largest free kitchen is at the Golden Temple in Amritsar, serving over 100,000 meals daily.",
  "Turmeric, a common Indian spice, has been used for over 4,000 years and has powerful anti-inflammatory properties.",
  "Chai (tea) wasn't popular in India until the British promoted it in the 1900s. Now India consumes 837,000 tonnes of tea annually.",
  "The practice of using mathematical precision in Indian cooking is ancient - many recipes use specific ratios of spices.",
  "Samosas, now an Indian staple, were actually introduced to India by Middle Eastern traders in the 13th or 14th century.",
  "India grows over 100 varieties of mangoes, making it the world's largest producer of this 'king of fruits'.",
  "The Indian meal thali is designed based on Ayurvedic principles to provide a balanced diet in a single meal.",
  "Biryani has over 26 distinct varieties across different regions of India.",
  "The concept of using yogurt in cooking was pioneered in India thousands of years ago.",
  "India's street food culture is one of the most diverse in the world, with each region having unique specialties.",
  "The traditional Indian cooking method 'dum' (slow cooking in sealed containers) was developed in the royal kitchens of Awadh.",
  "Jalebi, a popular Indian sweet, is mentioned in writings from 1450 CE.",
  "The Indian spice blend garam masala can have up to 12 different spices, varying by region and family tradition.",
  "Khichdi, a simple rice and lentil dish, is considered one of the first comfort foods in history.",
  "The concept of using cooling ingredients in summer and warming ingredients in winter is fundamental to Indian cooking.",
  "India's culinary traditions have been influenced by over 5,000 years of various cultures and invaders.",
  "The traditional Indian thali uses the banana leaf as a plate, which imparts subtle flavors and has antibacterial properties.",
  "Paneer (Indian cottage cheese) doesn't melt when cooked, making it perfect for grilling and curries.",
  "The practice of drinking spiced buttermilk after meals aids digestion and is an ancient Indian tradition.",
  "India has a tradition of cooking in clay pots, which adds minerals to the food and creates unique earthy flavors.",
  "The Indian concept of 'sattvic' food (pure, vegetarian food that brings clarity) dates back to ancient Ayurvedic texts.",
  "Kokum, a souring agent used in Goan and Maharashtrian cuisine, is also used for its cooling properties during summer.",
  "The traditional Indian spice box (masala dabba) design has remained largely unchanged for centuries.",
  "India has over 30 types of bread, each with unique preparation methods and regional significance.",
  "The use of mustard oil, common in Eastern Indian cooking, was documented as early as 5,000 years ago.",
  "Ayurveda classifies food into six tastes: sweet, sour, salty, pungent, bitter, and astringent.",
  "The Indian chutney tradition has given rise to over 50 varieties, using everything from fruits to herbs.",
  "The concept of fermenting batters (like for dosas and idlis) was an early Indian innovation to enhance nutrition.",
  "India's pickling traditions are among the oldest in the world, with some pickle recipes passed down for generations.",
  "The traditional Indian dessert 'payasam' is mentioned in texts dating back to 1100 CE.",
  "The use of tamarind as a souring agent is unique to Indian cuisine and dates back several centuries.",
  "India's tradition of vegetarian cooking is one of the most sophisticated and varied in the world.",
  "The Indian spice trade was the main reason European explorers sought sea routes to India, changing world history.",
  "The cooling properties of yogurt-based drinks like lassi were recognized in ancient Indian texts on health.",
  "The traditional Indian method of tempering (tadka) releases essential oils from spices, enhancing both flavor and health benefits.",
  "India's tradition of serving food on banana leaves adds nutrients to the meal as the hot food absorbs minerals from the leaf.",
  "The concept of using food as medicine is deeply embedded in Indian culinary traditions through Ayurveda.",
  "India has over 200 documented varieties of rice, each suited to different cooking methods and dishes.",
  "The practice of sun-drying foods for preservation has been practiced in India for thousands of years.",
  "The Indian tradition of ending meals with fennel seeds (saunf) serves as a natural mouth freshener and digestive aid.",
  "The use of copper vessels for storing water has ancient Indian origins and is now scientifically proven to have health benefits.",
  "India's tradition of hand-eating food is based on the belief that touch is a crucial sense in the eating experience.",
  "The concept of balancing tastes in a single dish is a fundamental principle of Indian cooking.",
  "India's diverse geography has created distinct culinary regions, each with their own unique ingredients and techniques.",
  "The traditional Indian practice of cooking lentils with specific spices aids in their digestion and nutrient absorption.",
  "India's food preservation techniques, like sun-drying and pickling, were developed thousands of years ago and are still used today.",
]

export default function LoadingScreen() {
  const [fact, setFact] = useState("")

  useEffect(() => {
    // Select a random fact
    const randomFact = foodFacts[Math.floor(Math.random() * foodFacts.length)]
    setFact(randomFact)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="loading-bar w-full" />
      <div className="mt-8 flex flex-col items-center">
        <h1 className="mb-2 text-3xl font-bold text-primary">KL-Eats</h1>
        <p className="text-muted-foreground">Pre-order your favorite campus food</p>
      </div>
      <div className="mt-16 max-w-md px-6 text-center">
        <p className="text-sm italic text-muted-foreground">
          <span className="font-medium">Did you know?</span> {fact}
        </p>
      </div>
    </div>
  )
}
