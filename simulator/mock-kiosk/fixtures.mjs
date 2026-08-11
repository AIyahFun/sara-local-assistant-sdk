const measurementFixtures = {
  heart_rate: { value: 72, unit: 'bpm' },
  spo2: { value: 97, unit: '%' },
  blood_pressure_systolic: { value: 122, unit: 'mmHg' },
  blood_pressure_diastolic: { value: 78, unit: 'mmHg' },
  temperature: { value: 36.7, unit: 'C' },
  weight: { value: 71.4, unit: 'kg' },
  respiratory_rate: { value: 16, unit: 'breaths/min' }
};

const trendFixtures = {
  heart_rate: { firstValue: 70, lastValue: 72, unit: 'bpm', trend: 'stable' },
  spo2: { firstValue: 97, lastValue: 97, unit: '%', trend: 'stable' },
  temperature: { firstValue: 36.6, lastValue: 36.7, unit: 'C', trend: 'stable' },
  weight: { firstValue: 71.6, lastValue: 71.4, unit: 'kg', trend: 'stable' },
  respiratory_rate: { firstValue: 16, lastValue: 16, unit: 'breaths/min', trend: 'stable' }
};

const explanations = {
  'en-US': {
    home: 'The home screen provides shortcuts to the main kiosk areas.',
    measurements: 'The measurements screen guides you to supported measurement flows and recent results.',
    medications: 'The medications screen displays scheduled information. This simulator cannot record medication actions.',
    alerts: 'The alerts screen displays active informational reminders in the kiosk interface.',
    contacts: 'The contacts screen displays allowlisted support contacts. This simulator cannot place calls or send messages.',
    devices: 'The devices screen displays safe readiness states for supported measurement devices.',
    settings: 'The settings screen contains allowlisted local preferences.'
  },
  'he-IL': {
    home: 'מסך הבית מציג קיצורי דרך לאזורים המרכזיים בקיוסק.',
    measurements: 'מסך המדידות מנחה לתהליכי מדידה נתמכים ומציג תוצאות אחרונות.',
    medications: 'מסך התרופות מציג מידע מתוזמן. הסימולטור אינו רושם פעולות תרופה.',
    alerts: 'מסך ההתראות מציג תזכורות מידע פעילות בממשק הקיוסק.',
    contacts: 'מסך אנשי הקשר מציג אנשי תמיכה מותרים. הסימולטור אינו מתקשר ואינו שולח הודעות.',
    devices: 'מסך המכשירים מציג מצבי מוכנות בטוחים של מכשירי מדידה נתמכים.',
    settings: 'מסך ההגדרות מכיל העדפות מקומיות ומוגבלות.'
  }
};

export function latestMeasurements(kinds) {
  const observedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  return kinds.map((kind) => ({
    kind,
    ...measurementFixtures[kind],
    observedAt,
    stale: false
  }));
}

export function trendSummaries(kinds, windowHours) {
  return kinds.map((kind) => ({
    kind,
    sampleCount: 6,
    windowHours,
    ...trendFixtures[kind]
  }));
}

export function explainScreen(screen, locale) {
  return explanations[locale][screen];
}

export const syntheticDeviceSummary = Object.freeze({
  tabletBatteryPercent: 84,
  network: 'online',
  measurementDevices: [
    { kind: 'pulse_oximeter', state: 'ready' },
    { kind: 'blood_pressure_monitor', state: 'ready' },
    { kind: 'thermometer', state: 'not_connected' },
    { kind: 'scale', state: 'not_connected' }
  ],
  synthetic: true
});
