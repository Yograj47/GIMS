import Alert from "../models/Alert.Model.js";
import User from "../models/User.Model.js";
import transporter, { wrapEmail } from "./emailConfig.js";

export const processProductAlert = async (product, userId, settings) => {
    try {
        const { _id, name, quantity, threshold: productThreshold } = product;

        const user = await User.findById(userId);
        if (!user) {
            console.warn(`⚠️ Alert processor: User ${userId} not found for product ${name}`);
            return;
        }

        if (!user.email) {
            console.warn(`⚠️ Alert processor: User ${user._id} has no email address`);
            return;
        }

        const effectiveThreshold = (productThreshold !== undefined && productThreshold !== null)
            ? productThreshold
            : (settings?.lowStockThreshold || 10);

        let alertType = null;
        let severity = "info";
        let message = "";

        if (quantity <= 0) {
            alertType = "out-of-stock";
            severity = "critical";
            message = `${name} is completely out of stock. Current quantity: ${quantity}. Please restock immediately.`;
        } else if (quantity <= effectiveThreshold) {
            alertType = "low-stock";
            severity = "warning";
            message = `${name} has reached low stock levels. Current quantity: ${quantity}. Reorder threshold is set to ${effectiveThreshold}.`;
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
                existingAlert.updatedAt = new Date();
                await existingAlert.save();
                console.log(`✓ Alert updated for product: ${name}`);
            } else {
                await Alert.create({
                    productId: _id,
                    type: alertType,
                    severity,
                    message,
                    snapshotValue: quantity
                });
                console.log(`✓ New alert created for product: ${name}`);

                if (settings?.enableEmailNotifications === true) {
                    try {
                        // Choose color based on severity
                        const color = severity === 'critical' ? '#dc2626' : '#ea580c';

                        // Create HTML email
                        const htmlContent = `
                            <p>A stock alert has been triggered in your inventory system.</p>
                            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                                <tr style="background-color: #f8fafc;">
                                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">Product</td>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">Current Stock</td>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${quantity} units</td>
                                </tr>
                                <tr style="background-color: #f8fafc;">
                                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">Threshold</td>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0;">${effectiveThreshold} units</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">Alert Type</td>
                                    <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="background: ${color}; color: white; padding: 4px 8px; border-radius: 4px;">${alertType.replace('-', ' ').toUpperCase()}</span></td>
                                </tr>
                            </table>
                            <p style="color: #64748b; font-size: 14px;">
                                <strong>Action Required:</strong> Please review your inventory and take appropriate action.
                            </p>
                        `;

                        const htmlEmail = wrapEmail(
                            `${severity.toUpperCase()}: Stock Alert for ${name}`,
                            htmlContent,
                            'View in System',
                            `${process.env.CLIENT_URL}/products/${_id}`,
                            color
                        );

                        const mailOptions = {
                            from: process.env.SENDER_EMAIL,
                            to: user.email,
                            subject: `[${severity.toUpperCase()}] Stock Alert: ${name}`,
                            html: htmlEmail,
                            replyTo: process.env.SENDER_EMAIL
                        };

                        const info = await transporter.sendMail(mailOptions);

                        console.log(`✓ Email sent successfully:`, {
                            messageId: info.messageId,
                            recipient: user.email,
                            product: name,
                            severity: severity
                        });

                    } catch (emailError) {
                        console.error(`❌ Email failed for product "${name}":`, {
                            recipient: user.email,
                            error: emailError.message,
                            code: emailError.code,
                            command: emailError.command
                        });
                        console.error("ℹ️ Alert was still saved to database even though email failed");
                    }
                } else {
                    console.log(`ℹ️ Email notifications are disabled in settings (product: ${name})`);
                }
            }
        } else {
            const result = await Alert.updateMany(
                {
                    productId: _id,
                    resolved: false,
                    type: { $in: ['low-stock', 'out-of-stock'] }
                },
                {
                    resolved: true,
                    resolvedAt: new Date()
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`✓ Resolved ${result.modifiedCount} alert(s) for product: ${name}`);
            }
        }
    } catch (error) {
        console.error("❌ processProductAlert encountered an error:", {
            message: error.message,
            productName: product?.name,
            userId: userId,
            stack: error.stack
        });
    }
};