import './Input.styles.css';

function CommonInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}) {
  return (
    <label className="common-input">
      {label && <span className="common-input-label"> {label} </span>}

      <input
        {...props}
        className="common-input-field"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}

export default CommonInput;
