const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
   
    session: {
        type: mongoose.Schema.Types.objectId,
        ref: 'Session',
        required: true,
        unique: true,
    },
    name: { type: String,
         required: true,
          unique: true, 
        },
    startDate: { type: Date,
         required: true,
      },
    endDate: { type: Date,
         required: true,
         },
}, { timestamps: true });

module.exports = mongoose.model('Term', termSchema);
