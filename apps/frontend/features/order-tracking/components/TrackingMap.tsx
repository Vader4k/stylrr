"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { TrackedOrder } from "../types/tracking.types";
import { geocodeCity, WAREHOUSE_LOCATION } from "../utils/geocode";
import { getRouteProgress, interpolatePosition, generateRoutePath } from "../utils/route";


// Custom icon creators
const createIcon = (emoji: string, size: number = 32) =>
    L.divIcon({
        html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: "",
    });

const warehouseIcon = createIcon("🏬", 28);
const packageIcon = createIcon("📦", 28);
const deliveredIcon = createIcon("✅", 28);
const homeIcon = createIcon("📍", 28);

// Auto-fit bounds component
const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }, [map, bounds]);
    return null;
};

const TrackingMap = ({ order }: { order: TrackedOrder }) => {
    const [destination, setDestination] = useState<[number, number] | null>(null);

    // Load Leaflet CSS at runtime to avoid Turbopack compilation overhead
    useEffect(() => {
        const id = "leaflet-css";
        if (document.getElementById(id)) return;
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const resolve = async () => {
            const coords = await geocodeCity(
                order.shippingAddress.city,
                order.shippingAddress.state,
                order.shippingAddress.country
            );
            setDestination(coords);
        };
        resolve();
    }, [order.shippingAddress]);

    const progress = useMemo(
        () => getRouteProgress(order.status, order.createdAt, order.updatedAt),
        [order.status, order.createdAt, order.updatedAt]
    );

    const routePath = useMemo(() => {
        if (!destination) return [];
        return generateRoutePath(WAREHOUSE_LOCATION, destination);
    }, [destination]);

    const packagePosition = useMemo(() => {
        if (!destination) return WAREHOUSE_LOCATION;
        return interpolatePosition(WAREHOUSE_LOCATION, destination, progress);
    }, [destination, progress]);

    const bounds = useMemo((): L.LatLngBoundsExpression => {
        if (!destination) {
            return [
                [WAREHOUSE_LOCATION[0] - 1, WAREHOUSE_LOCATION[1] - 1],
                [WAREHOUSE_LOCATION[0] + 1, WAREHOUSE_LOCATION[1] + 1],
            ];
        }
        return [WAREHOUSE_LOCATION, destination];
    }, [destination]);

    // Split route into traveled and remaining segments
    const splitIndex = Math.floor(routePath.length * progress);
    const traveledPath = routePath.slice(0, splitIndex + 1);
    const remainingPath = routePath.slice(splitIndex);

    const isCancelled = order.status === "cancelled";
    const isDelivered = order.status === "delivered";
    const isPendingOrProcessing = order.status === "pending" || order.status === "processing";

    const statusLabel = {
        pending: "Order received — preparing your package",
        processing: "Your order is being processed",
        shipped: "Your package is on its way!",
        delivered: "Package delivered successfully",
        cancelled: "This order was cancelled",
    }[order.status];

    return (
        <div className="relative">
            {/* Status label overlay */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border px-3 py-2 max-w-[260px]">
                <p className="text-xs font-medium text-gray-900">{statusLabel}</p>
                {order.status === "shipped" && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                )}
            </div>

            {/* Map */}
            <div className={`w-full h-[350px] sm:h-[400px] border ${isCancelled ? "opacity-50 grayscale" : ""}`}>
                <MapContainer
                    center={WAREHOUSE_LOCATION}
                    zoom={6}
                    scrollWheelZoom={false}
                    className="w-full h-full z-0"
                >
                    <TileLayer
                        url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png${
                            process.env.NEXT_PUBLIC_STADIA_API_KEY
                                ? `?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}`
                                : ""
                        }`}
                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <FitBounds bounds={bounds} />

                    {/* Warehouse marker */}
                    <Marker position={WAREHOUSE_LOCATION} icon={warehouseIcon}>
                        <Popup>
                            <span className="text-xs font-medium">Warehouse</span>
                        </Popup>
                    </Marker>

                    {/* Destination marker */}
                    {destination && (
                        <Marker
                            position={destination}
                            icon={isDelivered ? deliveredIcon : homeIcon}
                        >
                            <Popup>
                                <span className="text-xs font-medium">
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                </span>
                            </Popup>
                        </Marker>
                    )}

                    {/* Route lines */}
                    {destination && !isPendingOrProcessing && (
                        <>
                            {/* Traveled path (solid) */}
                            {traveledPath.length > 1 && (
                                <Polyline
                                    positions={traveledPath}
                                    color="#000"
                                    weight={3}
                                    opacity={0.8}
                                />
                            )}
                            {/* Remaining path (dashed) */}
                            {remainingPath.length > 1 && (
                                <Polyline
                                    positions={remainingPath}
                                    color="#9ca3af"
                                    weight={2}
                                    opacity={0.6}
                                    dashArray="8 8"
                                />
                            )}
                        </>
                    )}

                    {/* Preview route for pending/processing (faint dashed) */}
                    {destination && isPendingOrProcessing && routePath.length > 1 && (
                        <Polyline
                            positions={routePath}
                            color="#d4d4d4"
                            weight={2}
                            opacity={0.4}
                            dashArray="6 10"
                        />
                    )}

                    {/* Package marker (only when shipped) */}
                    {order.status === "shipped" && (
                        <Marker position={packagePosition} icon={packageIcon}>
                            <Popup>
                                <span className="text-xs font-medium">Your package</span>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default TrackingMap;
