import { NextResponse } from 'next/server';
import { getPendingApprovals, processApproval, createApprovalRequest } from '@/agents/approvalAgent';

export async function GET() {
  try {
    const approvals = await getPendingApprovals();
    return NextResponse.json({ approvals });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, approvalId, approverId, approverName, comments, rejectionReason } = body;

    if (action === 'create') {
      const { purchaseOrderId, taskId, requestType, amount, requesterId } = body;
      const id = await createApprovalRequest(
        purchaseOrderId || null,
        taskId || null,
        requestType,
        amount,
        requesterId
      );
      return NextResponse.json({ id });
    }

    if (action === 'process') {
      const approvalAction = body.approveOrReject === 'approve' ? 'Approved' : 'Rejected';
      await processApproval(
        approvalId,
        approvalAction,
        approverId,
        approverName,
        comments,
        rejectionReason
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
