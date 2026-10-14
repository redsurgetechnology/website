---
title: "React Native Skia vs Reanimated: Which Should You Use for Animations?"
date: "2026-10-14T10:00:00.000Z"
excerpt: "Skia and Reanimated aren't competitors—they solve different problems. Learn what each library does, when to use one or the other, and why most animation-heavy apps use both."
cover_image: "/images/blog/uploads/react-native-skia-vs-reanimated.webp"
seo_title: "React Native Skia vs Reanimated: When to Use Each for Animations"
seo_description: "Compare React Native Skia and Reanimated. Learn the difference between rendering and animation, when to use each, and why the best apps use both together."
author_name: "Collin Stewart"
tags:
  - React Native
  - Skia
  - Reanimated
  - Animation
  - Mobile Development
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

Here's a question I get asked regularly: "Should I use Skia or Reanimated for animations in React Native?"

The question makes sense on the surface. Both are animation-related libraries. Both show up in discussions about high-performance React Native UI. Both are frequently mentioned in the same breath as the "modern stack" for mobile.

But the question contains a false premise. Skia and Reanimated aren't competitors. They don't do the same thing. Asking which one to use for animations is a bit like asking whether you should use a canvas or a paintbrush. The canvas is where you draw; the paintbrush is what you draw with.

Skia is a rendering engine. It draws pixels—custom graphics, shapes, gradients, shaders, text—onto a GPU-accelerated canvas. Reanimated is an animation library. It drives values on the UI thread, coordinating changes to props, transforms, and styles over time.

You can use Reanimated without Skia (animating standard React Native views). You can use Skia without Reanimated (rendering static graphics). But when you want to animate Skia graphics, you use both—Reanimated provides the animated values, and Skia renders them every frame.

This guide clarifies what each library actually does, when to reach for each one, and why most animation-heavy React Native apps end up using both. If you want deep dives into either library, see our [React Native Skia guide](/blog/react-native-skia) and our [Skia animations guide](/blog/react-native-skia-animations-guide). For the broader Expo animation landscape, our [React Native Expo animations guide](/blog/react-native-expo-animations-guide) covers the ecosystem.

## What Reanimated Actually Does

Reanimated is an animation library built on top of React Native's animation primitives. Its key feature is running animations on the UI thread, separate from the JavaScript thread. This means animations stay smooth at 60 frames per second even when the JavaScript thread is busy rendering, fetching data, or processing logic.

Reanimated provides:

- **Shared values.** Mutable values that live on the UI thread and can be updated without triggering React re-renders.
- **Animation functions.** `withTiming`, `withSpring`, `withDecay`, `withRepeat`, `withSequence`, and others for driving values over time.
- **Worklets.** Small functions that run on the UI thread, allowing you to compute derived values without JavaScript round trips.
- **Gesture integration.** Deep integration with `react-native-gesture-handler` for touch-driven animations.
- **Layout animations.** Built-in support for entering, exiting, and layout animations on standard React Native views.

Here's a typical Reanimated example—animating a standard view's opacity and scale:

```jsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

function FadeIn() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        { width: 100, height: 100, backgroundColor: "blue" },
        animatedStyle,
      ]}
    />
  );
}
```

Notice that this animation is on an `Animated.View`. Reanimated is animating the props of a standard React Native view. There's no Skia involved. The view exists in the native view hierarchy, and Reanimated updates its style props on the UI thread.

Reanimated is the right tool for animating the components that make up your app's layout. Buttons, cards, screen transitions, gestures—anything built from standard React Native views.

What Reanimated can't do easily is render custom graphics. It can't draw a gradient-filled path, a complex shape, or a custom shader. For those, you need Skia.

## What Skia Actually Does

Skia is a 2D graphics library—the same rendering engine that powers Chrome, Android, and Flutter. In React Native, `@shopify/react-native-skia` provides a GPU-accelerated canvas that you draw onto using React components.

Skia provides:

- **Canvas component.** The drawing surface.
- **Shape components.** `Circle`, `Rect`, `Path`, `Text`, `Image`, `Group`, and more.
- **Paint effects.** `Blur`, `LinearGradient`, `RadialGradient`, `Shader`, `ImageFilter`.
- **Low-level drawing.** Direct access to Skia's C++ primitives via JavaScript bindings.

Here's a static Skia drawing:

```jsx
import {
  Canvas,
  Circle,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";

function GradientOrb() {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Circle cx={100} cy={100} r={80}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(200, 200)}
          colors={["#ff6b6b", "#feca57", "#48dbfb"]}
        />
      </Circle>
    </Canvas>
  );
}
```

This renders a gradient-filled circle. It's static—no animation involved. Skia is doing the drawing; nothing is changing over time.

What Skia doesn't provide is a way to drive values over time. There's no `withTiming` or `withSpring` in Skia. For that, you need Reanimated—or Skia's own animation-adjacent APIs, which are limited compared to Reanimated.

## The Confusion: They Sound Similar

The confusion comes from the fact that both libraries are often described with the same vocabulary: "high performance," "smooth animations," "modern React Native." They're frequently mentioned in the same blog posts and conference talks, which reinforces the impression that they're alternatives.

They're not. Here's the clearest way to think about it:

- **Reanimated animates what's already there.** It moves existing views, changes their properties, coordinates them over time.
- **Skia draws what wasn't there before.** It renders pixels to a canvas—shapes, paths, shaders—that aren't native views.

Reanimated is about _changing_ things. Skia is about _drawing_ things. When you animate Skia graphics, you're using Reanimated to change the values that Skia renders each frame.

## How They Work Together

The power of the two libraries emerges when you combine them. Reanimated provides shared values that change over time. Skia reads those values through `useDerivedValue` and renders the graphics based on the current state.

Here's a pulsing gradient circle—Reanimated drives the radius, Skia draws the circle:

```jsx
import {
  Canvas,
  Circle,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

function PulsingOrb() {
  const radius = useSharedValue(40);

  useEffect(() => {
    radius.value = withRepeat(withTiming(80, { duration: 1000 }), -1, true);
  }, []);

  const animatedRadius = useDerivedValue(() => radius.value, [radius]);

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Circle cx={100} cy={100} r={animatedRadius}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(200, 200)}
          colors={["#ff6b6b", "#48dbfb"]}
        />
      </Circle>
    </Canvas>
  );
}
```

The pattern is: Reanimated drives the animated values, Skia renders them. Both run on the UI thread, so the animation is smooth even when JavaScript is busy.

This is the same pattern we used for the [Expo liquid glass animation tutorial](/blog/expo-liquid-glass-animation-tutorial), where Reanimated tracked touch position and Skia rendered the glass effect based on that position.

## When to Use Reanimated Alone

If you're animating standard React Native views—no custom graphics, no canvas rendering—Reanimated is the right tool.

**Use Reanimated when:**

- Animating `View`, `Text`, `Image`, or other standard components.
- Handling gesture-driven animations (drag, swipe, pinch, rotate).
- Animating screen transitions or layout changes.
- Animating prop changes on existing components (opacity, transform, backgroundColor).
- Building scroll-driven effects (parallax, sticky headers, progress bars).

For a comprehensive walkthrough of Reanimated-powered animations in Expo, see our [React Native Expo animations guide](/blog/react-native-expo-animations-guide). It covers the full range of Reanimated features and patterns.

## When to Use Skia Alone

If you need to draw custom graphics and don't need to animate them (yet), Skia is the tool. Static charts, custom icons, decorative shapes, complex gradients, shaders—anything you can't render with standard React Native views.

**Use Skia when:**

- Drawing custom 2D graphics (charts, diagrams, illustrations).
- Rendering shader-based effects (noise, lighting, distortion).
- Drawing complex paths and shapes.
- Rendering large numbers of small elements (particles, data points).

For a from-scratch Skia tutorial, see our [React Native Skia guide](/blog/react-native-skia) and our [beginner Skia tutorial](/blog/react-native-skia-tutorial-for-beginners).

## When to Use Both Together

The most powerful animations in React Native use both. Reanimated handles the timing, easing, and value changes. Skia handles the rendering of custom graphics based on those values.

**Use both when:**

- Animating custom graphics (a pulsing orb, a progress ring, a particle system).
- Building interactive visuals driven by touch (a shape that follows your finger).
- Creating shader-based animations (a gradient that shifts over time).
- Animating chart data (bars that grow, lines that draw, values that update).
- Building effects that can't be done with standard views (blur animations, morphing shapes).

The pattern is always the same. Reanimated produces animated values. Skia consumes them through `useDerivedValue`. Both run on the UI thread, so the result is smooth.

If you've read our [Skia animations guide](/blog/react-native-skia-animations-guide), you've seen this pattern applied to progress rings, drag interactions, and gesture-driven graphics.

## A Comparison Table

Here's how the two libraries compare.

| Dimension               | Reanimated                                            | Skia                                        |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------- |
| **Primary purpose**     | Animating values on the UI thread                     | Drawing 2D graphics on a GPU canvas         |
| **What it renders**     | Style props of existing views                         | Custom graphics, shapes, paths, shaders     |
| **Animation APIs**      | `withTiming`, `withSpring`, `withDecay`, `withRepeat` | None (uses Reanimated)                      |
| **Gesture integration** | Deep integration with gesture-handler                 | Manual (reads shared values)                |
| **Best for**            | Standard view animations, layout, gestures            | Custom graphics, charts, shaders, particles |
| **Alone**               | Animates app UI                                       | Renders static graphics                     |
| **Together**            | Drives animated values                                | Renders graphics based on values            |
| **Learning curve**      | Moderate                                              | Steeper (graphics concepts)                 |
| **Performance ceiling** | High (UI thread)                                      | Very high (GPU)                             |

The "Performance ceiling" row matters. Reanimated runs on the UI thread, which is fast enough for standard view animations. Skia runs on the GPU, which is a different order of magnitude—capable of rendering thousands of elements or complex shaders at 60fps.

## A Real Story: When the Answer Was "Both"

A few months ago, I worked on a fitness app that visualized heart rate data in real time. The design called for a pulsing circular chart with a progress arc that grew with the user's heart rate, plus a subtle noise texture that shifted with each beat.

The initial attempt used Reanimated to animate a standard `View` with a border radius. The pulse was fine, but the progress arc and the noise texture weren't possible—a styled view can't render an arc, and there's no way to apply a noise shader to a native view.

We rebuilt the visualization with Skia. The circle became a `<Circle>` component. The progress arc became a `<Path>`. The noise texture became a `<Shader>`. Every element was now renderable.

But nothing moved. Skia is a rendering engine; it doesn't animate values. We added Reanimated to drive the pulse radius, the arc angle, and the noise shader's time uniform. Each frame, Reanimated updated the shared values, and Skia re-rendered the graphics based on them.

The result was a real-time animated visualization that looked nothing like what standard views could produce. It ran at 60fps on mid-range devices. The combination of Reanimated for animation and Skia for rendering was the only way to achieve the design.

The lesson: when someone asks "Skia or Reanimated?", the honest answer is often "both." They're not competitors; they're complements.

## Common Mistakes

**Trying to animate a Skia element without Reanimated.** Skia's `<Circle>` component doesn't have a `withTiming` prop. You have to drive the radius with a Reanimated shared value and read it via `useDerivedValue`. This is the number one source of confusion for developers coming to Skia from Reanimated-only experience.

**Trying to draw custom graphics with Reanimated alone.** Reanimated animates existing views; it doesn't draw new graphics. If you find yourself hacking together a custom shape out of positioned `View`s, you probably want Skia.

**Assuming Skia is only for advanced use cases.** Skia is fine for simple things too. If you need a gradient-filled circle and want it animated, Skia plus Reanimated is easier than trying to fake it with views.

**Using Reanimated for very high-density rendering.** If you're animating hundreds of elements, Reanimated can drive them all, but the view hierarchy becomes expensive. Skia draws everything to a single canvas, which scales better.

**Assuming Skia replaces Reanimated entirely.** Skia has no animation primitives. It's a renderer. For anything that changes over time, you need Reanimated (or a custom animation loop).

If you've worked with [React Native Expo liquid glass](/blog/expo-liquid-glass-animation-tutorial), you've seen the pattern of using Reanimated for animated values and Skia for rendering those values as glass-like graphics. That's the canonical example of the two libraries working together.

## Wrapping Up

Skia and Reanimated aren't alternatives. They solve different problems, and understanding the distinction is the key to using both effectively.

Reanimated animates values on the UI thread. It's for driving standard React Native views over time—opacity, transform, layout, gestures.

Skia renders 2D graphics on a GPU-accelerated canvas. It's for drawing custom shapes, gradients, shaders, charts, and anything that doesn't fit the standard view model.

When you want to animate custom graphics, you use both. Reanimated produces the animated values; Skia renders them. Both run on the UI thread; both are performant; both are essential for modern React Native.

For deeper dives into each, see our [React Native Skia guide](/blog/react-native-skia), our [Skia animations guide](/blog/react-native-skia-animations-guide), and our [React Native Expo animations guide](/blog/react-native-expo-animations-guide). And if you want to see both libraries in action together, our [liquid glass tutorial](/blog/expo-liquid-glass-animation-tutorial) walks through the full implementation.

Now go build something that moves—and looks good doing it.

---

_Need help building custom animations or graphics in your React Native app? Red Surge Technology specializes in high-performance mobile UI. [Get in touch](/contact) to discuss your project._
