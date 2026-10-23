---
title: "Building a React Analytics Dashboard: Combining Data Grids, Charts, and Filters"
date: "2026-10-23T10:00:00.000Z"
excerpt: "Learn how to build a React analytics dashboard that connects data grids, charts, and filters with shared state. Includes architecture, TypeScript patterns, and performance tips."
cover_image: "/images/blog/uploads/react-analytics-dashboard-grids-charts-filters.webp"
seo_title: "Building a React Analytics Dashboard: Grids, Charts, and Filters Together"
seo_description: "A practical guide to building React analytics dashboards. Learn how to wire data grids and charts to shared filters, handle large datasets, and use TypeScript throughout."
author_name: "Collin Stewart"
tags:
  - React
  - Dashboard
  - Data Grid
  - Charts
  - TypeScript
category: "Web Development"
reading_time: 15
featured: false
no_index: false
---

An analytics dashboard is more than a page with charts on it. The value comes from the connections between components. When a user selects a date range, the chart updates. When they filter the grid, the summary metrics recalculate. When they click a row, the detail chart shows that specific entity. The whole dashboard responds to the user's exploration as a single, coordinated system.

The problem is that most React tutorials show you how to build each piece separately. Here's how to render a chart. Here's how to render a table. Here's how to add a filter. They don't show you how to wire them together. That's where the real complexity lives—the shared state, the data flow, the performance implications of updating multiple components on every filter change.

I've built enough dashboards to know that the wiring is where projects either succeed or grind to a halt. If you've been following our series—the [best React chart library for dashboards](/blog/best-react-chart-library-for-dashboards-2026), the [React data grid libraries comparison](/blog/best-react-data-grid-libraries-2026), and the [performance benchmarks](/blog/react-chart-library-performance-benchmarks)—you have the individual pieces. This post is about connecting them.

## The Architecture: One Source of Truth

The single most important decision in a React analytics dashboard is where the state lives. Get this wrong, and you'll spend weeks debugging "why didn't that update?" issues.

The pattern that works is simple: **one source of truth for the filter state, one source of truth for the data, and derived values for everything else.** The grid doesn't own its data. The chart doesn't own its data. They both derive from the same filtered dataset, which derives from the same filter state.

Here's the mental model:

- **Filter state** — the date range, selected categories, search query, and any other user-controlled filters.
- **Raw data** — the full dataset, fetched once or streamed from your backend.
- **Filtered data** — the result of applying the filter state to the raw data. This is derived, not stored.
- **Grid data** — the filtered data, possibly further sorted or paginated.
- **Chart data** — the filtered data, aggregated or transformed for visualization.

Every component reads from the derived values. No component owns data that another component needs. Updates flow in one direction: filter changes → derived data recomputes → components re-render.

This is the same pattern that makes [React's server components](/blog/react-server-components-nextjs) work well—one source of truth, computed values downstream. In a client-side dashboard, you implement it with `useState`, `useMemo`, and context or a state management library.

## Setting Up the Shared Filter State

Let's start with the filter state. For a typical analytics dashboard, the filters are a date range, a set of selected categories, and a search query.

```tsx
// types.ts
export interface Filters {
  dateRange: { start: Date; end: Date };
  categories: string[];
  search: string;
}

export interface DataRow {
  id: string;
  date: Date;
  category: string;
  revenue: number;
  orders: number;
  customer: string;
}
```

The filter state lives in a parent component, and it's passed to both the grid and the chart. To avoid prop drilling, use React context if the component tree is deep.

```tsx
// DashboardContext.tsx
import { createContext, useContext } from "react";

interface DashboardContextValue {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  rawData: DataRow[];
  filteredData: DataRow[];
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
```

The provider computes the filtered data with `useMemo`, so it only recomputes when the filter state or the raw data changes.

```tsx
// DashboardProvider.tsx
import { useMemo, useState } from "react";

export function DashboardProvider({
  children,
  rawData,
}: {
  children: React.ReactNode;
  rawData: DataRow[];
}) {
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) },
    categories: [],
    search: "",
  });

  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      if (
        row.date < filters.dateRange.start ||
        row.date > filters.dateRange.end
      )
        return false;
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(row.category)
      )
        return false;
      if (
        filters.search &&
        !row.customer.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rawData, filters]);

  return (
    <DashboardContext.Provider
      value={{ filters, setFilters, rawData, filteredData }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
```

Now any component in the tree can call `useDashboard()` and get the current filters and filtered data. The filter state changes only when the user interacts with the filter controls; everything else is derived.

## Wiring the Data Grid

For the grid, we'll use TanStack Table. It's headless, so we render our own markup and styles, but it handles the sorting, filtering, and pagination logic. If you're using AG Grid or MUI DataGrid, the integration is similar—you pass the filtered data as the `rowData` or `rows` prop.

```tsx
// DataGrid.tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useDashboard } from "./DashboardContext";

export function DataGrid() {
  const { filteredData } = useDashboard();
  const columns = [/* column definitions */];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

The grid gets its data from the shared context, so it automatically updates when the filters change. No manual syncing required.

## Wiring the Charts

For the chart, we'll use Recharts (or your chart library of choice). The chart receives the filtered data, but it usually needs to aggregate it first. For example, a revenue-over-time line chart needs the data grouped by day or month.

```tsx
// RevenueChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "./DashboardContext";
import { useMemo } from "react";

export function RevenueChart() {
  const { filteredData } = useDashboard();

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const row of filteredData) {
      const key = row.date.toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + row.revenue);
    }
    return Array.from(grouped, ([date, revenue]) => ({ date, revenue })).sort(
      (a, b) => a.date.localeCompare(b.date),
    );
  }, [filteredData]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

The chart does its own aggregation with `useMemo`, so it only recomputes when `filteredData` changes. The grid and the chart both read from `filteredData`—one source of truth, two different views.

## Cross-Filtering: When the Grid Drives the Chart

The pattern above handles the case where the filters drive both the grid and the chart. But dashboards often need the reverse: clicking a row in the grid drills down the chart, or selecting a range in the chart filters the grid.

The cleanest way to implement this is to store the cross-filter state alongside the main filters. When the user selects a grid row, update a `selectedRowId` in the context. The chart reads `selectedRowId` and filters its data accordingly.

```tsx
// Add to DashboardContext
interface DashboardContextValue {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  selectedRowId: string | null;
  setSelectedRowId: (id: string | null) => void;
  rawData: DataRow[];
  filteredData: DataRow[];
  selectedRowData: DataRow | null;
}
```

The chart can then use `selectedRowData` to show a drill-down, or highlight the corresponding data point. This is the same pattern used in our [React data grid libraries comparison](/blog/best-react-data-grid-libraries-2026) for grid-plus-chart integration.

The key insight: cross-filtering isn't a special case. It's just more filter state. Store the selection in the same context, and every component that cares about it derives from it.

## Performance: Where Dashboards Go Wrong

A dashboard with a grid, a chart, and filters can easily become a performance disaster if you're not careful. Here are the patterns that matter.

**Memoize the filtered data.** The filtering operation runs on every render unless you memoize it. `useMemo` with `[rawData, filters]` as dependencies is the minimum. For large datasets, consider computing filters on the server or in a web worker.

**Memoize the chart data.** The chart aggregation is often more expensive than the filtering. Use `useMemo` with `[filteredData]` as the dependency. If you're aggregating by date, cache the aggregation result.

**Virtualize the grid.** If the grid shows hundreds or thousands of rows, virtualization is non-negotiable. TanStack Table pairs with TanStack Virtual; AG Grid and MUI DataGrid have virtualization built in. Our [React charting library for large datasets](/blog/react-charting-library-for-large-datasets) guide covers the broader strategies for large data.

**Debounce filter changes.** A search input that re-filters on every keystroke causes hundreds of re-computations per second. Debounce the filter update by 200–300ms, as we covered in our [JavaScript debounce vs throttle](/blog/javascript-debounce-vs-throttle) guide. The user types smoothly, and the expensive re-computation happens once when they pause.

**Avoid re-rendering everything on every filter change.** If the filter context value is a new object on every render, every consumer re-renders. Wrap the context value in `useMemo`, and split the context if different components need different slices of state. The pattern from our [preventing unnecessary re-renders in React](/blog/prevent-unnecessary-rerenders-react) guide applies directly.

**Use a stable callback.** The `setFilters` function should be stable. `useState`'s setter is stable, but if you wrap it in a custom function that closes over other state, wrap it in `useCallback`.

```tsx
const setFilters = useCallback((newFilters: Filters) => {
  setState((prev) => ({ ...prev, filters: newFilters }));
}, []);
```

## TypeScript Patterns for Dashboards

A dashboard has a lot of moving parts, and TypeScript is what keeps them from drifting out of sync. Here are the patterns I use.

**Define the data model once.** `DataRow`, `Filters`, and `ChartData` should be defined in one place and imported everywhere. If the shape changes, the compiler catches every usage.

**Use discriminated unions for chart states.** Loading, error, success, empty—each state has different data. A discriminated union forces you to handle all of them.

```tsx
type ChartState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ChartData[] }
  | { status: "empty" };
```

**Type the context value explicitly.** `createContext<DashboardContextValue | null>(null)` forces consumers to handle the null case, which catches the "forgot to wrap in provider" error at compile time instead of runtime.

**Type the column definitions.** TanStack Table's `ColumnDef<DataRow>` type ensures your cell renderers and accessors match the data model.

If you've been working through our [TypeScript error handling best practices](/blog/typescript-error-handling-best-practices), you know that typed state and typed callbacks catch entire categories of bugs before they reach production. Dashboards are exactly where this discipline pays off.

## A Real Story: The Dashboard That Fell Apart

A few months ago, I inherited an analytics dashboard that had been built by a team that was new to React. Every component fetched its own data. The grid fetched from `/api/orders`, the chart fetched from `/api/revenue`, and the filters fetched from `/api/filters`. Each component had its own loading state, its own error state, and its own filter state.

The result was chaos. Changing the date range in the filter triggered three separate requests that arrived at different times, so the grid and chart were briefly out of sync. Clicking a row in the grid didn't affect the chart because the grid and chart had separate data. The whole dashboard felt sluggish because every filter change caused four re-renders, each triggering its own request.

The fix was a full rewrite of the state architecture. We moved the filter state to a context at the top of the tree. We fetched the raw data once and derived everything else from it. The grid and chart read from the same `filteredData` context value. The performance improved immediately, and the sync issues disappeared.

The lesson: in a dashboard, one source of truth is not optional. It's the difference between a dashboard that feels like a cohesive tool and one that feels like four independent widgets that happen to be on the same page.

## Wrapping Up

Building a React analytics dashboard that combines grids, charts, and filters comes down to architecture. One source of truth for filter state. One source of truth for data. Derived values for everything else. Memoize the derived values, debounce the expensive operations, and virtualize the long lists.

The individual components—grids, charts, filters—are well-served by mature libraries. The integration is where the engineering lives. Get the state architecture right, and the rest is implementation.

For the individual pieces, see our [best React chart library for dashboards](/blog/best-react-chart-library-for-dashboards-2026) guide and our [React data grid libraries comparison](/blog/best-react-data-grid-libraries-2026). For the broader visualization landscape, our [React data visualization libraries](/blog/react-data-visualization-libraries) guide covers the full ecosystem. And for performance under load, our [React charting library performance benchmarks](/blog/react-chart-library-performance-benchmarks) and [large datasets guide](/blog/react-charting-library-for-large-datasets) have you covered.

Now go build a dashboard that actually works together.

---

_Need help architecting or building a React analytics dashboard? Red Surge Technology specializes in data-rich, high-performance interfaces for analytics and enterprise applications. [Get in touch](/contact) to discuss your project._
