export function InputField({ label, type, value, onChange, placeholder, required, minLength, name, children }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={type}
          name={name}             // <-- Important!
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="form-control"
        />
        {children}
      </div>
    </div>
  );
}
