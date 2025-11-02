import { Before, After, IWorld, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import * as allure from 'allure-js-commons';
import { ContentType } from 'allure-js-commons';
import * as fs from 'fs';
import * as path from 'path';

let browser: Browser;
let context: BrowserContext;

const outputDir = path.join(process.cwd(), 'test-results', 'videos');

Before(async function (this: IWorld) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext({ viewport: { width: 1280, height: 1080 },
           recordVideo: {
            dir: outputDir,
        }
     });
    const page = await context.newPage();

    this.page = page;
});

After(async function (this: IWorld, scenario) {
    const page = this.page; 
    let videoPath: string | undefined; // Variable to store the video path

    try {
        if (scenario.result?.status === Status.FAILED && page) {
            
            // --- 1. Screenshot and Video Finalization ---
            const video = page.video();
            
            if (video) {
                // CRITICAL: Finalize video and get the path BEFORE reading the file.
                // This makes the video file available.
                videoPath = await video.path(); 
            }
            
            // Capture and attach screenshot
            const screenshot = await page.screenshot({ fullPage: true });
            this.attach(screenshot, 'image/png');
            allure.attachment('Screenshot on failure', screenshot, ContentType.PNG);
            
            // --- 2. Video Attachment ---
            if (videoPath && fs.existsSync(videoPath)) {
                
                // Read the file and attach
                const videoBuffer = fs.readFileSync(videoPath);
                allure.attachment('Video recording', videoBuffer, ContentType.WEBM); 
                
                // Clean up the temporary file after successful reading
                await page.video()?.delete(); 
                
                console.log(`Video attached and deleted from temp location: ${videoPath}`);

            } else if (scenario.result?.status === Status.FAILED) {
                // Only log this error if the scenario actually failed
                console.error('Video was expected but not found for attachment.');
            }
        }

    } catch (error) {
        // Catch any error during the attachment/cleanup phase itself
        console.error('CRITICAL HOOK ERROR: Failed during media attachment/cleanup logic.', error);
        
    } finally {
        // 💡 GUARANTEED CLEANUP BLOCK: This runs even if an error occurs above.
        try {
            if (page) {
                await page.close();
            }
            if (context) {
                await context.close();
            }
            if (browser) {
                await browser.close();
            }
        } catch (cleanupError) {
            console.error('ERROR during browser/context closing:', cleanupError);
        }
    }
});