/**
* This module will look at responses from a Google Forms sheet that contains responses
* from a Google Form for @notabot38654162. It will return all entries in the Sheet
* as a Promise.
**/

const GoogleSheets = require('google-drive-sheets');
/*https://docs.google.com/spreadsheets/d/e/2PACX-1vT3LAryOGhI6SKvIhskW7iedHxgIPk1V_uxmRTGDHH82Kta4psRztFJMabwqkN7iRzLTNJ3xQY5lrV1/pubhtml*/
const key = '1_2YI9U9GK4cB2g1E1naOeRQO0tPCOkTbl9vQDv4VIl0';
const mySheet = new GoogleSheets(key);

// getEntries().then(result => console.log(result));

function getEntries() {
  return new Promise((resolve, reject) => {
    mySheet.getInfo((e, info) => {
      if(e) throw e;
      const resps = info.worksheets[0];
      resps.getRows((e, data) => {
        if(e) throw e;
        let cont = [];
        data.forEach(row => {
          cont.push(getContents(row));
        });
        resolve(cont);
      });
    });
  });
  function getContents(row) {
    const { timestamp, suggestedterm: term, choosefromatermwevechosen: pickedTerm, timeofday24hryourtermwillbeposted: time } = row;
    return { timestamp, term, pickedTerm, time };
  }
}

module.exports = getEntries;
