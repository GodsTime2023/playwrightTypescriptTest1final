import { Given, When, Then, IWorld } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage'; // Import the ProductPage

interface CustomWorld extends IWorld {
    page: Page;
    loginPage: LoginPage; 
    productPage: ProductPage; // Add the ProductPage
}

Given("I navigate to the login page", async function(this: CustomWorld) {
    // Initialize Page Objects here, so they are available in subsequent steps
    this.loginPage = new LoginPage(this.page);
    this.productPage = new ProductPage(this.page);
    
    await this.loginPage.goto(); // Use the new goto method
});

When("I enter valid username and password", async function(this: CustomWorld, dataTable) {
    const data = dataTable.hashes();
    const { username, password } = data[0];
    await this.loginPage.login(username, password);
});

When("I click on the login button", async function(this: CustomWorld) {
    await this.loginPage.clickLogin();
});

Then("I should be redirected to the product page", async function(this: CustomWorld, dataTable) {
    const data = dataTable.hashes();
    const { title } = data[0];
    await expect(this.productPage.productTitle).toBeVisible();
    await this.productPage.verifyProductPageLoaded(title); // Use the new verification method
});