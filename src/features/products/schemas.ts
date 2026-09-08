import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});

export type CreateProductSchemaInput = z.infer<typeof createProductSchema>;
