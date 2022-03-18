import React from "react";
import io from "socket.io-client";
import axios from "axios";
import ListBrokers from "./listBrokers";
import ListShares from "./listShares";

import "./style/admin.css"

export default class Admin extends React.Component{
    constructor(props) {
        super(props);
        this.socket = null;
        this.state = {
            itStart: false
        }

        this.startTrading = this.startTrading.bind(this);
    }
    componentDidMount() {
        this.socket = io('http://localhost:3040', { transports : ['websocket'] })
    }

    startTrading(){
        let it = this
        if(this.state.itStart){
            axios.post('http://localhost:3030/close')
                .then((response) =>{
                    this.setState({itStart: false})
                    document.getElementById("startButton").innerHTML = "Начать торги"
                })
                .catch(e => console.log(e));
        }
        else {
            let it = this
            axios.post('http://localhost:3030/start')
                .then((response) => {
                    this.setState({itStart: true})
                    document.getElementById("startButton").innerHTML = "Закрыть торги"
                })
                .catch(e => console.log(e));
        }
    }

    render(){
        return (
            <div className="App">
                <div className="header">
                    Администраторская
                </div>
                <div className="adminContent">
                    <div id="startButton" onClick={this.startTrading}>Начать торги</div>
                    <div className="listBroker"><ListBrokers /></div>
                    <div className="listShares"><ListShares /></div>
                </div>
            </div>
        )
    }
}