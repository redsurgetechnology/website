---
title: "React Native Skia Tutorial for Beginners: Draw Your First Graphics and Animations"
date: "2026-09-03T10:00:00.000Z"
excerpt: "New to React Native Skia? This beginner tutorial walks through setup, basic shapes, gradients, and your first animation—no prior graphics experience required."
cover_image: "/images/blog/uploads/react-native-skia-tutorial-beginners.webp"
seo_title: "React Native Skia Tutorial for Beginners: Your First Graphics and Animations"
seo_description: "Learn React Native Skia from scratch. This beginner tutorial covers installation, canvas, basic shapes, gradients, and simple animations with code examples you can run today."
author_name: "Collin Stewart"
tags:
  - React Native
  - Skia
  - Tutorial
  - Animation
  - Beginner
category: "JavaScript"
reading_time: 12
featured: false
no_index: false
---

If you've ever wanted to draw custom graphics or create smooth animations in a React Native app, you've probably hit the limits of standard views. Buttons, text, and images are fine—but what about a circular progress ring, a particle effect, or a custom shape that doesn't exist in any component library? That's where Skia comes in.

React Native Skia is a library that brings the Skia graphics engine (the same one behind Chrome and Flutter) to React Native. It lets you draw directly onto a canvas with hardware acceleration. The learning curve can feel steep if you've never worked with canvas or graphics before, but the fundamentals are surprisingly approachable.

I remember the first time I got a circle to appear on screen using Skia—it felt like unlocking a superpower. In this tutorial, I'll take you from zero to your first animation, step by step. No prior graphics experience needed. By the end, you'll have a working foundation to build on.

## What is Skia and why should you care?

Skia is an open-source 2D graphics library used by Chrome, Android, Flutter, and now React Native. It handles the low-level drawing—shapes, paths, text, images, gradients—and does it fast, using the GPU when possible.

In React Native, standard views are great for UI elements. But when you need custom drawing or high-performance animations, the normal view system becomes a bottleneck. Skia bypasses that by rendering directly to a canvas. You're no longer limited to rectangles and text; you can draw anything you can describe in code.

If you've read our earlier [React Native Skia guide](/blog/react-native-skia), you know it's powerful but can be complex. This tutorial is different—it's the beginner path. We'll start with the absolute basics.

## Prerequisites and setup

You need a React Native project with Expo or bare React Native. I'll use Expo for simplicity, but the concepts apply either way.

1. **Create a new Expo project** (if you don't have one):

```bash
npx create-expo-app SkiaTutorial
cd SkiaTutorial
```

2. **Install the required packages**:

```bash
npx expo install @shopify/react-native-skia react-native-reanimated
```

`@shopify/react-native-skia` is the Skia binding. `react-native-reanimated` is needed for animations. If you're using Expo Go, note that Skia requires a development build because it includes native code. You can create one with `npx expo run:ios` or `npx expo run:android`, or use EAS Build.

3. **Wrap your app in `GestureHandlerRootView`** (for future gesture work) and ensure Reanimated is configured. For this tutorial, we'll just use the `Canvas` component from Skia, which doesn't require additional setup.

## Your first Skia canvas

Let's create a simple screen that shows a circle. Open `App.js` and replace the contents with:

```javascript
import { StyleSheet, View } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";

export default function App() {
  return (
    <View style={styles.container}>
      <Canvas style={{ flex: 1 }}>
        <Circle cx={200} cy={200} r={100} color="blue" />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
```

That's it. A blue circle centered at (200, 200) with radius 100. The `Canvas` component creates a drawing surface. Inside it, you place Skia drawing components like `Circle`, `Rect`, `Path`, etc. Coordinates are in pixels, with (0,0) at the top-left.

The `Canvas` has `style={{ flex: 1 }}` to fill the screen. Run the app, and you'll see the circle.

## Drawing basic shapes

Skia provides components for common shapes. Let's add a rectangle and a line. Replace the canvas content:

```javascript
<Canvas style={{ flex: 1 }}>
  <Circle cx={100} cy={100} r={50} color="red" />
  <Rect x={200} y={50} width={100} height={100} color="green" />
  <Line
    p1={{ x: 50, y: 300 }}
    p2={{ x: 350, y: 300 }}
    color="black"
    strokeWidth={5}
  />
</Canvas>
```

- `Circle` takes `cx`, `cy`, `r`.
- `Rect` takes `x`, `y`, `width`, `height`.
- `Line` takes `p1` and `p2` objects, plus `strokeWidth` for thickness.

You can combine multiple shapes in one canvas. They are drawn in order, so later shapes appear on top.

## Adding gradients

Flat colors are nice, but gradients add depth. Skia supports linear and radial gradients.

```javascript
import {
  Canvas,
  Circle,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";

<Canvas style={{ flex: 1 }}>
  <Circle cx={200} cy={200} r={100}>
    <LinearGradient
      start={vec(100, 100)}
      end={vec(300, 300)}
      colors={["#ff6b6b", "#feca57", "#48dbfb"]}
    />
  </Circle>
</Canvas>;
```

The `vec` function creates a point. The gradient goes from start to end, interpolating colors. Notice the gradient is inside the shape component. This applies the gradient to that shape.

## Your first animation: pulsing circle

Static drawings are fine, but animations make Skia shine. To animate, we need Reanimated shared values. Here's a simple pulsing circle that changes radius.

```javascript
import { StyleSheet, View } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

export default function App() {
  const radius = useSharedValue(50);

  radius.value = withRepeat(withTiming(100, { duration: 1000 }), -1, true);

  const animatedRadius = useDerivedValue(() => radius.value, [radius]);

  return (
    <View style={styles.container}>
      <Canvas style={{ flex: 1 }}>
        <Circle cx={200} cy={200} r={animatedRadius} color="purple" />
      </Canvas>
    </View>
  );
}
```

Explanation:

- `useSharedValue(50)` creates a value that can be animated without re-rendering React.
- `withRepeat` and `withTiming` animate it from 50 to 100 and back repeatedly.
- `useDerivedValue` lets Skia read the current value each frame.
- We pass `animatedRadius` directly to `r`. Skia updates efficiently on the UI thread.

When you run this, the circle pulses smoothly. That's the foundation for more complex animations.

## Combining animation with gradients

Let's make the gradient change too. We'll animate the gradient start and end positions.

```javascript
const startX = useSharedValue(0);
const startY = useSharedValue(0);
const endX = useSharedValue(200);
const endY = useSharedValue(200);

startX.value = withRepeat(withTiming(200, { duration: 2000 }), -1, true);
endX.value = withRepeat(withTiming(0, { duration: 2000 }), -1, true);

const gradientStart = useDerivedValue(() => vec(startX.value, startY.value));
const gradientEnd = useDerivedValue(() => vec(endX.value, endY.value));

<Circle cx={200} cy={200} r={100}>
  <LinearGradient
    start={gradientStart}
    end={gradientEnd}
    colors={["red", "blue"]}
  />
</Circle>;
```

Now the gradient shifts over time. This pattern—animating shared values and mapping them to Skia props via `useDerivedValue`—is the core of Skia animations.

## Common beginner pitfalls

- **Forgetting to wrap animations in `useDerivedValue`**: If you pass a plain number, the animation won't update. Always derive a value when you're using shared values.
- **Using `Canvas` inside `ScrollView` without `style={{ flex: 1 }}`**: The canvas needs dimensions. Set explicit `width` and `height` or `flex: 1`.
- **Trying to use Expo Go**: Skia requires a development build. If you see errors, build with `npx expo run:ios` or use EAS.
- **Drawing outside the canvas bounds**: Shapes are clipped. Make sure coordinates stay within the canvas size.

## Next steps from here

Now that you can draw shapes and animate them, the possibilities are open. You can:

- Build custom progress indicators with `Path` and `Arc`.
- Create particle effects with many circles.
- Use shaders for advanced effects (check our [React Native Skia guide](/blog/react-native-skia) for more).
- Combine with gestures to create interactive graphics.

If you're interested in building that premium "liquid glass" look, we have a [tutorial on React Native Expo liquid glass](/blog/react-native-expo-liquid-glass-effect) that builds on these fundamentals.

And if you're looking for more animation patterns beyond Skia, our [React Native Expo animations guide](/blog/react-native-expo-animations-guide) covers the broader toolkit.

## A real story: my first Skia project

When I first tried Skia, I wanted to build a simple audio waveform visualizer. I didn't know any graphics programming, and the Skia docs felt intimidating. I followed a tutorial similar to this one, got a circle to appear, then a line, then a gradient. Within a day, I had a moving waveform by connecting data points. It wasn't perfect, but it worked, and the sense of accomplishment was huge. The key was breaking it down: shapes first, then gradients, then animation.

Don't rush. Experiment with each step. Change colors, positions, sizes. See what happens. That's how you learn.

## Wrapping up

React Native Skia opens a door to custom graphics and high-performance animations that standard views can't match. The learning curve is real, but the fundamentals are manageable. Start with shapes, add gradients, then bring them to life with Reanimated.

We covered the absolute basics, but Skia goes much deeper—paths, shaders, text, images, and more. For a comprehensive overview, see our [main Skia guide](/blog/react-native-skia). For now, play around, break things, and have fun. That's the best way to learn.

Happy drawing!

---

_Want to build a custom graphics feature in your React Native app? Red Surge Technology specializes in high-performance mobile UI and animations. [Get in touch](/contact) to discuss your project._
