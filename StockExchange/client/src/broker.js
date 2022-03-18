import React from 'react';
import axios from "axios";

import "./style/mytable.css"
import "./style/broker.css"
import ListShares from "./listShares";
import io from "socket.io-client";

export default class Broker extends React.Component{
    constructor(props) {
        super(props);
        this.socket = io('http://localhost:3040', { transports : ['websocket'] })
        this.state = {
            id: "",
            name: "",
            cash: 0,
            brokerShares: null,
            idSellShares: 1,
            sellAmount: 0,
            shares: null,
            idBuyShares: 1,
            buyAmount: 0,
            startCash: 0,
            itStart: false
        }


        this.handleChange = this.handleChange.bind(this);
        this.handleSell = this.handleSell.bind(this);
        this.handleBuy = this.handleBuy.bind(this);
    }

    fetchShares = () =>{
        axios.get("http://localhost:3030/shares")
            .then(response => this.setState({shares: response.data}))
            .catch(e => console.log(e));
    }

    fetchBroker = () =>{
        axios.get("http://localhost:3030/broker/" + this.state.id)
            .then(response => this.setState({cash: response.data.cash, brokerShares: response.data.shares}))
            .catch(e => console.log(e));
    }

    postSellShares = (name, amount) =>{
        axios.post("http://localhost:3030/sellShares", {
            name: name,
            amount: amount,
            owner: this.props.data.name
        })
        .then((response) =>{
            this.setState({shares: response.data.shares, brokerShares: response.data.brokerShares})
        })
    }

    postBuyShares = (name, amount) =>{
        axios.post("http://localhost:3030/buyShares", {
            name: name,
            amount: amount,
            customer: this.props.data.name
        })
            .then((response) =>{
                this.setState({
                    shares: response.data.shares,
                    brokerShares: response.data.brokerShares,
                    cash: response.data.cash
                })
            })
    }

    componentDidMount() {
        this.setState({
            id: this.props.data.id,
            name: this.props.data.name,
            cash: this.props.data.cash,
            startCash: this.props.data.cash,
            brokerShares: this.props.data.shares
        })
        this.fetchShares()
        let it = this;
        this.socket.on('updateBroker', function(data){
            if(data.name === it.state.name) {
                it.setState({cash: data.broker.cash, brokerShares: data.broker.shares})
            }
        })
        this.socket.on('startTrading', function(){
            it.setState({itStart: true})
        })
        this.socket.on('closeTrading', function(){
            it.setState({itStart: false})
        })
        this.socket.on('updateShares', function(data){
            it.setState({shares: data.shares})
        })
    }

    handleChange(e){
        if(e.target.type === 'number'){
            if(e.target.value <= 0) e.target.value = 1;
            if(e.target.name === 'sellAmount'){
                let share = this.findShareById(this.state.idSellShares, this.state.brokerShares)
                if(parseInt(e.target.value) > share.amount)
                    e.target.value = share.amount;
            }
            if(e.target.name === 'buyAmount'){
                let share = this.findShareById(this.state.idBuyShares, this.state.shares)
                let correctValue = share.auction_amount;
                let brokerShare = this.findByName(share.data.name, this.state.brokerShares)
                if(brokerShare)
                    correctValue = share.auction_amount - brokerShare.auction_amount
                if(correctValue < 0) correctValue = 0;
                if(parseInt(e.target.value) > correctValue)
                    e.target.value = correctValue;
            }
        }
        this.setState({[e.target.name]: e.target.value})
    }

    findShareById(id, shares){
        for (let i = 0; i < shares.length; i++) {
            if (id == shares[i].id) {
                return shares[i];
            }
        }
        return null;
    }

    findByName(name, array){
        for (let i = 0; i < array.length; i++) {
            if (name === array[i].name) {
                return array[i];
            }
        }
        return null;
    }

    handleSell(e){
        e.preventDefault();
        if(!this.state.itStart){
            alert('Пожалуста, дождитесь начала аукциона');
            return;
        }
        let sellShares;
        if(!this.state.idSellShares)
            sellShares = this.state.brokerShares[0];
        else {
            for (let i = 0; i < this.state.brokerShares.length; i++) {
                if (this.state.idSellShares == this.state.brokerShares[i].id) {
                    sellShares = this.state.brokerShares[i];
                }
            }
        }
        let share = this.findShareById(this.state.idSellShares, this.state.brokerShares)
        if(parseInt(this.state.sellAmount) > share.amount)
            alert('Пожалуста, введите корректное значение')
        else
            this.postSellShares(sellShares.name, this.state.sellAmount);
    }

    handleBuy(e){
        e.preventDefault();
        if(!this.state.itStart){
            alert('Пожалуста, дождитесь начала аукциона');
            return;
        }
        let buyShares;
        if(!this.state.idBuyShares)
            buyShares = this.state.shares[0];
        else {
            for (let i = 0; i < this.state.shares.length; i++) {
                if (this.state.idBuyShares == this.state.shares[i].id) {
                    buyShares = this.state.shares[i];
                }
            }
        }
        let share = this.findShareById(this.state.idBuyShares, this.state.shares)
        if(parseInt(this.state.buyAmount) > share.auction_amount || this.state.cash < share.price * this.state.buyAmount)
            alert('Пожалуста, введите корректное значение')
        else
            this.postBuyShares(buyShares.data.name, this.state.buyAmount)
    }

    render(){
        let tabledata = null;
        if(!this.props.data || !this.state.shares) return null;
        tabledata = this.state.brokerShares.map((data) => (
            <tr key={data.id}>
                <td>{data.name}</td>
                <td>{data.amount}</td>
                <td>{data.auction_amount}</td>
            </tr>
            ))
        let selectDataSell = this.state.brokerShares.map((data) => (
            <option value={data.id}>{data.name}</option>
        ))
        let selectDataBuy = this.state.shares.map((data) => (
            <option value={data.id}>{data.data.name}</option>
        ))
        let notify = <p style={{color: 'red'}}>Торги закрыты</p>;
        if(this.state.itStart){
            notify = <p style={{color:'green'}}>Торги открыты</p>;
        }
        return(
            <div className="broker">
                <div className="header">
                    <h2>{"Брокер " + this.state.name}</h2>
                    <span>{"Баланс: " + this.state.cash}</span>
                    <br />
                    <span>{"Стартовая сумма: " + this.state.startCash + "  "}</span>
                    <span>{"Прибыль: " + (this.state.cash - this.state.startCash)}</span>
                    <div className="notify">{notify}</div>
                </div>
                <div className="content">
                    <table className="brokerShares">
                        <thead>
                            <th>Название акции</th>
                            <th>Количество</th>
                            <th>Выставленное на аукцион</th>
                        </thead>
                        <tbody>
                            {tabledata}
                        </tbody>
                    </table>
                    <div className="listShares"><ListShares /></div>
                    <form onSubmit={this.handleSell} className="sell">
                        <label>Продать акции
                        <br />
                        <select value={this.state.idSellShares} onChange={this.handleChange} name="idSellShares">
                            {selectDataSell}
                        </select>
                        </label>
                        <input type="number" value={this.state.sellAmount} onChange={this.handleChange} name="sellAmount" />
                        <input type="submit" value="Продать" />
                    </form>
                    <form onSubmit={this.handleBuy} className="buy">
                        <label>Купить акции
                            <br />
                            <select value={this.state.idBuyShares} onChange={this.handleChange} name="idBuyShares">
                                {selectDataBuy}
                            </select>
                        </label>
                        <input type="number" value={this.state.buyAmount} onChange={this.handleChange} name="buyAmount" />
                        <input type="submit" value="Купить" />
                    </form>
                </div>
            </div>
        )
    }
}