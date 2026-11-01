import { type FormEvent, useState } from "react";
import { createRoot } from "react-dom/client";

const empty = {
  name: "",
  email: "",
  mobile: "",
  country: "",
  newsletter: false,
};

function ReactForm() {
  const [values, setValues] = useState(empty);
  const [submitted, setSubmitted] = useState<typeof empty | null>(null);
  const set = (key: keyof typeof empty, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(values);
  };

  return (
    <form onSubmit={submit}>
      <label htmlFor="name">Full name</label>
      <input
        id="name"
        value={values.name}
        onChange={(event) => set("name", event.target.value)}
      />
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={values.email}
        onChange={(event) => set("email", event.target.value)}
      />
      <label htmlFor="mobile">Mobile number</label>
      <input
        id="mobile"
        type="tel"
        maxLength={11}
        value={values.mobile}
        onChange={(event) => set("mobile", event.target.value)}
      />
      <label htmlFor="country">Country</label>
      <select
        id="country"
        value={values.country}
        onChange={(event) => set("country", event.target.value)}
      >
        <option value="">Choose a country</option>
        <option value="PH">Philippines</option>
        <option value="US">United States</option>
      </select>
      <input
        id="newsletter"
        type="checkbox"
        required
        checked={values.newsletter}
        onChange={(event) => set("newsletter", event.target.checked)}
      />
      <label htmlFor="newsletter">Send me updates</label>
      <button type="submit">Submit</button>
      {submitted && <pre id="result">{JSON.stringify(submitted)}</pre>}
    </form>
  );
}

createRoot(document.getElementById("root")!).render(<ReactForm />);
