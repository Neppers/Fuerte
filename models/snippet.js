var mongoose = require('mongoose');

var snippetSchema = mongoose.Schema({
    _project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    _author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    tags: [String]
});

snippetSchema.set('toObject', { virtuals: true });

snippetSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, res) {
        delete res._id;
        delete res.__v;
        return res;
    }
});

var Snippet = mongoose.model('Snippet', snippetSchema);

snippetSchema.virtual('plain').get(function() {
    //TODO: Not yet implemented
    return this.body;
});

module.exports = Snippet;