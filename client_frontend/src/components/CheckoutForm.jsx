export const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

const FIELDS = [
  { name: "fullName", label: "Full Name", autoComplete: "name" },
  {
    name: "phone",
    label: "Phone",
    autoComplete: "tel-national",
    inputMode: "numeric",
    maxLength: 10,
    placeholder: "10-digit mobile number",
  },
  { name: "addressLine1", label: "Address", autoComplete: "address-line1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  {
    name: "pincode",
    label: "Pincode",
    autoComplete: "postal-code",
    inputMode: "numeric",
    maxLength: 6,
  },
];

// Returns { field: message } for every invalid field. Empty object = valid.
// The backend applies the same rules again, since this check can be bypassed.
export const validateShippingAddress = (values) => {
  const errors = {};

  for (const { name, label } of FIELDS) {
    // Whitespace-only input counts as empty.
    if (!values[name].trim()) errors[name] = `${label} is required.`;
  }

  if (!errors.phone && !/^[6-9]\d{9}$/.test(values.phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  if (!errors.pincode && !/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

export default function CheckoutForm({ values, errors, disabled, onChange }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900">Shipping Details</h2>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {FIELDS.map(({ name, label, ...inputProps }) => (
          <div
            key={name}
            className={name === "addressLine1" ? "sm:col-span-2" : undefined}
          >
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
            <input
              id={name}
              name={name}
              type="text"
              value={values[name]}
              onChange={onChange}
              disabled={disabled}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 ${
                errors[name]
                  ? "border-red-300 focus:ring-red-100"
                  : "border-gray-200 focus:border-teal-500 focus:ring-teal-100"
              }`}
              {...inputProps}
            />
            {errors[name] && (
              <p id={`${name}-error`} className="text-xs text-red-500 mt-1">
                {errors[name]}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
