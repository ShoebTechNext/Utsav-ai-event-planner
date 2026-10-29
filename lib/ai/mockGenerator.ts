import { PlanGenerationRequest, PlanGenerationResponse, RebalanceRequest, RebalanceResponse } from "@/types";

/**
 * Generates rich, realistic mock event plans when running in Demo Mode or as fallback.
 */
export function generateMockPlan(req: PlanGenerationRequest): PlanGenerationResponse {
  const budget = req.totalBudget;
  const isWedding = req.type === "wedding";
  const isBirthday = req.type === "birthday";

  if (isWedding) {
    return {
      categories: [
        {
          name: "Venue & Stays",
          allocatedPercent: 34,
          allocatedAmount: Math.round(budget * 0.34),
          notes: "Courtyard lawns, banquet hall, and guest suites for 2 nights",
        },
        {
          name: "Catering & Feasts",
          allocatedPercent: 28,
          allocatedAmount: Math.round(budget * 0.28),
          notes: "Multi-regional festive menu with live chat and dessert stations",
        },
        {
          name: "Decor & Floral Mandap",
          allocatedPercent: 16,
          allocatedAmount: Math.round(budget * 0.16),
          notes: "Fragrant marigold strings, brass diyas, and fairylight canopy",
        },
        {
          name: "Photography & Cinematography",
          allocatedPercent: 10,
          allocatedAmount: Math.round(budget * 0.1),
          notes: "Candid couple coverage, drone reels, and traditional film",
        },
        {
          name: "Music, DJ & Sangeet Sound",
          allocatedPercent: 6,
          allocatedAmount: Math.round(budget * 0.06),
          notes: "Sangeet sound setup, wireless microphones, and DJ console",
        },
        {
          name: "Gifts, Mithai & Favors",
          allocatedPercent: 6,
          allocatedAmount: Math.round(budget * 0.06),
          notes: "Artisanal sweets and brass keepsakes for visiting guests",
        },
      ],
      timeline: [
        {
          phase: "6+ Months Before",
          title: "Select & Reserve Wedding Venue",
          description: "Inspect lawn capacity, stage orientation, and confirm auspicious Muhurat booking.",
          dueOffsetDays: 180,
          priority: "high",
          category: "Venue & Stays",
        },
        {
          phase: "3-5 Months Before",
          title: "Tasting Session & Menu Finalization",
          description: "Curate signature regional appetizers, Jain diet options, and live sweet bar.",
          dueOffsetDays: 120,
          priority: "high",
          category: "Catering & Feasts",
        },
        {
          phase: "3-5 Months Before",
          title: "Book Lead Photographer & Videographer",
          description: "Lock dates for pre-wedding portraits and wedding day candid cinematography.",
          dueOffsetDays: 90,
          priority: "medium",
          category: "Photography & Cinematography",
        },
        {
          phase: "1-2 Months Before",
          title: "Finalize Sangeet Tracklist & Rehearsals",
          description: "Coordinate family group performances, couple dance, and sound check.",
          dueOffsetDays: 45,
          priority: "medium",
          category: "Music, DJ & Sangeet Sound",
        },
        {
          phase: "2 Weeks Before",
          title: "Mandap & Seating Mockup Review",
          description: "Confirm floral palette, havan stage placement, and guest airflow.",
          dueOffsetDays: 14,
          priority: "medium",
          category: "Decor & Floral Mandap",
        },
        {
          phase: "Event Week",
          title: "Assemble Welcome Hampers & Itinerary Kits",
          description: "Prepare guest room baskets with local savories, water, and celebration schedule.",
          dueOffsetDays: 3,
          priority: "low",
          category: "Gifts, Mithai & Favors",
        },
        {
          phase: "D-Day & Post Event",
          title: "Baraat Reception & Mandap Setup Final Check",
          description: "Coordinate milni garlands, safety permits, and sound levels with local authorities.",
          dueOffsetDays: 0,
          priority: "high",
          category: "Venue & Stays",
        },
      ],
      vendors: [
        {
          name: `${req.city} Heritage Courtyard & Lawns`,
          category: "Venue & Stays",
          estimatedRange: `₹${Math.round(budget * 0.3).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.38).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.34),
          notes: "Look for high ceilings, green rooms for bridal party, and ample parking.",
          questionsToAsk: [
            "What is the noise curfew for outdoor music?",
            "Are outside decorators permitted without vendor royalty?",
          ],
        },
        {
          name: "Annapurna Gourmet Banquets",
          category: "Catering & Feasts",
          estimatedRange: `₹${Math.round(budget * 0.25).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.3).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.28),
          notes: "Experienced in large-scale banqueting with live counter theater.",
          questionsToAsk: [
            "Can you support dedicated satvik/Jain preparation counters?",
            "What is the waiter-to-guest ratio during peak dinner?",
          ],
        },
        {
          name: "Vedic Blooms & Mandap Stylists",
          category: "Decor & Floral Mandap",
          estimatedRange: `₹${Math.round(budget * 0.14).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.18).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.16),
          notes: "Focus on fragrant natural flowers and ambient warm lighting.",
          questionsToAsk: [
            "Do you recycle or compost florals post-event?",
            "What backup arrangements exist in case of sudden rain?",
          ],
        },
        {
          name: "Kala Chashma Visuals",
          category: "Photography & Cinematography",
          estimatedRange: `₹${Math.round(budget * 0.08).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.12).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.1),
          notes: "Specializes in unposed emotional candid moments and cinematic teasers.",
          questionsToAsk: [
            "How many shooters will be on-site simultaneously?",
            "When can we expect the 60-second highlight reel?",
          ],
        },
      ],
      ideas: [
        {
          category: "theme",
          title: "Saffron Glow & Royal Heritage Elegance",
          description:
            `Infuse ${req.city}'s charm with warm ochre textiles, glowing clay diyas, and subtle brass bells at the welcoming archway.`,
          culturalTouch: "Live shehnai and nagada welcome at the Toran entrance.",
        },
        {
          category: "decor",
          title: "Eco-Friendly Floral Waterfall & Brass Urli Mandap",
          description:
            "A mandap woven with natural marigold garlands, banana trunks, and floating lotuses in brass urlis.",
          culturalTouch: "Hand-painted rangoli using rice flour and turmeric powder.",
        },
        {
          category: "menu",
          title: "Royal Regional Thali with Interactive Sweet Bazaar",
          description:
            "Curate a grand feast with regional specialties followed by a live kulfi-falooda and jalebi counter.",
          culturalTouch: "Earthen matka chaat counter with custom sweet & tangy chutneys.",
        },
        {
          category: "entertainment",
          title: "Acoustic Sufi Fusion & Family Dance Medley",
          description:
            "Blend traditional dhol rhythms with modern acoustic beats to keep every generation dancing together.",
          culturalTouch: "Surprise flashmob choreography by cousins during the baraat procession.",
        },
        {
          category: "return_gifts",
          title: "Handcrafted Brass Diya & Saffron Spice Keepsake",
          description:
            "A beautifully packaged brass diya paired with certified Kashmiri saffron and roasted dry fruits.",
          culturalTouch: "Seed-paper thank you notes that blossom into marigolds when planted.",
        },
      ],
      aiProviderUsed: "demo",
    };
  }

  if (isBirthday) {
    return {
      categories: [
        {
          name: "Venue & Play Arena",
          allocatedPercent: 30,
          allocatedAmount: Math.round(budget * 0.3),
          notes: "Interactive space with seating and games zone",
        },
        {
          name: "Food, Drinks & Specialty Cake",
          allocatedPercent: 35,
          allocatedAmount: Math.round(budget * 0.35),
          notes: "Custom multi-tier cake, finger foods, pizza, and drinks",
        },
        {
          name: "Themed Decor & Balloon Sculpting",
          allocatedPercent: 15,
          allocatedAmount: Math.round(budget * 0.15),
          notes: "Backdrop photo booth, balloon arches, and customized banners",
        },
        {
          name: "Entertainment & Games Host",
          allocatedPercent: 12,
          allocatedAmount: Math.round(budget * 0.12),
          notes: "Magician, interactive game emcee, and sound console",
        },
        {
          name: "Favors & Goodie Bags",
          allocatedPercent: 8,
          allocatedAmount: Math.round(budget * 0.08),
          notes: "Eco-friendly personalized craft kits for young guests",
        },
      ],
      timeline: [
        {
          phase: "1-2 Months Before",
          title: "Book Venue & Lock In Party Theme",
          description: `Confirm party hall in ${req.city} with adequate space for games and food.`,
          dueOffsetDays: 45,
          priority: "high",
          category: "Venue & Play Arena",
        },
        {
          phase: "1-2 Months Before",
          title: "Order Custom Celebration Cake",
          description: "Design flavor, dietary specifics (eggless/nut-free), and sculpted figurine.",
          dueOffsetDays: 30,
          priority: "high",
          category: "Food, Drinks & Specialty Cake",
        },
        {
          phase: "2 Weeks Before",
          title: "Hire Emcee & Kids Entertainment Troupe",
          description: "Finalize party playlist, musical chairs, and interactive prize quiz.",
          dueOffsetDays: 14,
          priority: "medium",
          category: "Entertainment & Games Host",
        },
        {
          phase: "Event Week",
          title: "Assemble Personalized Goodie Hampers",
          description: "Pack age-appropriate craft gifts, puzzles, and celebration treats.",
          dueOffsetDays: 3,
          priority: "low",
          category: "Favors & Goodie Bags",
        },
        {
          phase: "D-Day & Post Event",
          title: "Cake Table & Photo Backdrop Setup",
          description: "Coordinate cake arrival timing, candle placement, and sound checks.",
          dueOffsetDays: 0,
          priority: "high",
          category: "Themed Decor & Balloon Sculpting",
        },
      ],
      vendors: [
        {
          name: `${req.city} Sky Play Lounge`,
          category: "Venue & Play Arena",
          estimatedRange: `₹${Math.round(budget * 0.25).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.35).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.3),
          notes: "Ensure dedicated party area and safety child-proofing.",
          questionsToAsk: ["Is cake cutting fee waived?", "Do you provide dedicated party helpers?"],
        },
        {
          name: "Sweet Crafters Patisserie",
          category: "Food, Drinks & Specialty Cake",
          estimatedRange: `₹${Math.round(budget * 0.3).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.4).toLocaleString("en-IN")}`,
          suggestedBudget: Math.round(budget * 0.35),
          notes: "Specializes in fondant sculpting and eggless chocolate sponge.",
          questionsToAsk: ["Can delivery be timed exactly 1 hour before party start?"],
        },
      ],
      ideas: [
        {
          category: "theme",
          title: "Enchanted Neon & Cosmic Explorer Carnival",
          description: "Glow bracelets, cosmic banners, and interactive space-themed adventure quest.",
        },
        {
          category: "decor",
          title: "Biodegradable Pastel Balloon Canopy & Instant Polaroid Wall",
          description: "A whimsical balloon installation that doubles as an instant memory photo station.",
        },
        {
          category: "menu",
          title: "Gourmet Slider & Mini Taco Bar with Nitro Mocktails",
          description: "Fun, mess-free kid-friendly food stations with refreshing fruity fizz coolers.",
        },
        {
          category: "entertainment",
          title: "Interactive Science Magic & Laser Dance Arena",
          description: "Hands-on erupting volcanoes, bubble tricks, and upbeat music games.",
        },
        {
          category: "return_gifts",
          title: "Personalized DIY Pottery & Microgreens Growing Kit",
          description: "Encourage creativity with a mini clay plant pot and sunflower seeds.",
        },
      ],
      aiProviderUsed: "demo",
    };
  }

  // Community / Festival celebration
  return {
    categories: [
      {
        name: "Ground, Stage & Lighting",
        allocatedPercent: 35,
        allocatedAmount: Math.round(budget * 0.35),
        notes: "Open ground, weatherproof pandal, sound towers, and ambient illumination",
      },
      {
        name: "Community Prasadam & Food Stalls",
        allocatedPercent: 30,
        allocatedAmount: Math.round(budget * 0.3),
        notes: "Traditional satvik prasadam distribution and vendor food kiosks",
      },
      {
        name: "Decor, Diya Illumination & Floral",
        allocatedPercent: 15,
        allocatedAmount: Math.round(budget * 0.15),
        notes: "Grand rangoli, marigold torans, and thousands of oil diyas",
      },
      {
        name: "Cultural Performances & Sound",
        allocatedPercent: 12,
        allocatedAmount: Math.round(budget * 0.12),
        notes: "Dandiya troupe, folk dancers, and high-clarity PA system",
      },
      {
        name: "Security, Permits & Cleanliness",
        allocatedPercent: 8,
        allocatedAmount: Math.round(budget * 0.08),
        notes: "Fire safety permits, volunteer badges, and green waste disposal bins",
      },
    ],
    timeline: [
      {
        phase: "3-5 Months Before",
        title: "Obtain Municipal & Police Permissions",
        description: `Submit noise and venue safety applications in ${req.city} for community gathering.`,
        dueOffsetDays: 90,
        priority: "high",
        category: "Security, Permits & Cleanliness",
      },
      {
        phase: "1-2 Months Before",
        title: "Book Stage, Sound System & Pandal Truss",
        description: "Verify power generator backup, stage load capacity, and fire exits.",
        dueOffsetDays: 45,
        priority: "high",
        category: "Ground, Stage & Lighting",
      },
      {
        phase: "2 Weeks Before",
        title: "Community Volunteer Orientation & Roster",
        description: "Assign responsibilities for prasadam counters, parking guidance, and senior citizen aid.",
        dueOffsetDays: 14,
        priority: "medium",
        category: "Security, Permits & Cleanliness",
      },
      {
        phase: "Event Week",
        title: "Grand Rangoli Art & 1000 Diya Placement",
        description: "Coordinate resident groups to create giant eco-friendly floral patterns.",
        dueOffsetDays: 2,
        priority: "medium",
        category: "Decor, Diya Illumination & Floral",
      },
      {
        phase: "D-Day & Post Event",
        title: "Festive Evening Aarti & Dandiya Raas",
        description: "Commence with community prayer, distributed sweets, and lively folk garba.",
        dueOffsetDays: 0,
        priority: "high",
        category: "Cultural Performances & Sound",
      },
    ],
    vendors: [
      {
        name: `${req.city} Grand Sound & Truss Infrastructure`,
        category: "Ground, Stage & Lighting",
        estimatedRange: `₹${Math.round(budget * 0.3).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.4).toLocaleString("en-IN")}`,
        suggestedBudget: Math.round(budget * 0.35),
        notes: "Must provide sound engineers and commercial silent generators.",
        questionsToAsk: ["Do you have fire-retardant certification for pandal fabric?"],
      },
      {
        name: "Bhakti Prasadam & Catering Syndicate",
        category: "Community Prasadam & Food Stalls",
        estimatedRange: `₹${Math.round(budget * 0.25).toLocaleString("en-IN")} - ₹${Math.round(budget * 0.35).toLocaleString("en-IN")}`,
        suggestedBudget: Math.round(budget * 0.3),
        notes: "Pure ghee preparation and rapid distribution logistics.",
        questionsToAsk: ["Can your team handle 1000+ meals per hour without queues?"],
      },
    ],
    ideas: [
      {
        category: "theme",
        title: "Utsav of Light & Community Harmony",
        description: "Celebrating unity through traditional oil lamps, rhythmic dhol, and vibrant colors.",
      },
      {
        category: "decor",
        title: "Giant Floating Diya Centerpiece & Marigold Torans",
        description: "A monumental brass urli floating on the central courtyard surrounded by concentric flower petals.",
      },
      {
        category: "menu",
        title: "Sacred Modak & Halwa Prasadam with Kulhad Chai",
        description: "Freshly steamed cardamom modaks and saffron sooji halwa served in biodegradable leaf donas.",
      },
      {
        category: "entertainment",
        title: "Live Dholak Symphony & Inter-Society Dandiya Raas",
        description: "Energetic folk performers leading a 500-person synchronized circular garba dance.",
      },
      {
        category: "return_gifts",
        title: "Handmade Terracotta Diya with Sacred Tulsi Sapling",
        description: "A symbol of enduring life and green festivity for every participating family.",
      },
    ],
    aiProviderUsed: "demo",
  };
}

/**
 * Rebalances a budget cleanly when AI API is unavailable.
 */
export function generateMockRebalance(req: RebalanceRequest): RebalanceResponse {
  const total = req.totalBudget;
  const categories = req.categories;

  // Total spent across categories
  const totalSpent = categories.reduce((sum, c) => sum + c.spentAmount, 0);
  const remainingBudget = Math.max(0, total - totalSpent);

  // Remaining categories that still need allocation beyond spent
  const unspentCount = categories.length;
  const sharePerCategory = unspentCount > 0 ? remainingBudget / unspentCount : 0;

  const rebalanced = categories.map((cat) => {
    // New allocation covers spent plus a proportional share of remainder
    const newAllocated = Math.round(cat.spentAmount + sharePerCategory);
    const percent = total > 0 ? Math.round((newAllocated / total) * 100) : 0;

    let reason = "Allocated proportional balance";
    if (cat.spentAmount > cat.allocatedAmount) {
      reason = `Absorbed ₹${(cat.spentAmount - cat.allocatedAmount).toLocaleString("en-IN")} overspend from buffer`;
    } else if (cat.spentAmount > 0) {
      reason = `Protected ₹${cat.spentAmount.toLocaleString("en-IN")} committed expenses`;
    }

    return {
      id: cat.id,
      name: cat.name,
      allocatedPercent: percent,
      allocatedAmount: newAllocated,
      adjustmentReason: reason,
    };
  });

  return {
    categories: rebalanced,
    summary: `Budget successfully rebalanced! Total expenses of ₹${totalSpent.toLocaleString("en-IN")} preserved with ₹${remainingBudget.toLocaleString("en-IN")} redistributed smoothly.`,
  };
}
