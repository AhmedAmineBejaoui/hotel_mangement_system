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
import StaffForm from "../forms/StaffForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Staff } from "@/types";

const StaffTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/staff", page, limit, departmentFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (departmentFilter) queryParams.append("department", departmentFilter);
      
      const response = await fetch(`/api/staff?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      return response.json();
    }
  });
  
  const deleteStaffMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Staff deleted",
        description: "Staff member has been successfully deleted",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete staff member: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteStaffMutation.mutate(id);
    }
  };
  
  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };
  
  const staffMembers = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  // Fetch unique departments for filter options
  const { data: allStaff } = useQuery({
    queryKey: ["/api/staff", "all"],
    queryFn: async () => {
      const response = await fetch("/api/staff?limit=100");
      if (!response.ok) throw new Error("Failed to fetch all staff");
      return response.json();
    }
  });

  const uniqueDepartments = allStaff?.data ? 
    [...new Set(allStaff.data.map((staff: Staff) => staff.department))] : 
    [];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
            value={departmentFilter || ""}
            onChange={(e) => setDepartmentFilter(e.target.value || undefined)}
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept as string} value={dept as string}>{dept as string}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Staff
        </Button>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Loading staff members...
                </TableCell>
              </TableRow>
            ) : staffMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staffMembers.map((staff: Staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.staff_id}</TableCell>
                  <TableCell>{staff.first_name} {staff.last_name}</TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>
                    <div>{staff.email}</div>
                    <div className="text-xs text-gray-500">{staff.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-none`}
                    >
                      {staff.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(staff)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(staff.id)}
                        disabled={deleteStaffMutation.isPending}
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
          {data?.pagination && `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total} staff members`}
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
      
      {/* Create Staff Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm 
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <StaffForm 
              staff={selectedStaff}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffTable;
