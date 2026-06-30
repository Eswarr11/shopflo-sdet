import * as path from 'path';

export const USERS = {
  STANDARD: 'standard_user',
  LOCKED: 'locked_out_user',
  PROBLEM: 'problem_user',
  PERFORMANCE_GLITCH: 'performance_glitch_user',
  ERROR: 'error_user',
  VISUAL: 'visual_user',
} as const;

export const PASSWORD = 'secret_sauce';

export const API_USERS = {
  VALID: { username: 'mor_2314', password: '83r5^_' },
} as const;

export const PRODUCTS = {
  BACKPACK: { name: 'Sauce Labs Backpack', price: 29.99 },
  BIKE_LIGHT: { name: 'Sauce Labs Bike Light', price: 9.99 },
  BOLT_TSHIRT: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  FLEECE_JACKET: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  ONESIE: { name: 'Sauce Labs Onesie', price: 7.99 },
  RED_TSHIRT: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

/** Expected image filename fragment per product when images are correct (standard_user). */
export const PRODUCT_IMAGE_SLUGS: Record<string, string> = {
  [PRODUCTS.BACKPACK.name]: 'sauce-backpack',
  [PRODUCTS.BIKE_LIGHT.name]: 'bike-light',
  [PRODUCTS.BOLT_TSHIRT.name]: 'bolt-shirt',
  [PRODUCTS.FLEECE_JACKET.name]: 'sauce-pullover',
  [PRODUCTS.ONESIE.name]: 'red-onesie',
  [PRODUCTS.RED_TSHIRT.name]: 'red-tatt',
};

const AUTH_DIR = path.join(process.cwd(), '.auth');

export const AUTH_FILES = {
  STANDARD_USER:           path.join(AUTH_DIR, 'standard_user.json'),
  PROBLEM_USER:            path.join(AUTH_DIR, 'problem_user.json'),
  PERFORMANCE_GLITCH_USER: path.join(AUTH_DIR, 'performance_glitch_user.json'),
  ERROR_USER:              path.join(AUTH_DIR, 'error_user.json'),
  VISUAL_USER:             path.join(AUTH_DIR, 'visual_user.json'),
} as const;
