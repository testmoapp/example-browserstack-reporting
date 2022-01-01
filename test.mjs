import { Builder, By, Key, until } from 'selenium-webdriver';
import { assert } from 'chai';

describe('search engine', async function () {
    // Increase timeout for BrowserStack
    this.timeout(120000);
    let driver;

    // Make sure all required variables are set
    before(async function() {
        if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
            throw new Error('BrowserStack user name or access key not set')
        }
    });

    // Before each test, initialize Selenium and launch browser
    beforeEach(async function() {
        // We connect to BrowserStack's Selenium service
        const server = process.env.BROWSERSTACK_URL ||
            'https://hub-cloud.browserstack.com/wd/hub';

        // BrowserStack authentication and options
        const browserstackOptions = {
            userName: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            sessionName: this.currentTest.fullTitle()
        };

        let browser = process.env.BROWSER || 'chrome';
        // Microsoft uses a longer name for Edge
        if (browser == 'edge') {
            browser = 'MicrosoftEdge';
        }

        driver = await new Builder()
            .usingServer(server)
            .forBrowser(browser)
            .setCapability('bstack:options', browserstackOptions)
            .build();
    });

    // After each test, submit the result and close the browser
    afterEach(async function () {
        if (driver) {
            // Send test result to BrowserStack
            const result = this.currentTest.state == 'passed' ?
                'passed' : 'failed';
            await driver.executeScript(`browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"${result}"}}`);

            // Close the browser & end session
            await driver.quit();
        }
    });

    // A helper function to start a web search
    const search = async (term) => {
        // Automate DuckDuckGo search
        await driver.get('https://duckduckgo.com/');
        const searchBox = await driver.findElement(
            By.id('search_form_input_homepage'));
        await searchBox.sendKeys(term, Key.ENTER);

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('#links .result')));

        // Return page content
        const body = await driver.findElement(By.tagName('body'));
        return await body.getText();
    };

    // Our test definitions
    it('should search for "Selenium"', async function () {
        const content = await search('Selenium');
        assert.isTrue(content.includes('www.selenium.dev'));
    });

    it('should search for "Appium"', async function () {
        const content = await search('Appium');
        assert.isTrue(content.includes('appium.io'));
    });

    it('should search for "Mozilla"', async function () {
        const content = await search('Mozilla');
        assert.isTrue(content.includes('mozilla.org'));
    });

    it('should search for "GitHub"', async function () {
        const content = await search('GitHub');
        assert.isTrue(content.includes('github.com'));
    });

    it('should search for "GitLab"', async function () {
        const content = await search('GitLab');
        assert.isTrue(content.includes('gitlab.com'));
    });
});
