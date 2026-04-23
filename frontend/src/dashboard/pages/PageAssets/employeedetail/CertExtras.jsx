const IPAF_CATEGORIES = [
  { code: '3A',  label: 'Scissor Lift' },
  { code: '3A+', label: 'Scissor Lift+' },
  { code: '3B',  label: 'Boom' },
  { code: '3B+', label: 'Boom+' },
  { code: '1A',  label: 'Static Vertical' },
  { code: '1B',  label: 'Static Boom' },
];

const PASMA_LEVELS = ['U (User)', 'M (Manager)', 'I (Instructor)'];

const PASMA_CATEGORIES = [
  { code: 'T',     label: 'Towers for Users' },
  { code: 'L',     label: 'Low Level Access' },
  { code: 'Combi', label: 'Combined Tower & Low Level' },
  { code: 'A5',    label: 'Towers on Stairways' },
  { code: 'A6',    label: 'Cantilever Towers' },
  { code: 'A7',    label: 'Towers with Bridges' },
  { code: 'A8',    label: 'Linked Towers' },
  { code: 'A9',    label: 'Large Deck Towers' },
  { code: 'M',     label: 'Towers for Managers' },
  { code: 'W',     label: 'Work at Height Essentials' },
];

const CategoryPicker = ({ categories, selected, onChange }) => (
  <div className="cert-categories">
    {categories.map(({ code, label }) => {
      const active = (selected || []).includes(code);
      return (
        <button
          key={code}
          type="button"
          className={`cert-category-btn ${active ? 'cert-category-btn--active' : ''}`}
          onClick={() => {
            const updated = active ? selected.filter(c => c !== code) : [...(selected || []), code];
            onChange(updated);
          }}
        >
          {code}
          <span className="cert-category-label">{label}</span>
        </button>
      );
    })}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="toggle-label">
    <div className={`toggle ${checked ? 'toggle--on' : ''}`} onClick={() => onChange(!checked)}>
      <div className="toggle-thumb" />
    </div>
    <span>{label}</span>
  </label>
);

const PreferredLocation = ({ value, onChange }) => (
  <>
    <label className="detail-label">Preferred training location for this cert</label>
    <input
      type="text"
      placeholder="e.g. within 20 miles of LU1 1AA, or Manchester"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="detail-input"
    />
  </>
);

export const IPAFExtras = ({ extras, onChange }) => {
  const update = (key, val) => onChange({ ...extras, [key]: val });
  const logbookEntries = extras.logbook_entries || 0;
  const logbookComplete = extras.logbook_complete || false;

  return (
    <div className="cert-extras">
      <p className="cert-extras-title">IPAF Details</p>
      <p className="cert-extras-hint">Select all categories held on this card</p>
      <CategoryPicker
        categories={IPAF_CATEGORIES}
        selected={extras.card_categories || []}
        onChange={v => update('card_categories', v)}
      />
      <label className="detail-label">Logbook entries (60 required for renewal)</label>
      <input
        type="number"
        placeholder="e.g. 45"
        min="0"
        max="999"
        value={logbookEntries || ''}
        onChange={e => update('logbook_entries', parseInt(e.target.value) || 0)}
        className="detail-input"
        style={{ width: '160px', flex: 'none' }}
      />
      <Toggle
        checked={logbookComplete}
        onChange={v => update('logbook_complete', v)}
        label="Logbook complete (60+ entries, 10 in final year)"
      />
      {!logbookComplete && logbookEntries > 0 && (
        <p className="cert-extras-warning">
          ⚠ Incomplete logbook — full course may be required at renewal instead of the half-day renewal course
        </p>
      )}
      <PreferredLocation
        value={extras.preferred_location}
        onChange={v => update('preferred_location', v)}
      />
    </div>
  );
};

export const PASMAExtras = ({ extras, onChange }) => {
  const update = (key, val) => onChange({ ...extras, [key]: val });

  return (
    <div className="cert-extras">
      <p className="cert-extras-title">PASMA Details</p>
      <label className="detail-label">Level</label>
      <select
        value={extras.level || ''}
        onChange={e => update('level', e.target.value)}
        className="detail-input"
      >
        <option value=''>Select level</option>
        {PASMA_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <p className="cert-extras-hint" style={{ marginTop: '0.25rem' }}>Select all categories held on this card</p>
      <CategoryPicker
        categories={PASMA_CATEGORIES}
        selected={extras.categories || []}
        onChange={v => update('categories', v)}
      />
      <p className="cert-extras-hint">
        Certificate is digital — sent via email. No hard copy required.
      </p>
      <PreferredLocation
        value={extras.preferred_location}
        onChange={v => update('preferred_location', v)}
      />
    </div>
  );
};

export const GenericExtras = ({ extras, onChange }) => {
  const update = (key, val) => onChange({ ...extras, [key]: val });
  return (
    <div className="cert-extras">
      <p className="cert-extras-title">Booking Preferences</p>
      <PreferredLocation
        value={extras.preferred_location}
        onChange={v => update('preferred_location', v)}
      />
    </div>
  );
};