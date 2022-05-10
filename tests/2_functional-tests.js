

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
let BoardModel = require('../models/board.model')
let ThreadModel = require('../models/thread.model')
//const _ = require('lodash');

chai.use(chaiHttp);




class NewThreadRequest {
  constructor(text, delete_password) {
    this.text = text;
    this.delete_password = delete_password;
    this._method = 'post'
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

//make15Posts8Reps3Bumbs()


suite('Functional Tests', function () {
  try {
    test('Creating a new thread: POST request to /api/threads/{board}', async () => {
      let boardName = "Board1"
      let text = "new thread created in test1"
      let delete_password = "password"

      let response = await chai
        .request(server)
        .post(`/api/threads/${boardName}`)
        .send(new NewThreadRequest(text, delete_password))

      assert.include(response.redirects[0], `/b/${boardName}/`, "redirects to /b/<boardname> ")
      assert.equal(response.statusCode, "200", "satus Code === 200")


    })

    //------------------- browser.xpath('/html')
    //------------------- browser.xpath('/html')
  }
  catch (err) {
    console.log("test1-----err" + err)
  }


  try {
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', async () => {

      let boardName = "Board1"
      let response = await chai.request(server)
        .get(`/api/threads/${boardName}`)

      assert.isArray(response.body, 'res.body is an array');
      let dateArray = response.body.filter(thread => thread.bumped_on !== undefined).map(thread => new Date(thread.bumped_on))
      let soertedDateArray = [...dateArray].sort((a, b) => { return b - a; })
      assert.deepEqual(dateArray, soertedDateArray, "threads bumped_on dates are sorted")

      assert.isAtMost(response.body[0].replies.length, 3, "there is at most 3 replies for each thread")
    })
    //.timeout(10000)
  }
  catch (err) {
    done(err)
    console.log("test1-----err" + err)
  }

  try {
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', async () => {

      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      let thread_id = thread.body[0]._id
      console.log("TEST3 _id: " + thread_id)
      let response = await chai.request(server)
        .delete(`/api/threads/${boardName}`)
        .send({
          thread_id: thread_id.toString(),
          delete_password: "wrongPassword"
        })
      assert.equal(response.text, "incorrect password"
        , "trying to erase top thread with a wrong password responds with 'incorrect password'")
    })
    //.timeout(10000)
  }
  catch (err) {
    console.log("test3-----err" + err)
  }

  try {
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', async () => {
      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      let len = thread.body.length
      let thread_id = thread.body[len - 1]._id
      console.log("TEST3 _id: " + thread_id)
      let response = await chai.request(server)
        .delete(`/api/threads/${boardName}`)
        .send({
          thread_id: thread_id.toString(),
          delete_password: "password"
        })
      assert.equal(response.text, "success"
        , "trying to erase top thread with the right password responds with 'success'");
      let thread2 = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      let _idArray = thread2.body.map(thread => thread._id)
      assert.notInclude(_idArray, thread_id, "thread ID not present in the list of all the tread ID's")
    })
    //.timeout(10000)
  }
  catch (err) {

    console.log("test4-----err" + err)
  }

  try {
    test("Reporting a thread: PUT request to /api/threads/{board}", async () => {

      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      let thread_id = thread.body[0]._id
      console.log("TEST5 _id: " + thread_id)
      let response = await chai.request(server)
        .put(`/api/threads/${boardName}`)
        .send({
          thread_id: thread_id.toString(),
        })
      console.log(response.text)
      assert.equal(response.text, "reported"
        , "trying to report top thread responds with 'reported'");
      const thread_DB = await ThreadModel.findById(thread_id.toString())
      assert.equal(thread_DB.reported, true
        , "trying to report the top thread sets the reported flag of the thread in the database to true");
    })
    //.timeout(10000)
  }
  catch (err) {

    console.log("test5-----err" + err)
  }


  try {
    test("Creating a new reply: POST request to /api/replies/{board}", async () => {
      let boardName = "Board1"
      let text = "new Reply created in test6"
      let delete_password = "password"
      let thread = await chai
        .request(server)
        .get(`/api/threads/${boardName}`)
      // pick last thread to bump it up  
      let len = thread.body.length
      let thread_id = thread.body[len - 1]._id
      let chosenThreadName = thread.body[len - 1].text
      console.log("TEST6 _id: " + thread_id)
      console.log("name: " + chosenThreadName)
      let response = await chai
        .request(server)
        .post(`/api/replies/${boardName}`)
        .send(new NewReplyRequest(thread_id, text, delete_password))

      
      assert.equal(response.statusCode, "200", "satus Code === 200")
      let updatedThread = await chai
        .request(server)
        .get(`/api/replies/${boardName}`)
        .send({ thread_id: thread_id })

      const len2 = updatedThread.body.replies.length !== 0 ? updatedThread.body.replies.length : 0
      assert.equal(updatedThread.body.text, chosenThreadName, "reply bumped thread up")

      assert.equal(updatedThread.body.replies[len2 - 1].text, "new Reply created in test6", "text in last reply of top thread equals current test")

    })
    //.timeout(10000)
  }
  catch (err) {
    console.log("test6-----err" + err)
  }


  try {
    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", async () => {
      let boardName = "Board1"
      let thread = await chai
        .request(server)
        .get(`/api/threads/${boardName}`)
      //pick longest thread

      let sortedThreads = thread.body.sort((a, b) => { return b.replycount - a.replycount; })
      let longestThread = sortedThreads[0]
      let thread_id = longestThread._id
      let chosenThreadName = longestThread.text
      let threadLength = longestThread.replycount
      console.log("TEST 7 _id: " + thread_id)
      let response = await chai
        .request(server)
        .get(`/api/replies/${boardName}`)
        .send({ thread_id: thread_id })      
      assert.isAbove(response.body.replies.length, 3, 'thread has more than three replies');
      assert.equal(threadLength, response.body.replies.length, "display full thread")
    })
    //.timeout(10000)
  }
  catch (err) {
    console.log("test7-----err" + err)
  }

  try {
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', async () => {

      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      let len = thread.body.length
      let thread_id = thread.body[0]._id
      console.log("TEST 8 thread_id: " + thread_id)
      console.log("TEST 8 reply_id: ")
      console.log(thread.body[0].replies[0]._id)
      let reply_id = thread.body[0].replies[0]._id
      let response = await chai.request(server)
        .delete(`/api/replies/${boardName}`)
        .send({
          thread_id: thread_id.toString(),
          reply_id: reply_id.toString(),
          delete_password: "wrongPassword"
        })

      console.log(response.text)

      assert.equal(response.text, "incorrect password"
        , "trying to erase top thread's first reply with a wrong password responds with 'incorrect password'")

    })
    //.timeout(10000)
  }
  catch (err) {
    console.log("test8-----err" + err)
  }



  try {
    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with an invalid delete_password', async () => {

      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      
      let thread_id = thread.body[0]._id
      console.log("TEST 9 thread_id: " + thread_id)
      console.log("TEST 9 reply_id: ")
      console.log(thread.body[0].replies[0]._id)
      let reply_id = thread.body[0].replies[0]._id
      let response = await chai.request(server)
        .delete(`/api/replies/${boardName}`)
        .send({
          thread_id: thread_id.toString(),
          reply_id: reply_id.toString(),
          delete_password: "password"
        })

      console.log(response.text)

      assert.equal(response.text, "success"
        , "trying to erase last thread's first reply with the right password responds with 'success'");
      let thread2 = await chai.request(server)
        .get(`/api/replies/${boardName}`)
        .send({ thread_id: thread_id })
      console.log(thread2.body.replies[0].text)
      //let rep_idArray = thread2.body.map(thread => thread._id)
      assert.equal(thread2.body.replies[0].text, "[deleted]", "trying to erase last thread's first reply with the right password changes text to :[deleted]")
    })
    //.timeout(10000)
  }
  catch (err) {
    console.log("test9-----err" + err)
  }





  try {
    test("Reporting a reply: PUT request to /api/replies/{board}", async () => {

      let boardName = "Board1"
      let thread = await chai.request(server)
        .get(`/api/threads/${boardName}`)
      
      let thread_id = thread.body[0]._id
      console.log("TEST 10 thread_id: " + thread_id)
      console.log("TEST 10 reply_id: ")
      console.log(thread.body[0].replies[0]._id)
      let reply_id = thread.body[0].replies[0]._id
      let response = await chai
        .request(server)
        .put(`/api/replies/${boardName}`)
        .send({
          thread_id: thread_id, 
          reply_id: reply_id
        })
      
      assert.equal(response.text, "reported"
        , "trying to report top thread responds with 'reported'");
      const thread_DB = await ThreadModel.findById(thread_id.toString())
      
      assert.equal(thread_DB.replies[0].reported, true,
         "trying to report the top thread's first reply sets the reported flag of the thread's first reply in the database to true");
    })
    //.timeout(10000)
  }
  catch (err) {

    console.log("test10-----err" + err)
  }








})


