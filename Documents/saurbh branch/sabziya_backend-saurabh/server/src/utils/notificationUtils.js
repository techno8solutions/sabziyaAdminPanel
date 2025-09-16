import db from "../models/index.js";
const Notification = db.Notification;
export const createNotification = async (deliveryPartnerId, type, title, message, data = null, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      delivery_partner_id: deliveryPartnerId,
      type,
      title,
      message,
      data,
      priority,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const notifyPartner = async (partnerId, notificationData) => {
  try {
    // You can integrate with push notifications here
    // For now, we'll just create a database notification
    const notification = await createNotification(
      partnerId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.data,
      notificationData.priority
    );
    
    // TODO: Integrate with Firebase Cloud Messaging or similar for push notifications
    // await sendPushNotification(partnerId, notification);
    
    return notification;
  } catch (error) {
    console.error('Error notifying partner:', error);
  }
};