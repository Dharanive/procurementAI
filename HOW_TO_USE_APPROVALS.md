# 🎓 How to Use the Approval System - Complete Guide

## 📖 Table of Contents
1. [What is an Approval?](#what-is-an-approval)
2. [Who Can Approve?](#who-can-approve)
3. [How to Approve/Reject](#how-to-approve-reject)
4. [Step-by-Step Tutorial](#step-by-step-tutorial)
5. [Understanding Approval Levels](#understanding-approval-levels)
6. [FAQ](#faq)

---

## 🤔 What is an Approval?

**Simple Explanation:**
When someone wants to buy something expensive, the system asks for permission first. This is called an "approval request."

**Example:**
- Employee wants to buy $25,000 worth of engines
- System creates an "approval request"
- Manager must approve it first
- If approved, Director must also approve
- Only after BOTH approve can the purchase happen

---

## 👥 Who Can Approve?

### In This Demo System:
**Anyone can approve** (we don't have user login yet)

**In a Real Company:**
- **Manager** - Can approve small purchases ($0-$10,000)
- **Director** - Can approve medium purchases ($10,001-$50,000)
- **CFO** - Can approve large purchases ($50,001+)

### How It Works:
1. System shows you what **level** you're approving at
2. You enter **your name** (to track who approved)
3. You click **Approve** or **Reject**
4. System records your decision

---

## ✅ How to Approve/Reject

### Step 1: See Pending Approvals
1. Go to **Dashboard** page
2. Scroll to **"Approval Queue"** section
3. You'll see a table with pending approvals

### Step 2: Review an Approval
1. Click the **"Review"** button on any approval
2. A dialog box opens showing:
   - Request type (e.g., "Purchase Order")
   - Amount (e.g., "$25,000")
   - Current approval level (e.g., "Level 1 of 2")
   - Your role (e.g., "Manager")

### Step 3: Make Your Decision

#### To APPROVE:
1. Click the green **"Approve"** button
2. Enter your name (e.g., "John Doe")
3. (Optional) Add comments like "Looks good!"
4. Click **"Approve Request"** button

**What Happens:**
- If more levels needed → Goes to next approver
- If last level → Fully approved, purchase can proceed

#### To REJECT:
1. Click the red **"Reject"** button
2. Enter your name (e.g., "John Doe")
3. **MUST** provide rejection reason (e.g., "Not in budget")
4. Click **"Reject Request"** button

**What Happens:**
- Request is immediately rejected
- Purchase order is cancelled
- Requester gets notified

---

## 📚 Step-by-Step Tutorial

### Example: Approving a $15,000 Purchase

**Scenario:** Someone wants to buy $15,000 worth of car parts

#### Step 1: Approval is Created
- System automatically creates approval request
- Amount: $15,000
- Needs: Manager approval (Level 1)

#### Step 2: You See It in Dashboard
- Go to Dashboard
- See "Approval Queue" section
- See 1 pending approval

#### Step 3: Click "Review"
- Click the "Review" button
- Dialog opens showing:
  ```
  Request Type: Purchase Order
  Amount: $15,000
  Approval Level: 1 of 1
  Your Role: Manager
  ```

#### Step 4: Approve It
1. Click green "Approve" button
2. Enter name: "Sarah Manager"
3. Add comment: "Approved - within budget"
4. Click "Approve Request"

#### Step 5: Done!
- Approval is processed
- Purchase order status changes to "Approved"
- You see success message
- Approval disappears from queue

---

## 🎯 Understanding Approval Levels

### Level 1: Manager
- **Amount Range:** $0 - $10,000
- **Who:** Direct supervisor
- **Action:** Approve or Reject
- **If Approved:** Purchase can proceed (if only 1 level needed)

### Level 2: Director
- **Amount Range:** $10,001 - $50,000
- **Who:** Department head
- **Action:** Approve or Reject
- **If Approved:** Goes to Level 3 OR fully approved

### Level 3: CFO
- **Amount Range:** $50,001+
- **Who:** Chief Financial Officer
- **Action:** Approve or Reject
- **If Approved:** Fully approved (last level)

### Example Flow:

**$5,000 Purchase:**
```
Level 1 (Manager) → Approve → ✅ DONE
```

**$25,000 Purchase:**
```
Level 1 (Manager) → Approve
  ↓
Level 2 (Director) → Approve → ✅ DONE
```

**$75,000 Purchase:**
```
Level 1 (Manager) → Approve
  ↓
Level 2 (Director) → Approve
  ↓
Level 3 (CFO) → Approve → ✅ DONE
```

---

## ❓ FAQ

### Q: Can I reject at any level?
**A:** Yes! If you reject at any level, the request stops immediately and the purchase is cancelled.

### Q: What if I approve but there are more levels?
**A:** The system automatically moves it to the next level. The next approver will see it in their queue.

### Q: Do I need to provide a reason when approving?
**A:** No, comments are optional when approving. But it's good practice to add them!

### Q: Do I need to provide a reason when rejecting?
**A:** Yes! Rejection reason is required. This helps the requester understand why it was rejected.

### Q: Can I see who approved before me?
**A:** Yes! The approval history shows all previous approvers and their comments.

### Q: What happens if I don't approve or reject?
**A:** The request stays in "Pending" status. In a real system, there might be automatic escalation after a certain time.

### Q: How do I know what level I'm approving at?
**A:** The dialog shows "You are reviewing this request as [Manager/Director/CFO] (Level X)"

### Q: Can I change my decision after approving/rejecting?
**A:** No, once you approve or reject, the decision is final and recorded in the system.

---

## 🎨 Visual Guide

### Dashboard Approval Queue:
```
┌─────────────────────────────────────────────┐
│ Approval Queue                   3 Pending   │
├─────────────────────────────────────────────┤
│ Request Type │ Amount │ Level │ Status │ Action │
│ Purchase     │ $25K  │ 1/2   │ Pending│ Review │
│ Purchase     │ $50K  │ 2/3   │ Pending│ Review │
│ Budget Override│ $5K │ 1/1   │ Pending│ Review │
└─────────────────────────────────────────────┘
```

### Approval Dialog:
```
┌─────────────────────────────────────────────┐
│ Review Approval Request                      │
│ You are reviewing as Manager (Level 1)      │
├─────────────────────────────────────────────┤
│ Request Type: Purchase Order                │
│ Amount: $25,000                              │
│ Approval Level: 1 of 2                       │
├─────────────────────────────────────────────┤
│ Your Name: [Enter your name]                │
│                                             │
│ Your Decision:                              │
│ [✅ Approve]  [❌ Reject]                   │
│                                             │
│ Comments: [Optional text area]              │
│                                             │
│ What happens next:                          │
│ • This will move to next approval level     │
│ • Next approver will be notified            │
├─────────────────────────────────────────────┤
│ [Cancel]  [Approve Request]                 │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

1. **Go to Dashboard** (`/dashboard`)
2. **Scroll to "Approval Queue"** section
3. **Click "Review"** on any pending approval
4. **Enter your name**
5. **Click "Approve" or "Reject"**
6. **Add comments/reason**
7. **Click final button**
8. **Done!** ✅

---

## 💡 Tips

- ✅ Always review the amount before approving
- ✅ Add comments to explain your decision
- ✅ Check if there are more approval levels needed
- ✅ Rejection reasons help the requester understand
- ✅ The system tracks everything for audit purposes

---

**That's it! You're ready to use the approval system!** 🎉
