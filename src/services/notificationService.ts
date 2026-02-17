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
