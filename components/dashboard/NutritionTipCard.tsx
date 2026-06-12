"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui";

interface NutritionTip {
  week: number;
  title: string;
  tip: string;
  foods: string[];
  icon: string;
}

const NUTRITION_TIPS: NutritionTip[] = [
  {
    week: 1,
    title: "Folate Focus",
    tip: "Folate is crucial for preventing neural tube defects. Aim for 400-800mcg daily.",
    foods: ["Efo Tete (African Spinach)", "Moi Moi (Bean Pudding)", "Ugu (Pumpkin Leaves)", "Oranges"],
    icon: "leaf"
  },
  {
    week: 2,
    title: "Iron Boost",
    tip: "Your blood volume increases during pregnancy. Iron helps carry oxygen to your baby.",
    foods: ["Efo Riro (Spinach Stew)", "Ofada Rice with Locust Beans", "Kilishi (Dried Beef)", "Honey Beans"],
    icon: "heart"
  },
  {
    week: 3,
    title: "Calcium for Growth",
    tip: "Your baby needs calcium for strong bones and teeth. Aim for 1000mg daily.",
    foods: ["Wara (Nigerian Cheese)", "Kunu (Millet Drink)", "Crayfish", "Ogbono Soup"],
    icon: "bone"
  },
  {
    week: 4,
    title: "Omega-3 Power",
    tip: "DHA supports your baby's brain and eye development. Consider safe fish sources.",
    foods: ["Titus Fish (Mackerel)", "Stockfish", "Groundnuts", "Boiled Eggs"],
    icon: "brain"
  },
  {
    week: 5,
    title: "Protein Building",
    tip: "Protein supports your baby's growth. Aim for 70-100g daily in trimester 2 and 3.",
    foods: ["Suya (Grilled Meat)", "Moi Moi", "Fura da Nono", "Chicken Pepper Soup"],
    icon: "muscle"
  },
  {
    week: 6,
    title: "Fiber Friends",
    tip: "Combat pregnancy constipation with plenty of fiber and water.",
    foods: ["Ofada Rice", "Plantain (Ripe)", "Oats with Groundnuts", "Garden Egg"],
    icon: "grain"
  },
  {
    week: 7,
    title: "Vitamin D Sunshine",
    tip: "Vitamin D helps your body absorb calcium. Aim for 600 IU daily.",
    foods: ["Boiled Eggs", "Fresh Fish", "Peak Milk", "Tilapia"],
    icon: "sun"
  },
  {
    week: 8,
    title: "Hydration Station",
    tip: "Staying hydrated supports amniotic fluid and prevents UTIs. Aim for 8-10 glasses daily.",
    foods: ["Zobo (Hibiscus Drink)", "Coconut Water", "Watermelon", "Kunu Aya (Tiger Nut Drink)"],
    icon: "water"
  },
  {
    week: 9,
    title: "Zinc for Development",
    tip: "Zinc supports cell division and immune function during pregnancy.",
    foods: ["Egusi Soup", "Palm Nut Soup", "Goat Meat", "Cashew Nuts"],
    icon: "shield"
  },
  {
    week: 10,
    title: "Vitamin C Immunity",
    tip: "Vitamin C helps absorb iron and supports your immune system.",
    foods: ["Agbalumo (African Star Apple)", "Pawpaw (Papaya)", "Mangoes", "Garden Egg"],
    icon: "citrus"
  }
];

interface NutritionTipCardProps {
  currentWeek: number;
}

export function NutritionTipCard({ currentWeek }: NutritionTipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Get a tip based on current week (cycle through tips)
  useEffect(() => {
    const index = (currentWeek - 1) % NUTRITION_TIPS.length;
    setTipIndex(index >= 0 ? index : 0);
  }, [currentWeek]);

  const tip = NUTRITION_TIPS[tipIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % NUTRITION_TIPS.length);
    setIsFlipped(false);
  };

  const handlePrevTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev - 1 + NUTRITION_TIPS.length) % NUTRITION_TIPS.length);
    setIsFlipped(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "leaf":
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "heart":
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative h-[200px] sm:h-[180px] cursor-pointer perspective-1000" onClick={handleFlip}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <Card
          className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 border-0 shadow-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
                  Weekly Nutrition Tip
                </span>
                {/* <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  {getIcon(tip.icon)}
                </div> */}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{tip.title}</h3>
              <p className="text-white/90 text-sm line-clamp-2">{tip.tip}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/70 text-xs">Tap to see recommended foods</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevTip}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextTip}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute inset-0 bg-white border-0 shadow-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-orange-500">Recommended Foods</h3>
              <span className="text-xs text-text-muted">Tap to flip back</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                {tip.foods.map((food, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-sm text-text">{food}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Always consult your healthcare provider about your diet during pregnancy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
