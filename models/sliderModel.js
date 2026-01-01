const { default: mongoose } = require("mongoose");

const sliderSchema = new mongoose.Schema({
  slider: {
    type: String,
    required: [true, "slider image required"],
  },
  url: {
    type: String,
    default: null,
  },
});

const sliderModel = mongoose.model("slider", sliderSchema);
module.exports = sliderModel;
