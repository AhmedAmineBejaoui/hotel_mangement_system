import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import RoomForm from "../forms/RoomForm";
import { useToast } from "@/hooks/use-toast";

import { Room } from "@/types";

const statusStyles: Record<string, { color: string; bg: string }> = {
  vacant: { color: "text-gray-800", bg: "bg-gray-100" },
  occupied: { color: "text-green-800", bg: "bg-green-100" },
  maintenance: { color: "text-red-800", bg: "bg-red-100" },
  cleaning: { color: "text-yellow-800", bg: "bg-yellow-100" },
  booked: { color: "text-blue-800", bg: "bg-blue-100" }
};

const RoomTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/rooms", page, limit, statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (statusFilter) queryParams.append("status", statusFilter);
      
      const response = await fetch(`/api/rooms?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      return response.json();
    }
  });
  
  const deleteRoomMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Room deleted",
        description: "Room has been successfully deleted",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete room: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this room?")) {
      deleteRoomMutation.mutate(id);
    }
  };
  
  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditDialogOpen(true);
  };
  
  const rooms = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="cleaning">Cleaning</option>
            <option value="booked">Booked</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Room
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading rooms...
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room: Room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell className="capitalize">{room.room_type}</TableCell>
                  <TableCell>
                    {room.capacity_adults} {room.capacity_adults === 1 ? "Adult" : "Adults"}
                    {room.capacity_children > 0 && `, ${room.capacity_children} ${room.capacity_children === 1 ? "Child" : "Children"}`}
                  </TableCell>
                  <TableCell>${room.price_per_night}/night</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${statusStyles[room.status]?.bg} ${statusStyles[room.status]?.color} border-none capitalize`}
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(room.id)}
                        disabled={deleteRoomMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data?.pagination && `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total} rooms`}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(page => Math.max(page - 1, 1))}
                className={page === 1 ? "disabled-class" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(page => Math.min(page + 1, totalPages))}
                className={page === 1 ? "disabled-class" : ""} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <RoomForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <RoomForm 
              room={selectedRoom}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomTable;
