import React from "react";
import PropTypes from "prop-types";
import styles from "./Checkbox.module.css";

export default function Checkbox({ checked, onChange, className }) {
  return (
    <label className={`${styles.container} ${className || ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <div className={styles.checkmark} />
    </label>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

Checkbox.defaultProps = {
  checked: false,
  onChange: () => {},
  className: "",
};
