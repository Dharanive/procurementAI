import { supabase } from '@/lib/supabase';

export interface ApprovalRequest {
  id: string;
  purchase_order_id?: string;
  task_id?: string;
  request_type: string;
  amount: number;
  status: string;
  current_approver_level: number;
  max_approval_level: number;
  comments?: string;
  created_at: string;
}

/**
 * Approval Workflow Agent
 * Manages multi-level approval workflows
 */
export async function createApprovalRequest(
  purchaseOrderId: string | null,
  taskId: string | null,
  requestType: 'Purchase Order' | 'Budget Override' | 'Vendor Selection' | 'High Value Purchase',
  amount: number,
  requesterId?: string
): Promise<string> {
  console.log(`[Approval Agent] Creating approval request for ${requestType} - $${amount}`);

  // Determine approval levels based on amount
  let maxLevel = 1;
  if (amount > 50000) maxLevel = 3; // CFO approval
  else if (amount > 10000) maxLevel = 2; // Director approval
  else maxLevel = 1; // Manager approval

  const approvalChain = Array.from({ length: maxLevel }, (_, i) => ({
    level: i + 1,
    approver: i === 0 ? 'Manager' : i === 1 ? 'Director' : 'CFO',
    status: 'Pending'
  }));

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      purchase_order_id: purchaseOrderId,
      task_id: taskId,
      request_type: requestType,
      amount,
      requester_id: requesterId,
      current_approver_level: 1,
      max_approval_level: maxLevel,
      approval_chain: approvalChain,
      status: 'Pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create approval request: ${error.message}`);
  }

  // Create notification for first approver
  await createNotification(
    null, // System notification
    'Approval Request',
    `New ${requestType} approval request for $${amount.toFixed(2)} requires your attention.`,
    `/approvals/${data.id}`,
    'High'
  );

  return data.id;
}

/**
 * Approve or reject an approval request
 */
export async function processApproval(
  approvalId: string,
  action: 'Approved' | 'Rejected',
  approverId: string,
  approverName: string,
  comments?: string,
  rejectionReason?: string
): Promise<void> {
  console.log(`[Approval Agent] Processing ${action} for approval ${approvalId}`);

  // Get current approval request
  const { data: request, error: fetchError } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', approvalId)
    .single();

  if (fetchError || !request) {
    throw new Error(`Approval request not found: ${fetchError?.message}`);
  }

  if (request.status !== 'Pending') {
    throw new Error(`Approval request already processed: ${request.status}`);
  }

  // Record approval history
  await supabase
    .from('approval_history')
    .insert({
      approval_request_id: approvalId,
      approver_id: approverId,
      approver_name: approverName,
      approval_level: request.current_approver_level,
      action,
      comments
    });

  if (action === 'Rejected') {
    // Update request status
    await supabase
      .from('approval_requests')
      .update({
        status: 'Rejected',
        rejection_reason: rejectionReason || comments,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    // Notify requester
    if (request.requester_id) {
      await createNotification(
        request.requester_id,
        'Approval Rejected',
        `Your ${request.request_type} request for $${request.amount.toFixed(2)} has been rejected. Reason: ${rejectionReason || comments}`,
        `/approvals/${approvalId}`,
        'Medium'
      );
    }
    return;
  }

  // If approved, check if more levels needed
  if (request.current_approver_level < request.max_approval_level) {
    // Escalate to next level
    const nextLevel = request.current_approver_level + 1;
    const approvalChain = request.approval_chain as any[];
    approvalChain[request.current_approver_level - 1].status = 'Approved';

    await supabase
      .from('approval_requests')
      .update({
        current_approver_level: nextLevel,
        approval_chain: approvalChain,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    // Notify next approver
    await createNotification(
      null,
      'Approval Request',
      `Approval request for $${request.amount.toFixed(2)} requires your approval (Level ${nextLevel}).`,
      `/approvals/${approvalId}`,
      'High'
    );
  } else {
    // Fully approved
    await supabase
      .from('approval_requests')
      .update({
        status: 'Approved',
        approved_at: new Date().toISOString(),
        approved_by: approverId,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    // Update purchase order status if exists
    if (request.purchase_order_id) {
      await supabase
        .from('purchase_orders')
        .update({ status: 'Approved' })
        .eq('id', request.purchase_order_id);
    }

    // Notify requester
    if (request.requester_id) {
      await createNotification(
        request.requester_id,
        'Approval Approved',
        `Your ${request.request_type} request for $${request.amount.toFixed(2)} has been fully approved.`,
        `/approvals/${approvalId}`,
        'Medium'
      );
    }
  }
}

/**
 * Get pending approvals
 */
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch approvals: ${error.message}`);
  }

  return data || [];
}

// Helper function for notifications
import { createNotification as createNotif } from '@/services/notificationService';

async function createNotification(
  userId: string | null,
  title: string,
  message: string,
  link: string,
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
): Promise<void> {
  try {
    await createNotif(userId, 'Approval Request', title, message, link, priority);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
