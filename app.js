//#region imports 
const fs = require('node:fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const chalk = require('chalk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
//#endregion

//#region arguments
// var args = process.argv.slice(2);
// let arg1 = args[0];
// let var1 = arg1;n
// // if (!var1) {
// //   console.log('var1 not passed - exiting');
// //   exit();
// // }
//endregion

//#region browser automation vars
const waitOptions = { timeout: 3000, waitUntil: 'networkidle2' };
const clickOptions = { delay: 2000 };
let redtext = "\x1b[31m%s\x1b[0m";
let cyantext = "\x1b[36m%s\x1b[0m";
let graytext = "\x1b[90m%s\x1b[0m";
let purpletext = "\x1b[35m%s\x1b[0m";
let debug = true;
let _headlessMode = false;
let _userDataDir = './user_data';
// #endregion 

let username = "";
let pw = "";
let startUrl = "";

puppeteer.launch({ headless: _headlessMode, userDataDir: _userDataDir, args: [] }).then(async browser => {
  var allPages = await browser.pages();
  let page1 = allPages[0];
  try {
   await page1.goto(startUrl, {});
  } catch (ex) {
    console.log('ex', ex);
  }

  //code
  
  //await browser.close();
  //exit)();
});
async function getElementBySelector(pg, sel) {
  let el;
  try {
    el = await pg.waitForSelector(sel, {timeout: 3000});
    return el;
  }
  catch {
    console.log('err getting element by selector : ' + sel);
    return null;
  }
}
async function getElementByXpath(pg, xPath) {
  return await pg.waitForSelector('::-p-xpath('+xPath+')');
}
async function gotoUrl(pg, url) {
  await pg.goto(url, {});
}
async function sleep(seconds,msg=""){
  //console.log(graytext, '  *** pause ' + seconds + ' seconds ***');
  if (msg) {
    console.log(graytext, msg);
  }
  var milliseconds = seconds * 1000;
  await new Promise(resolve => setTimeout(resolve, milliseconds))
}
async function sleepMs(milliseconds,msg=""){
  if (debug) {
  }
  if (msg) {
  }
  //var c = seconds * 1000;
  await new Promise(resolve => setTimeout(resolve, milliseconds))
}
async function getAllElementsInObject(searchObject, elType, debug) {
  try {
    let elements = await searchObject.$$(elType);
    let elText;
    let elHtml;
    let elInnerText;
    let elCount = elements.length;
    let elTextId;

    if (debug) {
      console.log(elType + ' elements found count : ' + elCount);
    }

    return elements;
  }
  catch (err) {
    console.log(err);
  }
}
async function searchForElementAndClick(searchObject,elType,elSearchText) {

  try {
    let elements = await searchObject.$$(elType);
    // let aClassName;
    // let aHref;
    let elText;
    let elHtml;
    let elInnerText;
    let elCount = elements.length;
    let elTextId;
    console.log(elType + ' elements found count : ' + elCount);
    for(let el of elements) {
      elText = null;
      elText = await el.evaluate(x => x.textContent);
      elHtml = null;
      elHtml = await el.evaluate(x => x.innerHTML);
      elInnerText = null;
      elInnerText = await el.evaluate(x => x.innerText);

      elTextId = elText.trim().replaceAll(" ","").toUpperCase();
      //console.log('element Text : ' + elTextId);
      //console.log('element InnerText : ' + elInnerText);
      //console.log('element HTML : ' + elHtml);

      if (elTextId == elSearchText){
        console.log('el text found : ' + elSearchText);

        await el.click();
        break;
      }
    }
    //await sleep(60);
  }
  catch (err) {
    console.log(err);
  }

}
async function getTextInputByLabel(searchObject, searchText, debug) {
  try {
    let labels = await searchObject.$$("label");
    let labelText;
    let elInnerText;
    let matchToText;
    let labelForId;
    let elCount = labels.length;
    
    searchText = searchText.trim().replaceAll(" ","").toUpperCase();
    if (!searchText) {
      console.log('searchText cannot be blank');
      return null;
    }

    if (debug) {console.log('searchText :' + searchText);}

    if (debug) {
      console.log(elCount + ' labels found in ' + searchObject);
    }

    let matchingElement = null;
    for(let label of labels) {
      labelText = null;
      labelText = await label.evaluate(x => x.innerText);
      matchToText = null;
      matchToText = labelText.trim().replaceAll(" ","").toUpperCase();

      if (debug) {console.log('label match text : ' + matchToText); }

      if (matchToText == searchText || matchToText.includes(searchText)) {
        if (debug) {console.log('\nlabel found : ' + matchToText) };
        labelForId = await label.evaluate(x => x.getAttribute("for"));
        
        if (labelForId) {
          //console.log('labelForId : ', labelForId);
          let inputText = getElementBySelector(searchObject, "#"+labelForId);
          if (inputText) {
            return inputText;
          }
        }
        else {
          //console.log('labelForId null or undefined');
        }
  
        //return label;
      }
      // else {
      //   return null;
      // }
    }
  }
  catch (err) {
    console.log(err);
    return null;
  }

}
async function getCheckboxByLabel(searchObject, searchText, debug) {
  try {
    let labels = await searchObject.$$("label");
    let labelText;
    let elInnerText;
    let matchToText;
    let labelForId;
    let elCount = labels.length;
    
    searchText = searchText.trim().replaceAll(" ","").toUpperCase();
    if (!searchText) {
      console.log('searchText cannot be blank');
      return null;
    }

    if (debug) {console.log('searchText :' + searchText);}

    if (debug) {
      console.log(elCount + ' labels found in ' + searchObject);
    }

    for(let label of labels) {
      labelText = null;
      labelText = await label.evaluate(x => x.innerText);
      matchToText = null;
      matchToText = labelText.trim().replaceAll(" ","").toUpperCase();

      if (debug) {console.log('label match text : ' + matchToText); }

      if (matchToText == searchText || matchToText.includes(searchText)) {
        if (debug) {console.log('\nlabel found for checkbox : ' + matchToText) };
        labelForId = await label.evaluate(x => x.getAttribute("for"));
        
        if (labelForId) {
          console.log('labelForId : ', labelForId);
          let checkbox = getElementBySelector(searchObject, "#"+labelForId);
          if (checkbox) {
            return checkbox;
          }
        }
        else {
          //console.log('labelForId null or undefined');
        }
  
        //return label;
      }
      // else {
      //   return null;
      // }
    }
  }
  catch (err) {
    console.log(err);
    return null;
  }

}
async function getButtonByText(searchObject, searchText, debug) {
  try {
    let buttons = await searchObject.$$("button");
    let elText;
    let elInnerText;
    let elCount = buttons.length;
    let elTextId;

    if (debug) {
      console.log(elCount + ' buttons found in ' + searchObject);
    }
    
    if (!searchText) {
      console.log('searchText cannot be blank');
      return null;
    }
    searchText = searchText.trim().replaceAll(" ","").toUpperCase();
    if (!searchText) {
      console.log('searchText cannot be blank');
      return null;
    }

    for(let btn of buttons) {
      buttonText = null;
      buttonText = await btn.evaluate(x => x.innerText);
      matchToText = buttonText.trim().replaceAll(" ","").toUpperCase();

      if (matchToText == searchText) {
        console.log('button found : ' + matchToText);
        // console.log('button html : ' + elHtml.substring(0,50));
        return btn;
      }
    }
  }
  catch (err) {
    console.log(err);
    return null;
  }

}
async function fillTextInput(page, txtinput, txt, backspace) {

  if (txtinput != null) {
    let txtinputValue = await txtinput.evaluate(x => x.value);
    let txtinputValueLength = txtinputValue.length;
    await txtinput.focus();

   if (backspace == true) {  
      try {
        for (let i = 0; i < txtinputValueLength; i++) {
          //text += "The number is " + i + "<br>";
          await page.keyboard.press('Backspace');
        }
      }
      catch {
        console.log('err backspacing');
      }
  }

  await page.keyboard.type(txt);

  }
}
async function getElementWithText(searchObject, elType, searchText, debug=false) {

  let returnElement = null;

  try {
    if (debug) {
      console.log('');
      console.log(chalk.underline.green('New Element Search'));
      console.log('search object :', searchObject);
      console.log('element type :', elType);
      console.log('search text : "' + searchText + '"');
      console.log('');
    }

    let elText;
    let elHtml;
    let elInnerText;
    let elTextId;
    let elValue;
    let elements = await searchObject.$$(elType);
    let elCount = elements.length;
    searchText = searchText.trim().replaceAll(" ","").toUpperCase();

    if (debug) {
      console.log(elType + ' elements found count : ' + elCount);
      console.log('');
    }

    let matchValue;
    let matchInnerText;
    let matchText = "";
    
    for(let el of elements) {
      elInnerText = null;
      elInnerText = await el.evaluate(x => x.innerText);

      if (elType.toUpperCase() == "INPUT" || elType.toUpperCase() == "TEXTAREA") {
        elValue = null;
        elValue = await el.evaluate(x => x.value);
        matchValue = elValue.trim().replaceAll(" ","").toUpperCase();
        matchText = matchValue;
        if (debug) {
         //console.log('element value : ' + elValue);
       }
      }
      else {
        elText = null;
        elText = await el.evaluate(x => x.textContent);
        elHtml = null;
        elHtml = await el.evaluate(x => x.innerHTML);
        matchInnerText = elInnerText.trim().replaceAll(" ","").toUpperCase();
        matchText = matchInnerText;
        if (debug) {
          //console.log('element innerText : ' + elInnerText);
       }
      }

      if (debug) {
        console.log('Match text : ' + matchText + ', searchText : ' + searchText);
        console.log('');
      }


      if (matchText.includes(searchText)) {
        if (debug) {
          console.log('el match found : ' + searchText);
        }
        return el;
        break;
      }
    }
    return returnElement;
  }
  catch (err) {
    console.log(err);

    return returnElement;
  }
}
async function getElementsWithText(searchObject, elType, searchText, debug=false) {

  let returnElements = null;

  try {
    if (debug) {
      console.log('');
      console.log(chalk.underline.green('New Element Search'));
      console.log('search object :', searchObject);
      console.log('element type :', elType);
      console.log('search text : "' + searchText + '"');
      console.log('');
    }

    let elText;
    let elHtml;
    let elInnerText;
    let elTextId;
    let elValue;
    let elements = await searchObject.$$(elType);
    let elCount = elements.length;
    searchText = searchText.trim().replaceAll(" ","").toUpperCase();

    if (debug) {
      console.log(elType + ' elements found count : ' + elCount);
      console.log('');
    }

    let matchValue;
    let matchInnerText;
    let matchText = "";
    
    for(let el of elements) {
      elInnerText = null;
      elInnerText = await el.evaluate(x => x.innerText);

      if (elType.toUpperCase() == "INPUT" || elType.toUpperCase() == "TEXTAREA") {
        elValue = null;
        elValue = await el.evaluate(x => x.value);
        matchValue = elValue.trim().replaceAll(" ","").toUpperCase();
        matchText = matchValue;
        if (debug) {
         //console.log('element value : ' + elValue);
       }
      }
      else {
        elText = null;
        elText = await el.evaluate(x => x.textContent);
        elHtml = null;
        elHtml = await el.evaluate(x => x.innerHTML);
        matchInnerText = elInnerText.trim().replaceAll(" ","").toUpperCase();
        matchText = matchInnerText;
        if (debug) {
          //console.log('element innerText : ' + elInnerText);
       }
      }

      if (debug) {
        console.log('Match text : ' + matchText + ', searchText : ' + searchText);
        console.log('');
      }

      if (matchText.includes(searchText)) {
        if (debug) {
          console.log('el match found : ' + searchText);
        }
        returnElements+=el;
        //return el;
        //break;
      }
    }
   return returnElements;
  }
  catch (err) {
    console.log(err);
    return err;
  }
}
async function scrollTo(page, scrollTo) {
  await page.evaluate((scrollTo) => {
    let height = document.body.scrollHeight;
    window.scrollTo(0, scrollTo);
  }, scrollTo);
}
async function getDocumentFullHeight(page) {
  let docScrollHeight = await page.evaluate(
    () => document.body.scrollHeight
  )
  return docScrollHeight;
}
async function screenshot(page) {
  await page.screenshot({path: './images/err.png'});
}
async function getElementContainingClassText(searchObject, elType, classText, debug) {
  if (classText == "") {
    console.log('No classText passed to function.');
    return null;
  }
  try {
    let elements = await searchObject.$$(elType);
    let elHtml;
    let elInnerText;
    let elCount = elements.length;
    let elClassName;
    let elMatchText;
    let classFindText = classText.trim().replaceAll(" ","").toUpperCase();
    if (debug) {console.log(elType + ' elements found before class filter count : ' + elCount);}
      for(let el of elements) {
        elClassName = null;
        elClassName = await el.evaluate(x => x.className);
        if (elClassName) {
          elMatchText = elClassName.trim().replaceAll(" ","").toUpperCase();
          if (debug) {
            console.log('match text ' + elMatchText);
          }
          if (elMatchText.includes(classFindText)) {
            if (debug) {
              console.log('match found');
              console.log(elClassName);
            }
            return el;
            //break;
          }
       } 
     }
  }
  catch (err) {
    console.log(err);
  }
}
function exit() {
  process.exit();
} 
function createFileSynch(path, text) {
  const fs = require('node:fs');
  
  try {
    fs.writeFileSync(path, text);
    // file written successfully
  } catch (err) {
  }
}
function appendLineSynch(path, text) {
  const fs = require('node:fs');

  fs.appendFile(path, text, err => {
    if (err) {
    } else {
      // done!
    }
  });
}
function deleteFile(path) {
  const fs = require('node:fs'); 
  fs.unlinkSync(path);
}
function checkDirectoryExists(directoryPath){

  if (fs.existsSync(directoryPath)) {
    return true;
  } else {
    return false;
  }
}
function checkFileExists(filepath) {
  if (fs.existsSync(filepath)) {
    return true;
  } else {
    return false;
  }
}
function idText(text) {
  return text.toString().trim().replaceAll(" ","").toUpperCase();
}
async function sound(type) {

  const util = require('util');
  const exec = util.promisify(require('child_process').exec);

  if (type == "good") {
    const { stdout, stderr } = await exec('paplay /usr/share/sounds/freedesktop/stereo/complete.oga');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  }
  else if (type == "bad")
  {
   const { stdout, stderr } = await exec('paplay /usr/share/sounds/freedesktop/stereo/message-new-instant.oga');
   console.log('stdout:', stdout);
   console.log('stderr:', stderr);
  }
  else if (type == "alert")
  {
    const { stdout, stderr } = await exec('paplay /usr/share/sounds/Oxygen-Im-Sms.ogg');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  }
  else if (type == "good2") {
    const { stdout, stderr } = await exec('paplay /usr/share/sounds/Oxygen-Im-Message-In.ogg');
  }
}
function stripMoneyFormat(moneyString) {
  let prcString = moneyString.replace("$","").replaceAll(",","");
  let prcDecimal = parseFloat(prcString);
  return prcDecimal;
}
function cl(msg) {
  console.log(msg);
}
async function getFirstElementInObject(searchObject, elType, debug) {
  try {
    let element = await searchObject.$(elType);
    let elText;
    let elHtml;
    let elInnerText;
    let elCount = elements.length;
    let elTextId;

    return element;
  }
  catch (err) {
    console.log(err);
  }
}