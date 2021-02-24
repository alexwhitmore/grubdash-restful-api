const path = require('path');

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'));

// Use this function to assigh ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /orders handlers needed to make the tests pass

//Middleware
function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.orderId = orderId;
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function isValid(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = req.body;

  if (!deliverTo) {
    return next({
      status: 400,
      message: 'Order must include a deliverTo',
    });
  } else if (!mobileNumber) {
    return next({
      status: 400,
      message: 'Order must include a mobileNumber',
    });
  } else if (!dishes) {
    return next({
      status: 400,
      message: 'Order must include a dish',
    });
  } else if (!dishes.length || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: 'Order must include at least one dish',
    });
  }
  for (index in dishes) {
    const dish = dishes[index];
    const { quantity } = dish;

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
}

function update(req, res, next) {
  const orderId = res.locals.orderId;
  const {
    data: { id, deliverTo, mobileNumber, dishes, status } = {},
  } = req.body;

  if (id && orderId !== id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${orderId}`,
    });
  } else if (!status || status === 'invalid') {
    next({
      status: 400,
      message:
        'Order must have a status of pending, preparing, out-for-delivery, delivered',
    });
  } else if (status === 'delivered') {
    next({
      status: 400,
      message: 'A delivered order cannot be changed',
    });
  }

  const newOrder = {
    id: orderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    status: status,
  };

  res.json({ data: newOrder });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  const newOrder = {
    id: { nextId },
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({
    data: res.locals.order,
  });
}

function destroy(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  if (order.status !== 'pending') {
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    });
  }

  if (index > -1) {
    notes.splice(index, 1);
  }
  res.sendStatus(204);
}

function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [isValid, create],
  read: [orderExists, read],
  update: [orderExists, isValid, update],
  delete: [orderExists, destroy],
  list,
};
