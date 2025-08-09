import React, { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { QuickWorkoutEditor } from "./QuickWorkoutEditor";

interface QuickWorkoutFabProps {
  onWorkoutCreated?: (workoutId: number) => void;
}

export const QuickWorkoutFab: React.FC<QuickWorkoutFabProps> = ({
  onWorkoutCreated,
}) => {
  const [modalOpened, setModalOpened] = useState(false);

  const handleWorkoutCreated = (workoutId: number) => {
    setModalOpened(false);
    onWorkoutCreated?.(workoutId);
  };

  return (
    <>
      <Tooltip label="Quick Workout" position="left">
        <ActionIcon
          size={60}
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => setModalOpened(true)}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 1000,
            boxShadow: "var(--mantine-shadow-lg)",
          }}
        >
          <IconPlus size="1.5rem" />
        </ActionIcon>
      </Tooltip>

      <QuickWorkoutEditor
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />
    </>
  );
};
