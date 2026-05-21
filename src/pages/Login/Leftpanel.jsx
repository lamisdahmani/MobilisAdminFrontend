import { MapPin, TrendingUp, Zap } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import t from '../../i18n/translations.json';
import logoMobilis from '../../assets/Mobilis_Logo.svg';
import carteFaded from '../../assets/faded_map_.png';

export default function LeftPanel() {
  const { lang } = useLang();
  const text = t.auth;

  return (
    <div className="lp-left-panel">
      <div className="lp-top-section">
        <img src={logoMobilis} alt="Mobilis" className="lp-mobilis-logo" />
        <h1 className="lp-main-title">
          {text.left_title_1[lang]}{' '}
          <span className="lp-green">{text.left_title_2[lang]}</span>{' '}
          {text.left_title_3[lang]}
          <span className="lp-green">{text.left_title_4[lang]}</span>{' '}
          {text.left_title_5[lang]}
        </h1>
        <p className="lp-description">{text.left_desc[lang]}</p>
        <div className="lp-features">
          <div className="lp-feature-item">
            <MapPin className="lp-icon" size={18} />
            <span>{text.left_feature_1[lang]}</span>
          </div>
          <div className="lp-feature-item">
            <TrendingUp className="lp-icon" size={18} />
            <span>{text.left_feature_2[lang]}</span>
          </div>
          <div className="lp-feature-item">
            <Zap className="lp-icon" size={18} />
            <span>{text.left_feature_3[lang]}</span>
          </div>
        </div>
      </div>
      <div className="lp-bottom-map">
        <img src={carteFaded} alt="carte réseau" className="lp-map-img" />
      </div>
    </div>
  );
}