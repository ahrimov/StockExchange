import React from 'react';
import axios from "axios";
import io from "socket.io-client";

import "./style/mytable.css"

export default class ListShares extends React.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3040', { transports : ['websocket'] })
        this.state = {
            shares: new Array()
        }
    }
    fetchQuotes = () =>{
        axios.get("http://localhost:3030/shares")
            .then(response => this.setState({shares: response.data}))
            .catch(e => console.log(e));
    }

    componentDidMount() {
        this.fetchQuotes();
        let it = this;
        this.socket.on('updateShares', function(data){
            it.setState({shares: data.shares})
        })
    }



    componentWillUnmount() {
        this.timer = null;
    }

    render(){
        let tabledata = this.state.shares.map((data) =>(
            <tr key={data.id}>
                <td>{data.data.name}</td>
                <td>{data.data.probability_distrib}</td>
                <td>{data.data.max_number}</td>
                <td>{data.data.amount}</td>
                <td>{data.data.start_price}</td>
                <td>{data.price}</td>
                <td>{data.auction_amount}</td>
            </tr>
        ))
        return (<table className="table">
            <thead>
            <tr>
                <th>Название акции</th>
                <th>Закон распределения</th>
                <th>Максимальное значение для изменения</th>
                <th>Общее количество акций</th>
                <th>Начальная стоимость акции</th>
                <th>Текущая цена</th>
                <th>Количество, выставленное на продажу</th>
            </tr>
            </thead>
            <tbody>
                {tabledata}
            </tbody>
        </table>);
    }
}