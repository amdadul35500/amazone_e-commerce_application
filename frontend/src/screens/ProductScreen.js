import React, { useReducer, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Row, Col, ListGroup, Badge, Card, Button } from "react-bootstrap";
import Rating from "../components/Rating";
import { Helmet } from "react-helmet-async";
import MessageBox from "../components/MessageBox";
import LoadingBox from "../components/LoadingBox";
import { base_url, getError } from "../utils";
import { Store } from "../Store";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, error: action.payload, loading: false };
  }
};

const ProductScreen = () => {
  const navigate = useNavigate();
  const param = useParams();
  const { slug } = param;

  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    dispatch({ type: "FETCH_REQUEST" });
    const fetchData = async () => {
      const result = await axios.get(`${base_url}/api/products/slug/${slug}`);
      dispatch({ type: "FETCH_SUCCESS", payload: result.data });
    };
    fetchData();
    try {
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: getError(error) });
    }
  }, []);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quntity = existItem ? existItem + 1 : 1;
    const { data } = await axios.get(`${base_url}/api/products/${product._id}`);
    if (data.countInStock < quntity) {
      window.alert("Sorry product is out of stock!");
      return;
    }

    ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...product, quntity: 1 } });
    navigate("/cart");
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img className="img-large" src={product.image} alt={product.name} />
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>Price : ${product.price}</ListGroup.Item>
            <ListGroup.Item>
              Description: <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Unavilable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        Add to Cart
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductScreen;
