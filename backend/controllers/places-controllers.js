const { v4: uuid } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");
const fs = require("fs");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = HttpError(
      "Somthing went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    // return res
    //   .status(404)
    //   .json({ message: "Could not find a place for the provided id." });
    //OR
    // const error = new Error("Could not find a place for the provided id.");
    // error.code = 404;
    // throw error;
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;

  if (mongoose.isValidObjectId(userId)) {
    try {
      //We can also get the places of the user like below
      // userWithPlaces1 = await User.findById(userId).populate("places");
      // console.log(userWithPlaces1);
      userWithPlaces = await Place.find({ creator: userId });
    } catch (err) {
      const error = HttpError(
        "Somthing went wrong, could not find a place.",
        500
      );
      return next(error);
    }
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    // return res
    //   .status(404)
    //   .json({ message: "Could not find a place for the provided user id." });
    // OR
    // const error = new Error("Could not find a place for the provided user id.");
    // error.code = 404;
    // return next(error);

    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let corrdinates;
  try {
    corrdinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    address,
    location: corrdinates,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating new place failed, please try again.",
      422
    );
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Somthing went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = HttpError(
      "Somthing went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = HttpError(
      "Somthing went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place",
      401
    );
    return next(error);
  }

  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
  } catch (err) {
    const error = HttpError(
      "Somthing went wrong, could not find a place.",
      500
    );
    return next(error);
  }
  fs.unlink(imagePath, (err) => {
    console.log(`Delete the place image ${imagePath} ${err}`);
  });
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
