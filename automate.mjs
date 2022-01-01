import { Builder, By, Key, until } from 'selenium-webdriver';

if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
    console.log('BrowserStack user name or access key not set')
    process.exit(1);
}

// We connect to BrowserStack's Selenium service
const server = process.env.BROWSERSTACK_URL ||
    'https://hub-cloud.browserstack.com/wd/hub';

// BrowserStack authentication and options
const browserstackOptions = {
    userName: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    sessionName: 'First browser automation'
};

let browser = process.env.BROWSER || 'chrome';
// Microsoft uses a longer name for Edge
if (browser == 'edge') {
    browser = 'MicrosoftEdge';
}

// Set up a new browser session
let driver = await new Builder()
    .usingServer(server)
    .forBrowser(browser)
    .setCapability('bstack:options', browserstackOptions)
    .build();

try {
    // Automate DuckDuckGo search
    await driver.get('https://duckduckgo.com/');

    // Search for 'Selenium dev'
    const searchBox = await driver.findElement(By.id('search_form_input_homepage'));
    await searchBox.sendKeys('Selenium dev', Key.ENTER);

    // Wait until the result page is loaded
    await driver.wait(until.elementLocated(By.css('#links .result')));
} finally {
    // Close the browser
    await driver.quit();
}
