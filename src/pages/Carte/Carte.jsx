import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { Search } from 'lucide-react';
import './Carte.css';
import t from '../../i18n/translations.json';
import { useLang } from '../../context/LanguageContext';

/* ── Google Maps API key ── */
const GOOGLE_API_KEY = 'AIzaSyC7fbKlHoD_qKCV4ZstFyk_AQ2a6OJdlUw';

/* ── Map style — clean "light" look similar to CartoDB Voyager ── */
const MAP_STYLES = [
  { featureType: 'poi',            elementType: 'labels',      stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',        elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road',           elementType: 'geometry',    stylers: [{ color: '#f5e6a3' }] },
  { featureType: 'road.highway',   elementType: 'geometry',    stylers: [{ color: '#f0d060' }] },
  { featureType: 'water',          elementType: 'geometry',    stylers: [{ color: '#b8d4e8' }] },
  { featureType: 'landscape',      elementType: 'geometry',    stylers: [{ color: '#f2efe9' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
];

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: { position: 9 }, /* BOTTOM_RIGHT = 9 */
  clickableIcons: false,
  gestureHandling: 'greedy',
};

const CENTER = { lat: 36.7200, lng: 3.1500 };

/* ── Zone data ── */
const zones = [
  { nameKey: 'babEzzouar', signals: 218, bts: 'BTS-12', levelKey: 'critique', color: '#e63946', lat: 36.7193, lng: 3.1872 },
  { nameKey: 'elHarrach',  signals: 184, bts: 'BTS-15', levelKey: 'critique', color: '#e63946', lat: 36.7056, lng: 3.1342 },
  { nameKey: 'sidiMhamed', signals: 153, bts: 'BTS-09', levelKey: 'eleve',    color: '#f4a261', lat: 36.7425, lng: 3.0865 },
  { nameKey: 'darElBeida', signals: 128, bts: 'BTS-07', levelKey: 'eleve',    color: '#f4a261', lat: 36.7300, lng: 3.2150 },
  { nameKey: 'kouba',      signals: 77,  bts: 'BTS-02', levelKey: 'faible',   color: '#2d6a4f', lat: 36.7167, lng: 3.1000 },
];

const levelClass = { critique: 'badge-critique', eleve: 'badge-eleve', faible: 'badge-faible' };

/* Colored circle marker rendered as DOM overlay */
function CircleMarker({ zone, label, levelLabel, onClick }) {
  return (
    <OverlayView
      position={{ lat: zone.lat, lng: zone.lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        onClick={onClick}
        title={label}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: zone.color,
          border: '2.5px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </OverlayView>
  );
}

/* Info popup rendered as DOM overlay */
function InfoPopup({ zone, label, levelLabel, onClose }) {
  return (
    <OverlayView
      position={{ lat: zone.lat, lng: zone.lng }}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          padding: '10px 14px',
          minWidth: 170,
          transform: 'translate(-50%, calc(-100% - 20px))',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 6, right: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, color: '#94a3b8', lineHeight: 1,
          }}
        >✕</button>

        <p className="carte-info-name">{label}</p>
        <p className="carte-info-sub">{zone.signals} signalements · {zone.bts}</p>
        <span
          className="carte-info-badge"
          style={{ background: zone.color }}
        >
          {levelLabel}
        </span>

        {/* Arrow tip */}
        <div style={{
          position: 'absolute', bottom: -7, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid white',
        }} />
      </div>
    </OverlayView>
  );
}

export default function Carte() {
  const { lang } = useLang();
  const c = t.carte;

  const [search,      setSearch]      = useState('');
  const [activeZone,  setActiveZone]  = useState(null);
  const [heatmap,     setHeatmap]     = useState(false);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const filtered = zones.filter(z =>
    (t.signalements?.regions?.[z.nameKey]?.[lang] ?? z.nameKey)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getLabel = (z) => t.signalements?.regions?.[z.nameKey]?.[lang] ?? z.nameKey;
  const getLevel = (z) => c?.levels?.[z.levelKey]?.[lang] ?? z.levelKey;

  const handleMarkerClick = (zone) => {
    setActiveZone(prev => prev?.nameKey === zone.nameKey ? null : zone);
  };

  const handleZoneRowClick = (zone) => {
    setActiveZone(zone);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: zone.lat, lng: zone.lng });
    }
  };

  return (
    <div className="carte-page">

      {/* ── MAP ── */}
      <div className="carte-map-container">

        {/* Floating heatmap toggle */}
        <button
          className="carte-btn-heatmap"
          type="button"
          onClick={() => setHeatmap(h => !h)}
        >
          <span className="orange-circle-icon" />
          <span>View heat map</span>
        </button>

        <div className="carte-map">
          {loadError && (
            <div className="carte-map-loading">
              Erreur de chargement de la carte.
            </div>
          )}

          {!isLoaded && !loadError && (
            <div className="carte-map-loading">
              Chargement de la carte…
            </div>
          )}

          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={CENTER}
              zoom={12}
              options={MAP_OPTIONS}
              onLoad={onMapLoad}
              onClick={() => setActiveZone(null)}
            >
              {/* Markers */}
              {zones.map(z => (
                <CircleMarker
                  key={z.nameKey}
                  zone={z}
                  label={getLabel(z)}
                  levelLabel={getLevel(z)}
                  onClick={(e) => { e.stopPropagation?.(); handleMarkerClick(z); }}
                />
              ))}

              {/* Active info popup */}
              {activeZone && (
                <InfoPopup
                  zone={activeZone}
                  label={getLabel(activeZone)}
                  levelLabel={getLevel(activeZone)}
                  onClose={() => setActiveZone(null)}
                />
              )}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div className="carte-sidebar">

        {/* Search */}
        <div className="carte-search-wrap">
          <Search size={14} color="#94a3b8" />
          <input
            className="carte-search"
            placeholder={c?.searchPlaceholder?.[lang] ?? 'Recherche…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Zones critiques panel */}
        <div className="carte-panel">
          <h3 className="carte-panel-title">
            {c?.criticalZones?.title?.[lang] ?? 'Zones critiques'}
          </h3>
          <div className="carte-zones">
            {filtered.map(z => (
              <div
                key={z.nameKey}
                className="carte-zone-row"
                style={{ cursor: 'pointer' }}
                onClick={() => handleZoneRowClick(z)}
              >
                <div className="carte-zone-info">
                  <span className="carte-zone-name">{getLabel(z)}</span>
                  <span className="carte-zone-sub">
                    {z.signals} {c?.criticalZones?.signalements?.[lang] ?? 'signalements'} · {z.bts}
                  </span>
                </div>
                <span className={`carte-badge ${levelClass[z.levelKey]}`}>
                  {getLevel(z)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Niveau de criticité panel */}
        <div className="carte-panel">
          <h3 className="carte-panel-title">
            {c?.criticityLevel?.title?.[lang] ?? 'Niveau de criticité'}
          </h3>
          <div className="carte-legend">
            <div className="carte-legend-item">
              <span className="carte-dot" style={{ background: '#e63946' }} />
              <span>{c?.criticityLevel?.critique?.[lang] ?? 'Critique (+80 signalements)'}</span>
            </div>
            <div className="carte-legend-item">
              <span className="carte-dot" style={{ background: '#f4a261' }} />
              <span>{c?.criticityLevel?.eleve?.[lang] ?? 'Élevé 40–80'}</span>
            </div>
            <div className="carte-legend-item">
              <span className="carte-dot" style={{ background: '#2d6a4f' }} />
              <span>{c?.criticityLevel?.faible?.[lang] ?? 'Faible <40'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}