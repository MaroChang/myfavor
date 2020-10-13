import React from 'react';
import Button from 'react-bootstrap/Button';
import { favors } from '../Favor/FavorOptions';

const AddReward = (props) => {
    return (
      <div className="input-group">
        <select
          className="custom-select"
          id="inputGroupSelectRewardToAdd"
          name="newReward"
          value={props.newReward}
          onChange={props.onChange}
        >
          <option value="">Add a reward</option>
          {favors.map(favor => 
            <option value={favor.item}>{favor.item}</option>
          )}
        </select>
        <div className="input-group-append">
          <Button
            variant="outline-primary"
            onClick={props.addReward}
            disabled={!props.newReward}
          >
            Add
          </Button>
        </div>
      </div>
    );
}

export default AddReward;
