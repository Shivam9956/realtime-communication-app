import React from 'react';

export const Input = ({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--rose)' }}>*</span>}
        </label>
      )}
      <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span className="input-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          id={inputId}
          className={`form-input ${Icon ? 'has-icon' : ''} ${error ? 'is-error' : ''}`}
          style={rightElement ? { paddingRight: '2.5rem' } : {}}
          required={required}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
};

export default Input;
