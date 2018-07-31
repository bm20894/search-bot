#!/usr/bin/env node

// Tweets 'Rise and Grind' every morning at 6:00 AM
// Run with node grind-bot.js [-p {hour}:{minute}]
// For the Procfile: must use UTC time in order to coordinate with Heroku
//    6:00 AM Central is 11:00 AM UTC
// Link to google form: https://goo.gl/forms/dG1WqQrTMSkUmaQw2

console.log('The bot is starting.');
const Twit = require('twit');
const fs = require('fs');
const config = require('./config_bot');
const entries = require('./entries');
const snt = require('./search-n-tweet');

const T = new Twit(config);

let defaultTerms = ['Shark Week 2018', 'Hello World', 'Danny Devito', 'Amazon'];
let terms = [];

let time = ['12', '00'];
let filename = 'picture.png';
const args = process.argv.map(a => a.toLowerCase());
if (args.indexOf('-p') != -1) time = args[args.indexOf('-p') + 1].split(':');
if (args.indexOf('-s') != -1) filename = args[args.indexOf('-s') + 1];

function update() {
  return new Promise((resolve, reject) => {
    entries().then(entries => {
      //Update from the spreadsheet, then search n' tweet a random term
      entries.forEach(entry => {
        let { term: t } = entry;
        //Only add if the term isn't already in terms or defaultTerms
        if(!terms.includes(t) && !defaultTerms.includes(t)) {
          terms.push(t);
        }
      });
      resolve();
    }).catch(e => console.error(e));
  });
}

firstTweet();
start();

function start() {
  update().then(() => {
    // console.log(`Data updated! Post at ${time.join(':')}`);
    checkTime();
  }).catch(e => console.error(e));
}

function checkTime() {
  let now = new Date();
  if (now.getHours() == time[0] && now.getMinutes() == time[1]) {
    console.log('time to tweet!');
    /*Wait 60 seconds (so the minutes don't match), then start again*/
    tweet();
    setInterval(() => {
      start();
    }, 1000 * 60);

  } else {
    setTimeout(start, 1000 * 30);
  }
}

function tweet() {
    // const filename = 'picture.png';
    let rand = Math.ceil(Math.random() * terms.length - 1), term;
    //if there are no terms, choose a default term
    if(terms.length > 0) {
      //Choose a term, then cut it from the array of terms
      term = terms[rand];
      terms.splice(rand, 1);
    }
    else {
      console.log('No more suggested terms right now...');
      let defaultRand = Math.ceil(Math.random() * defaultTerms.length - 1);
      term = defaultTerms[defaultRand];
    }
    //Tweet the search for the term, and save to picture.png
    snt(term, filename).then(resp => console.log(resp.msg, 'Term: '+resp.term));
}

function firstTweet() {
  let now = new Date();
  T.post('statuses/update', {
      status: `And we are back! Today is ${now.toDateString()}. ${now.getMilliseconds()}`+
      `\nIf you have a suggestion to search, you can submit it here: https://goo.gl/forms/dG1WqQrTMSkUmaQw2`
    })
    .catch(e => console.error(e))
    .then(res => {
      console.log(`Tweet ${res.data.id_str} was successfully posted: "${res.data.text}"`);
    });
}
