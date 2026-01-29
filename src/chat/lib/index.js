'use strict';

const chat = {};

chat.getOrCreateThread = require('./thread.get.or.create');
chat.getActiveThread = require('./thread.get.active');
chat.saveMessage = require('./message.save');
chat.getMessageCount = require('./message.get.count');
chat.getRecentMessages = require('./message.get.recent');
chat.getRelevantKbContext = require('./kb.get.context');
chat.saveSummary = require('./summary.save');
chat.completeThread = require('./thread.complete');

module.exports = chat;
