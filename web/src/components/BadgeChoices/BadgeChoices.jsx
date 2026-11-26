import './BadgeChoices.styles.css';

function BadgeChoices({ label, name, options, defaultValues = [] }) {
  return (
    <fieldset className="badge-choices">
      <legend className="common-input-label">
        {label} <span className="badge-choices-hint">여러 개 선택 가능</span>
      </legend>
      <div className="badge-choices-options">
        {options.map((option) => (
          <label className="badge-choice" key={option}>
            <input type="checkbox" name={name} value={option} defaultChecked={defaultValues.includes(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default BadgeChoices;
