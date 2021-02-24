const path = require('path');

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /dishes handlers needed to make the tests pass

//Middleware
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function isValid(request, response, next) {
  const { data: { name, description, price, image_url } = {} } = request.body;
  if (!name) {
    return next({
      status: 400,
      message: 'Dish must include a name',
    });
  } else if (!description) {
    return next({
      status: 400,
      message: 'Dish must include a description',
    });
  } else if (!price) {
    return next({
      status: 400,
      message: 'Dish must include a price',
    });
  } else if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0',
    });
  } else if (!image_url) {
    return next({
      status: 400,
      message: 'Dish must include a image_url',
    });
  }
  next();
}

function create(request, response) {
  const { data: { name, description, price, image_url } = {} } = request.body;
  const newDish = {
    id: { nextId },
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  response.status(201).json({ data: newDish });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(request, response, next) {
  const dishId = response.locals.dishId;
  const {
    data: { id, name, description, price, image_url } = {},
  } = request.body;
  if (id && dishId !== id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  const newDish = {
    id: dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  response.json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [isValid, create],
  read: [dishExists, read],
  update: [dishExists, isValid, update],
  list,
};
