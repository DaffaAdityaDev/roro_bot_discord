import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import puppeteer, { Page, Browser } from 'puppeteer';
import path from 'path';

const SELECTOR = {
  SELECTOR_RESOLUTION_OPEN:
    '#__next > div > div > div > div.style_right_wrap__VA7K5 > div.style_right_opt__mNN3y',
  SELECTOR_RESOLUTION_X:
    '#__next > div > div > div > div.style_right_wrap__VA7K5 > div.style_right_wrap_inner__rPxBK.style_scrollbar__D2GgX > div:nth-child(7) > div:nth-child(1) > div > div.flex-auto > div > div.ant-slider-handle',
  SELECTOR_RESOLUTION_Y:
    '#__next > div > div > div > div.style_right_wrap__VA7K5 > div.style_right_wrap_inner__rPxBK.style_scrollbar__D2GgX > div:nth-child(7) > div:nth-child(2) > div > div.flex-auto > div > div.ant-slider-handle',
  SELECTOR_RESOLUTION_CLOSE:
    '#__next > div > div > div > div.style_right_wrap__VA7K5 > div.style_right_opt__mNN3y',
  SELECTOR_GENERATE: '#demo-btn-generate',
  SELECTOR_LOADING: 'div.ant-spin-text',
  SELECTOR_IMAGE:
    '#__next > div > div > div > div.style_image_content__XoQP6.style_scrollbar__D2GgX > div > div > div',
  SELECTOR_IMAGE_PREVIEW:
    '#__next > div > div > div.style_preview_wrap__egOoP > div.style_info_content__50R90 > div.style_img_wrap__1rz_t > img',
};

const MODEL_SELECTOR = {
  SELECTOR_MODEL:
    '#__next > div > div > div > div.style_left_wrap__hg5ZP > div.style_inner_wrap__AehDk.style_scrollbar__D2GgX > div:nth-child(3) > input',
  SELECTOR_MODEL_SEARCH:
    '#__next > div > div > div > div.style_left_wrap__hg5ZP > div.style_modal_wrap__u7qf9 > div.style_modal_top_fixed__tJ9QG > div:nth-child(2) > div > div > span > span > input',
  SELECTOR_MODEL_SEARCH_RESULT:
    '#__next > div > div > div > div.style_left_wrap__hg5ZP > div.style_modal_wrap__u7qf9 > div.style_modal_inner__h9flk > div > div:nth-child(1) > img',
};

const MODEL_QUERY_SELECTOR = {
  SELECTOR_QUERY:
    '#__next > div > div > div > div.style_left_wrap__hg5ZP > div.style_inner_wrap__AehDk.style_scrollbar__D2GgX > div:nth-child(7) > textarea',
};

const MODEL_NEGATIVE_QUERY_SELECTOR = {
  SELECTOR_NEGATIVE_QUERY:
    '#__next > div > div > div > div.style_left_wrap__hg5ZP > div.style_inner_wrap__AehDk.style_scrollbar__D2GgX > div:nth-child(11) > textarea',
};

const SEED_SELECTOR = {
  SELECTOR_SEED:
    '#__next > div > div > div > div.style_right_wrap__VA7K5 > div.style_right_wrap_inner__rPxBK.style_scrollbar__D2GgX > div:nth-child(19) > div > div.ant-input-number-input-wrap > input',
};

// function to generate image
async function animeImageGeneration(interaction: CommandInteraction) {
  await interaction.deferReply();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const filename = path.basename(__filename, path.extname(__filename));
  await page.goto('https://omniinfer.io/demo', { waitUntil: 'networkidle0' });
  const query = interaction.options.get('query')?.value as string;
  const negative_query = interaction.options.get('negative_query')
    ?.value as string;
  const model = interaction.options.get('model')?.value as string;
  const resolution_x = interaction.options.get('resolution_x')?.value as string;
  const resolution_y = interaction.options.get('resolution_y')?.value as string;
  let seed = (interaction.options.get('seed')?.value as string) || undefined;

  if (seed && !/^\d+$/.test(seed)) {
    await interaction.editReply('Seed harus angka bro');
    await interaction.deleteReply();
    seed = undefined;
  }

  console.log('start generate Image');
  console.log('resoluteion', resolution_x, resolution_y);
  console.log('seed', seed);
  console.log('query', query);
  console.log('negative_query', negative_query);
  console.log('model', model);

  try {
    // wait for the selector to load

    if (model) {
      console.log('model');
      // input text for model---------------------------
      await waitAndClick(page, MODEL_SELECTOR.SELECTOR_MODEL);
      await takeScreenshot(page, `${filename}1`); // uncomment this line to take a screenshot debug
      await WaitAndtypeIntoInput(
        page,
        MODEL_SELECTOR.SELECTOR_MODEL_SEARCH,
        model,
      );
      await takeScreenshot(page, `${filename}1.1`, 300); // uncomment this line to take a screenshot debug

      await waitAndClick(page, MODEL_SELECTOR.SELECTOR_MODEL_SEARCH_RESULT);
      await takeScreenshot(page, `${filename}1.2`); // uncomment this line to take a screenshot debug
    }

    await waitAndClick(page, MODEL_QUERY_SELECTOR.SELECTOR_QUERY);

    if (query) {
      // console.log('query');
      // input text for query---------------------------
      await WaitAndtypeIntoInput(
        page,
        MODEL_QUERY_SELECTOR.SELECTOR_QUERY,
        query,
      );
      await takeScreenshot(page, `${filename}2`); // uncomment this line to take a screenshot debug
      await deleteTextAndTypeIntoInput(
        page,
        MODEL_QUERY_SELECTOR.SELECTOR_QUERY,
        query,
      );
      await takeScreenshot(page, `${filename}2.1`); // uncomment this line to take a screenshot debug
    }

    if (negative_query) {
      // console.log('negative_query');
      // input text for negative query---------------------------
      await WaitAndtypeIntoInput(
        page,
        MODEL_NEGATIVE_QUERY_SELECTOR.SELECTOR_NEGATIVE_QUERY,
        negative_query,
      );
      await takeScreenshot(page, `${filename}2.2`); // uncomment this line to take a screenshot debug
      await deleteTextAndTypeIntoInput(
        page,
        MODEL_NEGATIVE_QUERY_SELECTOR.SELECTOR_NEGATIVE_QUERY,
        negative_query,
      );
      await takeScreenshot(page, `${filename}2.3`); // uncomment this line to take a screenshot debug
    }

    if (resolution_x || resolution_y || seed) {
      // open resolution
      await waitAndClick(page, SELECTOR.SELECTOR_RESOLUTION_OPEN);
    }

    if (resolution_x) {
      // drag slider for resolution x
      await takeScreenshot(page, `${filename}2.1`); // uncomment this line to take a screenshot debug
      await dragSlider(page, SELECTOR.SELECTOR_RESOLUTION_X, resolution_x);
      await takeScreenshot(page, `${filename}2.2`); // uncomment this line to take a screenshot debug
    }

    if (resolution_y) {
      // drag slider for resolution y
      await waitAndClick(page, SELECTOR.SELECTOR_RESOLUTION_Y);

      await dragSlider(page, SELECTOR.SELECTOR_RESOLUTION_Y, resolution_y);
      await takeScreenshot(page, `${filename}2.3`); // uncomment this line to take a screenshot debug
    }

    if (seed) {
      // input text for seed
      await deleteTextAndTypeIntoInput(page, SEED_SELECTOR.SELECTOR_SEED, seed);
      await takeScreenshot(page, `${filename}2.4`); // uncomment this line to take a screenshot debug
    }

    if (resolution_x || resolution_y || seed) {
      // close resolution
      await waitAndClick(page, SELECTOR.SELECTOR_RESOLUTION_CLOSE);
    }

    await takeScreenshot(page, `${filename}2.6`); // uncomment this line to take a screenshot debug

    // click generate button
    await waitAndClick(page, SELECTOR.SELECTOR_GENERATE);

    await takeScreenshot(page, `${filename}3`); // uncomment this line to take a screenshot debug

    // If the element is found and is visible, wait for it to disappear.
    await waitAndClick(page, SELECTOR.SELECTOR_LOADING, 100000, true);

    await takeScreenshot(page, `${filename}4`); // uncomment this line to take a screenshot debug

    // If the element is found and is visible, wait for it to disappear.
    await page.waitForSelector('div.ant-spin-text', { hidden: true });

    await waitAndClick(page, SELECTOR.SELECTOR_IMAGE);

    await takeScreenshot(page, `${filename}5`); // uncomment this line to take a screenshot debug

    await page.waitForSelector(
      '#__next > div > div > div.style_preview_wrap__egOoP > div.style_info_content__50R90 > div.style_img_wrap__1rz_t > img',
      { visible: true },
    );

    await page.screenshot({ path: `./src/commands/fun/ss/${filename}6.png` }); // uncomment this line to take a screenshot debug

    // promise new tab
    await openNewTab(page, SELECTOR.SELECTOR_IMAGE_PREVIEW);

    // resolve new tab
    let generatedImage = await handleNewTab(page, browser);

    await interaction.editReply({
      content: `
      :robot: Ini Gambar Dari Model ${model} :robot: \n Resolution X: ${resolution_x} \n Resolution Y: ${resolution_y} \n Seed: ${seed} \n
      :cold_face: Ini Gambar Lu: \n 
      ${query} 
      `,
      files: [
        {
          attachment: generatedImage as Buffer,
          name: `${filename}.png`,
        },
      ],
    });

    await browser.close();
  } catch (error) {
    console.log('An error occurred:', error);
    await interaction.editReply('Gagal Bro kaya nya kena limit tuh :joy:');
    await browser.close();
  }

  console.log('done generate Image');
}

// function to wait for selector and click
async function waitAndClick(
  page: Page,
  selector: string,
  timeout?: number,
  visible?: boolean,
) {
  if (timeout) {
    await page.waitForSelector(selector, { timeout: timeout });
    await page.click(selector);
  } else if (visible) {
    await page.waitForSelector(selector, { visible: visible });
    await page.click(selector);
  } else {
    await page.waitForSelector(selector);
    await page.click(selector);
  }
}

// function to wait for selector and type text
async function WaitAndtypeIntoInput(
  page: Page,
  selector: string,
  text: string,
) {
  await page.waitForSelector(selector);
  await page.click(selector);
  await page.keyboard.type(text);
}

// function to wait for selector and type text
async function deleteTextAndTypeIntoInput(
  page: Page,
  selector: string,
  text: string,
) {
  await page.waitForSelector(selector);
  await page.click(selector);
  // select all text and delete
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  await page.keyboard.type(text);
}

// function to drag slider
async function dragSlider(page: Page, selector: string, res?: string) {
  let distance = 0;

  switch (res) {
    case '256':
      distance = -30;
      break;
    case '512':
      distance = 0;
      break;
    case '768':
      distance = 10;
      break;
    case '1024':
      distance = 30;
      break;
    case '2048':
      distance = 10;
      break;
    default:
      distance = 0;
      break;
  }

  await page.waitForSelector(selector);
  const element = await page.$(selector);
  if (element) {
    const box = await element.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      const endX = startX + distance; // Change this value based on how far you want to drag
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, startY);
      await page.mouse.up();
    }
  }
}

// function to take screenshot
async function takeScreenshot(page: Page, filename: string, delay?: number) {
  // await page.screenshot({ path: `./src/commands/fun/ss/${filename}.png` });
  // if (delay) {
  //   await new Promise((resolve) => setTimeout(resolve, delay));
  // }
}

// function to open new tab
async function openNewTab(page: Page, selector: string) {
  const [newTab] = await Promise.all([
    new Promise((resolve) => page.once('popup', resolve)),
    page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const link = element?.getAttribute('src');
      if (link) {
        window.open(link, '_blank');
      }
    }, selector),
  ]);

  return newTab as Page;
}

// function to handle new tab
async function handleNewTab(
  page: Page,
  browser: Browser,
): Promise<Buffer | undefined> {
  // Get all the pages in the browser
  const pages = await browser.pages();

  // The new tab should be the last one in the array
  const newTab = pages[pages.length - 1];

  // Wait for the image to load in the new tab
  await newTab.waitForSelector('img');

  // Wait for the image to fully load
  await newTab.waitForFunction('document.querySelector("img").complete');

  // Get the image element
  const image = await newTab.$('img');

  // takeScreenshot(page, 'newTab'); // uncomment this line to take a screenshot of the new tab

  // Take a screenshot of only the image and return it as a Buffer
  return image?.screenshot();
}

export default animeImageGeneration;
