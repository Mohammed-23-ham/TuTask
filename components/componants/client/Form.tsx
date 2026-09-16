"use client";
import { useState } from "react";
import * as z from "zod";
import { formSchema } from "@/lib/form-schema";
import { pb } from "@/lib/pocketbase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Schema = z.infer<typeof formSchema>;

export function DraftForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      "First name": "",
      "Last Name": "",
      Email: "",
      "Phone Number": "",
      "Your Request": "",
      WorkerID: "",
    },
  });
  const [values, setValues] = useState<Schema>(form.getValues());
  const [submitError, setSubmitError] = useState("");

  const updateValue = <Key extends keyof Schema>(
    key: Key,
    value: Schema[Key],
  ) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    form.setValue(key, value as never, { shouldValidate: true });
  };

  const {
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    try {
      setSubmitError("");
      form.clearErrors("WorkerID");

      const workerId = data.WorkerID.trim();

      const record = await pb.collection("Tasks").create({
        firstName: data["First name"],
        lastName: data["Last Name"],
        taskContent: data["Your Request"],
        email: data.Email || "",
        phone: data["Phone Number"] || "",
        status: "pending",
        workerId,
      });

      console.log("Request saved in PocketBase:", record.id);
      form.reset();
      setValues(form.getValues());
    } catch (error) {
      console.error("Failed to submit request", error);
      const pocketBaseError = error as {
        status?: number;
        response?: { message?: string; data?: Record<string, { message?: string }> };
      };
      const fieldErrors = Object.values(pocketBaseError.response?.data ?? {})
        .map((fieldError) => fieldError.message)
        .filter(Boolean)
        .join(" ");
      const workerFieldError = pocketBaseError.response?.data?.workerId?.message;
      if (workerFieldError) {
        form.setError("WorkerID", {
          type: "server",
          message: workerFieldError,
        });
      }
      const errorMessage =
        fieldErrors ||
        pocketBaseError.response?.message ||
        "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.";
      const responseDetails = pocketBaseError.response?.data
        ? ` ${JSON.stringify(pocketBaseError.response.data)}`
        : "";
      setSubmitError(
        `فشل الحفظ${pocketBaseError.status ? ` (${pocketBaseError.status})` : ""}: ${errorMessage}${responseDetails}`,
      );
    }
  });

  if (isSubmitSuccessful) {
    return (
      <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className=" text-primary size-8" />
          </motion.div>
          <h2 className=" text-primary text-center text-2xl text-pretty font-bold mb-2">
            Thank you
          </h2>
          <p className=" text-secondary text-center text-lg text-pretty ">
            Request submitted successfully, refresh the page if you want to submit another request.
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-1 border max-w-3xl mx-auto"
    >
      <FieldGroup className="grid md:grid-cols-6 gap-2 mb-6">
        <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
          TuTask
        </h1>
        <h2 className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm col-span-full">
          Let Us Process Your Request.
        </h2>

        <Controller
          name="First name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 md:col-span-3"
            >
              <FieldLabel htmlFor="First name">First Name *</FieldLabel>
              <Input
                {...field}
                id="First name"
                type="text"
                onChange={(e) => {
                  updateValue("First name", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your First Name"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="Last Name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 md:col-span-3"
            >
              <FieldLabel htmlFor="Last Name">Last Name *</FieldLabel>
              <Input
                {...field}
                id="Last Name"
                type="text"
                onChange={(e) => {
                  updateValue("Last Name", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your Last Name"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="Email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 md:col-span-3"
            >
              <FieldLabel htmlFor="Email">Email </FieldLabel>
              <Input
                {...field}
                id="Email"
                type="text"
                onChange={(e) => {
                  updateValue("Email", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="***@gmail.com"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="Phone Number"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 md:col-span-3"
            >
              <FieldLabel htmlFor="Phone Number">Phone Number </FieldLabel>
              <Input
                {...field}
                id="Phone Number"
                type="text"
                onChange={(e) => {
                  updateValue("Phone Number", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="+963 *** *** ***"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="Your Request"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="Your Request">Your Request *</FieldLabel>
              <Textarea
                {...field}
                value={values["Your Request"]}
                onChange={(e) => {
                  updateValue("Your Request", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                id="Your Request"
                placeholder="I need you to..."
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="WorkerID"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="WorkerID">WorkerID *</FieldLabel>
              <Input
                {...field}
                id="WorkerID"
                type="text"
                onChange={(e) => {
                  updateValue("WorkerID", e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your WorkerID"
              />
              <FieldDescription>
                Contact your provider if you don't have it.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default DraftForm;
