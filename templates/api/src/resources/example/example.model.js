import mongoose from 'mongoose'

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    }
  },
  { timestamps: true }
)

export const Example = mongoose.model('example', exampleSchema)
