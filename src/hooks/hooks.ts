import { Before, After, IWorld, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import * as allure from 'allure-js-commons';
import { ContentType } from 'allure-js-commons';
import * as fs from 'fs';
import * as path from 'path';

// Using a dedicated directory for videos, which the context will use for temporary files
const outputDir = path.join(process.cwd(), 'test-results', 'temp_videos');

let browser: Browser;
let context: BrowserContext;
let page: Page; // Use a global page variable to simplify sharing and cleanup

interface CustomWorld extends IWorld {
    page: Page;
    videoPath?: string; // To temporarily store the video path for the After hook
}


// --- HOOKS ---
// -----------------------------------------------------------------------------------

Before(async function (this: CustomWorld) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load browser arguments from settings.json
    const browserArgs = JSON.parse(fs.readFileSync('settings.json', 'utf-8')).browser.args;

    // 1. Launch Browser
    browser = await chromium.launch({ 
        headless: false, 
        slowMo: 100,
        ...browserArgs
    });
    
    // 2. Create Context and Enable Video Recording
    context = await browser.newContext({
        viewport: { width: 1280, height: 1080 },
        recordVideo: {
             // CRITICAL: Playwright will create the video file in this directory.
             dir: outputDir, 
        }
    });
    
    // 3. Create Page and Store Reference
    page = await context.newPage();
    this.page = page; // Store page in the World object for step definitions
});

// src/hooks/hooks.ts

After(async function (this: CustomWorld, scenario) {
    const page = this.page;
    let videoPath: string | undefined; 
    let videoBuffer: Buffer | undefined;

    try {
        if (scenario.result?.status === Status.FAILED) {
            // --- 1. Get Screenshot and Video Path ---
            
            // Capture and attach screenshot (Using this.attach() and allure.attachment() is redundant but works)
            const screenshot = await page.screenshot({ fullPage: true });
            this.attach(screenshot, 'image/png');
            allure.attachment('Screenshot on Failure', screenshot, ContentType.PNG); // Keep for extra assurance/Allure-specific linking
            
            // Get the video object BEFORE closing the page/context
            const video = page.video();
            if (video) {
                videoPath = await video.path(); 
            }
        }
        
    } catch (error) {
        console.error('ERROR during media capture in After hook:', error);
        
    } finally {
        // --- 2. Guaranteed Teardown ---
        if (page) await page.close();
        if (context) await context.close();
        
        // 3. Attach Video to Report (If path exists AND status failed)
        if (scenario.result?.status === Status.FAILED && videoPath && fs.existsSync(videoPath)) {
            try {
                // Read the finalized video file
                videoBuffer = fs.readFileSync(videoPath);
                
                // ⭐️ FIX: Use this.attach() instead of allure.attachment() 
                // This ensures the attachment is recorded in the Cucumber JSON report.
                this.attach(videoBuffer, ContentType.WEBM); 
                
                // You can still call allure.attachment() if your Allure reporter relies on it, 
                // but this.attach is CRITICAL for Cucumber.
                allure.attachment('Video Recording', videoBuffer, ContentType.WEBM); 

                // CRITICAL: Manually delete the temporary file after attachment
                fs.unlinkSync(videoPath);
                console.log(`✅ Video attached to report and temporary file deleted: ${videoPath}`);

            } catch (videoError) {
                console.error(`FAILED to attach or delete video: ${videoPath}`, videoError);
            }
        }
        
        // 4. Close Browser
        if (browser) await browser.close();
    }
});