import React, { useState } from "react";
import { View, Button as RNButton } from "react-native";
import { ConfirmDialog } from "./ConfirmDialog";

export default {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#05050f" }}>
      <RNButton title="Show Confirm Dialog" onPress={() => setVisible(true)} />
      <ConfirmDialog
        visible={visible}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setVisible(false)}
        onConfirm={() => setVisible(false)}
      />
    </View>
  );
};
