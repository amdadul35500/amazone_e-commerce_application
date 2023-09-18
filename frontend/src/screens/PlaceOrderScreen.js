import React, { useContext, useEffect, useReducer } from "react";
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CheckoutSteps from "../components/CheckoutSteps";
import { Store } from "../Store";
import { base_url, getError } from "../utils";
import { toast } from "react-toastify";
import axios from "axios";
import LoadingBox from "../components/LoadingBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quntity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderhandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        `${base_url}/api/orders`,
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: "CART_CLEAR" });
      dispatch({ type: "CREATE_SUCCESS" });
      localStorage.removeItem("cartItems");
      navigate(`/order/${data.order._id}`);
    } catch (error) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(error));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate("/payment");
    }
  }, [cart, navigate]);

  return (
    <>
      <div>
        <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
        <Helmet>
          <title>Previwe Order</title>
        </Helmet>
        <h1 className="my-3">Previwe Order</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong>
                  {cart.shippingAddress.fullName} <br />
                  <strong>Addrress:</strong>
                  {cart.shippingAddress.address},
                  {cart.shippingAddress.postalCode},
                  {cart.shippingAddress.country}
                </Card.Text>
                <NavLink to="/shipping">Edit</NavLink>
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong>
                  {cart.paymentMethod}
                </Card.Text>
                <NavLink to="/payment">Edit</NavLink>
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
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
                          <span>{item.quantity}</span>
                        </Col>
                        <Col md={3}>${item.price}</Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <NavLink to="/cart">Edit</NavLink>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col> ${cart.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col> ${cart.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tex</Col>
                      <Col> ${cart.taxPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Order Total</Col>
                      <Col>
                        <strong> ${cart.totalPrice.toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                        type="button"
                        onClick={placeOrderhandler}
                        disabled={cart.cartItems.length === 0}
                      >
                        Place Order
                      </Button>
                    </div>
                    {loading && <LoadingBox> </LoadingBox>}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default PlaceOrderScreen;
