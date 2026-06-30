import { faker } from '@faker-js/faker';
import type { Cart } from '../api/schemas/cart.schema';

interface CheckoutInfo {
  firstName: string;
  lastName: string;
  zipCode: string;
}

type CartPayload = Omit<Cart, 'id'>;

export function buildCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
    ...overrides,
  };
}

export function buildCart(overrides: Partial<CartPayload> = {}): CartPayload {
  return {
    userId: 1,
    date: new Date().toISOString().split('T')[0],
    products: [{ productId: 1, quantity: 1 }],
    ...overrides,
  };
}
