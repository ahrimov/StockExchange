import React from 'react';
import axios from "axios";

import "./style/mytable.css"
import Popup from "./Popup";

export default class ListBrokers extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: new Array()
        }
    }
    fetchQuotes = () =>{
        axios.get("http://localhost:3030/brokers")
            .then(response => this.setState({data: response.data}))
    .catch(e => console.log(e));
    }

    componentDidMount() {
        this.fetchQuotes();
        this.timer = setInterval(() => this.fetchQuotes(), 5000);
    }

    componentWillUnmount() {
        this.timer = null;
    }

    render(){
        let tabledata = this.state.data.map((data) =>(
            <tr key={data.id}>
                <td>{data.name}</td>
                <td>{data.cash}</td>
                <Popup
                button='Посмотреть акции'
                header={'Акции брокера ' + data.name}
                content={data.shares}/>
            </tr>
        ))
        return (<table className="table">
            <thead>
                <tr>
                    <th>Имя брокера</th>
                    <th>Баланс брокера</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {tabledata}
            </tbody>
        </table>);
    }
}