import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import DocsLayout from "@/layouts/DocsLayout";

import Landing from "@/routes/index";
import Dashboard from "@/routes/dashboard";
import PostRequirement from "@/routes/post";
import RequirementDetail from "@/routes/requirements.$id";
import Matches from "@/routes/matches";
import MatchDetail from "@/routes/matches.$id";
import Notifications from "@/routes/notifications";
import Broker from "@/routes/broker";
import AddProperty from "@/routes/broker.properties.new";
import VerifyBroker from "@/routes/verify.$brokerId";


import Login from "@/routes/auth.login";
import Register from "@/routes/auth.register";
import ForgotPassword from "@/routes/auth.forgot";
import ResetPassword from "@/routes/auth.reset";
import BrokerAuth from "@/routes/auth.broker";
import AdminAuth from "@/routes/auth.admin";

import AdminDashboard from "@/routes/admin";
import AdminAudit from "@/routes/admin.audit";
import AdminMatchQueue from "@/routes/admin.matches";
import AdminComplaints from "@/routes/admin.complaints";
import AdminBrokerReview from "@/routes/admin.brokers.$id";
import AdminBrokersPending from "@/routes/admin.brokers.pending";
import AdminPropertyReview from "@/routes/admin.properties.$id";
import AdminPropertiesPending from "@/routes/admin.properties.pending";
import AdminOperations from "@/routes/admin.ops";
import AdminSchema from "@/routes/admin.schema";

import ApiDocs from "@/routes/docs.api";
import IntegrationDocs from "@/routes/docs.integration";
import MessagesDocs from "@/routes/docs.messages";
import MobileDocs from "@/routes/docs.mobile";
import NotificationsDoc from "@/routes/docs.notifications";
import ReadinessDocs from "@/routes/docs.readiness";
import SecurityDocs from "@/routes/docs.security";
import StackDocs from "@/routes/docs.stack";
import StatesDocs from "@/routes/docs.states";
import StorageDocs from "@/routes/docs.storage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Landing />} />

        {/* Public auth pages */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/broker" element={<BrokerAuth />} />
        <Route path="/auth/admin" element={<AdminAuth />} />

        {/* Docs — public reference */}
        <Route element={<DocsLayout />}>
          <Route path="/docs/api" element={<ApiDocs />} />
          <Route path="/docs/integration" element={<IntegrationDocs />} />
          <Route path="/docs/messages" element={<MessagesDocs />} />
          <Route path="/docs/mobile" element={<MobileDocs />} />
          <Route path="/docs/notifications" element={<NotificationsDoc />} />
          <Route path="/docs/readiness" element={<ReadinessDocs />} />
          <Route path="/docs/security" element={<SecurityDocs />} />
          <Route path="/docs/stack" element={<StackDocs />} />
          <Route path="/docs/states" element={<StatesDocs />} />
          <Route path="/docs/storage" element={<StorageDocs />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requirements/new" element={<PostRequirement />} />
          <Route path="/requirements/:id" element={<RequirementDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/broker" element={<Broker />} />
          <Route path="/broker/properties/new" element={<AddProperty />} />
          <Route path="/verify/:brokerId" element={<VerifyBroker />} />

          {/* Admin routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/matches" element={<AdminMatchQueue />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/brokers/pending" element={<AdminBrokersPending />} />
            <Route path="/admin/brokers/:id" element={<AdminBrokerReview />} />
            <Route path="/admin/properties/pending" element={<AdminPropertiesPending />} />
            <Route path="/admin/properties/:id" element={<AdminPropertyReview />} />
            <Route path="/admin/ops" element={<AdminOperations />} />
            <Route path="/admin/schema" element={<AdminSchema />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
