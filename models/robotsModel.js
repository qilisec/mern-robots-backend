const mongoose = require('mongoose');

const { Schema } = mongoose;

const Robots = new Schema(
  {
    id: { type: String, required: false },
    robotId: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    maidenName: { type: String, required: false },
    email: { type: String, required: true },
    password: {
      type: String,
      required: [true, 'Password is a required field'],
    },
    birthDate: { type: String, required: true },
    image: { type: String, required: false },
    bloodGroup: { type: String, required: false },
    eyeColor: { type: String, required: false },
    hair: {
      type: {
        color: { type: String, required: false },
        type: { type: String, required: false },
      },
      required: false,
    },
    address: {
      type: {
        address: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        state: { type: String, required: false },
        coordinates: {
          type: {
            lat: { type: Number },
            lng: { type: Number },
          },
          required: false,
        },
      },
      required: false,
    },
    bank: {
      type: {
        cardExpire: { type: String, required: false },
        cardNumber: { type: String, required: false },
        cardType: { type: String, required: false },
        currency: { type: String, required: false },
        iban: { type: String, required: false },
      },
      required: false,
    },
    company: {
      type: {
        address: {
          type: {
            address: { type: String, required: false },
            city: { type: String, required: false },
            postalCode: { type: String, required: false },
            state: { type: String, required: false },
            coordinates: {
              type: {
                lat: { type: Number },
                lng: { type: Number },
              },
              required: false,
            },
            department: { type: String, required: false },
            name: { type: String, required: false },
            title: { type: String, required: false },
          },
          required: false,
        },
        cardNumber: { type: String, required: false },
        cardType: { type: String, required: false },
        currency: { type: String, required: false },
        iban: { type: String, required: false },
      },
      required: false,
    },
    macAddress: { type: String, required: false },
    university: { type: String, required: false },
    ein: { type: String, required: false },
    userAgent: { type: String, required: false },
    phone: { type: String, required: false },
    domain: { type: String, required: false },
    age: { type: Number, required: false },
    height: { type: Number, required: false },
    weight: { type: Number, required: false },
    createdBy: { type: String, required: false },
  }
  //   { timestamps: true }
);

module.exports = mongoose.model('robots', Robots);
