export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  ...rest // Forwards standard props like type="submit", id, title, etc.
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' },
  };

  const variants = {
    primary: { backgroundColor: '#2563eb', color: '#fff' },
    secondary: { backgroundColor: '#4b5563', color: '#fff' },
    danger: { backgroundColor: '#dc2626', color: '#fff' },
    outline: { backgroundColor: 'transparent', borderColor: '#d1d5db', color: '#374151' },
    ghost: { backgroundColor: 'transparent', color: '#2563eb' },
  };

  const finalStyle = {
    ...baseStyles,
    ...(sizes[size] || sizes.md),
    ...(variants[variant] || variants.primary),
  };

  return (
    <button
      style={finalStyle}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}