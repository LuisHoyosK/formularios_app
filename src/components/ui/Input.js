export const Input = ({ value, onChange, placeholder, type = "text", className = "" }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border p-2 rounded w-full ${className}`}
    />
  );
  