import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

export const KNOWN_DEFECTS = {
  SAUCEDEMO_PROBLEM_USER_CHECKOUT: {
    id: 'SAUCEDEMO-001',
    summary: 'Problem user last name field is not editable and checkout cannot complete',
  },
  SAUCEDEMO_RESET_INVENTORY: {
    id: 'SAUCEDEMO-002',
    summary: 'Reset App State clears cart badge but Remove buttons remain on inventory',
  },
  SAUCEDEMO_RESET_CART: {
    id: 'SAUCEDEMO-003',
    summary: 'Reset App State clears cart badge but cart items remain on cart page',
  },
  SAUCEDEMO_RESET_OVERVIEW: {
    id: 'SAUCEDEMO-004',
    summary: 'Reset App State during order overview leaves items and allows purchase',
  },
  FAKESTOREAPI_NO_AUTH: {
    id: 'FAKESTOREAPI-001',
    summary: 'GET /carts does not require authorization',
  },
  FAKESTOREAPI_INVALID_PRODUCT: {
    id: 'FAKESTOREAPI-002',
    summary: 'POST /carts accepts invalid productId',
  },
  FAKESTOREAPI_NEGATIVE_QTY: {
    id: 'FAKESTOREAPI-003',
    summary: 'POST /carts accepts negative quantity',
  },
  FAKESTOREAPI_MISSING_PRODUCTS: {
    id: 'FAKESTOREAPI-004',
    summary: 'POST /carts accepts payload without products field',
  },
  FAKESTOREAPI_IDOR_READ: {
    id: 'FAKESTOREAPI-005',
    summary: 'Unauthenticated clients can read any cart by id (IDOR)',
  },
  FAKESTOREAPI_IDOR_CROSS_USER: {
    id: 'FAKESTOREAPI-006',
    summary: 'Authenticated clients can read carts belonging to other users',
  },
  FAKESTOREAPI_IDOR_WRITE: {
    id: 'FAKESTOREAPI-007',
    summary: 'Unauthenticated clients can mutate another users cart',
  },
  FAKESTOREAPI_WRITE_NO_AUTH: {
    id: 'FAKESTOREAPI-008',
    summary: 'POST and DELETE /carts do not require authorization',
  },
} as const;

type KnownDefectKey = keyof typeof KNOWN_DEFECTS;

export async function markKnownDefect(key: KnownDefectKey): Promise<void> {
  const defect = KNOWN_DEFECTS[key];
  test.fail(true, `[${defect.id}] ${defect.summary}`);
  await allure.label('known-defect', defect.id);
  await allure.tag('known-defect');
  await allure.description(
    `Known application defect [${defect.id}]: ${defect.summary}. Assertion fails against demo app/API behavior; test is marked Passed in CI via test.fail().`,
  );
}
