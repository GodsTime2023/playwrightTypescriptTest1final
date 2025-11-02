import { Before, After, IWorld, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { Attachment, ContentType } from 'allure-js-commons';

let browser: Browser;
let context: BrowserContext;


Before(async function (this: IWorld) {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext({ viewport: { width: 1280, height: 1080 } });
    const page = await context.newPage();

    this.page = page;
});

After(async function (this: IWorld, scenario) {
     if (scenario.result?.status === Status.FAILED) {
        
        // 1. Capture the screenshot buffer
        const screenshot = await this.page.screenshot();
        
        // 2. Attach the screenshot to the Allure report (using Cucumber's attach)
        // This makes the image visible directly in the Allure report
        this.attach(screenshot, 'image/png');

        // Optional: Log the screenshot attachment to the console for debugging
        console.log(`Screenshot taken for failed scenario: ${scenario.pickle.name}`);
    }

    await context.close();
    await browser.close();
});