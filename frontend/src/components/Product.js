import React, { useContext } from "react";
import { Button, Card } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { Store } from "../Store";

const Product = ({ product }) => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quntity = existItem ? existItem + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quntity) {
      window.alert("Sorry product is out of stock!");
      return;
    }
    ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...item, quntity: 1 } });
  };

  return (
    <Card>
      <NavLink to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt="product-img" />
      </NavLink>
      <Card.Body>
        <NavLink to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </NavLink>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>${product.price}</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="lighr" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default Product;
