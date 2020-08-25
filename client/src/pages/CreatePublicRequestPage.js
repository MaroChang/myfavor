import React, { Component } from 'react';
import axios from 'axios';

export default class CreatePublicRequestPage extends Component {
    
    constructor() {
        super();

        this.user = "123Alex"
        this.state = {
            task: "",
            reward: "",
            taker: ""
        };
    }

    onSubmit = (event) => {
        event.preventDefault();

        axios.post("http://localhost:8081/publicRequest/create-publicRequest", {
            creator: this.user,
            taker: this.state.taker,
            requestDetail: this.state.task,
            reward: {
                name: this.user,
                item: this.state.reward,
            }
        }).then(res => {
            console.log(res);
            console.log(res.data);
        })

        this.setState({task: ""});
        this.setState({reward: ""});
    }

    render() {
        return (
            <div>
                <h3>Create a Public Request</h3>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label>
                            Task
                            <input type="text" 
                                value={this.state.task} 
                                onChange={event => {this.setState({ task: event.target.value})}}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            Reward
                            <input type="text" 
                                value={this.state.reward} 
                                onChange={event => this.setState({ reward: event.target.value})}/>
                        </label>
                    </div>
                    <div>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        )
    }
}