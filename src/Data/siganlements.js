/**
 * Mock signalement data.
 * Replace with API calls when backend is ready.
 */
export const SIGNALEMENTS = [
  { msisdn: '2130697...', type: 'coupureReseau',     region: 'babEzzouar',  status: 'enAttente' },
  { msisdn: '2130661...', type: 'faibleSignal',      region: 'darElBeida',  status: 'enCours'   },
  { msisdn: '2130550...', type: 'absenceCouverture', region: 'algerCentre', status: 'resolu'    },
  { msisdn: '2130770...', type: 'congestionReseau',  region: 'sidiMhamed',  status: 'enAttente' },
  { msisdn: '2130699...', type: 'lenteurConnexion',  region: 'elHarrach',   status: 'enCours'   },
  { msisdn: '2130612...', type: 'coupureReseau',     region: 'kouba',       status: 'resolu'    },
  { msisdn: '2130733...', type: 'faibleSignal',      region: 'darElBeida',  status: 'enAttente' },
  { msisdn: '2130845...', type: 'absenceCouverture', region: 'babEzzouar',  status: 'enCours'   },
  { msisdn: '2130911...', type: 'congestionReseau',  region: 'algerCentre', status: 'resolu'    },
  { msisdn: '2130422...', type: 'lenteurConnexion',  region: 'elHarrach',   status: 'enAttente' },
];

export const TOTAL_PAGES = 40;

export const STATUS_MAP = {
  enAttente: 'badge-warning',
  enCours:   'badge-info',
  resolu:    'badge-success',
};


// Shared static data for Statistiques / StatusChart

export const TOP_ZONES = [
  { nameKey: 'babEzzouar', val: 218 },
  { nameKey: 'elHarrach',  val: 184 },
  { nameKey: 'sidiMhamed', val: 153 },
];

export const PIE_DATA_CONFIG = [
  { key: 'resolus',   value: 64, color: '#2d6a4f' },
  { key: 'enCours',   value: 21, color: '#f4a261' },
  { key: 'enAttente', value: 15, color: '#e63946' },
];

export const TYPE_DATA = [
  { labelKey: 'coupureReseau',    value: 314 },
  { labelKey: 'faibleDebit',      value: 248 },
  { labelKey: 'congestion',       value: 180 },
  { labelKey: 'lenteurConnexion', value: 141 },
  { labelKey: 'absenceCouverture',value: 88  },
  { labelKey: 'autres',           value: 31  },
];

export const REGION_DATA = [
  { nameKey: 'babEzzouar',  value: 218, color: '#e53935' },
  { nameKey: 'elHarrach',   value: 184, color: '#e53935' },
  { nameKey: 'sidiMhamed',  value: 153, color: '#fb8c00' },
  { nameKey: 'darElBeida',  value: 128, color: '#fdd835' },
  { nameKey: 'algerCentre', value: 102, color: '#1a6b3a' },
  { nameKey: 'kouba',       value: 40,  color: '#1a6b3a' },
];

export const EVOLUTION_DATA = [
  { month: 'OCT 2025', value: 1200 },
  { month: 'NOV 2025', value: 1800 },
  { month: 'DEC 2025', value: 2400 },
  { month: 'JAN 2026', value: 1600 },
  { month: 'FEV 2026', value: 2800 },
  { month: 'MAR 2026', value: 3100 },
  { month: 'AVR 2026', value: 2900 },
];

export const RESUME_DATA = [
  { key: 'signalTraites', value: '1325' },
  { key: 'moyParJour',    value: '45'   },
  { key: 'usersSignale',  value: '289'  },
];

export const STAT_CARDS_DATA = [
  { key: 'signalementsMois', value: '1,862', icon: '⚠', color: '#f4a261' },
  { key: 'tauxResolution',   value: '312',   icon: '↗', color: '#1b6b3a' },
  { key: 'tempsMoy',         value: '2h45mn',icon: '◷', color: '#457b9d' },
  { key: 'zonesCritiques',   value: '3',     icon: '⊙', color: '#e63946' },
];