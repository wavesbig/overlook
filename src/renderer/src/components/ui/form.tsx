"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type FieldValues,
  type FieldPath,
  type Control,
  type ControllerRenderProps,
} from "react-hook-form"

import { cn } from "@renderer/lib/utils"

const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    name: fieldContext.name,
    formItemId: `${fieldContext.name}-form-item`,
    formDescriptionId: `${fieldContext.name}-form-item-description`,
    formMessageId: `${fieldContext.name}-form-item-message`,
    ...fieldState,
  }
}

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props} />
}

function FormControl(props: React.ComponentProps<typeof Slot>) {
  return <Slot {...props} />
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted-foreground text-xs", className)} {...props} />
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useFormField()
  return (
    <p className={cn("text-destructive text-xs", className)} {...props}>
      {children ?? (error?.message ? String(error.message) : null)}
    </p>
  )
}

type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  name: TName
  control?: Control<TFieldValues>
  rules?: any
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactElement
}

function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  const { control: ctxControl } = useFormContext()
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} control={control ?? ctxControl} rules={rules} render={render} />
    </FormFieldContext.Provider>
  )
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }