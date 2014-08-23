var mongoose = require('mongoose');

var contentSchema = mongoose.Schema({
    _project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    _author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    _parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    title: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    body: String,
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    meta: {
        description: String,
        keywords: [String],
        taxonomy: [Number],
        robots: String
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        }
    ]
});

contentSchema.set('toObject', { virtuals: true });

var Content = mongoose.model('Content', contentSchema);

contentSchema.virtual('plain').get(function() {
    //TODO: Not yet implemented
    return this.body;
});

module.exports = Content;