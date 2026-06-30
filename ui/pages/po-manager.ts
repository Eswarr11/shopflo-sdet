import { Page } from '@playwright/test';
import { LoginPage } from './login.page';
import { InventoryPage } from './inventory.page';
import { CartPage } from './cart.page';
import { ProductDetailPage } from './product-detail.page';
import { CheckoutStepOnePage } from './checkout/step-one.page';
import { CheckoutStepTwoPage } from './checkout/step-two.page';
import { CheckoutCompletePage } from './checkout/complete.page';
import { HeaderComponent } from '../components/header.component';
import { BurgerMenuComponent } from '../components/burger-menu.component';

export class POManager {
  constructor(private readonly page: Page) {}

  getLoginPage(): LoginPage {
    return new LoginPage(this.page);
  }
  getInventoryPage(): InventoryPage {
    return new InventoryPage(this.page);
  }
  getCartPage(): CartPage {
    return new CartPage(this.page);
  }
  getProductDetailPage(): ProductDetailPage {
    return new ProductDetailPage(this.page);
  }
  getCheckoutStepOnePage(): CheckoutStepOnePage {
    return new CheckoutStepOnePage(this.page);
  }
  getCheckoutStepTwoPage(): CheckoutStepTwoPage {
    return new CheckoutStepTwoPage(this.page);
  }
  getCheckoutCompletePage(): CheckoutCompletePage {
    return new CheckoutCompletePage(this.page);
  }
  getHeader(): HeaderComponent {
    return new HeaderComponent(this.page);
  }
  getBurgerMenu(): BurgerMenuComponent {
    return new BurgerMenuComponent(this.page);
  }
}
