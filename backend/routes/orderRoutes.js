import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAuth } from "../utilis.js";
import Order from "../models/orderModal.js";
import Stripe from "stripe";

const stripe = Stripe(
  "sk_test_51Kmvp4KeBBB2MTqlFEXDhBQz9gsdKfhyzqPVNLUQhGOKsQTMMgvSc0mNsf0OkTSBPaSJt7K7cwoMYlqZiBbFwDLV00b1WdWVZ1"
);
const orderRouter = express.Router();

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const newOrder = new Order({
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      });
      const order = await newOrder.save();
      res.status(201).send({ message: "New order created", order });
    } catch (error) {
      console.log(error);
    }
  })
);

orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

orderRouter.put(
  `/:id/pay`,
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { totalAmount, token } = req.body;
    const order = await Order.findById(req.params.id);
    let status, error;

    try {
      await stripe.charges.create({
        source: token.id,
        amount: totalAmount * 100,
        currency: "usd",
      });
      status = "success";

      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: token.id,
          status: token.type,
          update_time: Date.now(),
          email_address: token.email,
        };
        const updatedOrder = await order.save();
        res.send({ message: "Order paid", order: updatedOrder });
      } else {
        res.status(404).send({ message: "Order not found" });
      }
    } catch (error) {
      status = "Failure";
      res.status(500).send(error);
    }
  })
);

export default orderRouter;
