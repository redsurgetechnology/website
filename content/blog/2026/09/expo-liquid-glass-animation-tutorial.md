---
title: "Expo Liquid Glass Animation Tutorial: Build Interactive, Flowing UI Effects"
date: "2026-09-04T10:00:00.000Z"
excerpt: "Learn how to create the liquid glass animation effect in Expo with step-by-step code. We'll cover frosted glass, animated gradients, touch-reactive tilt, and smooth Reanimated transitions."
cover_image: "/images/blog/uploads/expo-liquid-glass-animation-tutorial.webp"
seo_title: "Expo Liquid Glass Animation Tutorial: Interactive Frosted UI Effects"
seo_description: "Follow this step-by-step Expo liquid glass animation tutorial. Build frosted glass cards, animate gradients with Reanimated, add touch tilt, and create premium UI effects in React Native."
author_name: "Collin Stewart"
tags:
  - Expo
  - React Native
  - Liquid Glass
  - Animation
  - Skia
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

The "liquid glass" aesthetic has been everywhere in modern UI—translucent panels, frosted backgrounds, subtle light refractions that make interfaces feel physical. Apple's recent designs lean heavily into this, and the web is following. But building that effect in React Native takes a specific set of tools: Skia for rendering, Reanimated for animation, and a careful eye for performance.

If you've already read our [guide to building the React Native Expo liquid glass effect](/blog/react-native-expo-liquid-glass-effect), you know the basic ingredients: background blur, semi-transparent surfaces, gradient overlays, and delicate borders. This tutorial goes further—we'll focus on _animating_ those ingredients. You'll learn how to make the glass respond to touch, how to shift gradients over time, and how to create that smooth, liquid feel that makes the effect come alive.

By the end, you'll have a working, interactive glass card that reacts to your finger and pulses with ambient animation—all running at 60 frames per second on a real device. Let's get started.

## What you'll need

This tutorial assumes a basic Expo project. If you're starting fresh, create one:

```bash
npx create-expo-app LiquidGlassTutorial
cd LiquidGlassTutorial
```

Install the required libraries:

```bash
npx expo install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
```

Skia handles the rendering, Reanimated drives the animations, and gesture-handler gives us touch tracking. You'll also need to enable Reanimated's Babel plugin. Add this to `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

And wrap your app in `GestureHandlerRootView`:

```javascript
// App.js
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* rest of your app */}
    </GestureHandlerRootView>
  );
}
```

Now we're ready to build.

## Step 1: Create a static glass card

Before we animate, we need something to animate. A basic glass card uses Skia's blur and semi-transparent rectangles layered over a colorful background. Let's create the foundation.

```javascript
import { Canvas, RoundedRect, Blur, Group } from "@shopify/react-native-skia";
import { View, StyleSheet } from "react-native";

function GlassCard({ width = 300, height = 200 }) {
  return (
    <View style={[styles.cardContainer, { width, height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={24}
            color="rgba(255, 255, 255, 0.08)"
          />
          <Blur blur={20} />
        </Group>
        {/* hairline border */}
        <RoundedRect
          x={0.5}
          y={0.5}
          width={width - 1}
          height={height - 1}
          r={24}
          color="transparent"
          strokeWidth={1}
          style="stroke"
          strokeColor="rgba(255,255,255,0.2)"
        />
      </Canvas>
    </View>
  );
}
```

The first `RoundedRect` is translucent, and the `Blur` filter softens it. The second `RoundedRect` draws a thin border around the edge. That's your basic frosted glass look. The background behind this card should be a colorful gradient or image so the blur has something to refract.

## Step 2: Add an animated gradient overlay

A static glass card is nice, but the "liquid" feel comes from gradients that move. We'll add a `LinearGradient` that shifts over time using Reanimated's `useSharedValue` and `withRepeat`.

```javascript
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { LinearGradient, vec } from "@shopify/react-native-skia";

function AnimatedGlassCard({ width = 300, height = 200 }) {
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const endX = useSharedValue(width);
  const endY = useSharedValue(height);

  // Animate gradient start and end points
  startX.value = withRepeat(withTiming(width, { duration: 3000 }), -1, true);
  endX.value = withRepeat(withTiming(0, { duration: 3000 }), -1, true);
  startY.value = withRepeat(withTiming(height, { duration: 4000 }), -1, true);
  endY.value = withRepeat(withTiming(0, { duration: 4000 }), -1, true);

  const gradientStart = useDerivedValue(() => vec(startX.value, startY.value));
  const gradientEnd = useDerivedValue(() => vec(endX.value, endY.value));

  return (
    <View style={[styles.cardContainer, { width, height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={24}
            color="rgba(255, 255, 255, 0.08)"
          />
          <Blur blur={20} />
        </Group>
        <RoundedRect x={0} y={0} width={width} height={height} r={24}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.02)"]}
          />
        </RoundedRect>
        <RoundedRect
          x={0.5}
          y={0.5}
          width={width - 1}
          height={height - 1}
          r={24}
          color="transparent"
          strokeWidth={1}
          style="stroke"
          strokeColor="rgba(255,255,255,0.2)"
        />
      </Canvas>
    </View>
  );
}
```

Now the light highlights inside the glass drift slowly, creating that "liquid" refraction effect. The `useDerivedValue` ensures the gradient updates without causing a React re-render—it's all handled on the UI thread.

## Step 3: Make the card respond to touch

The next layer of realism is touch interaction. We want the glass to tilt slightly as you drag your finger across it, as if it's catching light from your movement. We'll use `GestureDetector` from `react-native-gesture-handler` to track the finger position and update two shared values.

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function TouchableGlassCard({ width = 300, height = 200 }) {
  const pressedX = useSharedValue(0);
  const pressedY = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const pan = Gesture.Pan()
    .onBegin((e) => {
      isPressed.value = true;
      pressedX.value = e.x;
      pressedY.value = e.y;
    })
    .onUpdate((e) => {
      pressedX.value = e.x;
      pressedY.value = e.y;
    })
    .onEnd(() => {
      isPressed.value = false;
      // spring back to center
      pressedX.value = withSpring(width / 2);
      pressedY.value = withSpring(height / 2);
    });

  const glassStyle = useAnimatedStyle(() => {
    const rotateY = isPressed.value
      ? withSpring((pressedX.value - width / 2) / 20)
      : withSpring(0);
    const rotateX = isPressed.value
      ? withSpring((height / 2 - pressedY.value) / 20)
      : withSpring(0);
    return {
      transform: [
        { perspective: 600 },
        { rotateY: `${rotateY}deg` },
        { rotateX: `${rotateX}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width, height }, glassStyle]}>
        {/* Glass card content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

Here's the breakdown:

- `Gesture.Pan()` tracks the finger.
- `pressedX` and `pressedY` store the current touch location.
- `useAnimatedStyle` maps those values to 3D rotation: moving right tilts the card right, moving up tilts it up.
- The spring animation (`withSpring`) smooths the motion and returns the card to neutral when released.

Wrap this around the glass card component, and you have a touch-reactive liquid glass panel. The rotation is subtle—a few degrees—which feels premium without being distracting.

## Step 4: Add ambient floating animation

Beyond touch response, we can add an ambient "breathing" effect to the card—a slow scale and opacity pulse that makes it feel alive.

```javascript
function BreathingGlassCard() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.03, { duration: 2000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      {/* Glass card */}
    </Animated.View>
  );
}
```

This gives a gentle pulse, as if the glass is subtly shifting with ambient light. Combine it with the touch tilt for a card that feels both interactive and organic.

## Step 5: Put it all together

Here's a full example that includes a colorful background, an animated gradient, touch tilt, and breathing:

```javascript
import { StyleSheet, View } from "react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import {
  Canvas,
  RoundedRect,
  Blur,
  LinearGradient,
  vec,
  Group,
} from "@shopify/react-native-skia";

export default function LiquidGlassDemo() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableGlassCard />
      </View>
    </GestureHandlerRootView>
  );
}

function TouchableGlassCard({ width = 320, height = 220 }) {
  const pressedX = useSharedValue(width / 2);
  const pressedY = useSharedValue(height / 2);
  const isPressed = useSharedValue(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // ambient breathing
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.03, { duration: 2000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.92, { duration: 2000 }), -1, true);
  }, []);

  const pan = Gesture.Pan()
    .onBegin((e) => {
      isPressed.value = true;
      pressedX.value = e.x;
      pressedY.value = e.y;
    })
    .onUpdate((e) => {
      pressedX.value = e.x;
      pressedY.value = e.y;
    })
    .onEnd(() => {
      isPressed.value = false;
      pressedX.value = withSpring(width / 2);
      pressedY.value = withSpring(height / 2);
    });

  const glassStyle = useAnimatedStyle(() => {
    const rotateY = isPressed.value
      ? withSpring((pressedX.value - width / 2) / 20)
      : withSpring(0);
    const rotateX = isPressed.value
      ? withSpring((height / 2 - pressedY.value) / 20)
      : withSpring(0);
    return {
      transform: [
        { perspective: 600 },
        { scale: scale.value },
        { rotateY: `${rotateY}deg` },
        { rotateX: `${rotateX}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const gradientStart = useDerivedValue(() =>
    vec(pressedX.value, pressedY.value),
  );
  const gradientEnd = useDerivedValue(() =>
    vec(width - pressedX.value, height - pressedY.value),
  );

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width, height }, glassStyle]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Group>
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={24}
              color="rgba(255,255,255,0.08)"
            />
            <Blur blur={20} />
          </Group>
          <RoundedRect x={0} y={0} width={width} height={height} r={24}>
            <LinearGradient
              start={gradientStart}
              end={gradientEnd}
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.02)"]}
            />
          </RoundedRect>
          <RoundedRect
            x={0.5}
            y={0.5}
            width={width - 1}
            height={height - 1}
            r={24}
            color="transparent"
            strokeWidth={1}
            style="stroke"
            strokeColor="rgba(255,255,255,0.2)"
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f1a",
  },
});
```

When you run this, you'll see a frosted glass card that tilts with your touch, breathes slowly, and has a gradient that shifts based on finger position. The effect is subtle but unmistakably premium.

## Performance tips

Liquid glass effects can be heavy if you're not careful. Here's how to keep it smooth:

- **Limit blur radius**: A `Blur` of 20 is usually enough. Higher values cost more GPU time.
- **Use `useDerivedValue`**: Always map shared values to Skia props via `useDerivedValue`. It keeps work on the UI thread.
- **Avoid re-rendering**: Don't put animated styles in React state. Use Reanimated's shared values and `useAnimatedStyle`.
- **Test on real devices**: Simulators can be misleading. Mid-range Android devices may struggle with heavy blur.

If you notice frame drops, consider simplifying the background gradient or disabling the breathing animation on low-end devices. For more performance patterns, check our guide on [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react) and our [React Native Skia tutorial for beginners](/blog/react-native-skia-tutorial-beginners) for fundamentals.

## A real project: bringing a dashboard to life

A while back, I built a smart home dashboard with this exact effect. The original UI used flat cards—functional but boring. We added liquid glass panels with touch tilt and a slow ambient glow. The difference was night and day. Users described it as "premium" and "alive." It wasn't gimmicky; it made the interface feel tangible, like you could almost touch the glass. We spent a week perfecting the animations, but it paid off in user engagement.

The key was restraint. The animations were subtle—never more than a few degrees of rotation or a slow opacity pulse. That's the secret to liquid glass: it should feel like a natural material, not a cartoon.

## Wrapping up

You now have the building blocks for an animated liquid glass effect in Expo. Start with the static frosted card, layer in an animated gradient, add touch-reactive tilt, and finish with ambient breathing. Each step uses Reanimated shared values and Skia's GPU-accelerated rendering to keep everything at 60fps.

For a deeper dive into the static effect, revisit our [original liquid glass guide](/blog/react-native-expo-liquid-glass-effect). For more on Skia's capabilities, see our [React Native Skia guide](/blog/react-native-skia). And if you're looking to expand your animation toolkit, our [React Native Expo animations guide](/blog/react-native-expo-animations-guide) has you covered.

Now go make something that feels as good as it looks.

---

_Want to implement liquid glass animations in your own app? Red Surge Technology builds premium mobile experiences with React Native and Skia. [Get in touch](/contact) to discuss your project._
