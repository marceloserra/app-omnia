import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { TypingIndicator } from "./TypingIndicator";

const meta = {
  title: "Primitives/TypingIndicator",
  component: TypingIndicator,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "center", backgroundColor: "#05050f" }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TypingIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InAssistantBubble: Story = {
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", alignItems: "flex-start", backgroundColor: "#05050f", width: "100%" }}>
        <View style={{ 
          backgroundColor: "rgba(255,255,255,0.05)", 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderRadius: 20, 
          borderBottomLeftRadius: 6,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)"
        }}>
          <Story />
        </View>
      </View>
    ),
  ],
};
