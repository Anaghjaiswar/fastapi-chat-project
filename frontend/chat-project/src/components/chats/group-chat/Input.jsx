import React from "react";
import PropTypes from "prop-types";
import styles from "./Input.module.css";

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  name,
  placeholder = "",
  isTextArea = false,
  required = false,
  className = ""
}) {
  const Field = isTextArea ? "textarea" : "input";

  return (
    <div className={`${styles.formGroup} ${className}`}>
      <Field
        id={name}
        name={name}
        className={styles.formField}
        placeholder={placeholder || " "}    /* &nbsp; to trigger placeholder-shown */
        value={value}
        onChange={onChange}
        required={required}
        rows={isTextArea ? 4 : undefined}
      />
      <label htmlFor={name} className={styles.formLabel}>
        {label}
      </label>
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  isTextArea: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string
};

Input.defaultProps = {
  value: "",
  type: "text",
  placeholder: "",
  isTextArea: false,
  required: false,
  className: ""
};
