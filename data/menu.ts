export type MenuItem = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  half?: number;
  full?: number;
  rating: number;
  bestSeller?: boolean;
  veg: boolean;
  image?: string;
  description?: string;
  isAvailable?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
};

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function item(name: string, catId: string, catName: string, price: number, opts: Partial<MenuItem> = {}): MenuItem {
  return { id: `${catId}-${slug(name)}`, name, category: catName, categoryId: catId, price, rating: opts.rating ?? 4.5, veg: true, ...opts };
}

export const menuCategories: MenuCategory[] = [
  {
    id: "thali",
    name: "Thali",
    icon: "🍽️",
    items: [
      item("Thali", "thali", "Thali", 199, { 
        rating: 4.7, 
        bestSeller: true, 
        image: "/images/foods/thali.jpg",
        description: "4 Roti + Mix Veg + Daal + Gravy Sabji + Jeera Rice + Salad"
      }),
      item("Special Thali", "thali", "Thali", 299, { 
        rating: 4.8, 
        bestSeller: true, 
        image: "/images/foods/special-thali.jpg",
        description: "Paneer Sabji/Mushroom + Daal Fry/Daal Makhni + 2 Butter Roti + 1 Laccha Paratha + Salad + Raita + Rasgulla"
      }),
    ],
  },
  {
    id: "combos",
    name: "Combos",
    icon: "🍱",
    items: [
      item("Mini Combo", "combos", "Combos", 149, { 
        rating: 4.5, 
        image: "/images/foods/mini-combo.jpg",
        description: "1 Main Dish + 2 Roti + Rice + Salad"
      }),
      item("Family Combo", "combos", "Combos", 399, { 
        rating: 4.7, 
        bestSeller: true, 
        image: "/images/foods/family-combo.jpg",
        description: "2 Main Dishes + 4 Roti + Rice + Dal + Salad + Raita"
      }),
      item("Party Combo", "combos", "Combos", 599, { 
        rating: 4.8, 
        image: "/images/foods/party-combo.jpg",
        description: "3 Main Dishes + 6 Roti + 2 Rice + Dal + 2 Salad + Raita + Sweet"
      }),
    ],
  },
  {
    id: "chinese",
    name: "Chinese Food",
    icon: "🍜",
    items: [
      item("Schezwan Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.6, bestSeller: true, image: "/images/foods/schezwan-noodles.jpg" }),
      item("Hakka Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.5, image: "/images/foods/hakka-noodles.jpg" }),
      item("Singapuri Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.4, image: "/images/foods/singapuri-noodles.jpg" }),
      item("Chilli Garlic Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.5, image: "/images/foods/chilli-garlic-noodles.jpg" }),
      item("Paneer Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.7, image: "/images/foods/paneer-noodles.jpg" }),
      item("Veg Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.3, image: "/images/foods/veg-noodles.jpg" }),
      item("Schezwan Fried Rice", "chinese", "Chinese Food", 190, { half: 100, full: 190, rating: 4.5, image: "/images/foods/schezwan-fried-rice.jpg" }),
      item("Paneer Fried Rice", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.6, image: "/images/foods/paneer-fried-rice.jpg" }),
      item("Veg Fried Rice", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.4, image: "/images/foods/veg-fried-rice.jpg" }),
      item("Butter Noodles", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.3, image: "/images/foods/butter-noodles.jpg" }),
      item("Fried Rice", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.4, image: "/images/foods/fried-rice.jpg" }),
      item("Chilli Paneer", "chinese", "Chinese Food", 290, { half: 150, full: 290, rating: 4.8, bestSeller: true, image: "/images/foods/chilli-paneer.jpg" }),
      item("Chilli Potato", "chinese", "Chinese Food", 230, { half: 120, full: 230, rating: 4.5, image: "/images/foods/chilli-potato.jpg" }),
      item("Honey Chilli Potato", "chinese", "Chinese Food", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/honey-chilli-potato.jpg" }),
      item("Finger Chips", "chinese", "Chinese Food", 170, { half: 90, full: 170, rating: 4.4, image: "/images/foods/finger-chips.jpg" }),
    ],
  },
  {
    id: "roasted-chaap",
    name: "Roasted Chaap",
    icon: "🍢",
    items: [
      item("Malai Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.8, bestSeller: true, image: "/images/foods/malai-chaap.jpg" }),
      item("Chatpata Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/chatpata-chaap.jpg" }),
      item("Afghani Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.7, image: "/images/foods/afghani-chaap.jpg" }),
      item("K.F.C. Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/k-f-c-chaap.jpg" }),
      item("K.F.C. Lajpati Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/k-f-c-lajpati-chaap.jpg" }),
      item("Achari Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.7, image: "/images/foods/achari-chaap.jpg" }),
      item("Nagin Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/nagin-chaap.jpg" }),
      item("Lajpati Nagin Chaap", "roasted-chaap", "Roasted Chaap", 310, { half: 160, full: 310, rating: 4.6, image: "/images/foods/lajpati-nagin-chaap.jpg" }),
      item("Amritsari Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/amritsari-chaap.jpg" }),
      item("Veg. Chicken Tikka Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/veg-chicken-tikka-chaap.jpg" }),
      item("Pagga Daku Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.4, image: "/images/foods/pagga-daku-chaap.jpg" }),
      item("Paneer Tikka Chaap", "roasted-chaap", "Roasted Chaap", 350, { half: 180, full: 350, rating: 4.7, image: "/images/foods/paneer-tikka-chaap.jpg" }),
      item("Paneer Malai Tikka", "roasted-chaap", "Roasted Chaap", 350, { half: 180, full: 350, rating: 4.8, image: "/images/foods/paneer-malai-tikka.jpg" }),
      item("Paneer Kurkure", "roasted-chaap", "Roasted Chaap", 350, { half: 180, full: 350, rating: 4.6, image: "/images/foods/paneer-kurkure.jpg" }),
      item("Chilli Chaap", "roasted-chaap", "Roasted Chaap", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/chilli-chaap.jpg" }),
    ],
  },
  {
    id: "chaap-rolls",
    name: "Chaap Rolls",
    icon: "🌯",
    items: [
      item("Malai Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.6, bestSeller: true, image: "/images/foods/malai-chaap-roll.jpg" }),
      item("Chatpati Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.5, image: "/images/foods/chatpati-chaap-roll.jpg" }),
      item("Afghani Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.7, image: "/images/foods/afghani-chaap-roll.jpg" }),
      item("Achari Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.5, image: "/images/foods/achari-chaap-roll.jpg" }),
      item("K.F.C. Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.6, image: "/images/foods/k-f-c-chaap-roll.jpg" }),
      item("Jagga Daku Chaap Roll", "chaap-rolls", "Chaap Rolls", 160, { rating: 4.5, image: "/images/foods/jagga-daku-chaap-roll.jpg" }),
    ],
  },
  {
    id: "main-course",
    name: "Main Course",
    icon: "🍛",
    items: [
      item("Veg. Chaap Rogan Josh", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.7, image: "/images/foods/veg-chaap-rogan-josh.jpg" }),
      item("Kadai Chaap", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/kadai-chaap.jpg" }),
      item("Kadai Paneer", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/kadai-paneer.jpg" }),
      item("Paneer Butter Masala", "main-course", "Main Course", 350, { half: 180, full: 350, rating: 4.8, bestSeller: true, image: "/images/foods/paneer-butter-masala.jpg" }),
      item("Shahi Paneer", "main-course", "Main Course", 350, { half: 180, full: 350, rating: 4.7, image: "/images/foods/shahi-paneer.jpg" }),
      item("Chaap Do Pyaza", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/chaap-do-pyaza.jpg" }),
      item("Paneer Do Pyaza", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.6, image: "/images/foods/paneer-do-pyaza.jpg" }),
      item("Soya Chaap Keema", "main-course", "Main Course", 290, { half: 150, full: 290, rating: 4.5, image: "/images/foods/soya-chaap-keema.jpg" }),
      item("Rumali Roti (1 Pc.)", "main-course", "Main Course", 15, { rating: 4.4, image: "/images/foods/rumali-roti-1-pc.jpg" }),
      item("Plain Rice", "main-course", "Main Course", 90, { half: 50, full: 90, rating: 4.3, image: "/images/foods/plain-rice.jpg" }),
    ],
  },
  {
    id: "momos",
    name: "Momos",
    icon: "🥟",
    items: [
      item("Steam Momos (6 Pc.)", "momos", "Momos", 80, { rating: 4.5, bestSeller: true, image: "/images/foods/steam-momos-6-pc.jpg" }),
      item("Fried Momos", "momos", "Momos", 90, { rating: 4.4, image: "/images/foods/fried-momos.jpg" }),
      item("Paneer Momos Steam", "momos", "Momos", 100, { rating: 4.6, image: "/images/foods/paneer-momos-steam.jpg" }),
      item("Paneer Momos Fried", "momos", "Momos", 120, { rating: 4.5, image: "/images/foods/paneer-momos-fried.jpg" }),
      item("Paneer Momos", "momos", "Momos", 120, { rating: 4.5, image: "/images/foods/paneer-momos.jpg" }),
      item("Veg/Paneer Momos", "momos", "Momos", 120, { rating: 4.4, image: "/images/foods/veg-paneer-momos.jpg" }),
      item("Soya Chaap Momos", "momos", "Momos", 150, { rating: 4.6, image: "/images/foods/soya-chaap-momos.jpg" }),
      item("Crispy Momos", "momos", "Momos", 120, { rating: 4.5, image: "/images/foods/crispy-momos.jpg" }),
      item("Tandoori Momos", "momos", "Momos", 150, { rating: 4.7, bestSeller: true, image: "/images/foods/tandoori-momos.jpg" }),
      item("Tandoori Paneer Momos", "momos", "Momos", 150, { rating: 4.7, image: "/images/foods/tandoori-paneer-momos.jpg" }),
      item("Tandoori Momos Momos", "momos", "Momos", 180, { rating: 4.4, image: "/images/foods/tandoori-momos-momos.jpg" }),
      item("Woleganic Momos", "momos", "Momos", 120, { rating: 4.3, image: "/images/foods/woleganic-momos.jpg" }),
      item("Chilli Momos", "momos", "Momos", 120, { rating: 4.5, image: "/images/foods/chilli-momos.jpg" }),
      item("Afghani Momos", "momos", "Momos", 160, { rating: 4.8, bestSeller: true, image: "/images/foods/afghani-momos.jpg" }),
      item("Kurkure Momos", "momos", "Momos", 160, { rating: 4.6, image: "/images/foods/kurkure-momos.jpg" }),
      item("Peri Peri Momos", "momos", "Momos", 160, { rating: 4.5, image: "/images/foods/peri-peri-momos.jpg" }),
      item("Achari Momos", "momos", "Momos", 180, { rating: 4.6, image: "/images/foods/achari-momos.jpg" }),
    ],
  },
  {
    id: "burgers",
    name: "Burgers / Snacks",
    icon: "🍔",
    items: [
      item("Veg Burger", "burgers", "Burgers / Snacks", 79, { rating: 4.5, image: "/images/foods/veg-burger.jpg" }),
      item("Cheese Burger", "burgers", "Burgers / Snacks", 99, { rating: 4.6, image: "/images/foods/cheese-burger.jpg" }),
      item("Aloo Tikki Burger", "burgers", "Burgers / Snacks", 89, { rating: 4.4, image: "/images/foods/aloo-tikki-burger.jpg" }),
      item("Paneer Burger", "burgers", "Burgers / Snacks", 119, { rating: 4.7, bestSeller: true, image: "/images/foods/paneer-burger.jpg" }),
      item("Veg Grill Sandwich", "burgers", "Burgers / Snacks", 99, { rating: 4.5, image: "/images/foods/veg-grill-sandwich.jpg" }),
      item("Cheese Sandwich", "burgers", "Burgers / Snacks", 109, { rating: 4.4, image: "/images/foods/cheese-sandwich.jpg" }),
    ],
  },
  {
    id: "beverages",
    name: "Beverages",
    icon: "🥤",
    items: [
      item("Cold Coffee", "beverages", "Beverages", 89, { rating: 4.6, image: "/images/foods/cold-coffee.jpg" }),
      item("Lassi (Sweet / Salted)", "beverages", "Beverages", 69, { rating: 4.5, image: "/images/foods/lassi-sweet-salted.jpg" }),
      item("Lemon Ice Tea", "beverages", "Beverages", 69, { rating: 4.4, image: "/images/foods/lemon-ice-tea.jpg" }),
      item("Fresh Lime Water", "beverages", "Beverages", 49, { rating: 4.5, image: "/images/foods/fresh-lime-water.jpg" }),
      item("Masala Lemonade", "beverages", "Beverages", 59, { rating: 4.4, image: "/images/foods/masala-lemonade.jpg" }),
      item("Soft Drinks", "beverages", "Beverages", 40, { rating: 4.3, image: "/images/foods/soft-drinks.jpg" }),
      item("Mineral Water", "beverages", "Beverages", 20, { rating: 4.2, image: "/images/foods/mineral-water.jpg" }),
    ],
  },
  {
    id: "extras",
    name: "Extras",
    icon: "🫓",
    items: [
      item("Roti", "extras", "Extras", 15, { rating: 4.3, image: "/images/foods/roti.jpg" }),
      item("Butter Roti", "extras", "Extras", 20, { rating: 4.4, image: "/images/foods/butter-roti.jpg" }),
      item("Naan", "extras", "Extras", 30, { rating: 4.4, image: "/images/foods/naan.jpg" }),
      item("Butter Naan", "extras", "Extras", 35, { rating: 4.5, image: "/images/foods/butter-naan.jpg" }),
      item("Kulcha", "extras", "Extras", 35, { rating: 4.3, image: "/images/foods/kulcha.jpg" }),
      item("Paneer Kulcha", "extras", "Extras", 60, { rating: 4.6, image: "/images/foods/paneer-kulcha.jpg" }),
      item("Rice", "extras", "Extras", 70, { rating: 4.3, image: "/images/foods/rice.jpg" }),
      item("Jeera Rice", "extras", "Extras", 90, { rating: 4.5, image: "/images/foods/jeera-rice.jpg" }),
    ],
  },
];

export const allItems: MenuItem[] = menuCategories.flatMap((c) => c.items);
export const bestSellers: MenuItem[] = allItems.filter((i) => i.bestSeller);