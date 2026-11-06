---
title: "React Bullet Chart: Examples, Horizontal, Free Code & Definition (2026)"
date: "2026-08-10T10:00:00.000Z"
excerpt: "Everything you need to build a React bullet chart: definition, horizontal examples, bar variations, free code templates, customization, drop charts, and a Recharts vs SVG comparison."
cover_image: "/images/blog/uploads/react-bullet-chart.webp"
seo_title: "React Bullet Chart: Examples, Horizontal, Free & Definition"
seo_description: "Build a React bullet chart with free code examples. Learn the definition, horizontal layout, bars, custom UI, and Recharts vs SVG. Includes templates."
author_name: "Collin Stewart"
tags:
  - React
  - Recharts
  - Data Visualization
  - Dashboard
  - JavaScript
  - Charts
  - Tutorial
  - SVG
category: "JavaScript"
reading_time: 16
featured: false
no_index: false
---

## What is a React bullet chart?

> **Definition:** A React bullet chart is a compact data visualization that shows one primary measure (the actual value) alongside a target marker and qualitative range bands (poor, satisfactory, good). It was designed by Stephen Few to replace bulky gauges on business dashboards. In React, bullet charts are typically built with Recharts, raw SVG, or a custom charting library.

If you search for a ready-made npm package called `react-bullet-chart`, you won't find one with a million downloads. Bullet charts are not a standard export in most React chart libraries. But you do **not** need a custom library. With Recharts primitives or plain SVG, you can build a production-ready bullet chart in under 50 lines of JSX.

This guide covers the definition, horizontal and bar variations, free code templates, customization (colors, size, rich UI), drop charts, and how bullet charts compare to gauge and sparkline charts.

---

## Why bullet charts beat gauges on dashboards

Dashboards love progress widgets: bars, dials, pie slices. But gauge charts take up enormous space for a single value, and progress bars only show a percentage without context.

The bullet chart solves that with almost no wasted ink:

- The **actual value** is the long bar.
- The **target marker** is a vertical line (or small tick) showing the goal.
- The **qualitative ranges** behind the bar are shaded bands representing poor, satisfactory, and good performance.

All of that fits in the space of a sentence. You can stack ten bullet charts vertically and scan the entire performance summary in seconds.

---

## The data model: actual, target, ranges

Every bullet chart needs three inputs:

```javascript
const data = {
  actual: 4500, // The current value
  target: 5000, // The goal
  ranges: [2500, 4000, 5500, 7000], // Range breakpoints (poor to excellent)
};
```

- **actual** – the metric you are measuring (revenue, units sold, sprint progress).
- **target** – the goal or benchmark.
- **ranges** – the upper bound of each qualitative band. Three to five ranges is typical.

If you want to show historical trends instead of a single actual value, use a [React sparkline chart](/blog/react-sparkline-chart-library). If you want a circular dial, use a [React gauge chart](/blog/react-gauge-chart-library). For actual vs target in a single row, the bullet chart is the right tool.

---

## Horizontal bullet chart with Recharts (free code)

Recharts does not have a `<BulletChart>` component, but it has everything you need: a `<BarChart>` with custom bars, a `<ReferenceLine>` for the target, and `<Cell>` for coloring.

Here is a complete, free, copy-paste horizontal bullet chart component:

```jsx
// BulletChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BulletChart = ({ actual, target, ranges, height = 60 }) => {
  // Build the data array for the background bands
  const data = ranges.map((value, index) => ({
    name: `Range ${index + 1}`,
    value,
  }));

  // Add the actual value as the final segment
  data.push({ name: "Actual", value: actual });

  const rangeColors = ["#f0f0f0", "#e0e0e0", "#d0d0d0", "#c0c0c0", "#b0b0b0"];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barCategoryGap={0}
      >
        <XAxis
          type="number"
          domain={[0, Math.max(...ranges, target, actual) * 1.1]}
          hide
        />
        {data.slice(0, -1).map((entry, index) => (
          <Bar
            key={`range-${index}`}
            dataKey="value"
            fill={rangeColors[index]}
            stackId="background"
            isAnimationActive={false}
          />
        ))}
        <Bar
          dataKey="value"
          fill="#3b82f6"
          stackId="actual"
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === data.length - 1 ? "#3b82f6" : "transparent"}
            />
          ))}
        </Bar>
        <ReferenceLine x={target} stroke="#ef4444" strokeWidth={3} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BulletChart;
```

Usage:

```jsx
<BulletChart actual={4500} target={5000} ranges={[2500, 4000, 5500, 7000]} />
```

This renders a horizontal bullet chart with gray range bands, a blue actual bar, and a red target line. The `layout="vertical"` prop gives you a horizontal bar by default in Recharts.

---

## React bullet chart bar variations

The word "bar" appears in many bullet chart searches. Here are the common bar variations and when to use each.

### Standard horizontal bullet chart bar

The default. Best for dashboards and executive summaries. The bar length represents the actual value, and the target line cuts across it.

### Vertical bullet chart bar

Rotate the chart 90 degrees. Useful when you want a column of KPIs stacked side by side. In Recharts, remove `layout="vertical"` and use a standard `<BarChart>`:

```jsx
<BarChart data={data} barCategoryGap={0}>
  <YAxis type="number" domain={[0, max]} hide />
  {/* background bands and actual bar use layout="horizontal" */}
</BarChart>
```

### Grouped bullet chart bars

When you need to compare two actuals (e.g., this month vs last month) against the same target, use two `<Bar>` components with different `dataKey`s and slightly different colors. Keep the range bands behind both.

### Bar with markers

For added context, add a `<ReferenceDot>` at the actual value and a `<ReferenceLine>` for the target. This is what most people mean by "react bullet chart bar" when they search.

---

## React bullet chart drop chart

A "drop chart" is a variation of the bullet chart where the actual value is rendered as a filled area that "drops" from the top of the range to the actual value. It is useful when you want to emphasize the distance between the target and the actual.

In Recharts, you can build a drop chart by using a `<Bar>` with a custom shape that draws from the top of the chart down to the actual value, or by overlaying a semi-transparent `<Area>`.

Here is a simple SVG drop chart:

```jsx
const BulletDropChart = ({
  actual,
  target,
  max = 100,
  width = 300,
  height = 40,
}) => {
  const scale = (val) => (val / max) * width;
  return (
    <svg width={width} height={height}>
      <rect x={0} y={0} width={scale(target)} height={height} fill="#e5e7eb" />
      <rect
        x={0}
        y={0}
        width={scale(actual)}
        height={height / 2}
        fill="#3b82f6"
      />
      <line
        x1={scale(target)}
        y1={0}
        x2={scale(target)}
        y2={height}
        stroke="#ef4444"
        strokeWidth={2}
      />
    </svg>
  );
};
```

If you only need the standard bullet chart, skip the drop variation. If your design calls for a visual "drop" from the target, this pattern works.

---

## Customization: colors, size, and rich UI

### Customizing colors

The range colors should go from light (poor) to dark (good), or use a brand-aligned palette. A typical palette:

```javascript
const rangeColors = ["#fee2e2", "#fef3c7", "#d1fae5", "#a7f3d0"];
```

The actual bar should be the most prominent color (e.g., blue or brand primary). The target line is usually red or a contrasting dark color.

### Customizing size

The `height` prop controls vertical thickness. Standard dashboards use 30–50 px. For a compact KPI row, 24–30 px works. For a presentation, 60–80 px is fine.

Width is controlled by the container via `ResponsiveContainer`. If you need a fixed width, wrap the chart in a `<div style={{ width: 300 }}>`.

### Rich UI bullet charts

"Rich UI" usually means adding hover tooltips, legends, labels, and animations. Recharts makes this easy:

```jsx
<Tooltip
  formatter={(value, name) => {
    if (name === "Actual") return [`${value.toLocaleString()}`, "Actual"];
    return [null, null];
  }}
/>
```

For a custom tooltip with target and percentage:

```jsx
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.name === "Actual")?.value;
  const pct = ((actual / target) * 100).toFixed(1);
  return (
    <div className="rounded border bg-white p-2 text-sm shadow">
      <p>Actual: {actual?.toLocaleString()}</p>
      <p className="text-red-500">Target: {target.toLocaleString()}</p>
      <p>{pct}% of target</p>
    </div>
  );
};
```

### Free template

If you want a ready-made template, the component above is free to copy and adapt. For a version with TypeScript types:

```tsx
type BulletChartProps = {
  actual: number;
  target: number;
  ranges: number[];
  height?: number;
};
```

---

## Best, fastest, and most popular React bullet chart options

There is no single "react-bullet-chart" package with a million downloads. But you have three good options:

| Option                    | Best for                          | Speed               | Bundle size |
| ------------------------- | --------------------------------- | ------------------- | ----------- |
| **Recharts + custom Bar** | Dashboards already using Recharts | Fast for small data | ~43 KB      |
| **Pure SVG**              | Maximum control, smallest bundle  | Fastest             | 0 KB        |
| **Visx primitives**       | Teams with D3 experience          | Very fast           | ~12 KB      |

For most teams, the Recharts approach in this article is the best balance of speed and maintainability. If you need the absolute fastest render and have D3 experience, use visx. If you want zero dependencies, use the SVG approach below.

If you are comparing chart libraries generally, see our [React chart library comparison](/blog/react-chart-library-comparison) and [performance benchmarks](/blog/react-chart-library-performance-benchmarks).

---

## Bullet chart vs gauge vs sparkline

All three are compact KPI visualizations, but they solve different problems.

| Chart         | Best for                   | Space    | Shows trend | Shows target |
| ------------- | -------------------------- | -------- | ----------- | ------------ |
| **Bullet**    | Actual vs target vs ranges | Low      | No          | Yes          |
| **Gauge**     | Single value with a dial   | High     | No          | Sometimes    |
| **Sparkline** | Trend over time            | Very low | Yes         | No           |

Use a [React gauge chart](/blog/react-gauge-chart-library) when the dial metaphor matters to your users. Use a [React sparkline chart](/blog/react-sparkline-chart-library) when the trend is more important than the target. Use a bullet chart when you need actual, target, and qualitative ranges in a single compact row.

---

## Pure SVG bullet chart (no library)

When you want pixel-perfect control or zero dependencies, draw the bullet chart directly with SVG. This is the fastest option and works in any React app.

```jsx
const BulletChartSVG = ({
  actual,
  target,
  ranges,
  width = 400,
  height = 30,
}) => {
  const maxVal = Math.max(...ranges, target, actual) * 1.1;
  const scale = (val) => (val / maxVal) * width;

  return (
    <svg width={width} height={height}>
      {ranges.map((rangeEnd, i) => {
        const start = i === 0 ? 0 : ranges[i - 1];
        const bandWidth = scale(rangeEnd) - scale(start);
        return (
          <rect
            key={i}
            x={scale(start)}
            y={0}
            width={bandWidth}
            height={height}
            fill={["#f0f0f0", "#e0e0e0", "#d0d0d0", "#c0c0c0"][i % 4]}
          />
        );
      })}
      <rect x={0} y={0} width={scale(actual)} height={height} fill="#3b82f6" />
      <line
        x1={scale(target)}
        y1={0}
        x2={scale(target)}
        y2={height}
        stroke="#ef4444"
        strokeWidth={3}
      />
    </svg>
  );
};
```

You can animate the actual bar with CSS transitions or `react-spring`. The target line can be dashed, a triangle, or a custom marker. The range bands can use gradients for a polished look.

---

## Stacking bullet charts for a dashboard

The real power of bullet charts is stacking them. With the component built, stacking is trivial:

```jsx
<BulletChart actual={4500} target={5000} ranges={[2500, 4000, 5500, 7000]} />
<BulletChart actual={8200} target={8000} ranges={[4000, 6000, 8000, 10000]} />
<BulletChart actual={1200} target={1500} ranges={[500, 1000, 1500, 2000]} />
```

In a real dashboard, map over an array of KPIs:

```jsx
{
  kpis.map((kpi) => (
    <div key={kpi.name} className="border-b py-2">
      <div className="mb-1 flex justify-between text-sm">
        <span>{kpi.name}</span>
        <span>
          {kpi.actual} / {kpi.target}
        </span>
      </div>
      <BulletChart {...kpi} />
    </div>
  ));
}
```

Ten KPIs fit in the space of four gauges. That is the entire argument for bullet charts.

---

## FAQ

**What is a bullet chart?**
A bullet chart is a compact visualization that shows an actual value, a target marker, and qualitative range bands. It was designed by Stephen Few as a replacement for gauges on business dashboards.

**How do I make a bullet chart in React?**
Use Recharts (`<BarChart layout="vertical">` + `<ReferenceLine>`), raw SVG, or visx primitives. The Recharts approach in this article is the fastest way to get a production-ready chart.

**Is there a free React bullet chart library?**
There is no dedicated `react-bullet-chart` package. The free options are the Recharts component in this article, the pure SVG component, or building with visx primitives.

**How do I make a horizontal bullet chart?**
In Recharts, set `layout="vertical"` on `<BarChart>`. Despite the name, this renders horizontal bars. The standard horizontal bullet chart is the default.

**What is a bullet drop chart?**
A bullet drop chart is a variation where the actual value is rendered as an area that drops from the top of the chart to the actual value, emphasizing the distance from target. It is less common than the standard bullet chart.

**How do I customize bullet chart colors and size?**
Use the `fill` prop on `<Bar>` and `<Cell>` for colors, and the `height` prop on `<ResponsiveContainer>` for size. Range colors usually go from light (poor) to dark (good).

**Bullet chart vs gauge chart: which is better?**
Bullet charts are more space-efficient and show target and ranges in a single row. Gauge charts are more intuitive for non-technical audiences but take up more space. Use bullet charts for dense dashboards and gauges for single-metric screens.

---

_Need a dashboard that presents complex data clearly? Red Surge Technology builds data-dense interfaces that help users make decisions faster. [Get in touch](/contact) to discuss your project._
