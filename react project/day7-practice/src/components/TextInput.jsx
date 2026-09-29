export function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  error = '',
  type = 'text',
  ...rest
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          fontSize: '14px',
          outline: 'none',
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>}
    </div>
  );
}