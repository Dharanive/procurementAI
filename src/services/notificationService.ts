import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  metadata: any;
  created_at: string;
  read_at: string | null;
}

/**
 * Helper to send email via EmailJS
 */
async function sendEmailNotification(
  type: string,
  title: string,
  message: string,
  priority: string,
  userId: string | null = null
) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const alertTemplateId = process.env.NEXT_PUBLIC_EMAILJS_ALERT_TEMPLATE_ID;
  const standardTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

  if (!serviceId || !publicKey) {
    console.warn('[Notification Service] EmailJS not configured');
    return;
  }

  // Determine template to use
  const templateId = (type.includes('Alert') || priority === 'Critical' || priority === 'High')
    ? alertTemplateId
    : standardTemplateId;

  if (!templateId) return;

  // Ideally, we fetch the user's email from the DB here
  // For the demo, we'll send a notification that the email step is ready
  console.log(`[Notification Service] Triggering EmailJS for ${type}: ${title}`);

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_name: userId ? 'Team Member' : 'Administrator',
          from_name: 'ProcureAI System',
          subject: `${priority.toUpperCase()} - ${title}`,
          title: title,
          message: message,
          type: type,
          priority: priority,
          timestamp: new Date().toLocaleString()
        }
      })
    });

    if (response.ok) {
      console.log('[Notification Service] Email sent successfully via EmailJS');
    } else {
      const errorText = await response.text();
      console.error('[Notification Service] EmailJS Error:', errorText);
    }
  } catch (error) {
    console.error('[Notification Service] Failed to send email:', error);
  }
}

/**
 * Notification Service
 * Manages all system notifications
 */
export async function createNotification(
  userId: string | null,
  type: 'Inventory Alert' | 'Task Assignment' | 'Approval Request' | 'Approval Status' | 'Budget Alert' | 'Vendor Update' | 'System',
  title: string,
  message: string,
  link?: string,
  priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium',
  metadata?: any
): Promise<string> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      priority,
      metadata: metadata || {}
    })
    .select()
    .single();

  if (error) {
    console.error('[Notification Service] Failed to create notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  // Trigger Email for high priority or specific alert types
  if (priority === 'Critical' || priority === 'High' || type.includes('Alert') || type.includes('Request')) {
    sendEmailNotification(type, title, message, priority, userId);
  }

  return data.id;
}

/**
 * Get notifications for a user (or all if userId is null)
 */
export async function getNotifications(
  userId: string | null = null,
  unreadOnly: boolean = false,
  limit: number = 50
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null); // System-wide notifications
  }

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || []) as Notification[];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string | null = null): Promise<void> {
  let query = supabase
    .from('notifications')
    .update({
      read: true,
      read_at: new Date().toISOString()
    })
    .eq('read', false);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to mark all as read: ${error.message}`);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string | null = null): Promise<number> {
  let query = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Send inventory alert notification
 */
export async function sendInventoryAlert(
  inventoryId: string,
  itemName: string,
  currentStock: number,
  threshold: number,
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
): Promise<void> {
  const priority = riskLevel === 'Critical' ? 'Critical' : riskLevel === 'High' ? 'High' : 'Medium';

  await createNotification(
    null, // System-wide
    'Inventory Alert',
    'Inventory Alert',
    `${itemName} is ${riskLevel === 'Critical' ? 'CRITICALLY LOW' : 'running low'}. Current stock: ${currentStock}, Threshold: ${threshold}`,
    '/car-factory',
    priority,
    { inventory_id: inventoryId, risk_level: riskLevel }
  );
}

/**
 * Send task assignment notification
 */
export async function sendTaskAssignmentNotification(
  userId: string,
  taskTitle: string,
  taskId: string
): Promise<void> {
  await createNotification(
    userId,
    'Task Assignment',
    'Task Assignment',
    `You have been assigned to: ${taskTitle}`,
    '/procurement',
    'Medium',
    { task_id: taskId }
  );
}
