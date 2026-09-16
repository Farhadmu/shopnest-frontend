"use client";

import React from "react";
import { GoogleDeliveryMap, GoogleDeliveryMapProps, FleetRiderMarkerData, MultiDeliveryItem } from "./GoogleDeliveryMap";

export { GoogleDeliveryMap };
export type { FleetRiderMarkerData, MultiDeliveryItem };

export interface LiveDeliveryMapProps extends GoogleDeliveryMapProps {}

/**
 * LiveDeliveryMap — Real Google Maps-based Bangladesh logistics tracking component.
 * Replaces abstract SVG maps with genuine Google Maps JavaScript API integration,
 * custom rider/store/customer markers, live route calculations, and Socket.IO GPS interpolation.
 */
export function LiveDeliveryMap(props: LiveDeliveryMapProps) {
  return <GoogleDeliveryMap {...props} />;
}
