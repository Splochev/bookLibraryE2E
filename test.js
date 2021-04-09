const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

let browser, page;

describe('E2E tests', function () {
    this.timeout(10000);
    before(async () => {
        browser = await chromium.launch({ /* headless: false, slowMo: 1000 */} /*<---Remove these comments if you want to visualise the tests*/);
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
    });

    afterEach(async () => {
        await page.close();
    });

    it('Button "Load All Books" loads books', async () => {
        await page.goto('http://localhost:3000/');
        await page.click("#loadBooks");
        const elements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        let itLoads = false;
        if (elements[0].includes("Harry Potter and the Philosopher's Stone") && elements[0].includes("J.K.Rowling") && elements[1].includes("C# Fundamentals") && elements[1].includes("Svetlin Nakov")) {
            itLoads = true;
        }
        expect(itLoads).to.equal(true);
    });

    it('Button "Submit" does not add a book when empty inputs are provided', async () => {
        await page.goto('http://localhost:3000/');
        const beforeElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        await page.fill("#createForm > [name=title]", "");
        await page.fill("#createForm > [name=author]", "");
        await page.click("#createForm > button");
        const afterElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        expect(afterElements.length).to.equal(beforeElements.length);
    })

    it('Button "Submit" adds a book when inputs are provided', async () => {
        await page.goto('http://localhost:3000/');
        let titleInput = "testSave";
        let authorInput = "testSave";
        await page.fill("#createForm > [name=title]", titleInput);
        await page.fill("#createForm > [name=author]", authorInput);
        await page.click("#createForm > button");
        await page.click("#loadBooks");
        const elements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        let hasFirst, hasSecond, hasThird, hasAll = false;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].includes("Harry Potter and the Philosopher's Stone") && elements[i].includes("J.K.Rowling")) {
                hasFirst = true;
            } else if (elements[i].includes("C# Fundamentals") && elements[i].includes("Svetlin Nakov")) {
                hasSecond = true;
            } else if (elements[i].includes(titleInput) && elements[i].includes(authorInput)) {
                hasThird = true;
            }
        }
        if (hasFirst && hasSecond && hasThird) {
            hasAll = true;
        }
        expect(hasAll).to.equal(true);
    })

    it('Buttons "Edit" + "Save" dont edit a book when empty inputs are provided', async () => {

        titleInputEdit = "";
        authorInputEdit = "";

        await page.goto('http://localhost:3000/');
        await page.click("#loadBooks");
        const beforeContent = (await page.textContent("tbody > tr:last-child")).length;
        await page.click("tbody > tr:last-child > td > button.editBtn");
        await page.fill("#editForm > [name=title]", titleInputEdit);
        await page.fill("#editForm > [name=author]", authorInputEdit);
        await page.click("#editForm > button")
        await page.click("#loadBooks");

        const content = (await page.textContent("tbody > tr:last-child")).length;
        expect(content).to.equal(beforeContent);
    })

    it('Button "Delete" deletes the last book when pressing OK to the dialog', async () => {
        await page.goto('http://localhost:3000/');
        await page.click("#loadBooks");
        const beforeElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        page.on('dialog', dialog => dialog.accept());
        // page.on('dialog', dialog => console.log(dialog)); --------> Remvoe comments if you want to see the alert message details
        await page.click("tbody > tr:last-child > td > button.deleteBtn");
        await page.click("#loadBooks");
        const afterElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        console.log(beforeElements.length, afterElements.length);

        expect(beforeElements.length - 1).to.equal(afterElements.length);
    })

    it('Button "Delete" does not delete the last book when pressing Decline to the dialog', async () => {
        await page.goto('http://localhost:3000/');
        await page.click("#loadBooks");
        const beforeElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        page.on('dialog', dialog => dialog.dismiss());
        // page.on('dialog', dialog => console.log(dialog)); --------> Remvoe comments if you want to see the alert message details
        await page.click("tbody > tr:last-child > td > button.deleteBtn");
        await page.click("#loadBooks");
        const afterElements = await page.$$eval("tbody > tr", (a) => a.map(x => x.textContent));
        console.log(beforeElements.length, afterElements.length);

        expect(beforeElements.length).to.equal(afterElements.length);
    })



});