"use client";

import { useState } from "react";
import { Modal, Alert } from "antd";
import GoalForm from "@/app/tome/components/GoalForm";

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGoalModal({
  open,
  onClose,
  onSuccess,
}: AddGoalModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = () => {
    setErrorMessage(null);
    onSuccess();
    onClose();
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      title="Create Goal"
      open={open}
      onCancel={handleClose}
      footer={null}
    >
      {errorMessage && (
        <Alert
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <GoalForm onSuccess={handleSuccess} onError={handleError} />
    </Modal>
  );
}
