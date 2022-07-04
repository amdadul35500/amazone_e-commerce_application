import React, { useReducer, useEffect, useContext, useState } from "react";
import LoadingBox from "../components/LoadingBox.js";
import MessageBox from "../components/MessageBox.js";
import { useNavigate, useParams } from "react-router-dom";
import { Store } from "../Store.js";
import { getError } from "../utils.js";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import StripeCheckout from "react-stripe-checkout";
import { toast } from "react-toastify";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      console.log("payload");
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      console.log("Fail");
      return { ...state, loading: false, error: action.payload };
    case "PAY_SUCCESS":
      return { ...state, successPay: true };
    case "PAY_FAIL":
      return { ...state, successPay: false };
    default:
      return state;
  }
};

const puslishableKey =
  "pk_test_51Kmvp4KeBBB2MTqlcravPi0cvZQZXj3vHTKIraZM3KAfWNffsC6SrX59GdBSSId8h1cs2SDoVb9ZR8E21PpIb9Rw00j0gOO1Gg";

const OrderScreen = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [updatedOrder, setUpdatedOrder] = useState(false);

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [{ loading, error, order, successPay }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      order: {},
      error: "",
      successPay: false,
    }
  );

  useEffect(() => {
    console.log("1");
    const fetchOrder = async () => {
      console.log("2");
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        console.log("Success");
        console.log(data);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
        console.log("Success2");
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
        console.log(error);
      }
    };

    if (!userInfo) {
      return navigate("/login");
    }

    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [userInfo, order, orderId, navigate, successPay]);

  useEffect(() => {
    console.log("3");
    const fetch = async () => {
      console.log("4");
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        toast.error(getError(error));
      }
    };
    fetch();
  }, [updatedOrder]);

  const payNow = async (token) => {
    try {
      const { data } = await axios.put(
        `/api/orders/${order._id}/pay`,
        { totalAmount: order.totalPrice.toFixed(2), token },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setUpdatedOrder(!updatedOrder);
      //dispatch({ type: "PAY_SUCCESS" });
      toast.success("Order is paid!");
    } catch (error) {
      dispatch({ type: "PAY_FAIL" });
      toast.error(getError(error));
    }
  };

  console.log(order);

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox></MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong>
                {order.shippingAddress?.fullName} <br />
                <strong>Address:</strong>
                {order.shippingAddress.address},{order.shippingAddress.city},
                {order.shippingAddress.postalCode},
                {order.shippingAddress.country}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success"></MessageBox>
              ) : (
                <MessageBox variant="danger">Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>payment</Card.Title>
              <Card.Text>
                <strong>Methos:</strong>
                {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        />
                        <NavLink to={`/product/${item.slug}`}>
                          {item.name}
                        </NavLink>
                      </Col>
                      <Col md={3}>
                        <span>{item.quntity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>${order.totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <StripeCheckout
                      stripeKey={puslishableKey}
                      label="Pay Now"
                      name="Pay With Cridit Card"
                      billingAddress
                      shippingAddress
                      amount={order.totalPrice.toFixed(2) * 100}
                      description={`Your total is $${order.totalPrice.toFixed(
                        2
                      )}`}
                      token={payNow}
                    />
                  </div>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderScreen;
