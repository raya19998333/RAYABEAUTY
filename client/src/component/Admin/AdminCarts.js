import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCarts } from "../../Features/CartSlice";
import axios from "axios";
import "./AdminCartDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faTag,
  faBox,
  faCalendarAlt,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";

Modal.setAppElement("#root"); // لضمان عمل المودال بشكل صحيح

const AdminCartDashboard = () => {
  const dispatch = useDispatch();
  const [userEmails, setUserEmails] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [cartIdToDelete, setCartIdToDelete] = useState(null); // لحفظ السلة التي سيتم حذفها

  const { carts, status, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getAllCarts());
  }, [dispatch]);

  useEffect(() => {
    if (carts.length > 0) {
      fetchUserEmails();
    }
  }, [carts]);

  const fetchUserEmails = async () => {
    try {
      const userEmailsMap = {};
      for (let cart of carts) {
        const response = await axios.get(
          `http://localhost:3001/getUserEmail/${cart.userId}`
        );
        userEmailsMap[cart.userId] = response.data.email;
      }
      setUserEmails(userEmailsMap);
    } catch (error) {
      console.error("Error fetching user emails:", error);
    }
  };

  if (status === "loading") {
    return <div className="loading">Loading...</div>;
  }

  if (status === "failed") {
    return <div className="error">Error: {error}</div>;
  }

  const handleDeleteClick = (cartId) => {
    // عندما يتم النقر على زر الحذف، نعرض المودال ونسجل الـ cartId
    setCartIdToDelete(cartId);
    setModalMessage("Are you sure you want to delete this cart?");
    setModalIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/deleteCart/${cartIdToDelete}`
      );

      if (response.status === 200) {
        dispatch(getAllCarts());
        setModalMessage("Cart deleted successfully");
      } else {
        setModalMessage("Failed to delete cart");
      }
    } catch (error) {
      console.error("Error deleting cart:", error);
      setModalMessage("Error deleting cart");
    }
  };

  const handleCancelDelete = () => {
    setModalIsOpen(false); // إغلاق المودال إذا تم إلغاء الحذف
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Dashboard - All Customer Carts</h2>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>{modalMessage}</h3>
        <div className="modal-actions">
          <button onClick={handleConfirmDelete} className="modal-btn">
            Confirm
          </button>
          <button onClick={handleCancelDelete} className="cancel-btn">
            Cancel
          </button>
        </div>
      </Modal>

      {carts.length === 0 ? (
        <p className="no-carts">No carts available.</p>
      ) : (
        <div className="card-container">
          {carts.map((cart, index) => (
            <div className="card" key={cart._id}>
              <h3>
                <FontAwesomeIcon icon={faShoppingCart} /> Cart {index + 1}{" "}
                {/* إضافة أيقونة السلة */}
              </h3>
              <div className="card-details">
                <p>
                  <FontAwesomeIcon icon={faBox} /> <strong>Items:</strong>{" "}
                  {cart.items.length}
                </p>
                <p>
                  <FontAwesomeIcon icon={faTag} /> <strong>Total Price:</strong>{" "}
                  {cart.totalPrice} USD
                </p>
                <p>
                  <FontAwesomeIcon icon={faCalendarAlt} />{" "}
                  <strong>Created At:</strong>{" "}
                  {new Date(cart.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>User ID:</strong> {cart.userId}{" "}
                  {/* عرض ID المستخدم */}
                </p>
                <ul>
                  <p>
                    <strong>Products</strong> {/* عرض ID المستخدم */}
                  </p>
                  {cart.items.map((item) => (
                    <li key={item._id}>
                      {item.pcode} - {item.desc} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => handleDeleteClick(cart._id)}
                  className="delete-btn"
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCartDashboard;
