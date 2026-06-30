export const MESSAGES = {
  LOGIN: {
    LOCKED_OUT: 'locked out',
    CREDENTIALS_MISMATCH: 'do not match',
    USERNAME_REQUIRED: 'Username is required',
    PASSWORD_REQUIRED: 'Password is required',
  },
  CHECKOUT: {
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Last Name',
    POSTAL_CODE: 'Postal Code',
  },
  CHECKOUT_COMPLETE: {
    THANK_YOU: 'Thank you',
    DISPATCHED: 'dispatched',
  },
} as const;
