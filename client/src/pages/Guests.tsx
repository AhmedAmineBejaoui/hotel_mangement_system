import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GuestTable from "@/components/tables/GuestTable";

const Guests = () => {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Guest Management</h2>
        <p className="text-muted-foreground">
          Manage hotel guests, including viewing, adding, editing, and removing guest information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <GuestTable />
        </CardContent>
      </Card>
    </>
  );
};

export default Guests;
