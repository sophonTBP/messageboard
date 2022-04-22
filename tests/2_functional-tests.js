
const puppeteer = require('puppeteer');
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
var Mocha = require('mocha');
//const _ = require('lodash');

chai.use(chaiHttp);




class NewThreadRequest {
  constructor(text, delete_password) {
    this.text = text;
    this.delete_password = delete_password;
  }

}

class NewReplyRequest {
  constructor(id,
    text,
    delete_password
  ) {
    this.thread_id = id;
    this.text = text;
    this.delete_password = delete_password;
  }
}
const getIds = async () => {
  let boardName = `Board1`;
  try {
    let response = await chai
      .request(server)
      .get(`/api/threads/${boardName}`)
    return response

  } catch (err) { console.log("getIds err :" + err) }
}




const seedDB = () => {



  let timeOut;
  for (let i = 0; i <= 15; i++) {

    ((i) => {
      let timeOut;
      timeOut = setTimeout(async () => {

        let text = `Thread${i + 1}`;
        let delete_password = "password";
        let boardName = `Board1`;
        await chai
          .request(server)
          .post(`/api/threads/${boardName}`)
          .send(new NewThreadRequest(text, delete_password));

      }, i * 1500);
    })(i)

  }


}

const getThreadsIds = async () => {
  try {
    let ids = []
    const res = await getIds()
    let resObjsArr = res.body

    for (let obj of resObjsArr) {
      ids.push(obj._id.toString())
    }

    return ids
  } catch (err) { console.log("get err :" + err) }
}

const sendReplies = (threadIds) => {


  for (let i = 0; i <= 8; i++) {
    for (let j = 0; j <= 4; j++) {
      setTimeout(async () => {
        setTimeout(async () => {
          try {
            let text = `reply${j}`;
            let boardName = `Board1`;
            let delete_password = "password";
            await chai
              .request(server)
              .post(`/api/replies/${boardName}`)
              .send(new NewReplyRequest(threadIds[i], text, delete_password))

            console.log("new Reply send!")
          } catch (err) { console.log("2nd loop err :" + err) }
        }, j * 2000);

      }, i * 9000);
    }
  }
  setTimeout(() => {
    for (let i = 1; i <= 3; i++) {

      setTimeout(async () => {
        try {

          let boardName = `Board1`;
          let delete_password = "password";
          let text = `bump!`


          await chai

            .request(server)
            .post(`/api/replies/${boardName}`)
            .send(new NewReplyRequest(threadIds[i], text, delete_password))
          console.log("bump!")
        } catch (err) { console.log("3rd loop err :" + err) }

      }, i * 3000);

    }
  }, 75000)
}



const make15Posts8Reps3Bumbs = () => {
  seedDB();
  let threadIds = []
  setTimeout(async () => {
    threadIds = await getThreadsIds()
    //console.log(threadIds)

  }, 30000);
  console.log("outer threadIds")

  setTimeout(
    async () => {
      let bumps = await sendReplies(threadIds)
    }, 32000)
}

const opts = {
  
  slowMo: 100,
  timeout: 10000
};
/*
before (async function () {
  global.expect = expect;
  global.browser = await puppeteer.launch(opts);
});

after (function () {
  browser.close();

  global.browser = globalVariables.browser;
  global.expect = globalVariables.expect;
});*/





suite('Functional Tests', function() {


  /*
  
    try {
      test('Creating a new thread: POST request to /api/threads/{board}', (done) => {
  
  
        browser.fill('board', 'Test 1 Board').then(() =>
          browser.fill('text', 'Test1')).then(() =>
            browser.fill('delete_password', 'password'))
          .then(() => {
  
            browser.pressButton('Submit', () => {
              browser.assert.success();
              browser.assert.text('h1#boardTitle', 'Welcome to /b/Test%201%20Board/');
              browser.assert.elements('h3', 'Test1', { atLeast: 1 });
  
  
            });
  
          }).then(() => {
            done()
          })
  
      })
  //------------------- browser.xpath('/html')
  //------------------- browser.xpath('/html')
    }
    catch (err) {
      console.log("test1-----err" + err)
    }
  */
  //make15Posts8Reps3Bumbs()

  
  try {
   
    
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', async () => {
     
        let siteUrl = "http://141.94.247.6:3000"
        let boardName = "/b/test12/"
        const browser = await puppeteer.launch(opts);
        const page = await browser.newPage();
        await page.goto(siteUrl + boardName)
        //await page.screenshot({ path: 'example.png' })

        const BOARD_DISPLAY = 'p';
        
    
       await page.waitForSelector(BOARD_DISPLAY);
        const board = await page.$$eval(BOARD_DISPLAY, board => board.map((id) => id.textContent));     
        
        console.log(await board);
        assert.equal(3, '3', '== coerces values to strings');        
      
        await browser.close();
        
       
      
       
    }).timeout(10000)


  }
  catch (err) {
    done(err)
    console.log("test1-----err" + err)
  }  
  




})  
