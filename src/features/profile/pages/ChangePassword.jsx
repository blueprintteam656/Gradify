
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ArrowLeft } from "lucide-react";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [visible, setVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");

  const togglePassword = (field) => {
    setVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (passwords.new.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    if (passwords.current === passwords.new) {
      setMessage("New password must be different.");
      return;
    }

    setMessage("Validation successful!");
  };

  const fields = [
    {
      name: "current",
      label: "Current Password",
      placeholder: "Enter your current password",
    },
    {
      name: "new",
      label: "New Password",
      placeholder: "Enter your new password",
    },
    {
      name: "confirm",
      label: "Confirm New Password",
      placeholder: "Confirm your new password",
    },
  ];

  return (
    <div className="change-page">
      <div className="change-container">

        <div className="change-header">
          <div className="change-icon">
            <LockKeyhole size={25} />
          </div>

          <h1>Change Password</h1>

          <p>
            Update your password to keep your account secure.
          </p>
        </div>

        <div className="change-card">

          <form onSubmit={handleSubmit}>

            {fields.map((field) => (
              <div className="password-field" key={field.name}>

                <label htmlFor={field.name}>
                  {field.label}
                </label>

                <div className="password-input-wrapper">

                  <input
                    id={field.name}
                    type={visible[field.name] ? "text" : "password"}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={passwords[field.name]}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => togglePassword(field.name)}
                    aria-label={
                      visible[field.name]
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {visible[field.name] ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>

                </div>
              </div>
            ))}

            <div className="password-hint">
              <LockKeyhole size={15} />
              Password must contain at least 8 characters.
            </div>

            {message && (
              <div className="change-message">
                {message}
              </div>
            )}

            <button type="submit" className="update-button">
              Update Password
            </button>

          </form>
        </div>

        <div className="change-footer">
          <LockKeyhole size={14} />
          Your account security is important to us.
        </div>

      </div>
    </div>
  );
}
