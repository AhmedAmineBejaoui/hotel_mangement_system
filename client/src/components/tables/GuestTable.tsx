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
import { Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import GuestForm from "../forms/GuestForm";
import { useToast } from "@/hooks/use-toast";

interface Guest {
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
}

const GuestTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/guests", page, limit, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (search) queryParams.append("search", search);
      
      const response = await fetch(`/api/guests?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch guests");
      return response.json();
    }
  });
  
  const deleteGuestMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/guests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
      toast({
        title: "Guest deleted",
        description: "Guest has been successfully deleted",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete guest: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      deleteGuestMutation.mutate(id);
    }
  };
  
  const handleEdit = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditDialogOpen(true);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };
  
  const guests = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Guest
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading guests...
                </TableCell>
              </TableRow>
            ) : guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No guests found
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest: Guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.guest_id}</TableCell>
                  <TableCell>{guest.first_name} {guest.last_name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.country || "—"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(guest)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(guest.id)}
                        disabled={deleteGuestMutation.isPending}
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
          {data?.pagination && `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total} guests`}
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {page > 1 && (
                <PaginationPrevious 
                  onClick={() => setPage(page => Math.max(page - 1, 1))}
                />
              )}
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
                onClick={() => {
                  if (page < totalPages) {
                    setPage(page => Math.min(page + 1, totalPages));
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {/* Create Guest Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <GuestForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <GuestForm 
              guest={selectedGuest}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/guests"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestTable;
