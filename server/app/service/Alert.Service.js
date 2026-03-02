import Alert from "../models/Alert.Model.js";
import User from "../models/User.Model.js"
import transporter from "../config/emailConfig.js";

export const processProductAlert = async (product, userId) => {
    const { _id, name, quantity, threshold} = product;

    const user = await User.findById(userId);
    if (!user) return;

    let alertType = null;
    let severity = "info";
    let message = "";

    if (quantity <= 0) {
        alertType = "out-of-stock";
        severity = "critical";
        severity = "critical";
        message = `CRITICAL: ${name.toUpperCase()} is out of stock (System shows: ${quantity}). Please verify physical stock and restock.`;
    } else if (quantity <= threshold) {
        alertType = "low-stock";
        severity = "warning";
        message = `${name.toUpperCase()} has reached low stock (${quantity}) left.`;
    }

    if (alertType) {
        const existingAlert = await Alert.findOne({
            productId: _id,
            type: alertType,
            resolved: false
        });

        if (!existingAlert) {
            await Alert.create({
                productId: _id,
                type: alertType,
                severity,
                message,
                snapshotValue: quantity
            });

            try {
                await transporter.sendMail({
                    from: `"Inventory System" <${process.env.SENDER_EMAIL}>`,
                    to: user.email,
                    subject: `⚠️ Stock Alert: ${name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #e11d48;">Inventory Alert</h2>
                            <p>Hello <b>${user.name}</b>,</p>
                            <p>${message}</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <small style="color: #64748b;">This is an automated message from your General Store System.</small>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Email failed to send, but alert was recorded:", emailError);
            }
        }
    }
    else {
        await Alert.updateMany(
            { productId: _id, resolved: false },
            { resolved: true, resolvedAt: new Date() }
        );
    }
}
