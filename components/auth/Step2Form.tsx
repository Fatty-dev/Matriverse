"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import {
  updateProfileStep2,
  type ProfileState,
} from "@/app/actions/profile";

export function Step2Form() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfileStep2,
    null
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="First Name"
            placeholder="First name"
          />
          {state?.errors?.firstName && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.firstName[0]}
            </p>
          )}
        </div>
        <div>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Last Name"
            placeholder="Last name"
          />
          {state?.errors?.lastName && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.lastName[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="+234 xxx xxx xxxx"
        />
        {state?.errors?.phone && (
          <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>
        )}
      </div>

      <div>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          label="Date of Birth"
          placeholder="Select date"
        />
        {state?.errors?.dateOfBirth && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.dateOfBirth[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="flex gap-4 pt-2">
        <Link href="/signup" className="flex-1">
          <Button type="button" variant="outline" className="w-full" size="lg">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </Button>
        </Link>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={pending}
        >
          {pending ? "Saving..." : "Continue"}
          {!pending && (
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
        </Button>
      </div>
    </form>
  );
}
