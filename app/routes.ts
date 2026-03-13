import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/Welcome.tsx"),
    layout("components/AppLayout.tsx", [
        route("input-5m", "routes/Input5M.tsx"),
        route("dashboard", "routes/Dashboard.tsx"),
        route("review", "routes/Review.tsx"),
        route("refleksi", "routes/Refleksi.tsx"),
        route("master-data", "routes/MasterData.tsx"),
    ]),
    route("*", "routes/NotFound.tsx"),
] satisfies RouteConfig;
