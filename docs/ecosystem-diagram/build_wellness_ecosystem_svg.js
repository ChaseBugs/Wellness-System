const fs = require('fs');
const path = require('path');

// Edit this portfolio list to regenerate the standalone SVG diagram.
const categories = [
  {
    name: 'FAMILY & GROWTH', color: '#2c9a81', tint: '#e9f8f3',
    apps: [
      ['TalentBaby / BabyGrow', 'Baby records · caregiver sharing', 'coded'],
      ['HeightIncrease', 'Growth logs · posture programs', 'coded'],
      ['Kids Nutrition', 'Age-based meals · allergy filters', 'planned'],
      ['Pregnancy Tracker', 'Weeks · appointments · checklists', 'planned'],
    ],
  },
  {
    name: 'FOOD & NUTRITION', color: '#dd8545', tint: '#fff4e8',
    apps: [
      ['Foodvisor', 'Food logging · nutrition analysis', 'coded'],
      ['Healthy Recipes', 'Recipes · cooking guidance', 'planned'],
      ['Meal Planner', 'Plans · shopping lists', 'planned'],
      ['World Cuisines', 'Cultural recipes · cooking mode', 'planned'],
    ],
  },
  {
    name: 'FITNESS & MIND', color: '#4c82cc', tint: '#ebf3ff',
    apps: [
      ['Daily Workout', 'Programs · exercise logs', 'planned'],
      ['Daily Yoga', 'Classes · poses · progress', 'design'],
      ['DownDog', 'Personalized yoga · stretching', 'design'],
      ['Sleep & Meditation', 'Sleep habits · breathing · audio', 'planned'],
    ],
  },
  {
    name: 'BEAUTY & SELF-CARE', color: '#a46fc4', tint: '#f5edfb',
    apps: [
      ['Makeup Tutorial', 'Tutorials · product guides', 'design'],
      ['Skincare Routine', 'AM/PM routines · journal', 'planned'],
      ['Face Yoga', 'Face exercises · progress', 'design'],
      ['HairTry', 'Hairstyle preview · haircare', 'design'],
    ],
  },
  {
    name: 'HEALTH & CARE', color: '#d05d70', tint: '#fff0f2',
    apps: [
      ['Medicine Store', 'Order · refill · pharmacist support', 'reported'],
      ["Women's Health", 'Cycle · symptoms · wellness logs', 'planned'],
      ['Health Track AI', 'Signals · trends · reviewed insights', 'planned'],
      ['Smartwatch Sync', 'Wearable connection · health data', 'planned'],
    ],
  },
];

const journeys = [
  ['FAMILY ↔ FOOD', 'Pregnancy Tracker → BabyGrow → Kids Nutrition', 'Age and caregiver context informs relevant meal guidance.', '#2c9a81'],
  ['FOOD ↔ FITNESS', 'Foodvisor ↔ Meal Planner ↔ Daily Workout', 'Consented goals connect meals, plans and activity.', '#dd8545'],
  ['GROWTH ↔ MOVEMENT', 'HeightIncrease → DownDog → Daily Yoga', 'Posture goals lead to personalized and guided sessions.', '#4c82cc'],
  ['WEARABLE ↔ APPS', 'Smartwatch Sync → Fitness · Sleep · Foodvisor', 'User-approved steps, sleep and heart data sync once.', '#4c82cc'],
  ['CARE ↔ MEDICINE', "Women's Health / Health Track AI → Medicine Store", 'Reminders, refills and support use explicit consent.', '#d05d70'],
  ['BEAUTY ↔ WELLNESS', 'Skincare Routine → Makeup Tutorial → HairTry', 'Related routines and content are recommended in context.', '#a46fc4'],
];

const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const status = {
  coded: ['CODE', '#d9f6e9', '#0c7252'],
  reported: ['USER-REPORTED', '#fff0cc', '#8b6010'],
  design: ['DESIGN REF', '#edf0f4', '#566475'],
  planned: ['PLANNED', '#edf0f4', '#566475'],
};
let out = [];
const add = x => out.push(x);

add(`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1550" viewBox="0 0 2000 1550" role="img" aria-labelledby="title desc">`);
add(`<title id="title">Entire Wellness System: 20 connected mobile apps</title>`);
add(`<desc id="desc">Five wellness categories with four apps each. A shared account, consented exchange, cloud backup, content, support and subscription hub connects them. Smartwatch Sync is a mobile bridge to wearable data; Medicine Store is shown as user-reported existing.</desc>`);
add(`<defs><style>
  text{font-family:Arial,Helvetica,sans-serif}.title{font-size:46px;font-weight:700;fill:#fff}.sub{font-size:20px;fill:#d8e6ef}.section{font-size:17px;font-weight:800;letter-spacing:1.5px;fill:#557084}.cat{font-size:20px;font-weight:800;letter-spacing:1.1px}.app{font-size:21px;font-weight:700;fill:#173047}.detail{font-size:16px;fill:#5b7082}.chip{font-size:12px;font-weight:800;letter-spacing:.6px}.hub{font-size:27px;font-weight:800;fill:#173047}.hubsub{font-size:17px;fill:#516a7b}.journey{font-size:18px;font-weight:800}.flow{font-size:18px;font-weight:700;fill:#16314a}.foot{font-size:15px;fill:#667d8e}
</style><marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M1 1 L10 6 L1 11 Z" fill="#8aa4b9"/></marker></defs>`);
add(`<rect width="2000" height="1550" fill="#f4f7fb"/><rect width="2000" height="150" fill="#153550"/>`);
add(`<text class="title" x="52" y="67">Entire Wellness System</text>`);
add(`<text class="sub" x="54" y="108">20 connected mobile apps · 5 categories × 4 apps · one consent-aware wellness ecosystem</text>`);
add(`<text class="section" x="52" y="184">MOBILE APP PORTFOLIO</text>`);

const x0 = 48, w = 360, gap = 26, top = 208, h = 540;
categories.forEach((cat, i) => {
  const x = x0 + i * (w + gap);
  add(`<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="20" fill="#fff" stroke="#d8e2e9" stroke-width="2"/>`);
  add(`<rect x="${x}" y="${top}" width="${w}" height="57" rx="20" fill="${cat.tint}"/>`);
  add(`<rect x="${x}" y="${top+40}" width="${w}" height="17" fill="${cat.tint}"/>`);
  add(`<rect x="${x}" y="${top}" width="7" height="${h}" rx="3" fill="${cat.color}"/>`);
  add(`<text class="cat" x="${x+24}" y="${top+37}" fill="${cat.color}">${esc(cat.name)}</text>`);
  cat.apps.forEach((app, j) => {
    const y = 280 + j * 111;
    const [tag, bg, fg] = status[app[2]];
    add(`<rect x="${x+20}" y="${y}" width="${w-40}" height="96" rx="13" fill="#fff" stroke="#dce6ec" stroke-width="1.5"/>`);
    add(`<text class="app" x="${x+36}" y="${y+32}">${esc(app[0])}</text>`);
    add(`<text class="detail" x="${x+36}" y="${y+58}">${esc(app[1])}</text>`);
    const tw = tag === 'USER-REPORTED' ? 112 : tag === 'DESIGN REF' ? 84 : tag === 'PLANNED' ? 72 : 54;
    add(`<rect x="${x+w-37-tw}" y="${y+67}" width="${tw}" height="20" rx="10" fill="${bg}"/>`);
    add(`<text class="chip" x="${x+w-37-tw+tw/2}" y="${y+81}" text-anchor="middle" fill="${fg}">${tag}</text>`);
  });
  const cx = x + w/2;
  add(`<path d="M${cx} 749 V810" stroke="${cat.color}" stroke-width="4" fill="none" marker-end="url(#arrow)"/>`);
});

add(`<rect x="48" y="825" width="1904" height="158" rx="23" fill="#e9f2f8" stroke="#a7c6d9" stroke-width="2"/>`);
add(`<text class="hub" x="1000" y="867" text-anchor="middle">ONE WELLNESS ACCOUNT + CONSENTED DATA EXCHANGE</text>`);
add(`<text class="hubsub" x="1000" y="898" text-anchor="middle">Offline local storage in every app → secure sync → cloud backup and cross-device restore</text>`);
const hubs = ['Identity & family', 'Content & recommendations', 'Wellness Pass', 'Medicine & support', 'Privacy controls'];
hubs.forEach((name, i) => {
  const x = 80 + i*380;
  add(`<rect x="${x}" y="920" width="340" height="42" rx="21" fill="#fff" stroke="#bbd0dc"/>`);
  add(`<text x="${x+170}" y="947" text-anchor="middle" font-size="16" font-weight="700" fill="#2a5068">${esc(name)}</text>`);
});

add(`<text class="section" x="52" y="1020">HOW THE APPS INTERACT</text>`);
journeys.forEach((row, i) => {
  const col = i%3, r = Math.floor(i/3), x = 48 + col*643, y = 1040 + r*149;
  add(`<rect x="${x}" y="${y}" width="617" height="132" rx="18" fill="#fff" stroke="#d7e3e9" stroke-width="2"/>`);
  add(`<rect x="${x}" y="${y}" width="8" height="132" rx="4" fill="${row[3]}"/>`);
  add(`<text class="journey" x="${x+27}" y="${y+32}" fill="${row[3]}">${esc(row[0])}</text>`);
  add(`<text class="flow" x="${x+27}" y="${y+65}">${esc(row[1])}</text>`);
  add(`<text class="detail" x="${x+27}" y="${y+94}">${esc(row[2])}</text>`);
});

add(`<rect x="48" y="1361" width="1904" height="100" rx="18" fill="#e9eef3"/>`);
add(`<text x="75" y="1395" font-size="18" font-weight="800" fill="#29475d">Smartwatch Sync</text>`);
add(`<text class="detail" x="75" y="1423">Companion mobile app pairs wearables and uses device/OS health permissions; it shares only user-approved activity, sleep and heart data.</text>`);
add(`<text class="foot" x="48" y="1490">Status: CODE = inspected repository code; USER-REPORTED = existing Medicine Store per owner; DESIGN REF = screenshots only; PLANNED = proposed app.</text>`);
add(`<text class="foot" x="48" y="1517">Other repository concepts/references outside this 20-app core: Caroli Analyze, Cookies &amp; Baking, Haircare Guide, Stretch &amp; Posture, Youcam Makeup.</text>`);
add(`<text class="foot" x="48" y="1540">Source: E:\\Github\\Mobile\\Wellness-System · inspected 29 Oct 2026</text>`);
add(`</svg>`);

const file = path.join(__dirname, 'Entire_Wellness_System.svg');
fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log(file);
