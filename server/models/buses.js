import mongoose from 'mongoose';

const { Schema } = mongoose;

const busDataSchema = new Schema({
  name: String,
  type: String,
  source: String,
  destination: String,
  routes: [{
    stage: String,
    place: String
  }]
});

busDataSchema.statics.findBySourceAndDestination = async function (source, destination) {
  return this.find({ source, destination });
};


const BusData = mongoose.model('BusData', busDataSchema);


export default BusData;
