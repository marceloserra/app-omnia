# Pattern: TypingIndicator

**Category:** Feedback · Animation  
**Location:** `apps/mobile/components/ui/TypingIndicator.tsx`  
**Phase introduced:** 8  

---

## What It Is

A classic staggered bounce "typing" indicator (often seen in iMessage or WhatsApp). It visually communicates that the AI assistant is currently generating or streaming a response before the first character arrives.

```
● ● ●
```

---

## Visual Anatomy

```
[ dot 1 ] [ dot 2 ] [ dot 3 ]

dot    → 6×6 px circle, borderRadius 3
         color: indigo-400 (#818cf8)
         opacity: 0.8
         gap: 4px
```

**Animation Profile (Staggered Bounce):**
- **Distance:** -6px (moves UP on the Y axis)
- **Duration (up):** 300ms
- **Duration (down):** 300ms
- **Hold (bottom):** 300ms
- **Stagger:** Dot 2 starts 150ms after Dot 1. Dot 3 starts 300ms after Dot 1.
- **Engine:** `useNativeDriver: true` (Runs entirely on the UI thread)

---

## Styles Reference

```ts
const typingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818cf8",
    opacity: 0.8,
  },
});
```

---

## Composition in Context

The `TypingIndicator` is designed to be embedded directly inside the `MessageBubble` when `message.content` is empty but `isStreaming` is true.

```tsx
<BlurView intensity={20} tint="dark" style={styles.assistantBubble}>
  {isEmpty ? (
    <TypingIndicator />
  ) : (
    <Markdown rules={renderRules}>{message.content}</Markdown>
  )}
</BlurView>
```

---

## Design Rationale

### Why not a Spinner/ActivityIndicator?
A spinner implies "loading data from a server" (system state). The three bouncing dots imply "someone is actively typing" (human/conversational state). In a chat interface, anthropomorphic feedback makes the waiting time feel shorter and more natural.

### Why hardware acceleration (`useNativeDriver`)?
During the streaming phase, the React Native JS thread is heavily occupied parsing incoming JSON chunks and updating the SQLite database. If the animation ran on the JS thread, the dots would stutter or freeze. By using `Animated` with `useNativeDriver: true`, the translation matrices are sent to the native OS once, ensuring a flawless 60 FPS bounce regardless of JS congestion.

---

## Do Not

- Do **not** change the color to something bright or distracting. It should remain a subtle `indigo-400` with 0.8 opacity.
- Do **not** remove the 300ms delay at the bottom of the loop. Constant bouncing feels frantic; the slight pause gives it a natural "breathing" rhythm.
