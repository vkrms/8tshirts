import { Button } from '@components/common/ui/Button.js';
import { Input } from '@components/common/ui/Input.js';
import {
  useCartDispatch,
  useCartState
} from '@components/frontStore/cart/CartContext.js';
import React from 'react';

/**
 * Cart page block: lets a visitor leave their email to reserve what is in
 * their cart. Saves through core's public contact-info API
 * (POST /api/carts/:cart_id/contacts), which writes cart.customer_email.
 * No payment, no account.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReserveForm() {
  const { data: cart } = useCartState() as any;
  const { addContactInfo } = useCartDispatch() as any;
  const saved: string = cart?.customerEmail || '';
  const [editing, setEditing] = React.useState(!saved);
  const [email, setEmail] = React.useState(saved);
  const [status, setStatus] = React.useState<'idle' | 'saving' | 'error'>(
    'idle'
  );
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (saved) {
      setEmail(saved);
      setEditing(false);
    }
  }, [saved]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('saving');
    setMessage('');
    try {
      await addContactInfo({ email: value });
      setStatus('idle');
      setEditing(false);
    } catch (err) {
      setStatus('error');
      setMessage('Could not save your email. Please try again.');
    }
  };

  return (
    <div className="reserve-form mb-6 rounded-lg border border-border bg-card p-6">
      <h2 className="h4">Reserve these items</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No payment now. Leave your email and we&apos;ll contact you before
        production.
      </p>
      {!editing && saved ? (
        <div className="mt-4 text-sm">
          <p>
            Reserved for <strong>{saved}</strong>
          </p>
          <button
            type="button"
            className="mt-2 text-sm underline text-muted-foreground hover:text-foreground"
            onClick={() => setEditing(true)}
          >
            Change email
          </button>
        </div>
      ) : (
        <form className="mt-4 flex flex-col gap-3" onSubmit={submit} noValidate>
          <Input
            type="email"
            name="reserve_email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            aria-invalid={status === 'error' ? true : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          {message ? (
            <p className="text-sm text-destructive" role="alert">
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full"
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving…' : 'Reserve these items'}
          </Button>
        </form>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'shoppingCartSummary',
  sortOrder: 5
};
