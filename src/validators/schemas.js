const { z } = require("zod");

const nonEmptyString = z.string().trim().min(1);
const positiveNumber = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return value;
}, z.number().positive());

const optionalDate = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }
  return value;
}, z.date().optional());

const idParamSchema = z.object({
  params: z.object({
    id: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    }, z.number().int().positive()),
  }),
});

const userCreateSchema = z.object({
  body: z.object({
    name: nonEmptyString,
    email: z.string().email(),
    phone: z.string().trim().optional(),
    password: z.string().min(6).optional(),
  }),
});

const authLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: nonEmptyString,
  }),
});

const authRefreshSchema = z.object({
  body: z.object({
    refreshToken: nonEmptyString,
  }),
});

const subscriptionStatusSchema = z.enum([
  "pending",
  "active",
  "expired",
  "cancelled",
]);

const subscriptionCreateSchema = z.object({
  body: z.object({
    planName: nonEmptyString,
    price: positiveNumber,
    status: subscriptionStatusSchema.optional(),
    startedAt: optionalDate,
    expiredAt: optionalDate,
  }),
});

const subscriptionUpdateSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    planName: nonEmptyString.optional(),
    price: positiveNumber.optional(),
    status: subscriptionStatusSchema.optional(),
    startedAt: optionalDate,
    expiredAt: optionalDate,
  }),
});

const paymentCreateSchema = z.object({
  body: z.object({
    orderId: nonEmptyString,
    grossAmount: positiveNumber,
    subscriptionId: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    }, z.number().int().positive()),
    paymentType: z.string().trim().optional(),
    customerDetails: z.any().optional(),
    itemDetails: z.any().optional(),
  }),
});

const memberCreateSchema = z.object({
  body: z.object({
    subscriptionId: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    }, z.number().int().positive()),
    status: z.string().trim().optional(),
    startedAt: optionalDate,
    expiredAt: optionalDate,
  }),
});

const memberUpdateSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    userId: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    }, z.number().int().positive().optional()),
    subscriptionId: z.preprocess((value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    }, z.number().int().positive().optional()),
    status: z.string().trim().optional(),
    startedAt: optionalDate,
    expiredAt: optionalDate,
  }),
});

const paymentNotificationSchema = z.object({
  body: z.object({
    order_id: nonEmptyString,
    transaction_status: nonEmptyString,
    fraud_status: z.string().trim().optional(),
    transaction_id: z.string().trim().optional(),
  }),
});

module.exports = {
  idParamSchema,
  userCreateSchema,
  authLoginSchema,
  authRefreshSchema,
  subscriptionCreateSchema,
  subscriptionUpdateSchema,
  memberCreateSchema,
  memberUpdateSchema,
  paymentCreateSchema,
  paymentNotificationSchema,
};
