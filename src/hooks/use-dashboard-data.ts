import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Property,
  Room,
  Guest,
  GuestRequest,
  MaintenanceIssue,
  PropertyMetrics,
} from "@/types/database";

interface DashboardData {
  properties: Property[];
  rooms: Room[];
  guests: Guest[];
  requests: GuestRequest[];
  maintenance: MaintenanceIssue[];
  metrics: PropertyMetrics[];
  totals: {
    arrivals: number;
    departures: number;
    occupancyRate: number;
    maintenanceOpen: number;
  };
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [propRes, roomRes, guestRes, reqRes, maintRes] = await Promise.all([
        supabase.from("properties").select("*").order("name"),
        supabase.from("rooms").select("*"),
        supabase.from("guests").select("*").order("eta"),
        supabase.from("guest_requests").select("*"),
        supabase.from("maintenance_issues").select("*").order("created_at", { ascending: false }),
      ]);

      if (propRes.data) setProperties(propRes.data);
      if (roomRes.data) setRooms(roomRes.data);
      if (guestRes.data) setGuests(guestRes.data);
      if (reqRes.data) setRequests(reqRes.data);
      if (maintRes.data) setMaintenance(maintRes.data);
      setLoading(false);
    }

    fetchAll();
  }, []);

  const metrics: PropertyMetrics[] = properties.map((prop) => {
    const propRooms = rooms.filter((r) => r.property_id === prop.id);
    const propGuests = guests.filter((g) => g.property_id === prop.id);
    const propMaint = maintenance.filter((m) => m.property_id === prop.id);

    const occupied = propRooms.filter((r) =>
      ["Occupied", "Checked In", "Check-Out Pending"].includes(r.status)
    ).length;

    const totalRooms = propRooms.length || prop.total_rooms || 1;

    return {
      property: prop,
      arrivals: propGuests.filter((g) =>
        ["Pending", "Check-In Pending"].includes(g.check_in_status)
      ).length,
      departures: propGuests.filter((g) =>
        ["Check-Out Pending"].includes(g.check_in_status)
      ).length,
      occupancyRate: Math.round((occupied / totalRooms) * 100),
      occupiedRooms: occupied,
      maintenanceOpen: propMaint.filter((m) => m.status !== "Resolved").length,
    };
  });

  const totals = {
    arrivals: metrics.reduce((sum, m) => sum + m.arrivals, 0),
    departures: metrics.reduce((sum, m) => sum + m.departures, 0),
    occupancyRate:
      metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, m) => sum + m.occupancyRate, 0) / metrics.length
          )
        : 0,
    maintenanceOpen: metrics.reduce((sum, m) => sum + m.maintenanceOpen, 0),
  };

  return {
    properties,
    rooms,
    guests,
    requests,
    maintenance,
    metrics,
    totals,
    loading,
  };
}
