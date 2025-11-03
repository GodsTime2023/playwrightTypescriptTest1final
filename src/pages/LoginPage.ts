import { Page, Locator, expect } from "@playwright/test";
import * as fs from 'fs'; // Import the file system module

export class LoginPage {   
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    private readonly url: string;
    // ... other locators

    async goto() { // ⭐️ NEW METHOD
        await this.page.goto(this.url);
    }

    constructor(page: Page) {
        this.page = page;
        const settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'));//read url from settings.json
        this.url = settings.app.url; //set url from settings.json

        this.username = page.locator("[id='user-name']");
        this.password = page.locator("[id='password']");
        this.loginButton = page.locator("[type='submit']");
    }

    // Encapsulates all action logic
    async login(username: string, password: string) {
        await this.username.fill(username);
        await this.password.fill(password);
    }

    async clickLogin() {
        await this.loginButton.click();
    }
}