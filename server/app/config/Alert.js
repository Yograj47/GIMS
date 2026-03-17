import Alert from "../models/Alert.Model.js";
import User from "../models/User.Model.js"
import transporter from "./emailConfig.js";

export const processProductAlert = async (product, userId, settings) => {
    const { _id, name, quantity, threshold: productThreshold } = product;

    const user = await User.findById(userId);
    if (!user) return;

    const effectiveThreshold = (productThreshold !== undefined && productThreshold !== null)
        ? productThreshold
        : (settings?.lowStockThreshold || 10);

    let alertType = null;
    let severity = "info";
    let message = "";

    if (quantity <= 0) {
        alertType = "out-of-stock";
        severity = "critical";
        message = `CRITICAL: ${name.toUpperCase()} is out of stock (System shows: ${quantity}). Please verify physical stock and restock.`;
    } else if (quantity <= effectiveThreshold) {
        alertType = "low-stock";
        severity = "warning";
        message = `${name.toUpperCase()} has reached low stock (${quantity} left). Threshold set at ${effectiveThreshold}.`;
    }

    if (alertType) {
        const existingAlert = await Alert.findOne({
            productId: _id,
            type: alertType,
            resolved: false
        });

        if (existingAlert) {
            existingAlert.message = message;
            existingAlert.snapshotValue = quantity;
            existingAlert.severity = severity;
            await existingAlert.save();
        } else {
            await Alert.create({
                productId: _id,
                type: alertType,
                severity,
                message,
                snapshotValue: quantity
            });

            if (settings?.enableEmailNotifications) {
                const recipientEmail = settings.adminEmail || user.email;

                try {
                    await transporter.sendMail({
                        from: `"${settings.storeName || 'Inventory System'}" <${process.env.SENDER_EMAIL}>`,
                        to: recipientEmail,
                        subject: `⚠️ Stock Alert: ${name}`,
                        html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: ${severity === 'critical' ? '#e11d48' : '#f59e0b'};">
                                ${settings.storeName || 'Inventory'} Alert
                            </h2>
                            <p><b>Location:</b> ${settings.location || 'Main Branch'}</p>
                            <p>${message}</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <small style="color: #64748b;">Automated message from ${settings.storeName}. Settings managed by Admin.</small>
                        </div>
                    `
                    });
                } catch (emailError) {
                    console.error("Email failed to send, but alert was recorded:", emailError);
                }
            }
        }
    } else {
        await Alert.updateMany(
            {
                productId: _id,
                resolved: false,
                type: { $in: ['low-stock', 'out-of-stock'] }
            },
            { resolved: true, resolvedAt: new Date() }
        );
    }
}