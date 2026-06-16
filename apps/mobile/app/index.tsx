import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Divider } from '../components/ui/Divider';
import { IconButton } from '../components/ui/IconButton';
import { Send, Settings } from 'lucide-react-native';

const BG = '#0a0918';
const SURFACE = '#13112a';
const INDIGO = '#6366f1';
const VIOLET = '#8b5cf6';
const TEXT_PRIMARY = '#f0efff';
const TEXT_SECONDARY = '#9d9bcc';

export default function ShowcaseScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
    >
      {/* Header */}
      <View style={{ marginTop: 16, marginBottom: 32 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: -0.5 }}>
          Design System
        </Text>
        <Text style={{ fontSize: 14, color: TEXT_SECONDARY, marginTop: 4 }}>
          Premium Indigo & Glassmorphism
        </Text>
      </View>

      {/* Assistant Card */}
      <Card padding="lg" style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Avatar fallback="AI" size="md" />
          <View style={{ marginLeft: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY }}>Omnia Assistant</Text>
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 }}>Always here to help</Text>
          </View>
        </View>
        <Divider style={{ marginBottom: 14 }} />
        <Text style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 22 }}>
          Built on a premium Design System with deep indigo tonalities and glassmorphism effects.
        </Text>
      </Card>

      {/* Buttons Section */}
      <Text style={{ fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 14 }}>Buttons</Text>

      <Button variant="default" size="lg" style={{ marginBottom: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>✦ Generate Response</Text>
      </Button>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Button variant="secondary" style={{ flex: 1 }}>
          <Text style={{ color: INDIGO, fontWeight: '600', fontSize: 14 }}>Secondary</Text>
        </Button>
        <Button variant="outline" style={{ flex: 1 }}>
          <Text style={{ color: INDIGO, fontWeight: '600', fontSize: 14 }}>Outline</Text>
        </Button>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <Button variant="ghost" style={{ flex: 1 }}>
          <Text style={{ color: TEXT_SECONDARY, fontWeight: '600', fontSize: 14 }}>Ghost</Text>
        </Button>
        <IconButton icon={Settings} variant="outline" accessibilityLabel="Settings" />
        <IconButton icon={Send} variant="default" accessibilityLabel="Send" />
      </View>

      {/* Inputs Section */}
      <Text style={{ fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 14 }}>Inputs</Text>

      <Input
        placeholder="Ask Omnia anything..."
        containerStyle={{ marginBottom: 12 }}
      />
      <Input
        placeholder="Error state"
        error={true}
        errorMessage="Connection to provider lost."
        containerStyle={{ marginBottom: 28 }}
      />

      {/* Color Palette Preview */}
      <Text style={{ fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 14 }}>Color Palette</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
        {[
          { color: INDIGO, label: 'Primary' },
          { color: VIOLET, label: 'Accent' },
          { color: '#22c55e', label: 'Success' },
          { color: '#ef4444', label: 'Error' },
        ].map(({ color, label }) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color }} />
            <Text style={{ fontSize: 11, color: TEXT_SECONDARY }}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY }}>Omnia Design System · Phase 2</Text>
      </View>
    </ScrollView>
  );
}
