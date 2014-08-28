var mongoose = require('mongoose');
var S = require('string');

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
    template: {
        type: String,
        default: 'basic-content'
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
    ],
    status: {
        type: String,
        default: 'draft'
    }
});

contentSchema.virtual('plain').get(function() {
    return S(this.body).stripTags().s;
});

contentSchema.virtual('lead').get(function() {
    return S(this.body).stripTags().truncate(65).s;
});

contentSchema.set('toObject', { virtuals: true });

contentSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, res) {
        delete res._id;
        delete res.__v;
        return res;
    }
});

var Content = mongoose.model('Content', contentSchema);



module.exports = Content;