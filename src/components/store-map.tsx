"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { NearbyStore } from "@/lib/catalog-types";
import { formatKm } from "@/lib/distance";
import { formatBRL } from "@/lib/utils";

type Store = NearbyStore & { distanceKm: number | null };

const GREEN = "#54B62E"; // entrega (marca)
const TEAL = "#0E7E7B"; // retira na loja (marca)
const BLUE = "#2563eb"; // você

function pin(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function StoreMap({
  stores,
  user,
}: {
  stores: Store[];
  user: { lat: number; lng: number } | null;
}) {
  const center: [number, number] = user
    ? [user.lat, user.lng]
    : stores.length
      ? [stores[0].latitude, stores[0].longitude]
      : [-15.78, -47.93]; // Brasília (fallback)

  return (
    <MapContainer
      center={center}
      zoom={user ? 7 : 4}
      scrollWheelZoom={false}
      style={{ height: 420, width: "100%", borderRadius: 16, zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {user ? (
        <Marker position={[user.lat, user.lng]} icon={pin(BLUE)}>
          <Popup>Você está aqui</Popup>
        </Marker>
      ) : null}
      {stores.map((s) => (
        <Marker
          key={s.id}
          position={[s.latitude, s.longitude]}
          icon={pin(s.offersPickup ? TEAL : GREEN)}
        >
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {s.city ? `${s.city}/${s.uf}` : ""}
            {s.distanceKm != null ? ` · ${formatKm(s.distanceKm)}` : ""}
            <br />
            {s.offersPickup ? "🟢 Retira na loja" : "Entrega"}
            {s.cheapestPrice != null
              ? ` · a partir de ${formatBRL(s.cheapestPrice)}`
              : ""}
            {s.cheapestProduct ? (
              <>
                <br />
                <a href={`/produto/${s.cheapestProduct.slug}`}>Ver oferta</a>
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
