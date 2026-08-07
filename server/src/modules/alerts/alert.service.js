import {
    findProductById
} from "../product/product.repository.js";
import {
    sendEmail,
    createEmailTemplate,
} from "../../config/emailConfig.js";
import { emitEvent } from "../../shared/socket/emitter.js";
import { SOCKET_EVENTS } from "../../shared/socket/socketEvents.js";

import * as alertRepo from "./alert.repository.js";

export const findActive =
    async () => {
        const alerts =
            await alertRepo.findActiveAlerts();

        return alerts.map(
            (alert) => {
                const doc =
                    alert.toObject();

                return {
                    ...doc,

                    severity:
                        doc.severity ||
                        (
                            doc.productId
                                ?.quantity ===
                                0
                                ? "critical"
                                : "warning"
                        ),

                    snapshotValue:
                        doc.snapshotValue ||
                        doc.productId
                            ?.quantity ||
                        0,
                };
            }
        );
    };

export const findAll =
    async (
        page = 1,
        limit = 100,
        shouldPaginate = true
    ) => {
        const [
            items,
            totalItems,
        ] = await Promise.all([
            alertRepo.findAllAlerts(
                page,
                limit
            ),

            alertRepo.countAlerts(),
        ]);

        return {
            items: items.map(
                (alert) => ({
                    ...alert,

                    severity:
                        alert.severity ||
                        (
                            alert
                                .productId
                                ?.quantity ===
                                0
                                ? "critical"
                                : "warning"
                        ),

                    snapshotValue:
                        alert.snapshotValue ||
                        alert
                            .productId
                            ?.quantity ||
                        0,

                    type:
                        alert.type ||
                        "low-stock",
                })
            ),

            meta:
                shouldPaginate
                    ? {
                        totalItems,

                        itemsPerPage:
                            items.length,

                        currentPage:
                            page,

                        totalPages:
                            Math.ceil(
                                totalItems /
                                limit
                            ),
                    }
                    : {
                        totalItems,

                        itemsPerPage:
                            items.length,

                        paginationDisabled:
                            true,
                    },
        };
    };

export const acknowledge =
    async (
        alertId,
        userId
    ) => {
        const alert = await alertRepo.acknowledgeAlert(
            alertId,
            userId
        );

        if (alert) {
            emitEvent(
                SOCKET_EVENTS.ALERT_ACKNOWLEDGED,
                alert
            );
        }

        return alert;
    };

export const checkProductStock =
    async (
        productId,
        userId,
        settings
    ) => {
        const product = await findProductById(productId);

        if (!product) return null;

        const threshold =
            product.threshold ??
            settings?.lowStockThreshold ??
            10;

        let alertType =
            null;

        let severity =
            "info";

        let message =
            "";

        if (
            product.quantity <=
            0
        ) {
            alertType =
                "out-of-stock";

            severity =
                "critical";

            message = `${product.name} is out of stock (${product.quantity}).`;
        } else if (
            product.quantity <=
            threshold
        ) {
            alertType =
                "low-stock";

            severity =
                "warning";

            message = `${product.name} is low on stock (${product.quantity}).`;
        }

        if (!alertType) {
            const result = await alertRepo.resolveAlerts(
                {
                    productId:
                        product._id,
                    resolved:
                        false,
                }
            );

            if (result.modifiedCount > 0) {
                emitEvent(
                    SOCKET_EVENTS.ALERT_RESOLVED,
                    {
                        productId: product._id,
                    }
                );
            }

            return null;
        }

        await alertRepo.resolveAlerts(
            {
                productId:
                    product._id,
                resolved:
                    false,
                type: {
                    $ne: alertType,
                },
            }
        );

        const existingAlert =
            await alertRepo.findOne({
                productId: product._id,
                type: alertType,
                resolved: false,
            });

        const alert =
            await alertRepo.upsertAlert(
                {
                    productId:
                        product._id,
                    type:
                        alertType,
                    resolved:
                        false,
                },
                {
                    severity,
                    message,
                    snapshotValue:
                        product.quantity,
                    updatedAt:
                        new Date(),
                }
            );

        if (existingAlert) {
            emitEvent(
                SOCKET_EVENTS.ALERT_UPDATED,
                alert
            );
        } else {
            emitEvent(
                SOCKET_EVENTS.ALERT_CREATED,
                alert
            );
        }

        if (
            settings?.enableEmailNotifications &&
            settings?.adminEmail
        ) {
            try {
                const color =
                    severity ===
                        "critical"
                        ? "#dc2626"
                        : "#ea580c";

                const html =
                    createEmailTemplate(
                        `${severity.toUpperCase()}: ${product.name}`,

                        `
                        <p>Stock alert triggered.</p>
                        <table style="width:100%">
                            <tr>
                                <td><strong>Product</strong></td>
                                <td>${product.name}</td>
                            </tr>
                            <tr>
                                <td><strong>Stock</strong></td>
                                <td>${product.quantity}</td>
                            </tr>
                            <tr>
                                <td><strong>Threshold</strong></td>
                                <td>${threshold}</td>
                            </tr>
                        </table>
                        `,

                        "View Product",

                        `${process.env.CLIENT_URL}/products/${product._id}`,

                        color
                    );

                await sendEmail(
                    settings.adminEmail,
                    `[${severity.toUpperCase()}] ${product.name}`,
                    html
                );
            } catch (
            error
            ) {
                console.error(
                    "Email failed:",
                    error.message
                );
            }
        }

        return alert;
    };