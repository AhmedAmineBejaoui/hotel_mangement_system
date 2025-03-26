export interface Guest {
    id: number;
    guest_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Room {
    id: number;
    room_number: string;
    room_type: 'standard' | 'deluxe' | 'suite';
    status: 'vacant' | 'occupied' | 'maintenance' | 'cleaning' | 'booked';
    capacity_adults: number;
    capacity_children: number;
    price_per_night: number;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Staff {
    id: number;
    staff_id: string;
    first_name: string;
    last_name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    hire_date: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Booking {
    id: number;
    booking_id: string;
    guest_id: number;
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    adults: number;
    children: number;
    total_price: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';
    special_requests?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface BookingWithDetails extends Booking {
    guest_first_name: string;
    guest_last_name: string;
    guest_id_string: string;
    room_number: string;
    room_type: string;
  }
  
  export interface Payment {
    id: number;
    payment_id: string;
    booking_id: number;
    amount: number;
    payment_date: string;
    payment_method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer' | 'online';
    status: 'paid' | 'pending' | 'refunded' | 'cancelled';
    transaction_id?: string;
    notes?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PaymentWithDetails extends Payment {
    booking_id_string: string;
    guest_first_name: string;
    guest_last_name: string;
  }
  
  export interface StaffActivity {
    id: number;
    staff_id: number;
    staff_first_name: string;
    staff_last_name: string;
    activity_type: string;
    description: string;
    related_entity?: string;
    related_id?: number;
    created_at: string;
  }
  
  export interface RoomStatistics {
    status: string;
    count: number;
  }
  
  export interface RoomTypeStatistics {
    room_type: string;
    count: number;
    percentage: number;
  }
  
  export interface BookingStatistics {
    status: string;
    count: number;
  }
  
  export interface DashboardStatistics {
    occupancyRate: number;
    totalRevenue: number;
    newBookings: number;
    checkedInGuests: number;
    roomStats: {
      roomsByStatus: RoomStatistics[];
      roomsByType: { room_type: string; count: number }[];
    };
    bookingStats: {
      bookingsByStatus: BookingStatistics[];
      bookingsByRoomType: RoomTypeStatistics[];
    };
    recentBookings: BookingWithDetails[];
    recentActivities: StaffActivity[];
  }
  
  export interface TablePagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: TablePagination;
  }
  