import { z } from "zod";

export const formSchema = z.object({
  "First name": z.string().min(1, "First name is required"),
  "Last Name": z.string().min(1, "Last name is required"),
  Email: z
    .email("Enter a valid email address")
    .or(z.literal(""))
    .optional(),
  "Phone Number": z.string().optional(),
  "Your Request": z.string().min(1, "Your request is required"),
  WorkerID: z.string().min(1, "WorkerID is required"),
});
