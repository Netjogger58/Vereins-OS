import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Layout } from "@/components/Layout";
import { canAccess } from "@/lib/permissions";
import type { Role } from "@shared/schema";
import "./lib/i18n";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import Members from "@/pages/Members";
import MemberDetail from "@/pages/MemberDetail";
import MyEvents from "@/pages/MyEvents";
import Teams from "@/pages/Teams";
import Inventory from "@/pages/Inventory";
import Polls from "@/pages/Polls";
import FacilityBookings from "@/pages/FacilityBookings";
import Opponents from "@/pages/Opponents";
import Carpools from "@/pages/Carpools";
import BulkOperations from "@/pages/BulkOperations";
import MassEmail from "@/pages/MassEmail";
import BankImport from "@/pages/BankImport";
import Invoices from "@/pages/Invoices";
import Donations from "@/pages/Donations";
import CalendarFeed from "@/pages/CalendarFeed";
import TrainingExercises from "@/pages/TrainingExercises";
import LiveMatch from "@/pages/LiveMatch";
import TrialRegistrations from "@/pages/TrialRegistrations";
import Calendar from "@/pages/Calendar";
import Attendance from "@/pages/Attendance";
import Meetings from "@/pages/Meetings";
import Finance from "@/pages/Finance";
import Profile from "@/pages/Profile";
import Nominations from "@/pages/Nominations";
import Chat from "@/pages/Chat";
import ImportMembers from "@/pages/ImportMembers";
import Fees from "@/pages/Fees";
import Registration from "@/pages/Registration";
import Registrations from "@/pages/Registrations";
import Documents from "@/pages/Documents";
import EmailSettings from "@/pages/EmailSettings";
import Statistics from "@/pages/Statistics";
import TrainingSchedules from "@/pages/TrainingSchedules";
import TrainerCodes from "@/pages/TrainerCodes";
import Matches from "@/pages/Matches";
import PlayerStatistics from "@/pages/PlayerStatistics";
import Sponsors from "@/pages/Sponsors";
import Gallery from "@/pages/Gallery";
import Duties from "@/pages/Duties";
import Facilities from "@/pages/Facilities";
import Shop from "@/pages/Shop";
import Waitlist from "@/pages/Waitlist";
import Budget from "@/pages/Budget";
import Newsletter from "@/pages/Newsletter";
import GdprTools from "@/pages/GdprTools";
import Website from "@/pages/Website";
import WelcomeMappe from "@/pages/WelcomeMappe";
import CheckIn from "@/pages/CheckIn";
import Archive from "@/pages/Archive";
import Secretariat from "@/pages/Secretariat";
import { Logo } from "@/components/Logo";

// Route-Guard: leet op Dashboard ëm wann d'Roll keen Accès huet
function GuardedRoute({ path, component: Comp }: { path: string; component: React.ComponentType }) {
  const { user } = useAuth();
  const role = user?.role as Role;
  if (role && !canAccess(path, role)) {
    return <Route path={path}><Redirect to="/" /></Route>;
  }
  return <Route path={path} component={Comp} />;
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-pulse">
          <Logo size={80} />
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <GuardedRoute path="/announcements" component={Announcements} />
        <GuardedRoute path="/secretariat" component={Secretariat} />
        <Route path="/members/:id" component={MemberDetail} />
        <GuardedRoute path="/members" component={Members} />
        <GuardedRoute path="/my-events" component={MyEvents} />
        <Route path="/teams/:id" component={Teams} />
        <GuardedRoute path="/teams" component={Teams} />
        <GuardedRoute path="/calendar" component={Calendar} />
        <GuardedRoute path="/attendance" component={Attendance} />
        <GuardedRoute path="/meetings" component={Meetings} />
        <GuardedRoute path="/finance" component={Finance} />
        <Route path="/profile" component={Profile} />
        <GuardedRoute path="/inventory" component={Inventory} />
        <GuardedRoute path="/polls" component={Polls} />
        <GuardedRoute path="/facility-bookings" component={FacilityBookings} />
        <GuardedRoute path="/opponents" component={Opponents} />
        <GuardedRoute path="/carpools" component={Carpools} />
        <GuardedRoute path="/bulk-operations" component={BulkOperations} />
        <GuardedRoute path="/mass-email" component={MassEmail} />
        <GuardedRoute path="/finance/import" component={BankImport} />
        <GuardedRoute path="/invoices" component={Invoices} />
        <GuardedRoute path="/donations" component={Donations} />
        <GuardedRoute path="/calendar-feed" component={CalendarFeed} />
        <GuardedRoute path="/training-exercises" component={TrainingExercises} />
        <GuardedRoute path="/live-match" component={LiveMatch} />
        <GuardedRoute path="/trial-registrations" component={TrialRegistrations} />
        <GuardedRoute path="/nominations" component={Nominations} />
        <GuardedRoute path="/chat" component={Chat} />
        <GuardedRoute path="/import" component={ImportMembers} />
        <GuardedRoute path="/fees" component={Fees} />
        <Route path="/registration" component={Registration} />
        <GuardedRoute path="/registrations" component={Registrations} />
        <GuardedRoute path="/documents" component={Documents} />
        <GuardedRoute path="/email-settings" component={EmailSettings} />
        <GuardedRoute path="/statistics" component={Statistics} />
        <GuardedRoute path="/training-schedules" component={TrainingSchedules} />
        <GuardedRoute path="/trainer-codes" component={TrainerCodes} />
        <GuardedRoute path="/matches" component={Matches} />
        <GuardedRoute path="/player-statistics" component={PlayerStatistics} />
        <GuardedRoute path="/sponsors" component={Sponsors} />
        <GuardedRoute path="/gallery" component={Gallery} />
        <GuardedRoute path="/duties" component={Duties} />
        <GuardedRoute path="/facilities" component={Facilities} />
        <GuardedRoute path="/shop" component={Shop} />
        <GuardedRoute path="/waitlist" component={Waitlist} />
        <GuardedRoute path="/budget" component={Budget} />
        <GuardedRoute path="/newsletter" component={Newsletter} />
        <GuardedRoute path="/gdpr" component={GdprTools} />
        <GuardedRoute path="/website" component={Website} />
        <GuardedRoute path="/welcome-mappe" component={WelcomeMappe} />
        <GuardedRoute path="/checkin" component={CheckIn} />
        <GuardedRoute path="/archive" component={Archive} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
