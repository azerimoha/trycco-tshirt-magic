
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock data - replace with API calls later
const orders = [
  {
    id: "ORD001",
    date: "2024-02-21",
    status: "Processing",
    total: 2500,
  },
  {
    id: "ORD002",
    date: "2024-02-20",
    status: "Delivered",
    total: 2500,
  },
];

const submissions = [
  {
    id: "SUB001",
    name: "Summer Vibes",
    status: "Pending",
    submittedDate: "2024-02-21",
  },
  {
    id: "SUB002",
    name: "Urban Dreams",
    status: "Approved",
    submittedDate: "2024-02-20",
  },
];

const Profile = () => {
  const handleSubmitDesign = () => {
    toast.info("Design submission functionality coming soon!");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="animate-fade-in space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your orders and design submissions
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>Order {order.id}</CardTitle>
                  <CardDescription>Placed on {order.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status: {order.status}
                  </span>
                  <span className="font-semibold">
                    {order.total.toLocaleString()} DA
                  </span>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Button onClick={handleSubmitDesign} className="w-full">
              Submit New Design
            </Button>
            
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle>{submission.name}</CardTitle>
                  <CardDescription>
                    Submitted on {submission.submittedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-muted-foreground">
                    Status: {submission.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
