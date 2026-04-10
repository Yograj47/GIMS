import Alert from "../models/Alert.Model.js";
import User from "../models/User.Model.js";
import Product from "../models/Product.Model.js";
import transporter, { wrapEmail } from "./emailConfig.js";

export const processProductAlert = async (productId, userId, settings) => {
    try {
        const product = await Product.findById(productId).lean();
        if (!product) return;

        const { _id, name, quantity } = product;

        const user = await User.findById(userId).lean();
        if (!user) {
            console.warn(`User ${userId} not found`);
            return;
        }

        const effectiveThreshold =
            product.threshold ?? settings?.lowStockThreshold ?? 10;

        let alertType = null;
        let severity = "info";
        let message = "";

        if (quantity <= 0) {
            alertType = "out-of-stock";
            severity = "critical";
            message = `${name} is out of stock (${quantity}). Immediate restock required.`;
        } else if (quantity <= effectiveThreshold) {
            alertType = "low-stock";
            severity = "warning";
            message = `${name} is low on stock (${quantity}). Threshold: ${effectiveThreshold}.`;
        }

        if (alertType) {
            // Resolve other alert types
            await Alert.updateMany(
                { productId: _id, resolved: false, type: { $ne: alertType } },
                { resolved: true, resolvedAt: new Date(), acknowledged: false } 
            );

            // Atomic upsert
            await Alert.findOneAndUpdate(
                {
                    productId: _id,
                    type: alertType,
                    resolved: false
                },
                {
                    $set: {
                        severity,
                        message,
                        snapshotValue: quantity,
                        updatedAt: new Date()
                    }
                },
                {
                    new: true,
                    upsert: true
                }
            );

            // Email
            if (settings?.enableEmailNotifications && user.email) {
                try {
                    const color =
                        severity === "critical" ? "#dc2626" : "#ea580c";

                    const htmlContent = `
                        <p>Stock alert triggered.</p>
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td><strong>Product</strong></td><td>${name}</td></tr>
                            <tr><td><strong>Stock</strong></td><td>${quantity}</td></tr>
                            <tr><td><strong>Threshold</strong></td><td>${effectiveThreshold}</td></tr>
                        </table>
                    `;

                    const htmlEmail = wrapEmail(
                        `${severity.toUpperCase()}: ${name}`,
                        htmlContent,
                        "View Product",
                        `${process.env.CLIENT_URL}/products/${_id}`,
                        color
                    );

                    await transporter.sendMail({
                        from: process.env.SENDER_EMAIL,
                        to: user.email,
                        subject: `[${severity.toUpperCase()}] ${name}`,
                        html: htmlEmail
                    });

                } catch (err) {
                    console.error("Email failed:", err.message);
                }
            }

        } else {
            await Alert.updateMany(
                { productId: _id, resolved: false },
                { resolved: true, resolvedAt: new Date(), acknowledged: false }
            );
        }

    } catch (error) {
        console.error("Alert processor error:", {
            message: error.message,
            productId,
            userId
        });
    }
};