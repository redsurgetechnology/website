---
title: "React Flow vs Sigma.js vs Reagraph: WebGL Network Graph Libraries for Large React Apps"
date: "2026-11-09T10:00:00.000Z"
excerpt: "React Flow is excellent until your network graph hits a few hundred nodes. Compare it head-to-head with Sigma.js and Reagraph, the WebGL libraries built for large-scale React graphs."
cover_image: "/images/blog/uploads/react-flow-vs-sigma-vs-reagraph.webp"
seo_title: "React Flow vs Sigma.js vs Reagraph: WebGL Graph Libraries Compared"
seo_description: "Compare React Flow, Sigma.js, and Reagraph for large React network graphs. Node capacity, rendering model, API ergonomics, layouts, bundle size, and when each one stops working."
author_name: "Collin Stewart"
tags:
  - React
  - WebGL
  - Data Visualization
  - Network Graphs
  - Performance
category: "JavaScript"
reading_time: 14
featured: false
no_index: false
---

React Flow is the library most React developers reach for when they need a graph. It's well-documented, it has a beautiful API, and the examples look great. Then the real data arrives—10,000 nodes, 80,000 edges—and the whole thing collapses. Dragging a node takes a full second to respond. Zooming out triggers a multi-second freeze. The tab starts eating memory like it's trying to solve a different problem.

At that point, developers start searching for why. The query "why React Flow breaks down for complex network visualization" has an answer, and it's not a bug. It's the architecture.

This post compares React Flow, Sigma.js, and Reagraph head-to-head for large-scale React network graphs. It covers where each library actually stops working, what the API feels like once you're past the demo stage, and how to decide which one fits your data. If you want the broader library landscape—including Cosmograph, Three.js options, and precomputed-layout renderers—our [WebGL network graph visualization guide](/blog/webgl-network-graph-visualization-react) covers that. This post is the direct three-way comparison.

## Why React Flow Breaks Down

React Flow renders every node as a React component and every edge as an SVG path. That design is what makes its API so pleasant. You can put arbitrary JSX inside a node. You can style edges with CSS. You can attach event handlers to anything.

It's also what makes it fundamentally unsuitable for large network graphs.

Every node is a real DOM element. Every edge is a `<path>` element in an SVG layer. The browser has to lay out, paint, and maintain hit-testing for all of them simultaneously. At 100 nodes, that's trivial. At 500, it's noticeable. At 2,000, it's a problem. At 10,000, it's over.

The practical ceiling is somewhere around **500 nodes at 60fps** before lag becomes visible during drag and pan. With aggressive optimization—viewport culling, `onlyRenderVisibleElements`, memoized node components—you can push it higher, but you're fighting the architecture at every step. React Flow's own performance documentation points to unnecessary re-renders and direct state access as the main culprits, and it's right, but the deeper issue is that the DOM itself wasn't designed to animate thousands of elements at once.

This isn't a knock on React Flow. It's an excellent library for what it was built for: flowcharts, node editors, workflow builders, mind maps. If your graph has a few hundred nodes and users need to interact with each node individually, React Flow is the best tool in the ecosystem. It's when the data model is a _network_—thousands of entities with dense relationships—that the DOM-based approach stops being viable.

## What WebGL Changes

WebGL renders directly on the GPU, bypassing the DOM entirely. Instead of creating thousands of DOM elements, you upload geometry to a buffer and the GPU draws it in a single pass. The performance ceiling jumps from hundreds of nodes to tens of thousands, sometimes more.

The tradeoff is that you lose the things that made React Flow pleasant. WebGL nodes are pixels on a texture, not DOM elements. You can't put arbitrary JSX inside them. You can't style them with CSS. You can't attach a React event handler to a single node. Everything—rendering, hit testing, styling, interactions—becomes custom code.

For a large network graph, that trade is almost always worth it. A network with 10,000 nodes and 200,000 edges doesn't have a viable DOM-based rendering strategy. WebGL isn't an optimization for this scale; it's the only option that works.

## Head-to-Head: React Flow vs Sigma.js vs Reagraph

Let's look at each library through the same lens.

### React Flow

**Rendering model:** DOM nodes, SVG edges.

**Node capacity:** ~500 nodes at 60fps, up to ~2,000 with aggressive optimization.

**API ergonomics:** The best in the ecosystem. Node content is arbitrary JSX, edges are styled with CSS, and the component API is clean and well-documented.

**Layouts:** React Flow doesn't ship layout algorithms. You use Dagre, ELK, or d3-force separately and pass computed positions into `nodes`. That's flexible but adds a dependency and a wiring step.

**Interactions:** Excellent per-node. Every node can have a custom component with its own handlers, tooltips, and internal state. Edge interactions are more limited.

**Bundle size:** Moderate. Core plus the default components is a few hundred KB before tree-shaking.

**License:** MIT.

**When it stops working:** Past a few hundred nodes, drag and pan start to lag. Past a couple thousand, the browser struggles to keep up. Not the right choice for networks where nodes are entities in a graph rather than boxes on a canvas.

### Sigma.js

**Rendering model:** WebGL, 2D only.

**Node capacity:** 50,000+ nodes with default settings. The library's documentation says it handles large graphs "well out of the box" and only requires tuning at hundreds of thousands of edges.

**API ergonomics:** Lower-level than React Flow. Sigma.js uses Graphology as its data structure, so you build a `Graph` instance, add nodes and edges to it, and pass it to the renderer. The `@react-sigma/core` wrapper makes this reasonable, but it's a different mental model than passing an array of nodes as props. `nx-react-sigma` is a more modern wrapper that uses context selectors to minimize re-renders during frequent position updates.

**Layouts:** Graphology ships `graphology-layout-forceatlas2` with a worker version, plus circular, random, and other layouts. The ForceAtlas2 worker is the important one—it moves the O(N²)-ish force simulation off the main thread so the UI stays responsive.

**Interactions:** Hover, click, selection, and lasso all work. Custom per-node JSX isn't possible—nodes are drawn as shapes. Per-node styling comes from the Graphology node attributes (`color`, `size`, `label`), and the rendering programs let you customize how those attributes are drawn.

**Bundle size:** The core is around 100KB gzipped, and Graphology plus layouts adds more. Still dramatically lighter than a DOM-based equivalent at the same node count.

**License:** MIT.

**When it stops working:** The rendering can push past 50k nodes. The bottleneck becomes the layout simulation, not the drawing. For very large graphs, run the layout once and cache the positions rather than running live ForceAtlas2.

### Reagraph

**Rendering model:** WebGL, 2D with optional 3D layouts.

**Node capacity:** Around 10,000 nodes for smooth interaction. Significantly better than React Flow, meaningfully below Sigma.js.

**API ergonomics:** The most React-native of the three WebGL options. You pass `nodes` and `edges` as props, and Reagraph renders the graph. The component model feels closer to React Flow than Sigma.js does, which makes it the easiest migration target for a React Flow project that has outgrown React Flow.

**Layouts:** Built-in. Force-directed 2D and 3D, circular, tree, radial, hierarchical, and concentric layouts are included. This is a real advantage over both React Flow (no built-in layouts) and Sigma.js (layouts in Graphology, but more setup).

**Interactions:** Path finding, expand/collapse nodes, lasso selection, edge bundling, and clustering are all included. For a network graph where users need to explore relationships, this is a strong feature set.

**Bundle size:** Moderate. Smaller than React Flow at scale, larger than Sigma.js's core.

**License:** MIT.

**When it stops working:** Around 10,000–20,000 nodes, depending on edge density. Past that, Sigma.js or Cosmograph is the better choice.

## Side-by-Side

Here's the comparison laid out.

| Dimension              | React Flow                             | Sigma.js                       | Reagraph                                  |
| ---------------------- | -------------------------------------- | ------------------------------ | ----------------------------------------- |
| **Rendering**          | DOM + SVG                              | WebGL 2D                       | WebGL 2D/3D                               |
| **Node capacity**      | ~500 (60fps)                           | 50,000+                        | ~10,000                                   |
| **Edge capacity**      | Limited by DOM                         | Hundreds of thousands          | ~50,000                                   |
| **Built-in layouts**   | None                                   | Graphology layouts             | Yes (force, tree, radial, hierarchical)   |
| **Per-node JSX**       | Yes                                    | No                             | No                                        |
| **Custom node shapes** | Yes (arbitrary JSX)                    | Via render programs            | Via custom renderers                      |
| **React API feel**     | Native                                 | Wrapper-based                  | Native-ish                                |
| **Bundle size**        | Moderate                               | ~100KB core                    | Moderate                                  |
| **License**            | MIT                                    | MIT                            | MIT                                       |
| **Best for**           | Node editors, flowcharts, small graphs | Large networks, 2D exploration | Mid-scale networks with rich interactions |

## Where the Ceiling Actually Is

The capacity numbers are worth putting in context because they're the crux of the decision.

React Flow's ceiling is architectural, not configurational. You can't tune your way past 2,000 nodes because the DOM itself is the limit. If your data model is a network with thousands of entities, React Flow is the wrong tool, full stop.

Sigma.js's ceiling is the highest of the three, but the constraint moves from rendering to layout. ForceAtlas2 on 50,000 nodes is expensive, even in a worker. For graphs at that scale, the standard pattern is to compute the layout once (server-side or in an offline job), store the positions as node attributes, and render with a static layout. Sigma.js handles that pattern well.

Reagraph sits between the two. It's about 20x React Flow's capacity and about 5x below Sigma.js's. For networks in the low tens of thousands, it's a good fit—especially because its built-in layouts and interaction features reduce the amount of custom code you write.

## API Ergonomics: The Cost of Going WebGL

The biggest adjustment when moving from React Flow to a WebGL library is losing per-node JSX. In React Flow, a node can be any component:

```jsx
const CustomNode = ({ data }) => (
  <div className="node">
    <img src={data.avatar} />
    <span>{data.name}</span>
    <Badge status={data.status} />
  </div>
);
```

In Sigma.js and Reagraph, nodes are drawn shapes. Customization happens through attributes and render programs, not JSX. You can make a node look like anything you want, but you build that appearance with WebGL primitives or shader code, not React components.

For a small flow editor, that's a real loss—you'd rather have the JSX. For a large network graph, it's a non-issue. You weren't going to render a custom component per node anyway; you were going to color them by category and size them by degree. WebGL libraries are optimized for exactly that.

## A Real Story: Migrating a Topology Graph from React Flow to Sigma.js

A client came to me with a network topology visualization for a cloud infrastructure monitoring tool. The graph showed services, databases, and their dependencies—about 6,000 nodes and 25,000 edges. It was built on React Flow.

The graph was, in principle, exactly what the product needed. In practice, nobody used it. Panning took a full second to update. Zooming out caused a two-second freeze. The team had tried culling, memoization, and every optimization in React Flow's performance guide. They got the drag latency down from two seconds to one, which was still unusable.

We migrated to Sigma.js. The migration took about two weeks—most of that was restructuring the data into Graphology and rewriting the interaction layer. The rendering was the easy part.

The result was a graph that rendered 6,000 nodes and 25,000 edges at 60fps. Panning was smooth. Zooming was instant. The team kept React for the surrounding UI—the sidebar, the filters, the detail panel—and used Sigma.js only for the canvas. The React state held the selected node and the filter criteria; Sigma.js held the graph. The two communicated through refs and events, not through React reconciliation.

That split was the key insight. The graph data didn't need to be in React state at all. Putting it there was the original mistake, and it compounded the DOM-rendering problem. Once the graph lived in a Graphology instance and React only owned the chrome, everything clicked.

The lesson: React Flow's problem wasn't just the rendering model. It was that the rendering model encouraged putting graph data in React state, which is the other half of the performance collapse. Sigma.js encourages the opposite, and that's half the reason it's faster.

## Common Pitfalls When Migrating Off React Flow

**Putting the graph in React state.** The single most common mistake. Pass the graph instance to the renderer via a ref or a stable context, not the node array via props. Every React reconciliation of 10,000 nodes is a frame drop.

**Rebuilding the graph on every render.** If your `useEffect` recreates the Graphology instance whenever anything changes, you've lost the performance gain. Mutate the existing instance and call `refresh()`.

**Running ForceAtlas2 on the main thread.** The worker version is not optional at scale. A 10,000-node simulation on the main thread freezes the UI for seconds.

**Using `EdgeRectangleProgram` for dense graphs.** The `EdgeLineProgram` (1px lines) is dramatically faster. If you need thicker edges, fake it with thin lines and high-contrast colors rather than paying for the geometry.

**Forgetting to dispose of the WebGL context.** If the graph component unmounts and remounts without disposing, you'll exhaust the browser's WebGL context limit. Clean up in the effect's return.

**Not culling labels at low zoom.** Label rendering is expensive. At zoomed-out levels, hide labels entirely. The nodes are still visible; the labels would be illegible anyway.

## Decision Framework

Here's how I choose.

**Use React Flow when:**

- Your graph has under ~500 nodes.
- Users need to interact with individual nodes in rich ways (custom JSX, inline editing, per-node components).
- The use case is a flowchart, node editor, workflow builder, or diagram.
- You don't need built-in layouts or you're comfortable wiring Dagre or ELK.

**Use Reagraph when:**

- Your graph is in the 1,000–10,000 node range.
- You want a React-native API and built-in layouts without wiring Graphology manually.
- You need features like path finding, lasso selection, or edge bundling out of the box.
- You want an easier migration path from React Flow than Sigma.js provides.

**Use Sigma.js when:**

- Your graph is in the 10,000–100,000+ node range.
- You're comfortable with Graphology and the lower-level API.
- The layout is static (computed once) or runs in a worker.
- You need the highest node capacity available in a React-compatible library.

**Look beyond these three when:**

- You're past 100,000 nodes and need GPU force simulation—Cosmograph is the next step.
- You need 3D visualization at scale—@cocorof/graphier or react-force-graph-3d depending on volume.

Our [WebGL network graph visualization guide](/blog/webgl-network-graph-visualization-react) covers those larger-scale options in detail.

## Wrapping Up

React Flow, Sigma.js, and Reagraph aren't really competitors. They solve different problems at different scales.

React Flow is the best DOM-based graph library for React, and it's the right choice for node editors and flowcharts. Sigma.js is the highest-capacity WebGL option, built for large 2D networks. Reagraph sits in the middle, offering a React-native API with built-in layouts for mid-scale graphs.

The question "why does React Flow break down?" has a simple answer: it renders every node as a DOM element, and the DOM wasn't designed for thousands of animated elements. If your data is a network at scale, you need a WebGL library. The choice between Sigma.js and Reagraph comes down to how many nodes you have and how much of the layout and interaction layer you want built for you.

For the broader graph library landscape, see our [React graph library guide](/blog/react-graph-library-guide). For the full visualization ecosystem, our [React data visualization libraries](/blog/react-data-visualization-libraries) guide covers the landscape. And for large-scale performance patterns across all visualization types, our [React charting library for large datasets](/blog/react-charting-library-for-large-datasets) guide covers the techniques that apply.

Now go check how many nodes you actually have before you pick a library.

---

_Need help migrating a large network graph off a DOM-based library, or architecting a visualization for tens of thousands of nodes? Red Surge Technology specializes in high-performance data visualization for complex domains. [Get in touch](/contact) to discuss your project._
