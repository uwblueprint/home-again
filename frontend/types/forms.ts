export type FieldType = "text" | "number" | "textarea" | "select" | "checkbox";
export type TextInputType = "text" | "email" | "tel";

export interface SelectOption {
  label: string;
  value: string;
}

export interface ResourceFormField {
  name: string;
  label: string;
  type: FieldType;
  // Applies only when type is "text".
  inputType?: TextInputType;
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export interface ResourceFormProps {
  fields: ResourceFormField[];
  initialValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  mode: "create" | "edit";
}
