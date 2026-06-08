export interface Property {
  id: string;
  name: string;
  slug: string;
  total_rooms: number;
  location: string;
  status: string;
  created_at: string;
}

export type RoomStatus =
  | "Vacant"
  | "Occupied"
  | "Check-In Pending"
  | "Checked In"
  | "Check-Out Pending"
  | "Checked Out"
  | "Needs Attention";

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  room_name: string;
  room_type: string;
  status: RoomStatus;
  passcode: string;
  floor: number;
  created_at: string;
}

export type CheckInStatus =
  | "Pending"
  | "Checked In"
  | "Check-In Pending"
  | "Check-Out Pending"
  | "Checked Out";

export interface Guest {
  id: string;
  property_id: string;
  room_id: string | null;
  guest_name: string;
  eta: string | null;
  etd: string | null;
  check_in_status: CheckInStatus;
  booking_source: string;
  is_vip: boolean;
  guest_count: number;
  created_at: string;
}

export interface GuestRequest {
  id: string;
  guest_id: string;
  room_id: string;
  request_type: string;
  notes: string;
  is_completed: boolean;
  created_at: string;
}

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type MaintenanceStatus = "Open" | "In Progress" | "Resolved";

export interface MaintenanceIssue {
  id: string;
  property_id: string;
  room_id: string | null;
  title: string;
  description: string;
  severity: Severity;
  status: MaintenanceStatus;
  created_at: string;
}

export interface PropertyMetrics {
  property: Property;
  arrivals: number;
  departures: number;
  occupancyRate: number;
  occupiedRooms: number;
  maintenanceOpen: number;
}
