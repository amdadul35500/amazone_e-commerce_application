import bcrypt from "bcrypt";

const data = {
  users: [
    {
      name: "Shahin",
      email: "shahin@gmail.com",
      password: bcrypt.hashSync("123456", bcrypt.genSaltSync(10)),
      isAdmin: true,
    },
    {
      name: "Nazmul",
      email: "nazmul@gmail.com",
      password: bcrypt.hashSync("123456", bcrypt.genSaltSync(10)),
      isAdmin: false,
    },
  ],
  products: [
    {
      //_id: "1",
      name: "Nike Slim shirt",
      slug: "nike-slim-shirt",
      category: "Shirts",
      image: "/images/p1.jpg",
      price: 120,
      countInStock: 10,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "high quility shirt",
    },
    {
      //_id: "2",
      name: "Adidas Fit shirt",
      slug: "adidas-fit-shirt",
      category: "Shirts",
      image: "/images/p2.jpg",
      price: 250,
      countInStock: 10,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "high quility shirt",
    },
    {
      //_id: "3",
      name: "Nike Slim Pant",
      slug: "nike-slim-pant",
      category: "pants",
      image: "/images/p3.jpg",
      price: 25,
      countInStock: 10,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "high quility shirt",
    },
    {
      //_id: "4",
      name: "Adidas Fit Pant",
      slug: "adidas-fit-pant",
      category: "pants",
      image: "/images/p4.jpg",
      price: 65,
      countInStock: 10,
      brand: "Nike",
      rating: 4.5,
      numReviews: 10,
      description: "high quility shirt",
    },
  ],
};

export default data;
