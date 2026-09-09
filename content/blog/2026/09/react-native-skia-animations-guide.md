---
title: "React Native Skia Animations Guide: Smooth UI at 60fps"
date: "2026-09-09T10:00:00.000Z"
excerpt: "Master React Native Skia animations with Reanimated. Learn shared values, derived values, timing, springs, interpolations, and gesture-driven animations for 60fps custom UI."
cover_image: "/images/blog/uploads/react-native-skia-animations-guide.webp"
seo_title: "React Native Skia Animations Guide: Reanimated + Skia for 60fps"
seo_description: "A complete guide to React Native Skia animations. Use Reanimated shared values, useDerivedValue, withTiming, withSpring, interpolate, and gestures to build fluid custom animations."
author_name: "Collin Stewart"
tags:
  - React Native
  - Skia
  - Animation
  - Reanimated
  - Mobile Development
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

Skia gives you the power to draw almost anything in React Native. But drawing alone isn't enough—animation is what makes custom graphics feel alive. A static chart is informative; an animated chart tells a story. A pulsing indicator draws the eye; a smoothly transitioning gradient feels premium.

React Native Skia pairs beautifully with Reanimated, the animation library that runs on the UI thread. Together, they let you create complex, GPU-accelerated animations that hit 60 frames per second without breaking a sweat. The key is understanding how to connect Reanimated's shared values to Skia's drawing props.

In this guide, I'll walk through the core animation patterns, from simple timing to gesture-driven interactions. If you're new to Skia itself, check our [React Native Skia tutorial for beginners](/blog/react-native-skia-tutorial-beginners) first. If you're already comfortable with the basics, this guide will take your animations to the next level.

## The animation architecture: Shared Values and Derived Values

Skia animations in React Native rely on two Reanimated concepts: **shared values** and **derived values**.

A shared value is a mutable number that lives on the UI thread. When you update it, Reanimated knows to update anything that depends on it—without re-rendering React. This is the foundation of high-performance animation.

A derived value is a value computed from one or more shared values. In Skia, you use `useDerivedValue` to map shared values to props like `r`, `cx`, `color`, or gradient endpoints. Skia reads these derived values each frame and redraws efficiently.

Here's the simplest example: animating a circle's radius.

```javascript
import { Canvas, Circle } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

function PulsingCircle() {
  const radius = useSharedValue(40);

  radius.value = withRepeat(withTiming(80, { duration: 1000 }), -1, true);

  const animatedRadius = useDerivedValue(() => radius.value, [radius]);

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Circle cx={100} cy={100} r={animatedRadius} color="blue" />
    </Canvas>
  );
}
```

The shared value `radius` animates from 40 to 80 and back repeatedly. The derived value `animatedRadius` ensures Skia reads the latest value each frame. The result is a smooth pulse with zero React re-renders.

## Timing and Springs: The Two Basic Animation Functions

Reanimated provides two primary animation functions: `withTiming` and `withSpring`.

**`withTiming`** animates a value to a target over a specified duration with an easing curve. It's predictable and precise.

```javascript
const x = useSharedValue(0);
x.value = withTiming(200, { duration: 500, easing: Easing.inOut(Easing.ease) });
```

**`withSpring`** animates a value to a target using a spring simulation, which feels more natural for user-driven interactions. You can configure damping, stiffness, and mass.

```javascript
const scale = useSharedValue(1);
scale.value = withSpring(1.5, { damping: 10, stiffness: 150 });
```

Which one should you use? Springs are great for gesture-driven movements (like pulling a card). Timing is better for predictable, repeatable animations (like a progress bar). Experiment with both.

In the context of Skia, you can apply these to any numeric prop. For example, a springy scale:

```javascript
const scale = useSharedValue(1);
scale.value = withSpring(1.5, { damping: 10 });

const animatedScale = useDerivedValue(() => scale.value, [scale]);
<Circle
  cx={100}
  cy={100}
  r={50}
  transform={[{ scale: animatedScale }]}
  color="green"
/>;
```

## Interpolating values for richer effects

Often you want to map one range to another. That's where `interpolate` comes in. For example, you might want a color to change from red to green as a progress value goes from 0 to 1. Reanimated's `interpolateColor` handles this.

```javascript
const progress = useSharedValue(0);
progress.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);

const animatedColor = useDerivedValue(() => {
  return interpolateColor(progress.value, [0, 1], ["#ff6b6b", "#48dbfb"]);
}, [progress]);

<Circle cx={100} cy={100} r={60} color={animatedColor} />;
```

You can also interpolate numeric ranges to drive positions, sizes, opacities, etc. The possibilities are endless.

## Gesture-Driven Animations: Reacting to Touch

One of the most powerful patterns is driving animations from user gestures. Using `react-native-gesture-handler`, you can track finger position and map it to Skia props in real time.

Here's an example: a circle that moves with your finger.

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { Canvas, Circle } from "@shopify/react-native-skia";

function DraggableCircle() {
  const x = useSharedValue(100);
  const y = useSharedValue(100);

  const pan = Gesture.Pan().onUpdate((e) => {
    x.value = e.absoluteX;
    y.value = e.absoluteY;
  });

  const animatedX = useDerivedValue(() => x.value, [x]);
  const animatedY = useDerivedValue(() => y.value, [y]);

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={{ flex: 1 }}>
        <Circle cx={animatedX} cy={animatedY} r={40} color="orange" />
      </Canvas>
    </GestureDetector>
  );
}
```

Because shared values are on the UI thread, the circle follows your finger with zero lag. You can add springs to smooth the movement:

```javascript
.onUpdate((e) => {
  x.value = withSpring(e.absoluteX, { damping: 20, stiffness: 200 });
  y.value = withSpring(e.absoluteY, { damping: 20, stiffness: 200 });
});
```

Now the circle springs to your finger, creating a playful, physical feel.

## Animating Multiple Properties Simultaneously

In real apps, you often want to animate several properties at once—size, opacity, color, gradient. Reanimated handles this naturally because each derived value updates independently. There's no need to coordinate multiple state updates; just define separate shared values and derived values.

```javascript
const radius = useSharedValue(20);
const opacity = useSharedValue(1);
const color = useSharedValue(0); // for interpolation

radius.value = withRepeat(withTiming(60, { duration: 1500 }), -1, true);
opacity.value = withRepeat(withTiming(0.3, { duration: 1500 }), -1, true);
color.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);

const animatedRadius = useDerivedValue(() => radius.value, [radius]);
const animatedOpacity = useDerivedValue(() => opacity.value, [opacity]);
const animatedColor = useDerivedValue(
  () => interpolateColor(color.value, [0, 1], ["purple", "cyan"]),
  [color],
);

<Circle
  cx={100}
  cy={100}
  r={animatedRadius}
  opacity={animatedOpacity}
  color={animatedColor}
/>;
```

All these updates happen together on the UI thread, resulting in a rich, synchronized animation without any re-render overhead.

## Optimizing Performance: The Rules of Thumb

While Skia is fast, there are still ways to shoot yourself in the foot. Here are the rules I follow:

1. **Always use `useDerivedValue` for animated props.** Never pass a shared value directly to a Skia component; Skia expects a derived value. If you pass a raw number, the animation won't update.

2. **Avoid creating new objects inside `useDerivedValue`.** If you need a point or vector, use `vec` inside the derived value, but keep the computation minimal. For example, `vec(x.value, y.value)` is fine; constructing a complex path or array may be expensive each frame.

3. **Use `useSharedValue` for numbers, not objects or strings.** If you need to animate a color, use `interpolateColor` with a numeric shared value, or use `useDerivedValue` to produce the final string.

4. **Memoize static components.** If a shape is not animated, memoize it with `useMemo` or wrap it in `React.memo` to prevent unnecessary re-renders. Skia components can be expensive to recreate.

5. **Test on real devices.** Simulators may hide performance issues. Mid-range Android devices especially can struggle with heavy blur or complex shaders.

6. **Limit the number of active animations.** Too many simultaneous animations can saturate the GPU. If possible, reduce the number of animated elements or lower the frame rate.

If you've read our [React Native Skia guide](/blog/react-native-skia), you know the underlying rendering engine is powerful but requires discipline. These performance rules are your guardrails.

## Real-World Example: Animated Progress Ring

Let's combine these patterns into a practical component: a circular progress ring with a gradient stroke that fills based on a progress value (0 to 1). This is a common UI element for dashboards, fitness apps, or audio players.

```javascript
import { Canvas, Path, Skia, vec } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

function ProgressRing({ progress, size = 200, strokeWidth = 12 }) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const animatedProgress = useSharedValue(progress);

  // Animate progress changes
  animatedProgress.value = withTiming(progress, { duration: 600 });

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + 2 * Math.PI * animatedProgress.value;
    p.addArc(
      {
        x: center - radius,
        y: center - radius,
        width: radius * 2,
        height: radius * 2,
      },
      (startAngle * 180) / Math.PI,
      ((endAngle - startAngle) * 180) / Math.PI,
    );
    return p;
  }, [animatedProgress]);

  const gradientStart = useDerivedValue(() => vec(0, 0));
  const gradientEnd = useDerivedValue(() => vec(size, size));

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Background track */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        color="rgba(255,255,255,0.1)"
      />
      {/* Progress arc with gradient */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      >
        <LinearGradient
          start={gradientStart}
          end={gradientEnd}
          colors={["#ff6b6b", "#feca57", "#48dbfb"]}
        />
      </Path>
    </Canvas>
  );
}
```

This component smoothly animates the progress value using `withTiming`, and the gradient adds a premium feel. The path is computed in `useDerivedValue` so it updates on the UI thread.

## Where to Go from Here

Skia animations can be as simple or as complex as you need. Here are some directions to explore:

- **Particle systems**: Use many small circles with random velocities and positions, driven by shared values and springs.
- **Shaders**: Custom fragment shaders can create real-time effects like noise, waves, and lighting. This is the deep end, but incredibly powerful.
- **Morphing paths**: Interpolate between different path definitions to create shape morphing animations.
- **Chart animations**: Animate data transitions in bar charts, line charts, and pie charts.

If you've been following our series, you know we've covered [React Native Expo liquid glass](/blog/expo-liquid-glass-animation-tutorial), which is a prime example of Skia animations in action. We also have a [beginner Skia tutorial](/blog/react-native-skia-tutorial-beginners) if you need a refresher on the fundamentals.

## Wrapping Up

React Native Skia animations open a world of possibilities for custom UI. By combining Reanimated's shared values with Skia's GPU rendering, you can create fluid, high-performance animations that feel native. The key patterns—shared values, derived values, timing, springs, interpolation, and gesture-driven updates—will serve you in almost any project.

Start with simple animations, master the patterns, and then push the boundaries. The mobile web is becoming more interactive and visually rich, and Skia is one of the best tools to meet that demand.

Now go build something that moves.

---

_Need help with custom Skia animations in your React Native app? Red Surge Technology builds high-performance, visually stunning mobile experiences. [Get in touch](/contact) to discuss your project._
