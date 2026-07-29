'use client';

import { useFormStatus } from 'react-dom';
import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';
import type { ButtonSize, ButtonVariant } from '@hazirgrup/ui';
import { buttonClassName } from './index';
import styles from './ui.module.css';

/**
 * Form bileşenleri.
 *
 * Erişilebilirlik kuralları (docs/DESIGN_SYSTEM.md §10):
 *  - Etiket her zaman görünür; placeholder etiket yerine kullanılmaz.
 *  - Hata mesajı `aria-describedby` ile alana bağlanır ve `aria-live` ile duyurulur.
 *  - Mobil klavye alan tipine göre ayarlanır.
 */

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.errorText} id={`${htmlFor}-error`} role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  id?: string;
}

export function TextInput({ label, name, hint, error, id, required, ...rest }: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(required ? { required: true } : {})}
    >
      <input
        id={inputId}
        name={name}
        className={cx(styles.input, error && styles.inputError)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...rest}
      />
    </Field>
  );
}

export interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  id?: string;
}

export function TextArea({ label, name, hint, error, id, required, ...rest }: TextAreaProps) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(required ? { required: true } : {})}
    >
      <textarea
        id={inputId}
        name={name}
        className={cx(styles.textarea, error && styles.inputError)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...rest}
      />
    </Field>
  );
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'id'> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  id?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  label,
  name,
  hint,
  error,
  id,
  options,
  placeholder,
  required,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(required ? { required: true } : {})}
    >
      <select
        id={inputId}
        name={name}
        className={cx(styles.select, error && styles.inputError)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Seçim kartı — radio veya checkbox olarak kullanılabilir. */
export function ChoiceCard({
  type,
  name,
  value,
  label,
  defaultChecked,
  onChange,
}: {
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  onChange?: ComponentProps<'input'>['onChange'];
}) {
  return (
    <label className={styles.choice}>
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}

export function ChoiceGroup({
  legend,
  hint,
  error,
  children,
}: {
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend className={styles.label} style={{ marginBottom: 6 }}>
        {legend}
      </legend>
      <div className={styles.choiceGroup}>{children}</div>
      {hint && !error ? <p className={styles.hint} style={{ marginTop: 6 }}>{hint}</p> : null}
      {error ? (
        <p className={styles.errorText} style={{ marginTop: 6 }} role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Gönder butonu — form gönderilirken otomatik olarak yükleniyor durumuna geçer.
 * Metin korunur, yanına spinner eklenir (docs/DESIGN_SYSTEM.md §6).
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  ...rest
}: ComponentProps<'button'> & {
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={buttonClassName({ variant, size, fullWidth })}
      disabled={pending || disabled}
      aria-busy={pending}
      {...rest}
    >
      {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/** Form hatalarını tek noktada gösterir. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className={cx(styles.alert, styles.alertError)} role="alert" aria-live="polite">
      <span aria-hidden="true">⛔</span>
      <div className={styles.alertBody}>{message}</div>
    </div>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className={cx(styles.alert, styles.alertSuccess)} role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <div className={styles.alertBody}>{message}</div>
    </div>
  );
}
