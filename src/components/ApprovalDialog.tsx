'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ApprovalRequest } from '@/types';
// @ts-ignore
import { toast } from 'sonner';

interface ApprovalDialogProps {
  approval: ApprovalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
}

export function ApprovalDialog({ approval, open, onOpenChange, onApproved }: ApprovalDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [approverName, setApproverName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!approval) return null;

  const handleSubmit = async () => {
    if (!approverName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process',
          approvalId: approval.id,
          approverId: 'demo-user', // In production, this would come from auth
          approverName: approverName.trim(),
          approveOrReject: action === 'approve' ? 'approve' : 'reject',
          comments: comments.trim() || undefined,
          rejectionReason: rejectionReason.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process approval');
      }

      toast.success(
        action === 'approve' 
          ? 'Approval processed successfully!' 
          : 'Request rejected successfully'
      );
      
      // Reset form
      setAction(null);
      setComments('');
      setApproverName('');
      setRejectionReason('');
      onOpenChange(false);
      onApproved();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  const getApproverRole = () => {
    if (approval.current_approver_level === 1) return 'Manager';
    if (approval.current_approver_level === 2) return 'Director';
    return 'CFO';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Approval Request</DialogTitle>
          <DialogDescription>
            You are reviewing this request as <strong>{getApproverRole()}</strong> (Level {approval.current_approver_level})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Request Type</Label>
              <Badge variant="outline">{approval.request_type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Amount</Label>
              <span className="text-lg font-bold text-blue-600">${approval.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Approval Level</Label>
              <Badge className="bg-blue-100 text-blue-700">
                {approval.current_approver_level} of {approval.max_approval_level}
              </Badge>
            </div>
            {approval.comments && (
              <div>
                <Label className="text-sm font-semibold">Previous Comments</Label>
                <p className="text-sm text-muted-foreground mt-1">{approval.comments}</p>
              </div>
            )}
          </div>

          {/* Approver Name */}
          <div className="space-y-2">
            <Label htmlFor="approverName">Your Name *</Label>
            <Input
              id="approverName"
              placeholder="e.g., John Doe"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">
              Enter your name to record who approved/rejected this request
            </p>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Your Decision *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={action === 'approve' ? 'default' : 'outline'}
                className={`h-20 flex flex-col items-center justify-center gap-2 ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                onClick={() => setAction('approve')}
                disabled={processing}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold">Approve</span>
              </Button>
              <Button
                type="button"
                variant={action === 'reject' ? 'default' : 'outline'}
                className={`h-20 flex flex-col items-center justify-center gap-2 ${
                  action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
                onClick={() => setAction('reject')}
                disabled={processing}
              >
                <XCircle className="w-6 h-6" />
                <span className="font-bold">Reject</span>
              </Button>
            </div>
          </div>

          {/* Comments */}
          {action === 'approve' && (
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments about your approval..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={processing}
                rows={3}
              />
            </div>
          )}

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why you are rejecting this request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={processing}
                rows={3}
                className="border-red-200 focus:border-red-400"
              />
              <p className="text-xs text-red-600">
                Rejection reason is required when rejecting a request
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              {action === 'approve' && (
                <>
                  {approval.current_approver_level < approval.max_approval_level ? (
                    <>
                      <li>This will move to the next approval level</li>
                      <li>Next approver will be notified</li>
                    </>
                  ) : (
                    <>
                      <li>Request will be fully approved</li>
                      <li>Purchase order can proceed</li>
                    </>
                  )}
                </>
              )}
              {action === 'reject' && (
                <>
                  <li>Request will be immediately rejected</li>
                  <li>Purchase order will be cancelled</li>
                  <li>Requester will be notified</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setAction(null);
              setComments('');
              setApproverName('');
              setRejectionReason('');
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={processing || !action || !approverName.trim() || (action === 'reject' && !rejectionReason.trim())}
            className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {action === 'approve' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                {action === 'reject' && <XCircle className="w-4 h-4 mr-2" />}
                {action === 'approve' ? 'Approve Request' : action === 'reject' ? 'Reject Request' : 'Select Action'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
