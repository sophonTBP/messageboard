'use strict';

const mongoose = require('mongoose');
let BoardModel = require('../models/board.model')
let ThreadModel = require('../models/thread.model')

module.exports = function(app) {

  app.route('/api/threads/:board')
    .post(async (req, res) => {

      try {
        const board = req.params.board
        const date = new Date();
        const { text, delete_password, } = req.body;
        const newBoard_id = new mongoose.Types.ObjectId();
        const thread_id = new mongoose.Types.ObjectId();

        const old_board = await BoardModel.findOne({ boardName: board })
  
        if (old_board!==null) {
          console.log("Exists!")

          let board_Id = old_board._id;
          let newThread = new ThreadModel({
            _id: thread_id,
            board_ID: board_Id,
            text: text,
            replycount: 0,
            created_on: date,
            boardName: board,
            bumped_on: date,
            password: delete_password
          })
          let savedThread = await newThread.save();
          return res.redirect(`/b/${board}/`);
        }
        else {
          console.log("creating new board")
          let newBoard = new BoardModel({
            _id: newBoard_id,
            boardName: board,
            threads: [thread_id],

          })
          let newThread = new ThreadModel({
            _id: thread_id,
            board_ID: newBoard_id,
            text: req.body.text,
            created_on: date,
            bumped_on: date,
            boardName: board,
            replycount: 0,
            password: delete_password

          })
          let savedBoard = await newBoard.save()
          let savedThread = await newThread.save()
          res.type('application/json')
          return res.redirect(`/b/${board}/`)
        }
      }
      catch (err) {
        console.log('/api/threads/:board POST err' + err);
        res.status(500).send(err);
      }
    })


    .get(async (req, res) => {
      

      try {

        console.log("api/threads/:board  .get was called")
        const name = req.params.board
        const data = await ThreadModel.aggregate([
          {
            $lookup: {

              localField: "board_ID",
              from: "boards",
              foreignField: "_id",
              as: "boardName"
            }
          },
          {
            $set: {
              boardName: { $arrayElemAt: ["$boardName.boardName", 0] }
            }
          },
          {
            $match: { boardName: name }
          }
          ,
          {
            $project: {
              text: 1,
              created_on: 1,
              bumped_on: 1,
              replycount: 1,
              replies: {
                $slice: ["$replies", 3]
              }
            }
          },
          {
            $project: {
              password: 0,
              reported: 0,
              replies: { password: 0, reported: 0 },
            }
          }
        ]).sort({ bumped_on: -1 });
        

      
        //res.type('application/json')
        res.json(data)
      }
      catch (err) {
        console.log('api/threads/:board GET err :' + err);
        res.status(500).send(err);
      }

    })

    .put(async (req, res) => {

      try {
        const { report_id } = req.body
        let date = new Date()

        let thread = await ThreadModel.findByIdAndUpdate(report_id, {
          $set: {
            reported: true
          }
        })

        const data = "reported"
        res.send(data)

      } catch (err) {
        console.log('api/threads PUT err :' + err);
        res.status(500).send(err);
      }
    })


    .delete(async (req, res) => {
      try {
        //console.log(req.body)
        let thread = await ThreadModel.findById(req.body.thread_id)
        if (thread.password === req.body.delete_password) {
          let thread = await ThreadModel.findByIdAndDelete(req.body.thread_id)
          return res.send("success")
        } else {
          return res.send("incorrect password")
        }
      }
      catch (err) {
        console.log('/api/threads DELETE err :' + err);
        res.status(500).send(err);
      }
    })

  



  app.route('/api/replies/:board')
    .post(async (req, res) => {
      try {
        console.log('/api/replies/:board POST req: ')
        const boardName = req.params.board
        const date = new Date(Date.now());
        const { text, delete_password, thread_id } = req.body
        let rep_id = new mongoose.Types.ObjectId();

        let newReply = {
          _id: rep_id.toString(),
          text: text,
          created_on: date,
          password: delete_password,
          reported: false

        }

        await ThreadModel.findByIdAndUpdate(thread_id, {
          $inc: { replycount: 1 },
          bumped_on: date,
          $push: { replies: newReply },

        }, { new: true }
        )

        res.redirect(`/b/${boardName}/${thread_id}`)

      }
      catch (err) {
        console.log('/api/replies/:board POST err' + err);
        res.status(500).send(err);
      }

    })
    .get(async (req, res) => {
      try {
       // console.log(req.query)
        const { thread_id } = req.query;
        const data = await ThreadModel.findById(
          thread_id
          , {
            text: 1, created_on: 1, replies: {
              _id: 1, text: 1, created_on: 1
            }
          })

        res.json(data)
      } catch (err) {
        console.log('/api/replies/:board GET err :' + err);
        res.status(500).send(err);
      }

    })

    .put(async (req, res) => {
      try {
        console.log("/api/replies/:board PUT req: ")
        //console.log(req.body)
        const { thread_id, reply_id } = req.body
        const date = new Date()


        //let thread = await ThreadModel.findOneAndUpdate({ _id: thread_id, replies: { $elemMatch: { _id: reply_id } } },
        // { $set: { "replies.$.reported_on": date } }
        //)
        let thread = await ThreadModel.findOneAndUpdate({ _id: thread_id, replies: { $elemMatch: { _id: reply_id } } },
          { $set: { "replies.$.reported": true } }
        )

        const data = "reported"
        return res.send(data)

      } catch (err) {
        console.log('/api/replies/:board PUT err :' + err);
        res.status(500).send(err);
      }
    })



    .delete(async (req, res) => {
      try {
        const boardName = req.params.board
        const { thread_id, reply_id, delete_password } = req.body
        // let thread = await ThreadModel.findById(thread_id)


        /*let thread2 = await ThreadModel.findByIdAndUpdate(
          { _id: thread_id },
          {
            $inc: { replycount: -1 },
            $pull: {
              replies: { _id: reply_id }
            }
          }
  
        )*/
        let reply = await ThreadModel.findOne({ _id: thread_id, replies: { $elemMatch: { _id: reply_id } } })
        if (reply.password === delete_password) {
          let thread = await ThreadModel.findOneAndUpdate({ _id: thread_id, replies: { $elemMatch: { _id: reply_id } } },
            {
              $inc: { replycount: -1 },
              $set: { "replies.$.text": "[deleted]" }
            }
          )
         // console.log(thread)

          return res.send("success")
        } else {
          return res.send("incorrect password")
        }

      }
      catch (err) {
        console.log('/api/replies/:board DELETE err :' + err);
        res.status(500).send(err);
      }
    })
};        
//test