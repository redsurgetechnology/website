---
title: "React Native Skia: Build High-Performance 2D Graphics and Animations"
date: "2026-07-16T10:00:00.000Z"
excerpt: "Learn how to use React Native Skia for custom 2D graphics, smooth animations, and GPU-accelerated rendering in your Expo and React Native applications."
cover_image: "/images/blog/uploads/react-native-skia-guide.webp"
seo_title: "React Native Skia: High-Performance 2D Graphics and Animations Guide"
seo_description: "Master React Native Skia with practical examples for custom drawing, shaders, gradients, and GPU-accelerated animations. Build performant graphics in your mobile apps."
author_name: "Collin Stewart"
tags:
  - React Native
  - Skia
  - Animation
  - Mobile Development
  - JavaScript
category: "JavaScript"
reading_time: 13
featured: false
no_index: false
---

There's a ceiling to what you can build with standard React Native views and animations. Don't get me wrong — the built-in animation APIs handle most UI transitions beautifully. Buttons, scroll effects, screen transitions — React Native's Animated API and Reanimated cover the vast majority of what apps need.

Then you hit a design that asks for something different. A waveform visualizer that pulses with audio input. A circular progress indicator with a gradient stroke that follows the user's progress. A data visualization that needs to render hundreds of points smoothly. Maybe a shader-based background that reacts to touch.

Standard views hit their limits here. You can approximate some of these things with clever styling and SVG libraries, but the performance often suffers. Rendering complex 2D graphics through the React Native bridge, or through a JavaScript-driven SVG parser, introduces overhead that shows up as jank and dropped frames.

This is exactly where React Native Skia comes in. It gives you direct access to the Skia graphics engine — the same rendering engine that powers Chrome, Flutter, and Android's UI toolkit — with a React-friendly API. Here's how to get started and what you can actually build with it.

## What Skia actually gives you that standard views don't

Standard React Native views render through the platform's native UI components. An iOS `UIView` or an Android `View` handles layout, drawing, and touch events. These are optimized for standard UI patterns — rectangles, text, images, basic transforms.

Skia operates at a lower level. Instead of composing native views, you draw directly onto a canvas using Skia's rendering primitives. Shapes, paths, gradients, images, text — everything is rasterized by Skia's GPU-accelerated renderer and composited into a single view.

The performance difference comes from what happens under the hood. A complex animation with standard views might involve layout calculations, shadow rendering, and multiple view composites on every frame. The same animation in Skia is a single draw call to the GPU.

```javascript
import { Canvas, Circle, Fill, Group } from "@shopify/react-native-skia";

function SimpleSkiaDemo() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={150} cy={150} r={80} color="blue" />
      <Circle cx={200} cy={200} r={60} color="rgba(255, 0, 0, 0.5)" />
    </Canvas>
  );
}
```

Those circles aren't native views. They're drawing commands sent directly to Skia's renderer. No layout engine. No view hierarchy. Just pixels on a canvas, rendered in a single pass.

## The Canvas is your foundation

Everything in React Native Skia starts with the `Canvas` component. It creates a surface that Skia can draw onto. You can think of it like an HTML canvas element, but GPU-accelerated and deeply integrated with the React Native rendering pipeline.

The Canvas accepts drawing components as children. Circles, rectangles, paths, text, images — each one adds to the final rendered output. The order matters. Components drawn later appear on top of components drawn earlier, just like layers in a graphics program.

```javascript
import {
  Canvas,
  Rect,
  RoundedRect,
  DiffRect,
} from "@shopify/react-native-skia";

function LayeredShapes() {
  return (
    <Canvas style={{ width: 300, height: 300 }}>
      {/* Background */}
      <Rect x={0} y={0} width={300} height={300} color="#1a1a2e" />
      {/* Rounded rectangle on top */}
      <RoundedRect
        x={50}
        y={50}
        width={200}
        height={150}
        r={16}
        color="#16213e"
      />
      {/* Cutout effect */}
      <DiffRect
        inner={
          <RoundedRect
            x={75}
            y={75}
            width={150}
            height={100}
            r={12}
            color="white"
          />
        }
        outer={
          <RoundedRect
            x={75}
            y={75}
            width={150}
            height={100}
            r={12}
            color="white"
          />
        }
      />
    </Canvas>
  );
}
```

The declarative JSX syntax feels natural if you're used to React. You're not writing imperative drawing commands. You're describing what should appear on screen, and Skia handles the rendering.

## Paths: where custom drawing gets interesting

Rectangles and circles only get you so far. For custom shapes — curves, arcs, complex polygons — you need paths. Skia's path syntax is similar to SVG paths, which means you can bring over assets and shapes from design tools like Figma and Illustrator.

```javascript
import { Canvas, Path } from "@shopify/react-native-skia";

function CustomChart() {
  const path = `M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80`;

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Path
        path={path}
        color="transparent"
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(200, 0)}
          colors={["#ff6b6b", "#feca57", "#48dbfb"]}
        />
      </Path>
    </Canvas>
  );
}
```

You can combine paths with gradients, stroke styles, and dash patterns. The path rendering is hardware-accelerated, so even complex paths with hundreds of points render smoothly.

Programmatic path generation is where things get powerful. You can generate paths based on data — stock prices, audio waveforms, sensor readings — and render them directly on the GPU without ever touching the JavaScript bridge for individual data points.

```javascript
function generateWaveformPath(data, width, height) {
  const step = width / data.length;
  let path = `M 0 ${height / 2}`;

  data.forEach((value, i) => {
    const x = i * step;
    const y = height / 2 - (value * height) / 2;
    path += ` L ${x} ${y}`;
  });

  return path;
}
```

If you've built the [React Native Expo liquid glass effect](/blog/react-native-expo-liquid-glass-effect) we covered previously, you've already seen how paths and blur effects can combine to create premium UI. Skia is the engine behind those techniques.

## Gradients and shaders: going beyond flat colors

Flat colors are fine. Gradients add dimension. Shaders add a whole new level of visual richness that's hard to describe until you see it in motion.

React Native Skia supports linear gradients, radial gradients, and custom fragment shaders. The gradients work similarly to CSS gradients — define start and end points, specify color stops, and Skia handles the interpolation.

```javascript
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

Shaders take this further. A fragment shader runs on the GPU and calculates the color of every pixel independently. This is how you build effects like noise textures, dynamic lighting, and real-time blurs that react to touch.

```javascript
import { Canvas, Fill, Shader } from "@shopify/react-native-skia";

const noiseShader = `
  uniform float time;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  vec4 main(vec2 uv) {
    float n = random(uv + time * 0.1);
    return vec4(vec3(n * 0.15), 0.05);
  }
`;

function NoiseBackground({ time }) {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <Shader source={noiseShader} uniforms={{ time }} />
      </Fill>
    </Canvas>
  );
}
```

Shader programming has a learning curve. The syntax is GLSL, which is C-like and follows its own rules. But the creative possibilities are enormous. Gradients, noise, displacement maps, color manipulations — anything you can describe mathematically, a shader can render at 60 frames per second.

## Animations that don't drop frames

Static graphics are nice. Animated graphics are where Skia earns its place. Because Skia renders on the GPU and integrates with React Native's animation systems, you can update drawing properties on every frame without crossing the bridge or triggering JavaScript garbage collection.

The key is using shared values from Reanimated or Skia's own animation hooks. These values live on the UI thread and can be read directly by the Skia renderer, which means frame-by-frame updates happen without JavaScript intervention.

```javascript
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Canvas, Circle, useValue } from "@shopify/react-native-skia";

function AnimatedPulse() {
  const radius = useSharedValue(40);

  useEffect(() => {
    radius.value = withRepeat(withTiming(80, { duration: 1000 }), -1, true);
  }, []);

  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Circle cx={100} cy={100} r={radius} color="#48dbfb" opacity={0.6} />
    </Canvas>
  );
}
```

The radius value animates between 40 and 80 over one second, looping infinitely. Because the value is on the UI thread, the animation runs at the device's refresh rate without any JavaScript overhead.

For more complex animations — multiple shapes moving independently, color transitions, gradient shifts — you can compose shared values into a single canvas. Each shape reads its own animated values, and Skia composites everything in a single draw call.

## Building a real component: an animated circular progress

Let's put the pieces together into something practical. A circular progress indicator with a gradient arc that animates smoothly as the progress value changes.

```javascript
import { Canvas, Circle, Path, Skia, vec } from "@shopify/react-native-skia";
import { useDerivedValue, withTiming } from "react-native-reanimated";

function CircularProgress({ progress, size = 200, strokeWidth = 12 }) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const animatedProgress = useDerivedValue(() => {
    return withTiming(progress, { duration: 600 });
  });

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
  });

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Background track */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        color="transparent"
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      >
        <Paint color="rgba(255, 255, 255, 0.1)" />
      </Circle>
      {/* Progress arc */}
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(size, size)}
          colors={["#ff6b6b", "#feca57", "#48dbfb"]}
        />
      </Path>
    </Canvas>
  );
}
```

The background circle provides context — the full 360 degrees the progress can fill. The foreground arc uses `useDerivedValue` to animate smoothly whenever the progress value changes. The gradient gives the arc visual depth that a flat color wouldn't have.

This component renders entirely on the GPU. The animation runs at 60 frames per second regardless of what else is happening on the JavaScript thread. It's the kind of buttery-smooth interaction that makes an app feel premium.

## Performance considerations worth knowing

Skia is fast, but it's not magic. There are still things that can hurt performance if you're not paying attention.

Recreating paths on every frame is expensive. If a shape doesn't change, create its path once and reuse it. Skia's path objects are immutable, so you can share them across frames without issue.

```javascript
// Bad: creates a new path every render
function AnimatedShape({ x, y }) {
  const path = Skia.Path.Make();
  path.moveTo(x, y);
  // ... build path

  return <Path path={path} color="blue" />;
}

// Good: memoize the path if it doesn't change
const starPath = useMemo(() => {
  const path = Skia.Path.Make();
  // ... build path once
  return path;
}, []);
```

The number of draw calls matters too. Each shape component adds to the draw call count. For data visualizations with thousands of points, consider using a single path rather than individual circles or rectangles.

Canvas size is another factor. A full-screen canvas at high pixel density — think 3x Retina displays — is drawing millions of pixels. If you only need a small animated element, constrain the canvas to the element's actual dimensions rather than filling the screen.

If you've been following our series on [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react), you'll recognize the same principle at play. Be intentional about what you update and how often. The GPU is fast, but it's not an excuse to be wasteful.

## When standard views are still the better choice

Skia is powerful, but it's not a replacement for standard React Native views. Native views give you accessibility for free. Screen readers know how to interpret a `<Button>` or a `<Text>` component. A Canvas is just pixels — there's no semantic information for accessibility tools to work with.

Standard views also handle touch interactions, layout, and text rendering with platform-native behavior. Users expect text to look and behave a certain way. Skia's text rendering is accurate, but it doesn't support things like Dynamic Type scaling or platform-specific font features out of the box.

The right approach is often hybrid. Use standard views for the app's structure — navigation, forms, lists, buttons. Use Skia for the visual elements where standard views hit their limits — charts, custom animations, visual effects, creative backgrounds.

## Wrapping up

React Native Skia opens up creative possibilities that standard views can't touch. Custom 2D graphics, GPU-accelerated animations, shader effects, data visualizations — all running at native performance with a declarative React API.

The learning curve is real. Paths, shaders, and canvas rendering require thinking differently than composing views. But once you've built a few components with Skia, you start seeing applications for it everywhere. That boring loading spinner? Replace it with an animated gradient ring. That static chart? Make it interactive with gesture-driven animations. That flat background? Add a subtle noise texture that gives the whole app more depth.

If you've experimented with [React Native animations using Expo](/blog/react-native-expo-animations-guide), adding Skia to your toolkit is the natural next step. The two work beautifully together, with Reanimated handling the animation values and Skia handling the rendering.

The ceiling for what mobile apps can look like keeps rising. Skia is one of the tools pushing that ceiling higher.

---

_Building a React Native app that needs custom graphics or high-performance animations? Red Surge Technology helps teams push mobile UI beyond standard components. [Get in touch](/contact) to discuss your project._
