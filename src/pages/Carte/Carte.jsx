import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { Search } from 'lucide-react';
import './Carte.css';
import t from '../../i18n/translations.json';
import { useLang } from '../../context/LanguageContext';
import { reportsApi } from '../../api/client';

const GOOGLE_API_KEY = 'AIzaSyADlYf8_6pMDrmeEIZjLeDmRAIifZmN7Mo';
const BACKEND = 'http://localhost:5253';

const CENTER = {
  lat: 36.72,
  lng: 3.15,
};

function getQualityColor(score) {
  if (score >= 0.7) {
    return {
      fill: 'rgba(46,125,50,0.35)',
      stroke: 'rgba(46,125,50,0.9)',
    };
  }

  if (score >= 0.4) {
    return {
      fill: 'rgba(249,168,37,0.35)',
      stroke: 'rgba(249,168,37,0.9)',
    };
  }

  return {
    fill: 'rgba(198,40,40,0.35)',
    stroke: 'rgba(198,40,40,0.9)',
  };
}

function samplesToScore(samples) {
  if (samples >= 25) return 0.9;
  if (samples >= 10) return 0.65;
  if (samples >= 3) return 0.45;
  return 0.2;
}

function levelFromCount(count) {
  if (count > 80) return 'critique';
  if (count > 40) return 'eleve';
  return 'faible';
}

const levelClass = {
  critique: 'badge-critique',
  eleve: 'badge-eleve',
  faible: 'badge-faible',
};

export default function Carte() {
  const { lang } = useLang();
  const c = t.carte;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [heatmapMode, setHeatmapMode] = useState(false);

  const [towers, setTowers] = useState([]);
  const [btsPoints, setBtsPoints] = useState([]);

  const [mapKey, setMapKey] = useState(0);

  const [visibleRegion, setVisibleRegion] = useState({
    minLat: 36.2,
    maxLat: 37.2,
    minLon: 2.5,
    maxLon: 3.8,
  });

  const mapRef = useRef(null);
  const searchDebounce = useRef(null);
  const fetchTimer = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: { position: 9 },
    clickableIcons: false,
    gestureHandling: 'greedy',
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await reportsApi.getAll({
          page: 1,
          pageSize: 500,
        });

        const items = res?.items ?? res?.data?.items ?? [];

        const byWilaya = {};

        items.forEach(r => {
          if (r.wilaya) {
            byWilaya[r.wilaya] =
              (byWilaya[r.wilaya] || 0) + 1;
          }
        });

        setZones(
          Object.entries(byWilaya)
            .map(([wilaya, count]) => {
              const first = items.find(
                r => r.wilaya === wilaya
              );

              return {
                wilaya,
                count,
                level: levelFromCount(count),
                lat: first?.latitude ?? null,
                lng: first?.longitude ?? null,
              };
            })
            .sort((a, b) => b.count - a.count)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function fetchTowers(region, heatmap) {
    if (!heatmap) {
      setTowers([]);
      setBtsPoints([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        minLat: String(region.minLat),
        maxLat: String(region.maxLat),
        minLon: String(region.minLon),
        maxLon: String(region.maxLon),
        limit: '400',
      });

      const [towersRes, btsRes] = await Promise.all([
        fetch(`${BACKEND}/api/towers?${params}`),
        fetch(`${BACKEND}/api/bts/heatmap`),
      ]);

      if (towersRes.ok) {
        setTowers(await towersRes.json());
      }

      if (btsRes.ok) {
        const data = await btsRes.json();

        setBtsPoints(
          Array.isArray(data?.points)
            ? data.points
            : []
        );
      }
    } catch {
      setTowers([]);
      setBtsPoints([]);
    }
  }

  useEffect(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }

    if (!heatmapMode) {
      setTowers([]);
      setBtsPoints([]);
      return;
    }

    fetchTimer.current = setTimeout(() => {
      fetchTowers(visibleRegion, heatmapMode);
    }, 400);

    return () => {
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, [heatmapMode, visibleRegion]);

  const onMapLoad = useCallback(map => {
    mapRef.current = map;

    map.addListener('idle', () => {
      const bounds = map.getBounds();

      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      setVisibleRegion({
        minLat: sw.lat(),
        maxLat: ne.lat(),
        minLon: sw.lng(),
        maxLon: ne.lng(),
      });
    });
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value;

    setQuery(val);

    if (searchDebounce.current) {
      clearTimeout(searchDebounce.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSugg(false);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search?q=` +
          `${encodeURIComponent(val + ', Algeria')}` +
          `&format=json&limit=5&accept-language=${lang}`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'MobilisAdmin/1.0',
          },
        });

        if (res.ok) {
          const data = await res.json();

          setSuggestions(
            data.map(d => ({
              name: d.display_name,
              lat: parseFloat(d.lat),
              lng: parseFloat(d.lon),
            }))
          );

          setShowSugg(true);
        }
      } catch {}
    }, 400);
  }

  function handleSuggestionClick(s) {
    setQuery(s.name);
    setShowSugg(false);

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: s.lat,
        lng: s.lng,
      });

      mapRef.current.setZoom(14);
    }
  }

  const handleZoneRowClick = z => {
    if (z.lat && z.lng && mapRef.current) {
      mapRef.current.panTo({
        lat: z.lat,
        lng: z.lng,
      });

      mapRef.current.setZoom(13);
    }
  };

  const getLevel = level =>
    c?.levels?.[level]?.[lang] ?? level;

  return (
    <div className="carte-page">
      <div
        className="carte-map-container"
        style={{ position: 'relative' }}
      >
        <button
          className="carte-btn-heatmap"
          type="button"
          onClick={() => {
            setHeatmapMode(prev => !prev);

            setTowers([]);
            setBtsPoints([]);

            setMapKey(prev => prev + 1);
          }}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
          }}
        >
          <span className="orange-circle-icon" />

          <span>
            {heatmapMode
              ? 'Carte thermique ON'
              : 'Carte thermique OFF'}
          </span>
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
              key={mapKey}
              mapContainerStyle={{
                width: '100%',
                height: '100%',
              }}
              center={CENTER}
              zoom={12}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {heatmapMode && (
                <>
                  {btsPoints.map((p, i) => {
                    const colors = getQualityColor(
                      p.intensity ?? 0.5
                    );

                    return (
                      <Circle
                        key={`bts-${i}-${p.lat}-${p.lng}`}
                        center={{
                          lat: p.lat,
                          lng: p.lng,
                        }}
                        radius={800}
                        options={{
                          fillColor: colors.fill,
                          strokeColor: colors.stroke,
                          strokeWeight: 1,
                        }}
                      />
                    );
                  })}

                  {towers.map(tower => {
                    const colors = getQualityColor(
                      samplesToScore(tower.samples)
                    );

                    return (
                      <Circle
                        key={`tower-${tower.id}`}
                        center={{
                          lat: tower.lat,
                          lng: tower.lon,
                        }}
                        radius={Math.min(
                          Math.max(
                            tower.range ?? 800,
                            400
                          ),
                          2500
                        )}
                        options={{
                          fillColor: colors.fill,
                          strokeColor: colors.stroke,
                          strokeWeight: 1,
                        }}
                      />
                    );
                  })}
                </>
              )}
            </GoogleMap>
          )}
        </div>
      </div>

      <div className="carte-sidebar">
        <div
          className="carte-search-wrap"
          style={{ position: 'relative' }}
        >
          <Search size={14} color="#94a3b8" />

          <input
            className="carte-search"
            placeholder="Rechercher un lieu, une wilaya…"
            value={query}
            onChange={handleSearchChange}
            onFocus={() =>
              suggestions.length > 0 &&
              setShowSugg(true)
            }
            onBlur={() =>
              setTimeout(() => setShowSugg(false), 200)
            }
          />

          {showSugg && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 999,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow:
                  '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() =>
                    handleSuggestionClick(s)
                  }
                  style={{
                    padding: '9px 12px',
                    fontSize: 13,
                    color: '#1a2332',
                    cursor: 'pointer',
                    borderBottom:
                      i < suggestions.length - 1
                        ? '1px solid #f1f5f9'
                        : 'none',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background =
                      '#f8fafc')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.background =
                      '#fff')
                  }
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="carte-panel">
          <h3 className="carte-panel-title">
            {c?.criticalZones?.title?.[lang] ??
              'Zones critiques'}
          </h3>

          {loading ? (
            <p
              style={{
                color: '#aaa',
                fontSize: 13,
                padding: '8px 0',
              }}
            >
              Chargement…
            </p>
          ) : (
            <div className="carte-zones">
              {zones.map(z => (
                <div
                  key={z.wilaya}
                  className="carte-zone-row"
                  style={{
                    cursor: z.lat
                      ? 'pointer'
                      : 'default',
                  }}
                  onClick={() =>
                    handleZoneRowClick(z)
                  }
                >
                  <div className="carte-zone-info">
                    <span className="carte-zone-name">
                      {z.wilaya}
                    </span>

                    <span className="carte-zone-sub">
                      {z.count}{' '}
                      {c?.criticalZones?.signalements?.[
                        lang
                      ] ?? 'signalements'}
                    </span>
                  </div>

                  <span
                    className={`carte-badge ${
                      levelClass[z.level]
                    }`}
                  >
                    {getLevel(z.level)}
                  </span>
                </div>
              ))}

              {zones.length === 0 && (
                <p
                  style={{
                    color: '#aaa',
                    fontSize: 13,
                  }}
                >
                  Aucune zone.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}