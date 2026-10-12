// Shared project order and visibility rules for the portfolio grid and case-page navigation.
export const PROJECT_ORDER = Object.freeze([
  'ai-for-unity',
  'touch-my-heart',
  'avatars',
  'corel-for-mac',
  'starkit',
  'vital-sports',
  'xr-prototypes',
  'vr-for-everybody',
  'untitled-world',
  'calmxr',
  'feelxr',
  'minecare',
  'a1',
]);

export const PRESENTATION_ORDER = Object.freeze([...PROJECT_ORDER, 'cv']);

// Pages kept live for direct links but omitted from public discovery and recommendations.
export const UNLISTED_PROJECTS = Object.freeze(['feelxr', 'starkit']);

// Additional location-based visibility rules. A region can match either signal or require both.
const HIDDEN_IN_REGIONS = Object.freeze({
  // Germany
  starkit: { timeZones: ['Europe/Berlin', 'Europe/Busingen'], languages: ['de'], match: 'any' },
  // Portugal: mainland, Madeira and the Azores
  feelxr: { timeZones: ['Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores'], languages: ['pt'] },
});

export function isProjectListed(slug) {
  return !UNLISTED_PROJECTS.includes(slug);
}

export function isProjectShownInRegion(slug) {
  const region = HIDDEN_IN_REGIONS[slug];
  if (!region) return true;

  let zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  const languages = (navigator.languages?.length ? navigator.languages : [navigator.language || ''])
    .map(tag => tag.toLowerCase().split('-')[0]);
  const timeZoneMatches = region.timeZones.includes(zone);
  const languageMatches = languages.some(language => region.languages.includes(language));
  const inRegion = region.match === 'any'
    ? timeZoneMatches || languageMatches
    : timeZoneMatches && languageMatches;
  return !inRegion;
}

export function isProjectVisible(slug) {
  return isProjectListed(slug) && isProjectShownInRegion(slug);
}

// Return every subsequent visible project in sequence, wrapping at the end. Callers can
// test availability and continue to the following candidate when a page is unavailable.
export function nextVisibleProjectCandidates(currentSlug) {
  const currentIndex = PROJECT_ORDER.indexOf(currentSlug);
  if (currentIndex < 0) return [];

  return PROJECT_ORDER
    .slice(currentIndex + 1)
    .concat(PROJECT_ORDER.slice(0, currentIndex))
    .filter(isProjectVisible);
}
