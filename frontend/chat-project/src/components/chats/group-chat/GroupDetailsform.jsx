import React, { useRef } from "react";
import PropTypes from "prop-types";
import styles from "./GroupDetailsForm.module.css";
import Input from './Input';
import CreateGroupButton from "./CreateGroupButton";
import BackButton from "./BackButton";
// import Button from "../../button/Button"
import ImageUpload from "./ImageUpload";

export default function DetailsForm({
  details,
  onChange,
  onBack,
  onSubmit,
  submitting,
  error
}) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    onChange({ room_avatar: file });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Group Details</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        {/* <label htmlFor="group-name">Group Name</label> */}
        <Input
            label="Group Name"
            name="groupName"
            placeholder="Enter group name"
            value={details.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
        />

      </div>

      <div className={styles.field}>
        <Input
            label="Description"
            name="description"
            placeholder="Enter a short description"
            value={details.description}
            onChange={(e) => onChange({ description: e.target.value })}
            isTextArea
        />

      </div>

      <div className={styles.field}>
        <label className={styles.label}>Group Avatar</label>
        <ImageUpload
            file={details.room_avatar}
            onChange={(file) => onChange({ room_avatar: file })}
            label="Drop or click to upload avatar"
        />
     </div>

      <div className={styles.actions}>
        <BackButton 
        type="button" 
        className={styles.back} 
        onClick={onBack}>
          Back
        </BackButton>
        <CreateGroupButton
          type="button"
          className={styles.submit}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Creating…" : "Create Group"}
        </CreateGroupButton>
      </div>
    </div>
  );
}

DetailsForm.propTypes = {
  details: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    room_avatar: PropTypes.instanceOf(File),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: PropTypes.string,
};

DetailsForm.defaultProps = {
  submitting: false,
  error: null,
};
