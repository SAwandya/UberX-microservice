// src/repositories/paymentRepository.js

const pool = require("../config/database");
const { Payment, PaymentLog, Refund } = require("../models/paymentModel");

/**
 * Creates a new payment record.
 * @param {object} paymentData
 * @returns {Promise<Payment>}
 */
exports.createPayment = async (paymentData) => {
  const {
    orderId,
    stripePaymentIntentId,
    amount,
    currency,
    status,
    paymentMethod,
    transactionId,
    metadata,
  } = paymentData;

  try {
    const [result] = await pool.execute(
      `INSERT INTO payments 
             (orderId, stripePaymentIntentId, amount, currency, status, paymentMethod, transactionId, metadata) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        stripePaymentIntentId,
        amount,
        currency || "USD",
        status,
        paymentMethod || "CARD",
        transactionId || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    await exports.createPaymentLog(result.insertId, "PAYMENT_CREATED", {
      status,
    });

    return await exports.getPaymentById(result.insertId);
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error(`Database error during payment creation: ${error.message}`);
  }
};

/**
 * Retrieves a payment by its ID.
 * @param {number} id
 * @returns {Promise<Payment|null>}
 */
exports.getPaymentById = async (id) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM payments WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) return null;

    const payment = rows[0];
    if (payment.metadata && typeof payment.metadata === "string") {
      payment.metadata = JSON.parse(payment.metadata);
    }

    return new Payment(payment);
  } catch (error) {
    console.error("Error fetching payment by ID:", error);
    throw new Error(`Database error fetching payment: ${error.message}`);
  }
};

/**
 * Retrieves a payment by Order ID.
 * @param {number} orderId
 * @returns {Promise<Payment|null>}
 */
exports.getPaymentByOrderId = async (orderId) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM payments WHERE orderId = ?",
      [orderId]
    );

    if (rows.length === 0) return null;

    const payment = rows[0];
    if (payment.metadata && typeof payment.metadata === "string") {
      payment.metadata = JSON.parse(payment.metadata);
    }

    return new Payment(payment);
  } catch (error) {
    console.error("Error fetching payment by Order ID:", error);
    throw new Error(`Database error fetching payment: ${error.message}`);
  }
};

/**
 * Retrieves a payment by Stripe Payment Intent ID.
 * @param {string} paymentIntentId
 * @returns {Promise<Payment|null>}
 */
exports.getPaymentByPaymentIntentId = async (paymentIntentId) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM payments WHERE stripePaymentIntentId = ?",
      [paymentIntentId]
    );

    if (rows.length === 0) return null;

    const payment = rows[0];
    if (payment.metadata && typeof payment.metadata === "string") {
      payment.metadata = JSON.parse(payment.metadata);
    }

    return new Payment(payment);
  } catch (error) {
    console.error("Error fetching payment by PaymentIntent ID:", error);
    throw new Error(`Database error fetching payment: ${error.message}`);
  }
};

/**
 * Updates payment status by ID.
 * @param {number} id
 * @param {string} status
 * @param {string|null} transactionId
 * @returns {Promise<Payment|null>}
 */
exports.updatePaymentStatus = async (id, status, transactionId = null) => {
  try {
    const updateFields = ["status = ?", "updated_at = NOW()"];
    const params = [status];

    if (transactionId) {
      updateFields.push("transactionId = ?");
      params.push(transactionId);
    }

    params.push(id);

    await pool.execute(
      `UPDATE payments SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );

    await exports.createPaymentLog(id, "STATUS_UPDATED", {
      status,
      transactionId,
    });

    return await exports.getPaymentById(id);
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error(`Database error updating payment: ${error.message}`);
  }
};

/**
 * Updates payment status by Payment Intent ID.
 * @param {string} paymentIntentId
 * @param {string} status
 * @param {string|null} transactionId
 * @returns {Promise<Payment|null>}
 */
exports.updatePaymentStatusByPaymentIntentId = async (
  paymentIntentId,
  status,
  transactionId = null
) => {
  try {
    const updateFields = ["status = ?", "updated_at = NOW()"];
    const params = [status];

    if (transactionId) {
      updateFields.push("transactionId = ?");
      params.push(transactionId);
    }

    params.push(paymentIntentId);

    await pool.execute(
      `UPDATE payments SET ${updateFields.join(
        ", "
      )} WHERE stripePaymentIntentId = ?`,
      params
    );

    const payment = await exports.getPaymentByPaymentIntentId(paymentIntentId);

    if (payment) {
      await exports.createPaymentLog(payment.id, "STATUS_UPDATED", {
        status,
        transactionId,
      });
    }

    return payment;
  } catch (error) {
    console.error("Error updating payment status by PaymentIntent ID:", error);
    throw new Error(`Database error updating payment: ${error.message}`);
  }
};

/**
 * Creates a payment log entry.
 * @param {number} paymentId
 * @param {string} event
 * @param {object} data
 * @returns {Promise<PaymentLog|null>}
 */
exports.createPaymentLog = async (paymentId, event, data) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO payment_logs (paymentId, event, data) VALUES (?, ?, ?)`,
      [paymentId, event, JSON.stringify(data)]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM payment_logs WHERE id = ?`,
      [result.insertId]
    );

    if (rows.length === 0) return null;

    const log = rows[0];
    if (log.data && typeof log.data === "string") {
      log.data = JSON.parse(log.data);
    }

    return new PaymentLog(log);
  } catch (error) {
    console.error("Error creating payment log:", error);
    throw new Error(`Database error creating payment log: ${error.message}`);
  }
};

/**
 * Creates a refund record.
 * @param {object} refundData
 * @returns {Promise<Refund>}
 */
exports.createRefund = async (refundData) => {
  const { paymentId, stripeRefundId, amount, status, reason } = refundData;

  try {
    const [result] = await pool.execute(
      `INSERT INTO refunds (paymentId, stripeRefundId, amount, status, reason) 
             VALUES (?, ?, ?, ?, ?)`,
      [paymentId, stripeRefundId, amount, status, reason || null]
    );

    await exports.createPaymentLog(paymentId, "REFUND_CREATED", {
      refundId: result.insertId,
      amount,
      status,
    });

    return await exports.getRefundById(result.insertId);
  } catch (error) {
    console.error("Error creating refund:", error);
    throw new Error(`Database error creating refund: ${error.message}`);
  }
};

/**
 * Retrieves a refund by its ID.
 * @param {number} id
 * @returns {Promise<Refund|null>}
 */
exports.getRefundById = async (id) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM refunds WHERE id = ?`, [
      id,
    ]);

    if (rows.length === 0) return null;

    return new Refund(rows[0]);
  } catch (error) {
    console.error("Error fetching refund by ID:", error);
    throw new Error(`Database error fetching refund: ${error.message}`);
  }
};

/**
 * Updates refund status.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<Refund|null>}
 */
exports.updateRefundStatus = async (id, status) => {
  try {
    await pool.execute(
      `UPDATE refunds SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    const refund = await exports.getRefundById(id);

    if (refund) {
      await exports.createPaymentLog(refund.paymentId, "REFUND_UPDATED", {
        refundId: id,
        status,
      });
    }

    return refund;
  } catch (error) {
    console.error("Error updating refund status:", error);
    throw new Error(`Database error updating refund: ${error.message}`);
  }
};

/**
 * Retrieves all refunds for a given payment ID.
 * @param {number} paymentId
 * @returns {Promise<Array<Refund>>}
 */
exports.getRefundsByPaymentId = async (paymentId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM refunds WHERE paymentId = ?`,
      [paymentId]
    );

    return rows.map((row) => new Refund(row));
  } catch (error) {
    console.error("Error fetching refunds by Payment ID:", error);
    throw new Error(`Database error fetching refunds: ${error.message}`);
  }
};

/**
 * Retrieves all payment logs for a payment ID.
 * @param {number} paymentId
 * @returns {Promise<Array<PaymentLog>>}
 */
exports.getPaymentLogs = async (paymentId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM payment_logs WHERE paymentId = ? ORDER BY created_at DESC`,
      [paymentId]
    );

    return rows.map((row) => {
      if (row.data && typeof row.data === "string") {
        row.data = JSON.parse(row.data);
      }
      return new PaymentLog(row);
    });
  } catch (error) {
    console.error("Error fetching payment logs:", error);
    throw new Error(`Database error fetching payment logs: ${error.message}`);
  }
};
