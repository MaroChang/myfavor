import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { withRouter } from 'react-router-dom';

import { Container, Row, Col, Button, Modal } from 'react-bootstrap';

import AuthService from '../../context/AuthService';

const Login = (props) => {
  const [user, setUser] = useState({ username: '', password: '' });
  const authContext = useContext(AuthContext);
  const [message, setMessage] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AuthService.login(user).then((data) => {
        const { isAuthenticated, user } = data;
        if (isAuthenticated) {
          authContext.setUser(user);
          authContext.setIsAuthenticated(isAuthenticated);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem(
            'isAuthenticated',
            JSON.stringify(isAuthenticated)
          );

          //Show Login successfully message
          setMessage();
          setShowModal(true);
        } else {
          setMessage(
            <div className="text-danger text-center">
              Invalid username or password
            </div>
          );
        }
      });
    } catch (err) {
      setMessage(
        <div className="text-danger text-center">
          Unable to log in. Please try again later.
        </div>
      );
    }
  };

  // hide modal and redirect to home page
  const redirect = () => {
    setShowModal(false);

    // Redirect back to Homepage
    history.push('/');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col lg="6" md="6" sm="8">
          <form onSubmit={handleSubmit}>
            <p className="h4 text-center mb-4">Log In</p>

            <div className="form-group">
              <label htmlFor="email" className="grey-text">
                Your username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="grey-text">
                Your password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="text-center mt-4">
              <Button
                color="indigo"
                type="submit"
                className="white-text pl-3 pr-3"
              >
                Log In
              </Button>
            </div>
            {message}
          </form>

          <div className="font-small grey-text d-flex justify-content-end">
            <span className="align-bottom">
              <span className="align-middle">Not a member?</span>
              <Button
                variant="link"
                onClick={() => history.push(`/register`)}
              >
                Register
              </Button>
            </span>
          </div>
        </Col>
      </Row>
      <Modal size="sm" show={showModal} id="myModal" backdrop="static">
        <Modal.Body>
          <p>Login Sucessfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={redirect}>
            Go to Homepage
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default withRouter(Login);
