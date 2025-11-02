
    import { Given, When, Then, IWorld } from '@cucumber/cucumber';
    import { Page, expect } from '@playwright/test';

    Given("I navigate to the login page", async function() {
        await this.page.goto('https://www.saucedemo.com/');
    });

    When("I enter valid username and password", async function(dataTable) {
        const data = dataTable.hashes();
        const { username, password } = data[0];
        await this.page.fill("[id='user-name']", username);
        await this.page.fill("[id='password']", password);
    });

    When("I click on the login button", async function() {
        await this.page.click("[id='login-button']");
    });

    Then("I should be redirected to the product page", async function() {
        await expect(this.page).toHaveURL('https://www.saucedemo.com/inventory.html');
        await expect(this.page.locator('//span[@class="title"]')).toBeVisible();
    });