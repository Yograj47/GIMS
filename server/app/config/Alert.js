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

                    const alertColor = severity === 'critical' ? '#e11d48' : '#f59e0b';
                    const html = wrapEmail(
                        `Stock Alert: ${name}`,
                        `<p><b>Location:</b> ${settings.location}</p><p>${message}</p>`,
                        'View Product',
                        `${process.env.CLIENT_URL}/products/`,
                        alertColor
                    );

                    await transporter.sendMail({
                        from: `"GIMS Security" <${process.env.SENDER_EMAIL}>`,
                        to: recipientEmail,
                        subject: `⚠️ Stock Alert: ${name}`,
                        html: html
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