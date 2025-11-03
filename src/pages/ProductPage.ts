import { Page, Locator, expect } from "@playwright/test";

export class ProductPage {
    readonly page: Page;
    readonly productTitle: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.productTitle = page.locator('//span[@class="title"]');
    }

    // Recommended: Create a focused verification method
    async verifyProductPageLoaded(expectedTitle: string) {
        // Assert that the title is visible AND has the correct text
        await expect(this.productTitle).toBeVisible(); 
        await expect(this.productTitle).toHaveText(expectedTitle); 
    }
}