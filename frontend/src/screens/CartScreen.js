import React, { useContext } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import { Row, Col, ListGroup, Button, Card } from "react-bootstrap";
import MessageBox from "../components/MessageBox";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const CartScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quntity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quntity) {
      window.alert("Sorry product is out of stock!");
      return;
    }
    ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...item, quntity } });
  };

  const removeItemHandler = (item) => {
    ctxDispatch({ type: "CART_REMOVE_ITEM", payload: item });
  };

  const checkOutHandler = () => {
    navigate(`/signin?redirect=/shipping`);
  };

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1>Shopping Cart</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Cart is empty. <NavLink to="/">Go Shopping</NavLink>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        className="img-fluid rounded img-thumbnail"
                        alt="img"
                      />{" "}
                      <NavLink to={`/product/${item.slug}`}>
                        {item.name}
                      </NavLink>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={() =>
                          updateCartHandler(item, item.quntity - 1)
                        }
                        variant="light"
                        disabled={item.quntity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{" "}
                      <span>{item.quntity}</span>{" "}
                      <Button
                        onClick={() =>
                          updateCartHandler(item, item.quntity + 1)
                        }
                        variant="light"
                        disabled={item.quntity === item.countInStock}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>${item.price}</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quntity, 0)}{" "}
                    items ) : $
                    {cartItems.reduce((a, c) => a + c.price * c.quntity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={checkOutHandler}
                      variant="primary"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;
