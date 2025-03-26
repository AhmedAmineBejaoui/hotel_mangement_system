// import { Switch, Route } from "wouter";
// import { queryClient } from "./lib/queryClient";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import NotFound from "@/pages/not-found";
// import Dashboard from "@/pages/Dashboard";
// import Guests from "@/pages/Guests";
// import Rooms from "@/pages/Rooms";
// import Staff from "@/pages/Staff";
// import Bookings from "@/pages/Bookings";
// import Payments from "@/pages/Payments";
// import Settings from "@/pages/Settings";
// import Help from "@/pages/Help";
// // import AuthPage from "@/pages/auth-page";
// import Sidebar from "@/components/layout/Sidebar";
// import Header from "@/components/layout/Header";
// import { ThemeProvider } from "@/hooks/use-theme";

// function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen overflow-hidden bg-background">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header />
//         <main className="flex-1 overflow-y-auto p-4">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={() => (
//         <Layout>
//           <Dashboard />
//         </Layout>
//       )} />
//       <Route path="/guests" component={() => (
//         <Layout>
//           <Guests />
//         </Layout>
//       )} />
//       <Route path="/rooms" component={() => (
//         <Layout>
//           <Rooms />
//         </Layout>
//       )} />
//       <Route path="/staff" component={() => (
//         <Layout>
//           <Staff />
//         </Layout>
//       )} />
//       <Route path="/bookings" component={() => (
//         <Layout>
//           <Bookings />
//         </Layout>
//       )} />
//       <Route path="/payments" component={() => (
//         <Layout>
//           <Payments />
//         </Layout>
//       )} />
//       <Route path="/settings" component={() => (
//         <Layout>
//           <Settings />
//         </Layout>
//       )} />
//       <Route path="/help" component={() => (
//         <Layout>
//           <Help />
//         </Layout>
//       )} />
//       {/* <Route path="/auth" component={AuthPage} />
//       <Route component={NotFound} /> */}
//     </Switch>
//   );
// }

// function App() {
//   return (
//     <ThemeProvider defaultTheme="system">
//       <QueryClientProvider client={queryClient}>
//         <Router />
//         <Toaster />
//       </QueryClientProvider>
//     </ThemeProvider>
//   );
// }

// export default App;






































import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Guests from "@/pages/Guests";
import Rooms from "@/pages/Rooms";
import Staff from "@/pages/Staff";
import Bookings from "@/pages/Bookings";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import AuthPage from "@/pages/auth-page";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => (
        <Layout>
          <Dashboard />
        </Layout>
      )} />
      <ProtectedRoute path="/guests" component={() => (
        <Layout>
          <Guests />
        </Layout>
      )} />
      <ProtectedRoute path="/rooms" component={() => (
        <Layout>
          <Rooms />
        </Layout>
      )} />
      <ProtectedRoute path="/staff" component={() => (
        <Layout>
          <Staff />
        </Layout>
      )} />
      <ProtectedRoute path="/bookings" component={() => (
        <Layout>
          <Bookings />
        </Layout>
      )} />
      <ProtectedRoute path="/payments" component={() => (
        <Layout>
          <Payments />
        </Layout>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <Layout>
          <Settings />
        </Layout>
      )} />
      <ProtectedRoute path="/help" component={() => (
        <Layout>
          <Help />
        </Layout>
      )} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
