import colors from '../../styles/colors';
import './Button.styles.css';

function CommonButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      className={`common-button common-button--${variant} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? '처리 중...' : children}
    </button>
  );
}

export default CommonButton;


