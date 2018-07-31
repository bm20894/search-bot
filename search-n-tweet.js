/**
* Tweets a post containing a google images search result of a term to @notabot ,
* and saves the image into a specified location.
**/
const fs = require('fs');
const Twit = require('twit');
const puppeteer = require('puppeteer');
const config = require('./config_bot');
const T = new Twit(config);


module.exports = function (term, filename) {
  return new Promise((resolve, reject) => {
    search(term, filename).then(res => {
      const { term, filename } = res;
      postMedia(term, filename).then(msg => resolve(msg))
    })
  });
};

function search(term, filename) {
  let path = process.argv[1].match(/^C:\\[a-z].+\\/i);

  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 0.5 });
    await page.goto('https://images.google.com');
    await page.keyboard.type(`${term}\n`);

    await page.on('load', async () => {
      await page.screenshot({ path: `${path}${filename}` });
      await console.log(`${filename} screenshotted!`);
      await browser.close();
      resolve({ term, filename });
    });
  });
}

function postMedia(term, file) {
  // Post a message and a picture
  return new Promise((resolve, reject) => {
    let load = new Promise((resolve, reject) => {
      const b64 = fs.readFileSync(file, { encoding: 'base64' });
      resolve(b64);
    });
    load.then(b64 => {
      return new Promise((resolve, reject) => {
        T.post('media/upload', { media_data: b64 })
        .then(res => {
          const id = res.data.media_id_string;
          const params = {
            status: `Rise and Grind! The search of the day is: ${term}`+
            `\nPost your own suggestion here: https://goo.gl/forms/dG1WqQrTMSkUmaQw2`,
            media_ids: [id]
          }
          T.post('statuses/update', params)
          .then(res => {
            const resp = {
              text: res.data.text,
              msg: `Tweet ${res.data.id_str} was successfully posted.`,
              time: res.data.created_at,
              term
            };
            resolve(resp);
          });
        })
        .catch(e => reject(e));
      })
    }).then(val => resolve(val));
  })
}
