import './App.css';
import React from 'react';

import Login from "./login.js"
import Admin from "./admin.js"
import Broker from "./broker"
import axios from "axios";


class NotFound extends React.Component{
    render(){
        return (
            <h1>Not Found</h1>
        )
    }
}


export default class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            brokers: new Array(),
            name: null,
            currentBroker: null,
            clickSubmit: false
        }
        this.handleEnter = this.handleEnter.bind(this);
        this.handleName = this.handleName.bind(this);
    }

    componentDidMount() {
        this.fetchQuotes();
    }

    handleName(name){
        this.setState({name: name})
        for(let i = 0; i < this.state.brokers.length; i++) {
            if (this.state.brokers[i].name === this.state.name) {
                this.setState({currentBroker: this.state.brokers[i]})
            }
        }
    }

    handleEnter(){
        if(this.state.name === "admin"){
            this.setState({clickSubmit: true})
            return;
        }
        for(let i = 0; i < this.state.brokers.length; i++){
            if(this.state.brokers[i].name === this.state.name){
                this.setState({currentBroker: this.state.brokers[i] , clickSubmit: true})
                return;
            }
        }
        this.setState({clickSubmit: false})
    }

    fetchQuotes = () =>{
        axios.get("http://localhost:3030/brokers")
            .then(response => this.setState({brokers: response.data}))
            .catch(e => console.log(e));
    }

    render() {
        let main = <Login clickSubmit={this.handleEnter}  onValueChange={this.handleName}/>;
        if(this.state.clickSubmit) {
            if (this.state.name === 'admin') {
                main = <Admin/>
            } else if (this.state.name) {
                main = <Broker data={this.state.currentBroker}/>
            }
        }
        return(
            <React.Fragment>{main}</React.Fragment>
        );
    }
}

