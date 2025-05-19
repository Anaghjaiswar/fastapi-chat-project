import { useState } from "react";
import { createGroupChat } from "../../../api/createGroupChat";
import styles from "./NewGroupChat.module.css";
import List from "./list";
import Next from "./Next";
import DetailsForm from "./GroupDetailsform";

export default function NewGroupChat({ onClose }) {
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [details, setDetails] = useState({
    name: "",
    description: "",
    room_avatar: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleMember = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDetailsChange = (fields) => {
    setDetails(prev => ({ ...prev, ...fields }));
  };

  const submitGroup = async () => {
    if (selectedIds.size === 0) {
      setError("Please select at least one member.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createGroupChat({
        ...details,
        member_ids: Array.from(selectedIds),
      });
      onClose(); // close the wizard
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {step === 1 && (
          <List
            selectedIds={selectedIds}
            onToggle={toggleMember}
            onNext={() => setStep(2)}
            onCancel={onClose}
          />
        )}
        {step === 2 && (
          <DetailsForm
            details={details}
            onChange={handleDetailsChange}
            onBack={() => setStep(1)}
            onSubmit={submitGroup}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
