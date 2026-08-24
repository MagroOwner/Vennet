import { AdminPanels } from "@/components/admin/AdminPanels";
import {
  getFraudSignals,
  getOpenDisputes,
  getPendingVerificationRequests,
} from "@/lib/queries";
import { requireStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { role } = await requireStaffSession("/admin");
  const [disputes, verificationRequests, fraudSignals] = await Promise.all([
    getOpenDisputes(),
    getPendingVerificationRequests(),
    getFraudSignals(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">Signed in as {role}</p>
      <AdminPanels
        isAdmin={role === "admin"}
        disputes={disputes.map((dispute) => ({
          id: dispute.id,
          reason: dispute.reason,
          status: dispute.status,
          buyerId: dispute.buyerId,
          sellerId: dispute.sellerId,
          createdAt: dispute.createdAt.toISOString(),
        }))}
        verificationRequests={verificationRequests.map((request) => ({
          id: request.id,
          userId: request.userId,
          fullName: request.fullName,
          documentType: request.documentType,
          documentPaths: request.documentPaths,
          createdAt: request.createdAt.toISOString(),
        }))}
        fraudSignals={fraudSignals.map((signal) => ({
          id: signal.id,
          userId: signal.userId,
          type: signal.type,
          severity: signal.severity,
          details: signal.details,
          createdAt: signal.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
