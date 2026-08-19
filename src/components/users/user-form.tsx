"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createUser } from "@/services/user-service";
import { useAuthStore } from "@/store/auth-store";
import { userRoles, type UserRole } from "@/types/user";
import { type CreateUserInput, createUserSchema } from "@/validation/user";

function emptyUser(): CreateUserInput {
  return { name: "", email: "", password: "", role: "billing" };
}

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  billing: "Billing",
};

export function UserForm() {
  const currentUser = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: emptyUser(),
  });

  async function onSubmit(values: CreateUserInput) {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      await createUser(currentUser.businessId, values);
      toast.success(`User added — ${values.name}`);
      reset(emptyUser());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add user.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add User</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please fix the highlighted fields before saving.");
          })}
          className="flex flex-col gap-4"
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="user-name"
                  className="h-12 text-base"
                  placeholder="e.g. Priya Sharma"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="user-email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  className="h-12 text-base"
                  placeholder="name@business.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-password">Temporary Password</FieldLabel>
                <Input
                  {...field}
                  id="user-password"
                  type="text"
                  className="h-12 text-base"
                  placeholder="At least 6 characters"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {userRoles.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={field.value === role ? "default" : "outline"}
                      className="h-12"
                      onClick={() => field.onChange(role)}
                    >
                      {roleLabels[role]}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />

          <Button type="submit" disabled={submitting} className="h-12 font-semibold">
            {submitting ? "Adding…" : "Add User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
