import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FavorService from './FavorService';
import { favors } from './FavorOptions';
import { Form, Row, Col, Button, Modal } from 'react-bootstrap';

const AddFavor = () => {
  const [newFavor, setNewFavor] = useState({
    description: '',
    owedBy: '',
    owedTo: ''
  });
  const [owedByMe, setOwedByMe] = useState(true);
  const [myFriend, setMyFriend] = useState('');
  const [image, setImage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [err, setErr] = useState('');
  const [successText, setSuccessText] = useState('');
  const [submitValidation, setSubmitValidation] = useState(false);
  const [showMyFavorsLink, setShowMyFavorsLink] = useState(false);

  const authContext = useContext(AuthContext);
  const history = useHistory();

  // resets the create favor form
  const handleReset = () => {
    setNewFavor({
      description: '',
      owedBy: '',
      owedTo: ''
    });

    setMyFriend('');
    setImage('');
    setShowModal(false);
    setErr('');
    setSubmitValidation(false);
  }

  const handleSelectFavor = (e) => {
    setNewFavor({ ...newFavor, [e.target.name]: e.target.value });
  };

  // search for a friend by typing their username
  const handleSearchMyFriend = () => {
    FavorService.findUserByUsername(myFriend).then(res => {
      if (res.username !== authContext.user.username) {
        setErr(null);
        setShowModal(true);

        if (owedByMe) {
          setNewFavor({
            ...newFavor,
            owedBy: authContext.user.username,
            owedTo: myFriend
          });
          setSubmitValidation(true);
        } else {
          setNewFavor({
            ...newFavor,
            owedBy: myFriend,
            owedTo: authContext.user.username
          });
          //condition to enable submit button
          if (image !== '') setSubmitValidation(true);
        }
      } else {
        setErr(`Invalid search. Please enter your friend's username.`);
        setShowModal(true);
      }
    }).catch(err => {
      console.error(err.message);
      setErr('Cannot find this username.');
      setShowModal(true);
    });
  }

  // submit form to create favor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowMyFavorsLink(false);
    const newFavorCreated = await FavorService.addFavor(newFavor, image);
    if (newFavorCreated) {
      setSuccessText(`Success! New favor has been created.`);
      setShowMyFavorsLink(true);
      handleReset();
    } else {
      setSuccessText('Error! Please contact Admin');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3 className="text-center font-weight-bold">Create a new favor</h3>
      <div className="text-center font-weight-lighter ">It's important to keep record of favors, whether from your friend David who ask you to help with his project, or when you owned Betty from Marketing an iced latte.</div>
      <br />
      <Form.Group as={Row}>
        <Form.Label as="legend" column sm="2">The Situation:</Form.Label>
        <Col>
          <Form.Check
            type="checkbox"
            inline
            label="I owed You one"
            checked={owedByMe === true}
            //selecting different situation will clear other values
            onChange={() => {
              setOwedByMe(true);
              handleReset();
            }}
          />
          <Form.Check
            type="checkbox"
            inline
            label="You owed Me one"
            checked={owedByMe === false}
            //selecting different situation will clear other values
            onChange={() => {
              setOwedByMe(false);
              handleReset();
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm={2}>The Favor:</Form.Label>
        <Col sm={8}>
          <Form.Control
            required
            as="select"
            name="description"
            value={newFavor.description}
            onChange={handleSelectFavor}
          >
            <option value="">Select a favor</option>
            {/* set the below option to use key=id instead of value to prevent error when map */}
            {favors.map((favor,id) =>
              <option key={id}>{favor.item}</option>
            )}
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm="2">The Friend:</Form.Label>
        <Col sm={8}>


          <div className="input-group mb-3">
            <input type="text"
              className="form-control"
              placeholder="Search your friend's username"
              value={myFriend}
              onChange={e => setMyFriend(e.target.value)}
            />
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleSearchMyFriend}
              >
                Find Friend
            </button>
            </div>
          </div>
        </Col>
      </Form.Group>
      <Modal
        centered
        backdrop="static"
        dialogClassName="modal-60w"
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Body>
          {!err ? <h4>Found your friend <strong>{myFriend}</strong>!</h4> : <h4>{err}</h4>}

        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setShowModal(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Form.Group as={Row}>
        <Form.Label column sm={2}>Upload Photo Proof:</Form.Label>
        <Col>
          <input
            disabled={owedByMe}
            type="file"
            id="image"
            accept=".jpg,.png"
            onChange={e => {
              setImage(e.target.files[0]);
              //condition to enable submit button
              if (newFavor.owedTo !== '') setSubmitValidation(true);
            }}
          />
        </Col>
      </Form.Group>

      <Button type="submit"
        variant="primary"
        disabled={!submitValidation}>
        Submit
      </Button>
      {' '}
      <span className="align-middle">{successText}</span>
      {showMyFavorsLink ? (
        <Button
          variant="link"
          onClick={() => history.push(`/myFavors`)}
        >
          View updated favors list
        </Button>
      ) : null}
    </Form>
  );
};

export default AddFavor;
