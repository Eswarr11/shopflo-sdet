import { faker } from '@faker-js/faker';
import { PRODUCTS } from '../config/constants';
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

export function pickRandomProductNames(minCount = 2, maxCount?: number): string[] {
  const allNames = Object.values(PRODUCTS).map((product) => product.name);
  const upperBound = Math.min(maxCount ?? allNames.length, allNames.length);
  const count = faker.number.int({ min: minCount, max: upperBound });
  return faker.helpers.arrayElements(allNames, count);
}
