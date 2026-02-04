import mongoose from "mongoose";

export const getConversationMessagesAgg = (conversationId) => [
  {
    $match: {
      conversationId: new mongoose.Types.ObjectId(conversationId),
    },
  },
  {
    $lookup: {
      from: "emojis",
      localField: "_id",
      foreignField: "messageId",
      as: "emoji",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "emoji.senderId",
      foreignField: "_id",
      as: "emojiUsers",
    },
  },
  {
    $addFields: {
      emoji: {
        $map: {
          input: "$emoji",
          as: "e",
          in: {
            _id: "$$e._id",
            emoji: "$$e.emoji",
            sender: {
              $let: {
                vars: {
                  user: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$emojiUsers",
                          as: "u",
                          cond: { $eq: ["$$u._id", "$$e.senderId"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  _id: "$$user._id",
                  username: "$$user.username",
                  profilePhoto: "$$user.profilePhoto",
                },
              },
            },
            createdAt: "$$e.createdAt",
          },
        },
      },
    },
  },
  {
    $project: {
      emojiUsers: 0,
    },
  },
  {
    $sort: { createdAt: 1 },
  },
];

export const getMessageWithEmojisAgg = (messageId) => [
  {
    $match: { _id: new mongoose.Types.ObjectId(messageId) },
  },
  {
    $lookup: {
      from: "emojis",
      localField: "_id",
      foreignField: "messageId",
      as: "emoji",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "emoji.senderId",
      foreignField: "_id",
      as: "emojiUsers",
    },
  },
  {
    $addFields: {
      emoji: {
        $map: {
          input: "$emoji",
          as: "e",
          in: {
            _id: "$$e._id",
            emoji: "$$e.emoji",
            sender: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$emojiUsers",
                    as: "u",
                    cond: { $eq: ["$$u._id", "$$e.senderId"] },
                  },
                },
                0,
              ],
            },
            createdAt: "$$e.createdAt",
          },
        },
      },
    },
  },
  {
    $project: {
      emojiUsers: 0,
    },
  },
];
