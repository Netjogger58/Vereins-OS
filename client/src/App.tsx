import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Layout } from "@/components/Layout";
import "./lib/i18n";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import Members from "@/pages/Members";
import MemberDetail from "@/pages/MemberDetail";
import Teams from "@/pages/Teams";
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
        <Route path="/announcements" component={Announcements} />
        <Route path="/secretariat" component={Secretariat} />
        <Route path="/members/:id" component={MemberDetail} />
        <Route path="/members" component={Members} />
        <Route path="/teams/:id" component={Teams} />
        <Route path="/teams" component={Teams} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/meetings" component={Meetings} />
        <Route path="/finance" component={Finance} />
        <Route path="/profile" component={Profile} />
        <Route path="/nominations" component={Nominations} />
        <Route path="/chat" component={Chat} />
        <Route path="/import" component={ImportMembers} />
        <Route path="/fees" component={Fees} />
        <Route path="/registration" component={Registration} />
        <Route path="/registrations" component={Registrations} />
        <Route path="/documents" component={Documents} />
        <Route path="/email-settings" component={EmailSettings} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/training-schedules" component={TrainingSchedules} />
        <Route path="/matches" component={Matches} />
        <Route path="/player-statistics" component={PlayerStatistics} />
        <Route path="/sponsors" component={Sponsors} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/duties" component={Duties} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/shop" component={Shop} />
        <Route path="/waitlist" component={Waitlist} />
        <Route path="/budget" component={Budget} />
        <Route path="/newsletter" component={Newsletter} />
        <Route path="/gdpr" component={GdprTools} />
        <Route path="/website" component={Website} />
        <Route path="/welcome-mappe" component={WelcomeMappe} />
        <Route path="/checkin" component={CheckIn} />
        <Route path="/archive" component={Archive} />
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
